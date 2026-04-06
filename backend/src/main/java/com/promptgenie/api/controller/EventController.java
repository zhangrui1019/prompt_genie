package com.promptgenie.api.controller;

import com.promptgenie.entity.TemplateEvent;
import com.promptgenie.service.TemplateEventService;
import com.promptgenie.service.UserContextService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/events")
@CrossOrigin(origins = "*")
public class EventController {

    @Autowired
    private TemplateEventService templateEventService;

    @Autowired
    private UserContextService userContextService;

    @PostMapping
    public void track(@RequestBody Map<String, Object> body) {
        try {
            Object eventNameObj = body.get("event");
            if (eventNameObj == null) return;

            String eventName = String.valueOf(eventNameObj);
            if (eventName.isBlank()) return;

            TemplateEvent event = new TemplateEvent();
            event.setEventName(eventName);

            Object sessionIdObj = body.get("sessionId");
            if (sessionIdObj != null) {
                event.setSessionId(String.valueOf(sessionIdObj));
            }

            Long userId = userContextService.getCurrentUserId();
            event.setUserId(userId);

            Object propsObj = body.get("properties");
            if (propsObj instanceof Map<?, ?> map) {
                event.setProperties((Map<String, Object>) map);
            }
            event.setCreatedAt(LocalDateTime.now());

            templateEventService.save(event);
        } catch (Exception e) {
            // Log the error but don't throw it to avoid breaking the user flow
            System.err.println("Error tracking event: " + e.getMessage());
        }
    }
}
