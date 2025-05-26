package org.example.healthmonitoringservice.Controllers;

import lombok.AllArgsConstructor;
import org.example.healthmonitoringservice.DTOs.HealthStatusDTO;
import org.example.healthmonitoringservice.Repositories.HealthStatusRepository;
import org.example.healthmonitoringservice.Services.interfaces.HealthStatusService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/health/")
@AllArgsConstructor
public class HealthStatusController {

    private final HealthStatusRepository healthStatusRepository;
    private final HealthStatusService healthStatusService;


    @GetMapping("/getHealthStatusForSatellites")
    public String health() {
        var all = healthStatusRepository.findAll();
        System.out.println("All Health Records:");
        all.forEach(System.out::println);
        return all.toString();
    }

    @GetMapping("/getLatestHealthStatus/{norad_id}")
    public ResponseEntity<HealthStatusDTO> getLatestStatus(@PathVariable("norad_id") Integer satelliteId) {
        System.out.println("Fetching latest status for NORAD ID: " + satelliteId);

        HealthStatusDTO dto = healthStatusService.getLatestStatusForSatellite(satelliteId);

        if (dto != null) {
            System.out.println("Found HealthStatusDTO: " + dto);
            return ResponseEntity.ok(dto);
        } else {
            System.out.println("No status found for NORAD ID: " + satelliteId);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/getAllHealthStatus/{norad_id}")
    public ResponseEntity<List<HealthStatusDTO>> getAllHealthStatuses(@PathVariable("norad_id") Integer satelliteId) {
        List<HealthStatusDTO> dtos = healthStatusService.getAllStatusesForSatellite(satelliteId);
        if (dtos.isEmpty()) {
            return ResponseEntity.notFound().build();
        } else {
            return ResponseEntity.ok(dtos);
        }
    }

}
