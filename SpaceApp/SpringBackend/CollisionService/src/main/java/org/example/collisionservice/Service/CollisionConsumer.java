package org.example.collisionservice.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.collisionservice.Model.Collision;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CollisionConsumer {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = "satellite-collisions", groupId = "collision-group")
    public void consumeMessage(String message) {
        try {
            System.out.println("Raw message: " + message); // Log raw JSON
            List<Collision> collisions = objectMapper.readValue(message, new TypeReference<List<Collision>>() {});
            System.out.println("🚀 Collision Predictions Received:");
            System.out.println("Collisions: " + collisions);
        } catch (Exception e) {
            System.err.println("❌ Failed to process message: " + message);
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}