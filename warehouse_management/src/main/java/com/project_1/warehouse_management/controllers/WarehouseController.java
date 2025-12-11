package com.project_1.warehouse_management.controllers;

import java.util.List;
import java.util.Map;

import org.apache.catalina.connector.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.project_1.warehouse_management.dto.TransferRequest;
import com.project_1.warehouse_management.models.Inventory;
import com.project_1.warehouse_management.models.Warehouse;
import com.project_1.warehouse_management.repositories.WarehouseRepository;
import com.project_1.warehouse_management.services.WarehouseService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;



@RestController
@RequestMapping("/warehouses") 
@CrossOrigin("http://localhost:5173/") 
public class WarehouseController {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseService warehouseService;

    private WarehouseController (WarehouseService warehouseService, WarehouseRepository warehouseRepository) { 
        this.warehouseService = warehouseService; 
        this.warehouseRepository = warehouseRepository; 
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWarehouse(@PathVariable int id) { //response has no body 
        warehouseService.deleteWarehouseById(id); //returns http response that is 
        //204 no content, body: empty
        return ResponseEntity.noContent().build();
    }
    @GetMapping
    public ResponseEntity<List<Warehouse>> findAllWarehouses() { //http response has list of entities 
        try {
            List<Warehouse> warehouses = warehouseService.findAllWarehouses(); 
            return new ResponseEntity<>(warehouses, HttpStatus.OK); 
        } catch (Exception e) {
            // TODO: handle exception
            return ResponseEntity.internalServerError().header("message", "something went wrong when fetching warehouses").build(); 
        }
    }
    @GetMapping("/{id}/capacity")
    public ResponseEntity<Integer> getMethodName(@PathVariable int id) {
        
        try {
            int capacity = warehouseService.getCurrentCapacity(id);  
            return ResponseEntity.ok(capacity); 
        } catch (Exception e) {
            // TODO: handle exception
            return ResponseEntity.internalServerError().header("message", "something went wrong when fetching warehouses").build(); 
        }
    }
    
    @PostMapping() 
    public ResponseEntity<?> postMethodName(@RequestBody Warehouse warehouse) { //request body turns body into java object 
        try {
            return new ResponseEntity<>(warehouseService.createWarehouse(warehouse), HttpStatus.OK); //create Warehouse saves it to db. 
        } catch (Exception e) {
            // TODO: handle exception
            return ResponseEntity.status(500).body(Map.of("error", "Something went wrong"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Warehouse> putMethodName(@PathVariable int id, @RequestBody Warehouse warehouse) {
        try {
            Warehouse updated = warehouseService.updateWarehouse(id, warehouse);
            return ResponseEntity.ok(updated);  
        } catch (Exception e) {
            return ResponseEntity.internalServerError().header("error", "Error editing warehouse").build(); 
        }
    }
    @PostMapping("/transfer") 
    public ResponseEntity<?> transferInventory(@RequestBody TransferRequest request) {
        try {
            warehouseService.transferInventory(request.fromWarehouseId, request.toWarehouseId, request.inventoryId, request.quantity, request.storageLocation);
            return ResponseEntity.ok("Transfer complete");
        } catch (Exception e) {
            // TODO: handle exception
            return ResponseEntity.internalServerError().header("error", "Error transferring warehouse items").build(); 
        }
    }
}
