package org.example.healthmonitoringservice.TestsDintegration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.healthmonitoringservice.Controllers.HealthStatusController;
import org.example.healthmonitoringservice.DTOs.HealthStatusDTO;
import org.example.healthmonitoringservice.Services.interfaces.HealthStatusService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(HealthStatusController.class)
class HealthStatusControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private HealthStatusService healthStatusService;

    @MockitoBean
    private org.example.healthmonitoringservice.Repositories.HealthStatusRepository healthStatusRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void getLatestStatus_returnsOk() throws Exception {
        Integer satelliteId = 12345;
        HealthStatusDTO dto = new HealthStatusDTO();
        when(healthStatusService.getLatestStatusForSatellite(satelliteId)).thenReturn(dto);

        mockMvc.perform(get("/api/v1/health/getLatestHealthStatus/{norad_id}", satelliteId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    void getAllHealthStatuses_returnsOk() throws Exception {
        Integer satelliteId = 12345;
        List<HealthStatusDTO> dtos = List.of(new HealthStatusDTO());
        when(healthStatusService.getAllStatusesForSatellite(satelliteId)).thenReturn(dtos);

        mockMvc.perform(get("/api/v1/health/getAllHealthStatus/{norad_id}", satelliteId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }
}
