import Section from "../components/Section";

export default function Changelog() {
  return (
    <>
      <Section
        eyebrow="Changelog"
        title="Product updates"
        description="Latest improvements to scan quality, workflow usability, and enterprise controls."
      />

      <Section title="2026-04-29 · v1.3.0">
        <ul className="list">
          <li>Added dedicated LanguageVariation calibration for multilingual boundaries.</li>
          <li>Improved detector confidence normalization for mixed-severity outputs.</li>
          <li>Enhanced report readability for audit handoffs.</li>
        </ul>
      </Section>

      <Section title="2026-04-12 · v1.2.0">
        <ul className="list">
          <li>Introduced risk score weighting by severity and confidence.</li>
          <li>Added structured response parsing for broader target API compatibility.</li>
        </ul>
      </Section>
    </>
  );
}
