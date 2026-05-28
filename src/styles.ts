export const widgetStyles = `
.zd-widget {
  --zd-primary: #0b1f3a;
  --zd-primary-soft: #e7edf5;
  --zd-accent: #1fa37a;
  --zd-warning: #f2a51a;
  --zd-danger: #c23b3b;
  --zd-text: #162033;
  --zd-muted: #5d6980;
  --zd-border: #dbe2ec;
  --zd-surface: #ffffff;
  --zd-page: #f6f8fb;
  --zd-focus: rgba(31, 163, 122, 0.25);
  box-sizing: border-box;
  color: var(--zd-text);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.5;
  max-width: 100%;
}

.zd-shell,
.zd-header,
.zd-card,
.zd-grid,
.zd-field,
.zd-input,
.zd-button,
.zd-progress,
.zd-progress-track,
.zd-step-list,
.zd-summary-grid,
.zd-metric,
.zd-contract-row,
.zd-result-grid,
.zd-textarea,
.zd-alert,
.zd-lead-panel,
.zd-pdf-note-field,
.zd-pdf-note,
.zd-pdf-cta,
.zd-actions,
.zd-step-actions,
.zd-tax-layout,
.zd-tax-side,
.zd-option,
.zd-contract-list,
.zd-contract-fields {
  box-sizing: border-box;
}

.zd-shell {
  background: var(--zd-page);
  border: 1px solid var(--zd-border);
  border-radius: 8px;
  max-width: 980px;
  overflow: hidden;
}

.zd-header {
  background: var(--zd-primary);
  color: #ffffff;
  padding: 22px 18px;
}

.zd-brand {
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0;
  margin: 0 0 8px;
}

.zd-title {
  font-size: clamp(1.8rem, 4vw, 2.65rem);
  line-height: 1.08;
  margin: 0;
}

.zd-subline {
  color: rgba(255, 255, 255, 0.86);
  font-size: 1rem;
  margin: 12px 0 0;
  max-width: 760px;
}

.zd-progress {
  background: #ffffff;
  border-bottom: 1px solid var(--zd-border);
  padding: 14px 18px 12px;
}

.zd-progress-top {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 10px;
}

.zd-progress-label {
  color: var(--zd-primary);
  font-size: 0.92rem;
  font-weight: 700;
  margin: 0;
}

.zd-progress-count {
  color: var(--zd-muted);
  font-size: 0.85rem;
}

.zd-progress-track {
  background: #e7edf5;
  border-radius: 999px;
  height: 8px;
  overflow: hidden;
}

.zd-progress-bar {
  background: var(--zd-accent);
  height: 100%;
  transition: width 180ms ease;
}

.zd-step-list {
  display: none;
}

.zd-content {
  padding: 16px;
}

.zd-card {
  background: var(--zd-surface);
  border: 1px solid var(--zd-border);
  border-radius: 8px;
  padding: 18px;
}

.zd-card-title {
  color: var(--zd-primary);
  font-size: 1.25rem;
  line-height: 1.25;
  margin: 0 0 8px;
}

.zd-card-text {
  color: var(--zd-muted);
  margin: 0 0 18px;
}

.zd-trust {
  background: #eef8f4;
  border: 1px solid #c7eadf;
  border-radius: 8px;
  color: #165f4b;
  font-weight: 650;
  margin: 18px 0;
  padding: 12px;
}

.zd-grid {
  display: grid;
  gap: 14px;
}

.zd-grid-two {
  grid-template-columns: 1fr;
}

.zd-tax-layout {
  display: grid;
  gap: 18px;
}

.zd-tax-side {
  display: grid;
  gap: 14px;
}

.zd-field {
  display: grid;
  gap: 7px;
}

.zd-label,
.zd-legend {
  color: var(--zd-text);
  font-size: 0.96rem;
  font-weight: 700;
}

.zd-help {
  color: var(--zd-muted);
  font-size: 0.9rem;
  margin: 0;
}

.zd-input,
.zd-select,
.zd-textarea {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  color: var(--zd-text);
  font: inherit;
  min-height: 44px;
  padding: 10px 11px;
  width: 100%;
}

.zd-textarea {
  min-height: 280px;
  resize: vertical;
}

.zd-input:focus,
.zd-select:focus,
.zd-textarea:focus {
  border-color: var(--zd-accent);
  box-shadow: 0 0 0 4px var(--zd-focus);
  outline: none;
}

.zd-input[aria-invalid="true"],
.zd-select[aria-invalid="true"] {
  border-color: var(--zd-danger);
}

.zd-error {
  color: var(--zd-danger);
  font-size: 0.88rem;
  margin: 0;
}

.zd-fieldset {
  border: 0;
  margin: 0;
  padding: 0;
}

.zd-option-list {
  display: grid;
  gap: 9px;
  margin-top: 8px;
}

.zd-option {
  align-items: flex-start;
  border: 1px solid var(--zd-border);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  gap: 10px;
  padding: 11px;
}

.zd-option:hover {
  border-color: #b7c4d6;
}

.zd-option input {
  margin-top: 4px;
}

.zd-button {
  align-items: center;
  background: var(--zd-primary);
  border: 1px solid var(--zd-primary);
  border-radius: 7px;
  color: #ffffff;
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  font-weight: 750;
  justify-content: center;
  min-height: 44px;
  padding: 10px 16px;
  text-decoration: none;
}

.zd-button:hover {
  filter: brightness(1.05);
}

.zd-button:focus {
  box-shadow: 0 0 0 4px var(--zd-focus);
  outline: none;
}

.zd-button-secondary {
  background: #ffffff;
  border-color: #bdc7d6;
  color: var(--zd-primary);
}

.zd-button-accent {
  background: var(--zd-accent);
  border-color: var(--zd-accent);
}

.zd-button-danger {
  background: #ffffff;
  border-color: #e0b4b4;
  color: var(--zd-danger);
}

.zd-button-row,
.zd-step-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.zd-step-actions {
  justify-content: space-between;
  margin-top: 18px;
}

.zd-step-actions-end {
  justify-content: flex-end;
}

.zd-summary-grid,
.zd-result-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr;
  margin: 16px 0;
}

.zd-metric {
  background: #f8fafc;
  border: 1px solid var(--zd-border);
  border-radius: 8px;
  padding: 14px;
}

.zd-metric-label {
  color: var(--zd-muted);
  font-size: 0.86rem;
  margin: 0 0 5px;
}

.zd-metric-value {
  color: var(--zd-primary);
  font-size: 1.35rem;
  font-weight: 800;
  margin: 0;
}

.zd-badge {
  border-radius: 999px;
  display: inline-flex;
  font-size: 0.84rem;
  font-weight: 800;
  line-height: 1;
  padding: 7px 10px;
}

.zd-badge-green {
  background: #e8f7f1;
  color: #12664e;
}

.zd-badge-yellow {
  background: #fff5d8;
  color: #875a00;
}

.zd-badge-red {
  background: #fde9e9;
  color: #9f2222;
}

.zd-alert {
  border-radius: 8px;
  margin: 14px 0;
  padding: 12px;
}

.zd-alert-green {
  background: #e8f7f1;
  border: 1px solid #c5eadc;
  color: #12664e;
}

.zd-alert-yellow {
  background: #fff8e8;
  border: 1px solid #f1dda6;
  color: #744e05;
}

.zd-alert-red {
  background: #fdecec;
  border: 1px solid #eec1c1;
  color: #8f1f1f;
}

.zd-section {
  border-top: 1px solid var(--zd-border);
  padding-top: 18px;
  margin-top: 18px;
}

.zd-section-title {
  color: var(--zd-primary);
  font-size: 1.05rem;
  margin: 0 0 10px;
}

.zd-contract-list {
  display: grid;
  gap: 12px;
  margin-top: 14px;
}

.zd-contract-row {
  border: 1px solid var(--zd-border);
  border-radius: 8px;
  padding: 14px;
}

.zd-contract-head {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
  margin-bottom: 12px;
}

.zd-contract-title {
  color: var(--zd-primary);
  font-weight: 800;
  margin: 0;
}

.zd-contract-fields {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr;
}

.zd-copy-status {
  color: #12664e;
  font-size: 0.92rem;
  font-weight: 700;
  margin: 8px 0 0;
}

.zd-pdf-cta {
  align-items: center;
  background: #eef8f4;
  border: 1px solid #c7eadf;
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: space-between;
  margin: 16px 0 4px;
  padding: 16px;
}

.zd-pdf-cta-title {
  color: var(--zd-primary);
  font-size: 1rem;
  margin: 0 0 4px;
}

.zd-pdf-cta-text {
  color: #165f4b;
  margin: 0;
}

.zd-lead-panel {
  background: #f8fafc;
  border: 1px solid var(--zd-border);
  border-radius: 8px;
  margin-top: 18px;
  padding: 16px;
}

.zd-pdf-note-field {
  margin-top: 14px;
}

.zd-pdf-note {
  min-height: 104px;
  resize: vertical;
}

.zd-small {
  color: var(--zd-muted);
  font-size: 0.86rem;
}

@media (min-width: 720px) {
  .zd-header {
    padding: 28px 30px;
  }

  .zd-progress {
    padding: 16px 30px;
  }

  .zd-content {
    padding: 24px 30px 30px;
  }

  .zd-card {
    padding: 24px;
  }

  .zd-grid-two,
  .zd-contract-fields {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .zd-tax-layout {
    align-items: start;
    grid-template-columns: minmax(0, 1.18fr) minmax(300px, 0.82fr);
  }

  .zd-summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .zd-result-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .zd-step-list {
    color: var(--zd-muted);
    display: flex;
    flex-wrap: wrap;
    font-size: 0.82rem;
    gap: 10px;
    margin-top: 10px;
  }

  .zd-step-item {
    border-left: 3px solid #dbe2ec;
    padding-left: 8px;
  }

  .zd-step-item-active {
    border-left-color: var(--zd-accent);
    color: var(--zd-primary);
    font-weight: 800;
  }
}
`;
