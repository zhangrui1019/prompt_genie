package com.promptgenie.service;

import com.promptgenie.auth.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Service
public class AdminGuard {

    private final Set<String> adminEmails;

    public AdminGuard(@Value("${genie.admin.emails:}") String emails) {
        if (emails == null || emails.isBlank()) {
            this.adminEmails = new HashSet<>();
            return;
        }
        this.adminEmails = new HashSet<>(Arrays.stream(emails.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList());
    }

    public boolean isAdmin(User user) {
        if (user == null || user.getEmail() == null) return false;
        if (adminEmails.isEmpty()) return false;
        return adminEmails.contains(user.getEmail());
    }
}
