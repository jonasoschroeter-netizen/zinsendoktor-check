import React from "react";
import { createRoot, type Root } from "react-dom/client";
import { widgetStyles } from "./styles";
import type { ZinsendoktorMountInstance, ZinsendoktorOptions } from "./types";
import { ZinsendoktorWidget } from "./widget";

const mountedInstances = new WeakMap<Element, { root: Root; clear: () => void }>();

const defaultOptions: Required<Pick<ZinsendoktorOptions, "mode" | "enableLeadForm" | "storage" | "useShadowDom">> = {
  mode: "anonymous",
  enableLeadForm: false,
  storage: false,
  useShadowDom: true
};

export function mount(
  selectorOrElement: string | Element,
  options: ZinsendoktorOptions = {}
): ZinsendoktorMountInstance {
  const host =
    typeof selectorOrElement === "string"
      ? document.querySelector(selectorOrElement)
      : selectorOrElement;

  if (!host) {
    console.error("ZinsendoktorCheck: Mount-Ziel wurde nicht gefunden.");
    return { unmount: () => undefined };
  }

  mountedInstances.get(host)?.root.unmount();
  mountedInstances.get(host)?.clear();

  const normalizedOptions: ZinsendoktorOptions = {
    ...defaultOptions,
    ...options,
    storage: false,
    theme: {
      primaryColor: "#0B1F3A",
      accentColor: "#1FA37A",
      warningColor: "#F2A51A",
      dangerColor: "#C23B3B",
      ...options.theme
    }
  };

  try {
    const target = createRenderTarget(host, normalizedOptions);
    const root = createRoot(target.container);

    root.render(
      <WidgetErrorBoundary>
        <ZinsendoktorWidget options={normalizedOptions} />
      </WidgetErrorBoundary>
    );

    mountedInstances.set(host, {
      root,
      clear: target.clear
    });

    return {
      unmount: () => {
        root.unmount();
        target.clear();
        mountedInstances.delete(host);
      }
    };
  } catch {
    renderMountError(host);
    return { unmount: () => undefined };
  }
}

function createRenderTarget(
  host: Element,
  options: ZinsendoktorOptions
): { container: HTMLDivElement; clear: () => void } {
  if (options.useShadowDom !== false && "attachShadow" in host) {
    const shadowRoot = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    shadowRoot.replaceChildren();

    const style = document.createElement("style");
    style.textContent = widgetStyles;
    const container = document.createElement("div");
    shadowRoot.append(style, container);

    return {
      container,
      clear: () => shadowRoot.replaceChildren()
    };
  }

  host.replaceChildren();
  const style = document.createElement("style");
  style.textContent = widgetStyles;
  const container = document.createElement("div");
  host.append(style, container);

  return {
    container,
    clear: () => host.replaceChildren()
  };
}

function renderMountError(host: Element): void {
  const message = document.createElement("div");
  message.className = "zd-widget";
  message.textContent =
    "Der Finanz-Gesundheitscheck konnte in diesem Bereich nicht geladen werden.";
  host.replaceChildren(message);
}

class WidgetErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  override componentDidCatch(error: unknown): void {
    console.error("ZinsendoktorCheck: Widget-Fehler", error);
  }

  override render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="zd-widget">
          <div className="zd-shell">
            <div className="zd-content">
              <div className="zd-card">
                <h2 className="zd-card-title">Der Check konnte nicht geladen werden</h2>
                <p className="zd-card-text">
                  Bitte laden Sie die Seite neu oder versuchen Sie es später erneut.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
