package com.example.collisionservice.controller;

import com.example.collisionservice.dto.CollisionAlert;
import com.example.collisionservice.dto.Satellite;
import com.example.collisionservice.dto.CollisionStats;
import com.example.collisionservice.dto.TimelineData;
import com.example.collisionservice.service.CollisionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/collisions/")
public class CollisionController {

    @Autowired
    private CollisionService collisionService;

    @GetMapping("/test")
    public Map<String, String> test() {
        return Map.of("status", "CollisionService is running", "time", java.time.LocalDateTime.now().toString());
    }

    @GetMapping
    public List<CollisionAlert> getCollisions() {
        return collisionService.getCollisions();
    }

    @GetMapping("/check")
    public List<CollisionAlert> checkStoredData() {
        return collisionService.getCollisions();
    }

    @DeleteMapping("/clear")
    public void clearAllCollisions() {
        collisionService.clearAllCollisions();
    }

    @GetMapping("/satellites")
    public List<Satellite> getSatellites() {
        return collisionService.getSatellites();
    }

    @GetMapping("/stats")
    public CollisionStats getStats() {
        return collisionService.getStats();
    }

    @GetMapping("/timeline")
    public TimelineData getTimelineData() {
        return collisionService.getTimelineData();
    }

    @GetMapping("/{id}")
    public CollisionAlert getCollisionById(@PathVariable String id) {
        return collisionService.getCollisionById(id);
    }
} 