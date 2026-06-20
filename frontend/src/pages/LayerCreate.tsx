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
    <section className="container" style={{ padding: "3rem 1rem", maxWidth: 700 }}>
      <h1>Create Intent Layer</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "1.5rem" }}>
        <label>
          Layer Name
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} placeholder="e.g. Customer Support Bot" />
        </label>
        <label>
          Target API URL
          <input type="url" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} style={inputStyle} placeholder="https://your-ai-api.example.com/chat" />
        </label>

        <fieldset style={{ border: "1px solid var(--clr-border, #333)", borderRadius: 8, padding: "1rem" }}>
          <legend style={{ fontWeight: 600 }}>Intent Categories</legend>
          {categories.map((cat, i) => (
            <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "center" }}>
              <input type="text" placeholder="name" value={cat.name} onChange={(e) => updateCategory(i, "name", e.target.value)} style={{ ...inputStyle, flex: 1 }} />
              <input type="text" placeholder="description" value={cat.description} onChange={(e) => updateCategory(i, "description", e.target.value)} style={{ ...inputStyle, flex: 2 }} />
              <button type="button" onClick={() => removeCategory(i)} className="btn" style={{ fontSize: "0.8rem", color: "var(--clr-danger, #e74c3c)" }}>×</button>
            </div>
          ))}
          <button type="button" onClick={addCategory} className="btn" style={{ fontSize: "0.85rem" }}>+ Add category</button>
        </fieldset>

        <fieldset style={{ border: "1px solid var(--clr-border, #333)", borderRadius: 8, padding: "1rem" }}>
          <legend style={{ fontWeight: 600 }}>Policy Rules</legend>
          <pre style={{ fontSize: "0.8rem", background: "var(--clr-surface, #1a1a2e)", padding: "0.75rem", borderRadius: 6, overflowX: "auto" }}>
            {JSON.stringify(rules, null, 2)}
          </pre>
          <textarea
            style={{ ...inputStyle, minHeight: 100, fontFamily: "monospace", fontSize: "0.85rem" }}
            defaultValue={JSON.stringify(rules, null, 2)}
            onChange={(e) => { try { setRules(JSON.parse(e.target.value)); } catch {} }}
          />
          <p style={{ fontSize: "0.75rem", color: "var(--clr-muted, #888)", margin: "0.25rem 0 0" }}>
            Edit JSON directly. Supported conditions: intent, intent_in, intent_not_in, confidence_gte, confidence_lt. Actions: allow, block, clarify.
          </p>
        </fieldset>

        {error && <p style={{ color: "var(--clr-danger, #e74c3c)", margin: 0 }}>{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary">{loading ? "Creating..." : "Create Layer"}</button>
      </form>
    </section>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "0.6rem 0.8rem",
  marginTop: "0.35rem",
  borderRadius: 6,
  border: "1px solid var(--clr-border, #333)",
  background: "var(--clr-surface, #1a1a2e)",
  color: "inherit",
  fontSize: "1rem",
};
