import Section from "../components/Section";
import SEO from "../components/SEO";

export default function Research() {
  return (
    <>
      <SEO title="Research" description="Applied research in adversarial prompt generation, policy-grounded violation classification, and AI behavior testing methodology." path="/research" />
      <Section
        eyebrow="Research"
        title="Applied research behind the Akrivon strategy model"
        description="Our methodology combines adversarial prompt generation with policy-grounded violation classification."
      />

      <Section title="Research themes">
        <ul className="list">
          <li>Prompt pressure patterns and gradual intent escalation</li>
          <li>Cross-language behavior consistency testing</li>
          <li>Confidence calibration for violation scoring</li>
          <li>Human-in-the-loop validation for ambiguous outputs</li>
        </ul>
      </Section>
    </>
  );
}
