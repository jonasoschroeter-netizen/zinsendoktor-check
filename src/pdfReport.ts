import {
  formatCurrency,
  formatNumber,
  formatPercent,
  getContractTypeLabel,
  getGlobalSummaryText,
  trafficLightLabels
} from "./calculations";
import type { CheckInput, CheckResult, TrafficLight } from "./types";
import type { AuthenticatedUserContext, CustomerReportPayload } from "./types";

export interface CustomerReportMeta {
  customerName?: string;
  advisorName?: string;
  note?: string;
}

export function buildCustomerReportPayload(
  input: CheckInput,
  result: CheckResult,
  meta: CustomerReportMeta = {},
  user?: AuthenticatedUserContext
): CustomerReportPayload {
  return {
    source: "zinsendoktor-check",
    version: "0.1.0",
    generatedAt: new Date().toISOString(),
    input,
    result,
    reportHtml: generateCustomerReportHtml(input, result, meta),
    reportText: result.generatedText,
    customer: {
      name: meta.customerName?.trim() || undefined
    },
    advisor: {
      name: meta.advisorName?.trim() || user?.name || undefined,
      userId: user?.id,
      email: user?.email
    },
    note: meta.note?.trim() || undefined
  };
}

export function openCustomerReportPdf(
  input: CheckInput,
  result: CheckResult,
  meta: CustomerReportMeta
): boolean {
  const reportWindow = window.open("", "_blank", "width=980,height=1200");

  if (!reportWindow) {
    return false;
  }

  reportWindow.document.open();
  reportWindow.document.write(generateCustomerReportHtml(input, result, meta));
  reportWindow.document.close();
  reportWindow.focus();

  window.setTimeout(() => {
    reportWindow.print();
  }, 300);

  return true;
}

export function generateCustomerReportHtml(
  input: CheckInput,
  result: CheckResult,
  meta: CustomerReportMeta = {}
): string {
  const note = meta.note?.trim();
  const privateCare = buildPrivateCarePreview(input, result);

  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Finanz-Diagnose</title>
    <style>
      :root {
        --primary: #0b1f3a;
        --accent: #1fa37a;
        --warning: #f2a51a;
        --danger: #c23b3b;
        --text: #162033;
        --muted: #5d6980;
        --border: #dbe2ec;
        --soft: #f6f8fb;
      }

      * {
        box-sizing: border-box;
      }

      body {
        background: #e8edf4;
        color: var(--text);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.45;
        margin: 0;
        padding: 28px;
      }

      .page {
        background: #ffffff;
        border-radius: 10px;
        margin: 0 auto;
        max-width: 920px;
        overflow: hidden;
        box-shadow: 0 18px 55px rgba(11, 31, 58, 0.14);
      }

      .report-diagnosis-header {
        padding: 28px 38px 0;
      }

      .report-diagnosis-title {
        color: var(--primary);
        font-size: 26px;
        font-weight: 900;
        line-height: 1.15;
        margin: 0;
      }

      .report-diagnosis-copy {
        color: var(--muted);
        font-size: 17px;
        margin: 14px 0 22px;
      }

      .report-diagnosis-alert {
        align-items: center;
        background: ${getReportBackground(result.globalTrafficLight)};
        border: 1px solid ${getReportColor(result.globalTrafficLight)};
        border-radius: 9px;
        color: ${getReportTextColor(result.globalTrafficLight)};
        display: flex;
        font-size: 16px;
        gap: 14px;
        line-height: 1.55;
        margin-bottom: 18px;
        padding: 15px 18px;
      }

      .report-diagnosis-alert .badge {
        flex: 0 0 auto;
      }

      .report-diagnosis-metrics {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .report-diagnosis-metric {
        background: var(--soft);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 16px;
      }

      .report-diagnosis-metric-label {
        color: var(--muted);
        font-size: 14px;
        margin: 0 0 12px;
      }

      .report-diagnosis-metric-value {
        color: var(--primary);
        font-size: 24px;
        font-weight: 900;
        line-height: 1.1;
        margin: 0;
      }

      .tax-situation-panel {
        background: #fbfdff;
        border: 1px solid var(--border);
        border-radius: 10px;
        margin: 18px 38px 0;
        padding: 24px;
      }

      .tax-situation-title {
        color: #000000;
        font-size: 22px;
        font-weight: 500;
        margin: 0 0 18px;
      }

      .tax-situation-row {
        align-items: center;
        background: #ffffff;
        border: 1px solid #edf2f7;
        border-radius: 8px;
        display: grid;
        gap: 24px;
        grid-template-columns: minmax(0, 420px) 210px;
        justify-content: start;
        margin-bottom: 10px;
        padding: 10px 12px;
      }

      .tax-situation-label {
        color: #000000;
        font-size: 13px;
        line-height: 1.25;
        margin: 0;
      }

      .tax-situation-value {
        align-items: center;
        background: #f8fbff;
        border: 1px solid #c6d3e2;
        border-radius: 6px;
        color: var(--primary);
        display: flex;
        font-size: 14px;
        font-weight: 800;
        justify-content: flex-start;
        min-height: 34px;
        overflow-wrap: anywhere;
        padding: 5px 10px;
        text-align: left;
      }

      .care-situation-panel {
        background: #fbfdff;
        border: 1px solid var(--border);
        border-radius: 10px;
        margin: 22px 38px 0;
        padding: 24px;
      }

      .care-situation-title {
        color: #000000;
        font-size: 22px;
        font-weight: 500;
        margin: 0 0 20px;
      }

      .care-situation-subtitle {
        color: #000000;
        font-size: 13px;
        line-height: 1.25;
        margin: 0 0 12px;
        max-width: 360px;
      }

      .care-situation-row {
        align-items: center;
        background: #ffffff;
        border: 1px solid #edf2f7;
        border-radius: 8px;
        display: grid;
        gap: 14px;
        grid-template-columns: minmax(0, 320px) 150px;
        justify-content: start;
        margin-bottom: 8px;
        padding: 8px 10px;
      }

      .care-situation-row-wide {
        grid-template-columns: minmax(0, 320px) 150px;
      }

      .care-situation-label {
        color: #000000;
        font-size: 13px;
        margin: 0;
        text-align: left;
      }

      .care-situation-label-strong {
        font-weight: 800;
      }

      .care-situation-value {
        align-items: center;
        background: #f8fbff;
        border: 1px solid #c6d3e2;
        border-radius: 6px;
        color: var(--primary);
        display: flex;
        font-size: 13px;
        font-weight: 800;
        justify-content: flex-start;
        min-height: 30px;
        overflow-wrap: anywhere;
        padding: 4px 8px;
        text-align: left;
      }

      .care-situation-value-green {
        background: #eef8f4;
        border-color: #80d0b4;
        color: #0b5f49;
      }

      .care-spacer {
        height: 14px;
      }

      .private-care-panel {
        background: #fbfdff;
        border: 1px solid var(--border);
        border-radius: 10px;
        margin: 22px 38px 0;
        padding: 24px;
      }

      .private-care-title {
        color: #000000;
        font-size: 22px;
        font-weight: 500;
        margin: 0 0 18px;
      }

      .private-care-intro {
        color: #000000;
        font-size: 13px;
        line-height: 1.25;
        margin: 0 0 18px;
        max-width: 520px;
      }

      .private-contract-row,
      .private-care-summary-row,
      .private-care-effect-row {
        align-items: center;
        background: #ffffff;
        border: 1px solid #edf2f7;
        border-radius: 8px;
        display: grid;
        gap: 12px;
        grid-template-columns: minmax(145px, 1.25fr) minmax(0, 0.9fr) minmax(0, 0.9fr);
        margin-bottom: 10px;
        padding: 10px 12px;
      }

      .private-contract-row > *,
      .private-care-summary-row > *,
      .private-care-effect-row > * {
        min-width: 0;
      }

      .private-contract-name {
        color: #000000;
        font-size: 13px;
        font-weight: 800;
        margin: 0;
        overflow-wrap: anywhere;
      }

      .private-contract-type {
        font-weight: 800;
        margin-left: 7px;
      }

      .private-care-field-label {
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
        margin: 0 0 7px;
        text-align: left;
      }

      .private-care-value {
        align-items: center;
        background: #f8fbff;
        border: 1px solid #c6d3e2;
        border-radius: 6px;
        color: var(--primary);
        display: flex;
        font-size: 12px;
        font-weight: 800;
        justify-content: flex-start;
        min-height: 30px;
        min-width: 0;
        overflow-wrap: anywhere;
        padding: 4px 8px;
        text-align: left;
      }

      .private-care-divider {
        background: linear-gradient(90deg, transparent, #c9d7e7, transparent);
        height: 1px;
        margin: 14px 0;
        width: 100%;
      }

      .private-care-summary-row {
        grid-template-columns: minmax(135px, 1.15fr) minmax(0, 0.9fr) minmax(0, 0.9fr) minmax(0, 0.7fr);
      }

      .private-care-total-label {
        color: #000000;
        font-size: 13px;
        font-weight: 800;
        line-height: 1.15;
        margin: 0;
        overflow-wrap: anywhere;
      }

      .private-care-inline-label {
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
        margin: 0 0 7px;
        text-align: left;
      }

      .private-care-effect-row {
        grid-template-columns: minmax(145px, 1.25fr) minmax(0, 0.9fr) minmax(0, 0.9fr);
        margin-top: 18px;
      }

      .private-care-empty {
        color: #000000;
        font-size: 13px;
        margin: 0 0 16px 28px;
      }

      .final-report-panel {
        border-left: 8px solid #eef3f8;
        padding-left: 16px;
      }

      .final-report-divider {
        border-top: 1px solid var(--border);
        margin: 18px 0;
      }

      .final-report-title {
        color: var(--primary);
        font-size: 15px;
        font-weight: 800;
        margin: 0 0 12px;
      }

      .final-report-line {
        align-items: center;
        display: flex;
        gap: 10px;
        margin-bottom: 12px;
      }

      .final-report-copy {
        color: var(--muted);
        font-size: 13px;
        margin: 0 0 16px;
      }

      .final-report-grid {
        display: grid;
        gap: 12px;
        grid-template-columns: 1fr 1fr;
        margin-bottom: 14px;
      }

      .final-report-field-full {
        margin-bottom: 14px;
      }

      .final-report-label {
        color: var(--primary);
        display: block;
        font-size: 12px;
        font-weight: 800;
        margin-bottom: 6px;
      }

      .final-report-box,
      .final-report-note-box,
      .final-report-text-box {
        background: #f8fbff;
        border: 1px solid #c6d3e2;
        border-radius: 8px;
        color: var(--text);
        font-size: 13px;
        padding: 10px;
      }

      .final-report-box {
        min-height: 36px;
      }

      .final-report-note-box {
        min-height: 84px;
        white-space: pre-wrap;
      }

      .final-report-save-button {
        background: var(--accent);
        border-radius: 6px;
        color: #ffffff;
        display: inline-block;
        font-size: 13px;
        font-weight: 800;
        margin-bottom: 8px;
        padding: 10px 16px;
      }

      .final-report-status {
        color: #0b7d60;
        font-size: 12px;
        font-weight: 800;
        margin: 0;
      }

      .final-report-text-box {
        max-height: 230px;
        overflow: hidden;
        white-space: pre-wrap;
      }

      .meta-bar {
        border-bottom: 1px solid var(--border);
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(3, 1fr);
        padding: 0 0 18px;
      }

      .meta-label,
      .metric-label {
        color: var(--muted);
        font-size: 12px;
        margin: 0 0 4px;
      }

      .meta-value,
      .metric-value {
        color: var(--primary);
        font-weight: 800;
        margin: 0;
      }

      .content {
        padding: 28px 38px 38px;
      }

      .summary {
        border: 1px solid ${getReportColor(result.globalTrafficLight)};
        border-radius: 10px;
        display: grid;
        gap: 18px;
        grid-template-columns: 190px 1fr;
        margin-bottom: 22px;
        overflow: hidden;
      }

      .score-panel {
        background: ${getReportBackground(result.globalTrafficLight)};
        padding: 20px;
      }

      .score {
        color: var(--primary);
        font-size: 38px;
        font-weight: 900;
        line-height: 1;
        margin: 8px 0 8px;
      }

      .summary-text {
        padding: 20px 20px 20px 0;
      }

      .badge {
        border-radius: 999px;
        display: inline-flex;
        font-size: 12px;
        font-weight: 900;
        padding: 7px 10px;
      }

      .badge-green {
        background: #e8f7f1;
        color: #12664e;
      }

      .badge-yellow {
        background: #fff5d8;
        color: #875a00;
      }

      .badge-red {
        background: #fde9e9;
        color: #9f2222;
      }

      .metrics {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(3, 1fr);
        margin: 20px 0;
      }

      .metric {
        background: var(--soft);
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 15px;
      }

      .metric-value {
        font-size: 22px;
      }

      section {
        border-top: 1px solid var(--border);
        padding: 22px 0 0;
        margin-top: 22px;
        break-inside: avoid;
      }

      h2 {
        color: var(--primary);
        font-size: 18px;
        margin: 0 0 12px;
      }

      p {
        margin: 0 0 10px;
      }

      table {
        border-collapse: collapse;
        margin: 10px 0 0;
        width: 100%;
      }

      th,
      td {
        border-bottom: 1px solid var(--border);
        padding: 10px 8px;
        text-align: left;
        vertical-align: top;
      }

      th {
        color: var(--primary);
        font-size: 12px;
        text-transform: uppercase;
      }

      .two-col {
        display: grid;
        gap: 16px;
        grid-template-columns: 1fr 1fr;
      }

      .callout {
        background: #f8fafc;
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 14px;
      }

      .note {
        background: #eef8f4;
        border: 1px solid #c7eadf;
        border-radius: 10px;
        padding: 14px;
      }

      .footer {
        color: var(--muted);
        font-size: 12px;
        margin-top: 26px;
      }

      @media print {
        @page {
          margin: 14mm;
          size: A4;
        }

        body {
          background: #ffffff;
          padding: 0;
        }

        .page {
          border-radius: 0;
          box-shadow: none;
          max-width: none;
        }

        .report-diagnosis-header {
          padding-left: 0;
          padding-right: 0;
        }

        .tax-situation-panel {
          margin-left: 0;
          margin-right: 0;
        }

        .care-situation-panel {
          margin-left: 0;
          margin-right: 0;
        }

        .private-care-panel {
          margin-left: 0;
          margin-right: 0;
        }
      }
    </style>
  </head>
  <body>
    <article class="page">
      <header class="report-diagnosis-header">
        <h1 class="report-diagnosis-title">Ihre Finanz-Diagnose</h1>
        <p class="report-diagnosis-copy">Die Auswertung ist eine vereinfachte Orientierung und ersetzt keine individuelle Steuer-, Renten- oder Vertragsberatung.</p>
        <div class="report-diagnosis-alert">
          ${trafficBadge(result.globalTrafficLight)}
          <span>${escapeHtml(getGlobalSummaryText(result.globalTrafficLight))}</span>
        </div>
        <div class="report-diagnosis-metrics">
          <div class="report-diagnosis-metric">
            <p class="report-diagnosis-metric-label">Prüfscore</p>
            <p class="report-diagnosis-metric-value">${formatNumber(result.globalScore)} / 100</p>
          </div>
          <div class="report-diagnosis-metric">
            <p class="report-diagnosis-metric-label">Rechnerische Einkommensteuer 2026</p>
            <p class="report-diagnosis-metric-value">${formatCurrency(result.calculatedIncomeTax)}</p>
          </div>
          <div class="report-diagnosis-metric">
            <p class="report-diagnosis-metric-label">Mögliche monatliche Lücke</p>
            <p class="report-diagnosis-metric-value">${formatCurrency(Math.max(0, result.monthlyGap))}</p>
          </div>
        </div>
      </header>

      <div class="tax-situation-panel">
        <h2 class="tax-situation-title">Steuerliche Situation</h2>
        <div class="tax-situation-row">
          <p class="tax-situation-label">Angenommenes zu versteuerndes Einkommen</p>
          <div class="tax-situation-value">${formatCurrency(input.tax.taxableIncome)}</div>
        </div>
        <div class="tax-situation-row">
          <p class="tax-situation-label">Rechnerische Einkommensteuer 2026<br />nach § 32a EStG</p>
          <div class="tax-situation-value">${formatCurrency(result.calculatedIncomeTax)}</div>
        </div>
        <div class="tax-situation-row">
          <p class="tax-situation-label">Geschätzte Steuerlast bis zum Rentenbeginn<br />unter Berücksichtigung der angegebenen Inflation</p>
          <div class="tax-situation-value">${formatCurrency(result.estimatedTaxUntilRetirement)}</div>
        </div>
      </div>

      <div class="care-situation-panel">
        <h2 class="care-situation-title">Versorgungs- Bedarfssituation</h2>
        <p class="care-situation-subtitle">Voraussichtliche Bezüge aus gesetzlicher Rentenkasse<br />unter Berücksichtigung der angegebenen Inflationsrate</p>
        <div class="care-situation-row">
          <p class="care-situation-label">Person 1</p>
          <div class="care-situation-value">${formatCurrency(result.estimatedPensionPerson1)}</div>
        </div>
        <div class="care-situation-row">
          <p class="care-situation-label">Person 2</p>
          <div class="care-situation-value">${formatCurrency(result.estimatedPensionPerson2)}</div>
        </div>
        <div class="care-situation-row">
          <p class="care-situation-label">Gesetzliche Gesamtversorgung</p>
          <div class="care-situation-value">${formatCurrency(result.totalEstimatedPension)}</div>
        </div>

        <div class="care-spacer"></div>
        <p class="care-situation-subtitle">Voraussichtlicher finanzieller Bedarf bei Rentenbeginn<br />unter Berücksichtigung der angegebenen Inflationsrate</p>
        <div class="care-situation-row care-situation-row-wide">
          <p class="care-situation-label">Warmmiete hochgerechnet</p>
          <div class="care-situation-value">${formatCurrency(result.futureRent)}</div>
        </div>
        <div class="care-situation-row care-situation-row-wide">
          <p class="care-situation-label">Lebenshaltungskosten hochgerechnet</p>
          <div class="care-situation-value">${formatCurrency(result.futureLivingCosts)}</div>
        </div>
        <div class="care-situation-row care-situation-row-wide">
          <p class="care-situation-label">Voraussichtlicher Gesamtbedarf</p>
          <div class="care-situation-value">${formatCurrency(result.futureTotalNeed)}</div>
        </div>
        <div class="care-situation-row care-situation-row-wide">
          <p class="care-situation-label care-situation-label-strong">Ergebnis&nbsp;&nbsp; Bedarf vs. Versorgung</p>
          <div class="care-situation-value care-situation-value-green">${formatCurrency(Math.max(0, result.monthlyGap))}</div>
        </div>
      </div>

      <div class="private-care-panel">
        <h2 class="private-care-title">Private Vorsorge</h2>
        <p class="private-care-intro">Bei den privaten Verträgen könnte nach Hochrechnung der angegebenen aktuellen Entwicklung mit folgenden Ergebnissen gerechnet werden</p>
        ${privateCare.contractRows}
        <div class="private-care-divider"></div>
        <div class="private-care-summary-row">
          <p class="private-care-total-label">Mögliches Gesamtergebnis<br />der privaten Verträge</p>
          <div>
            <p class="private-care-inline-label">Möglicher Ertrag</p>
            <div class="private-care-value">${formatCurrency(privateCare.totalPossibleYield)}</div>
          </div>
          <div>
            <p class="private-care-inline-label">selbst eingezahlt</p>
            <div class="private-care-value">${formatCurrency(privateCare.totalSelfPaid)}</div>
          </div>
          <div>
            <p class="private-care-field-label">Nettorendite</p>
            <div class="private-care-value">${privateCare.netReturn}</div>
          </div>
        </div>
        <div class="private-care-effect-row">
          <p class="private-care-total-label">Altersversorgungseffekt</p>
          <div>
            <p class="private-care-field-label">monatliche Versorgungslücke</p>
            <div class="private-care-value">${formatCurrency(Math.max(0, result.monthlyGap))}</div>
          </div>
          <div>
            <p class="private-care-field-label">ausgeglichene Monate</p>
            <div class="private-care-value">${privateCare.coveredMonths}</div>
          </div>
        </div>
      </div>

      <main class="content">
        <section class="final-report-panel">
          <div class="final-report-divider"></div>
          <h2 class="final-report-title">Prüfbedarf-Ampel</h2>
          <div class="final-report-line">
            ${trafficBadge(result.globalTrafficLight)}
            <span>Prüfscore ${formatNumber(result.globalScore)} / 100</span>
          </div>

          <div class="final-report-divider"></div>
          <h2 class="final-report-title">PDF-Kundenbericht</h2>
          <p class="final-report-copy">Erstellen Sie einen übersichtlichen Bericht für das Kundengespräch. Die PDF-Ansicht wird nur lokal im Browser erzeugt; es werden keine Daten gespeichert oder übertragen.</p>
          <div class="final-report-grid">
            <div>
              <span class="final-report-label">Kundenname optional</span>
              <div class="final-report-box">${escapeHtml(meta.customerName?.trim() || "")}</div>
            </div>
            <div>
              <span class="final-report-label">Beratername optional</span>
              <div class="final-report-box">${escapeHtml(meta.advisorName?.trim() || "")}</div>
            </div>
          </div>
          <div class="final-report-field-full">
            <span class="final-report-label">Notiz für den Bericht optional</span>
            <div class="final-report-note-box">${escapeHtml(note || "")}</div>
          </div>
          <div class="final-report-save-button">PDF herunterladen / speichern</div>
          <p class="final-report-status">PDF-Ansicht wurde geöffnet. Im Druckdialog bitte „Als PDF speichern“ wählen.</p>

          <div class="final-report-divider"></div>
          <h2 class="final-report-title">Kopierbarer Ergebnistext</h2>
          <div class="final-report-text-box">${escapeHtml(result.generatedText)}</div>
        </section>
      </main>
    </article>
  </body>
</html>`;
}

function buildPrivateCarePreview(input: CheckInput, result: CheckResult): {
  contractRows: string;
  coveredMonths: string;
  netReturn: string;
  totalPossibleYield: number;
  totalSelfPaid: number;
} {
  let totalPossibleYield = 0;
  let totalSelfPaid = 0;
  let totalCurrentBalance = 0;
  const rows = input.contracts.slice(0, 3).map((contract, index) => {
    const contractResult = result.contractResults.find((item) => item.id === contract.id);
    const totalPaid =
      contractResult?.totalPaid ??
      (typeof contract.selfPaid === "number"
        ? contract.selfPaid
        : contract.annualContribution * contract.yearsRunning);
    const possibleYield = contract.currentBalance - totalPaid;
    totalPossibleYield += possibleYield;
    totalSelfPaid += totalPaid;
    totalCurrentBalance += contract.currentBalance;

    return `<div class="private-contract-row">
      <p class="private-contract-name">Vertrag ${index + 1}<span class="private-contract-type">${escapeHtml(
        getContractTypeLabel(contract)
      )}</span></p>
      <div>
        <p class="private-care-field-label">Möglicher Ertrag</p>
        <div class="private-care-value">${formatCurrency(possibleYield)}</div>
      </div>
      <div>
        <p class="private-care-field-label">Davon selbst eingezahlt</p>
        <div class="private-care-value">${formatCurrency(totalPaid)}</div>
      </div>
    </div>`;
  });

  if (input.contracts.length === 0) {
    rows.push('<p class="private-care-empty">Keine privaten Vorsorgeverträge angegeben.</p>');
  }

  const netReturn =
    totalSelfPaid > 0 ? formatPercent((totalPossibleYield / totalSelfPaid) * 100) : "0 %";
  const coveredMonths =
    result.monthlyGap > 0 ? formatNumber(totalCurrentBalance / result.monthlyGap) : "Keine Lücke";

  return {
    contractRows: rows.join(""),
    coveredMonths,
    netReturn,
    totalPossibleYield,
    totalSelfPaid
  };
}

function trafficBadge(value: TrafficLight): string {
  return `<span class="badge badge-${value}">${escapeHtml(trafficLightLabels[value])}</span>`;
}

function getReportColor(value: TrafficLight): string {
  if (value === "red") {
    return "#eec1c1";
  }

  if (value === "yellow") {
    return "#f1dda6";
  }

  return "#c5eadc";
}

function getReportBackground(value: TrafficLight): string {
  if (value === "red") {
    return "#fdecec";
  }

  if (value === "yellow") {
    return "#fff8e8";
  }

  return "#e8f7f1";
}

function getReportTextColor(value: TrafficLight): string {
  if (value === "red") {
    return "#8f1f1f";
  }

  if (value === "yellow") {
    return "#6f4b00";
  }

  return "#0b5f49";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
