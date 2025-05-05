package com.example.collisionservice.repository;

import com.example.collisionservice.model.CollisionAlertModel;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CollisionAlertRepository extends MongoRepository<CollisionAlertModel, String> {
    List<CollisionAlertModel> findByDangerLevel(String dangerLevel);
    List<CollisionAlertModel> findBySatellitesContaining(String satelliteId);
} 