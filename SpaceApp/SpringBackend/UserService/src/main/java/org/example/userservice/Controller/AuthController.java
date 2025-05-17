package org.example.userservice.Controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.userservice.Model.*;
import org.example.userservice.Repository.*;
import org.example.userservice.Security.JwtUtil;
import org.example.userservice.Service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        logger.info("Registering user: {}", user.getEmail());

        User existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser != null) {
            logger.warn("Email already registered: {}", user.getEmail());
            return ResponseEntity.badRequest().body("Email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);

        try {
            userDetailsService.createUserInFetchDataService(user);
        } catch (Exception e) {
            logger.error("Failed to create user in FetchData service: {}", e.getMessage());
            // Optionally, you might want to rollback the user creation in the local database
            // userRepository.delete(user);
            return ResponseEntity.status(HttpServletResponse.SC_INTERNAL_SERVER_ERROR)
                    .body("Failed to create user in FetchData service");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return ResponseEntity.ok(new AuthResponse(
                token,
                user.getEmail(),
                user.getEmail(),
                user.getName()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) throws Exception {
        logger.info("Attempting login for {}", loginRequest.getEmail());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );
        logger.info("Authentication successful");

        UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        User user = userRepository.findByEmail(loginRequest.getEmail());
        if (user == null) {
            logger.error("User not found after authentication: {}", loginRequest.getEmail());
            throw new Exception("User not found after authentication");
        }

        return ResponseEntity.ok(new AuthResponse(
                token,
                user.getEmail(),
                user.getEmail(),
                user.getName()
        ));
    }
    

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request, HttpServletResponse response) {
        logger.info("User logged out");
        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Principal principal) {
        if (principal == null) {
            logger.warn("No authenticated user found");
            return ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).body("Not authenticated");
        }
        logger.info("Fetching details for user: {}", principal.getName());

        User user = userRepository.findByEmail(principal.getName());
        if (user == null) {
            logger.error("Authenticated user not found in database: {}", principal.getName());
            return ResponseEntity.status(HttpServletResponse.SC_NOT_FOUND).body("User not found");
        }

        return ResponseEntity.ok(new UserResponse(
                user.getEmail(),
                user.getName()
        ));
    }
}



