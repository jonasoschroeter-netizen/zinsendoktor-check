import {
  contractTypeLabels,
  formatCurrency,
  formatNumber,
  formatPercent,
  getGapDiagnosis,
  getGlobalSummaryText,
  getIncomeTypesDiagnosis,
  getInflationDiagnosis,
  getPensionDiagnosis,
  getPrivatePensionSummary,
  getTaxComparisonText,
  incomeTypeLabels,
  maritalStatusLabels,
  OFFICIAL_TAX_SOURCE_2026,
  satisfactionLabels,
  trafficLightLabels
} from "./calculations";
import type { CheckInput, CheckResult, TrafficLight } from "./types";

export interface CustomerReportMeta {
  customerName?: string;
  advisorName?: string;
  note?: string;
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

  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Finanz-Gesundheitscheck Bericht</title>
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

      .hero {
        background: var(--primary);
        color: #ffffff;
        padding: 34px 38px;
      }

      .brand {
        color: rgba(255, 255, 255, 0.78);
        font-size: 13px;
        font-weight: 800;
        margin: 0 0 10px;
      }

      h1 {
        font-size: 34px;
        line-height: 1.08;
        margin: 0;
      }

      .hero-subline {
        color: rgba(255, 255, 255, 0.82);
        margin: 12px 0 0;
        max-width: 720px;
      }

      .meta-bar {
        border-bottom: 1px solid var(--border);
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(3, 1fr);
        padding: 18px 38px;
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
      }
    </style>
  </head>
  <body>
    <article class="page">
      <header class="hero">
        <p class="brand">Zinsendoktor.de</p>
        <h1>Finanz-Gesundheitscheck</h1>
        <p class="hero-subline">Kundenbericht mit Steuerorientierung, Rentenperspektive, Inflationsrechnung und Vorsorge-Ampel.</p>
      </header>

      <div class="meta-bar">
        ${metaItem("Kunde", customerName)}
        ${metaItem("Berater", advisorName)}
        ${metaItem("Datum", date)}
      </div>

      <main class="content">
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
              <p><strong>Steuerlast über 10 Jahre:</strong> ${formatCurrency(result.estimatedTax10Years)}</p>
              <p><strong>Grundlage:</strong> ${escapeHtml(OFFICIAL_TAX_SOURCE_2026.label)}</p>
            </div>
          </div>
          <p>${escapeHtml(getIncomeTypesDiagnosis(result.incomeTypeCount))}</p>
          <p>${escapeHtml(getTaxComparisonText(input.tax, result.calculatedIncomeTax))}</p>
        </section>

        <section>
          <h2>2. Rente und Versorgung</h2>
          <div class="metrics">
            ${metric("Versorgung Person 1", formatCurrency(result.estimatedPensionPerson1))}
            ${metric("Versorgung Person 2", formatCurrency(result.estimatedPensionPerson2))}
            ${metric("Gesamtversorgung", formatCurrency(result.totalEstimatedPension))}
          </div>
          <p>${escapeHtml(getPensionDiagnosis(input, result))}</p>
          <p class="footer">Vereinfachte Orientierung auf Basis eines Rentenfaktors. Die tatsächliche Rente kann abweichen.</p>
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

      if (!contractResult) {
        return "";
      }

      return `<tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(contractTypeLabels[contract.type])}</td>
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
        <th>#</th>
        <th>Art</th>
        <th>Laufzeit</th>
        <th>Eingezahlt</th>
        <th>Guthaben</th>
        <th>Zufriedenheit</th>
        <th>Bewertung</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
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
