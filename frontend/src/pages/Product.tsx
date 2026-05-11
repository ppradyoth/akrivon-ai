import Card from "../components/Card";
import Section from "../components/Section";

export default function Product() {
  return (
    <>
      <Section
        eyebrow="Product"
        title="Akrivon AI Behavior QA Platform"
        description="A complete validation layer for AI systems that must remain aligned to role, domain, and policy constraints."
      />

      <Section title="Core capabilities">
        <div className="card-grid three-col">
          <Card
            title="Constraint Builder"
            description="Define use-case boundaries, allowed capabilities, disallowed actions, and language coverage in one profile."
          />
          <Card
            title="Strategy Engine"
            description="Run RoleTransformation, GradualDrift, and LanguageVariation strategies to expose boundary weakness."
          />
          <Card
            title="Adaptive Probe Generator"
            description="Generate realistic, dynamic prompts using LLM-driven adversarial intent instead of hardcoded scripts."
          />
          <Card
            title="Violation Detector"
            description="Classify failures into capability drift, role drift, and domain violation with confidence scoring."
          />
          <Card
            title="Risk Scoring"
            description="Summarize scan quality through weighted severity and confidence to prioritize remediation."
          />
          <Card
            title="Structured Reporting"
            description="Return machine-readable output for CI gates, dashboards, and audit documentation."
          />
        </div>
      </Section>

      <Section
        title="Intent Layer (Runtime Enforcement)"
        description="Akrivon sits between users and AI systems to enforce behavior in production, not only during pre-release tests."
      >
        <div className="card-grid three-col">
          <Card
            title="Runtime intent classification"
            description="Classify each incoming prompt before it reaches your model."
          />
          <Card
            title="Policy-based allow or block"
            description="Enforce allowed and disallowed behaviors in real-time using intent policy rules."
          />
          <Card
            title="Live boundary control"
            description="Reduce drift in production by routing only compliant requests to downstream AI endpoints."
          />
        </div>
      </Section>
    </>
  );
}
