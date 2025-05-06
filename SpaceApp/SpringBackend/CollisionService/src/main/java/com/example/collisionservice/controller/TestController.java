package com.example.collisionservice.controller;

import com.example.collisionservice.model.CollisionAlert;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@Slf4j
public class TestController {

    private static final String TOPIC = "collision_alerts";

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping("/kafka/send")
    public ResponseEntity<Map<String, Object>> testKafka() {
        Map<String, Object> response = new HashMap<>();
        try {
            // Create a test collision alert
            Map<String, Object> testMessage = new HashMap<>();
            testMessage.put("satellites", Arrays.asList("TEST-SAT-1", "TEST-SAT-2"));
            testMessage.put("time", "2025-05-04T02:43:50Z");
            testMessage.put("distance_km", 100.5);
            testMessage.put("position1_km", Arrays.asList(1.0, 2.0, 3.0));
            testMessage.put("position2_km", Arrays.asList(4.0, 5.0, 6.0));
            testMessage.put("danger_level", "LOW");
            testMessage.put("trend", "STABLE");
            testMessage.put("distance_trend", "CONSTANT");
            testMessage.put("distance_history_km", Arrays.asList(101.0, 100.8, 100.5));

            // Convert to JSON string
            String messageJson = objectMapper.writeValueAsString(testMessage);
            
            log.info("Sending test message to Kafka: {}", messageJson);
            
            // Send message
            Message<String> message = MessageBuilder
                .withPayload(messageJson)
                .setHeader(KafkaHeaders.TOPIC, TOPIC)
                .build();
                
            kafkaTemplate.send(message);
            
            response.put("status", "success");
            response.put("message", "Test message sent successfully");
            response.put("testData", testMessage);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error sending test message", e);
            response.put("status", "error");
            response.put("message", "Failed to send test message: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/kafka/status")
    public ResponseEntity<Map<String, Object>> getKafkaStatus() {
        Map<String, Object> status = new HashMap<>();
        
        try {
            status.put("producer_configured", kafkaTemplate != null);
            status.put("topic", TOPIC);
            status.put("bootstrap_servers", kafkaTemplate.getProducerFactory().getConfigurationProperties().get("bootstrap.servers"));
            
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            log.error("Error getting Kafka status", e);
            status.put("status", "error");
            status.put("message", "Failed to get Kafka status: " + e.getMessage());
            return ResponseEntity.internalServerError().body(status);
        }
    }
} 