package org.example.collisionservice.Service;

import org.example.collisionservice.Model.CollisionAlert;
import org.example.collisionservice.Repository.CollisionAlertRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class CollisionAlertConsumer {

    private static final Logger logger = LoggerFactory.getLogger(CollisionAlertConsumer.class);

    @Autowired
    private CollisionAlertRepository repository;

    @KafkaListener(topics = "collision_alerts", groupId = "collision_alerts_group")
    public void consume(CollisionAlert alert) {
        try {
            alert.setId(UUID.randomUUID().toString());
            alert.setCreatedAt(LocalDateTime.now());
            repository.save(alert);
            logger.info("Saved collision alert to MongoDB: {}", alert.getSatellites());
        } catch (Exception e) {
            logger.error("Error saving collision alert: {}", e.getMessage());
        }
    }
}