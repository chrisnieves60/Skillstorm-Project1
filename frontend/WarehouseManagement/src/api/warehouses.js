const baseURL = "http://localhost:8080";

//GET REQUESTS
//MAIN GET REQUEST
export const getWarehouses = async () => {
  const res = await fetch(`${baseURL}/warehouses`);

  if (!res.ok) throw new Error("Failed to fetch warehouses");

  return res.json();
};
//GET CAPACITY HELPER
export const getWarehouseCapacity = async (id) => {
  const res = await fetch(`${baseURL}/warehouses/${id}/capacity`);

  if (!res.ok) throw new Error("Failed to fetch capacity");
  return res.json(); // returns the integer
};
//GET WAREHOUSE + CAPACITY FUNCTION (THIS IS RETURNED TO APP)
export const getWarehousesWithCapacity = async () => {
  const warehouses = await getWarehouses();
  console.log(warehouses);
  const enriched = await Promise.all(
    warehouses.map(async (w) => {
      try {
        const capacity = await getWarehouseCapacity(w.id);
        return { ...w, capacity };
      } catch {
        return w; // if capacity API fails, return base object
      }
    })
  );

  console.log(enriched);

  return enriched;
};

export const createWarehouse = async (payload) => {
  const res = await fetch(`${baseURL}/warehouses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create warehouse");
  return res.json();
};

export const updateWarehouse = async (id, payload) => {
  const res = await fetch(`${baseURL}/warehouses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update warehouse");
  return res.json();
};

export const deleteWarehouse = async (id) => {
  const res = await fetch(`${baseURL}/warehouses/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete warehouse");
  return true;
};
