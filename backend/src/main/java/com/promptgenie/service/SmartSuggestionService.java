package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SmartSuggestionService {
    
    // 常用提示模板
    private final List<String> promptTemplates = Arrays.asList(
        "请根据以下要求生成内容：{requirement}",
        "请总结以下内容：{content}",
        "请解释以下概念：{concept}",
        "请翻译以下内容：{content}",
        "请为以下产品写一段营销文案：{product}",
        "请解决以下问题：{problem}",
        "请为以下主题写一篇文章：{topic}",
        "请分析以下数据：{data}"
    );
    
    // 常用变量
    private final List<String> commonVariables = Arrays.asList(
        "{{input}}",
        "{{output}}",
        "{{user}}",
        "{{date}}",
        "{{time}}",
        "{{topic}}",
        "{{context}}",
        "{{example}}"
    );
    
    // 错误模式
    private final Map<String, String> errorPatterns = new HashMap<>();
    
    // 初始化智能提示服务
    public void init() {
        // 初始化错误模式
        initializeErrorPatterns();
    }
    
    // 初始化错误模式
    private void initializeErrorPatterns() {
        // 常见语法错误
        errorPatterns.put("缺少结束引号", "您的Prompt中似乎缺少结束引号，请检查并补充。");
        errorPatterns.put("缺少变量括号", "您的Prompt中似乎缺少变量的结束括号，请检查并补充。");
        errorPatterns.put("重复的变量", "您的Prompt中存在重复的变量，请检查并优化。");
        
        // 常见逻辑错误
        errorPatterns.put("逻辑矛盾", "您的Prompt中存在逻辑矛盾，请检查并修改。");
        errorPatterns.put("不明确的指令", "您的Prompt中的指令不够明确，请提供更具体的要求。");
    }
    
    // 获取实时提示
    public List<Suggestion> getRealTimeSuggestions(String input, String context) {
        List<Suggestion> suggestions = new ArrayList<>();
        
        // 基于输入生成提示
        if (input.isEmpty()) {
            // 提供模板建议
            for (String template : promptTemplates) {
                suggestions.add(new Suggestion("template", template, "模板建议"));
            }
        } else {
            // 提供变量建议
            for (String variable : commonVariables) {
                if (!input.contains(variable)) {
                    suggestions.add(new Suggestion("variable", variable, "变量建议"));
                }
            }
            
            // 提供自动完成建议
            String completion = getAutoCompletion(input);
            if (!completion.isEmpty()) {
                suggestions.add(new Suggestion("completion", completion, "自动完成"));
            }
        }
        
        // 检测错误
        List<ErrorSuggestion> errors = detectErrors(input);
        for (ErrorSuggestion error : errors) {
            suggestions.add(new Suggestion("error", error.getMessage(), "错误检测"));
        }
        
        return suggestions;
    }
    
    // 自动完成
    private String getAutoCompletion(String input) {
        // 简单的自动完成逻辑
        // 实际应用中，这里应该基于历史输入和上下文生成更智能的建议
        if (input.endsWith("请")) {
            return input + "根据以下要求生成内容：";
        } else if (input.endsWith("根据")) {
            return input + "以下要求生成内容：";
        } else if (input.endsWith("生成")) {
            return input + "内容：";
        }
        return "";
    }
    
    // 检测错误
    private List<ErrorSuggestion> detectErrors(String input) {
        List<ErrorSuggestion> errors = new ArrayList<>();
        
        // 检测缺少结束引号
        if (countOccurrences(input, "\"") % 2 != 0) {
            errors.add(new ErrorSuggestion("缺少结束引号", "您的Prompt中似乎缺少结束引号，请检查并补充。"));
        }
        
        // 检测缺少变量括号
        Pattern variablePattern = Pattern.compile("\\{\\{[^}]*");
        Matcher matcher = variablePattern.matcher(input);
        while (matcher.find()) {
            errors.add(new ErrorSuggestion("缺少变量括号", "您的Prompt中似乎缺少变量的结束括号，请检查并补充。"));
        }
        
        // 检测重复的变量
        Set<String> variables = new HashSet<>();
        Pattern varPattern = Pattern.compile("\\{\\{([^}]+)\\}\\}");
        Matcher varMatcher = varPattern.matcher(input);
        while (varMatcher.find()) {
            String variable = varMatcher.group(1);
            if (!variables.add(variable)) {
                errors.add(new ErrorSuggestion("重复的变量", "您的Prompt中存在重复的变量，请检查并优化。"));
                break;
            }
        }
        
        return errors;
    }
    
    // 计算字符串中指定子串的出现次数
    private int countOccurrences(String input, String substring) {
        int count = 0;
        int index = 0;
        while ((index = input.indexOf(substring, index)) != -1) {
            count++;
            index += substring.length();
        }
        return count;
    }
    
    // 提供工作流建议
    public List<Suggestion> getWorkflowSuggestions(String workflowType) {
        List<Suggestion> suggestions = new ArrayList<>();
        
        // 根据工作流类型提供不同的建议
        switch (workflowType) {
            case "content_generation":
                suggestions.add(new Suggestion("node", "Text Generation", "添加文本生成节点"));
                suggestions.add(new Suggestion("node", "Image Generation", "添加图像生成节点"));
                suggestions.add(new Suggestion("node", "Content Review", "添加内容审核节点"));
                break;
            case "data_analysis":
                suggestions.add(new Suggestion("node", "Data Input", "添加数据输入节点"));
                suggestions.add(new Suggestion("node", "Data Processing", "添加数据处理节点"));
                suggestions.add(new Suggestion("node", "Data Visualization", "添加数据可视化节点"));
                break;
            case "customer_support":
                suggestions.add(new Suggestion("node", "Ticket Classification", "添加工单分类节点"));
                suggestions.add(new Suggestion("node", "Response Generation", "添加回复生成节点"));
                suggestions.add(new Suggestion("node", "Sentiment Analysis", "添加情感分析节点"));
                break;
            default:
                suggestions.add(new Suggestion("node", "Text Generation", "添加文本生成节点"));
                suggestions.add(new Suggestion("node", "Condition", "添加条件节点"));
                suggestions.add(new Suggestion("node", "Loop", "添加循环节点"));
                break;
        }
        
        return suggestions;
    }
    
    // 建议类
    public static class Suggestion {
        private String type; // template, variable, completion, error, node
        private String content;
        private String description;
        
        public Suggestion(String type, String content, String description) {
            this.type = type;
            this.content = content;
            this.description = description;
        }
        
        // Getters
        public String getType() { return type; }
        public String getContent() { return content; }
        public String getDescription() { return description; }
    }
    
    // 错误建议类
    public static class ErrorSuggestion {
        private String type;
        private String message;
        
        public ErrorSuggestion(String type, String message) {
            this.type = type;
            this.message = message;
        }
        
        // Getters
        public String getType() { return type; }
        public String getMessage() { return message; }
    }
}