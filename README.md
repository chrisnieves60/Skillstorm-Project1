# Warehouse Management (quick guide)

A small warehouse + inventory tracker built with a Spring Boot backend and a React/Vite frontend. It keeps tabs on warehouses, capacity, inventory items, and transfers between sites.

### Database Schema

- `warehouse`: stores warehouse metadata (name, location, maximum capacity)
- `inventory`: stores items linked to a warehouse (SKU, quantity, description, storage location)
- One-to-many relationship: one warehouse → many inventory items
- Foreign key on `inventory.warehouse_id` with `ON DELETE CASCADE`

## Folder layout

- `warehouse_management/` — Spring Boot API (Java 17+, Maven).
- `frontend/WarehouseManagement/` — React 19 + Vite app (bun/npm supported). created with Bun

## What it does

- Create/update/delete warehouses with max capacity, see current utilization.
- Add inventory items, edit, delete, and transfer between warehouses.
- Capacity guardrails in the UI and API so you don’t overfill a site.
- Simple warehouse and detail views for quick peeks at stock.

## API quick peek

- `GET /warehouses` — list warehouses (includes capacity helper endpoint per id).
- `POST /warehouses` — create a warehouse.
- `PUT /warehouses/{id}` / `DELETE /warehouses/{id}` — change or remove.
- `GET /inventory` — list inventory items.
- `POST /inventory` — add item (checks capacity, merges duplicates per location/sku).
- `PUT /inventory/{id}` / `DELETE /inventory/{id}` — update or remove.
- `POST /warehouses/transfer` — move quantity between warehouses.

## Notes and rough edges

- Capacity is calculated from stored quantities in warehouses table
- Search/filtering is done in frontend, not optimal but functional
