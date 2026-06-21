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

  if (loading) return <section className="section" style={{ maxWidth: 860, margin: "0 auto" }}><p style={{ color: "var(--muted)" }}>Loading…</p></section>;
  if (!layer) return <section className="section" style={{ maxWidth: 860, margin: "0 auto" }}><p>Layer not found.</p></section>;

  return (
    <section className="section" style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1>{layer.name}</h1>
        <Link to="/layers" className="button-secondary" style={{ fontSize: "0.85rem" }}>Back to Layers</Link>
      </div>

      <div className="status-block status-success" style={{ marginBottom: 24 }}>
        <p className="status-title">Proxy URL</p>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
          <code style={{ flex: 1, wordBreak: "break-all", fontSize: "0.85rem" }}>{proxyUrl}</code>
          <button onClick={() => navigator.clipboard.writeText(proxyUrl)} className="button-secondary" style={{ width: "auto", fontSize: "0.82rem", padding: "4px 12px", minHeight: "unset" }}>Copy</button>
        </div>
        <p className="status-copy" style={{ marginTop: 8 }}>
          Point your AI traffic here. Requests are classified, policy-checked, then forwarded to your target.
        </p>
      </div>

      <div className="card-grid two-col" style={{ marginBottom: 24 }}>
        <div className="card">
          <h3>Target</h3>
          <p className="card-description">{layer.target_url || "Not configured"}</p>
        </div>
        <div className="card">
          <h3>Categories ({(layer.intent_schema?.categories || []).length})</h3>
          {(layer.intent_schema?.categories || []).map((c: any, i: number) => (
            <p key={i} style={{ fontSize: "0.88rem", marginTop: 4 }}><strong>{c.name}</strong>: <span style={{ color: "var(--muted)" }}>{c.description}</span></p>
          ))}
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-header"><h2>Policy Rules</h2></div>
        <pre>{JSON.stringify(layer.policy_rules, null, 2)}</pre>
      </div>

      <div className="panel">
        <div className="panel-header"><h2>Recent Requests</h2></div>
        {requests.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No requests yet. Send traffic to your proxy URL to see activity.</p>
        ) : (
          <div className="comparison-table-wrap">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Intent</th>
                  <th>Decision</th>
                  <th>Prompt</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.request_id}>
                    <td>{new Date(r.created_at).toLocaleTimeString()}</td>
                    <td style={{ fontWeight: 600 }}>{r.intent?.label}</td>
                    <td><span className={r.decision === "block" ? "cell-no" : r.decision === "allow" ? "cell-yes" : "cell-warn"}>{r.decision}</span></td>
                    <td style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.prompt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
