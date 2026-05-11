import Card from "../components/Card";
import Section from "../components/Section";

export default function Security() {
  return (
    <>
      <Section
        eyebrow="Security"
        title="Enterprise security by design"
        description="Akrivon is built to protect sensitive prompts, responses, and policy context in high-trust environments."
      />

      <Section title="Security foundations">
        <div className="card-grid three-col">
          <Card title="Data handling" description="Encrypted in transit and at rest with strict key management practices." />
          <Card title="Model isolation" description="Scan orchestration is separated from customer AI runtimes and credentials." />
          <Card title="Access controls" description="Role-based access, scoped tokens, and audit trails for all critical actions." />
        </div>
      </Section>

      <Section title="Enterprise readiness" description="Designed to align with internal review and procurement requirements.">
        <ul className="list">
          <li>Vulnerability management and patch response process</li>
          <li>Secure SDLC with peer review and release controls</li>
          <li>Tenant-level data separation and lifecycle policies</li>
        </ul>
      </Section>

      <Section title="Runtime enforcement safeguards" description="Protect behavior after deployment with policy-aware runtime controls.">
        <div className="card-grid three-col">
          <Card title="Runtime policy enforcement" description="Apply allow and block decisions before prompts reach downstream AI systems." />
          <Card title="Input and output inspection" description="Evaluate incoming intent and validate returned responses through enforcement workflow." />
          <Card title="Intent-based controls" description="Map user requests to approved intent classes for safer production operation." />
        </div>
      </Section>
    </>
  );
}
