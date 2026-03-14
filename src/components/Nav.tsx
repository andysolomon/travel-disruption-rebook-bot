import { NavLink } from "react-router";
import "./Nav.css";

const links = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/claims", label: "Claims" },
  { to: "/settings", label: "Settings" },
];

export default function Nav() {
  return (
    <nav className="nav-bar" aria-label="Main navigation">
      <span className="nav-brand">Reroute</span>
      <ul className="nav-links">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
