import Card from "../components/Card";
import Section from "../components/Section";

export default function Careers() {
  return (
    <>
      <Section
        eyebrow="Careers"
        title="Help define the future of AI behavior safety"
        description="We are hiring builders who care deeply about product quality, security, and applied AI."
      />

      <Section title="Open roles">
        <div className="card-grid two-col">
          <Card title="Senior Backend Engineer" description="FastAPI, evaluation systems, distributed orchestration" />
          <Card title="Frontend Engineer" description="React, TypeScript, design systems, UX quality" />
          <Card title="AI Safety Research Engineer" description="Red-team strategy design and evaluation science" />
          <Card title="Solutions Architect" description="Enterprise onboarding, integrations, and security reviews" />
        </div>
      </Section>
    </>
  );
}
