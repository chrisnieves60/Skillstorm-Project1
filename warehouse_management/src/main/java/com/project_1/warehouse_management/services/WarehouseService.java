package com.project_1.warehouse_management.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.project_1.warehouse_management.repositories.InventoryRepository;
import com.project_1.warehouse_management.repositories.WarehouseRepository;
import com.project_1.warehouse_management.models.Inventory;
import com.project_1.warehouse_management.models.Warehouse;
@Service
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;  //Instantiate repositroy,
    private final InventoryRepository inventoryRepository; 

    //constructor injection for beans 
    public WarehouseService(WarehouseRepository warehouseRepository, InventoryRepository inventoryRepository) {
        this.warehouseRepository = warehouseRepository; 
        this.inventoryRepository = inventoryRepository; 
    }

    public List<Warehouse> findAllWarehouses() { //return list of warehouses
        return warehouseRepository.findAll(); //SELECT * FROM WAREHOUSE
    }
    public void deleteWarehouseById(int id) { 
        warehouseRepository.deleteById(id);
    }
    public Warehouse createWarehouse(Warehouse warehouse) {
        return warehouseRepository.save(warehouse); 
    }
    public Warehouse updateWarehouse(int id, Warehouse newData) {
        Warehouse exists = warehouseRepository.findById(id).orElseThrow(() -> new RuntimeException("Warehouse not found")); 

        exists.setName(newData.getName()); 
        exists.setLocation(newData.getLocation()); 
        exists.setMaximumCapacity(newData.getMaximumCapacity()); 
        //TODO: We needa handle the fact that this doesnt update inventory, think thru architecture. 

        return warehouseRepository.save(exists); //if exists is in the db, itll update it, if not, Error happens. 
    }
    public int getCurrentCapacity(int id) {        
        Warehouse warehouse = warehouseRepository.findById(id).orElseThrow(() -> new RuntimeException("Inventory not found")); 

        List<Inventory> inventoryItems = warehouse.getInventory(); //get inventory items as list from warehouse object 
        
        int sum = 0; 
        
        for (Inventory item : inventoryItems) {
            int quantity = item.getQuantity(); 
            sum+=quantity; 
        }

        return sum; 
    }
    public void transferInventory(int warehouseIdFrom, int warehouseIdTo, int inventoryId, int transferQuantity, String storageLocation) {
        //we'd theoreticlaly be, transferring oone inventory from one warheouse, to another. 
        //do we want the entire inventory to transfer? or just. one items at a time. 
        // validate transfer amount
        //one specific count of items at a time. 
        Warehouse from = warehouseRepository.findById(warehouseIdFrom).orElseThrow(() -> new RuntimeException("Warehouse not found")); //can access List of inventory items 
        Warehouse to = warehouseRepository.findById(warehouseIdTo).orElseThrow(() -> new RuntimeException("Warehouse not found")); 
        
        Inventory itemFrom = inventoryRepository.findById(inventoryId).orElseThrow(); //specific item from inventory list of warehouse. 

        Inventory itemTo = inventoryRepository.findByWarehouse_IdAndSku(warehouseIdTo, itemFrom.getSku()); //if this does not exist, the item does not exist in the TO Warehouse. 

            // Safety check: ensure item belongs to source warehouse
        if (itemFrom.getWarehouse().getId() != warehouseIdFrom) {
            throw new RuntimeException("Item does not belong to source warehouse");
        }
        if (transferQuantity <= 0) {
            throw new RuntimeException("Transfer quantity must be positive");
        }
        if (transferQuantity > itemFrom.getQuantity()) {
            throw new RuntimeException("Not enough quantity to transfer");
        }


        if (itemTo == null) {
            Inventory newItem = new Inventory();
            newItem.setSku(itemFrom.getSku());
            newItem.setName(itemFrom.getName());
            newItem.setDescription(itemFrom.getDescription()); 
            newItem.setQuantity(transferQuantity);
            newItem.setStorageLocation(storageLocation);  
            newItem.setWarehouse(to);  
            inventoryRepository.save(newItem);
        }
        else { 
            itemTo.setQuantity(itemTo.getQuantity() + transferQuantity);
            inventoryRepository.save(itemTo);

        }

        //handle decrementing the from warehouse. delete if its everything... 
        if (itemFrom.getQuantity() == transferQuantity) { //if amount we wanna transfer equals the quantity of items.  
            inventoryRepository.delete(itemFrom);
        } else { //transferquantity cannot be more than get quantity, must be less
            itemFrom.setQuantity(itemFrom.getQuantity() - transferQuantity);
            inventoryRepository.save(itemFrom); 
        }
        
    }



}