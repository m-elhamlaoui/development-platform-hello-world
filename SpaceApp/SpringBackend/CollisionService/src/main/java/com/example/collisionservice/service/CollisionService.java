package com.example.collisionservice.service;

import com.example.collisionservice.dto.CollisionAlert;
import com.example.collisionservice.dto.Satellite;
import com.example.collisionservice.dto.CollisionStats;
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
            satellite.setOrbitType("LEO");
            satellite.setStatus("ACTIVE");
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
        // Simulated data fetching
        CollisionStats stats = new CollisionStats();
        stats.setTotalCollisions(10);
        stats.setActiveAlerts(5);
        CollisionStats.DangerLevels dangerLevels = new CollisionStats.DangerLevels();
        dangerLevels.setLOW(2);
        dangerLevels.setMODERATE(3);
        dangerLevels.setHIGH(4);
        dangerLevels.setCRITICAL(1);
        stats.setDangerLevels(dangerLevels);
        stats.setRecentCollisions(getCollisions());
        return stats;
    }

    public void saveCollisionAlert(CollisionAlertModel alert) {
        collisionAlertRepository.save(alert);
    }

    public void clearAllCollisions() {
        collisionAlertRepository.deleteAll();
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