package org.example.userservice.Controller;

record AuthResponse(
        String token,
        String id,
        String email,
        String name
) {}