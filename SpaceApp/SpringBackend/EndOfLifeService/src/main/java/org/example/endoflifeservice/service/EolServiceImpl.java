package org.example.endoflifeservice.service;

import org.example.endoflifeservice.model.EolModel;
import org.example.endoflifeservice.repository.EolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class EolServiceImpl implements EolService {

    @Autowired
    private EolRepository eolRepository;



    @Override
    public Map<String, Object> getMetrics(int satelliteId) {
        EolModel satellite = eolRepository.findByNorad(satelliteId)
                .orElseThrow(() -> new RuntimeException("Satellite not found"));

        Map<String, Object> metrics = new HashMap<>();
        
        // Battery metrics based on prediction score
        Map<String, Object> battery = new HashMap<>();
        double batteryVoltage = 12.0 + (satellite.getPrediction() * 2);
        battery.put("voltage", batteryVoltage);
        battery.put("status", batteryVoltage < 11.5 ? "critical" : batteryVoltage < 12.0 ? "warning" : "normal");
        battery.put("percentage", (int)((batteryVoltage - 10.0) / 2.0 * 100));
        metrics.put("battery", battery);

        // Thermal metrics based on orbital parameters
        Map<String, Object> thermal = new HashMap<>();
        double temperature = 20.0 + (satellite.getOrbital_altitude() / 100);
        thermal.put("temperature", temperature);
        thermal.put("status", temperature > 45.0 ? "warning" : "normal");
        thermal.put("percentage", (int)((temperature - 20.0) / 30.0 * 100));
        metrics.put("thermal", thermal);

        // Performance metrics based on motion and velocity
        Map<String, Object> performance = new HashMap<>();
        double attitudeError = satellite.getMean_motion() / 1000;
        performance.put("attitudeError", attitudeError);
        performance.put("status", attitudeError > 0.05 ? "warning" : "normal");
        performance.put("percentage", (int)((0.1 - attitudeError) / 0.1 * 100));
        metrics.put("performance", performance);

        return metrics;
    }

    @Override
    public Map<String, Object> getForecast(int satelliteId) {
        EolModel satellite = eolRepository.findByNorad(satelliteId)
                .orElseThrow(() -> new RuntimeException("Satellite not found"));

        Map<String, Object> forecast = new HashMap<>();
        forecast.put("labels", Arrays.asList("2023", "2024", "2025", "2026", "2027", "2028"));
        
        List<Map<String, Object>> datasets = new ArrayList<>();
        
        double currentVoltage = 12.0 + (satellite.getPrediction() * 2);
        double currentTemp = 20.0 + (satellite.getOrbital_altitude() / 100);
        double currentAltitude = satellite.getOrbital_altitude();
        
        List<Double> voltageForecast = new ArrayList<>();
        List<Double> tempForecast = new ArrayList<>();
        List<Double> altitudeForecast = new ArrayList<>();
        
        for (int i = 0; i < 6; i++) {
            voltageForecast.add(currentVoltage - (i * 0.3));
            tempForecast.add(currentTemp + (i * 1.0));
            altitudeForecast.add(currentAltitude - (i * 3.0));
        }
        
        datasets.add(createDataset("Battery Voltage", voltageForecast, "#3b82f6"));
        datasets.add(createDataset("Solar Panel Temperature", tempForecast, "#ef4444"));
        datasets.add(createDataset("Orbital Altitude", altitudeForecast, "#10b981"));
        
        forecast.put("datasets", datasets);
        return forecast;
    }

    @Override
    public List<Map<String, Object>> getAlerts(int satelliteId) {
        List<Map<String, Object>> alerts = new ArrayList<>();
        
        EolModel satellite = eolRepository.findByNorad(satelliteId)
                .orElseThrow(() -> new RuntimeException("Satellite not found"));

        if (satellite.getCollision_warning() > 0) {
            alerts.add(createAlert(
                "Collision Warning",
                "Potential collision detected. Monitor closely.",
                "critical",
                satellite.getTimestamp().toString()
            ));
        }

        if (satellite.getOrbital_altitude() < 450) {
            alerts.add(createAlert(
                "Low Orbital Altitude",
                "Orbital altitude below optimal range.",
                "warning",
                satellite.getTimestamp().toString()
            ));
        }

        if (satellite.getPrediction() > 0.8) {
            alerts.add(createAlert(
                "High End-of-Life Risk",
                "Prediction score indicates high risk of system degradation.",
                "warning",
                satellite.getTimestamp().toString()
            ));
        }

        if (satellite.getEccentricity() > 0.1) {
            alerts.add(createAlert(
                "Orbital Eccentricity Warning",
                "Orbital eccentricity above normal range.",
                "warning",
                satellite.getTimestamp().toString()
            ));
        }

        return alerts;
    }

    @Override
    public Map<String, List<Map<String, Object>>> getTimeline(int satelliteId) {
        EolModel satellite = eolRepository.findByNorad(satelliteId)
                .orElseThrow(() -> new RuntimeException("Satellite not found"));

        Map<String, List<Map<String, Object>>> timeline = new HashMap<>();
        
        List<Map<String, Object>> history = new ArrayList<>();
        history.add(createTimelineEvent(
            satellite.getTimestamp().minusMonths(6).toString(),
            "EOL Planning Initiated",
            "End-of-life planning process started based on prediction score: " + satellite.getPrediction()
        ));
        
        if (satellite.getCollision_warning() > 0) {
            history.add(createTimelineEvent(
                satellite.getTimestamp().toString(),
                "Collision Warning Detected",
                "Collision warning level: " + satellite.getCollision_warning()
            ));
        }
        
        List<Map<String, Object>> upcoming = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        if (satellite.getPrediction() > 0.7) {
            upcoming.add(createTimelineEvent(
                now.plusMonths(3).toString(),
                "Deorbit Planning",
                "Detailed planning for deorbit maneuver based on current prediction score"
            ));
            upcoming.add(createTimelineEvent(
                now.plusMonths(6).toString(),
                "System Passivation",
                "Prepare for system passivation based on current metrics"
            ));
        }
        
        timeline.put("history", history);
        timeline.put("upcoming", upcoming);
        
        return timeline;
    }

    @Override
    public List<Map<String, Object>> getDisposalOptions(int satelliteId) {
        EolModel satellite = eolRepository.findByNorad(satelliteId)
                .orElseThrow(() -> new RuntimeException("Satellite not found"));

        List<Map<String, Object>> options = new ArrayList<>();
        
        boolean deorbitFeasible = satellite.getOrbital_altitude() < 600 && satellite.getPrediction() > 0.7;
        boolean graveyardFeasible = satellite.getOrbital_altitude() > 600;
        
        options.add(createDisposalOption(
            "deorbit",
            "Controlled Deorbit",
            "Based on current orbital altitude: " + satellite.getOrbital_altitude() + " km and prediction score: " + satellite.getPrediction(),
            deorbitFeasible ? "Feasible" : "Not Feasible",
            deorbitFeasible ? "Recommended" : "Not Recommended",
            "Complies with 25-year rule for LEO satellites."
        ));
        
        options.add(createDisposalOption(
            "graveyard",
            "Graveyard Orbit",
            "Current orbital altitude: " + satellite.getOrbital_altitude() + " km",
            graveyardFeasible ? "Feasible" : "Not Feasible",
            graveyardFeasible ? "Recommended" : "Not Recommended",
            graveyardFeasible ? "Applicable for GEO satellites" : "Not applicable for LEO satellites."
        ));
        
        options.add(createDisposalOption(
            "passivation",
            "Passivation",
            "Required based on prediction score: " + satellite.getPrediction(),
            "Feasible",
            "Required",
            "Required by international guidelines."
        ));
        
        return options;
    }

    private Map<String, Object> createDataset(String label, List<Double> data, String color) {
        Map<String, Object> dataset = new HashMap<>();
        dataset.put("label", label);
        dataset.put("data", data);
        dataset.put("borderColor", color);
        dataset.put("backgroundColor", color + "1A");
        return dataset;
    }

    private Map<String, Object> createAlert(String title, String description, String severity, String timestamp) {
        Map<String, Object> alert = new HashMap<>();
        alert.put("title", title);
        alert.put("description", description);
        alert.put("severity", severity);
        alert.put("timestamp", timestamp);
        return alert;
    }

    private Map<String, Object> createTimelineEvent(String date, String event, String description) {
        Map<String, Object> timelineEvent = new HashMap<>();
        timelineEvent.put("date", date);
        timelineEvent.put("event", event);
        timelineEvent.put("description", description);
        return timelineEvent;
    }

    private Map<String, Object> createDisposalOption(String id, String title, String description, 
            String feasibility, String recommendation, String complianceNote) {
        Map<String, Object> option = new HashMap<>();
        option.put("id", id);
        option.put("title", title);
        option.put("description", description);
        option.put("feasibility", feasibility);
        option.put("recommendation", recommendation);
        option.put("complianceNote", complianceNote);
        return option;
    }
} 