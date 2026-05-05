package cz.vsb.spotify_clone.controller;

import cz.vsb.spotify_clone.entity.Artist;
import cz.vsb.spotify_clone.entity.User;
import cz.vsb.spotify_clone.entity.Role;
import cz.vsb.spotify_clone.repository.ArtistRepository;
import cz.vsb.spotify_clone.repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class AuthController {

    @Autowired private UserRepository userRepository;
    @Autowired private ArtistRepository artistRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestParam("username") String username,
            @RequestParam("password") String password,
            @RequestParam("role") String roleStr,
            @RequestParam(value = "profileImage", required = false) MultipartFile profileImage,
            @RequestParam(value = "coverImage", required = false) MultipartFile coverImage
    ) {
        // 1. Kontrola, zda user existuje
        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(BCrypt.hashpw(password, BCrypt.gensalt()));
        user.setRole(Role.valueOf(roleStr));

        try {
            if (profileImage != null && !profileImage.isEmpty()) {
                user.setAvatar(profileImage.getBytes());
                user.setAvatarContentType(profileImage.getContentType());
            } else {
                user.setAvatar(new byte[0]);
                user.setAvatarContentType("image/png");
            }
        } catch (IOException e) { e.printStackTrace(); }

        userRepository.save(user);

        if (user.getRole() == Role.ARTIST) {
            Artist artist = new Artist();
            artist.setName(username);

            try {
                if (profileImage != null && !profileImage.isEmpty()) {
                    artist.setProfileImage(profileImage.getBytes());
                    artist.setImageContentType(profileImage.getContentType());
                } else {
                    artist.setProfileImage(new byte[0]);
                    artist.setImageContentType("image/png");
                }

                if (coverImage != null && !coverImage.isEmpty()) {
                    artist.setCoverImage(coverImage.getBytes());
                    artist.setCoverContentType(coverImage.getContentType());
                } else {
                    artist.setCoverImage(new byte[0]);
                    artist.setCoverContentType("image/png");
                }
            } catch (IOException e) { e.printStackTrace(); }

            artistRepository.save(artist);
        }

        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        return userRepository.findByUsername(username)
                .filter(u -> BCrypt.checkpw(password, u.getPassword()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(401).build());
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateProfile(
            @RequestParam("currentUsername") String currentUsername,
            @RequestParam("newUsername") String newUsername,
            @RequestParam(value = "newPassword", required = false) String newPassword,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar
    ) {
        Optional<User> userOpt = userRepository.findByUsername(currentUsername);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();

        User user = userOpt.get();

        if (!currentUsername.equals(newUsername)) {
            if (userRepository.findByUsername(newUsername).isPresent()) {
                return ResponseEntity.badRequest().body("Username already taken");
            }
            user.setUsername(newUsername);

            if (user.getRole() == Role.ARTIST) {
                Optional<Artist> artistOpt = artistRepository.findAll().stream()
                        .filter(a -> a.getName().equalsIgnoreCase(currentUsername))
                        .findFirst();
                artistOpt.ifPresent(artist -> {
                    artist.setName(newUsername);
                    artistRepository.save(artist);
                });
            }
        }

        if (newPassword != null && !newPassword.trim().isEmpty()) {
            user.setPassword(BCrypt.hashpw(newPassword, BCrypt.gensalt()));
        }

        try {
            if (avatar != null && !avatar.isEmpty()) {
                user.setAvatar(avatar.getBytes());
                user.setAvatarContentType(avatar.getContentType());

                if (user.getRole() == Role.ARTIST) {
                    Optional<Artist> artistOpt = artistRepository.findAll().stream()
                            .filter(a -> a.getName().equalsIgnoreCase(user.getUsername()))
                            .findFirst();
                    if (artistOpt.isPresent()) {
                        Artist artist = artistOpt.get();
                        artist.setProfileImage(avatar.getBytes());
                        artist.setImageContentType(avatar.getContentType());
                        artistRepository.save(artist);
                    }
                }
            }
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Error uploading image");
        }

        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{username}/avatar")
    public ResponseEntity<Resource> getUserAvatar(@PathVariable String username) {
        return userRepository.findByUsername(username)
                .filter(u -> u.getAvatar() != null)
                .map(u -> ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(u.getAvatarContentType() != null ? u.getAvatarContentType() : "image/png"))
                        .body((Resource) new ByteArrayResource(u.getAvatar())))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{username}/avatar")
    public ResponseEntity<?> uploadUserAvatar(@PathVariable String username, @RequestParam("file") MultipartFile file) {
        return userRepository.findByUsername(username).map(user -> {
            try {
                user.setAvatar(file.getBytes());
                user.setAvatarContentType(file.getContentType());
                userRepository.save(user);
                return ResponseEntity.ok("Updated");
            } catch (IOException e) {
                return ResponseEntity.internalServerError().body("Error");
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> req) {
        return userRepository.findByUsername(req.get("username")).map(user -> {
            if(BCrypt.checkpw(req.get("oldPassword"), user.getPassword())) {
                user.setPassword(BCrypt.hashpw(req.get("newPassword"), BCrypt.gensalt()));
                userRepository.save(user);
                return ResponseEntity.ok("Changed");
            }
            return ResponseEntity.badRequest().body("Invalid old password");
        }).orElse(ResponseEntity.status(404).build());
    }
}