import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Inventory Management System</h1>
      <p style={styles.subtitle}>Choose a section to get started</p>

      <div style={styles.navGrid}>
        <Link to="/warehouses" style={styles.card}>
          <h2>Warehouses</h2>
          <p>View, create, edit, and manage warehouse locations.</p>
        </Link>

        <Link to="/inventory" style={styles.card}>
          <h2>Inventory</h2>
          <p>Browse, add, remove, and transfer items across warehouses.</p>
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    textAlign: "center",
  },
  title: {
    fontSize: "2.2rem",
    marginBottom: "0.5rem",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#555",
    marginBottom: "2rem",
  },
  navGrid: {
    display: "flex",
    justifyContent: "center",
    gap: "2rem",
    flexWrap: "wrap",
  },
  card: {
    display: "block",
    width: "240px",
    padding: "1.5rem",
    borderRadius: "12px",
    background: "#f5f5f5",
    textDecoration: "none",
    color: "black",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    transition: "0.2s ease",
  },
};
