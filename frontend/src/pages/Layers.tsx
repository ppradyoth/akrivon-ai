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
    <section className="container" style={{ padding: "3rem 1rem", maxWidth: 800 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Intent Layers</h1>
        <Link to="/layers/new" className="btn btn-primary">Create Layer</Link>
      </div>

      {loading ? <p>Loading...</p> : layers.length === 0 ? (
        <p style={{ color: "var(--clr-muted, #888)", marginTop: "2rem" }}>No layers yet. Create your first Intent Layer to get a proxy URL.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
          {layers.map((l) => (
            <div key={l.layer_id} style={{ padding: "1rem", background: "var(--clr-surface, #1a1a2e)", borderRadius: 8, border: "1px solid var(--clr-border, #333)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Link to={`/layers/${l.layer_id}`} style={{ fontWeight: 600, fontSize: "1.1rem" }}>{l.name}</Link>
                <button onClick={() => handleDelete(l.layer_id)} className="btn" style={{ fontSize: "0.8rem", color: "var(--clr-danger, #e74c3c)" }}>Delete</button>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--clr-muted, #888)", margin: "0.5rem 0 0" }}>
                Target: {l.target_url || "Not configured"} · {(l.intent_schema?.categories || []).length} categories · {(l.policy_rules || []).length} rules
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
