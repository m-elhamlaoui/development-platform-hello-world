package org.example.endoflifeservice;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class EndOfLifeServiceApplicationTests {

    @Test
    void contextLoads() {
        // This test verifies that the Spring application context loads successfully
        assertTrue(true);
    }

    @Test
    void mainMethodRuns() {
        // This test verifies that the main method runs without throwing exceptions
        assertDoesNotThrow(() -> {
            EndOfLifeServiceApplication.main(new String[]{});
        });
    }
}
