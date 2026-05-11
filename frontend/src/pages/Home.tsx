import { Link } from "react-router-dom";
import Card from "../components/Card";
import Section from "../components/Section";

export default function Home() {
  return (
    <>
      <Section
        eyebrow="Akrivon AI"
        title="AI doesn't break the way you think."
        description="Most AI systems do not fail because of attacks. They fail because they quietly stop behaving as intended."
        className="hero-section home-hero"
      >
        <p className="home-hero-callout">
          Quiet drift is the default failure mode.
        </p>
        <div className="hero-actions home-hero-actions">
          <Link to="/intentscan" className="button-primary">
            Try Intent Scan
          </Link>
        </div>
      </Section>

      <Section
        title="The problem most teams miss"
        description="AI systems drift. Boundaries blur. Behavior expands beyond intent."
        className="home-problem"
      >
        <div className="card-grid two-col">
          <Card
            title="It starts with a focused assistant"
            description="A chatbot is launched for a clear purpose, like support or task completion inside a defined workflow."
          />
          <Card
            title="Then usage shifts"
            description="Users ask unrelated questions. The assistant responds anyway. A scoped product quietly becomes a general tool."
          />
        </div>
      </Section>

      <Section
        title="This isn't an attack problem. It's a behavior problem."
        description="Drift happens naturally over time. Most systems do not catch it while it is still manageable."
        className="home-insight"
      >
        <div className="why-story">
          <p>Prompts change. Context widens. Edge cases pile up.</p>
          <p>Without continuous behavior checks, the model starts doing work it was never meant to do.</p>
        </div>
      </Section>

      <Section
        title="Why existing tools fail"
        description="Most tooling is built for attacks, jailbreaks, and vulnerabilities. That matters, but it is not enough."
        className="home-gap"
      >
        <div className="card-grid two-col">
          <Card
            title="What they test"
            description="Can this model be broken through malicious prompts?"
          />
          <Card
            title="What they miss"
            description="Is this model still behaving correctly for its intended use case?"
          />
        </div>
      </Section>

      <Section
        title="Akrivon ensures your AI behaves as intended."
        description="Define intent. Test behavior. Detect drift before trust breaks."
        className="home-solution"
      >
        <div className="why-story">
          <p>Akrivon gives teams a clear boundary between in-scope and out-of-scope behavior.</p>
          <p>You get evidence, not assumptions, about how your system behaves in production-like scenarios.</p>
        </div>
      </Section>

      <Section
        title="Control your AI in production"
        description="Akrivon is not only a testing platform. It is also a runtime enforcement layer."
        className="home-capabilities"
      >
        <div className="card-grid two-col">
          <Card
            title="Inspect intent at runtime"
            description="Classify each prompt before it reaches your AI system."
          />
          <Card
            title="Allow, block, or clarify in real-time"
            description="Enforce policy boundaries continuously by placing Akrivon between users and your model."
          />
        </div>
      </Section>

      <Section
        title="Capabilities built around outcomes"
        description="Every capability starts with what your team needs to control."
        className="home-capabilities"
      >
        <div className="card-grid three-col">
          <Card
            title="Define exactly what your AI should and should not do"
            description="Set use-case intent, allowed capabilities, and disallowed boundaries in one test profile."
          />
          <Card
            title="See where behavior starts to drift"
            description="Run strategy-driven tests that pressure role, domain, and scope across realistic user prompts."
          />
          <Card
            title="Fix issues before users discover them"
            description="Get structured violation evidence with severity and confidence so teams can prioritize remediation."
          />
        </div>
      </Section>

      <Section title="How it works" description="A simple flow for behavior assurance." className="home-flow">
        <div className="card-grid two-col home-flow-grid">
          <div className="metric-block">
            <strong>1. Define use case</strong>
            <p>Document intended role, domain, and constraints.</p>
          </div>
          <div className="metric-block">
            <strong>2. Run behavioral tests</strong>
            <p>Execute dynamic prompts against your AI endpoint.</p>
          </div>
          <div className="metric-block">
            <strong>3. Detect violations</strong>
            <p>Identify role drift, capability drift, and domain failures.</p>
          </div>
          <div className="metric-block">
            <strong>4. Control AI in production</strong>
            <p>Deploy enforcement and control behavior continuously in production.</p>
          </div>
        </div>
      </Section>

      <Section
        title="AI shouldn't decide what it becomes. You should."
        description="Keep your system aligned to intent from first launch to scaled deployment."
        className="home-final-cta"
      >
        <div className="hero-actions home-hero-actions">
          <Link to="/intentscan" className="button-primary">
            Run Intent Scan
          </Link>
        </div>
      </Section>
    </>
  );
}
