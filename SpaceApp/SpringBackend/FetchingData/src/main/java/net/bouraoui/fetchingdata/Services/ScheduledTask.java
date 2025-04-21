package net.bouraoui.fetchingdata.Services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class ScheduledTask {

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @Autowired
    private TLEDataService tleDataService;

    private static final String KAFKA_TOPIC = "dataUpdates";



    @Scheduled(fixedRate = 3600000)
    public void updateTLEData() throws JsonProcessingException {
        Integer[] satelliteIds = {4000, 5000};
        for (Integer satelliteId : satelliteIds) {


            String tleData = tleDataService.fetchAndSaveTLEData(satelliteId);
            System.out.println("tle data: "+tleData);
            if(tleData!=null) {
                String[] lines = tleData.split("\n");


                String satelliteName = lines[1].split(": ")[1];
                String tleLine1 = lines[2].split(": ")[1];
                String tleLine2 = lines[3].split(": ")[1];
                Map<String, Object> tleDataMap = new HashMap<>();
                tleDataMap.put("satellite_id", satelliteId);
                tleDataMap.put("satellite_name", satelliteName);
                tleDataMap.put("tle_line1", tleLine1);
                tleDataMap.put("tle_line2", tleLine2);


                ObjectMapper objectMapper = new ObjectMapper();
                String jsonString = objectMapper.writeValueAsString(tleDataMap);
                if (tleData != null) {
                    kafkaTemplate.send(KAFKA_TOPIC, jsonString);
                    System.out.println("Updated and sent data for satellite ID: " + satelliteId + " to Kafka: " + tleData);
                }
            }
        }
    }
}

