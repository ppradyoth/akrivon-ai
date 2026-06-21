import Section from "../components/Section";
import SEO from "../components/SEO";

export default function Contact() {
  return (
    <>
      <SEO title="Contact" description="Get in touch with Akrivon AI for AI security assessments, architecture reviews, and enterprise onboarding." path="/contact" />
      <Section
        eyebrow="Contact"
        title="Talk to product, security, or sales"
        description="Our team supports evaluations, architecture reviews, and enterprise onboarding."
      />

      <Section title="Contact channels">
        <div className="card-grid two-col">
          <article className="card">
            <h3>Sales</h3>
            <p className="card-description">sales@akrivon.ai</p>
          </article>
          <article className="card">
            <h3>Security</h3>
            <p className="card-description">security@akrivon.ai</p>
          </article>
          <article className="card">
            <h3>Support</h3>
            <p className="card-description">support@akrivon.ai</p>
          </article>
          <article className="card">
            <h3>Response Time</h3>
            <p className="card-description">Within one business day for all inquiries.</p>
          </article>
        </div>
      </Section>
    </>
  );
}
