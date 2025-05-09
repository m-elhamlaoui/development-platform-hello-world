package org.example.healthmonitoringservice.Controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/health/")
public class HealthStatusController {

    @GetMapping("/getHealthStatusForSatellites")
    public String health() {

        return "i am healthy";
    }
}
