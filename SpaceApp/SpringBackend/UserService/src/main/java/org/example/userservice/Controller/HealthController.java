package org.example.userservice.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping("/status")
    public ResponseEntity<Map<String, String>> getHealthStatus() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "UserService");
        return ResponseEntity.ok(response);
    }
} 