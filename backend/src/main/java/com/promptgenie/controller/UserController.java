package com.promptgenie.controller;

import com.promptgenie.entity.User;
import com.promptgenie.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/{id}/upgrade")
    public User upgradeToPro(@PathVariable Long id) {
        userService.updatePlan(id, "pro");
        return userService.getById(id);
    }
}
