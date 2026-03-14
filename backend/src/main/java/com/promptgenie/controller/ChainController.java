package com.promptgenie.controller;

import com.promptgenie.service.UserContextService;
import com.promptgenie.service.QuotaService;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.promptgenie.entity.PromptChain;
import com.promptgenie.service.ChainService;
import com.promptgenie.service.WorkspaceService;
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
            @Autowired
    private WorkspaceService workspaceService;

    @PutMapping("/{id}/move")
    public void moveChain(@PathVariable Long id, @RequestBody Map<String, Long> request) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
             throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        Long targetWorkspaceId = request.get("workspaceId");
        if (targetWorkspaceId == null) {
             throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Target workspace ID required");
        }
        
        PromptChain chain = chainService.getById(id);
        if (chain == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        
        // 1. Check ownership (must be owner of the chain)
        if (!chain.getUserId().equals(userId)) {
             throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the owner can move this chain");
        }
        
        // 2. Check write access to target workspace
        if (!workspaceService.hasAccess(userId, targetWorkspaceId, "editor")) {
             throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have write access to the target workspace");
        }
        
        chainService.moveChainToWorkspace(id, targetWorkspaceId);
    }
}
        return chainService.getUserChains(userId);
    }

    @GetMapping("/{id}")
    public PromptChain getChain(@PathVariable Long id) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
             throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        PromptChain chain = chainService.getChainWithSteps(id);
        if (chain == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Chain not found");
        }
        if (!chain.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your chain");
        }
        return chain;
    }

    @Autowired
    private QuotaService quotaService;

    @PostMapping
    public PromptChain createChain(@RequestBody PromptChain chain) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
             throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        try {
            int steps = chain.getSteps() != null ? chain.getSteps().size() : 0;
            quotaService.checkChainQuota(userId, steps);
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage());
        }

        chain.setUserId(userId);
        return chainService.createChain(chain);
    }

    @PutMapping("/{id}")
    public PromptChain updateChain(@PathVariable Long id, @RequestBody PromptChain chain) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
             throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        try {
            int steps = chain.getSteps() != null ? chain.getSteps().size() : 0;
            quotaService.checkChainQuota(userId, steps);
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage());
        }
        
        PromptChain existing = chainService.getById(id);
        if (existing == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Chain not found");
        }
        if (!existing.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your chain");
        }

        chain.setId(id);
        return chainService.updateChain(chain);
    }

    @DeleteMapping("/{id}")
    public void deleteChain(@PathVariable Long id) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
             throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        PromptChain existing = chainService.getById(id);
        if (existing != null && !existing.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your chain");
        }
        
        chainService.removeById(id);
    }

    @PostMapping("/{id}/run")
    public List<Map<String, Object>> runChain(@PathVariable Long id, @RequestBody Map<String, Object> variables) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
             throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }
        
        PromptChain chain = chainService.getById(id);
        if (chain == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Chain not found");
        }
        if (!chain.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your chain");
        }

        return chainService.executeChain(id, variables);
    }
}
