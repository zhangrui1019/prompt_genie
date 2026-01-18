package com.promptgenie.controller;

import com.promptgenie.dto.LoginRequest;
import com.promptgenie.dto.RegisterRequest;
import com.promptgenie.entity.User;
import com.promptgenie.security.JwtUtil;
import com.promptgenie.service.CaptchaService;
import com.promptgenie.service.UserService;
import com.promptgenie.exception.UserAlreadyExistsException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private CaptchaService captchaService;

    @GetMapping("/captcha")
    public CaptchaService.CaptchaResponse getCaptcha() {
        return captchaService.generateCaptcha();
    }
    
    @PostMapping("/login")
    public Map<String, Object> login(@Valid @RequestBody LoginRequest request) {
        String email = request.getEmail();
        String password = request.getPassword();
        
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
            );
        } catch (Exception e) {
            throw new RuntimeException("Invalid credentials");
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        final String jwt = jwtUtil.generateToken(userDetails);
        User user = userService.findByEmail(email);

        return Map.of(
            "access_token", jwt,
            "user", user
        );
    }
    
    @PostMapping("/register")
    public User register(@Valid @RequestBody RegisterRequest request) {
        // Validate Invitation Code
        // TODO: Move to config or database in future
        if (!"GENIE2024".equals(request.getInvitationCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid invitation code");
        }

        // Validate Captcha
        if (!captchaService.validateCaptcha(request.getCaptchaId(), request.getCaptchaCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired captcha");
        }

        if (userService.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already exists");
        }
        
        User user = new User();
        user.setEmail(request.getEmail());
        user.setName(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setApiKey(userService.generateApiKey());
        userService.save(user);
        return user;
    }
}
