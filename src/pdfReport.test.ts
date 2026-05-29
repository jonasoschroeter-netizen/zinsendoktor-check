import { describe, expect, it } from "vitest";
import { calculateCheck } from "./calculations";
import { buildCustomerReportPayload, generateCustomerReportHtml } from "./pdfReport";
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

    expect(html).toContain("Finanz-Diagnose");
    expect(html).not.toContain("Financial Care Preview");
    expect(html).not.toContain("<h1 class=\"report-title\">Financial Care Preview</h1>");
    expect(html).not.toContain("Schritt 5 von 5");
    expect(html).not.toContain("progress-tabs");
    expect(html).not.toContain("PDF für den Kunden sichern");
    expect(html).not.toContain("Erstellt eine übersichtliche PDF-/Druckansicht");
    expect(html).toContain("PDF herunterladen / speichern");
    expect(html).toContain("Steuerliche Situation");
    expect(html).toContain("Angenommenes zu versteuerndes Einkommen");
    expect(html).toContain("50.000,00");
    expect(html).toContain("Versorgungs- Bedarfssituation");
    expect(html).toContain("Person 1");
    expect(html).toContain("Bedarf vs. Versorgung");
    expect(html).toContain("Private Vorsorge");
    expect(html).toContain("Mögliches Gesamtergebnis");
    expect(html).toContain("monatliche Versorgungslücke");
    expect(html).toContain("Voraussichtliche Bezüge");
    expect(html).not.toContain("Ã");
    expect(html).toContain("Prüfbedarf-Ampel");
    expect(html).toContain("PDF-Kundenbericht");
    expect(html).toContain("Kopierbarer Ergebnistext");
    expect(html).not.toContain("<h2>1. Steuerdiagnose</h2>");
    expect(html).not.toContain("<h2>2. Rente und Versorgung</h2>");
    expect(html).not.toContain("<h2>3. Inflation und Bedarf</h2>");
    expect(html).not.toContain("<h2>4. Gesamtbedarf vs. Gesamtversorgung</h2>");
    expect(html).not.toContain("<h2>5. Private Vorsorge</h2>");
    expect(html).not.toContain("<h2>Hinweis zur Einordnung</h2>");
    expect(html).toContain("Max &lt;Kunde&gt;");
    expect(html).toContain("Berater &amp; Partner");
    expect(html).toContain("§ 32a EStG");
    expect(html).toContain("10.548,00");
  });

  it("builds a hidden integration payload for future Odoo persistence", () => {
    const input: CheckInput = {
      tax: {
        incomeTypes: ["nichtselbststaendig"],
        maritalStatus: "ledig",
        taxableIncome: 50000
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
    const payload = buildCustomerReportPayload(
      input,
      result,
      {
        customerName: "Kunde",
        advisorName: "Vertrieb"
      },
      {
        id: "odoo-user-1",
        email: "vertrieb@example.test"
      }
    );

    expect(payload.source).toBe("zinsendoktor-check");
    expect(payload.customer?.name).toBe("Kunde");
    expect(payload.advisor?.userId).toBe("odoo-user-1");
    expect(payload.reportHtml).toContain("Steuerliche Situation");
    expect(payload.reportText).toContain("Rechnerische Einkommensteuer 2026");
  });
});
