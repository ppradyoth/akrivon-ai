import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { getUsage } from "../api";

const BASE = import.meta.env.VITE_API_BASE ?? "/api";

interface ApiKey {
  key_id: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
}

export default function Account() {
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState<{ plan: string; monthly_tests_used: number; monthly_tests_limit: number } | null>(null);

  const fetchKeys = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    const res = await fetch(`${BASE}/api-keys`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setKeys(await res.json());
  }, [getToken]);

  const fetchUsage = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    try { setUsage(await getUsage(token)); } catch {}
  }, [getToken]);

  useEffect(() => { fetchKeys(); fetchUsage(); }, [fetchKeys, fetchUsage]);

  const createKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setLoading(true);
    const token = await getToken();
    const res = await fetch(`${BASE}/api-keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: newKeyName.trim() }),
    });
    if (res.ok) {
      const data = await res.json();
      setCreatedKey(data.key);
      setNewKeyName("");
      fetchKeys();
    }
    setLoading(false);
  };

  const deleteKey = async (keyId: string) => {
    const token = await getToken();
    await fetch(`${BASE}/api-keys/${keyId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchKeys();
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <section className="container" style={{ padding: "3rem 1rem", maxWidth: 720 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Account</h1>
        <button onClick={handleSignOut} className="btn" style={{ fontSize: "0.85rem" }}>Sign out</button>
      </div>

      <p style={{ color: "var(--clr-muted, #888)", marginBottom: "2rem" }}>{user?.email}</p>

      {usage && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2.5rem" }}>
          <div style={cardStyle}>
            <div style={{ fontSize: "0.85rem", color: "var(--clr-muted, #888)" }}>Plan</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, textTransform: "capitalize", marginTop: "0.25rem" }}>{usage.plan}</div>
          </div>
          <div style={cardStyle}>
            <div style={{ fontSize: "0.85rem", color: "var(--clr-muted, #888)" }}>Tests Used</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, marginTop: "0.25rem" }}>{usage.monthly_tests_used.toLocaleString()}</div>
          </div>
          <div style={cardStyle}>
            <div style={{ fontSize: "0.85rem", color: "var(--clr-muted, #888)" }}>Monthly Limit</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, marginTop: "0.25rem" }}>{usage.monthly_tests_limit.toLocaleString()}</div>
          </div>
        </div>
      )}

      <h2>API Keys</h2>

      {createdKey && (
        <div style={{ padding: "1rem", background: "var(--clr-surface, #1a1a2e)", border: "1px solid var(--clr-accent, #00d4aa)", borderRadius: 8, marginBottom: "1.5rem" }}>
          <p style={{ margin: "0 0 0.5rem", fontWeight: 600 }}>New API key created — copy it now, it won't be shown again:</p>
          <code style={{ wordBreak: "break-all", fontSize: "0.85rem" }}>{createdKey}</code>
          <button onClick={() => { navigator.clipboard.writeText(createdKey); }} className="btn" style={{ marginLeft: "1rem", fontSize: "0.8rem" }}>Copy</button>
          <button onClick={() => setCreatedKey(null)} className="btn" style={{ marginLeft: "0.5rem", fontSize: "0.8rem" }}>Dismiss</button>
        </div>
      )}

      <form onSubmit={createKey} style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <input
          type="text"
          placeholder="Key name (e.g. production)"
          value={newKeyName}
          onChange={(e) => setNewKeyName(e.target.value)}
          required
          style={{ flex: 1, padding: "0.5rem 0.75rem", borderRadius: 6, border: "1px solid var(--clr-border, #333)", background: "var(--clr-surface, #1a1a2e)", color: "inherit" }}
        />
        <button type="submit" disabled={loading} className="btn btn-primary">{loading ? "Creating..." : "Create key"}</button>
      </form>

      {keys.length === 0 ? (
        <p style={{ color: "var(--clr-muted, #888)" }}>No API keys yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid var(--clr-border, #333)" }}>
              <th style={{ padding: "0.5rem 0" }}>Name</th>
              <th>Created</th>
              <th>Last used</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.key_id} style={{ borderBottom: "1px solid var(--clr-border, #222)" }}>
                <td style={{ padding: "0.5rem 0" }}>{k.name}</td>
                <td style={{ fontSize: "0.85rem", color: "var(--clr-muted, #888)" }}>{new Date(k.created_at).toLocaleDateString()}</td>
                <td style={{ fontSize: "0.85rem", color: "var(--clr-muted, #888)" }}>{k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : "Never"}</td>
                <td><button onClick={() => deleteKey(k.key_id)} className="btn" style={{ fontSize: "0.8rem", color: "var(--clr-danger, #e74c3c)" }}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

const cardStyle: React.CSSProperties = {
  padding: "1.25rem",
  background: "var(--clr-surface, #1a1a2e)",
  borderRadius: 8,
  textAlign: "center",
  border: "1px solid var(--clr-border, #333)",
};
