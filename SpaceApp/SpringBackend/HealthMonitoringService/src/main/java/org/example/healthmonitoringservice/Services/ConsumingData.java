package org.example.healthmonitoringservice.Services;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class ConsumingData {

    private static final String KAFKA_TOPIC = "health";

    @KafkaListener(topics = KAFKA_TOPIC, groupId = "tle_data_group")
    public void receiveData(String message){
        try{
            System.out.println("Received data");
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> receivedData = objectMapper.readValue(message, Map.class);


            Integer satelliteId = (Integer) receivedData.get("satellite_id");
            String satelliteName = (String) receivedData.get("satellite_name");
            String tleLine1 = (String) receivedData.get("tle_line1");
            String tleLine2 = (String) receivedData.get("tle_line2");
            Integer time_since_launch = (Integer) receivedData.get("time_since_launch");
            Float orbital_altitude = (Float) receivedData.get("orbital_altitude");
            Float battery_voltage = (Float) receivedData.get("battery_voltage");
            Float solar_panel_temperature = (Float) receivedData.get("solar_panel_temperature");
            Float attitude_control_error = (Float) receivedData.get("attitude_control_error");
            Float data_transmission_rate = (Float) receivedData.get("data_transmission_rate");
            Float thermal_control_status = (Float) receivedData.get("thermal_control_status");
            Float prediction = (Float) receivedData.get("prediction");
            System.out.println("Received TLE Data - Satellite ID: " + satelliteId + ", Name: " + satelliteName);

        }catch(Exception e){
            e.printStackTrace();
        }
    }
}
