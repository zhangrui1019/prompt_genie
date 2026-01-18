package com.promptgenie.controller;

import com.promptgenie.service.UserContextService;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.promptgenie.entity.PromptChain;
import com.promptgenie.service.ChainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chains")
@CrossOrigin(origins = "*")
public class ChainController {

    @Autowired
    private ChainService chainService;

    @Autowired
    private UserContextService userContextService;

    @GetMapping
    public List<PromptChain> getChains() {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
             throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        return chainService.getUserChains(userId);
    }

    @GetMapping("/{id}")
    public PromptChain getChain(@PathVariable Long id) {
        return chainService.getChainWithSteps(id);
    }

    @PostMapping
    public PromptChain createChain(@RequestBody PromptChain chain) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
             throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        chain.setUserId(userId);
        return chainService.createChain(chain);
    }

    @PutMapping("/{id}")
    public PromptChain updateChain(@PathVariable Long id, @RequestBody PromptChain chain) {
        chain.setId(id);
        return chainService.updateChain(chain);
    }

    @DeleteMapping("/{id}")
    public void deleteChain(@PathVariable Long id) {
        chainService.removeById(id);
    }

    @PostMapping("/{id}/run")
    public List<Map<String, Object>> runChain(@PathVariable Long id, @RequestBody Map<String, Object> variables) {
        return chainService.executeChain(id, variables);
    }
}
