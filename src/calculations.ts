import type {
  CheckInput,
  CheckResult,
  ContractResult,
  ContractType,
  InflationInput,
  MaritalStatus,
  PensionInput,
  Satisfaction,
  TaxInput,
  TrafficLight,
  VorsorgeContractInput
} from "./types";

export const RENTENFAKTOR = 0.68;
export const RENTEN_SCHAETZUNG_HINWEIS =
  "Orientierungsschätzung: gesetzliche Monatsrente grob mit 68 % des heutigen monatlichen Nettoeinkommens.";

export const OFFICIAL_TAX_SOURCE_2026 = {
  label: "Einkommensteuertarif 2026 nach § 32a EStG",
  lawUrl: "https://www.gesetze-im-internet.de/estg/__32a.html",
  bmfCalculatorUrl: "https://www.bmf-steuerrechner.de/",
  scope:
    "Tarifliche Einkommensteuer auf Basis des zu versteuernden Einkommens; ohne Solidaritätszuschlag, Kirchensteuer, Abgeltungsteuer und Sondervorschriften."
} as const;

export const INCOME_TAX_2026_PARAMETERS = {
  basicAllowance: 12348,
  progressionZone1End: 17799,
  progressionZone2End: 69878,
  proportionalZoneEnd: 277825,
  zone1A: 914.51,
  zone1B: 1400,
  zone2A: 173.1,
  zone2B: 2397,
  zone2C: 1034.87,
  zone3Rate: 0.42,
  zone3Deduction: 11135.63,
  zone4Rate: 0.45,
  zone4Deduction: 19470.38
} as const;

export const incomeTypeLabels: Record<TaxInput["incomeTypes"][number], string> = {
  land_forst: "Land- und Forstwirtschaft",
  gewerbe: "Gewerbebetrieb",
  selbststaendig: "Selbständige Arbeit",
  nichtselbststaendig: "Nichtselbständige Arbeit",
  kapital: "Kapitalvermögen",
  vermietung: "Vermietung und Verpachtung",
  sonstige: "Sonstige Einkünfte"
};

export const maritalStatusLabels: Record<MaritalStatus, string> = {
  ledig: "Ledig / einzeln veranlagt",
  verheiratet: "Verheiratet / zusammen veranlagt"
};

export const contractTypeLabels: Record<ContractType, string> = {
  rentenversicherung: "Rentenversicherung",
  lebensversicherung: "Lebensversicherung",
  bausparvertrag: "Bausparvertrag",
  sonstiges: "Sonstiges"
};

export const satisfactionLabels: Record<Satisfaction, string> = {
  zufrieden: "Bin zufrieden",
  unzufrieden: "Bin unzufrieden",
  unsicher: "Weiß ich nicht / unsicher"
};

export const trafficLightLabels: Record<TrafficLight, string> = {
  green: "Grün",
  yellow: "Gelb",
  red: "Rot"
};

export function calculateIncomeTax2026(
  taxableIncome: number,
  maritalStatus: MaritalStatus
): number {
  if (maritalStatus === "verheiratet") {
    return 2 * calculateSingleIncomeTax2026(taxableIncome / 2);
  }

  return calculateSingleIncomeTax2026(taxableIncome);
}

export function calculateSingleIncomeTax2026(taxableIncome: number): number {
  const p = INCOME_TAX_2026_PARAMETERS;
  const x = Math.floor(Math.max(0, taxableIncome));
  let tax = 0;

  if (x <= p.basicAllowance) {
    tax = 0;
  } else if (x <= p.progressionZone1End) {
    const y = (x - p.basicAllowance) / 10000;
    tax = (p.zone1A * y + p.zone1B) * y;
  } else if (x <= p.progressionZone2End) {
    const z = (x - p.progressionZone1End) / 10000;
    tax = (p.zone2A * z + p.zone2B) * z + p.zone2C;
  } else if (x <= p.proportionalZoneEnd) {
    tax = p.zone3Rate * x - p.zone3Deduction;
  } else {
    tax = p.zone4Rate * x - p.zone4Deduction;
  }

  return Math.max(0, Math.floor(tax));
}

export function calculateEstimatedTaxUntilRetirement(
  taxableIncome: number,
  maritalStatus: MaritalStatus,
  analysisYears: number,
  inflationPercent: number
): number {
  const years = Math.max(1, Math.floor(analysisYears));
  const inflationRate = Math.max(0, inflationPercent) / 100;
  let total = 0;

  for (let year = 0; year < years; year += 1) {
    const projectedIncome = taxableIncome * Math.pow(1 + inflationRate, year);
    total += calculateIncomeTax2026(projectedIncome, maritalStatus);
  }

  return total;
}

export function calculatePension(
  pensionInput: PensionInput,
  maritalStatus: MaritalStatus
): {
  estimatedPensionPerson1: number;
  estimatedPensionPerson2: number;
  totalEstimatedPension: number;
} {
  const estimatedPensionPerson1 = pensionInput.monthlyNetIncomePerson1 * RENTENFAKTOR;
  const hasPerson2Income =
    maritalStatus === "verheiratet" &&
    typeof pensionInput.monthlyNetIncomePerson2 === "number";
  const estimatedPensionPerson2 = hasPerson2Income
    ? (pensionInput.monthlyNetIncomePerson2 ?? 0) * RENTENFAKTOR
    : 0;

  return {
    estimatedPensionPerson1,
    estimatedPensionPerson2,
    totalEstimatedPension: estimatedPensionPerson1 + estimatedPensionPerson2
  };
}

export function calculateInflation(
  inflationInput: InflationInput,
  pensionInput: PensionInput,
  maritalStatus: MaritalStatus
): {
  analysisYears: number;
  inflationFactor: number;
  futureRent: number;
  futureLivingCosts: number;
  futureTotalNeed: number;
  currentTotalNeed: number;
  purchasingPowerLossPercent: number;
} {
  const person2Years =
    maritalStatus === "verheiratet" &&
    typeof pensionInput.yearsToRetirementPerson2 === "number"
      ? pensionInput.yearsToRetirementPerson2
      : undefined;
  const analysisYears =
    typeof person2Years === "number"
      ? Math.max(pensionInput.yearsToRetirementPerson1, person2Years)
      : pensionInput.yearsToRetirementPerson1;
  const inflationRate = inflationInput.expectedInflationPercent / 100;
  const inflationFactor = Math.pow(1 + inflationRate, analysisYears);
  const futureRent = inflationInput.currentWarmRent * inflationFactor;
  const futureLivingCosts = inflationInput.currentLivingCosts * inflationFactor;

  return {
    analysisYears,
    inflationFactor,
    futureRent,
    futureLivingCosts,
    futureTotalNeed: futureRent + futureLivingCosts,
    currentTotalNeed: inflationInput.currentWarmRent + inflationInput.currentLivingCosts,
    purchasingPowerLossPercent: (1 - 1 / inflationFactor) * 100
  };
}

export function evaluateContract(contract: VorsorgeContractInput): ContractResult {
  const totalPaid = contract.annualContribution * contract.yearsRunning;
  const valueRatio = totalPaid > 0 ? contract.currentBalance / totalPaid : null;
  let score = 0;

  if (contract.satisfaction === "unzufrieden") {
    score += 40;
  } else if (contract.satisfaction === "unsicher") {
    score += 20;
  }

  if (valueRatio !== null && contract.yearsRunning > 0) {
    if (contract.yearsRunning < 3) {
      if (valueRatio < 0.5) {
        score += 25;
      } else if (valueRatio < 0.8) {
        score += 15;
      }
    } else if (contract.yearsRunning <= 7) {
      if (valueRatio < 0.7) {
        score += 35;
      } else if (valueRatio < 0.9) {
        score += 20;
      }
    } else if (valueRatio < 0.85) {
      score += 40;
    } else if (valueRatio < 1) {
      score += 25;
    }
  }

  const trafficLight = getContractTrafficLight(score);

  return {
    id: contract.id,
    totalPaid,
    valueRatio,
    score,
    trafficLight,
    message: getContractMessage(trafficLight),
    hint: getContractHint(contract.type)
  };
}

export function calculateGlobalScore(
  input: CheckInput,
  resultWithoutScore: Omit<CheckResult, "globalScore" | "globalTrafficLight" | "generatedText">
): number {
  let globalScore = 0;

  if (resultWithoutScore.calculatedIncomeTax > 10000) {
    globalScore += 15;
  }

  if (resultWithoutScore.calculatedIncomeTax > 25000) {
    globalScore += 25;
  }

  if (isPaidTaxClearlyHigher(input.tax, resultWithoutScore.calculatedIncomeTax)) {
    globalScore += 20;
  }

  if (input.tax.incomeTypes.length === 1) {
    globalScore += 10;
  }

  if (resultWithoutScore.monthlyGap > 0) {
    globalScore += 15;
  }

  if (resultWithoutScore.monthlyGap > 500) {
    globalScore += 25;
  }

  if (resultWithoutScore.monthlyGap > 1500) {
    globalScore += 35;
  }

  if (resultWithoutScore.inflationFactor >= 1.2) {
    globalScore += 10;
  }

  if (resultWithoutScore.inflationFactor >= 1.6) {
    globalScore += 20;
  }

  const contractScore = resultWithoutScore.contractResults.reduce((sum, contract) => {
    if (contract.trafficLight === "red") {
      return sum + 25;
    }

    if (contract.trafficLight === "yellow") {
      return sum + 10;
    }

    return sum;
  }, 0);

  globalScore += Math.min(40, contractScore);

  return Math.min(100, globalScore);
}

export function getTrafficLight(score: number): TrafficLight {
  if (score >= 60) {
    return "red";
  }

  if (score >= 30) {
    return "yellow";
  }

  return "green";
}

export function calculateCheck(input: CheckInput): CheckResult {
  const calculatedIncomeTax = calculateIncomeTax2026(
    input.tax.taxableIncome,
    input.tax.maritalStatus
  );
  const pension = calculatePension(input.pension, input.tax.maritalStatus);
  const inflation = calculateInflation(input.inflation, input.pension, input.tax.maritalStatus);
  const estimatedTaxUntilRetirement = calculateEstimatedTaxUntilRetirement(
    input.tax.taxableIncome,
    input.tax.maritalStatus,
    inflation.analysisYears,
    input.inflation.expectedInflationPercent
  );
  const contractResults = input.contracts.map(evaluateContract);

  const partialResult = {
    calculatedIncomeTax,
    estimatedTaxUntilRetirement,
    incomeTypeCount: input.tax.incomeTypes.length,
    estimatedPensionPerson1: pension.estimatedPensionPerson1,
    estimatedPensionPerson2: pension.estimatedPensionPerson2,
    totalEstimatedPension: pension.totalEstimatedPension,
    analysisYears: inflation.analysisYears,
    inflationFactor: inflation.inflationFactor,
    futureRent: inflation.futureRent,
    futureLivingCosts: inflation.futureLivingCosts,
    futureTotalNeed: inflation.futureTotalNeed,
    monthlyGap: inflation.futureTotalNeed - pension.totalEstimatedPension,
    contractResults
  };

  const globalScore = calculateGlobalScore(input, partialResult);
  const resultWithoutText: CheckResult = {
    ...partialResult,
    globalScore,
    globalTrafficLight: getTrafficLight(globalScore),
    generatedText: ""
  };

  return {
    ...resultWithoutText,
    generatedText: generateResultText(input, resultWithoutText)
  };
}

export function generateResultText(input: CheckInput, result: CheckResult): string {
  const selectedIncomeTypes =
    input.tax.incomeTypes.length > 0
      ? input.tax.incomeTypes.map((type) => incomeTypeLabels[type]).join(", ")
      : "Keine Einkommensarten ausgewählt";
  const paidTax =
    typeof input.tax.paidIncomeTax === "number"
      ? formatCurrency(input.tax.paidIncomeTax)
      : "Nicht angegeben";
  const person2Lines =
    input.tax.maritalStatus === "verheiratet"
      ? [
          `Nettoeinkommen Person 2: ${formatOptionalCurrency(
            input.pension.monthlyNetIncomePerson2
          )}`,
          `Jahre bis zur Rente Person 2: ${formatOptionalNumber(
            input.pension.yearsToRetirementPerson2
          )}`,
          `Geschätzte monatliche Altersversorgung Person 2: ${formatCurrency(
            result.estimatedPensionPerson2
          )}`
        ]
      : [];
  const contractLines =
    input.contracts.length === 0
      ? ["Keine privaten Vorsorgeverträge angegeben."]
      : input.contracts.flatMap((contract, index) => {
          const contractResult = result.contractResults.find((item) => item.id === contract.id);

          return [
            `Vertrag ${index + 1}:`,
            `Art: ${contractTypeLabels[contract.type]}`,
            `Laufzeit: ${formatNumber(contract.yearsRunning)} Jahre`,
            `Jährlicher Beitrag: ${formatCurrency(contract.annualContribution)}`,
            `Bisher eingezahlt: ${formatCurrency(contractResult?.totalPaid ?? 0)}`,
            `Aktuelles Guthaben: ${formatCurrency(contract.currentBalance)}`,
            `Erfüllt der Vertrag Ihre Erwartungen? ${satisfactionLabels[contract.satisfaction]}`,
            `Bewertung: ${trafficLightLabels[contractResult?.trafficLight ?? "green"]}`,
            `Hinweis: ${contractResult?.hint ?? ""}`,
            ""
          ];
        });

  return [
    "Finanz-Gesundheitscheck – Ergebnis",
    "",
    "1. Angaben Steuern",
    `Familienstand: ${maritalStatusLabels[input.tax.maritalStatus]}`,
    `Ausgewählte Einkommensarten: ${selectedIncomeTypes}`,
    `Zu versteuerndes Einkommen: ${formatCurrency(input.tax.taxableIncome)}`,
    `Angegebene Einkommensteuer: ${paidTax}`,
    `Rechnerische Einkommensteuer 2026: ${formatCurrency(result.calculatedIncomeTax)}`,
    `Berechnungsgrundlage: ${OFFICIAL_TAX_SOURCE_2026.label}`,
    `Hinweis: ${OFFICIAL_TAX_SOURCE_2026.scope}`,
    `Geschätzte Steuerlast bis Rentenbeginn: ${formatCurrency(result.estimatedTaxUntilRetirement)}`,
    "",
    "2. Angaben Rente",
    RENTEN_SCHAETZUNG_HINWEIS,
    `Nettoeinkommen Person 1: ${formatCurrency(input.pension.monthlyNetIncomePerson1)}`,
    `Jahre bis zur Rente Person 1: ${formatNumber(input.pension.yearsToRetirementPerson1)}`,
    `Geschätzte monatliche Altersversorgung Person 1: ${formatCurrency(
      result.estimatedPensionPerson1
    )}`,
    ...person2Lines,
    `Geschätzte Gesamtversorgung: ${formatCurrency(result.totalEstimatedPension)}`,
    "",
    "3. Inflation und Bedarf",
    `Angenommene Inflation: ${formatPercent(input.inflation.expectedInflationPercent)}`,
    `Analysezeitraum: ${formatNumber(result.analysisYears)} Jahre`,
    `Aktuelle Warmmiete: ${formatCurrency(input.inflation.currentWarmRent)}`,
    `Hochgerechnete Warmmiete: ${formatCurrency(result.futureRent)}`,
    `Aktuelle Lebenshaltungskosten: ${formatCurrency(input.inflation.currentLivingCosts)}`,
    `Hochgerechnete Lebenshaltungskosten: ${formatCurrency(result.futureLivingCosts)}`,
    `Geschätzter zukünftiger Monatsbedarf: ${formatCurrency(result.futureTotalNeed)}`,
    "",
    "4. Versorgungslücke",
    `Geschätzte monatliche Versorgung: ${formatCurrency(result.totalEstimatedPension)}`,
    `Geschätzter zukünftiger Monatsbedarf: ${formatCurrency(result.futureTotalNeed)}`,
    `Mögliche monatliche Lücke: ${formatCurrency(Math.max(0, result.monthlyGap))}`,
    "",
    "5. Private Vorsorge",
    ...contractLines,
    "6. Gesamtbewertung",
    `Prüfscore: ${formatNumber(result.globalScore)} / 100`,
    `Ampel: ${trafficLightLabels[result.globalTrafficLight]}`,
    "Zusammenfassung:",
    getGlobalSummaryText(result.globalTrafficLight)
  ].join("\n");
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(safeNumber(value));
}

export function formatPercent(value: number): string {
  return `${new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 2
  }).format(safeNumber(value))} %`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: 2
  }).format(safeNumber(value));
}

export function getIncomeTypesDiagnosis(count: number): string {
  if (count === 0) {
    return "Keine Einkommensarten ausgewählt.";
  }

  if (count === 1) {
    return "Sie sind aktuell stark von einer Einkommensquelle abhängig.";
  }

  if (count <= 3) {
    return "Sie nutzen bereits mehrere Einkommensquellen.";
  }

  return "Sie nutzen bereits eine breite Einkommensstruktur.";
}

export function getTaxComparisonText(taxInput: TaxInput, calculatedIncomeTax: number): string {
  if (typeof taxInput.paidIncomeTax !== "number") {
    return "Ohne Angabe der gezahlten Einkommensteuer wird nur die rechnerische Steuerlast anhand des zu versteuernden Einkommens geschätzt.";
  }

  if (isPaidTaxClearlyHigher(taxInput, calculatedIncomeTax)) {
    return "Ihre angegebene Steuerzahlung liegt deutlich über der vereinfachten rechnerischen Orientierung. Das kann an Sonderfällen liegen, sollte aber geprüft werden.";
  }

  if (taxInput.paidIncomeTax < calculatedIncomeTax * 0.85) {
    return "Ihre angegebene Steuerzahlung liegt deutlich unter der rechnerischen Orientierung. Das kann durch Abzüge, Vorauszahlungen, Sonderfälle oder Eingabedaten erklärbar sein.";
  }

  return "Ihre angegebene Steuerzahlung liegt in einem plausiblen Bereich zur rechnerischen Orientierung.";
}

export function getTaxComparisonLight(
  taxInput: TaxInput,
  calculatedIncomeTax: number
): TrafficLight {
  if (typeof taxInput.paidIncomeTax !== "number") {
    return "yellow";
  }

  if (isPaidTaxClearlyHigher(taxInput, calculatedIncomeTax)) {
    return "red";
  }

  if (taxInput.paidIncomeTax < calculatedIncomeTax * 0.85) {
    return "yellow";
  }

  return "green";
}

export function getPensionDiagnosis(input: CheckInput, result: CheckResult): string {
  const person1Text =
    result.estimatedPensionPerson1 < input.pension.monthlyNetIncomePerson1 * 0.75
      ? "Die geschätzte spätere gesetzliche Versorgung kann deutlich unter dem heutigen Netto liegen."
      : "Die geschätzte spätere Versorgung liegt in dieser vereinfachten Orientierung näher am heutigen Netto.";

  if (
    input.tax.maritalStatus === "verheiratet" &&
    typeof input.pension.monthlyNetIncomePerson2 === "number"
  ) {
    return `${person1Text} In der Haushaltsperspektive ergibt sich eine geschätzte monatliche Gesamtversorgung von ${formatCurrency(
      result.totalEstimatedPension
    )}.`;
  }

  return person1Text;
}

export function getInflationDiagnosis(inflationFactor: number): {
  trafficLight: TrafficLight;
  text: string;
} {
  if (inflationFactor >= 1.6) {
    return {
      trafficLight: "red",
      text: "Die Inflation kann Ihre heutige Kostenstruktur bis zur Rente massiv verändern."
    };
  }

  if (inflationFactor >= 1.2) {
    return {
      trafficLight: "yellow",
      text: "Die Inflation kann Ihre monatlichen Ausgaben bis zur Rente spürbar erhöhen."
    };
  }

  return {
    trafficLight: "yellow",
    text: "Die angenommene Inflation wirkt moderat, hat aber langfristig trotzdem Einfluss auf Ihre Kaufkraft."
  };
}

export function getGapDiagnosis(monthlyGap: number): {
  trafficLight: TrafficLight;
  text: string;
} {
  if (monthlyGap <= 0) {
    return {
      trafficLight: "green",
      text: "Nach dieser vereinfachten Rechnung wäre Ihre geschätzte Versorgung höher als Ihr hochgerechneter monatlicher Bedarf."
    };
  }

  if (monthlyGap <= 500) {
    return {
      trafficLight: "yellow",
      text: "Es entsteht eine moderate monatliche Versorgungslücke."
    };
  }

  if (monthlyGap <= 1500) {
    return {
      trafficLight: "yellow",
      text: "Es entsteht eine deutliche monatliche Versorgungslücke."
    };
  }

  return {
    trafficLight: "red",
    text: "Es entsteht eine erhebliche monatliche Versorgungslücke."
  };
}

export function getPrivatePensionSummary(contractResults: ContractResult[]): {
  trafficLight: TrafficLight;
  text: string;
} {
  if (contractResults.length === 0) {
    return {
      trafficLight: "yellow",
      text: "Sie haben keine privaten Vorsorgeverträge angegeben. Falls Verträge bestehen, können diese später ergänzt und geprüft werden."
    };
  }

  if (contractResults.some((contract) => contract.trafficLight === "red")) {
    return {
      trafficLight: "red",
      text: "Mindestens ein privater Vorsorgevertrag zeigt deutlichen Prüfbedarf."
    };
  }

  if (contractResults.some((contract) => contract.trafficLight === "yellow")) {
    return {
      trafficLight: "yellow",
      text: "Mindestens ein privater Vorsorgevertrag zeigt Punkte, die geprüft werden sollten."
    };
  }

  return {
    trafficLight: "green",
    text: "Die angegebenen privaten Vorsorgeverträge wirken auf Basis Ihrer Angaben zunächst unauffällig."
  };
}

export function getGlobalSummaryText(trafficLight: TrafficLight): string {
  if (trafficLight === "red") {
    return "Ihre Angaben zeigen deutlichen Prüfbedarf. Besonders die Kombination aus Steuerlast, Inflation, möglicher Versorgungslücke und privaten Vorsorgeverträgen sollte genauer betrachtet werden.";
  }

  if (trafficLight === "yellow") {
    return "Ihre Angaben zeigen mehrere Punkte, bei denen eine Prüfung sinnvoll sein kann. Besonders langfristig können Steuerlast, Inflation und Altersversorgung spürbare Auswirkungen haben.";
  }

  return "Ihre Angaben wirken insgesamt relativ stabil. Trotzdem lohnt sich eine regelmäßige Prüfung, weil Steuerlast, Kaufkraft und Vorsorgeverträge sich über die Jahre verändern können.";
}

function getContractTrafficLight(score: number): TrafficLight {
  if (score >= 60) {
    return "red";
  }

  if (score >= 30) {
    return "yellow";
  }

  return "green";
}

function getContractMessage(trafficLight: TrafficLight): string {
  if (trafficLight === "red") {
    return "Dieser Vertrag zeigt deutlichen Prüfbedarf. Das bedeutet nicht automatisch, dass der Vertrag schlecht ist, aber Ihre Angaben sprechen dafür, ihn strukturiert bewerten zu lassen.";
  }

  if (trafficLight === "yellow") {
    return "Dieser Vertrag wirkt nicht eindeutig schlecht, zeigt aber Punkte, die man prüfen sollte.";
  }

  return "Auf Basis Ihrer Angaben wirkt dieser Vertrag zunächst unauffällig. Eine regelmäßige Kontrolle bleibt trotzdem sinnvoll.";
}

function getContractHint(type: ContractType): string {
  if (type === "rentenversicherung") {
    return "Bei Rentenversicherungen sollten Kosten, Garantien, Rentenfaktor, Steuerwirkung und Flexibilität geprüft werden.";
  }

  if (type === "lebensversicherung") {
    return "Bei Lebensversicherungen sollten Sparanteil, Risikoanteil, Garantiezins, Ablaufleistung und Kosten geprüft werden.";
  }

  if (type === "bausparvertrag") {
    return "Bei Bausparverträgen sollten Guthabenzins, Darlehenszins, Abschlussgebühr, Zuteilung und tatsächlicher Finanzierungsbedarf geprüft werden.";
  }

  return "Bei sonstigen Verträgen sollte geprüft werden, ob Ziel, Kosten, Rendite und Flexibilität noch zusammenpassen.";
}

function isPaidTaxClearlyHigher(taxInput: TaxInput, calculatedIncomeTax: number): boolean {
  return (
    typeof taxInput.paidIncomeTax === "number" &&
    taxInput.paidIncomeTax > calculatedIncomeTax * 1.15
  );
}

function formatOptionalCurrency(value: number | undefined): string {
  return typeof value === "number" ? formatCurrency(value) : "Nicht angegeben";
}

function formatOptionalNumber(value: number | undefined): string {
  return typeof value === "number" ? formatNumber(value) : "Nicht angegeben";
}

function safeNumber(value: number): number {
  return Number.isFinite(value) ? value : 0;
}
