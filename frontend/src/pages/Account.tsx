import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
    <section className="section" style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h1>Account</h1>
        <button onClick={handleSignOut} className="button-secondary" style={{ fontSize: "0.85rem", padding: "6px 14px", width: "auto" }}>Sign out</button>
      </div>

      <p style={{ color: "var(--muted)", marginBottom: 24 }}>{user?.email}</p>

      {usage && (
        <div className="metric-grid" style={{ marginBottom: 32 }}>
          <div className="metric-block">
            <strong style={{ textTransform: "capitalize" }}>{usage.plan}</strong>
            <p>Plan</p>
          </div>
          <div className="metric-block">
            <strong>{usage.monthly_tests_used.toLocaleString()}</strong>
            <p>Tests used</p>
          </div>
          <div className="metric-block">
            <strong>{usage.monthly_tests_limit.toLocaleString()}</strong>
            <p>Monthly limit</p>
          </div>
        </div>
      )}

      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-header">
          <h2>API Keys</h2>
        </div>

        {createdKey && (
          <div className="status-block status-success" style={{ marginBottom: 16 }}>
            <p className="status-title">New API key created — copy it now, it won't be shown again:</p>
            <code style={{ wordBreak: "break-all", fontSize: "0.85rem", display: "block", marginTop: 8 }}>{createdKey}</code>
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <button onClick={() => navigator.clipboard.writeText(createdKey)} className="button-secondary" style={{ width: "auto", fontSize: "0.82rem", padding: "4px 12px", minHeight: "unset" }}>Copy</button>
              <button onClick={() => setCreatedKey(null)} className="button-secondary" style={{ width: "auto", fontSize: "0.82rem", padding: "4px 12px", minHeight: "unset" }}>Dismiss</button>
            </div>
          </div>
        )}

        <form onSubmit={createKey} style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <input
            type="text"
            placeholder="Key name (e.g. production)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            required
            style={{ flex: 1 }}
          />
          <button type="submit" disabled={loading} style={{ width: "auto", whiteSpace: "nowrap" }}>{loading ? "Creating…" : "Create key"}</button>
        </form>

        {keys.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No API keys yet.</p>
        ) : (
          <div className="comparison-table-wrap">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Created</th>
                  <th>Last used</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.key_id}>
                    <td style={{ fontWeight: 600 }}>{k.name}</td>
                    <td>{new Date(k.created_at).toLocaleDateString()}</td>
                    <td>{k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : "Never"}</td>
                    <td><button onClick={() => deleteKey(k.key_id)} className="button-secondary" style={{ width: "auto", fontSize: "0.82rem", padding: "4px 12px", minHeight: "unset", color: "var(--danger)" }}>Delete</button></td>
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
