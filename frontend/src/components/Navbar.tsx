import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const navItems = [
  { to: "/services", label: "Services" },
  { to: "/case-studies", label: "Our Work" },
  { to: "/product", label: "Platform" },
  { to: "/pricing", label: "Pricing" },
  { to: "/blog", label: "Blog" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useAuth();
  const close = () => setIsOpen(false);

  return (
    <header className="navbar-wrap">
      <div className="container navbar">
        <NavLink to="/" className="brand-link" end onClick={close}>
          <span className="brand-icon" aria-hidden="true">AK</span>
          <span className="brand-text">Akrivon</span>
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
          {navItems.map((item) => (
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
            <NavLink to="/request" className={({ isActive }) => "nav-link nav-link-cta" + (isActive ? " active" : "")} onClick={close}>
              Request Assessment
            </NavLink>
            {!loading && user && (
              <NavLink to="/dashboard" className={({ isActive }) => "nav-link nav-link-cta" + (isActive ? " active" : "")} onClick={close}>
                Dashboard
              </NavLink>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
