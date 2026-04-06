package com.promptgenie.api.controller;

import com.promptgenie.entity.Transaction;
import com.promptgenie.service.TransactionService;
import com.promptgenie.service.UserContextService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {
    
    @Autowired
    private TransactionService transactionService;
    
    @Autowired
    private UserContextService userContextService;
    
    @PostMapping
    public Transaction createTransaction(@RequestBody Long promptId) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        return transactionService.createTransaction(userId, promptId);
    }
    
    @PostMapping("/{id}/complete")
    public void completeTransaction(@PathVariable Long id) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        transactionService.completeTransaction(id);
    }
    
    @GetMapping("/buyer")
    public List<Transaction> getBuyerTransactions() {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        return transactionService.getBuyerTransactions(userId);
    }
    
    @GetMapping("/seller")
    public List<Transaction> getSellerTransactions() {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        return transactionService.getSellerTransactions(userId);
    }
    
    @GetMapping("/prompt/{promptId}")
    public List<Transaction> getPromptTransactions(@PathVariable Long promptId) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        return transactionService.getPromptTransactions(promptId);
    }
}