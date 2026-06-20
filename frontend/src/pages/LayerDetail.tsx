import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getLayer, listLayerRequests } from "../api";
import { useAuth } from "../hooks/useAuth";

export default function LayerDetail() {
  const { layerId } = useParams<{ layerId: string }>();
  const { getToken } = useAuth();
  const [layer, setLayer] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const proxyUrl = layer ? `${window.location.origin}/api/proxy/${layerId}` : "";

  const fetch_ = useCallback(async () => {
    if (!layerId) return;
    const token = await getToken();
    try {
      const [l, r] = await Promise.all([getLayer(layerId, token), listLayerRequests(layerId, token)]);
      setLayer(l);
      setRequests(r);
    } catch {}
    setLoading(false);
  }, [layerId, getToken]);

  useEffect(() => { fetch_(); }, [fetch_]);

  if (loading) return <section className="container" style={{ padding: "3rem 1rem" }}>Loading...</section>;
  if (!layer) return <section className="container" style={{ padding: "3rem 1rem" }}>Layer not found.</section>;

  return (
    <section className="container" style={{ padding: "3rem 1rem", maxWidth: 800 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>{layer.name}</h1>
        <Link to="/layers" className="btn">Back to Layers</Link>
      </div>

      <div style={{ padding: "1rem", background: "var(--clr-surface, #1a1a2e)", borderRadius: 8, margin: "1.5rem 0", border: "1px solid var(--clr-accent, #00d4aa)" }}>
        <p style={{ margin: "0 0 0.5rem", fontWeight: 600 }}>Proxy URL</p>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <code style={{ flex: 1, wordBreak: "break-all", fontSize: "0.85rem" }}>{proxyUrl}</code>
          <button onClick={() => navigator.clipboard.writeText(proxyUrl)} className="btn" style={{ fontSize: "0.8rem" }}>Copy</button>
        </div>
        <p style={{ fontSize: "0.75rem", color: "var(--clr-muted, #888)", margin: "0.5rem 0 0" }}>
          Point your AI traffic here. Requests are classified, policy-checked, then forwarded to your target.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", margin: "1.5rem 0" }}>
        <div>
          <h3>Target</h3>
          <p style={{ fontSize: "0.9rem" }}>{layer.target_url || "Not configured"}</p>
        </div>
        <div>
          <h3>Categories ({(layer.intent_schema?.categories || []).length})</h3>
          {(layer.intent_schema?.categories || []).map((c: any, i: number) => (
            <p key={i} style={{ fontSize: "0.85rem", margin: "0.2rem 0" }}><strong>{c.name}</strong>: {c.description}</p>
          ))}
        </div>
      </div>

      <h3>Policy Rules</h3>
      <pre style={{ fontSize: "0.8rem", background: "var(--clr-surface, #1a1a2e)", padding: "0.75rem", borderRadius: 6, overflowX: "auto" }}>
        {JSON.stringify(layer.policy_rules, null, 2)}
      </pre>

      <h2 style={{ marginTop: "2rem" }}>Recent Requests</h2>
      {requests.length === 0 ? (
        <p style={{ color: "var(--clr-muted, #888)" }}>No requests yet. Send traffic to your proxy URL to see activity.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.75rem" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid var(--clr-border, #333)" }}>
              <th style={thStyle}>Time</th>
              <th style={thStyle}>Intent</th>
              <th style={thStyle}>Decision</th>
              <th style={thStyle}>Prompt</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.request_id} style={{ borderBottom: "1px solid var(--clr-border, #222)" }}>
                <td style={tdStyle}>{new Date(r.created_at).toLocaleTimeString()}</td>
                <td style={tdStyle}>{r.intent?.label}</td>
                <td style={{ ...tdStyle, color: r.decision === "block" ? "var(--clr-danger, #e74c3c)" : r.decision === "allow" ? "var(--clr-accent, #00d4aa)" : "var(--clr-muted, #888)" }}>
                  {r.decision}
                </td>
                <td style={{ ...tdStyle, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.prompt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

const thStyle: React.CSSProperties = { padding: "0.5rem 0.5rem 0.5rem 0" };
const tdStyle: React.CSSProperties = { padding: "0.5rem 0.5rem 0.5rem 0", fontSize: "0.85rem" };
