package org.example.endoflifeservice.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.List;

@Service
public interface SatelliteDataService {
    Map<String, Object> getSatelliteDetails(int noradId);
    List<Map<String, Object>> getAllSatellitesWithDetails();
    Map<String, Object> getSatelliteHealth(int noradId);
    Map<String, Object> getSatelliteEolStatus(int noradId);
    public List<Map<String, Object>> getAllSatellites();
} 