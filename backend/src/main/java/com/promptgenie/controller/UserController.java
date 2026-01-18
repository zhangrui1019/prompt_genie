package com.promptgenie.controller;

import com.promptgenie.entity.User;
import com.promptgenie.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/{id}/upgrade")
    public User upgradeToPro(@PathVariable Long id) {
        // Security Check: Ensure the user is upgrading their own account
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = authentication.getName();
        User currentUser = userService.findByEmail(currentEmail);

        if (currentUser == null || !currentUser.getId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only upgrade your own account");
        }

        userService.updatePlan(id, "pro");
        return userService.getById(id);
    }
    
    @GetMapping("/{id}/profile")
    public Map<String, Object> getPublicProfile(@PathVariable Long id) {
        User user = userService.getById(id);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        
        return Map.of(
            "id", user.getId(),
            "name", user.getName(),
            "plan", user.getPlan(),
            "createdAt", user.getCreatedAt()
        );
    }
}
