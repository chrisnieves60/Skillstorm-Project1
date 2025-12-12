import { useState, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Warehouses from "./pages/Warehouses";
import WarehouseDetails from "./pages/WarehouseDetails";
import Layout from "./components/Layout";
import Toast from "./components/Toast";
import "./App.css";
import { getWarehousesWithCapacity } from "./api/warehouses";
import { getInventory } from "./api/inventory";

function App() {
  const [warehouses, setWarehouses] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [toast, setToast] = useState(null);

  const fetchWarehouses = async () => {
    try {
      const data = await getWarehousesWithCapacity();
      setWarehouses(data);
    } catch (error) {
      console.error("Error fetching warehouses", error);
    }
  };

  const fetchInventory = async () => {
    try {
      const data = await getInventory();
      setInventory(data);
    } catch (error) {
      console.error("Error fetching inventory", error);
    }
  };

  useEffect(() => {
    fetchWarehouses();
    fetchInventory();
  }, []);

  const showToast = (message, tone = "info") => {
    setToast({ message, tone });
    window.clearTimeout(window.toastTimeout);
    window.toastTimeout = window.setTimeout(() => setToast(null), 2600);
  };

  return (
    <Layout>
      {toast && <Toast message={toast.message} tone={toast.tone} />}
      <Routes>
        <Route path="/" element={<Dashboard warehouses={warehouses} />} />
        <Route
          path="/warehouses"
          element={
            <Warehouses //wamt to pass warehouses & setWarehouses so i can access and manipulate state in child. as well as fetchWarehouses.
              warehouses={warehouses}
              setWarehouses={setWarehouses}
              fetchWarehouses={fetchWarehouses}
              showToast={showToast}
            />
          }
        />
        <Route
          path="/warehouses/:id"
          element={
            <WarehouseDetails
              warehouses={warehouses}
              inventory={inventory}
              fetchInventory={fetchInventory}
            />
          }
        />
        <Route
          path="/inventory"
          element={
            <Inventory
              showToast={showToast}
              inventory={inventory}
              setInventory={setInventory}
              fetchInventory={fetchInventory}
              warehouses={warehouses}
              setWarehouses={setWarehouses}
              fetchWarehouses={fetchWarehouses}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
