
/// <reference types="vite/client" />
import type { EnforceRequest, EnforceResponse, ScanConfig, ScanResponse } from "./types";

const BASE = import.meta.env.VITE_API_BASE ?? "/api";
const SCAN_ENDPOINT = `${BASE}/scan`;
const ENFORCE_ENDPOINT = `${BASE}/enforce`;

export async function runScan(config: ScanConfig): Promise<ScanResponse> {
  const response = await fetch(SCAN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Scan request failed");
  }

  return (await response.json()) as ScanResponse;
}

export async function runEnforce(payload: EnforceRequest): Promise<EnforceResponse> {
  const response = await fetch(ENFORCE_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Enforcement request failed");
  }

  return (await response.json()) as EnforceResponse;
}
