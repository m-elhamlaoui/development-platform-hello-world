package org.example.endoflifeservice.controller;

import org.example.endoflifeservice.service.EolService;
import org.example.endoflifeservice.service.SatelliteDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/eol")

public class EolController {

    @Autowired
    private EolService eolService;

    @Autowired
    private SatelliteDataService satelliteDataService;


    @GetMapping("/satellites")
    public ResponseEntity<List<Map<String, Object>>> getSatellites() {
        return ResponseEntity.ok(satelliteDataService.getAllSatellites());
    }

    @GetMapping("/metrics/{satelliteId}")
    public ResponseEntity<Map<String, Object>> getMetrics(@PathVariable int satelliteId) {
        return ResponseEntity.ok(eolService.getMetrics(satelliteId));
    }

    @GetMapping("/forecast/{satelliteId}")
    public ResponseEntity<Map<String, Object>> getForecast(@PathVariable int satelliteId) {
        return ResponseEntity.ok(eolService.getForecast(satelliteId));
    }

    @GetMapping("/alerts/{satelliteId}")
    public ResponseEntity<List<Map<String, Object>>> getAlerts(@PathVariable int satelliteId) {
        return ResponseEntity.ok(eolService.getAlerts(satelliteId));
    }

    @GetMapping("/timeline/{satelliteId}")
    public ResponseEntity<Map<String, List<Map<String, Object>>>> getTimeline(@PathVariable int satelliteId) {
        return ResponseEntity.ok(eolService.getTimeline(satelliteId));
    }

    @GetMapping("/disposal-options/{satelliteId}")
    public ResponseEntity<List<Map<String, Object>>> getDisposalOptions(@PathVariable int satelliteId) {
        return ResponseEntity.ok(eolService.getDisposalOptions(satelliteId));
    }
} 