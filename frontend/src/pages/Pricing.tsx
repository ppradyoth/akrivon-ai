import Card from "../components/Card";
import Section from "../components/Section";

export default function Pricing() {
  return (
    <>
      <Section
        eyebrow="Pricing"
        title="Plans for startups, scale-ups, and regulated enterprises"
        description="Start with fast behavior scans and scale to organization-wide AI assurance programs."
      />

      <Section title="Plans">
        <div className="card-grid three-col">
          <Card title="Starter" description="$99/month · up to 1,000 tests per month">
            <ul className="list">
              <li>Single workspace</li>
              <li>RoleTransformation and GradualDrift scans</li>
              <li>Email support</li>
            </ul>
          </Card>
          <Card title="Growth" description="$499/month · up to 20,000 tests per month">
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
