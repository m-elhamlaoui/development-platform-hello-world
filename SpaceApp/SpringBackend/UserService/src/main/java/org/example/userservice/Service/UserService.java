package org.example.userservice.Service;

import org.example.userservice.Model.User;
import org.example.userservice.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${fetchdata.service.name}")
    private String fetchDataServiceName;

    // DTO for FetchData service request
    private static class FetchDataUserDTO {
        private String name;
        private String email;
        private List<Integer> noradIDs;

        public FetchDataUserDTO(String name, String email) {
            this.name = name;
            this.email = email;
            this.noradIDs = new ArrayList<>();
        }

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public List<Integer> getNoradIDs() { return noradIDs; }
        public void setNoradIDs(List<Integer> noradIDs) { this.noradIDs = noradIDs; }
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with email: " + email);
        }
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                new ArrayList<>()
        );
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public void deleteUser(String email) {
        userRepository.deleteByEmail(email);
    }

    public void createUserInFetchDataService(User user) {
        // Create DTO with empty noradIDs list
        FetchDataUserDTO fetchDataUser = new FetchDataUserDTO(user.getName(), user.getEmail());
        // Initialize noradIDs as empty list
        fetchDataUser.setNoradIDs(new ArrayList<>());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        HttpEntity<FetchDataUserDTO> request = new HttpEntity<>(fetchDataUser, headers);
        try {
            ResponseEntity<Void> response = restTemplate.exchange(
                    "http://" + fetchDataServiceName + "/api/v1/users/createUser",
                    HttpMethod.POST,
                    request,
                    Void.class
            );
            
            if (response.getStatusCode() != HttpStatus.OK && response.getStatusCode() != HttpStatus.CREATED) {
                throw new RestClientException("Failed to create user in FetchData service. Status: " + response.getStatusCode());
            }
        } catch (RestClientException e) {
            throw new RestClientException("Failed to create user in FetchData service: " + e.getMessage());
        }
    }
}