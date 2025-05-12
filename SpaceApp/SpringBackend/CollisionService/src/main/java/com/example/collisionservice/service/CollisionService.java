package com.example.collisionservice.service;

import com.example.collisionservice.dto.CollisionAlert;
import com.example.collisionservice.dto.Satellite;
import com.example.collisionservice.dto.CollisionStats;
import com.example.collisionservice.dto.TimelineData;
import com.example.collisionservice.model.CollisionAlertModel;
import com.example.collisionservice.repository.CollisionAlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.util.HashSet;
import java.util.Set;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.HashMap;
import java.util.TreeMap;
import java.util.stream.IntStream;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Criteria;

@Service
public class CollisionService {

    @Autowired
    private CollisionAlertRepository collisionAlertRepository;

    public List<CollisionAlert> getCollisions() {
        List<CollisionAlertModel> models = collisionAlertRepository.findAll();
        return models.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public List<Satellite> getSatellites() {
        List<CollisionAlertModel> alerts = collisionAlertRepository.findAll();
        Map<String, CollisionAlertModel> latestAlerts = new HashMap<>();
        List<Satellite> satellites = new ArrayList<>();

        // Find the latest alert for each satellite
        for (CollisionAlertModel alert : alerts) {
            if (alert.getSatellites() != null) {
                for (String satelliteName : alert.getSatellites()) {
                    CollisionAlertModel existingAlert = latestAlerts.get(satelliteName);
                    if (existingAlert == null || alert.getTime().compareTo(existingAlert.getTime()) > 0) {
                        latestAlerts.put(satelliteName, alert);
                    }
                }
            }
        }

        // Create satellite objects with actual position data
        for (Map.Entry<String, CollisionAlertModel> entry : latestAlerts.entrySet()) {
            String satelliteName = entry.getKey();
            CollisionAlertModel alert = entry.getValue();
            
            Satellite satellite = new Satellite();
            satellite.setId(satellites.size() + 1);
            satellite.setName(satelliteName);
            satellite.setOrbitType(alert.getOrbitType() != null ? alert.getOrbitType() : "UNKNOWN");
            satellite.setStatus(alert.getStatus() != null ? alert.getStatus() : "UNKNOWN");
            satellite.setLastUpdate(alert.getTime());
            
            // Set position based on which satellite in the pair this is
            Satellite.Position position = new Satellite.Position();
            List<Double> positionData = alert.getSatellites().indexOf(satelliteName) == 0 
                ? alert.getPosition1Km() 
                : alert.getPosition2Km();
            
            if (positionData != null && positionData.size() >= 3) {
                position.setX(positionData.get(0));
                position.setY(positionData.get(1));
                position.setZ(positionData.get(2));
            }
            satellite.setPosition(position);
            
            satellites.add(satellite);
        }

        return satellites;
    }

    public CollisionStats getStats() {
        List<CollisionAlertModel> allAlerts = collisionAlertRepository.findAll();
        
        CollisionStats stats = new CollisionStats();
        
        // Get highest danger level for each unique pair
        Map<String, String> pairHighestDanger = new HashMap<>();
        for (CollisionAlertModel alert : allAlerts) {
            if (alert.getSatellites() != null && alert.getSatellites().size() >= 2) {
                String pair = alert.getSatellites().stream()
                    .sorted()
                    .collect(Collectors.joining("-"));
                String currentDanger = alert.getDangerLevel();
                String existingDanger = pairHighestDanger.get(pair);
                
                // Update if current danger is higher than existing
                if (existingDanger == null || getDangerLevelWeight(currentDanger) > getDangerLevelWeight(existingDanger)) {
                    pairHighestDanger.put(pair, currentDanger);
                }
            }
        }
        
        stats.setTotalCollisions(pairHighestDanger.size());
        
        // Count active alerts (alerts from the last 24 hours)
        long activeAlerts = allAlerts.stream()
            .filter(alert -> {
                try {
                    LocalDateTime alertTime = LocalDateTime.parse(alert.getTime());
                    return alertTime.isAfter(LocalDateTime.now().minusHours(24));
                } catch (Exception e) {
                    return false;
                }
            })
            .count();
        stats.setActiveAlerts((int) activeAlerts);
        
        // Count pairs by their highest danger level
        Map<String, Integer> dangerLevelCounts = new HashMap<>();
        for (String dangerLevel : pairHighestDanger.values()) {
            dangerLevelCounts.merge(dangerLevel, 1, Integer::sum);
        }
        
        CollisionStats.DangerLevels dangerLevels = new CollisionStats.DangerLevels();
        dangerLevels.setLOW(dangerLevelCounts.getOrDefault("LOW", 0));
        dangerLevels.setMODERATE(dangerLevelCounts.getOrDefault("MODERATE", 0));
        dangerLevels.setHIGH(dangerLevelCounts.getOrDefault("HIGH", 0));
        dangerLevels.setCRITICAL(dangerLevelCounts.getOrDefault("CRITICAL", 0));
        stats.setDangerLevels(dangerLevels);
        
        // Get recent collisions (last 5 alerts)
        List<CollisionAlert> recentCollisions = allAlerts.stream()
            .sorted((a1, a2) -> a2.getTime().compareTo(a1.getTime()))
            .limit(5)
            .map(this::convertToDto)
            .collect(Collectors.toList());
        stats.setRecentCollisions(recentCollisions);
        
        return stats;
    }

    private int getDangerLevelWeight(String dangerLevel) {
        switch (dangerLevel.toUpperCase()) {
            case "CRITICAL": return 4;
            case "HIGH": return 3;
            case "MODERATE": return 2;
            case "LOW": return 1;
            default: return 0;
        }
    }

    public void saveCollisionAlert(CollisionAlertModel alert) {
        collisionAlertRepository.save(alert);
    }

    public void clearAllCollisions() {
        collisionAlertRepository.deleteAll();
    }

    public TimelineData getTimelineData() {
        List<CollisionAlertModel> alerts = collisionAlertRepository.findAll();
        
        // Group alerts by date
        Map<String, Map<String, Integer>> dateRiskCounts = new TreeMap<>();
        
        // Get all unique risk levels from the database
        Set<String> riskLevels = alerts.stream()
            .map(CollisionAlertModel::getDangerLevel)
            .collect(Collectors.toSet());
        
        for (CollisionAlertModel alert : alerts) {
            String date = alert.getTime().split("T")[0]; // Get just the date part
            String riskLevel = alert.getDangerLevel();
            
            dateRiskCounts.computeIfAbsent(date, k -> new HashMap<>());
            Map<String, Integer> riskCounts = dateRiskCounts.get(date);
            
            // Increment the count for this risk level
            riskCounts.merge(riskLevel, 1, Integer::sum);
        }
        
        // Convert to TimelineData format
        TimelineData timelineData = new TimelineData();
        List<String> labels = new ArrayList<>();
        List<Integer> highRisk = new ArrayList<>();
        List<Integer> mediumRisk = new ArrayList<>();
        List<Integer> lowRisk = new ArrayList<>();
        List<Integer> total = new ArrayList<>();
        
        for (Map.Entry<String, Map<String, Integer>> entry : dateRiskCounts.entrySet()) {
            String date = entry.getKey();
            Map<String, Integer> riskCounts = entry.getValue();
            
            labels.add(date);
            
            // Map risk levels to appropriate lists based on their severity
            for (String riskLevel : riskLevels) {
                int count = riskCounts.getOrDefault(riskLevel, 0);
                switch (riskLevel.toUpperCase()) {
                    case "HIGH":
                    case "CRITICAL":
                        highRisk.add(count);
                        break;
                    case "MODERATE":
                    case "MEDIUM":
                        mediumRisk.add(count);
                        break;
                    case "LOW":
                    case "MINOR":
                        lowRisk.add(count);
                        break;
                    default:
                        // For any other risk levels, add to medium risk as a fallback
                        mediumRisk.add(count);
                }
            }
            
            // Calculate total
            int totalForDate = riskCounts.values().stream().mapToInt(Integer::intValue).sum();
            total.add(totalForDate);
        }
        
        timelineData.setLabels(labels);
        timelineData.setHighRisk(highRisk);
        timelineData.setMediumRisk(mediumRisk);
        timelineData.setLowRisk(lowRisk);
        timelineData.setTotal(total);
        
        return timelineData;
    }

    public CollisionAlert getCollisionById(String id) {
        CollisionAlertModel model = collisionAlertRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Collision not found with id: " + id));
        return convertToDto(model);
    }

    private CollisionAlert convertToDto(CollisionAlertModel model) {
        if (model == null) return null;
        
        CollisionAlert dto = new CollisionAlert();
        dto.setId(model.getId());
        dto.setSatellites(model.getSatellites());
        dto.setTime(model.getTime());
        dto.setTrend(model.getTrend());
        dto.setDistanceKm(model.getDistanceKm());
        dto.setPosition1Km(model.getPosition1Km());
        dto.setPosition2Km(model.getPosition2Km());
        dto.setDangerLevel(model.getDangerLevel());
        dto.setDistanceTrend(model.getDistanceTrend());
        dto.setDistanceHistoryKm(model.getDistanceHistoryKm());
        
        return dto;
    }
} 