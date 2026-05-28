import {
  formatCurrency,
  formatNumber,
  formatPercent,
  getGapDiagnosis,
  getGlobalSummaryText,
  getContractTypeLabel,
  getIncomeTypesDiagnosis,
  getInflationDiagnosis,
  getPensionDiagnosis,
  getPrivatePensionSummary,
  getTaxComparisonText,
  incomeTypeLabels,
  maritalStatusLabels,
  OFFICIAL_TAX_SOURCE_2026,
  RENTEN_SCHAETZUNG_HINWEIS,
  satisfactionLabels,
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
  const date = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date());
  const selectedIncomeTypes =
    input.tax.incomeTypes.length > 0
      ? input.tax.incomeTypes.map((type) => incomeTypeLabels[type]).join(", ")
      : "Keine Einkommensarten ausgewählt";
  const inflationDiagnosis = getInflationDiagnosis(result.inflationFactor);
  const gapDiagnosis = getGapDiagnosis(result.monthlyGap);
  const privatePensionSummary = getPrivatePensionSummary(result.contractResults);
  const customerName = meta.customerName?.trim() || "Kunde / Interessent";
  const advisorName = meta.advisorName?.trim() || "Zinsendoktor.de";
  const note = meta.note?.trim();
  const privateCare = buildPrivateCarePreview(input, result);
  const pensionMetrics = [
    metric("Geschätzte Versorgung Person 1", formatCurrency(result.estimatedPensionPerson1)),
    input.tax.maritalStatus === "verheiratet"
      ? metric("Geschätzte Versorgung Person 2", formatCurrency(result.estimatedPensionPerson2))
      : "",
    metric("Geschätzte Gesamtversorgung", formatCurrency(result.totalEstimatedPension))
  ].join("");

  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Financial Care Preview</title>
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

      .report-progress {
        background: #ffffff;
        border-bottom: 1px solid var(--border);
        padding: 22px 38px 16px;
      }

      .progress-top {
        align-items: center;
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
      }

      .progress-title {
        color: var(--primary);
        font-size: 15px;
        font-weight: 800;
        margin: 0;
      }

      .progress-count {
        color: var(--muted);
        font-size: 13px;
        margin: 0;
      }

      .progress-track {
        background: #e7edf5;
        border-radius: 999px;
        height: 7px;
        overflow: hidden;
      }

      .progress-bar {
        background: var(--accent);
        height: 100%;
        width: 100%;
      }

      .progress-tabs {
        align-items: center;
        display: flex;
        flex-wrap: wrap;
        gap: 0;
        margin-top: 12px;
      }

      .progress-tab {
        border-left: 2px solid var(--border);
        color: var(--muted);
        font-size: 12px;
        line-height: 1;
        padding: 0 10px;
      }

      .progress-tab:first-child {
        padding-left: 0;
      }

      .progress-tab-active {
        border-left-color: var(--accent);
        color: var(--primary);
        font-weight: 800;
      }

      .report-intro {
        border: 1px solid var(--border);
        border-radius: 8px;
        margin: 0 0 18px;
        padding: 24px 18px 18px;
      }

      .report-title {
        color: #000000;
        font-size: 22px;
        font-weight: 500;
        line-height: 1.18;
        margin: 0;
      }

      .report-subline {
        color: #000000;
        font-size: 14px;
        margin: 4px 0 0;
      }

      .report-pdf-cta {
        align-items: center;
        background: #eef8f4;
        border: 1px solid #c7eadf;
        border-radius: 8px;
        display: flex;
        gap: 18px;
        justify-content: space-between;
        margin: 16px 38px 0;
        padding: 14px 16px;
      }

      .report-pdf-title {
        color: #0b3b2f;
        font-size: 13px;
        font-weight: 800;
        margin: 0 0 3px;
      }

      .report-pdf-text {
        color: #27705d;
        font-size: 13px;
        margin: 0;
      }

      .report-pdf-button {
        background: var(--accent);
        border-radius: 6px;
        color: #ffffff;
        flex: 0 0 auto;
        font-size: 13px;
        font-weight: 800;
        padding: 11px 18px;
      }

      .tax-situation-panel {
        background: #ffffff;
        margin: 18px 38px 0;
        padding: 28px 14px 10px;
      }

      .tax-situation-title {
        color: #000000;
        font-size: 22px;
        font-weight: 500;
        margin: 0 0 18px;
      }

      .tax-situation-row {
        align-items: center;
        display: grid;
        gap: 30px;
        grid-template-columns: minmax(0, 1fr) 210px;
        margin-bottom: 28px;
      }

      .tax-situation-label {
        color: #000000;
        font-size: 13px;
        line-height: 1.25;
        margin: 0;
      }

      .tax-situation-value {
        align-items: center;
        border: 2px solid #0b3144;
        color: #000000;
        display: flex;
        font-size: 14px;
        min-height: 28px;
        padding: 3px 10px;
      }

      .care-situation-panel {
        background: #ffffff;
        margin: 42px 38px 0;
        padding: 0 14px 14px;
      }

      .care-situation-title {
        color: #000000;
        font-size: 22px;
        font-weight: 500;
        margin: 0 0 28px 58px;
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
        display: grid;
        gap: 14px;
        grid-template-columns: minmax(0, 1fr) 160px 120px;
        margin-bottom: 7px;
      }

      .care-situation-row-wide {
        grid-template-columns: minmax(0, 1fr) 190px 120px;
      }

      .care-situation-label {
        color: #000000;
        font-size: 13px;
        margin: 0;
        text-align: right;
      }

      .care-situation-label-strong {
        font-weight: 800;
      }

      .care-situation-value {
        align-items: center;
        border: 1px solid #0a78b2;
        color: #000000;
        display: flex;
        font-size: 13px;
        justify-content: flex-end;
        min-height: 26px;
        padding: 3px 8px;
      }

      .care-situation-value-green {
        border-color: var(--accent);
        background: #eef8f4;
      }

      .care-spacer {
        height: 14px;
      }

      .private-care-panel {
        background: #ffffff;
        margin: 58px 38px 0;
        padding: 0 14px 22px;
      }

      .private-care-title {
        color: #000000;
        font-size: 22px;
        font-weight: 500;
        margin: 0 0 18px 28px;
      }

      .private-care-intro {
        color: #000000;
        font-size: 13px;
        line-height: 1.25;
        margin: 0 0 46px;
        max-width: 520px;
      }

      .private-contract-row,
      .private-care-summary-row,
      .private-care-effect-row {
        align-items: center;
        display: grid;
        gap: 18px;
        grid-template-columns: 285px 170px 170px;
        margin-bottom: 16px;
      }

      .private-contract-name {
        color: #000000;
        font-size: 13px;
        font-weight: 800;
        margin: 0;
      }

      .private-contract-type {
        font-weight: 800;
        margin-left: 7px;
      }

      .private-care-field-label {
        color: #000000;
        font-size: 12px;
        margin: 0 0 7px;
        text-align: center;
      }

      .private-care-value {
        align-items: center;
        border: 2px solid #0b3144;
        color: #000000;
        display: flex;
        font-size: 13px;
        justify-content: flex-end;
        min-height: 26px;
        padding: 3px 8px;
      }

      .private-care-divider {
        background: #0a6188;
        height: 2px;
        margin: 10px 0 22px 20px;
        width: calc(100% - 40px);
      }

      .private-care-summary-row {
        grid-template-columns: 185px 170px 170px 120px;
        margin-left: 14px;
      }

      .private-care-total-label {
        color: #000000;
        font-size: 13px;
        font-weight: 800;
        line-height: 1.15;
        margin: 0;
      }

      .private-care-inline-label {
        color: #000000;
        font-size: 12px;
        margin: 0 0 7px;
        text-align: left;
      }

      .private-care-effect-row {
        grid-template-columns: 285px 170px 170px;
        margin-top: 58px;
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
        background: #ffffff;
        border: 1px solid var(--border);
        border-radius: 6px;
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

        .report-pdf-cta {
          margin-left: 0;
          margin-right: 0;
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
      <header class="report-progress">
        <div class="progress-top">
          <p class="progress-title">Auswertung</p>
          <p class="progress-count">Schritt 5 von 5</p>
        </div>
        <div class="progress-track"><div class="progress-bar"></div></div>
        <div class="progress-tabs" aria-hidden="true">
          <span class="progress-tab">Steuern</span>
          <span class="progress-tab">Rente</span>
          <span class="progress-tab">Inflation</span>
          <span class="progress-tab">Vorsorge</span>
          <span class="progress-tab progress-tab-active">Auswertung</span>
        </div>
      </header>

      <div class="report-pdf-cta">
        <div>
          <p class="report-pdf-title">PDF für den Kunden sichern</p>
          <p class="report-pdf-text">Erstellt eine übersichtliche PDF-/Druckansicht für das Kundengespräch.</p>
        </div>
        <div class="report-pdf-button">PDF herunterladen / speichern</div>
      </div>

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
        <p class="care-situation-subtitle">Voraussichtliche BezÃ¼ge aus gesetzlicher Rentenkasse<br />unter BerÃ¼cksichtigung der angegebenen Inflationsrate</p>
        <div class="care-situation-row">
          <span></span>
          <p class="care-situation-label">Person 1</p>
          <div class="care-situation-value">${formatCurrency(result.estimatedPensionPerson1)}</div>
        </div>
        <div class="care-situation-row">
          <span></span>
          <p class="care-situation-label">Person 2</p>
          <div class="care-situation-value">${formatCurrency(result.estimatedPensionPerson2)}</div>
        </div>
        <div class="care-situation-row">
          <span></span>
          <p class="care-situation-label">Gesetzliche Gesamtversorgung</p>
          <div class="care-situation-value">${formatCurrency(result.totalEstimatedPension)}</div>
        </div>

        <div class="care-spacer"></div>
        <p class="care-situation-subtitle">Voraussichtlicher finanzieller Bedarf bei Rentenbeginn<br />unter BerÃ¼cksichtigung der angegebenen Inflationsrate</p>
        <div class="care-situation-row care-situation-row-wide">
          <span></span>
          <p class="care-situation-label">Warmmiete hochgerechnet</p>
          <div class="care-situation-value">${formatCurrency(result.futureRent)}</div>
        </div>
        <div class="care-situation-row care-situation-row-wide">
          <span></span>
          <p class="care-situation-label">Lebenshaltungskosten hochgerechnet</p>
          <div class="care-situation-value">${formatCurrency(result.futureLivingCosts)}</div>
        </div>
        <div class="care-situation-row care-situation-row-wide">
          <span></span>
          <p class="care-situation-label">Voraussichtlicher Gesamtbedarf</p>
          <div class="care-situation-value">${formatCurrency(result.futureTotalNeed)}</div>
        </div>
        <div class="care-situation-row care-situation-row-wide">
          <span></span>
          <p class="care-situation-label care-situation-label-strong">Ergebnis&nbsp;&nbsp; Bedarf vs. Versorgung</p>
          <div class="care-situation-value care-situation-value-green">${formatCurrency(Math.max(0, result.monthlyGap))}</div>
        </div>
      </div>

      <div class="private-care-panel">
        <h2 class="private-care-title">Private Vorsorge</h2>
        <p class="private-care-intro">Bei den privaten VertrÃ¤gen kÃ¶nnte nach Hochrechnung der angegebenen aktuellen Entwicklung mit folgenden Ergebnissen gerechnet werden</p>
        ${privateCare.contractRows}
        <div class="private-care-divider"></div>
        <div class="private-care-summary-row">
          <p class="private-care-total-label">MÃ¶gliches Gesamtergebnis<br />Der Privaten VertrÃ¤ge</p>
          <div>
            <p class="private-care-inline-label">MÃ¶glicher Ertrag</p>
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
            <p class="private-care-field-label">monatliche VersorgungslÃ¼cke</p>
            <div class="private-care-value">${formatCurrency(Math.max(0, result.monthlyGap))}</div>
          </div>
          <div>
            <p class="private-care-field-label">ausgeglichene Monate</p>
            <div class="private-care-value">${privateCare.coveredMonths}</div>
          </div>
        </div>
      </div>

      <main class="content">
        <section class="report-intro">
          <h1 class="report-title">Financial Care Preview</h1>
          <p class="report-subline">Diese Vorschau ist nur eine Orientierung und ersetzt keine individuelle Steuer-, Renten- oder Vorsorgeberatung.</p>
        </section>

        <div class="meta-bar">
          ${metaItem("Kunde", customerName)}
          ${metaItem("Berater", advisorName)}
          ${metaItem("Datum", date)}
        </div>

        <div class="summary">
          <div class="score-panel">
            ${trafficBadge(result.globalTrafficLight)}
            <p class="score">${formatNumber(result.globalScore)}</p>
            <p class="meta-label">von 100 Punkten Prüfbedarf</p>
          </div>
          <div class="summary-text">
            <h2>Gesamteinschätzung</h2>
            <p>${escapeHtml(getGlobalSummaryText(result.globalTrafficLight))}</p>
          </div>
        </div>

        <div class="metrics">
          ${metric("Einkommensteuer 2026", formatCurrency(result.calculatedIncomeTax))}
          ${metric("Zukünftiger Monatsbedarf", formatCurrency(result.futureTotalNeed))}
          ${metric("Mögliche Monatslücke", formatCurrency(Math.max(0, result.monthlyGap)))}
        </div>

        ${note ? `<section><h2>Beraternotiz</h2><div class="note">${escapeHtml(note)}</div></section>` : ""}

        <section>
          <h2>1. Steuerdiagnose</h2>
          <div class="two-col">
            <div class="callout">
              <p><strong>Familienstand:</strong> ${escapeHtml(maritalStatusLabels[input.tax.maritalStatus])}</p>
              <p><strong>Einkommensarten:</strong> ${escapeHtml(selectedIncomeTypes)}</p>
              <p><strong>Zu versteuerndes Einkommen:</strong> ${formatCurrency(input.tax.taxableIncome)}</p>
              <p><strong>Angegebene Einkommensteuer:</strong> ${
                typeof input.tax.paidIncomeTax === "number"
                  ? formatCurrency(input.tax.paidIncomeTax)
                  : "Nicht angegeben"
              }</p>
            </div>
            <div class="callout">
              <p><strong>Rechnerische Einkommensteuer:</strong> ${formatCurrency(result.calculatedIncomeTax)}</p>
              <p><strong>Steuerlast bis Rentenbeginn:</strong> ${formatCurrency(result.estimatedTaxUntilRetirement)}</p>
              <p><strong>Grundlage:</strong> ${escapeHtml(OFFICIAL_TAX_SOURCE_2026.label)}</p>
            </div>
          </div>
          <p>${escapeHtml(getIncomeTypesDiagnosis(result.incomeTypeCount))}</p>
          <p>${escapeHtml(getTaxComparisonText(input.tax, result.calculatedIncomeTax))}</p>
          <p class="footer">Die Projektion bis Rentenbeginn nutzt modellhaft den 2026-Tarif und die angegebene Inflation.</p>
        </section>

        <section>
          <h2>2. Rente und Versorgung</h2>
          <div class="metrics">
            ${pensionMetrics}
          </div>
          <p>${escapeHtml(getPensionDiagnosis(input, result))}</p>
          <p class="footer">${escapeHtml(RENTEN_SCHAETZUNG_HINWEIS)} Die tatsächliche Rente kann abweichen.</p>
        </section>

        <section>
          <h2>3. Inflation und Bedarf</h2>
          <div class="metrics">
            ${metric("Inflation", formatPercent(input.inflation.expectedInflationPercent))}
            ${metric("Analysezeitraum", `${formatNumber(result.analysisYears)} Jahre`)}
            ${metric("Inflationsfaktor", formatNumber(result.inflationFactor))}
          </div>
          <table>
            <tbody>
              ${row("Warmmiete heute", formatCurrency(input.inflation.currentWarmRent))}
              ${row("Warmmiete hochgerechnet", formatCurrency(result.futureRent))}
              ${row("Lebenshaltung heute", formatCurrency(input.inflation.currentLivingCosts))}
              ${row("Lebenshaltung hochgerechnet", formatCurrency(result.futureLivingCosts))}
            </tbody>
          </table>
          <p>${escapeHtml(inflationDiagnosis.text)}</p>
        </section>

        <section>
          <h2>4. Gesamtbedarf vs. Gesamtversorgung</h2>
          <div class="metrics">
            ${metric("Geschätzte Versorgung", formatCurrency(result.totalEstimatedPension))}
            ${metric("Zukünftiger Bedarf", formatCurrency(result.futureTotalNeed))}
            ${metric("Monatliche Lücke", formatCurrency(Math.max(0, result.monthlyGap)))}
          </div>
          <p>${escapeHtml(gapDiagnosis.text)}</p>
        </section>

        <section>
          <h2>5. Private Vorsorge</h2>
          <p>${escapeHtml(privatePensionSummary.text)}</p>
          ${contractsTable(input, result)}
        </section>

        <section>
          <h2>Hinweis zur Einordnung</h2>
          <p>${escapeHtml(OFFICIAL_TAX_SOURCE_2026.scope)}</p>
          <p>Der Bericht ist eine vereinfachte Orientierung für das Kundengespräch. Er ersetzt keine individuelle Steuer-, Renten-, Versicherungs- oder Rechtsberatung.</p>
          <p class="footer">Die Angaben wurden im Browser verarbeitet. Im anonymen Test werden keine Daten gespeichert oder an einen Server übertragen.</p>
        </section>
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

function contractsTable(input: CheckInput, result: CheckResult): string {
  if (input.contracts.length === 0) {
    return "<p>Keine privaten Vorsorgeverträge angegeben.</p>";
  }

  const rows = input.contracts
    .map((contract, index) => {
      const contractResult = result.contractResults.find((item) => item.id === contract.id);
      const contractName = contract.name?.trim() || `Vertrag ${index + 1}`;

      if (!contractResult) {
        return "";
      }

      return `<tr>
        <td>${escapeHtml(contractName)}</td>
        <td>${escapeHtml(getContractTypeLabel(contract))}</td>
        <td>${formatNumber(contract.yearsRunning)} Jahre</td>
        <td>${formatCurrency(contractResult.totalPaid)}</td>
        <td>${formatCurrency(contract.currentBalance)}</td>
        <td>${escapeHtml(satisfactionLabels[contract.satisfaction])}</td>
        <td>${trafficBadge(contractResult.trafficLight)}<br>${escapeHtml(contractResult.message)}</td>
      </tr>`;
    })
    .join("");

  return `<table>
    <thead>
      <tr>
        <th>Vertrag</th>
        <th>Art</th>
        <th>Laufzeit</th>
        <th>Selbst eingezahlt</th>
        <th>Guthaben/Rückkaufswert</th>
        <th>Erfüllt Erwartungen?</th>
        <th>Bewertung</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
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

function metaItem(label: string, value: string): string {
  return `<div>
    <p class="meta-label">${escapeHtml(label)}</p>
    <p class="meta-value">${escapeHtml(value)}</p>
  </div>`;
}

function metric(label: string, value: string): string {
  return `<div class="metric">
    <p class="metric-label">${escapeHtml(label)}</p>
    <p class="metric-value">${escapeHtml(value)}</p>
  </div>`;
}

function row(label: string, value: string): string {
  return `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`;
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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
