package com.project_1.warehouse_management.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project_1.warehouse_management.models.Warehouse;

//Repository is to talk to database/execute queries
//no business logic, only method declarations. no bodies since its an interface. 


@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Integer>{ //JPARepo = crudrepo + paging/sorting + extras 
    
}
