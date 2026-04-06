package com.promptgenie.auth.controller;

import com.promptgenie.auth.entity.Mfa;
import com.promptgenie.auth.service.MfaService;
import com.promptgenie.service.UserContextService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/mfa")
@CrossOrigin(origins = "*")
public class MfaController {
    
    @Autowired
    private MfaService mfaService;
    
    @Autowired
    private UserContextService userContextService;
    
    @PostMapping("/generate")
    public Mfa generateMfa() {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        return mfaService.generateTotp(userId);
    }
    
    @PostMapping("/enable")
    public void enableMfa(@RequestBody String code) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        mfaService.enableMfa(userId, code);
    }
    
    @PostMapping("/disable")
    public void disableMfa(@RequestBody String recoveryCode) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        mfaService.disableMfa(userId, recoveryCode);
    }
    
    @PostMapping("/verify")
    public boolean verifyMfa(@RequestBody String code) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        return mfaService.verifyTotp(userId, code);
    }
    
    @GetMapping("/status")
    public Mfa getMfaStatus() {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        return mfaService.getMfaByUserId(userId);
    }
}