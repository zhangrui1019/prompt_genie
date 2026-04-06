package com.promptgenie.prompt.controller;

import com.promptgenie.prompt.entity.Prompt;
import com.promptgenie.prompt.entity.PromptModerationLog;
import com.promptgenie.auth.entity.User;
import com.promptgenie.prompt.service.PromptService;
import com.promptgenie.prompt.service.PromptModerationLogService;
import com.promptgenie.auth.service.UserService;
import com.promptgenie.service.AdminGuard;
import com.promptgenie.service.UserContextService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/prompts")
@CrossOrigin(origins = "*")
public class AdminPromptController {

    @Autowired
    private PromptService promptService;

    @Autowired
    private PromptModerationLogService moderationLogService;

    @Autowired
    private UserContextService userContextService;

    @Autowired
    private AdminGuard adminGuard;

    @PostMapping("/{id}/review")
    public Prompt review(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        User operator = userContextService.getCurrentUser();
        if (!adminGuard.isAdmin(operator)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin only");
        }

        Prompt prompt = promptService.getById(id);
        if (prompt == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Prompt not found");

        String action = body.get("action") != null ? String.valueOf(body.get("action")) : "";
        if (action.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing action");
        }

        String fromStatus = prompt.getStatus();
        String toStatus = fromStatus;

        if ("approve".equalsIgnoreCase(action)) {
            toStatus = "APPROVED";
        } else if ("reject".equalsIgnoreCase(action)) {
            toStatus = "REJECTED";
            prompt.setIsPublic(false);
        } else if ("publish".equalsIgnoreCase(action)) {
            toStatus = "PUBLISHED";
            prompt.setIsPublic(true);
            if (prompt.getPublishedAt() == null) {
                prompt.setPublishedAt(LocalDateTime.now());
            }
        } else if ("archive".equalsIgnoreCase(action)) {
            toStatus = "ARCHIVED";
            prompt.setIsPublic(false);
        } else if ("feature".equalsIgnoreCase(action)) {
            prompt.setIsFeatured(true);
            Object rankObj = body.get("featuredRank");
            if (rankObj != null && !String.valueOf(rankObj).isBlank()) {
                try {
                    prompt.setFeaturedRank(Integer.parseInt(String.valueOf(rankObj)));
                } catch (NumberFormatException ignored) {
                }
            }
        } else if ("unfeature".equalsIgnoreCase(action)) {
            prompt.setIsFeatured(false);
            prompt.setFeaturedRank(null);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid action");
        }

        prompt.setStatus(toStatus);
        promptService.updateById(prompt);

        PromptModerationLog log = new PromptModerationLog();
        log.setPromptId(prompt.getId());
        log.setOperatorUserId(operator != null ? operator.getId() : null);
        log.setAction(action.toLowerCase());
        log.setFromStatus(fromStatus);
        log.setToStatus(toStatus);
        Object reasonObj = body.get("reason");
        if (reasonObj != null) {
            log.setReason(String.valueOf(reasonObj));
        }
        log.setCreatedAt(LocalDateTime.now());
        moderationLogService.save(log);

        return prompt;
    }
}
