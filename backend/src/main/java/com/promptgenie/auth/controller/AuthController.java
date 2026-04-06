package com.promptgenie.auth.controller;

import com.promptgenie.dto.LoginRequest;
import com.promptgenie.dto.RegisterRequest;
import com.promptgenie.auth.entity.User;
import com.promptgenie.core.security.JwtUtil;
import com.promptgenie.service.CaptchaService;
import com.promptgenie.auth.service.UserService;
import com.promptgenie.core.exception.UserAlreadyExistsException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
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
        
        System.out.println("Login attempt for email: " + email);
        
        try {
            System.out.println("Attempting to authenticate user: " + email);
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
            );
            System.out.println("Authentication successful for user: " + email);
        } catch (Exception e) {
            System.out.println("Authentication failed for user: " + email + ", error: " + e.getMessage());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        System.out.println("Loading user details for: " + email);
        final UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        System.out.println("Generating JWT token for: " + email);
        final String jwt = jwtUtil.generateToken(userDetails);
        System.out.println("Finding user by email: " + email);
        User user = userService.findByEmail(email);
        System.out.println("User found: " + (user != null ? user.getEmail() : "null"));

        return Map.of(
            "access_token", jwt,
            "user", user
        );
    }
    
    @PostMapping("/register")
    public User register(@Valid @RequestBody RegisterRequest request) {
        try {
            logger.info("Register attempt for email: {}", request.getEmail());
            // Temporarily disable captcha validation for testing
            // if (!captchaService.validateCaptcha(request.getCaptchaId(), request.getCaptchaCode())) {
            //     throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired captcha");
            // }

            if (userService.existsByEmail(request.getEmail())) {
                logger.info("Registration failed: Email already exists: {}", request.getEmail());
                throw new UserAlreadyExistsException("Email already exists");
            }
            
            User user = new User();
            user.setEmail(request.getEmail());
            user.setName(request.getUsername());
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            user.setApiKey(userService.generateApiKey());
            logger.info("Saving user: {}", user.getEmail());
            userService.save(user);
            logger.info("Registration successful for email: {}", request.getEmail());
            return user;
        } catch (UserAlreadyExistsException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Registration failed: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to register user");
        }
    }

    @GetMapping("/me")
    public User getCurrentUser() {
        try {
            // Get the current user from the security context
            org.springframework.security.core.userdetails.UserDetails userDetails = (org.springframework.security.core.userdetails.UserDetails) 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String email = userDetails.getUsername();
            User user = userService.findByEmail(email);
            if (user == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
            }
            return user;
        } catch (Exception e) {
            logger.error("Failed to get current user: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to get user information");
        }
    }
}
