import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { getUsage, listScans, listLayers } from "../api";

export default function Dashboard() {
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  const [usage, setUsage] = useState<{ plan: string; monthly_tests_used: number; monthly_tests_limit: number } | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [layerCount, setLayerCount] = useState(0);

  const fetchData = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const [u, scans, layers] = await Promise.all([getUsage(token), listScans(token), listLayers(token)]);
      setUsage(u);
      setRecentScans(scans.slice(0, 5));
      setLayerCount(layers.length);
    } catch {}
  }, [getToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/");
  };

  const usagePct = usage ? Math.min(100, (usage.monthly_tests_used / usage.monthly_tests_limit) * 100) : 0;

  return (
    <section className="container" style={{ padding: "3rem 1rem", maxWidth: 800 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Dashboard</h1>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link to="/account" className="btn" style={{ fontSize: "0.85rem" }}>Account</Link>
          <button onClick={handleSignOut} className="btn" style={{ fontSize: "0.85rem" }}>Sign out</button>
        </div>
      </div>

      <p style={{ color: "var(--clr-muted, #888)", marginBottom: "2rem" }}>{user?.email}</p>

      {/* Usage card */}
      {usage && (
        <div style={{ padding: "1.25rem", background: "var(--clr-surface, #1a1a2e)", borderRadius: 8, border: "1px solid var(--clr-border, #333)", marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontWeight: 600 }}>Monthly Usage</span>
            <span style={{ fontSize: "0.85rem", textTransform: "capitalize", color: "var(--clr-accent, #00d4aa)" }}>{usage.plan} plan</span>
          </div>
          <div style={{ background: "var(--clr-border, #333)", borderRadius: 4, height: 8, overflow: "hidden" }}>
            <div style={{ width: `${usagePct}%`, height: "100%", background: usagePct > 80 ? "var(--clr-danger, #e74c3c)" : "var(--clr-accent, #00d4aa)", borderRadius: 4, transition: "width 0.3s" }} />
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--clr-muted, #888)", marginTop: "0.5rem" }}>
            {usage.monthly_tests_used.toLocaleString()} / {usage.monthly_tests_limit.toLocaleString()} tests used
          </p>
        </div>
      )}

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2.5rem" }}>
        <ActionCard to="/intentscan" label="New Scan" sub="Run IntentScan" />
        <ActionCard to="/scans" label="History" sub={`${recentScans.length}+ scans`} />
        <ActionCard to="/layers" label="Layers" sub={`${layerCount} active`} />
        <ActionCard to="/enforce" label="Enforce" sub="Test playground" />
      </div>

      {/* Recent scans */}
      <h2>Recent Scans</h2>
      {recentScans.length === 0 ? (
        <p style={{ color: "var(--clr-muted, #888)" }}>No scans yet. <Link to="/intentscan">Run your first scan</Link>.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.75rem" }}>
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
            {recentScans.map((s) => (
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

function ActionCard({ to, label, sub }: { to: string; label: string; sub: string }) {
  return (
    <Link to={to} style={{ padding: "1.25rem", background: "var(--clr-surface, #1a1a2e)", borderRadius: 8, textAlign: "center", textDecoration: "none", color: "inherit", border: "1px solid var(--clr-border, #333)" }}>
      <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: "0.8rem", color: "var(--clr-muted, #888)", marginTop: "0.25rem" }}>{sub}</div>
    </Link>
  );
}

const thStyle: React.CSSProperties = { padding: "0.5rem 0.5rem 0.5rem 0" };
const tdStyle: React.CSSProperties = { padding: "0.5rem 0.5rem 0.5rem 0", fontSize: "0.9rem" };
