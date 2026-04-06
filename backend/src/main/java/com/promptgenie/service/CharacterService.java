package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class CharacterService {
    
    private final Map<String, Character> characters = new ConcurrentHashMap<>();
    private final Map<String, CharacterMemory> characterMemories = new ConcurrentHashMap<>();
    private final Map<String, CharacterInteraction> characterInteractions = new ConcurrentHashMap<>();
    
    // 初始化角色服务
    public void init() {
        // 初始化默认角色
        initDefaultCharacters();
    }
    
    // 初始化默认角色
    private void initDefaultCharacters() {
        // 创建一个友好的助手角色
        createCharacter(
            "assistant",
            "助手",
            "ASSISTANT",
            "一个友好、专业的AI助手，总是愿意帮助用户解决问题",
            Map.of(
                "personality", "友好、专业、耐心",
                "language_style", "正式但亲切",
                "knowledge_level", "广泛",
                "response_style", "详细、有条理"
            ),
            System.currentTimeMillis()
        );
        
        // 创建一个创意写作角色
        createCharacter(
            "writer",
            "作家",
            "CREATIVE",
            "一个富有想象力的创意作家，擅长编写故事和诗歌",
            Map.of(
                "personality", "富有想象力、感性、浪漫",
                "language_style", "生动、富有表现力",
                "knowledge_level", "文学、艺术",
                "response_style", "富有创意、详细描述"
            ),
            System.currentTimeMillis()
        );
    }
    
    // 创建角色
    public Character createCharacter(String characterId, String name, String type, String description, Map<String, Object> traits, long createdAt) {
        Character character = new Character(
            characterId,
            name,
            type,
            description,
            traits,
            createdAt
        );
        characters.put(characterId, character);
        
        // 初始化角色记忆
        CharacterMemory memory = new CharacterMemory(
            "memory_" + characterId,
            characterId,
            new ArrayList<>(),
            new HashMap<>(),
            createdAt
        );
        characterMemories.put(memory.getMemoryId(), memory);
        
        return character;
    }
    
    // 更新角色设定
    public void updateCharacterTraits(String characterId, Map<String, Object> traits) {
        Character character = characters.get(characterId);
        if (character != null) {
            character.setTraits(traits);
        }
    }
    
    // 记录角色互动
    public CharacterInteraction recordInteraction(String interactionId, String characterId, String userId, String userInput, String characterResponse, long timestamp) {
        CharacterInteraction interaction = new CharacterInteraction(
            interactionId,
            characterId,
            userId,
            userInput,
            characterResponse,
            timestamp
        );
        characterInteractions.put(interactionId, interaction);
        
        // 更新角色记忆
        updateCharacterMemory(characterId, userInput, characterResponse);
        
        return interaction;
    }
    
    // 更新角色记忆
    private void updateCharacterMemory(String characterId, String userInput, String characterResponse) {
        // 查找角色记忆
        CharacterMemory memory = characterMemories.values().stream()
            .filter(m -> m.getCharacterId().equals(characterId))
            .findFirst()
            .orElse(null);
        
        if (memory != null) {
            // 添加对话记录
            MemoryEntry entry = new MemoryEntry(
                "entry_" + System.currentTimeMillis(),
                userInput,
                characterResponse,
                System.currentTimeMillis()
            );
            memory.getMemoryEntries().add(entry);
            
            // 保持记忆大小限制
            if (memory.getMemoryEntries().size() > 100) {
                memory.getMemoryEntries().remove(0);
            }
            
            // 提取关键信息
            extractKeyInformation(memory, userInput, characterResponse);
        }
    }
    
    // 提取关键信息
    private void extractKeyInformation(CharacterMemory memory, String userInput, String characterResponse) {
        // 简单的关键词提取
        List<String> keywords = Arrays.asList(
            "名字", "年龄", "职业", "爱好", "生日", "地址", "电话", "邮箱"
        );
        
        Map<String, Object> keyInfo = memory.getKeyInformation();
        
        // 从用户输入中提取信息
        for (String keyword : keywords) {
            if (userInput.contains(keyword)) {
                // 简单的信息提取逻辑
                int index = userInput.indexOf(keyword);
                if (index != -1) {
                    String info = userInput.substring(index + keyword.length()).trim();
                    if (!info.isEmpty()) {
                        keyInfo.put(keyword, info);
                    }
                }
            }
        }
    }
    
    // 检查角色一致性
    public ConsistencyCheckResult checkConsistency(String characterId, String response) {
        Character character = characters.get(characterId);
        if (character == null) {
            return new ConsistencyCheckResult(false, Collections.singletonList("角色不存在"));
        }
        
        List<String> issues = new ArrayList<>();
        
        // 检查语言风格一致性
        String languageStyle = (String) character.getTraits().getOrDefault("language_style", "");
        if (!languageStyle.isEmpty()) {
            if (!checkLanguageStyleConsistency(response, languageStyle)) {
                issues.add("语言风格不一致");
            }
        }
        
        // 检查性格一致性
        String personality = (String) character.getTraits().getOrDefault("personality", "");
        if (!personality.isEmpty()) {
            if (!checkPersonalityConsistency(response, personality)) {
                issues.add("性格表现不一致");
            }
        }
        
        // 检查记忆一致性
        CharacterMemory memory = characterMemories.values().stream()
            .filter(m -> m.getCharacterId().equals(characterId))
            .findFirst()
            .orElse(null);
        
        if (memory != null) {
            List<String> memoryIssues = checkMemoryConsistency(response, memory);
            issues.addAll(memoryIssues);
        }
        
        boolean consistent = issues.isEmpty();
        return new ConsistencyCheckResult(consistent, issues);
    }
    
    // 检查语言风格一致性
    private boolean checkLanguageStyleConsistency(String response, String expectedStyle) {
        // 简单的风格检查
        switch (expectedStyle) {
            case "正式但亲切":
                return response.contains("请") || response.contains("您");
            case "生动、富有表现力":
                return response.contains("像") || response.contains("如同");
            case "简洁、直接":
                return response.length() < 100;
            default:
                return true;
        }
    }
    
    // 检查性格一致性
    private boolean checkPersonalityConsistency(String response, String expectedPersonality) {
        // 简单的性格检查
        if (expectedPersonality.contains("友好")) {
            return !response.contains("不喜欢") && !response.contains("讨厌");
        } else if (expectedPersonality.contains("专业")) {
            return response.contains("建议") || response.contains("推荐");
        } else if (expectedPersonality.contains("富有想象力")) {
            return response.contains("想象") || response.contains("创意");
        }
        return true;
    }
    
    // 检查记忆一致性
    private List<String> checkMemoryConsistency(String response, CharacterMemory memory) {
        List<String> issues = new ArrayList<>();
        
        // 检查关键信息一致性
        Map<String, Object> keyInfo = memory.getKeyInformation();
        for (Map.Entry<String, Object> entry : keyInfo.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();
            
            if (response.contains(key) && !response.contains(value.toString())) {
                issues.add("记忆信息不一致: " + key);
            }
        }
        
        return issues;
    }
    
    // 生成角色响应
    public String generateCharacterResponse(String characterId, String userInput) {
        Character character = characters.get(characterId);
        if (character == null) {
            return "角色不存在";
        }
        
        // 获取角色记忆
        CharacterMemory memory = characterMemories.values().stream()
            .filter(m -> m.getCharacterId().equals(characterId))
            .findFirst()
            .orElse(null);
        
        // 基于角色设定和记忆生成响应
        StringBuilder response = new StringBuilder();
        
        // 添加角色风格的开场白
        String languageStyle = (String) character.getTraits().getOrDefault("language_style", "");
        switch (languageStyle) {
            case "正式但亲切":
                response.append("您好！");
                break;
            case "生动、富有表现力":
                response.append("啊，这真是个有趣的话题！");
                break;
            case "简洁、直接":
                response.append("好的，");
                break;
            default:
                response.append("你好！");
                break;
        }
        
        // 添加对用户输入的回应
        response.append("关于您提到的 \"").append(userInput).append("\"，");
        
        // 添加角色个性的内容
        String personality = (String) character.getTraits().getOrDefault("personality", "");
        if (personality.contains("友好")) {
            response.append("我很乐意帮助您了解更多。");
        } else if (personality.contains("专业")) {
            response.append("根据我的知识，这是一个重要的问题。");
        } else if (personality.contains("富有想象力")) {
            response.append("让我展开想象，为您描绘一个可能的场景。");
        }
        
        // 添加记忆中的信息
        if (memory != null && !memory.getKeyInformation().isEmpty()) {
            response.append(" 我记得您之前提到过");
            List<String> keyInfoList = new ArrayList<>(memory.getKeyInformation().keySet());
            if (!keyInfoList.isEmpty()) {
                response.append(" ").append(keyInfoList.get(0));
            }
            response.append("。");
        }
        
        return response.toString();
    }
    
    // 获取角色
    public Character getCharacter(String characterId) {
        return characters.get(characterId);
    }
    
    // 获取角色记忆
    public CharacterMemory getCharacterMemory(String characterId) {
        return characterMemories.values().stream()
            .filter(memory -> memory.getCharacterId().equals(characterId))
            .findFirst()
            .orElse(null);
    }
    
    // 获取角色互动记录
    public List<CharacterInteraction> getCharacterInteractions(String characterId, String userId) {
        return characterInteractions.values().stream()
            .filter(interaction -> interaction.getCharacterId().equals(characterId) && 
                                (userId == null || interaction.getUserId().equals(userId)))
            .sorted(Comparator.comparingLong(CharacterInteraction::getTimestamp).reversed())
            .collect(Collectors.toList());
    }
    
    // 角色类
    public static class Character {
        private String characterId;
        private String name;
        private String type;
        private String description;
        private Map<String, Object> traits;
        private long createdAt;
        
        public Character(String characterId, String name, String type, String description, Map<String, Object> traits, long createdAt) {
            this.characterId = characterId;
            this.name = name;
            this.type = type;
            this.description = description;
            this.traits = traits;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getCharacterId() { return characterId; }
        public void setCharacterId(String characterId) { this.characterId = characterId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Map<String, Object> getTraits() { return traits; }
        public void setTraits(Map<String, Object> traits) { this.traits = traits; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 角色记忆类
    public static class CharacterMemory {
        private String memoryId;
        private String characterId;
        private List<MemoryEntry> memoryEntries;
        private Map<String, Object> keyInformation;
        private long createdAt;
        
        public CharacterMemory(String memoryId, String characterId, List<MemoryEntry> memoryEntries, Map<String, Object> keyInformation, long createdAt) {
            this.memoryId = memoryId;
            this.characterId = characterId;
            this.memoryEntries = memoryEntries;
            this.keyInformation = keyInformation;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getMemoryId() { return memoryId; }
        public void setMemoryId(String memoryId) { this.memoryId = memoryId; }
        public String getCharacterId() { return characterId; }
        public void setCharacterId(String characterId) { this.characterId = characterId; }
        public List<MemoryEntry> getMemoryEntries() { return memoryEntries; }
        public void setMemoryEntries(List<MemoryEntry> memoryEntries) { this.memoryEntries = memoryEntries; }
        public Map<String, Object> getKeyInformation() { return keyInformation; }
        public void setKeyInformation(Map<String, Object> keyInformation) { this.keyInformation = keyInformation; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 记忆条目类
    public static class MemoryEntry {
        private String entryId;
        private String userInput;
        private String characterResponse;
        private long timestamp;
        
        public MemoryEntry(String entryId, String userInput, String characterResponse, long timestamp) {
            this.entryId = entryId;
            this.userInput = userInput;
            this.characterResponse = characterResponse;
            this.timestamp = timestamp;
        }
        
        // Getters and setters
        public String getEntryId() { return entryId; }
        public void setEntryId(String entryId) { this.entryId = entryId; }
        public String getUserInput() { return userInput; }
        public void setUserInput(String userInput) { this.userInput = userInput; }
        public String getCharacterResponse() { return characterResponse; }
        public void setCharacterResponse(String characterResponse) { this.characterResponse = characterResponse; }
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    }
    
    // 角色互动类
    public static class CharacterInteraction {
        private String interactionId;
        private String characterId;
        private String userId;
        private String userInput;
        private String characterResponse;
        private long timestamp;
        
        public CharacterInteraction(String interactionId, String characterId, String userId, String userInput, String characterResponse, long timestamp) {
            this.interactionId = interactionId;
            this.characterId = characterId;
            this.userId = userId;
            this.userInput = userInput;
            this.characterResponse = characterResponse;
            this.timestamp = timestamp;
        }
        
        // Getters and setters
        public String getInteractionId() { return interactionId; }
        public void setInteractionId(String interactionId) { this.interactionId = interactionId; }
        public String getCharacterId() { return characterId; }
        public void setCharacterId(String characterId) { this.characterId = characterId; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getUserInput() { return userInput; }
        public void setUserInput(String userInput) { this.userInput = userInput; }
        public String getCharacterResponse() { return characterResponse; }
        public void setCharacterResponse(String characterResponse) { this.characterResponse = characterResponse; }
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    }
    
    // 一致性检查结果类
    public static class ConsistencyCheckResult {
        private boolean consistent;
        private List<String> issues;
        
        public ConsistencyCheckResult(boolean consistent, List<String> issues) {
            this.consistent = consistent;
            this.issues = issues;
        }
        
        // Getters and setters
        public boolean isConsistent() { return consistent; }
        public void setConsistent(boolean consistent) { this.consistent = consistent; }
        public List<String> getIssues() { return issues; }
        public void setIssues(List<String> issues) { this.issues = issues; }
    }
}