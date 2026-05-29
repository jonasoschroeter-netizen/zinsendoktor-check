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
.zd-input-wrap,
.zd-input-suffix,
.zd-combo,
.zd-combo-input,
.zd-combo-button,
.zd-combo-menu,
.zd-combo-option,
.zd-select-shell,
.zd-select-control,
.zd-select-menu,
.zd-select-option,
.zd-button,
.zd-progress,
.zd-progress-track,
.zd-step-list,
.zd-step-item,
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
.zd-financial-preview,
.zd-preview-panel,
.zd-preview-line,
.zd-preview-value,
.zd-preview-compact-line,
.zd-preview-private-row,
.zd-preview-private-summary,
.zd-preview-private-effect,
.zd-actions,
.zd-step-actions,
.zd-tax-layout,
.zd-tax-side,
.zd-option,
.zd-contract-list,
.zd-contract-fields,
.zd-contract-title-wrap,
.zd-icon-button {
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
  font-size: 1.15rem;
  font-weight: 800;
  margin: 0;
}

.zd-progress-count {
  color: var(--zd-muted);
  font-size: 0.92rem;
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

.zd-inline-accent {
  color: var(--zd-accent);
}

.zd-inline-action {
  background: transparent;
  border: 0;
  color: var(--zd-accent);
  cursor: pointer;
  display: inline;
  font: inherit;
  padding: 0;
}

.zd-inline-action:hover,
.zd-inline-action:focus {
  color: #14775b;
  text-decoration: underline;
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

.zd-equal-field-grid .zd-field {
  align-content: start;
  grid-template-rows: auto 46px auto;
}

.zd-equal-field-grid .zd-label {
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-height: 50px;
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
  min-height: 46px;
  padding: 10px 11px;
  width: 100%;
}

.zd-input,
.zd-select {
  height: 46px;
}

.zd-select-shell {
  position: relative;
}

.zd-select-control {
  align-items: center;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  color: var(--zd-text);
  cursor: pointer;
  display: flex;
  font: inherit;
  gap: 12px;
  height: 46px;
  justify-content: space-between;
  padding: 10px 11px;
  text-align: left;
  width: 100%;
}

.zd-select-control-placeholder {
  color: var(--zd-muted);
}

.zd-select-arrow {
  color: var(--zd-primary);
  flex: 0 0 auto;
  font-size: 1.05rem;
  line-height: 1;
}

.zd-select-control:focus {
  border-color: var(--zd-accent);
  box-shadow: 0 0 0 4px var(--zd-focus);
  outline: none;
}

.zd-select-control[aria-invalid="true"] {
  border-color: var(--zd-danger);
}

.zd-select-menu {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  box-shadow: 0 16px 32px rgba(11, 31, 58, 0.16);
  display: grid;
  left: 0;
  max-height: 230px;
  overflow: auto;
  padding: 6px;
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  z-index: 30;
}

.zd-select-option {
  background: transparent;
  border: 0;
  border-radius: 6px;
  color: var(--zd-text);
  cursor: pointer;
  font: inherit;
  padding: 10px 11px;
  text-align: left;
}

.zd-select-option:hover,
.zd-select-option[aria-selected="true"] {
  background: #eef8f4;
  color: #0b5f49;
}

.zd-input-wrap {
  position: relative;
  min-height: 46px;
}

.zd-input-has-suffix {
  padding-right: 42px;
}

.zd-combo {
  position: relative;
}

.zd-combo-input {
  padding-right: 48px;
}

.zd-combo-button {
  align-items: center;
  background: transparent;
  border: 0;
  color: var(--zd-primary);
  cursor: pointer;
  display: flex;
  font: inherit;
  font-size: 1.05rem;
  height: 44px;
  justify-content: center;
  padding: 0;
  position: absolute;
  right: 1px;
  top: 1px;
  width: 44px;
}

.zd-combo-button:hover {
  color: var(--zd-accent);
}

.zd-combo-menu {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  box-shadow: 0 16px 32px rgba(11, 31, 58, 0.16);
  display: grid;
  left: 0;
  max-height: 230px;
  overflow: auto;
  padding: 6px;
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  z-index: 30;
}

.zd-combo-option {
  background: transparent;
  border: 0;
  border-radius: 6px;
  color: var(--zd-text);
  cursor: pointer;
  font: inherit;
  padding: 10px 11px;
  text-align: left;
}

.zd-combo-option:hover,
.zd-combo-option[aria-selected="true"] {
  background: #eef8f4;
  color: #0b5f49;
}

.zd-input-suffix {
  color: var(--zd-muted);
  font-weight: 800;
  line-height: 1;
  pointer-events: none;
  position: absolute;
  right: 13px;
  top: 50%;
  transform: translateY(-50%);
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

.zd-contract-title-wrap {
  align-items: center;
  display: inline-flex;
  gap: 8px;
  min-width: 0;
}

.zd-icon-button {
  align-items: center;
  background: #f8fafc;
  border: 1px solid var(--zd-border);
  border-radius: 999px;
  color: var(--zd-primary);
  cursor: pointer;
  display: inline-flex;
  flex: 0 0 auto;
  font: inherit;
  font-weight: 800;
  height: 32px;
  justify-content: center;
  line-height: 1;
  padding: 0;
  width: 32px;
}

.zd-icon-button:hover,
.zd-icon-button:focus {
  border-color: var(--zd-accent);
  box-shadow: 0 0 0 4px var(--zd-focus);
  color: var(--zd-accent);
  outline: none;
}

.zd-contract-fields {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr;
}

.zd-contract-fields .zd-field {
  align-content: start;
  grid-template-rows: auto 46px auto;
}

.zd-contract-fields .zd-label {
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-height: 50px;
}

@media (min-width: 720px) {
  .zd-grid-two > .zd-field {
    align-content: start;
    grid-template-rows: auto 46px auto;
  }

  .zd-grid-two > .zd-field > .zd-label {
    align-items: flex-start;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    min-height: 50px;
  }
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

.zd-financial-preview {
  display: grid;
  gap: 16px;
  margin: 18px 0;
  padding: 0;
}

.zd-preview-copy,
.zd-preview-subtitle {
  color: #000000;
  font-size: 0.92rem;
  line-height: 1.35;
  margin: 6px 0 0;
}

.zd-preview-panel {
  background: #ffffff;
  border: 1px solid #e4ebf4;
  border-radius: 8px;
  box-shadow: 0 8px 22px rgba(11, 31, 58, 0.04);
  padding: 18px;
}

.zd-preview-title {
  color: #000000;
  font-size: 1.28rem;
  font-weight: 500;
  margin: 0 0 20px;
}

.zd-preview-line,
.zd-preview-compact-line {
  align-items: center;
  background: #f9fbfe;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  display: grid;
  gap: 16px;
  margin-bottom: 10px;
  padding: 10px 12px;
}

.zd-preview-line {
  grid-template-columns: minmax(0, 1fr) minmax(160px, 230px);
}

.zd-preview-line p,
.zd-preview-compact-line p,
.zd-preview-contract-name,
.zd-preview-summary-title {
  color: #000000;
  margin: 0;
}

.zd-preview-compact-line {
  grid-template-columns: minmax(0, 1fr) minmax(180px, 230px) minmax(120px, 160px);
}

.zd-preview-compact-line p {
  text-align: right;
}

.zd-preview-compact-line-emphasis p,
.zd-preview-summary-title {
  font-weight: 800;
}

.zd-preview-value {
  align-items: center;
  background: linear-gradient(180deg, #ffffff 0%, #f5f8fc 100%);
  border: 1px solid #c6d3e2;
  border-radius: 7px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
  color: var(--zd-primary);
  display: flex;
  font-size: 0.92rem;
  font-weight: 800;
  justify-content: flex-end;
  min-height: 38px;
  padding: 6px 12px;
}

.zd-preview-value-emphasis {
  background: #eef8f4;
  border-color: #80d0b4;
  color: #0b5f49;
}

.zd-preview-subtitle-spaced {
  margin-top: 22px;
}

.zd-preview-private-list {
  display: grid;
  gap: 14px;
  margin-top: 22px;
}

.zd-preview-private-row,
.zd-preview-private-summary,
.zd-preview-private-effect {
  align-items: end;
  background: #f9fbfe;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  display: grid;
  gap: 16px;
  padding: 12px;
}

.zd-preview-private-row {
  grid-template-columns: minmax(190px, 1fr) minmax(150px, 180px) minmax(150px, 180px);
}

.zd-preview-contract-name,
.zd-preview-summary-title {
  font-size: 0.92rem;
}

.zd-preview-mini-label {
  color: var(--zd-muted);
  display: block;
  font-size: 0.82rem;
  font-weight: 700;
  margin-bottom: 6px;
  text-align: left;
}

.zd-preview-divider {
  background: linear-gradient(90deg, transparent, #c9d7e7, transparent);
  height: 1px;
  margin: 6px 0;
}

.zd-preview-private-summary {
  grid-template-columns: minmax(160px, 1fr) minmax(140px, 170px) minmax(140px, 170px) minmax(100px, 130px);
}

.zd-preview-private-effect {
  grid-template-columns: minmax(190px, 1fr) minmax(160px, 200px) minmax(160px, 200px);
  margin-top: 28px;
}

@media (max-width: 719px) {
  .zd-preview-line,
  .zd-preview-compact-line,
  .zd-preview-private-row,
  .zd-preview-private-summary,
  .zd-preview-private-effect {
    grid-template-columns: 1fr;
  }

  .zd-preview-compact-line p,
  .zd-preview-mini-label {
    text-align: left;
  }
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
    padding: 22px 34px 24px;
  }

  .zd-progress-label {
    font-size: 1.35rem;
    line-height: 1.18;
  }

  .zd-progress-count {
    font-size: 1rem;
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
    font-size: 1.18rem;
    gap: 18px;
    margin-top: 16px;
  }

  .zd-step-item {
    align-items: center;
    appearance: none;
    background: transparent;
    border-left: 4px solid #dbe2ec;
    border-bottom: 0;
    border-right: 0;
    border-top: 0;
    color: inherit;
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    line-height: 1.2;
    min-height: 36px;
    padding-left: 12px;
    text-align: left;
  }

  .zd-step-item-active {
    border-left-color: var(--zd-accent);
    color: var(--zd-primary);
    font-weight: 800;
  }

  .zd-step-item:hover,
  .zd-step-item:focus {
    border-left-color: var(--zd-accent);
    color: var(--zd-primary);
    outline: none;
  }

  .zd-step-item:focus-visible {
    box-shadow: 0 0 0 4px var(--zd-focus);
  }
}
`;
