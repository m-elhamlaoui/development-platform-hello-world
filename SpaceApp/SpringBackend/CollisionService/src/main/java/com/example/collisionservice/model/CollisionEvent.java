package com.example.collisionservice.model;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class CollisionEvent {
    private String user;
    private List<String> satellites;
    private List<Map<String, Object>> collisions;
} 