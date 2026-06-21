import Card from "../components/Card";
import Section from "../components/Section";
import SEO from "../components/SEO";

export default function Pricing() {
  return (
    <>
      <SEO title="Pricing" description="AI security testing plans for startups, scale-ups, and regulated enterprises. From behavior scans to organization-wide AI assurance." path="/pricing" />
      <Section
        eyebrow="Pricing"
        title="Plans for startups, scale-ups, and regulated enterprises"
        description="Start with fast behavior scans and scale to organization-wide AI assurance programs."
      />

      <Section title="Plans">
        <div className="card-grid three-col">
          <Card title="Starter" description="Up to 1,000 tests per month">
            <ul className="list">
              <li>Single workspace</li>
              <li>RoleTransformation and GradualDrift scans</li>
              <li>Email support</li>
            </ul>
          </Card>
          <Card title="Growth" description="Up to 20,000 tests per month">
            <ul className="list">
              <li>Multi-language variation scans</li>
              <li>Team collaboration and saved policies</li>
              <li>Priority support</li>
            </ul>
          </Card>
          <Card title="Enterprise" description="Custom pricing · unlimited scale">
            <ul className="list">
              <li>Private deployment options</li>
              <li>SSO and audit exports</li>
              <li>Dedicated security and success manager</li>
            </ul>
          </Card>
        </div>
      </Section>
    </>
  );
}
