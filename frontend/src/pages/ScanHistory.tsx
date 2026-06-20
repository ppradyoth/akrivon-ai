import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listScans } from "../api";
import { useAuth } from "../hooks/useAuth";

export default function ScanHistory() {
  const { getToken } = useAuth();
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    const token = await getToken();
    try { setScans(await listScans(token)); } catch {}
    setLoading(false);
  }, [getToken]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return (
    <section className="container" style={{ padding: "3rem 1rem", maxWidth: 800 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Scan History</h1>
        <Link to="/intentscan" className="btn btn-primary">New Scan</Link>
      </div>

      {loading ? <p>Loading...</p> : scans.length === 0 ? (
        <p style={{ color: "var(--clr-muted, #888)", marginTop: "2rem" }}>No scans yet. Run your first IntentScan.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1.5rem" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid var(--clr-border, #333)" }}>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Risk</th>
              <th style={thStyle}>Violations</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {scans.map((s) => (
              <tr key={s.scan_id} style={{ borderBottom: "1px solid var(--clr-border, #222)" }}>
                <td style={tdStyle}>{new Date(s.created_at).toLocaleDateString()}</td>
                <td style={tdStyle}>
                  <span style={{ color: s.status === "complete" ? "var(--clr-accent, #00d4aa)" : s.status === "failed" ? "var(--clr-danger, #e74c3c)" : "var(--clr-muted, #888)" }}>
                    {s.status}
                  </span>
                </td>
                <td style={tdStyle}>{s.summary?.risk_score?.toFixed(1) ?? "—"}</td>
                <td style={tdStyle}>{s.summary?.violations ?? "—"}</td>
                <td style={tdStyle}><Link to={`/scans/${s.scan_id}`}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

const thStyle: React.CSSProperties = { padding: "0.5rem 0.5rem 0.5rem 0" };
const tdStyle: React.CSSProperties = { padding: "0.5rem 0.5rem 0.5rem 0", fontSize: "0.9rem" };
