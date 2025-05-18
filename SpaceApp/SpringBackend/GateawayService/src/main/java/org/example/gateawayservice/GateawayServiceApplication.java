package org.example.gateawayservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class GateawayServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(GateawayServiceApplication.class, args);
	}

}
