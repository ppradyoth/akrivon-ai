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

// ── Scans ──

export async function listScans(token: string | null): Promise<any[]> {
  const res = await fetch(`${BASE}/scans`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch scans");
  return res.json();
}

export async function getScan(scanId: string, token: string | null): Promise<any> {
  const res = await fetch(`${BASE}/scans/${scanId}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Scan not found");
  return res.json();
}

// ── Layers ──

export async function createLayer(data: any, token: string | null): Promise<{ layer_id: string }> {
  const res = await fetch(`${BASE}/layers`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listLayers(token: string | null): Promise<any[]> {
  const res = await fetch(`${BASE}/layers`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch layers");
  return res.json();
}

export async function getLayer(layerId: string, token: string | null): Promise<any> {
  const res = await fetch(`${BASE}/layers/${layerId}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Layer not found");
  return res.json();
}

export async function updateLayer(layerId: string, data: any, token: string | null): Promise<void> {
  const res = await fetch(`${BASE}/layers/${layerId}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function deleteLayer(layerId: string, token: string | null): Promise<void> {
  const res = await fetch(`${BASE}/layers/${layerId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete layer");
}

export async function listLayerRequests(layerId: string, token: string | null): Promise<any[]> {
  const res = await fetch(`${BASE}/layers/${layerId}/requests`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch requests");
  return res.json();
}
