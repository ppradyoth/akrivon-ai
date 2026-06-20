import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message?.replace("Firebase: ", "") || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container" style={{ maxWidth: 420, padding: "4rem 1rem" }}>
      <h1>Create account</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} style={inputStyle} />
        </label>
        {error && <p style={{ color: "var(--clr-danger, #e74c3c)", margin: 0 }}>{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: "0.5rem" }}>
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p style={{ marginTop: "1.5rem", textAlign: "center" }}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
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
