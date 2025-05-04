package com.example.collisionservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
@EnableKafka
public class CollisionServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CollisionServiceApplication.class, args);
    }
} 