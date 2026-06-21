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

  if (loading) return <section className="section" style={{ maxWidth: 900, margin: "0 auto" }}><p style={{ color: "var(--muted)" }}>Loading…</p></section>;
  if (!scan) return <section className="section" style={{ maxWidth: 900, margin: "0 auto" }}><p>Scan not found.</p></section>;

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
    <section className="section" style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1>Scan Result</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={downloadJson} className="button-secondary" style={{ width: "auto", fontSize: "0.85rem" }}>JSON</button>
          <a href={getScanReportUrl(scanId!)} className="button-secondary" style={{ fontSize: "0.85rem" }} target="_blank" rel="noopener noreferrer">PDF</a>
          <Link to="/scans" className="button-secondary" style={{ fontSize: "0.85rem" }}>Back</Link>
        </div>
      </div>

      <div className="metric-grid" style={{ marginBottom: 32 }}>
        <div className="metric-block" style={{ textAlign: "center" }}>
          <strong style={{ fontSize: "1.8rem", color: riskColor(scan.summary?.risk_score) }}>{scan.summary?.risk_score?.toFixed(1) ?? "—"}</strong>
          <p>Risk Score</p>
        </div>
        <div className="metric-block" style={{ textAlign: "center" }}>
          <strong style={{ fontSize: "1.8rem" }}>{scan.summary?.violations ?? 0}</strong>
          <p>Violations</p>
        </div>
        <div className="metric-block" style={{ textAlign: "center" }}>
          <strong style={{ fontSize: "1.8rem" }}>{scan.summary?.total_tests ?? 0}</strong>
          <p>Total Tests</p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header"><h2>Violations</h2></div>
        {(scan.violations || []).length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No violations detected.</p>
        ) : (
          <div className="violations-list">
            {scan.violations.map((v: any, i: number) => (
              <details key={i} className="violation-card">
                <summary>
                  <div className="violation-summary">
                    <div className="violation-meta">
                      <div className="violation-label">{v.analysis?.type}</div>
                      <div className="violation-reason-preview">{v.strategy} — {v.analysis?.reason?.slice(0, 80)}</div>
                    </div>
                    <span className={`severity-badge severity-${v.analysis?.severity || "low"}`}>{v.analysis?.severity}</span>
                  </div>
                </summary>
                <div className="violation-content-wrap">
                  <div className="violation-content">
                    <div className="text-block">
                      <h4>Probe</h4>
                      <pre>{v.prompt}</pre>
                    </div>
                    <div className="text-block">
                      <h4>Reason</h4>
                      <p className="paragraph">{v.analysis?.reason}</p>
                    </div>
                  </div>
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function riskColor(score?: number): string {
  if (score == null) return "inherit";
  if (score >= 70) return "var(--danger)";
  if (score >= 40) return "var(--warning)";
  return "var(--success)";
}
