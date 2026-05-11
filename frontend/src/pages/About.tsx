import Section from "../components/Section";

export default function About() {
  return (
    <>
      <Section
        eyebrow="About"
        title="Our mission is trustworthy AI behavior at scale"
        description="Akrivon was founded to help organizations build AI systems that remain aligned, safe, and accountable in production."
      />

      <Section title="Vision" description="Every AI release should include measurable behavior assurance by default.">
        <p className="paragraph">
          We are building the quality and risk infrastructure layer for AI products so teams can move quickly without
          sacrificing security, compliance, or customer trust.
        </p>
      </Section>

      <Section
        eyebrow="THE TEAM"
        title="Built by people who care about AI safety"
        description="Our founders bring deep experience in AI systems, security, and enterprise software."
      >
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
              PA
            </div>
            <h3 className="text-lg font-semibold mb-1">Prad Pradyoth</h3>
            <p className="text-sm text-gray-600 mb-3">Founder & CEO</p>
            <p className="text-sm text-gray-700">AI infrastructure builder. Previously worked on LLM systems and boundary detection at scale.</p>
          </div>
        </div>
      </Section>

      <Section title="Why now?" description="">
        <div className="mt-8 space-y-6 text-gray-700">
          <p>
            Large language models are being deployed into production at an unprecedented pace. Teams are moving fast,
            shipping new features weekly. But there's a critical gap: no systematic way to verify that models stay
            within their intended boundaries.
          </p>
          <p>
            We've seen the consequences: compliance violations, customer trust erosion, and costly incident response.
            The tools to prevent this don't exist yet.
          </p>
          <p>
            Akrivon was born to fill that gap. We're building the testing and enforcement layer that lets teams move
            fast <strong>and</strong> confidently.
          </p>
        </div>
      </Section>
    </>
  );
}
