package org.example.healthmonitoringservice.TestsUnitaires;

import org.example.healthmonitoringservice.Entities.HealthStatus;
import org.example.healthmonitoringservice.Repositories.HealthStatusRepository;
import org.example.healthmonitoringservice.Services.ConsumingData;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import org.mockito.*;

import static org.mockito.Mockito.*;


import static org.mockito.Mockito.times;

public class ConsumingDataTest {

    @Mock
    private HealthStatusRepository healthStatusRepository;

    @InjectMocks
    private ConsumingData consumingData;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void receiveData_shouldSaveCorrectlyDeserializedHealthStatus() throws Exception {
        String message = "{\"features\":{\"satellite_id\":12345,\"satellite_name\":\"NORSAT 1\",\"time_since_launch\":2864,\"orbital_altitude\":585,\"battery_voltage\":20.58,\"solar_panel_temperature\":25.8,\"attitude_control_error\":3.05,\"data_transmission_rate\":79.98,\"thermal_control_status\":1},\"prediction\":0.0,\"probability\":0.000028,\"explanation\":{\"thermal_control_status\":0.01,\"time_since_launch\":0.58,\"battery_voltage\":-9.06}}";



        consumingData.receiveData(message);


        ArgumentCaptor<HealthStatus> captor = ArgumentCaptor.forClass(HealthStatus.class);
        verify(healthStatusRepository, times(1)).save(captor.capture());

        HealthStatus saved = captor.getValue();
        assert saved.getNoradId() == 12345;
        assert saved.getSatelliteName().equals("NORSAT 1");
        assert saved.getPrediction() == 0.0f;
        assert saved.getExplanation().get("thermal_control_status") == 0.01f;
    }
}
