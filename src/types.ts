export type IncomeType =
  | "land_forst"
  | "gewerbe"
  | "selbststaendig"
  | "nichtselbststaendig"
  | "kapital"
  | "vermietung"
  | "sonstige";

export type MaritalStatus = "ledig" | "verheiratet";

export type ContractType =
  | "rentenversicherung"
  | "lebensversicherung"
  | "bausparvertrag"
  | "sonstiges";

export type Satisfaction = "zufrieden" | "unzufrieden" | "unsicher";

export type TrafficLight = "green" | "yellow" | "red";

export type DashboardContractStatus = "running" | "open" | "failed";

export type IntegrationProvider = "odoo" | "custom";

export interface TaxInput {
  incomeTypes: IncomeType[];
  maritalStatus: MaritalStatus;
  taxableIncome: number;
  paidIncomeTax?: number;
}

export interface PensionInput {
  monthlyNetIncomePerson1: number;
  yearsToRetirementPerson1: number;
  monthlyNetIncomePerson2?: number;
  yearsToRetirementPerson2?: number;
}

export interface InflationInput {
  expectedInflationPercent: number;
  currentWarmRent: number;
  currentLivingCosts: number;
}

export interface VorsorgeContractInput {
  id: string;
  name?: string;
  type: ContractType;
  typeLabel?: string;
  yearsRunning: number;
  currentBalance: number;
  annualContribution: number;
  selfPaid?: number;
  satisfaction: Satisfaction;
}

export interface CheckInput {
  tax: TaxInput;
  pension: PensionInput;
  inflation: InflationInput;
  contracts: VorsorgeContractInput[];
}

export interface CheckResult {
  calculatedIncomeTax: number;
  estimatedTaxUntilRetirement: number;
  incomeTypeCount: number;
  estimatedPensionPerson1: number;
  estimatedPensionPerson2: number;
  totalEstimatedPension: number;
  analysisYears: number;
  inflationFactor: number;
  futureRent: number;
  futureLivingCosts: number;
  futureTotalNeed: number;
  monthlyGap: number;
  contractResults: ContractResult[];
  globalScore: number;
  globalTrafficLight: TrafficLight;
  generatedText: string;
}

export interface ContractResult {
  id: string;
  totalPaid: number;
  valueRatio: number | null;
  score: number;
  trafficLight: TrafficLight;
  message: string;
  hint: string;
}

export interface LeadInput {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  consent: boolean;
}

export interface AuthenticatedUserContext {
  id: string;
  name?: string;
  email?: string;
  role?: "sales" | "admin" | "advisor";
}

export interface CustomerReportPayload {
  source: "zinsendoktor-check";
  version: string;
  generatedAt: string;
  input: CheckInput;
  result: CheckResult;
  reportHtml: string;
  reportText: string;
  customer?: {
    name?: string;
  };
  advisor?: {
    name?: string;
    userId?: string;
    email?: string;
  };
  note?: string;
}

export interface FutureOdooIntegrationOptions {
  provider?: IntegrationProvider;
  enabled?: false;
  currentUser?: AuthenticatedUserContext;
  endpoints?: {
    saveReport?: string;
    saveContract?: string;
    listContracts?: string;
  };
  odooModels?: {
    report?: string;
    contract?: string;
    attachment?: "ir.attachment";
  };
}

export interface ZinsendoktorTheme {
  primaryColor?: string;
  accentColor?: string;
  warningColor?: string;
  dangerColor?: string;
}

export interface ZinsendoktorOptions {
  mode?: "anonymous" | "lead";
  enableLeadForm?: boolean;
  storage?: false;
  integration?: FutureOdooIntegrationOptions;
  theme?: ZinsendoktorTheme;
  onResult?: ((result: CheckResult, input: CheckInput, lead?: LeadInput) => void) | null;
  onCustomerReportGenerated?: ((payload: CustomerReportPayload) => void) | null;
  useShadowDom?: boolean;
}

export interface ZinsendoktorMountInstance {
  unmount: () => void;
}

declare global {
  interface Window {
    ZinsendoktorCheck?: {
      mount: (
        selectorOrElement: string | Element,
        options?: ZinsendoktorOptions
      ) => ZinsendoktorMountInstance;
    };
  }
}
