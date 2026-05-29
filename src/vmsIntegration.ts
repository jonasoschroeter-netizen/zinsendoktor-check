import type { CheckInput, CheckResult, VmsProductSession } from "./types";

export const DEFAULT_VMS_BASE_URL = "http://127.0.0.1:8787";
export const VMS_PRODUCT_ID = "finanzdoktor";
export const VMS_PRODUCT_NAME = "Finanzdoktor";

export interface VmsLaunchContext {
  isVms: boolean;
  resultApiUrl: string;
  sessionApiUrl: string;
  sessionId: string;
}

export interface VmsResultPayload {
  sessionId: string;
  partnerNumber?: string;
  partnerCompany?: string;
  productId: typeof VMS_PRODUCT_ID;
  productName: typeof VMS_PRODUCT_NAME;
  customer: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  advisor: {
    name?: string;
    email?: string;
  };
  offer: {
    contractNumber?: string;
    orderId?: string;
    customerNumber?: string;
  };
  finance: {
    generatedAt: string;
    input: CheckInput;
    result: CheckResult;
    summaryText: string;
  };
  pdf: {
    fileName: string;
    mimeType: "application/pdf";
    base64: string;
  };
}

export function getVmsLaunchContext(search: string): VmsLaunchContext {
  const normalizedSearch = search.startsWith("?") ? search.slice(1) : search;
  const params = new URLSearchParams(normalizedSearch);
  const source = params.get("source")?.trim().toLowerCase();
  const utmSource = params.get("utm_source")?.trim().toLowerCase();

  return {
    isVms: source === "vms" || utmSource === "vms",
    resultApiUrl: params.get("result_api")?.trim() || params.get("resultApi")?.trim() || "",
    sessionApiUrl: params.get("session_api")?.trim() || params.get("sessionApi")?.trim() || "",
    sessionId: params.get("session")?.trim() ?? ""
  };
}

export function buildVmsSessionUrl(baseUrl: string, sessionId: string): string {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const url = new URL(`api/product-sessions/${VMS_PRODUCT_ID}/${encodeURIComponent(sessionId)}`, normalizedBase);

  return url.toString();
}

export function buildVmsSessionRequestUrl({
  baseUrl,
  sessionApiUrl,
  sessionId
}: {
  baseUrl: string;
  sessionApiUrl?: string;
  sessionId: string;
}): string {
  const directUrl = sessionApiUrl?.trim();

  if (!directUrl) {
    return buildVmsSessionUrl(baseUrl, sessionId);
  }

  const url = new URL(directUrl);
  url.searchParams.set("session", sessionId);

  return url.toString();
}

export function buildVmsResultUrl(baseUrl: string): string {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const url = new URL(`api/product-results/${VMS_PRODUCT_ID}`, normalizedBase);

  return url.toString();
}

export function buildVmsResultRequestUrl({
  baseUrl,
  resultApiUrl
}: {
  baseUrl: string;
  resultApiUrl?: string;
}): string {
  return resultApiUrl?.trim() || buildVmsResultUrl(baseUrl);
}

export function buildVmsPdfFileName(session: VmsProductSession): string {
  const identifier =
    session.contractNumber || session.orderId || session.customerNumber || session.customerId || session.id;
  const safeIdentifier = (identifier || "auswertung")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `finanzdoktor-auswertung-${safeIdentifier || "auswertung"}.pdf`;
}

export function buildVmsResultPayload({
  input,
  pdfBase64,
  result,
  session
}: {
  input: CheckInput;
  pdfBase64: string;
  result: CheckResult;
  session: VmsProductSession;
}): VmsResultPayload {
  return {
    sessionId: session.id,
    partnerNumber: optionalText(session.partnerNumber),
    partnerCompany: optionalText(session.partnerCompany),
    productId: VMS_PRODUCT_ID,
    productName: VMS_PRODUCT_NAME,
    customer: {
      name: optionalText(session.customerName),
      email: optionalText(session.customerEmail),
      phone: optionalText(session.customerPhone),
      address: optionalText(session.customerAddress)
    },
    advisor: {
      name: optionalText(session.advisorName),
      email: optionalText(session.advisorEmail)
    },
    offer: {
      contractNumber: optionalText(session.contractNumber),
      orderId: optionalText(session.orderId),
      customerNumber: optionalText(session.customerNumber)
    },
    finance: {
      generatedAt: new Date().toISOString(),
      input,
      result,
      summaryText: result.generatedText
    },
    pdf: {
      fileName: buildVmsPdfFileName(session),
      mimeType: "application/pdf",
      base64: pdfBase64
    }
  };
}

function optionalText(value: string | undefined): string | undefined {
  const trimmed = value?.trim();

  return trimmed || undefined;
}
