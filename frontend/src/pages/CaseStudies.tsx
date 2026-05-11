import Card from "../components/Card";
import Section from "../components/Section";

export default function CaseStudies() {
  return (
    <>
      <Section
        eyebrow="Case Studies"
        title="How teams reduce AI risk with Akrivon"
        description="Examples of behavior QA programs improving release confidence and policy adherence."
      />

      <Section title="Featured outcomes">
        <div className="card-grid two-col">
          <Card title="Global bank assistant" description="Reduced policy-boundary incidents by 42% in first quarter of rollout." />
          <Card title="Enterprise support copilot" description="Cut pre-release behavior defects by 55% through automated strategy scans." />
          <Card title="Insurance claims AI" description="Standardized AI risk reporting across product, legal, and compliance teams." />
          <Card title="Developer agent platform" description="Prevented out-of-scope action execution via continuous drift monitoring." />
        </div>
      </Section>
    </>
  );
}
