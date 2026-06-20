import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getScan, getScanReportUrl } from "../api";
import { useAuth } from "../hooks/useAuth";

export default function ScanDetail() {
  const { scanId } = useParams<{ scanId: string }>();
  const { getToken } = useAuth();
  const [scan, setScan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    if (!scanId) return;
    const token = await getToken();
    try { setScan(await getScan(scanId, token)); } catch {}
    setLoading(false);
  }, [scanId, getToken]);

  useEffect(() => { fetch_(); }, [fetch_]);

  if (loading) return <section className="container" style={{ padding: "3rem 1rem" }}>Loading...</section>;
  if (!scan) return <section className="container" style={{ padding: "3rem 1rem" }}>Scan not found.</section>;

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(scan, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scan-${scanId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="container" style={{ padding: "3rem 1rem", maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Scan Result</h1>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={downloadJson} className="btn">Download JSON</button>
          <a href={getScanReportUrl(scanId!)} className="btn" target="_blank" rel="noopener noreferrer">Download PDF</a>
          <Link to="/scans" className="btn">Back to History</Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", margin: "2rem 0" }}>
        <StatCard label="Risk Score" value={scan.summary?.risk_score?.toFixed(1) ?? "—"} color={riskColor(scan.summary?.risk_score)} />
        <StatCard label="Violations" value={scan.summary?.violations ?? 0} />
        <StatCard label="Total Tests" value={scan.summary?.total_tests ?? 0} />
      </div>

      <h2>Violations</h2>
      {(scan.violations || []).length === 0 ? (
        <p style={{ color: "var(--clr-muted, #888)" }}>No violations detected.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
          {scan.violations.map((v: any, i: number) => (
            <div key={i} style={{ padding: "1rem", background: "var(--clr-surface, #1a1a2e)", borderRadius: 8, border: "1px solid var(--clr-border, #333)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontWeight: 600 }}>{v.analysis?.type}</span>
                <span style={{ fontSize: "0.85rem", color: severityColor(v.analysis?.severity) }}>{v.analysis?.severity}</span>
              </div>
              <p style={{ fontSize: "0.85rem", margin: "0.25rem 0" }}><strong>Strategy:</strong> {v.strategy}</p>
              <p style={{ fontSize: "0.85rem", margin: "0.25rem 0" }}><strong>Probe:</strong> {v.prompt}</p>
              <p style={{ fontSize: "0.85rem", margin: "0.25rem 0", color: "var(--clr-muted, #888)" }}>{v.analysis?.reason}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function StatCard({ label, value, color }: { label: string; value: any; color?: string }) {
  return (
    <div style={{ padding: "1.25rem", background: "var(--clr-surface, #1a1a2e)", borderRadius: 8, textAlign: "center" }}>
      <div style={{ fontSize: "2rem", fontWeight: 700, color: color || "inherit" }}>{value}</div>
      <div style={{ fontSize: "0.85rem", color: "var(--clr-muted, #888)", marginTop: "0.25rem" }}>{label}</div>
    </div>
  );
}

function riskColor(score?: number): string {
  if (score == null) return "inherit";
  if (score >= 70) return "#e74c3c";
  if (score >= 40) return "#f39c12";
  return "#00d4aa";
}

function severityColor(sev?: string): string {
  if (sev === "critical") return "#e74c3c";
  if (sev === "high") return "#e67e22";
  if (sev === "medium") return "#f39c12";
  return "#00d4aa";
}
