import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

type NavItem = {
  to: string;
  label: string;
  children?: { to: string; label: string }[];
};

const navItems: NavItem[] = [
  { to: "/services", label: "Services" },
  { to: "/case-studies", label: "Our Work" },
  { to: "/product", label: "Platform", children: [
    { to: "/product", label: "Overview" },
    { to: "/intentscan", label: "IntentScan" },
    { to: "/enforce", label: "IntentEnforce" },
    { to: "/how-it-works", label: "How It Works" },
    { to: "/docs", label: "API Docs" },
  ]},
  { to: "/pricing", label: "Pricing" },
  { to: "/blog", label: "Blog" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const { user, loading } = useAuth();
  const close = () => { setIsOpen(false); setDropdown(null); };
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdown(null);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

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
          {navItems.map((item) =>
            item.children ? (
              <div key={item.to} className="nav-dropdown-wrap" ref={dropdownRef}>
                <button
                  className={`nav-link nav-dropdown-trigger${dropdown === item.to ? " active" : ""}`}
                  onClick={(e) => { e.stopPropagation(); setDropdown(dropdown === item.to ? null : item.to); }}
                  aria-expanded={dropdown === item.to}
                >
                  {item.label} <span className="nav-caret">▾</span>
                </button>
                {dropdown === item.to && (
                  <div className="nav-dropdown">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className="nav-dropdown-item"
                        onClick={close}
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                onClick={close}
              >
                {item.label}
              </NavLink>
            )
          )}
          <div className="nav-cta-group">
            {!loading && !user && (
              <NavLink to="/login" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} onClick={close}>
                Log in
              </NavLink>
            )}
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
