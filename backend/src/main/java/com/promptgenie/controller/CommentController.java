package com.promptgenie.controller;

import com.promptgenie.entity.Comment;
import com.promptgenie.service.CommentService;
import com.promptgenie.service.UserContextService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prompts")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private UserContextService userContextService;

    @GetMapping("/{id}/comments")
    public List<Comment> getComments(@PathVariable Long id) {
        return commentService.getCommentsByPrompt(id);
    }

    @PostMapping("/{id}/comments")
    public Comment addComment(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found");
        }

        String content = body.get("content");
        if (content == null || content.trim().isEmpty()) {
             throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Content is required");
        }

        Comment comment = new Comment();
        comment.setPromptId(id);
        comment.setUserId(userId);
        comment.setContent(content);
        
        commentService.save(comment);
        
        // Populate username for response
        comment.setUsername(userContextService.getCurrentUser().getName());
        
        return comment;
    }
}
