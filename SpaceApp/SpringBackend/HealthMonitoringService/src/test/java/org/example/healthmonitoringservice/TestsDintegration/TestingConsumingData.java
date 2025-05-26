package org.example.healthmonitoringservice.TestsDintegration;

import org.example.healthmonitoringservice.Repositories.HealthStatusRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.test.EmbeddedKafkaBroker;
import org.springframework.kafka.test.context.EmbeddedKafka;

import static org.junit.jupiter.api.Assertions.assertTrue;


@EmbeddedKafka(topics = "healthPrediction")
@SpringBootTest
class TestingConsumingData {

    @Autowired
    private KafkaTemplate<String, String> template;

    @Autowired
    private HealthStatusRepository repo;

    @Test
    void whenMessageSent_thenSavedToDb() throws InterruptedException {
        String json = "{\"features\":{\"satellite_id\":12345,\"satellite_name\":\"NORSAT 1\","
                + "\"time_since_launch\":2864,\"orbital_altitude\":585,\"battery_voltage\":20.58,"
                + "\"solar_panel_temperature\":25.8,\"attitude_control_error\":3.05,"
                + "\"data_transmission_rate\":79.98,\"thermal_control_status\":1},"
                + "\"prediction\":0.0,\"probability\":0.000028,"
                + "\"explanation\":{\"thermal_control_status\":0.01,\"time_since_launch\":0.58,"
                + "\"battery_voltage\":-9.06}}";
        template.send("healthPrediction", json);

        Thread.sleep(500);

        assertTrue(repo.findAll().size() > 0);
    }
}

