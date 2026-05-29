import React, { useMemo, useRef, useState } from "react";
import {
  calculateCheck,
  contractTypeLabels,
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
  getTaxComparisonLight,
  getTaxComparisonText,
  incomeTypeLabels,
  maritalStatusLabels,
  OFFICIAL_TAX_SOURCE_2026,
  RENTEN_SCHAETZUNG_HINWEIS,
  satisfactionLabels,
  trafficLightLabels
} from "./calculations";
import { buildCustomerReportPayload, openCustomerReportPdf } from "./pdfReport";
import type {
  CheckInput,
  CheckResult,
  ContractType,
  IncomeType,
  LeadInput,
  MaritalStatus,
  Satisfaction,
  TrafficLight,
  VorsorgeContractInput,
  ZinsendoktorOptions
} from "./types";

type StepId = 0 | 1 | 2 | 3 | 4 | 5;
type Errors = Record<string, string>;

interface FormState {
  incomeTypes: IncomeType[];
  maritalStatus: MaritalStatus | "";
  taxableIncome: string;
  paidIncomeTax: string;
  monthlyNetIncomePerson1: string;
  yearsToRetirementPerson1: string;
  monthlyNetIncomePerson2: string;
  yearsToRetirementPerson2: string;
  expectedInflationPercent: string;
  currentWarmRent: string;
  currentLivingCosts: string;
  contracts: ContractFormState[];
}

interface ContractFormState {
  id: string;
  name: string;
  type: ContractType;
  typeLabel: string;
  yearsRunning: string;
  currentBalance: string;
  annualContribution: string;
  selfPaid: string;
  satisfaction: Satisfaction;
}

const initialFormState: FormState = {
  incomeTypes: [],
  maritalStatus: "",
  taxableIncome: "",
  paidIncomeTax: "",
  monthlyNetIncomePerson1: "",
  yearsToRetirementPerson1: "",
  monthlyNetIncomePerson2: "",
  yearsToRetirementPerson2: "",
  expectedInflationPercent: "2,5",
  currentWarmRent: "",
  currentLivingCosts: "",
  contracts: []
};

const stepLabels = ["Start", "Steuern", "Rente", "Inflation", "Vorsorge", "Auswertung"];
const retirementYearOptions: Record<string, string> = Object.fromEntries(
  Array.from({ length: 50 }, (_, index) => {
    const value = String(index + 1);
    return [value, value];
  })
);
const inflationRateOptions: Record<string, string> = Object.fromEntries(
  Array.from({ length: 40 }, (_, index) => {
    const value = (index + 1) / 2;
    const optionValue = toDisplayDecimal(value);
    return [optionValue, `${optionValue} %`];
  })
);
const contractYearsRunningOptions: Record<string, string> = Object.fromEntries(
  Array.from({ length: 70 }, (_, index) => {
    const value = String(index + 1);
    return [value, value];
  })
);
const contractTypeInputOptions = Object.fromEntries(
  Object.values(contractTypeLabels).map((label) => [label, label])
);

export function ZinsendoktorWidget({
  options
}: {
  options: ZinsendoktorOptions;
}): React.ReactElement {
  const [step, setStep] = useState<StepId>(0);
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Errors>({});
  const [resultBundle, setResultBundle] = useState<{
    input: CheckInput;
    result: CheckResult;
  } | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const [pdfStatus, setPdfStatus] = useState("");
  const [reportMeta, setReportMeta] = useState({
    customerName: "",
    advisorName: "",
    note: ""
  });
  const resultTextRef = useRef<HTMLTextAreaElement | null>(null);

  const themeStyle = useMemo(
    () =>
      ({
        "--zd-primary": options.theme?.primaryColor,
        "--zd-accent": options.theme?.accentColor,
        "--zd-warning": options.theme?.warningColor,
        "--zd-danger": options.theme?.dangerColor
      }) as React.CSSProperties,
    [options.theme]
  );

  function updateField(field: keyof FormState, value: string): void {
    setFormState((current) => ({
      ...current,
      [field]: value
    }));
  }

  function updateMaritalStatus(value: MaritalStatus): void {
    setFormState((current) => ({
      ...current,
      maritalStatus: value,
      monthlyNetIncomePerson2: value === "verheiratet" ? current.monthlyNetIncomePerson2 : "",
      yearsToRetirementPerson2: value === "verheiratet" ? current.yearsToRetirementPerson2 : ""
    }));
  }

  function toggleIncomeType(type: IncomeType): void {
    setFormState((current) => ({
      ...current,
      incomeTypes: current.incomeTypes.includes(type)
        ? current.incomeTypes.filter((item) => item !== type)
        : [...current.incomeTypes, type]
    }));
  }

  function addContract(): void {
    setFormState((current) => ({
      ...current,
      contracts: [
        ...current.contracts,
        {
          id: createId(),
          name: "",
          type: "rentenversicherung",
          typeLabel: contractTypeLabels.rentenversicherung,
          yearsRunning: "",
          currentBalance: "",
          annualContribution: "",
          selfPaid: "",
          satisfaction: "unsicher"
        }
      ]
    }));
  }

  function updateContract(
    id: string,
    field: keyof ContractFormState,
    value: string | ContractType | Satisfaction
  ): void {
    setFormState((current) => ({
      ...current,
      contracts: current.contracts.map((contract) =>
        contract.id === id ? { ...contract, [field]: value } : contract
      )
    }));
  }

  function removeContract(id: string): void {
    setFormState((current) => ({
      ...current,
      contracts: current.contracts.filter((contract) => contract.id !== id)
    }));
  }

  function goNext(): void {
    const validation = validateStep(formState, step);

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setStep((current) => Math.min(5, current + 1) as StepId);
  }

  function goBack(): void {
    setErrors({});
    setStep((current) => Math.max(0, current - 1) as StepId);
  }

  function showResult(): void {
    const validation = validateAll(formState);

    if (!validation.valid) {
      setErrors(validation.errors);
      setStep(validation.firstInvalidStep);
      return;
    }

    const input = buildCheckInput(formState);
    const result = calculateCheck(input);

    setErrors({});
    setResultBundle({ input, result });
    setStep(5);
    setCopyStatus("");
  }

  async function copyResultText(): Promise<void> {
    if (!resultBundle) {
      return;
    }

    try {
      await navigator.clipboard.writeText(resultBundle.result.generatedText);
      setCopyStatus("Ergebnis wurde kopiert.");
    } catch {
      resultTextRef.current?.focus();
      resultTextRef.current?.select();
      setCopyStatus("Text ist markiert und kann kopiert werden.");
    }
  }

  function createPdfReport(): void {
    if (!resultBundle) {
      return;
    }

    const opened = openCustomerReportPdf(resultBundle.input, resultBundle.result, reportMeta);
    const reportPayload = buildCustomerReportPayload(
      resultBundle.input,
      resultBundle.result,
      reportMeta,
      options.integration?.currentUser
    );

    options.onCustomerReportGenerated?.(reportPayload);

    setPdfStatus(
      opened
        ? "PDF-Ansicht wurde geöffnet. Im Druckdialog bitte „Als PDF speichern“ wählen."
        : "Die PDF-Ansicht konnte nicht geöffnet werden. Bitte Pop-ups für diese Seite erlauben."
    );
  }

  function handleLeadSubmit(lead: LeadInput): void {
    if (resultBundle && options.enableLeadForm && lead.consent) {
      options.onResult?.(resultBundle.result, resultBundle.input, lead);
    }
  }

  function jumpToStep(targetStep: StepId): void {
    if (targetStep === step) {
      return;
    }

    if (targetStep === 5) {
      showResult();
      return;
    }

    setErrors({});
    setStep(targetStep);
  }

  return (
    <div className="zd-widget" style={themeStyle}>
      <div className="zd-shell">
        <header className="zd-header">
          <p className="zd-brand">Zinsendoktor.de</p>
          <h1 className="zd-title">Prüfen Sie Ihre finanzielle Gesundheit</h1>
          <p className="zd-subline">
            Checken Sie kostenlos, anonym und unverbindlich in wenigen Minuten, wie es um Ihre
            Steuerlast, Altersversorgung, Kaufkraft und private Vorsorge steht.
          </p>
        </header>

        <Progress onStepSelect={jumpToStep} step={step} />

        <div className="zd-content">
          {step === 0 && <StartStep onStart={() => setStep(1)} />}
          {step === 1 && (
            <TaxStep
              errors={errors}
              formState={formState}
              onBack={goBack}
              onNext={goNext}
              onToggleIncomeType={toggleIncomeType}
              onUpdateField={updateField}
              onUpdateMaritalStatus={updateMaritalStatus}
            />
          )}
          {step === 2 && (
            <PensionStep
              errors={errors}
              formState={formState}
              onBack={goBack}
              onNext={goNext}
              onUpdateField={updateField}
            />
          )}
          {step === 3 && (
            <InflationStep
              errors={errors}
              formState={formState}
              onBack={goBack}
              onNext={goNext}
              onUpdateField={updateField}
            />
          )}
          {step === 4 && (
            <ContractStep
              errors={errors}
              formState={formState}
              onAddContract={addContract}
              onBack={goBack}
              onRemoveContract={removeContract}
              onShowResult={showResult}
              onUpdateContract={updateContract}
            />
          )}
          {step === 5 && resultBundle && (
            <ResultStep
              copyStatus={copyStatus}
              enableLeadForm={options.enableLeadForm === true}
              input={resultBundle.input}
              onBack={goBack}
              onCopy={copyResultText}
              onCreatePdf={createPdfReport}
              onLeadSubmit={handleLeadSubmit}
              onUpdateReportMeta={setReportMeta}
              pdfStatus={pdfStatus}
              reportMeta={reportMeta}
              result={resultBundle.result}
              textareaRef={resultTextRef}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Progress({
  onStepSelect,
  step
}: {
  onStepSelect: (step: StepId) => void;
  step: StepId;
}): React.ReactElement {
  const width = `${Math.round((step / 5) * 100)}%`;

  return (
    <div className="zd-progress" aria-label="Fortschritt">
      <div className="zd-progress-top">
        <p className="zd-progress-label">{stepLabels[step]}</p>
        <span className="zd-progress-count">Schritt {step} von 5</span>
      </div>
      <div className="zd-progress-track" aria-hidden="true">
        <div className="zd-progress-bar" style={{ width }} />
      </div>
      <nav className="zd-step-list" aria-label="Direkt zu Schritt springen">
        {stepLabels.slice(1).map((label, index) => {
          const targetStep = (index + 1) as StepId;

          return (
            <button
              aria-current={step === targetStep ? "step" : undefined}
              className={`zd-step-item ${step === targetStep ? "zd-step-item-active" : ""}`}
              key={label}
              type="button"
              onClick={() => onStepSelect(targetStep)}
            >
              {label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function StartStep({ onStart }: { onStart: () => void }): React.ReactElement {
  return (
    <section className="zd-card" aria-labelledby="zd-start-title">
      <h2 className="zd-card-title" id="zd-start-title">
        Kostenloser Finanz-Gesundheitscheck
      </h2>
      <p className="zd-card-text">
        Sie beantworten Fragen zu Steuern, Rente, Inflation und privaten Vorsorgeverträgen. Am
        Ende erhalten Sie direkt eine verständliche Auswertung im Browser.
      </p>
      <div className="zd-trust">
        Keine Speicherung Ihrer Angaben. Die Auswertung wird nur in Ihrem Browser erzeugt.
      </div>
      <button className="zd-button zd-button-accent" type="button" onClick={onStart}>
        Jetzt kostenlosen Check starten
      </button>
    </section>
  );
}

function TaxStep({
  errors,
  formState,
  onBack,
  onNext,
  onToggleIncomeType,
  onUpdateField,
  onUpdateMaritalStatus
}: {
  errors: Errors;
  formState: FormState;
  onBack: () => void;
  onNext: () => void;
  onToggleIncomeType: (type: IncomeType) => void;
  onUpdateField: (field: keyof FormState, value: string) => void;
  onUpdateMaritalStatus: (value: MaritalStatus) => void;
}): React.ReactElement {
  return (
    <section className="zd-card" aria-labelledby="zd-tax-title">
      <h2 className="zd-card-title" id="zd-tax-title">
        Steuern und Einkommensarten
      </h2>
      <p className="zd-card-text">
        Die Einkommensteuer wird nach dem offiziellen Einkommensteuertarif 2026 aus § 32a EStG
        berechnet. Der staatliche BMF-Rechner nutzt dieselbe gesetzliche Tarifgrundlage für die
        tarifliche Einkommensteuer nach zu versteuerndem Einkommen.
      </p>

      <div className="zd-tax-layout">
        <fieldset className="zd-fieldset">
          <legend className="zd-legend">Einkommensarten</legend>
          <p className="zd-help">Mehrfachauswahl möglich. Eine Auswahl ist empfohlen.</p>
          <div className="zd-option-list">
            {(Object.keys(incomeTypeLabels) as IncomeType[]).map((type) => (
              <label className="zd-option" key={type}>
                <input
                  checked={formState.incomeTypes.includes(type)}
                  onChange={() => onToggleIncomeType(type)}
                  type="checkbox"
                />
                <span>{incomeTypeLabels[type]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="zd-tax-side">
          <fieldset className="zd-fieldset" aria-describedby={errors.maritalStatus ? "zd-marital-error" : undefined}>
            <legend className="zd-legend">Familienstand</legend>
            <p className="zd-help" aria-hidden="true">&nbsp;</p>
            <div className="zd-option-list">
              {(Object.keys(maritalStatusLabels) as MaritalStatus[]).map((status) => (
                <label className="zd-option" key={status}>
                  <input
                    checked={formState.maritalStatus === status}
                    name="maritalStatus"
                    onChange={() => onUpdateMaritalStatus(status)}
                    type="radio"
                  />
                  <span>{maritalStatusLabels[status]}</span>
                </label>
              ))}
            </div>
            <ErrorMessage error={errors.maritalStatus} id="zd-marital-error" />
          </fieldset>

          <NumberField
            error={errors.taxableIncome}
            id="taxableIncome"
            label="Wie hoch war Ihr letztes zu versteuerndes Einkommen?"
            onChange={(value) => onUpdateField("taxableIncome", value)}
            suffix="€"
            value={formState.taxableIncome}
          />
          <NumberField
            error={errors.paidIncomeTax}
            id="paidIncomeTax"
            label="Wie viel Einkommensteuer haben Sie darauf ungefähr gezahlt?"
            onChange={(value) => onUpdateField("paidIncomeTax", value)}
            optional
            suffix="€"
            value={formState.paidIncomeTax}
          />
        </div>
      </div>

      <StepActions onBack={onBack} onNext={onNext} />
    </section>
  );
}

function PensionStep({
  errors,
  formState,
  onBack,
  onNext,
  onUpdateField
}: {
  errors: Errors;
  formState: FormState;
  onBack: () => void;
  onNext: () => void;
  onUpdateField: (field: keyof FormState, value: string) => void;
}): React.ReactElement {
  const isMarried = formState.maritalStatus === "verheiratet";

  return (
    <section className="zd-card" aria-labelledby="zd-pension-title">
      <h2 className="zd-card-title" id="zd-pension-title">
        Rente und Altersversorgung
      </h2>
      <p className="zd-card-text">
        Die gesetzliche Rente wird als Orientierungsschätzung aus dem heutigen monatlichen
        Nettoeinkommen berechnet. Für eine genaue Beratung sollte später die Renteninformation
        genutzt werden.
      </p>

      <div className="zd-grid zd-grid-two zd-equal-field-grid">
        <NumberField
          error={errors.monthlyNetIncomePerson1}
          id="monthlyNetIncomePerson1"
          label="Aktuelles monatliches Nettoeinkommen Person 1 (circa-Angabe)"
          onChange={(value) => onUpdateField("monthlyNetIncomePerson1", value)}
          value={formState.monthlyNetIncomePerson1}
        />
        <SelectField
          error={errors.yearsToRetirementPerson1}
          id="yearsToRetirementPerson1"
          label="Jahre bis zur Rente Person 1"
          onChange={(value) => onUpdateField("yearsToRetirementPerson1", value)}
          options={retirementYearOptions}
          placeholder="Bitte auswählen"
          value={formState.yearsToRetirementPerson1}
        />
      </div>

      {isMarried && (
        <div className="zd-grid zd-grid-two zd-section zd-equal-field-grid">
          <NumberField
            error={errors.monthlyNetIncomePerson2}
            id="monthlyNetIncomePerson2"
            label="Aktuelles monatliches Nettoeinkommen Person 2 (circa-Angabe)"
            onChange={(value) => onUpdateField("monthlyNetIncomePerson2", value)}
            optional
            value={formState.monthlyNetIncomePerson2}
          />
          <SelectField
            error={errors.yearsToRetirementPerson2}
            id="yearsToRetirementPerson2"
            label="Jahre bis zur Rente Person 2"
            onChange={(value) => onUpdateField("yearsToRetirementPerson2", value)}
            optional
            options={retirementYearOptions}
            placeholder="Keine Angabe"
            value={formState.yearsToRetirementPerson2}
          />
        </div>
      )}

      <StepActions onBack={onBack} onNext={onNext} />
    </section>
  );
}

function InflationStep({
  errors,
  formState,
  onBack,
  onNext,
  onUpdateField
}: {
  errors: Errors;
  formState: FormState;
  onBack: () => void;
  onNext: () => void;
  onUpdateField: (field: keyof FormState, value: string) => void;
}): React.ReactElement {
  return (
    <section className="zd-card" aria-labelledby="zd-inflation-title">
      <h2 className="zd-card-title" id="zd-inflation-title">
        Inflation, Kaufkraft und Bedarf
      </h2>
      <p className="zd-card-text">
        Die Rechnung zeigt, wie sich heutige Kosten bis zur Rente verändern können.
      </p>

      <div className="zd-grid zd-grid-two zd-equal-field-grid">
        <NumberField
          error={errors.currentWarmRent}
          id="currentWarmRent"
          label="Aktuelle monatliche Warmmiete in EUR"
          onChange={(value) => onUpdateField("currentWarmRent", value)}
          value={formState.currentWarmRent}
        />
        <SelectField
          error={errors.expectedInflationPercent}
          id="expectedInflationPercent"
          label="Erwartete jährliche Inflationsrate in Prozent"
          onChange={(value) => onUpdateField("expectedInflationPercent", value)}
          options={inflationRateOptions}
          placeholder="Bitte auswählen"
          value={formState.expectedInflationPercent}
        />
        <NumberField
          error={errors.currentLivingCosts}
          help="Gemeint sind Essen, Mobilität, Energie, Versicherungen, Alltag, Freizeit usw."
          id="currentLivingCosts"
          label="Aktuelle monatliche Lebenshaltungskosten in EUR"
          onChange={(value) => onUpdateField("currentLivingCosts", value)}
          value={formState.currentLivingCosts}
        />
      </div>

      <StepActions onBack={onBack} onNext={onNext} />
    </section>
  );
}

function ContractStep({
  errors,
  formState,
  onAddContract,
  onBack,
  onRemoveContract,
  onShowResult,
  onUpdateContract
}: {
  errors: Errors;
  formState: FormState;
  onAddContract: () => void;
  onBack: () => void;
  onRemoveContract: (id: string) => void;
  onShowResult: () => void;
  onUpdateContract: (
    id: string,
    field: keyof ContractFormState,
    value: string | ContractType | Satisfaction
  ) => void;
}): React.ReactElement {
  function renameContract(contract: ContractFormState, index: number): void {
    const currentName = getContractDisplayName(contract, index);
    const nextName = window.prompt("Vertragsnamen ändern", currentName);

    if (nextName === null) {
      return;
    }

    onUpdateContract(contract.id, "name", nextName.trim());
  }

  return (
    <section className="zd-card" aria-labelledby="zd-contract-title">
      <h2 className="zd-card-title" id="zd-contract-title">
        Private Vorsorgeverträge
      </h2>
      <p className="zd-card-text">
        Wenn Sie noch keine Vorsorgeverträge oder Sparverträge haben, können Sie direkt auf{" "}
        <button className="zd-inline-action" type="button" onClick={onShowResult}>
          Auswertung anzeigen
        </button>{" "}
        klicken. Anderenfalls klicken Sie auf <em>Vertrag hinzufügen</em>.
      </p>

      <button className="zd-button zd-button-secondary" type="button" onClick={onAddContract}>
        Vertrag hinzufügen
      </button>

      {formState.contracts.length === 0 && (
        <div className="zd-alert zd-alert-yellow">
          Sie haben keine privaten Vorsorgeverträge angegeben. Falls Verträge bestehen, können
          diese später ergänzt und geprüft werden.
        </div>
      )}

      <div className="zd-contract-list">
        {formState.contracts.map((contract, index) => {
          const contractDisplayName = getContractDisplayName(contract, index);

          return (
            <div className="zd-contract-row" key={contract.id}>
            <div className="zd-contract-head">
              <div className="zd-contract-title-wrap">
                <p className="zd-contract-title">{contractDisplayName}</p>
                <button
                  aria-label="Vertragsnamen ändern"
                  className="zd-icon-button"
                  title="Vertragsnamen ändern"
                  type="button"
                  onClick={() => renameContract(contract, index)}
                >
                  ✎
                </button>
              </div>
              <button
                className="zd-button zd-button-danger"
                type="button"
                onClick={() => onRemoveContract(contract.id)}
              >
                Entfernen
              </button>
            </div>

            <div className="zd-contract-fields">
              <DatalistField
                id={`${contract.id}-type`}
                label="Vertragsart"
                onChange={(value) => {
                  onUpdateContract(contract.id, "typeLabel", value);
                  onUpdateContract(contract.id, "type", resolveContractType(value));
                }}
                options={contractTypeInputOptions}
                placeholder="Auswählen oder selbst eintragen"
                value={contract.typeLabel}
              />
              <SelectField
                error={errors[`${contract.id}.yearsRunning`]}
                id={`${contract.id}-yearsRunning`}
                label="Wieviel Jahre läuft der Vertrag bereits?"
                onChange={(value) => onUpdateContract(contract.id, "yearsRunning", value)}
                options={contractYearsRunningOptions}
                placeholder="Bitte auswählen"
                value={contract.yearsRunning}
              />
              <NumberField
                error={errors[`${contract.id}.currentBalance`]}
                id={`${contract.id}-currentBalance`}
                label="Wie hoch ist der aktuelle Rückkaufswert bzw. das Guthaben des Vertrages?"
                onChange={(value) => onUpdateContract(contract.id, "currentBalance", value)}
                value={contract.currentBalance}
              />
              <NumberField
                error={errors[`${contract.id}.selfPaid`]}
                id={`${contract.id}-selfPaid`}
                label="Davon haben Sie selbst einbezahlt:"
                onChange={(value) => onUpdateContract(contract.id, "selfPaid", value)}
                value={contract.selfPaid}
              />
              <NumberField
                error={errors[`${contract.id}.annualContribution`]}
                id={`${contract.id}-annualContribution`}
                label="Wie hoch ist der Jahresbeitrag?"
                onChange={(value) => onUpdateContract(contract.id, "annualContribution", value)}
                value={contract.annualContribution}
              />
              <SelectField
                id={`${contract.id}-satisfaction`}
                label="Erfüllt der Vertrag Ihre Erwartungen?"
                onChange={(value) =>
                  onUpdateContract(contract.id, "satisfaction", value as Satisfaction)
                }
                options={satisfactionLabels}
                value={contract.satisfaction}
              />
            </div>
          </div>
          );
        })}
      </div>

      <div className="zd-step-actions">
        <button className="zd-button zd-button-secondary" type="button" onClick={onBack}>
          Zurück
        </button>
        <button className="zd-button zd-button-accent" type="button" onClick={onShowResult}>
          Auswertung anzeigen
        </button>
      </div>
    </section>
  );
}

function ResultStep({
  copyStatus,
  enableLeadForm,
  input,
  onBack,
  onCopy,
  onCreatePdf,
  onLeadSubmit,
  onUpdateReportMeta,
  pdfStatus,
  reportMeta,
  result,
  textareaRef
}: {
  copyStatus: string;
  enableLeadForm: boolean;
  input: CheckInput;
  onBack: () => void;
  onCopy: () => void;
  onCreatePdf: () => void;
  onLeadSubmit: (lead: LeadInput) => void;
  onUpdateReportMeta: (meta: { customerName: string; advisorName: string; note: string }) => void;
  pdfStatus: string;
  reportMeta: { customerName: string; advisorName: string; note: string };
  result: CheckResult;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}): React.ReactElement {
  const taxComparisonLight = getTaxComparisonLight(input.tax, result.calculatedIncomeTax);
  const inflationDiagnosis = getInflationDiagnosis(result.inflationFactor);
  const gapDiagnosis = getGapDiagnosis(result.monthlyGap);
  const privatePensionSummary = getPrivatePensionSummary(result.contractResults);

  return (
    <section className="zd-card" aria-labelledby="zd-result-title">
      <h2 className="zd-card-title" id="zd-result-title">
        Ihre Finanz-Diagnose
      </h2>
      <p className="zd-card-text">
        Die Auswertung ist eine vereinfachte Orientierung und ersetzt keine individuelle Steuer-,
        Renten- oder Vertragsberatung.
      </p>

      <div className={`zd-alert zd-alert-${result.globalTrafficLight}`}>
        <TrafficBadge value={result.globalTrafficLight} /> {getGlobalSummaryText(result.globalTrafficLight)}
      </div>

      <div className="zd-summary-grid">
        <Metric label="Prüfscore" value={`${formatNumber(result.globalScore)} / 100`} />
        <Metric label="Rechnerische Einkommensteuer 2026" value={formatCurrency(result.calculatedIncomeTax)} />
        <Metric label="Mögliche monatliche Lücke" value={formatCurrency(Math.max(0, result.monthlyGap))} />
      </div>

      <div className="zd-pdf-cta">
        <div>
          <h3 className="zd-pdf-cta-title">PDF für den Kunden sichern</h3>
          <p className="zd-pdf-cta-text">
            Erstellt eine übersichtliche PDF-/Druckansicht für das Kundengespräch.
          </p>
        </div>
        <button className="zd-button zd-button-accent" type="button" onClick={onCreatePdf}>
          PDF herunterladen / speichern
        </button>
      </div>
      {pdfStatus && <p className="zd-copy-status">{pdfStatus}</p>}

      <ResultSection title="Steuerdiagnose">
        <p>{getIncomeTypesDiagnosis(result.incomeTypeCount)}</p>
        <p>
          Rechnerische Einkommensteuer 2026: <strong>{formatCurrency(result.calculatedIncomeTax)}</strong>.
          Geschätzte Steuerlast bis Rentenbeginn:{" "}
          <strong>{formatCurrency(result.estimatedTaxUntilRetirement)}</strong>.
        </p>
        <p className="zd-small">
          Berechnungsgrundlage: {OFFICIAL_TAX_SOURCE_2026.label}.{" "}
          {OFFICIAL_TAX_SOURCE_2026.scope}
        </p>
        <div className={`zd-alert zd-alert-${taxComparisonLight}`}>
          {getTaxComparisonText(input.tax, result.calculatedIncomeTax)}
        </div>
        <p>
          Bis zum Rentenbeginn kann aus der jährlichen Steuerlast ein erheblicher Betrag entstehen.
          Die Projektion nutzt modellhaft den 2026-Tarif und die angegebene Inflation.
        </p>
      </ResultSection>

      <ResultSection title="Rentendiagnose">
        <div className="zd-result-grid">
          <Metric label="Versorgung Person 1" value={formatCurrency(result.estimatedPensionPerson1)} />
          <Metric label="Geschätzte Gesamtversorgung" value={formatCurrency(result.totalEstimatedPension)} />
        </div>
        <p>{getPensionDiagnosis(input, result)}</p>
        <p className="zd-small">
          {RENTEN_SCHAETZUNG_HINWEIS} Die tatsächliche Rente kann abweichen.
        </p>
      </ResultSection>

      <ResultSection title="Inflationsdiagnose">
        <div className="zd-result-grid">
          <Metric label="Analysezeitraum" value={`${formatNumber(result.analysisYears)} Jahre`} />
          <Metric label="Inflationsfaktor" value={formatNumber(result.inflationFactor)} />
          <Metric label="Hochgerechnete Warmmiete" value={formatCurrency(result.futureRent)} />
          <Metric label="Hochgerechnete Lebenshaltung" value={formatCurrency(result.futureLivingCosts)} />
        </div>
        <div className={`zd-alert zd-alert-${inflationDiagnosis.trafficLight}`}>
          {inflationDiagnosis.text} Bei {formatPercent(input.inflation.expectedInflationPercent)} Inflation über{" "}
          {formatNumber(result.analysisYears)} Jahre werden heutige Kosten ungefähr mit Faktor{" "}
          {formatNumber(result.inflationFactor)} hochgerechnet.
        </div>
      </ResultSection>

      <ResultSection title="Private-Vorsorge-Diagnose">
        <div className={`zd-alert zd-alert-${privatePensionSummary.trafficLight}`}>
          {privatePensionSummary.text}
        </div>
        {input.contracts.length > 0 && (
          <div className="zd-contract-list">
            {input.contracts.map((contract, index) => {
              const contractResult = result.contractResults.find((item) => item.id === contract.id);
              const contractDisplayName = getContractDisplayName(contract, index);

              if (!contractResult) {
                return null;
              }

              return (
                <div className="zd-contract-row" key={contract.id}>
                  <div className="zd-contract-head">
                    <p className="zd-contract-title">
                      {contractDisplayName}: {getContractTypeLabel(contract)}
                    </p>
                    <TrafficBadge value={contractResult.trafficLight} />
                  </div>
                  <p>{contractResult.message}</p>
                  <p>{contractResult.hint}</p>
                  <p className="zd-small">
                    Selbst eingezahlt: {formatCurrency(contractResult.totalPaid)}. Aktuelles
                    Guthaben/Rückkaufswert: {formatCurrency(contract.currentBalance)}.
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </ResultSection>

      <ResultSection title="Gesamtbedarf vs. Gesamtversorgung">
        <div className="zd-result-grid">
          <Metric label="Geschätzte Versorgung" value={formatCurrency(result.totalEstimatedPension)} />
          <Metric label="Zukünftiger Monatsbedarf" value={formatCurrency(result.futureTotalNeed)} />
          <Metric label="Monatliche Lücke" value={formatCurrency(Math.max(0, result.monthlyGap))} />
        </div>
        <div className={`zd-alert zd-alert-${gapDiagnosis.trafficLight}`}>{gapDiagnosis.text}</div>
      </ResultSection>

      <ResultSection title="Prüfbedarf-Ampel">
        <p>
          <TrafficBadge value={result.globalTrafficLight} /> Prüfscore {formatNumber(result.globalScore)} / 100
        </p>
      </ResultSection>

      <ResultSection title="PDF-Kundenbericht">
        <p className="zd-card-text">
          Erstellen Sie einen übersichtlichen Bericht für das Kundengespräch. Die PDF-Ansicht wird
          nur lokal im Browser erzeugt; es werden keine Daten gespeichert oder übertragen.
        </p>
        <div className="zd-grid zd-grid-two">
          <TextField
            id="report-customer-name"
            label="Kundenname optional"
            onChange={(value) =>
              onUpdateReportMeta({
                ...reportMeta,
                customerName: value
              })
            }
            value={reportMeta.customerName}
          />
          <TextField
            id="report-advisor-name"
            label="Beratername optional"
            onChange={(value) =>
              onUpdateReportMeta({
                ...reportMeta,
                advisorName: value
              })
            }
            value={reportMeta.advisorName}
          />
        </div>
        <div className="zd-field zd-pdf-note-field">
          <label className="zd-label" htmlFor="report-note">
            Notiz für den Bericht optional
          </label>
          <textarea
            className="zd-input zd-pdf-note"
            id="report-note"
            onChange={(event) =>
              onUpdateReportMeta({
                ...reportMeta,
                note: event.target.value
              })
            }
            value={reportMeta.note}
          />
        </div>
        <div className="zd-button-row">
          <button className="zd-button zd-button-accent" type="button" onClick={onCreatePdf}>
            PDF herunterladen / speichern
          </button>
        </div>
        {pdfStatus && <p className="zd-copy-status">{pdfStatus}</p>}
      </ResultSection>

      <ResultSection title="Kopierbarer Ergebnistext">
        <textarea
          className="zd-textarea"
          readOnly
          ref={textareaRef}
          value={result.generatedText}
        />
        <div className="zd-button-row">
          <button className="zd-button zd-button-accent" type="button" onClick={onCopy}>
            Ergebnis kopieren
          </button>
        </div>
        {copyStatus && <p className="zd-copy-status">{copyStatus}</p>}
      </ResultSection>

      {enableLeadForm && <LeadPanel onSubmit={onLeadSubmit} />}

      <div className="zd-step-actions">
        <button className="zd-button zd-button-secondary" type="button" onClick={onBack}>
          Zurück
        </button>
      </div>
    </section>
  );
}

function ResultSection({
  children,
  title
}: {
  children: React.ReactNode;
  title: string;
}): React.ReactElement {
  return (
    <div className="zd-section">
      <h3 className="zd-section-title">{title}</h3>
      {children}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div className="zd-metric">
      <p className="zd-metric-label">{label}</p>
      <p className="zd-metric-value">{value}</p>
    </div>
  );
}

function TrafficBadge({ value }: { value: TrafficLight }): React.ReactElement {
  return <span className={`zd-badge zd-badge-${value}`}>{trafficLightLabels[value]}</span>;
}

function StepActions({
  onBack,
  onNext
}: {
  onBack: () => void;
  onNext: () => void;
}): React.ReactElement {
  return (
    <div className="zd-step-actions">
      <button className="zd-button zd-button-secondary" type="button" onClick={onBack}>
        Zurück
      </button>
      <button className="zd-button zd-button-accent" type="button" onClick={onNext}>
        Weiter
      </button>
    </div>
  );
}

function NumberField({
  error,
  help,
  id,
  label,
  onChange,
  optional = false,
  suffix,
  value
}: {
  error?: string;
  help?: string;
  id: string;
  label: string;
  onChange: (value: string) => void;
  optional?: boolean;
  suffix?: string;
  value: string;
}): React.ReactElement {
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  const describedBy = [help ? helpId : "", error ? errorId : ""].filter(Boolean).join(" ");

  return (
    <div className="zd-field">
      <label className="zd-label" htmlFor={id}>
        {label} {optional && <span className="zd-small">(optional)</span>}
      </label>
      <div className={suffix ? "zd-input-wrap" : undefined}>
        <input
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? "true" : "false"}
          className={`zd-input${suffix ? " zd-input-has-suffix" : ""}`}
          id={id}
          inputMode="decimal"
          onChange={(event) => onChange(event.target.value)}
          type="text"
          value={value}
        />
        {suffix && <span className="zd-input-suffix">{suffix}</span>}
      </div>
      {help && (
        <p className="zd-help" id={helpId}>
          {help}
        </p>
      )}
      <ErrorMessage error={error} id={errorId} />
    </div>
  );
}

function SelectField({
  error,
  id,
  label,
  onChange,
  optional = false,
  options,
  placeholder,
  value
}: {
  error?: string;
  id: string;
  label: string;
  onChange: (value: string) => void;
  optional?: boolean;
  options: Record<string, string>;
  placeholder?: string;
  value: string;
}): React.ReactElement {
  const errorId = `${id}-error`;

  return (
    <div className="zd-field">
      <label className="zd-label" htmlFor={id}>
        {label} {optional && <span className="zd-small">(optional)</span>}
      </label>
      <select
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? "true" : "false"}
        className="zd-select"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {Object.entries(options).map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
      <ErrorMessage error={error} id={errorId} />
    </div>
  );
}

function DatalistField({
  error,
  id,
  label,
  onChange,
  options,
  placeholder,
  value
}: {
  error?: string;
  id: string;
  label: string;
  onChange: (value: string) => void;
  options: Record<string, string>;
  placeholder?: string;
  value: string;
}): React.ReactElement {
  const errorId = `${id}-error`;
  const listId = `${id}-options`;

  return (
    <div className="zd-field">
      <label className="zd-label" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? "true" : "false"}
        className="zd-input"
        id={id}
        list={listId}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="text"
        value={value}
      />
      <datalist id={listId}>
        {Object.entries(options).map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionLabel} />
        ))}
      </datalist>
      <ErrorMessage error={error} id={errorId} />
    </div>
  );
}

function ErrorMessage({ error, id }: { error?: string; id: string }): React.ReactElement | null {
  if (!error) {
    return null;
  }

  return (
    <p className="zd-error" id={id}>
      {error}
    </p>
  );
}

function LeadPanel({ onSubmit }: { onSubmit: (lead: LeadInput) => void }): React.ReactElement {
  const [lead, setLead] = useState<LeadInput>({
    name: "",
    email: "",
    phone: "",
    message: "",
    consent: false
  });
  const [message, setMessage] = useState("");

  function submit(): void {
    if (!lead.name.trim() || !lead.email.trim() || !lead.consent) {
      setMessage("Bitte geben Sie Name, E-Mail und Einwilligung an.");
      return;
    }

    onSubmit(lead);
    setMessage("Ihre Angaben sind lokal vorbereitet. Eine externe Übermittlung ist im MVP nicht aktiv.");
  }

  return (
    <div className="zd-lead-panel">
      <h3 className="zd-section-title">Sie möchten Ihre Auswertung prüfen lassen?</h3>
      <div className="zd-grid zd-grid-two">
        <TextField
          id="lead-name"
          label="Name"
          onChange={(value) => setLead((current) => ({ ...current, name: value }))}
          value={lead.name}
        />
        <TextField
          id="lead-email"
          label="E-Mail"
          onChange={(value) => setLead((current) => ({ ...current, email: value }))}
          value={lead.email}
        />
        <TextField
          id="lead-phone"
          label="Telefon optional"
          onChange={(value) => setLead((current) => ({ ...current, phone: value }))}
          value={lead.phone ?? ""}
        />
        <TextField
          id="lead-message"
          label="Nachricht optional"
          onChange={(value) => setLead((current) => ({ ...current, message: value }))}
          value={lead.message ?? ""}
        />
      </div>
      <label className="zd-option">
        <input
          checked={lead.consent}
          onChange={(event) =>
            setLead((current) => ({ ...current, consent: event.target.checked }))
          }
          type="checkbox"
        />
        <span>Ich willige ein, dass meine Angaben zur Prüfung der Auswertung genutzt werden.</span>
      </label>
      <button className="zd-button zd-button-accent" type="button" onClick={submit}>
        Auswertung prüfen lassen
      </button>
      {message && <p className="zd-small">{message}</p>}
    </div>
  );
}

function TextField({
  id,
  label,
  onChange,
  value
}: {
  id: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}): React.ReactElement {
  return (
    <div className="zd-field">
      <label className="zd-label" htmlFor={id}>
        {label}
      </label>
      <input
        className="zd-input"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        type="text"
        value={value}
      />
    </div>
  );
}

function validateAll(formState: FormState): { valid: true } | { valid: false; errors: Errors; firstInvalidStep: StepId } {
  const steps: StepId[] = [1, 2, 3, 4];

  for (const currentStep of steps) {
    const validation = validateStep(formState, currentStep);

    if (!validation.valid) {
      return {
        valid: false,
        errors: validation.errors,
        firstInvalidStep: currentStep
      };
    }
  }

  return { valid: true };
}

function validateStep(formState: FormState, step: StepId): { valid: true } | { valid: false; errors: Errors } {
  const errors: Errors = {};

  if (step === 1) {
    if (!formState.maritalStatus) {
      errors.maritalStatus = "Bitte wählen Sie eine Option aus.";
    }

    requireNumber(errors, "taxableIncome", formState.taxableIncome, { min: 0 });
    optionalNumber(errors, "paidIncomeTax", formState.paidIncomeTax, { min: 0 });
  }

  if (step === 2) {
    requireNumber(errors, "monthlyNetIncomePerson1", formState.monthlyNetIncomePerson1, { min: 0 });
    requireNumber(errors, "yearsToRetirementPerson1", formState.yearsToRetirementPerson1, {
      min: 1,
      max: 50
    });

    if (formState.maritalStatus === "verheiratet") {
      optionalNumber(errors, "monthlyNetIncomePerson2", formState.monthlyNetIncomePerson2, {
        min: 0
      });
      optionalNumber(errors, "yearsToRetirementPerson2", formState.yearsToRetirementPerson2, {
        min: 1,
        max: 50
      });
    }
  }

  if (step === 3) {
    requireNumber(errors, "expectedInflationPercent", formState.expectedInflationPercent, {
      min: 0.5,
      max: 20
    });
    requireNumber(errors, "currentWarmRent", formState.currentWarmRent, { min: 0 });
    requireNumber(errors, "currentLivingCosts", formState.currentLivingCosts, { min: 0 });
  }

  if (step === 4) {
    formState.contracts.forEach((contract) => {
      requireNumber(errors, `${contract.id}.yearsRunning`, contract.yearsRunning, {
        min: 1,
        max: 70
      });
      requireNumber(errors, `${contract.id}.currentBalance`, contract.currentBalance, {
        min: 0
      });
      requireNumber(errors, `${contract.id}.selfPaid`, contract.selfPaid, {
        min: 0
      });
      requireNumber(errors, `${contract.id}.annualContribution`, contract.annualContribution, {
        min: 0
      });
    });
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}

function getContractDisplayName(contract: { name?: string }, index: number): string {
  return contract.name?.trim() || `Vertrag ${index + 1}`;
}

function resolveContractType(value: string): ContractType {
  const normalizedValue = normalizeContractTypeLabel(value);
  const knownType = Object.entries(contractTypeLabels).find(
    ([, label]) => normalizeContractTypeLabel(label) === normalizedValue
  )?.[0];

  return (knownType as ContractType | undefined) ?? "sonstiges";
}

function normalizeContractTypeLabel(value: string): string {
  return value.trim().toLocaleLowerCase("de-DE");
}

function buildCheckInput(formState: FormState): CheckInput {
  const contracts: VorsorgeContractInput[] = formState.contracts.map((contract) => ({
    id: contract.id,
    name: contract.name.trim() || undefined,
    type: contract.type,
    typeLabel: contract.typeLabel.trim() || undefined,
    yearsRunning: toNumber(contract.yearsRunning),
    currentBalance: toNumber(contract.currentBalance),
    annualContribution: toNumber(contract.annualContribution),
    selfPaid: toNumber(contract.selfPaid),
    satisfaction: contract.satisfaction
  }));

  return {
    tax: {
      incomeTypes: formState.incomeTypes,
      maritalStatus: formState.maritalStatus || "ledig",
      taxableIncome: toNumber(formState.taxableIncome),
      paidIncomeTax:
        formState.paidIncomeTax.trim() === "" ? undefined : toNumber(formState.paidIncomeTax)
    },
    pension: {
      monthlyNetIncomePerson1: toNumber(formState.monthlyNetIncomePerson1),
      yearsToRetirementPerson1: toNumber(formState.yearsToRetirementPerson1),
      monthlyNetIncomePerson2:
        formState.maritalStatus === "verheiratet" && formState.monthlyNetIncomePerson2.trim() !== ""
          ? toNumber(formState.monthlyNetIncomePerson2)
          : undefined,
      yearsToRetirementPerson2:
        formState.maritalStatus === "verheiratet" && formState.yearsToRetirementPerson2.trim() !== ""
          ? toNumber(formState.yearsToRetirementPerson2)
          : undefined
    },
    inflation: {
      expectedInflationPercent: toNumber(formState.expectedInflationPercent),
      currentWarmRent: toNumber(formState.currentWarmRent),
      currentLivingCosts: toNumber(formState.currentLivingCosts)
    },
    contracts
  };
}

function requireNumber(
  errors: Errors,
  field: string,
  value: string,
  range: { min?: number; max?: number }
): void {
  if (value.trim() === "") {
    errors[field] = "Bitte geben Sie einen gültigen Betrag ein.";
    return;
  }

  validateNumber(errors, field, value, range);
}

function optionalNumber(
  errors: Errors,
  field: string,
  value: string,
  range: { min?: number; max?: number }
): void {
  if (value.trim() === "") {
    return;
  }

  validateNumber(errors, field, value, range);
}

function validateNumber(
  errors: Errors,
  field: string,
  value: string,
  range: { min?: number; max?: number }
): void {
  const number = toNumber(value);

  if (!Number.isFinite(number)) {
    errors[field] = "Bitte geben Sie einen gültigen Betrag ein.";
    return;
  }

  if (typeof range.min === "number" && number < range.min) {
    errors[field] = "Bitte geben Sie eine Zahl größer oder gleich 0 ein.";
    return;
  }

  if (typeof range.max === "number" && number > range.max) {
    errors[field] = `Bitte geben Sie eine Zahl bis maximal ${formatNumber(range.max)} ein.`;
  }
}

function toNumber(value: string): number {
  const trimmed = value.trim().replace(/\s/g, "");

  if (!trimmed) {
    return Number.NaN;
  }

  const normalized = trimmed.includes(",")
    ? trimmed.replace(/\./g, "").replace(",", ".")
    : trimmed;

  return Number(normalized);
}

function toDisplayDecimal(value: number): string {
  return value.toFixed(1).replace(".", ",");
}

function createId(): string {
  return `zd-contract-${Date.now()}-${Math.round(Math.random() * 100000)}`;
}
