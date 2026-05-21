import { describe, expect, it } from "vitest";
import { calculateCheck, calculateIncomeTax2026, evaluateContract } from "./calculations";
import type { CheckInput, VorsorgeContractInput } from "./types";

describe("Finanz-Gesundheitscheck calculations", () => {
  it("calculates the 2026 income tax formula for a single person", () => {
    expect(calculateIncomeTax2026(50000, "ledig")).toBe(10548);
  });

  it("matches the expected orientation values for test case 1", () => {
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

    expect(result.calculatedIncomeTax).toBe(10548);
    expect(result.estimatedTax10Years).toBe(105480);
    expect(result.estimatedPensionPerson1).toBeCloseTo(1768, 2);
    expect(result.futureRent).toBeCloseTo(1887.81, 1);
    expect(result.futureLivingCosts).toBeCloseTo(2726.84, 1);
    expect(result.futureTotalNeed).toBeCloseTo(4614.65, 1);
    expect(result.monthlyGap).toBeCloseTo(2846.65, 1);
    expect(result.globalTrafficLight).toBe("red");
  });

  it("uses splitting tax and the longer household horizon for married users", () => {
    const input: CheckInput = {
      tax: {
        incomeTypes: ["nichtselbststaendig", "kapital"],
        maritalStatus: "verheiratet",
        taxableIncome: 80000,
        paidIncomeTax: 14000
      },
      pension: {
        monthlyNetIncomePerson1: 3000,
        monthlyNetIncomePerson2: 1800,
        yearsToRetirementPerson1: 20,
        yearsToRetirementPerson2: 25
      },
      inflation: {
        expectedInflationPercent: 2.5,
        currentWarmRent: 1200,
        currentLivingCosts: 2000
      },
      contracts: [
        {
          id: "contract-1",
          type: "rentenversicherung",
          yearsRunning: 8,
          currentBalance: 12000,
          annualContribution: 1800,
          satisfaction: "unsicher"
        }
      ]
    };

    const result = calculateCheck(input);

    expect(result.calculatedIncomeTax).toBe(calculateIncomeTax2026(40000, "ledig") * 2);
    expect(result.analysisYears).toBe(25);
    expect(result.estimatedPensionPerson2).toBeCloseTo(1224, 2);
    expect(result.contractResults[0].trafficLight).toBe("red");
  });

  it("evaluates contract risk by satisfaction and value ratio", () => {
    const contract: VorsorgeContractInput = {
      id: "contract-1",
      type: "rentenversicherung",
      yearsRunning: 8,
      currentBalance: 12000,
      annualContribution: 1800,
      satisfaction: "unsicher"
    };

    const result = evaluateContract(contract);

    expect(result.totalPaid).toBe(14400);
    expect(result.valueRatio).toBeCloseTo(0.8333, 3);
    expect(result.score).toBe(60);
    expect(result.trafficLight).toBe("red");
  });
});
