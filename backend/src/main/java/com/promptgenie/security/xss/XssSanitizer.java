package com.promptgenie.security.xss;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

public class XssSanitizer {
    
    // Configure whitelist to allow basic text formatting but strip scripts
    private static final Safelist SAFELIST = Safelist.relaxed()
            .addAttributes(":all", "style", "class") // Allow style and class
            .preserveRelativeLinks(true);

    public static String sanitize(String content) {
        if (content == null) {
            return null;
        }
        // Jsoup's clean method parses HTML and removes unsafe tags
        return Jsoup.clean(content, SAFELIST);
    }
}
