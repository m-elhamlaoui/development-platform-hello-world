package org.example.collisionservice.Repository;

import org.example.collisionservice.Model.CollisionAlert;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CollisionAlertRepository extends MongoRepository<CollisionAlert, String> {
    
}