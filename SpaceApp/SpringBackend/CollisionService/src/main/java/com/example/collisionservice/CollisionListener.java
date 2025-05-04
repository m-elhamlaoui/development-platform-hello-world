package com.example.collisionservice;

import com.example.collisionservice.model.CollisionAlert;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Service;
import org.springframework.data.mongodb.core.MongoTemplate;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class CollisionListener {

    private static final String KAFKA_TOPIC = "collision_alerts";
    private static final String GROUP_ID = "collision_alerts_group";

    @Autowired
    private MongoTemplate mongoTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(
        topics = KAFKA_TOPIC,
        groupId = GROUP_ID,
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void listen(String message, Acknowledgment ack) {
        try {
            log.info("=== Starting to process new Kafka message ===");
            log.info("Raw message received: {}", message);

            // Parse the message
            Map<String, Object> data = objectMapper.readValue(message, Map.class);
            log.info("Successfully parsed message into Map: {}", data);
            
            // Extract satellite data
            @SuppressWarnings("unchecked")
            List<String> satellites = (List<String>) data.get("satellites");
            String time = (String) data.get("time");
            Double distanceKm = (Double) data.get("distance_km");
            @SuppressWarnings("unchecked")
            List<Double> position1Km = (List<Double>) data.get("position1_km");
            @SuppressWarnings("unchecked")
            List<Double> position2Km = (List<Double>) data.get("position2_km");
            String dangerLevel = (String) data.get("danger_level");
            String trend = (String) data.get("trend");
            String distanceTrend = (String) data.get("distance_trend");
            @SuppressWarnings("unchecked")
            List<Double> distanceHistoryKm = (List<Double>) data.get("distance_history_km");

            log.info("Extracted data:");
            log.info("- Satellites: {}", satellites);
            log.info("- Time: {}", time);
            log.info("- Distance: {} km", distanceKm);
            log.info("- Position1: {}", position1Km);
            log.info("- Position2: {}", position2Km);
            log.info("- Danger Level: {}", dangerLevel);
            log.info("- Trend: {}", trend);
            log.info("- Distance Trend: {}", distanceTrend);
            log.info("- Distance History: {}", distanceHistoryKm);

            // Create CollisionAlert object
            CollisionAlert alert = new CollisionAlert();
            alert.setSatellites(satellites);
            alert.setTime(time);
            alert.setDistanceKm(distanceKm);
            alert.setPosition1Km(position1Km);
            alert.setPosition2Km(position2Km);
            alert.setDangerLevel(dangerLevel);
            alert.setTrend(trend);
            alert.setDistanceTrend(distanceTrend);
            alert.setDistanceHistoryKm(distanceHistoryKm);

            // Save to MongoDB
            log.info("Attempting to save to MongoDB...");
            mongoTemplate.save(alert);
            log.info("Successfully saved to MongoDB:");
            log.info("- Document ID: {}", alert.getId());
            log.info("- Collection: {}", mongoTemplate.getCollectionName(CollisionAlert.class));
            
            // Acknowledge the message
            ack.acknowledge();
            log.info("Message acknowledged");
            
            log.info("=== Message processing completed successfully ===");
            
        } catch (Exception e) {
            log.error("=== Error processing message ===");
            log.error("Raw message that caused error: {}", message);
            log.error("Error type: {}", e.getClass().getName());
            log.error("Error message: {}", e.getMessage());
            log.error("Stack trace:", e);
            log.error("=== End of error details ===");
            
            // Don't acknowledge the message on error
            // This will cause the message to be redelivered
            throw new RuntimeException("Failed to process message", e);
        }
    }
} 