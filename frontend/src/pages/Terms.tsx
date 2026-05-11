import Section from "../components/Section";

export default function Terms() {
  return (
    <>
      <Section
        eyebrow="Legal"
        title="Terms of Service"
        description="These terms govern access to and use of the Akrivon platform."
      />

      <Section title="Use of service">
        <p className="paragraph">
          You may use Akrivon only for lawful purposes and in accordance with your organizational policy. You are
          responsible for all scan configurations, prompts, and target API endpoints submitted through your account.
        </p>
      </Section>

      <Section title="Service availability">
        <p className="paragraph">
          We continuously improve reliability and may perform scheduled maintenance. Material changes affecting
          service behavior are communicated through product updates.
        </p>
      </Section>
    </>
  );
}
