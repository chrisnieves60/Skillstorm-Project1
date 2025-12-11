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

import com.project_1.warehouse_management.models.Inventory;
import com.project_1.warehouse_management.models.Warehouse;
import com.project_1.warehouse_management.repositories.InventoryRepository;
import com.project_1.warehouse_management.repositories.WarehouseRepository;
import com.project_1.warehouse_management.services.InventoryService;
import com.project_1.warehouse_management.services.WarehouseService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;


@RestController
@RequestMapping("/inventory") 
@CrossOrigin("http://localhost:5173/") 
public class InventoryController {
    private final InventoryRepository inventoryRepository; 
    private final InventoryService inventoryService; 

    private InventoryController (InventoryService inventoryService, InventoryRepository inventoryRepository) { 
        this.inventoryService = inventoryService; 
        this.inventoryRepository = inventoryRepository; 
    }

    @GetMapping
    public ResponseEntity<List<Inventory>> findAllInventory() { //http response has list of entities 
        try {
            List<Inventory> inventories = inventoryService.findAllInventories(); 
            return new ResponseEntity<>(inventories, HttpStatus.OK); 
        } catch (Exception e) {
            // TODO: handle exception
            return ResponseEntity.internalServerError().header("message", "something went wrong when fetching inventories").build(); 
        }
    }
    @PostMapping
    public ResponseEntity<Inventory> createInventory(@RequestBody Inventory inventory ) { //http response has list of entities 
        try {           
            return new ResponseEntity<>(inventoryService.createInventory(inventory), HttpStatus.OK); 
        } catch (Exception e) {
            // TODO: handle exception
            return ResponseEntity.internalServerError().header("message", "something went wrong when creating an inventory entry ").build(); 
        }
    }
    @PutMapping("{id}")
    public ResponseEntity<Inventory> putMethodName(@PathVariable int id, @RequestBody Inventory inventory) {
        //TODO: process PUT request

        try {
            Inventory updatedInventory = inventoryService.updateInventory(id, inventory); 
            return ResponseEntity.ok(updatedInventory); 

        } catch (Exception e) {
            // TODO: handle exception
            return ResponseEntity.internalServerError().header("error", "Error editing Inventory").build(); 
        }        
    }
    @DeleteMapping("/{id}") 
    public ResponseEntity<Void> deleteInventory(@PathVariable int id) { //response has no body 
        inventoryService.deleteInventoryById(id); 

        return ResponseEntity.noContent().build(); 
    }
}
