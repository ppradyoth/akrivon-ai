import Section from "../components/Section";

export default function Privacy() {
  return (
    <>
      <Section
        eyebrow="Legal"
        title="Privacy Policy"
        description="How we collect, use, and protect data processed by Akrivon."
      />

      <Section title="Data we process">
        <ul className="list">
          <li>Account and workspace metadata</li>
          <li>Scan configuration inputs and generated reports</li>
          <li>Operational telemetry for reliability and security monitoring</li>
        </ul>
      </Section>

      <Section title="Data protection">
        <p className="paragraph">
          We apply encryption, access controls, and retention policies aligned with enterprise security practices.
          Customers may request deletion workflows based on their contractual terms.
        </p>
      </Section>
    </>
  );
}
