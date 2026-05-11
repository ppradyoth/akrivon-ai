import Card from "../components/Card";
import Section from "../components/Section";

export default function Ethics() {
  return (
    <>
      <Section
        eyebrow="Ethics"
        title="Responsible AI evaluation principles"
        description="We believe behavior QA should reinforce fairness, safety, and accountability in deployed systems."
      />

      <Section title="Our principles">
        <div className="card-grid three-col">
          <Card title="Transparency" description="Clear explanation of scan strategies, classification categories, and confidence signals." />
          <Card title="Human oversight" description="Final risk decisions remain with responsible teams, not automated scoring alone." />
          <Card title="Harm reduction" description="Prioritize scenarios with customer impact, abuse potential, and policy exposure." />
        </div>
      </Section>
    </>
  );
}
