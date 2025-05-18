package org.example.endoflifeservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.example.endoflifeservice.model.EolModel;
import org.example.endoflifeservice.repository.EolRepository;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
@Slf4j
public class EndOfLifeListener {
    private static final org.slf4j.Logger log = LoggerFactory.getLogger(EndOfLifeListener.class);

    private static final String KAFKA_TOPIC = "eol_predictions";
    private static final String GROUP_ID = "tle_data_group";

    @Autowired
    private EolRepository repository;

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

            // Parse message into a Map
            Map<String, Object> data = objectMapper.readValue(message, Map.class);
            log.info("Successfully parsed message into Map: {}", data);

            // Build EolModel from parsed data
            EolModel model = new EolModel();

            model.setNorad(((Number) data.get("satellite_id")).intValue());
            model.setEccentricity(((Number) data.get("eccentricity")).doubleValue());
            model.setOrbital_velocity_approx(((Number) data.get("orbital_velocity_approx")).doubleValue());
            model.setRaan(((Number) data.get("raan")).doubleValue());
            model.setCollision_warning(((Number) data.get("collision_warning")).intValue());
            model.setOrbital_altitude(((Number) data.get("orbital_altitude")).doubleValue());
            model.setLine1_epoch(((Number) data.get("line1_epoch")).doubleValue());
            model.setMotion_launch_interaction(((Number) data.get("motion_launch_interaction")).doubleValue());
            model.setMean_motion(((Number) data.get("mean_motion")).doubleValue());
            model.setPrediction(((Number) data.get("prediction")).doubleValue());


            // Convert ISO timestamp to LocalDateTime
            Object timestampObj = data.get("timestamp");
            if (timestampObj != null && timestampObj instanceof String timestampStr && !timestampStr.isBlank()) {
                model.setTimestamp(LocalDateTime.parse(timestampStr));
            } else {
                log.warn("⚠️ Missing or invalid timestamp in message: {}", message);
                model.setTimestamp(LocalDateTime.now()); // or handle differently if timestamp is required
            }


            // Save to MongoDB
            repository.save(model);
            log.info("✅ EolModel successfully saved to MongoDB");

            // Acknowledge message
            ack.acknowledge();
            log.info("✅ Kafka message acknowledged");

        } catch (Exception e) {
            log.error("=== Error processing message ===");
            log.error("Raw message that caused error: {}", message);
            log.error("Error type: {}", e.getClass().getName());
            log.error("Error message: {}", e.getMessage());
            log.error("Stack trace:", e);
            log.error("=== End of error details ===");

            throw new RuntimeException("Failed to process message", e);
        }
    }
}
