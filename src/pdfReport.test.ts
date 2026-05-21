import { describe, expect, it } from "vitest";
import { calculateCheck } from "./calculations";
import { generateCustomerReportHtml } from "./pdfReport";
import type { CheckInput } from "./types";

describe("customer PDF report", () => {
  it("generates a printable customer report with escaped metadata", () => {
    const input: CheckInput = {
      tax: {
        incomeTypes: ["nichtselbststaendig"],
        maritalStatus: "ledig",
        taxableIncome: 50000,
        paidIncomeTax: 10000
      },
      pension: {
        monthlyNetIncomePerson1: 2600,
        yearsToRetirementPerson1: 30
      },
      inflation: {
        expectedInflationPercent: 2.5,
        currentWarmRent: 900,
        currentLivingCosts: 1300
      },
      contracts: []
    };
    const result = calculateCheck(input);
    const html = generateCustomerReportHtml(input, result, {
      customerName: "Max <Kunde>",
      advisorName: "Berater & Partner",
      note: "Termin: Vertragscheck"
    });

    expect(html).toContain("Finanz-Gesundheitscheck");
    expect(html).toContain("Max &lt;Kunde&gt;");
    expect(html).toContain("Berater &amp; Partner");
    expect(html).toContain("§ 32a EStG");
    expect(html).toContain("10.548,00");
    expect(html).toContain("Kundenbericht");
  });
});
