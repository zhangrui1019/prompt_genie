package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class QAService {
    
    private final Map<Long, List<Message>> conversationHistory = new ConcurrentHashMap<>();
    private final Map<String, String> faqDatabase = new HashMap<>();
    
    // 初始化问答服务
    public void init() {
        // 初始化FAQ数据库
        initializeFaqDatabase();
    }
    
    // 初始化FAQ数据库
    private void initializeFaqDatabase() {
        // 系统使用相关
        faqDatabase.put("如何创建一个新的Prompt", "要创建一个新的Prompt，请点击左侧导航栏中的'Prompt'选项，然后点击'创建新Prompt'按钮，填写相关信息后保存即可。");
        faqDatabase.put("如何使用工作流画布", "工作流画布位于'Chain'选项中，您可以通过拖拽节点来创建工作流，连接节点之间的关系，然后运行整个工作流。");
        faqDatabase.put("如何邀请团队成员", "在工作区设置页面中，您可以通过输入团队成员的邮箱地址来邀请他们加入工作区，并设置相应的角色权限。");
        
        // 故障排查相关
        faqDatabase.put("为什么我的Prompt运行失败", "Prompt运行失败可能是由于多种原因，如输入参数错误、模型限制、网络问题等。请检查输入参数是否正确，网络连接是否正常，或尝试使用不同的模型。");
        
        // 账户相关
        faqDatabase.put("如何修改密码", "在个人设置页面中，您可以找到'修改密码'选项，按照提示输入旧密码和新密码即可完成修改。");
        
        // 计费相关
        faqDatabase.put("如何查看我的使用情况", "在账户设置页面中，您可以查看详细的使用情况和计费信息。");
    }
    
    // 处理用户问题
    public Answer processQuestion(Long userId, String question) {
        // 记录问题到对话历史
        Message userMessage = new Message("user", question, System.currentTimeMillis());
        List<Message> history = conversationHistory.computeIfAbsent(userId, k -> new ArrayList<>());
        history.add(userMessage);
        
        // 分类问题
        String category = categorizeQuestion(question);
        
        // 生成回答
        String answer = generateAnswer(question, category, history);
        
        // 记录回答到对话历史
        Message assistantMessage = new Message("assistant", answer, System.currentTimeMillis());
        history.add(assistantMessage);
        
        // 限制对话历史长度
        if (history.size() > 50) {
            history.subList(0, history.size() - 50).clear();
        }
        
        return new Answer(answer, category);
    }
    
    // 分类问题
    private String categorizeQuestion(String question) {
        // 简单的问题分类
        question = question.toLowerCase();
        
        if (question.contains("如何") || question.contains("怎么") || question.contains("怎样")) {
            return "how_to";
        } else if (question.contains("为什么") || question.contains("原因") || question.contains("故障")) {
            return "troubleshooting";
        } else if (question.contains("账户") || question.contains("密码") || question.contains("登录")) {
            return "account";
        } else if (question.contains("费用") || question.contains("计费") || question.contains("使用情况")) {
            return "billing";
        } else {
            return "general";
        }
    }
    
    // 生成回答
    private String generateAnswer(String question, String category, List<Message> history) {
        // 首先尝试从FAQ数据库中查找答案
        String faqAnswer = findAnswerInFaq(question);
        if (faqAnswer != null) {
            return faqAnswer;
        }
        
        // 基于问题分类生成回答
        switch (category) {
            case "how_to":
                return "我理解您的问题是关于如何操作的。为了更好地帮助您，请问您具体想了解哪个功能的操作步骤？";
            case "troubleshooting":
                return "我理解您遇到了问题。为了更好地帮助您解决问题，请问您能提供更多关于问题的详细信息吗？";
            case "account":
                return "我理解您的问题是关于账户的。为了更好地帮助您，请问您具体想了解账户的哪个方面？";
            case "billing":
                return "我理解您的问题是关于计费的。为了更好地帮助您，请问您具体想了解计费的哪个方面？";
            default:
                return "感谢您的问题。我是Prompt Genie的智能助手，有什么我可以帮助您的吗？";
        }
    }
    
    // 从FAQ数据库中查找答案
    private String findAnswerInFaq(String question) {
        for (Map.Entry<String, String> entry : faqDatabase.entrySet()) {
            if (question.toLowerCase().contains(entry.getKey().toLowerCase())) {
                return entry.getValue();
            }
        }
        return null;
    }
    
    // 获取对话历史
    public List<Message> getConversationHistory(Long userId) {
        return conversationHistory.getOrDefault(userId, Collections.emptyList());
    }
    
    // 清空对话历史
    public void clearConversationHistory(Long userId) {
        conversationHistory.remove(userId);
    }
    
    // 添加自定义FAQ
    public void addCustomFaq(String question, String answer) {
        faqDatabase.put(question, answer);
    }
    
    // 获取FAQ列表
    public Map<String, String> getFaqList() {
        return faqDatabase;
    }
    
    // 消息类
    public static class Message {
        private String role; // user, assistant
        private String content;
        private long timestamp;
        
        public Message(String role, String content, long timestamp) {
            this.role = role;
            this.content = content;
            this.timestamp = timestamp;
        }
        
        // Getters
        public String getRole() { return role; }
        public String getContent() { return content; }
        public long getTimestamp() { return timestamp; }
    }
    
    // 回答类
    public static class Answer {
        private String content;
        private String category;
        
        public Answer(String content, String category) {
            this.content = content;
            this.category = category;
        }
        
        // Getters
        public String getContent() { return content; }
        public String getCategory() { return category; }
    }
}