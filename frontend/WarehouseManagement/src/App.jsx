import { useState, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Warehouses from "./pages/Warehouses";
import Layout from "./components/Layout";
import Toast from "./components/Toast";
import "./App.css";

function App() {
  const [warehouses, setWarehouses] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        let URL = "http://localhost:8080";
        const res = await fetch(`${URL}/warehouses`);
        const warehouseList = await res.json();

        const enriched = await Promise.all(
          warehouseList.map(async (w) => {
            const capRes = await fetch(`${URL}/warehouses/${w.id}/capacity`);
            const capacity = await capRes.json(); //this is the int

            return {
              ...w, //copy of warehouse object
              capacity: capacity, //inject capacity
            };
          })
        );
        console.log(enriched);
        setWarehouses(enriched);
      } catch (error) {
        console.error("Error fetching warehouses", error);
      }
    };

    fetchWarehouses();
  }, []);

  const showToast = (message, tone = "info") => {
    setToast({ message, tone });
    window.clearTimeout(window.toastTimeout);
    window.toastTimeout = window.setTimeout(() => setToast(null), 2600);
  };

  // showToast("Inventory transferred", "success");
  // return true;

  return (
    <Layout>
      {toast && <Toast message={toast.message} tone={toast.tone} />}
      <Routes>
        <Route path="/" element={<Dashboard warehouses={warehouses} />} />
        <Route path="/warehouses" element={<Warehouses />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
