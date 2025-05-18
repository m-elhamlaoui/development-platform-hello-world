package org.example.endoflifeservice.service;

import org.example.endoflifeservice.model.EolModel;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public interface EolService {
    Map<String, Object> getMetrics(int satelliteId);
    Map<String, Object> getForecast(int satelliteId);
    List<Map<String, Object>> getAlerts(int satelliteId);
    Map<String, List<Map<String, Object>>> getTimeline(int satelliteId);
    List<Map<String, Object>> getDisposalOptions(int satelliteId);
} 