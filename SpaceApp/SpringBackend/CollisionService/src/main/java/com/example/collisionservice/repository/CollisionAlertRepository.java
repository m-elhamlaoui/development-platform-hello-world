package com.example.collisionservice.repository;

import com.example.collisionservice.model.CollisionAlert;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CollisionAlertRepository extends MongoRepository<CollisionAlert, String> {
} 