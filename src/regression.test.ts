import { describe, expect, it } from "vitest";
import pdfReportSource from "./pdfReport.ts?raw";
import widgetSource from "./widget.tsx?raw";

const legacyPdfFragments = [
  "final-report-panel",
  "final-report-title",
  "PDF-Kundenbericht",
  "Kopierbarer Ergebnistext",
  "Kundenname optional",
  "Beratername optional",
  "Notiz für den Bericht optional",
  "PDF-Ansicht wird nur lokal im Browser erzeugt"
];

const legacyResultPageFragments = [
  "PDF-Kundenbericht",
  "Kopierbarer Ergebnistext",
  "Kundenname optional",
  "Beratername optional",
  "Notiz für den Bericht optional",
  "PDF-Ansicht wird nur lokal im Browser erzeugt"
];

describe("legacy PDF design regression guard", () => {
  it("keeps old customer report markup out of the printable PDF generator", () => {
    for (const fragment of legacyPdfFragments) {
      expect(pdfReportSource).not.toContain(fragment);
    }
  });

  it("keeps old secondary report controls out of the result page", () => {
    for (const fragment of legacyResultPageFragments) {
      expect(widgetSource).not.toContain(fragment);
    }
  });
});
