const baseURL = "http://localhost:8080";

//contatins helpers for inventory.

export const toClientItem = (item) => ({
  ...item,
  warehouseId:
    item.warehouseId ??
    item.warehouse_id ??
    (typeof item.warehouse === "object"
      ? item.warehouse?.id
      : item.warehouse) ??
    "",
});

export const toApiPayload = (item) => {
  const { warehouseId, warehouse_id, warehouse, ...rest } = item;
  const resolvedWarehouseId =
    warehouseId ??
    warehouse_id ??
    (typeof warehouse === "object" ? warehouse?.id : warehouse) ??
    "";
  const payload = {
    ...rest,
    warehouseId: resolvedWarehouseId,
    warehouse_id: resolvedWarehouseId,
  };

  if (resolvedWarehouseId) {
    payload.warehouse = { id: resolvedWarehouseId };
  }

  return payload;
};

export const getWarehouses = async () => {
  const res = await fetch(`${baseURL}/warehouses`);
  if (!res.ok) throw new Error("Failed to fetch warehouses");
  const warehouseList = await res.json();

  const enriched = await Promise.all(
    warehouseList.map(async (w) => {
      try {
        const capRes = await fetch(`${baseURL}/warehouses/${w.id}/capacity`);
        if (!capRes.ok) return w;
        const capacity = await capRes.json();
        return { ...w, capacity };
      } catch {
        return w;
      }
    })
  );

  return enriched;
};

export const getInventory = async () => {
  const res = await fetch(`${baseURL}/inventory`);
  if (!res.ok) throw new Error("Failed to fetch inventory");
  const data = await res.json();
  return data.map(toClientItem);
};

export const createInventoryItem = async (payload) => {
  const res = await fetch(`${baseURL}/inventory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create inventory item");
  const data = await res.json();
  return data;
};

export const updateInventoryItem = async (id, payload) => {
  const res = await fetch(`${baseURL}/inventory/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update inventory item");
  const data = await res.json();
  return data;
};

export const deleteInventoryItem = async (id) => {
  const res = await fetch(`${baseURL}/inventory/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("failed to delete inventory item");
  return true;
};

export const transferInventory = async ({
  inventoryId,
  fromWarehouseId,
  toWarehouseId,
  quantity,
  storageLocation = "",
}) => {
  const res = await fetch(`${baseURL}/warehouses/transfer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      inventoryId,
      fromWarehouseId,
      toWarehouseId,
      quantity,
      storageLocation,
    }),
  });
  if (!res.ok) throw new Error("Failed to transfer inventory");
  return res.json().catch(() => ({}));
};
