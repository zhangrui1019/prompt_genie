package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ComplianceService {
    
    // 敏感信息正则表达式
    private static final Pattern API_KEY_PATTERN = Pattern.compile("(api[_-]key|apikey|api[-_]secret|apisecret)\s*[:=]\s*[a-zA-Z0-9_-]{30,}");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
    private static final Pattern PHONE_PATTERN = Pattern.compile("\\b(\\+?\\d{1,3})?[-\\.\\s]?\\(?\\d{3}\\)?[-\\.\\s]?\\d{3}[-\\.\\s]?\\d{4}\\b");
    private static final Pattern CREDIT_CARD_PATTERN = Pattern.compile("\\b(?:\\d[ -]*?){13,16}\\b");
    private static final Pattern SSN_PATTERN = Pattern.compile("\\b\\d{3}[- ]?\\d{2}[- ]?\\d{4}\\b");
    
    // 违规内容关键词
    private static final List<String> VIOLENT_KEYWORDS = List.of("暴力", "杀人", "自杀", "伤害", "攻击");
    private static final List<String> PORN_KEYWORDS = List.of("色情", "黄色", "成人", "情色", "淫秽");
    private static final List<String> POLITICAL_KEYWORDS = List.of("政治", "颠覆", "反动", "敏感", "抗议");
    private static final List<String> DRUG_KEYWORDS = List.of("毒品", "吸毒", "贩毒", "大麻", "海洛因");
    
    // 检查敏感信息
    public List<SensitiveInfo> checkSensitiveInfo(String content) {
        List<SensitiveInfo> sensitiveInfos = new ArrayList<>();
        
        // 检查API密钥
        Matcher apiKeyMatcher = API_KEY_PATTERN.matcher(content);
        while (apiKeyMatcher.find()) {
            sensitiveInfos.add(new SensitiveInfo("API_KEY", apiKeyMatcher.group()));
        }
        
        // 检查邮箱
        Matcher emailMatcher = EMAIL_PATTERN.matcher(content);
        while (emailMatcher.find()) {
            sensitiveInfos.add(new SensitiveInfo("EMAIL", emailMatcher.group()));
        }
        
        // 检查手机号
        Matcher phoneMatcher = PHONE_PATTERN.matcher(content);
        while (phoneMatcher.find()) {
            sensitiveInfos.add(new SensitiveInfo("PHONE", phoneMatcher.group()));
        }
        
        // 检查信用卡号
        Matcher creditCardMatcher = CREDIT_CARD_PATTERN.matcher(content);
        while (creditCardMatcher.find()) {
            sensitiveInfos.add(new SensitiveInfo("CREDIT_CARD", creditCardMatcher.group()));
        }
        
        // 检查社保号
        Matcher ssnMatcher = SSN_PATTERN.matcher(content);
        while (ssnMatcher.find()) {
            sensitiveInfos.add(new SensitiveInfo("SSN", ssnMatcher.group()));
        }
        
        return sensitiveInfos;
    }
    
    // 检查违规内容
    public List<Violation> checkViolations(String content) {
        List<Violation> violations = new ArrayList<>();
        
        // 检查暴力内容
        for (String keyword : VIOLENT_KEYWORDS) {
            if (content.contains(keyword)) {
                violations.add(new Violation("VIOLENT", keyword));
            }
        }
        
        // 检查色情内容
        for (String keyword : PORN_KEYWORDS) {
            if (content.contains(keyword)) {
                violations.add(new Violation("PORN", keyword));
            }
        }
        
        // 检查政治内容
        for (String keyword : POLITICAL_KEYWORDS) {
            if (content.contains(keyword)) {
                violations.add(new Violation("POLITICAL", keyword));
            }
        }
        
        // 检查毒品内容
        for (String keyword : DRUG_KEYWORDS) {
            if (content.contains(keyword)) {
                violations.add(new Violation("DRUG", keyword));
            }
        }
        
        return violations;
    }
    
    // 综合检查
    public ComplianceResult checkCompliance(String content) {
        List<SensitiveInfo> sensitiveInfos = checkSensitiveInfo(content);
        List<Violation> violations = checkViolations(content);
        
        boolean isCompliant = sensitiveInfos.isEmpty() && violations.isEmpty();
        
        return new ComplianceResult(isCompliant, sensitiveInfos, violations);
    }
    
    // 敏感信息类
    public static class SensitiveInfo {
        private String type;
        private String content;
        
        public SensitiveInfo(String type, String content) {
            this.type = type;
            this.content = content;
        }
        
        // Getters
        public String getType() { return type; }
        public String getContent() { return content; }
    }
    
    // 违规内容类
    public static class Violation {
        private String type;
        private String keyword;
        
        public Violation(String type, String keyword) {
            this.type = type;
            this.keyword = keyword;
        }
        
        // Getters
        public String getType() { return type; }
        public String getKeyword() { return keyword; }
    }
    
    // 合规检查结果类
    public static class ComplianceResult {
        private boolean isCompliant;
        private List<SensitiveInfo> sensitiveInfos;
        private List<Violation> violations;
        
        public ComplianceResult(boolean isCompliant, List<SensitiveInfo> sensitiveInfos, List<Violation> violations) {
            this.isCompliant = isCompliant;
            this.sensitiveInfos = sensitiveInfos;
            this.violations = violations;
        }
        
        // Getters
        public boolean isCompliant() { return isCompliant; }
        public List<SensitiveInfo> getSensitiveInfos() { return sensitiveInfos; }
        public List<Violation> getViolations() { return violations; }
    }
}