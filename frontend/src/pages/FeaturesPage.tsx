export default function FeaturesPage() {
  return (
    <div className="page-stack">
      <section className="panel soft-panel">
        <p className="eyebrow">Features</p>
        <h1>Built for AI product quality teams.</h1>
      </section>

      <section className="card-grid">
        <article className="panel">
          <h2>RoleTransformation Strategy</h2>
          <p>Tests whether an assistant can be coerced into unauthorized roles and personas.</p>
        </article>
        <article className="panel">
          <h2>GradualDrift Strategy</h2>
          <p>Simulates multi-turn pressure that slowly pushes the model beyond intended behavior.</p>
        </article>
        <article className="panel">
          <h2>LanguageVariation Strategy</h2>
          <p>Verifies behavior consistency when prompts are issued across supported languages.</p>
        </article>
      </section>
    </div>
  );
}
