import { describe, expect, it } from "vitest";
import {
  buildVmsPdfFileName,
  buildVmsResultPayload,
  buildVmsResultRequestUrl,
  buildVmsResultUrl,
  buildVmsSessionRequestUrl,
  buildVmsSessionUrl,
  getVmsLaunchContext
} from "./vmsIntegration";
import type { CheckInput, CheckResult, VmsProductSession } from "./types";

describe("VMS integration", () => {
  it("detects VMS launches only from source flags and keeps customer data out of the URL context", () => {
    const launch = getVmsLaunchContext(
      "?source=vms&utm_source=VMS&session=session-123&customerName=NichtAusUrlLesen"
    );

    expect(launch).toEqual({
      isVms: true,
      resultApiUrl: "",
      sessionApiUrl: "",
      sessionId: "session-123"
    });
    expect(launch).not.toHaveProperty("customerName");
  });

  it("reads direct Supabase session and result endpoints from the VMS launch URL", () => {
    const launch = getVmsLaunchContext(
      "?source=vms&session=session-123&session_api=https%3A%2F%2Fexample.functions.supabase.co%2Fvms-product-session&result_api=https%3A%2F%2Fexample.functions.supabase.co%2Fvms-product-session"
    );

    expect(launch.sessionApiUrl).toBe("https://example.functions.supabase.co/vms-product-session");
    expect(launch.resultApiUrl).toBe("https://example.functions.supabase.co/vms-product-session");
    expect(buildVmsSessionRequestUrl({ baseUrl: "", sessionApiUrl: launch.sessionApiUrl, sessionId: "abc 123" })).toBe(
      "https://example.functions.supabase.co/vms-product-session?session=abc+123"
    );
    expect(buildVmsResultRequestUrl({ baseUrl: "", resultApiUrl: launch.resultApiUrl })).toBe(
      "https://example.functions.supabase.co/vms-product-session"
    );
  });

  it("builds the expected local partnerportal endpoints", () => {
    expect(buildVmsSessionUrl("http://127.0.0.1:8787", "abc 123")).toBe(
      "http://127.0.0.1:8787/api/product-sessions/finanzdoktor/abc%20123"
    );
    expect(buildVmsResultUrl("http://127.0.0.1:8787")).toBe(
      "http://127.0.0.1:8787/api/product-results/finanzdoktor"
    );
  });

  it("builds the save payload from API session data and finance results", () => {
    const session: VmsProductSession = {
      id: "session-1",
      partnerNumber: "P-100",
      partnerCompany: "Partner GmbH",
      advisorName: "Berater Test",
      advisorEmail: "berater@example.test",
      customerName: "Max Kunde",
      customerEmail: "max@example.test",
      customerPhone: "01234",
      customerAddress: "Musterstraße 1",
      contractNumber: "VN 42/2026",
      orderId: "ORD-7",
      customerNumber: "K-55"
    };
    const input = {
      contracts: [],
      inflation: {
        currentLivingCosts: 1200,
        currentWarmRent: 800,
        expectedInflationPercent: 2.5
      },
      pension: {
        monthlyNetIncomePerson1: 2500,
        yearsToRetirementPerson1: 20
      },
      tax: {
        incomeTypes: ["nichtselbststaendig"],
        maritalStatus: "ledig",
        taxableIncome: 50000
      }
    } satisfies CheckInput;
    const result = {
      analysisYears: 20,
      calculatedIncomeTax: 10000,
      contractResults: [],
      estimatedPensionPerson1: 1200,
      estimatedPensionPerson2: 0,
      estimatedTaxUntilRetirement: 220000,
      futureLivingCosts: 1700,
      futureRent: 1100,
      futureTotalNeed: 2800,
      generatedText: "Ergebnistext",
      globalScore: 55,
      globalTrafficLight: "yellow",
      incomeTypeCount: 1,
      inflationFactor: 1.6,
      monthlyGap: 400,
      totalEstimatedPension: 1200
    } satisfies CheckResult;

    const payload = buildVmsResultPayload({
      input,
      pdfBase64: "JVBERi0x",
      result,
      session
    });

    expect(payload.productId).toBe("finanzdoktor");
    expect(payload.productName).toBe("Finanzdoktor");
    expect(payload.customer.name).toBe("Max Kunde");
    expect(payload.advisor.name).toBe("Berater Test");
    expect(payload.offer.contractNumber).toBe("VN 42/2026");
    expect(payload.finance.input).toBe(input);
    expect(payload.finance.result).toBe(result);
    expect(payload.pdf.mimeType).toBe("application/pdf");
    expect(payload.pdf.fileName).toBe(buildVmsPdfFileName(session));
  });
});
