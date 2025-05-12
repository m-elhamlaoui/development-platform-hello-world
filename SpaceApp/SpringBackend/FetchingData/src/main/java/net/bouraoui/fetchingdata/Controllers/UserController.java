package net.bouraoui.fetchingdata.Controllers;

import lombok.AllArgsConstructor;
import net.bouraoui.fetchingdata.Entities.Satellite;
import net.bouraoui.fetchingdata.Entities.User;
import net.bouraoui.fetchingdata.Services.Interfaces.SatelliteService;
import net.bouraoui.fetchingdata.Services.Interfaces.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/users/")
public class UserController {

    private final UserService userService;
    private final SatelliteService satelliteService;

    public UserController(UserService userService, SatelliteService satelliteService) {
        this.userService = userService;
        this.satelliteService = satelliteService;
    }


    // Create a new user
    @PostMapping("/createUser")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User createdUser = userService.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    // Add satellites to an existing user
    @PostMapping("/addSatellite")
    public ResponseEntity<String> addSatellites(@RequestBody AddSatelliteRequest request) {
        Optional<User> userOptional = userService.getUserById(request.id());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            List<String> satelliteIds = request.satellites().stream()
                    .map(Satellite::getId)
                    .toList();

            // Update user's satellite list (merge with existing if needed)
            List<String> updatedSatelliteIds = new ArrayList<>(user.getSatelliteID());
            updatedSatelliteIds.addAll(satelliteIds);
            user.setSatelliteID(updatedSatelliteIds);

            userService.updateUser(user);
            return ResponseEntity.ok("Satellites successfully added to user.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
    }


    @GetMapping("/getUser/{id}")
    public ResponseEntity<User> getUserById(@PathVariable("id") String id) {
        Optional<User> userOptional = userService.getUserById(id);
        return userOptional.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }


    @GetMapping("/stallitesTrackeByUser/{userID}")
    public ResponseEntity<List<Satellite>> getSatellitesByUser(@PathVariable("userID") String userID) {
        User user = userService.getUserById(userID).orElse(null);
        if (user != null) {
            List<String> satelliteIds = user.getSatelliteID();
            List<Satellite> satellites = satelliteService.findAllById(satelliteIds);

            return ResponseEntity.ok(satellites);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }



}
