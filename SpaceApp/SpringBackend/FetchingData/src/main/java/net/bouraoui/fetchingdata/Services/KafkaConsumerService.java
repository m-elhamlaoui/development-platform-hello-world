package net.bouraoui.fetchingdata.Services;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class KafkaConsumerService {

    private static final String KAFKA_TOPIC = "dataUpdates";
    private static final String TOPIC_HEALTH = "health";
    private static final String TOPIC_ENDOFLIFE = "endoflife";
    private static final String TOPIC_COLLISION = "collision";

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @KafkaListener(topics = KAFKA_TOPIC, groupId = "tle_data_group")
    public void receiveData(String message) {
        try {
            System.out.println("Received data from Kafka: " + message);

            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> receivedData = objectMapper.readValue(message, Map.class);

            Integer satelliteId = (Integer) receivedData.get("satellite_id");
            String satelliteName = (String) receivedData.get("satellite_name");
            String tleLine1 = (String) receivedData.get("tle_line1");
            String tleLine2 = (String) receivedData.get("tle_line2");
            Integer timeSinceLaunch = (Integer) receivedData.get("time_since_launch");
            Float orbitalAltitude = (Float) receivedData.get("orbital_altitude");
            Float batteryVoltage = (Float) receivedData.get("battery_voltage");
            Float solarPanelTemperature = (Float) receivedData.get("solar_panel_temperature");
            Float attitudeControlError = (Float) receivedData.get("attitude_control_error");
            Float dataTransmissionRate = (Float) receivedData.get("data_transmission_rate");
            Float thermalControlStatus = (Float) receivedData.get("thermal_control_status");

            System.out.println("Processing Satellite Data - ID: " + satelliteId + ", Name: " + satelliteName);

            // Send data to respective topics
            sendToHealthTopic(satelliteId, satelliteName, timeSinceLaunch, orbitalAltitude, batteryVoltage,
                    solarPanelTemperature, attitudeControlError, dataTransmissionRate, thermalControlStatus);
            sendToEndOfLifeTopic(satelliteId, satelliteName, tleLine1, tleLine2);
            sendToCollisionTopic(satelliteId, satelliteName, tleLine1, tleLine2);

        } catch (Exception e) {
            System.err.println("Error processing received Kafka message: " + e.getMessage());
        }
    }

    private void sendToHealthTopic(Integer satelliteId, String satelliteName, Integer timeSinceLaunch,
                                   Float orbitalAltitude, Float batteryVoltage, Float solarPanelTemperature,
                                   Float attitudeControlError, Float dataTransmissionRate, Float thermalControlStatus) {
        try {
            Map<String, Object> healthData = Map.of(
                    "satellite_id", satelliteId,
                    "satellite_name", satelliteName,
                    "time_since_launch", timeSinceLaunch,
                    "orbital_altitude", orbitalAltitude,
                    "battery_voltage", batteryVoltage,
                    "solar_panel_temperature", solarPanelTemperature,
                    "attitude_control_error", attitudeControlError,
                    "data_transmission_rate", dataTransmissionRate,
                    "thermal_control_status", thermalControlStatus
            );
            String message = new ObjectMapper().writeValueAsString(healthData);
            kafkaTemplate.send(TOPIC_HEALTH, message);
            System.out.println("Health data sent to topic: " + TOPIC_HEALTH);
        } catch (Exception e) {
            System.err.println("Error sending to Health Topic: " + e.getMessage());
        }
    }

    private void sendToEndOfLifeTopic(Integer satelliteId, String satelliteName, String tleLine1, String tleLine2) {
        try {
            Map<String, Object> endOfLifeData = Map.of(
                    "satellite_id", satelliteId,
                    "satellite_name", satelliteName,
                    "tle_line1", tleLine1,
                    "tle_line2", tleLine2
            );
            String message = new ObjectMapper().writeValueAsString(endOfLifeData);
            kafkaTemplate.send(TOPIC_ENDOFLIFE, message);
            System.out.println("End-of-life data sent to topic: " + TOPIC_ENDOFLIFE);
        } catch (Exception e) {
            System.err.println("Error sending to End-of-life Topic: " + e.getMessage());
        }
    }

    private void sendToCollisionTopic(Integer satelliteId, String satelliteName, String tleLine1, String tleLine2) {
        try {
            Map<String, Object> collisionData = Map.of(
                    "satellite_id", satelliteId,
                    "satellite_name", satelliteName,
                    "tle_line1", tleLine1,
                    "tle_line2", tleLine2
            );
            String message = new ObjectMapper().writeValueAsString(collisionData);
            kafkaTemplate.send(TOPIC_COLLISION, message);
            System.out.println("Collision data sent to topic: " + TOPIC_COLLISION);
        } catch (Exception e) {
            System.err.println("Error sending to Collision Topic: " + e.getMessage());
        }
    }
}
