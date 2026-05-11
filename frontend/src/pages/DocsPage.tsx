export default function DocsPage() {
  return (
    <div className="page-stack">
      <section className="panel soft-panel">
        <p className="eyebrow">Docs</p>
        <h1>Quick start documentation</h1>
      </section>

      <section className="panel prose">
        <h2>1. Run your backend</h2>
        <p>Start FastAPI at <code>http://localhost:8000</code>.</p>
        <h2>2. Run your frontend</h2>
        <p>Start Vite at <code>http://localhost:5173</code>.</p>
        <h2>3. Open Intent Check</h2>
        <p>Go to the Intent Check page, provide your API URL and boundary config, then run a scan.</p>
      </section>
    </div>
  );
}
