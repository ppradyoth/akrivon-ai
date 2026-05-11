import { Link } from "react-router-dom";

const footerGroups = [
  {
    title: "Product",
    links: [
      { to: "/product", label: "Product" },
      { to: "/how-it-works", label: "How It Works" },
      { to: "/use-cases", label: "Use Cases" },
      { to: "/pricing", label: "Pricing" },
      { to: "/why", label: "Why" },
      { to: "/enforce", label: "Enforce" },
      { to: "/intentscan", label: "Intent Scan" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/careers", label: "Careers" },
      { to: "/contact", label: "Contact" },
      { to: "/trust", label: "Trust" },
      { to: "/security", label: "Security" },
    ],
  },
  {
    title: "Resources",
    links: [
      { to: "/docs", label: "Docs" },
      { to: "/architecture", label: "Architecture" },
      { to: "/research", label: "Research" },
      { to: "/blog", label: "Blog" },
      { to: "/case-studies", label: "Case Studies" },
      { to: "/changelog", label: "Changelog" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/terms", label: "Terms" },
      { to: "/privacy", label: "Privacy" },
      { to: "/cookies", label: "Cookies" },
      { to: "/ethics", label: "Ethics" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="footer-wrap">
      <div className="container footer-grid">
        {footerGroups.map((group) => (
          <section key={group.title} aria-label={group.title}>
            <h2 className="footer-heading">{group.title}</h2>
            <ul className="footer-list">
              {group.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <div className="container footer-meta">
        <p>© {new Date().getFullYear()} Akrivon AI. Behavior QA for enterprise AI systems.</p>
      </div>
    </footer>
  );
}
