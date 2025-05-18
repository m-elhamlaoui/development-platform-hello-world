package org.example.endoflifeservice.controller;

import org.example.endoflifeservice.model.HealthStatus;
import org.example.endoflifeservice.repository.HealthStatusRepository;
import org.example.endoflifeservice.service.SatelliteDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/satellites")

public class SatelliteDataController {

    @Autowired
    private SatelliteDataService satelliteDataService;

    @Autowired
    private HealthStatusRepository healthStatusRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllSatellites() {
        return ResponseEntity.ok(satelliteDataService.getAllSatellitesWithDetails());
    }

    @GetMapping("/{noradId}")
    public ResponseEntity<Map<String, Object>> getSatelliteDetails(@PathVariable int noradId) {
        return ResponseEntity.ok(satelliteDataService.getSatelliteDetails(noradId));
    }

    @GetMapping("/{noradId}/health")
    public ResponseEntity<?> getSatelliteHealth(@PathVariable int noradId) {
        return ResponseEntity.ok(satelliteDataService.getSatelliteHealth(noradId));
    }

    @GetMapping("/{noradId}/health2")
    public ResponseEntity<?> getSatelliteHealth2(@PathVariable int noradId) {
        return ResponseEntity.ok( healthStatusRepository.findByNoradId(noradId));
    }

    @GetMapping("/{noradId}/eol")
    public ResponseEntity<Map<String, Object>> getSatelliteEolStatus(@PathVariable int noradId) {
        return ResponseEntity.ok(satelliteDataService.getSatelliteEolStatus(noradId));
    }
} 