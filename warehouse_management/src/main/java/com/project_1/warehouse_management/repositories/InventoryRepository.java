package com.project_1.warehouse_management.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project_1.warehouse_management.models.Inventory;

//Repository is to talk to database/execute queries
//no business logic, only method declarations. no bodies since its an interface. 


@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Integer>{ //JPARepo = crudrepo + paging/sorting + extras 
    Inventory findByWarehouse_IdAndSku(int warehouseId, String sku); //jpql where warehouse_id and sku = the parameters. 

}
