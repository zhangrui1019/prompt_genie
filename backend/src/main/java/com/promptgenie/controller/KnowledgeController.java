package com.promptgenie.controller;

import com.promptgenie.entity.Document;
import com.promptgenie.entity.KnowledgeBase;
import com.promptgenie.entity.User;
import com.promptgenie.service.KnowledgeService;
import com.promptgenie.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/knowledge")
@CrossOrigin(origins = "*")
public class KnowledgeController {

    @Autowired
    private KnowledgeService knowledgeService;

    @Autowired
    private UserService userService;

    @GetMapping
    public List<KnowledgeBase> getUserKnowledgeBases() {
        Long userId = getCurrentUserId();
        if (userId == null) return List.of();
        return knowledgeService.getUserKnowledgeBases(userId);
    }

    @PostMapping
    public KnowledgeBase createKnowledgeBase(@RequestBody Map<String, String> request) {
        Long userId = getCurrentUserId();
        if (userId == null) throw new RuntimeException("User not found");
        return knowledgeService.createKnowledgeBase(userId, request.get("name"), request.get("description"));
    }

    @DeleteMapping("/{id}")
    public void deleteKnowledgeBase(@PathVariable Long id) {
        knowledgeService.deleteKnowledgeBase(id);
    }

    @PostMapping("/{id}/documents")
    public ResponseEntity<?> uploadDocument(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            Document doc = knowledgeService.uploadDocument(id, file);
            return ResponseEntity.ok(doc);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Failed to upload file: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/documents")
    public List<Document> getDocuments(@PathVariable Long id) {
        return knowledgeService.getDocuments(id);
    }

    @DeleteMapping("/documents/{docId}")
    public void deleteDocument(@PathVariable Long docId) {
        knowledgeService.deleteDocument(docId);
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null && !"anonymousUser".equals(auth.getName())) {
            User user = userService.findByEmail(auth.getName());
            if (user != null) return user.getId();
        }
        return null;
    }
}
