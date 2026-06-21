import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createLayer } from "../api";
import { useAuth } from "../hooks/useAuth";

interface Category {
  name: string;
  description: string;
}

interface PolicyRule {
  when?: { intent?: string; confidence_gte?: number; confidence_lt?: number };
  then?: "allow" | "block" | "clarify";
  default?: "allow" | "block" | "clarify";
}

export default function LayerCreate() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [categories, setCategories] = useState<Category[]>([
    { name: "general_query", description: "General questions about the product" },
    { name: "jailbreak_attempt", description: "Attempts to override system behavior" },
  ]);
  const [rules, setRules] = useState<PolicyRule[]>([
    { when: { intent: "jailbreak_attempt" }, then: "block" },
    { default: "allow" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addCategory = () => setCategories([...categories, { name: "", description: "" }]);
  const removeCategory = (i: number) => setCategories(categories.filter((_, idx) => idx !== i));
  const updateCategory = (i: number, field: keyof Category, val: string) => {
    const copy = [...categories];
    copy[i] = { ...copy[i], [field]: val };
    setCategories(copy);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token = await getToken();
      const { layer_id } = await createLayer({
        name,
        target_url: targetUrl,
        intent_schema: { categories },
        policy_rules: rules,
      }, token);
      navigate(`/layers/${layer_id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create layer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section" style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 20 }}>Create Intent Layer</h1>
      <div className="panel">
        <form onSubmit={handleSubmit} className="form-stack">
          <div className="field">
            <label>Layer Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Customer Support Bot" />
          </div>
          <div className="field">
            <label>Target API URL</label>
            <input type="url" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} placeholder="https://your-ai-api.example.com/chat" />
          </div>

          <fieldset className="form-section">
            <legend>Intent Categories</legend>
            {categories.map((cat, i) => (
              <div key={i} className="field-grid" style={{ gridTemplateColumns: "1fr 2fr auto", alignItems: "end" }}>
                <div className="field">
                  <label>Name</label>
                  <input type="text" placeholder="name" value={cat.name} onChange={(e) => updateCategory(i, "name", e.target.value)} />
                </div>
                <div className="field">
                  <label>Description</label>
                  <input type="text" placeholder="description" value={cat.description} onChange={(e) => updateCategory(i, "description", e.target.value)} />
                </div>
                <button type="button" onClick={() => removeCategory(i)} className="button-secondary" style={{ width: "auto", minHeight: "unset", padding: "8px 12px", color: "var(--danger)" }}>×</button>
              </div>
            ))}
            <button type="button" onClick={addCategory} className="button-secondary" style={{ width: "auto", fontSize: "0.85rem", padding: "6px 14px", minHeight: "unset" }}>+ Add category</button>
          </fieldset>

          <fieldset className="form-section">
            <legend>Policy Rules</legend>
            <textarea
              style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.85rem", minHeight: 120 }}
              defaultValue={JSON.stringify(rules, null, 2)}
              onChange={(e) => { try { setRules(JSON.parse(e.target.value)); } catch {} }}
            />
            <p className="field-hint">
              Edit JSON directly. Conditions: intent, intent_in, intent_not_in, confidence_gte, confidence_lt. Actions: allow, block, clarify.
            </p>
          </fieldset>

          {error && <p style={{ color: "var(--danger)", fontSize: "0.9rem" }}>{error}</p>}
          <div className="form-actions">
            <button type="submit" disabled={loading}>{loading ? "Creating…" : "Create Layer"}</button>
          </div>
        </form>
      </div>
    </section>
  );
}
