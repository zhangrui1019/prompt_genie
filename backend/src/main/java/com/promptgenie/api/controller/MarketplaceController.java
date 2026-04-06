package com.promptgenie.api.controller;

import com.promptgenie.prompt.entity.Prompt;
import com.promptgenie.prompt.service.PromptService;
import com.promptgenie.service.UserContextService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/marketplace")
@CrossOrigin(origins = "*")
public class MarketplaceController {
    
    @Autowired
    private PromptService promptService;
    
    @Autowired
    private UserContextService userContextService;
    
    @GetMapping
    public List<Prompt> getMarketplacePrompts() {
        // Get all premium prompts
        return promptService.getPremiumPrompts();
    }
    
    @PostMapping("/prompt/{id}/price")
    public void setPromptPrice(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        // Get prompt
        Prompt prompt = promptService.getById(id);
        if (prompt == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Prompt not found");
        }
        
        // Check ownership
        if (!prompt.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't own this prompt");
        }
        
        // Set price
        String priceType = (String) request.get("priceType");
        Double price = (Double) request.get("price");
        Boolean isPremium = (Boolean) request.get("isPremium");
        
        prompt.setPriceType(priceType);
        prompt.setPrice(price);
        prompt.setIsPremium(isPremium != null ? isPremium : false);
        
        promptService.updateById(prompt);
    }
    
    @GetMapping("/my-premium")
    public List<Prompt> getMyPremiumPrompts() {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        return promptService.getPremiumPromptsByUser(userId);
    }
    
    @GetMapping("/purchased")
    public List<Prompt> getPurchasedPrompts() {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        // TODO: Implement getPurchasedPrompts method in PromptService
        return List.of();
    }
}
