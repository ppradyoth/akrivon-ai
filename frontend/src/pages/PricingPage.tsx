export default function PricingPage() {
  return (
    <div className="page-stack">
      <section className="panel soft-panel">
        <p className="eyebrow">Pricing</p>
        <h1>Simple plans for growing AI teams.</h1>
      </section>

      <section className="card-grid">
        <article className="panel">
          <h2>Starter</h2>
          <p className="price">Contact us</p>
          <p>Up to 500 tests per month, 1 environment, email support.</p>
        </article>
        <article className="panel">
          <h2>Growth</h2>
          <p className="price">Contact us</p>
          <p>Up to 5,000 tests, multi-language probes, team collaboration.</p>
        </article>
        <article className="panel">
          <h2>Enterprise</h2>
          <p className="price">Custom</p>
          <p>Unlimited testing, SSO, private deployment, priority support.</p>
        </article>
      </section>
    </div>
  );
}
