package cz.vsb.spotify_clone.controller;

import cz.vsb.spotify_clone.entity.User;
import cz.vsb.spotify_clone.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.mindrot.jbcrypt.BCrypt;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String plainPassword = credentials.get("password");

        return userRepository.findByUsername(username)
                .filter(user -> BCrypt.checkpw(plainPassword, user.getPassword()))
                .map(u -> ResponseEntity.ok(u))
                .orElse(ResponseEntity.status(401).build());
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("User with this username already exists");
        }
        String hashedPassword = BCrypt.hashpw(user.getPassword(), BCrypt.gensalt());
        user.setPassword(hashedPassword);

        user.setRole("USER");
        userRepository.save(user);
        return ResponseEntity.ok("Registration was successfully");
    }
}