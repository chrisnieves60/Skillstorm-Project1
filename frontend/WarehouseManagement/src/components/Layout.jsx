import { NavLink } from "react-router-dom";

export default function Layout({ children, alerts = [] }) {
  return (
    <div className="app-shell">
      <div className="ambient" />
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">IMS</div>
          <div>
            <p className="eyebrow">Atlas Control</p>
            <h1>Inventory OS</h1>
          </div>
        </div>
        <div className="top-actions">
          <div className="pill">
            <span className="dot" />
            {alerts.length > 0
              ? `${alerts.length} capacity alert${alerts.length > 1 ? "s" : ""}`
              : "All sites stable"}
          </div>
          <div className="avatar">AD</div>
        </div>
      </header>

      <nav className="nav-tabs">
        <NavLink end to="/">
          Overview
        </NavLink>
        <NavLink to="/warehouses">Warehouses</NavLink>
        <NavLink to="/inventory">Inventory</NavLink>
      </nav>

      <main className="page">{children}</main>
    </div>
  );
}
