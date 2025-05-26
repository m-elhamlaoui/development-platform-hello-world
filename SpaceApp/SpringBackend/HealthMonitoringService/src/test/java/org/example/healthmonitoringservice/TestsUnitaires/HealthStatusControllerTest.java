package org.example.healthmonitoringservice.TestsUnitaires;

import org.example.healthmonitoringservice.Controllers.HealthStatusController;
import org.example.healthmonitoringservice.DTOs.HealthStatusDTO;
import org.example.healthmonitoringservice.Repositories.HealthStatusRepository;
import org.example.healthmonitoringservice.Services.interfaces.HealthStatusService;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class HealthStatusControllerTest {

    @Mock
    private HealthStatusRepository healthStatusRepository;

    @Mock
    private HealthStatusService healthStatusService;

    @InjectMocks
    private HealthStatusController controller;

    public HealthStatusControllerTest() {
        MockitoAnnotations.openMocks(this); // Init mocks
    }

    @Test
    void getLatestStatus_returnsOk_whenFound() {
        Integer satelliteId = 12345;
        HealthStatusDTO dto = new HealthStatusDTO(); // Remplis si besoin

        when(healthStatusService.getLatestStatusForSatellite(satelliteId)).thenReturn(dto);

        ResponseEntity<HealthStatusDTO> resp = controller.getLatestStatus(satelliteId);

        assertEquals(200, resp.getStatusCodeValue());
        assertEquals(dto, resp.getBody());
    }

    @Test
    void getLatestStatus_returnsNotFound_whenNull() {
        Integer satelliteId = 12345;
        when(healthStatusService.getLatestStatusForSatellite(satelliteId)).thenReturn(null);

        ResponseEntity<HealthStatusDTO> resp = controller.getLatestStatus(satelliteId);

        assertEquals(404, resp.getStatusCodeValue());
    }

    @Test
    void getAllHealthStatuses_returnsOk_whenListNotEmpty() {
        Integer satelliteId = 12345;
        List<HealthStatusDTO> dtos = List.of(new HealthStatusDTO());

        when(healthStatusService.getAllStatusesForSatellite(satelliteId)).thenReturn(dtos);

        ResponseEntity<List<HealthStatusDTO>> resp = controller.getAllHealthStatuses(satelliteId);

        assertEquals(200, resp.getStatusCodeValue());
        assertEquals(dtos, resp.getBody());
    }

    @Test
    void getAllHealthStatuses_returnsNotFound_whenEmpty() {
        Integer satelliteId = 12345;
        when(healthStatusService.getAllStatusesForSatellite(satelliteId)).thenReturn(Collections.emptyList());

        ResponseEntity<List<HealthStatusDTO>> resp = controller.getAllHealthStatuses(satelliteId);

        assertEquals(404, resp.getStatusCodeValue());
    }
}