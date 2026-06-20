/// <reference types="vite/client" />
import type { EnforceRequest, EnforceResponse, ScanConfig, ScanResponse } from "./types";

const BASE = import.meta.env.VITE_API_BASE ?? "/api";
const SCAN_ENDPOINT = `${BASE}/scan`;
const ENFORCE_ENDPOINT = `${BASE}/enforce`;

function authHeaders(token: string | null): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function runScan(config: ScanConfig, token: string | null = null): Promise<ScanResponse> {
  const response = await fetch(SCAN_ENDPOINT, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Scan request failed");
  }

  return (await response.json()) as ScanResponse;
}

export async function runEnforce(payload: EnforceRequest, token: string | null = null): Promise<EnforceResponse> {
  const response = await fetch(ENFORCE_ENDPOINT, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Enforcement request failed");
  }

  return (await response.json()) as EnforceResponse;
}
