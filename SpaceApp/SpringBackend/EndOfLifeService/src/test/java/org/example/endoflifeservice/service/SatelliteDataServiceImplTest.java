package org.example.endoflifeservice.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest
class SatelliteDataServiceImplTest {

    @InjectMocks
    private SatelliteDataServiceImpl satelliteDataService;

    @Mock
    private RestTemplate restTemplate;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getSatelliteDetails_ShouldReturnDetails() {
        // Arrange
        int noradId = 12345;
        Map<String, Object> mockResponse = Map.of("id", noradId, "name", "Test Satellite");
        when(restTemplate.getForObject(anyString(), eq(Map.class)))
            .thenReturn(mockResponse);

        // Act
        Map<String, Object> result = satelliteDataService.getSatelliteDetails(noradId);

        // Assert
        assertNotNull(result);
        assertEquals(noradId, result.get("id"));
        assertEquals("Test Satellite", result.get("name"));
        verify(restTemplate, times(1)).getForObject(anyString(), eq(Map.class));
    }

    @Test
    void getAllSatellitesWithDetails_ShouldReturnList() {
        // Arrange
        List<Map<String, Object>> mockResponse = List.of(
            Map.of("id", 1, "name", "Satellite 1"),
            Map.of("id", 2, "name", "Satellite 2")
        );
        when(restTemplate.getForObject(anyString(), eq(List.class)))
            .thenReturn(mockResponse);

        // Act
        List<Map<String, Object>> result = satelliteDataService.getAllSatellitesWithDetails();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(restTemplate, times(1)).getForObject(anyString(), eq(List.class));
    }

    @Test
    void getSatelliteHealth_ShouldReturnHealth() {
        // Arrange
        int noradId = 12345;
        Map<String, Object> mockResponse = Map.of(
            "status", "healthy",
            "batteryLevel", 85,
            "fuelLevel", 75
        );
        when(restTemplate.getForObject(anyString(), eq(Map.class)))
            .thenReturn(mockResponse);

        // Act
        Map<String, Object> result = satelliteDataService.getSatelliteHealth(noradId);

        // Assert
        assertNotNull(result);
        assertEquals("healthy", result.get("status"));
        assertEquals(85, result.get("batteryLevel"));
        assertEquals(75, result.get("fuelLevel"));
        verify(restTemplate, times(1)).getForObject(anyString(), eq(Map.class));
    }

    @Test
    void getSatelliteEolStatus_ShouldReturnStatus() {
        // Arrange
        int noradId = 12345;
        Map<String, Object> mockResponse = Map.of(
            "status", "operational",
            "estimatedEolDate", "2025-12-31",
            "remainingLifetime", 365
        );
        when(restTemplate.getForObject(anyString(), eq(Map.class)))
            .thenReturn(mockResponse);

        // Act
        Map<String, Object> result = satelliteDataService.getSatelliteEolStatus(noradId);

        // Assert
        assertNotNull(result);
        assertEquals("operational", result.get("status"));
        assertEquals("2025-12-31", result.get("estimatedEolDate"));
        assertEquals(365, result.get("remainingLifetime"));
        verify(restTemplate, times(1)).getForObject(anyString(), eq(Map.class));
    }

    @Test
    void getAllSatellites_ShouldReturnList() {
        // Arrange
        List<Map<String, Object>> mockResponse = List.of(
            Map.of("id", 1, "name", "Satellite 1"),
            Map.of("id", 2, "name", "Satellite 2")
        );
        when(restTemplate.getForObject(anyString(), eq(List.class)))
            .thenReturn(mockResponse);

        // Act
        List<Map<String, Object>> result = satelliteDataService.getAllSatellites();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(restTemplate, times(1)).getForObject(anyString(), eq(List.class));
    }
} 