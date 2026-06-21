import { Link } from "react-router-dom";
import Section from "../components/Section";
import SEO from "../components/SEO";

const findings = [
  {
    target: "Jack & Jill",
    slug: "jack-jill",
    type: "AI Recruiting Agent",
    headline: "14 vulnerabilities across prompt injection, fabricated legal documents, and agent tool hijacking",
    severity: "7 Critical, 4 High, 3 Medium",
    detail: "A single resume PDF with hidden text triggered fabricated £180k job offers with visa sponsorship claims — all without any malicious chat input.",
  },
  {
    target: "Priceline",
    slug: "priceline",
    type: "AI Travel Assistant (Penny)",
    headline: "Prompt injection and data exfiltration in customer-facing travel chatbot",
    severity: "Critical",
    detail: "The AI assistant could be manipulated to disclose system prompts, internal tool schemas, and process booking data outside intended workflows.",
  },
  {
    target: "Reddit Answers",
    slug: "reddit-answers",
    type: "AI Search Feature",
    headline: "Indirect prompt injection via user-generated content in AI-powered search",
    severity: "High",
    detail: "Adversarial content in Reddit posts was surfaced as trusted AI-generated answers, enabling misinformation at scale.",
  },
];

export default function Home() {
  return (
    <>
      <SEO path="/" />
      <Section className="hero-section home-hero">
        <div className="section-header">
          <h1>We find what your AI security tools miss.</h1>
          <p className="section-description" style={{ maxWidth: 680 }}>
            Akrivon is an AI red-teaming firm. We test AI systems the way real attackers do —
            prompt injection, agent hijacking, data exfiltration, behavioral drift — and deliver
            evidence your team can act on.
          </p>
        </div>
        <div className="hero-actions home-hero-actions" style={{ marginTop: 24 }}>
          <Link to="/request" className="button-primary">Request an Assessment</Link>
          <Link to="/case-studies" className="button-secondary">See Our Work</Link>
        </div>
      </Section>

      <Section>
        <div style={{ display: "flex", gap: 48, flexWrap: "wrap", alignItems: "baseline" }}>
          <Stat value="45" label="Vulnerabilities found" />
          <Stat value="9" label="AI products tested" />
          <Stat value="16" label="Critical findings" />
          <Stat value="5" label="Attack vectors" />
        </div>
      </Section>

      <Section
        title="Real findings from real AI products"
        description="We don't run automated scans and hand you a PDF. We attack your AI system with the same techniques threat actors use — then show you exactly what broke and why."
      >
        <div style={{ display: "grid", gap: 16, marginTop: 8 }}>
          {findings.map((f) => (
            <Link
              key={f.slug}
              to="/case-studies"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="card" style={{ transition: "box-shadow 120ms ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: 4 }}>{f.target}</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{f.type}</p>
                  </div>
                  <span style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    color: "var(--danger)",
                    flexShrink: 0,
                  }}>
                    {f.severity}
                  </span>
                </div>
                <p style={{ marginTop: 12, fontWeight: 600, lineHeight: 1.4 }}>{f.headline}</p>
                <p style={{ marginTop: 8, color: "var(--muted)", fontSize: "0.94rem", lineHeight: 1.6 }}>{f.detail}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section
        title="How an engagement works"
        description="Three steps from first contact to actionable findings."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginTop: 8 }}>
          <Step num="1" title="Scope" desc="You tell us what your AI system does, who it serves, and what keeps you up at night. We define the attack surface together." />
          <Step num="2" title="Attack" desc="We run adversarial testing — prompt injection, indirect injection via documents, agent tool hijacking, behavioral drift probing, data exfiltration attempts — against your live or staging environment." />
          <Step num="3" title="Report" desc="You get a findings report with severity ratings, reproduction steps, evidence screenshots, and prioritized remediation guidance. We walk your team through every finding." />
        </div>
      </Section>

      <Section
        title="We also build the tools"
        description="Our red-teaming is backed by purpose-built technology."
      >
        <div className="card-grid two-col">
          <div className="card">
            <h3>IntentScan</h3>
            <p className="card-description">
              Automated adversarial probe generation across 8 attack strategies.
              Tests your AI endpoint for jailbreaks, role drift, encoding bypasses, and indirect injection.
            </p>
            <Link to="/intentscan" style={{ display: "inline-block", marginTop: 12, fontSize: "0.9rem", fontWeight: 600, color: "var(--primary)" }}>
              Try IntentScan →
            </Link>
          </div>
          <div className="card">
            <h3>IntentEnforce</h3>
            <p className="card-description">
              Runtime proxy that classifies every prompt before it reaches your AI.
              Configurable policy rules to allow, block, or flag requests in real-time.
            </p>
            <Link to="/enforce" style={{ display: "inline-block", marginTop: 12, fontSize: "0.9rem", fontWeight: 600, color: "var(--primary)" }}>
              Try IntentEnforce →
            </Link>
          </div>
        </div>
      </Section>

      <Section
        title="Your AI is live. Is it safe?"
        description="Get an expert assessment before your users — or attackers — find out."
        className="home-final-cta"
      >
        <div className="hero-actions home-hero-actions" style={{ marginTop: 8 }}>
          <Link to="/request" className="button-primary">Request an Assessment</Link>
        </div>
      </Section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: "0.88rem", color: "var(--muted)", marginTop: 4 }}>{label}</div>
    </div>
  );
}

function Step({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div>
      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--primary)", marginBottom: 8 }}>Step {num}</div>
      <h3 style={{ fontSize: "1.1rem", marginBottom: 8 }}>{title}</h3>
      <p style={{ color: "var(--muted)", fontSize: "0.94rem", lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}
