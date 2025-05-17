package org.example.healthmonitoringservice.Services;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.healthmonitoringservice.Entities.HealthStatus;
import org.example.healthmonitoringservice.Repositories.HealthStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class ConsumingData {

    private static final String KAFKA_TOPIC = "healthPrediction";

    @Autowired
    private HealthStatusRepository hsRepository;

    @KafkaListener(topics = KAFKA_TOPIC, groupId = "tle_data_group")
    public void receiveData(String message){
        try{
            System.out.println("Received data");
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> receivedData = objectMapper.readValue(message, Map.class);

            HealthStatus healthStatusData = new HealthStatus();

            Map<String, Object> features = (Map<String, Object>) receivedData.get("features");

            healthStatusData.setNorad_id((Integer) features.get("satellite_id"));
            healthStatusData.setSatelliteName((String) features.get("satellite_name"));
            healthStatusData.setTimeSinceLaunch((Integer) features.get("time_since_launch"));
            healthStatusData.setOrbitalAltitude((Integer) features.get("orbital_altitude"));
            healthStatusData.setBatteryVoltage(Float.parseFloat(features.get("battery_voltage").toString()));
            healthStatusData.setSolarPanelTemperature(Float.parseFloat(features.get("solar_panel_temperature").toString()));
            healthStatusData.setAttitudeControlError(Float.parseFloat(features.get("attitude_control_error").toString()));
            healthStatusData.setDataTransmissionRate(Float.parseFloat(features.get("data_transmission_rate").toString()));
            healthStatusData.setThermalControlStatus((Integer) features.get("thermal_control_status"));

// Now set prediction and probability
            healthStatusData.setPrediction(Float.parseFloat(receivedData.get("prediction").toString()));
            healthStatusData.setProbability(Float.parseFloat(receivedData.get("probability").toString()));

// Explanation parsing remains the same
            Map<String, Object> rawExplanation = (Map<String, Object>) receivedData.get("explanation");
            Map<String, Float> explanation = rawExplanation.entrySet().stream()
                    .collect(Collectors.toMap(
                            Map.Entry::getKey,
                            e -> Float.parseFloat(e.getValue().toString())
                    ));
            healthStatusData.setExplanation(explanation);
            healthStatusData.setTimestamp(LocalDateTime.now().withMinute(0).withSecond(0).withNano(0));


            hsRepository.save(healthStatusData);
            System.out.println("Received TLE Data - Satellite ID: " + healthStatusData.getNorad_id() + ", Name: " + healthStatusData.getSatelliteName());

        }catch(Exception e){
            e.printStackTrace();
        }
    }
}
