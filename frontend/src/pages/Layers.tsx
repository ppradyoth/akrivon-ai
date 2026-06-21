import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listLayers, deleteLayer } from "../api";
import { useAuth } from "../hooks/useAuth";

export default function Layers() {
  const { getToken } = useAuth();
  const [layers, setLayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    const token = await getToken();
    try { setLayers(await listLayers(token)); } catch {}
    setLoading(false);
  }, [getToken]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleDelete = async (layerId: string) => {
    const token = await getToken();
    await deleteLayer(layerId, token);
    fetch_();
  };

  return (
    <section className="section" style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1>Intent Layers</h1>
        <Link to="/layers/new" className="button-primary" style={{ fontSize: "0.9rem" }}>Create Layer</Link>
      </div>

      {loading ? <p style={{ color: "var(--muted)" }}>Loading…</p> : layers.length === 0 ? (
        <div className="panel">
          <p style={{ color: "var(--muted)" }}>No layers yet. <Link to="/layers/new" style={{ color: "var(--primary)", fontWeight: 600 }}>Create your first Intent Layer</Link> to get a proxy URL.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {layers.map((l) => (
            <div key={l.layer_id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Link to={`/layers/${l.layer_id}`} style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--text)", textDecoration: "none" }}>{l.name}</Link>
                <button onClick={() => handleDelete(l.layer_id)} className="button-secondary" style={{ width: "auto", fontSize: "0.82rem", padding: "4px 12px", minHeight: "unset", color: "var(--danger)" }}>Delete</button>
              </div>
              <p className="card-description" style={{ marginTop: 8 }}>
                Target: {l.target_url || "Not configured"} · {(l.intent_schema?.categories || []).length} categories · {(l.policy_rules || []).length} rules
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
