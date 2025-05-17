package org.example.healthmonitoringservice.Controllers;

import lombok.AllArgsConstructor;
import org.example.healthmonitoringservice.DTOs.HealthStatusDTO;
import org.example.healthmonitoringservice.Repositories.HealthStatusRepository;
import org.example.healthmonitoringservice.Services.interfaces.HealthStatusService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/health/")
@AllArgsConstructor
public class HealthStatusController {

    private final HealthStatusRepository healthStatusRepository;

    private final HealthStatusService healthStatusService;

    @GetMapping("/getHealthStatusForSatellites")
    public String health() {
        return healthStatusRepository.findAll().toString();
    }

    @GetMapping("/getLatestHealthStatus/{satelliteId}")
    public ResponseEntity<HealthStatusDTO> getLatestStatus(@PathVariable("satelliteId") Integer satelliteId) {
        HealthStatusDTO dto = healthStatusService.getLatestStatusForSatellite(satelliteId);

        if (dto != null) {
            return ResponseEntity.ok(dto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
