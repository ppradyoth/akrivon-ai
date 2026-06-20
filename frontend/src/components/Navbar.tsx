import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const navItems = [
  { to: "/product", label: "Product" },
  { to: "/why-akrivon", label: "Why Akrivon" },
  { to: "/whats-unique", label: "What's Unique?" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/use-cases", label: "Use Cases" },
  { to: "/pricing", label: "Pricing" },
  { to: "/security", label: "Security" },
  { to: "/docs", label: "Docs" },
  { to: "/blog", label: "Blog" },
  { to: "/enforce", label: "Enforce", highlight: true },
  { to: "/intentscan", label: "Intent Scan", highlight: true },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useAuth();
  const close = () => setIsOpen(false);

  return (
    <header className="navbar-wrap">
      <div className="container navbar">
        <NavLink to="/" className="brand-link" end onClick={close}>
          <span className="brand-icon" aria-hidden="true">
            AK
          </span>
          <span className="brand-text">Akrivon</span>
          <span className="nav-platform-note">Test + Enforce</span>
        </NavLink>

        <button
          className="nav-toggle"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="primary-nav"
          onClick={() => setIsOpen((o) => !o)}
        >
          {isOpen ? "✕" : "☰"}
        </button>

        <nav id="primary-nav" className={`nav-links${isOpen ? " nav-open" : ""}`} aria-label="Primary">
          {navItems.filter((i) => !i.highlight).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
              onClick={close}
            >
              {item.label}
            </NavLink>
          ))}
          <div className="nav-cta-group">
            {navItems.filter((i) => i.highlight).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => "nav-link nav-link-cta" + (isActive ? " active" : "")}
                onClick={close}
              >
                {item.label}
              </NavLink>
            ))}
            {!loading && (
              user ? (
                <NavLink to="/dashboard" className={({ isActive }) => "nav-link nav-link-cta" + (isActive ? " active" : "")} onClick={close}>
                  Dashboard
                </NavLink>
              ) : (
                <NavLink to="/login" className={({ isActive }) => "nav-link nav-link-cta" + (isActive ? " active" : "")} onClick={close}>
                  Sign in
                </NavLink>
              )
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
