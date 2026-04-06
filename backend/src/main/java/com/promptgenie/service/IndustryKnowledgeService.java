package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class IndustryKnowledgeService {
    
    private final Map<String, KnowledgeBase> knowledgeBases = new ConcurrentHashMap<>();
    private final Map<String, KnowledgeEntity> knowledgeEntities = new ConcurrentHashMap<>();
    private final Map<String, Regulation> regulations = new ConcurrentHashMap<>();
    private final Map<String, Term> industryTerms = new ConcurrentHashMap<>();
    
    // 初始化行业知识库服务
    public void init() {
        // 初始化默认知识库
        initDefaultKnowledgeBases();
    }
    
    // 初始化默认知识库
    private void initDefaultKnowledgeBases() {
        // 医疗知识库
        createKnowledgeBase(
            "medical",
            "医疗知识库",
            "MEDICAL",
            "包含医学术语、疾病信息、治疗方案等医疗专业知识",
            System.currentTimeMillis()
        );
        
        // 法律知识库
        createKnowledgeBase(
            "legal",
            "法律知识库",
            "LEGAL",
            "包含法律法规、案例分析、法律术语等法律专业知识",
            System.currentTimeMillis()
        );
        
        // 金融知识库
        createKnowledgeBase(
            "financial",
            "金融知识库",
            "FINANCIAL",
            "包含金融产品、市场信息、投资策略等金融专业知识",
            System.currentTimeMillis()
        );
    }
    
    // 创建知识库
    public KnowledgeBase createKnowledgeBase(String kbId, String name, String industry, String description, long createdAt) {
        KnowledgeBase knowledgeBase = new KnowledgeBase(
            kbId,
            name,
            industry,
            description,
            new ArrayList<>(),
            createdAt
        );
        knowledgeBases.put(kbId, knowledgeBase);
        return knowledgeBase;
    }
    
    // 添加知识实体到知识库
    public KnowledgeEntity addKnowledgeEntity(String entityId, String kbId, String type, String name, String content, Map<String, Object> metadata, long createdAt) {
        KnowledgeBase knowledgeBase = knowledgeBases.get(kbId);
        if (knowledgeBase == null) {
            throw new IllegalArgumentException("Knowledge base not found");
        }
        
        KnowledgeEntity entity = new KnowledgeEntity(
            entityId,
            kbId,
            type,
            name,
            content,
            metadata,
            createdAt
        );
        knowledgeEntities.put(entityId, entity);
        knowledgeBase.getEntityIds().add(entityId);
        
        return entity;
    }
    
    // 添加行业术语
    public Term addIndustryTerm(String termId, String industry, String term, String definition, List<String> synonyms, long createdAt) {
        Term industryTerm = new Term(
            termId,
            industry,
            term,
            definition,
            synonyms,
            createdAt
        );
        industryTerms.put(termId, industryTerm);
        return industryTerm;
    }
    
    // 添加法规
    public Regulation addRegulation(String regulationId, String industry, String title, String content, String effectiveDate, long createdAt) {
        Regulation regulation = new Regulation(
            regulationId,
            industry,
            title,
            content,
            effectiveDate,
            createdAt
        );
        regulations.put(regulationId, regulation);
        return regulation;
    }
    
    // 搜索知识库
    public List<KnowledgeEntity> searchKnowledgeBase(String kbId, String query, Map<String, Object> filters) {
        KnowledgeBase knowledgeBase = knowledgeBases.get(kbId);
        if (knowledgeBase == null) {
            return Collections.emptyList();
        }
        
        List<KnowledgeEntity> results = new ArrayList<>();
        for (String entityId : knowledgeBase.getEntityIds()) {
            KnowledgeEntity entity = knowledgeEntities.get(entityId);
            if (entity != null) {
                // 简单的全文搜索
                if (entity.getName().contains(query) || entity.getContent().contains(query)) {
                    // 应用过滤条件
                    if (applyFilters(entity, filters)) {
                        results.add(entity);
                    }
                }
            }
        }
        
        return results;
    }
    
    // 应用过滤条件
    private boolean applyFilters(KnowledgeEntity entity, Map<String, Object> filters) {
        if (filters == null || filters.isEmpty()) {
            return true;
        }
        
        for (Map.Entry<String, Object> entry : filters.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();
            
            if (entity.getMetadata().containsKey(key)) {
                if (!entity.getMetadata().get(key).equals(value)) {
                    return false;
                }
            } else {
                return false;
            }
        }
        
        return true;
    }
    
    // 识别专业术语
    public List<Term> identifyIndustryTerms(String text, String industry) {
        List<Term> identifiedTerms = new ArrayList<>();
        
        for (Term term : industryTerms.values()) {
            if (term.getIndustry().equals(industry) && text.contains(term.getTerm())) {
                identifiedTerms.add(term);
                
                // 检查同义词
                for (String synonym : term.getSynonyms()) {
                    if (text.contains(synonym)) {
                        identifiedTerms.add(term);
                    }
                }
            }
        }
        
        // 去重
        return identifiedTerms.stream().distinct().collect(Collectors.toList());
    }
    
    // 检查法规合规性
    public ComplianceCheckResult checkCompliance(String content, String industry) {
        List<String> violations = new ArrayList<>();
        List<Regulation> relevantRegulations = new ArrayList<>();
        
        // 查找相关法规
        for (Regulation regulation : regulations.values()) {
            if (regulation.getIndustry().equals(industry)) {
                relevantRegulations.add(regulation);
                
                // 简单的合规性检查
                if (!content.contains(regulation.getTitle())) {
                    violations.add("未提及法规: " + regulation.getTitle());
                }
            }
        }
        
        boolean compliant = violations.isEmpty();
        
        return new ComplianceCheckResult(
            compliant,
            violations,
            relevantRegulations
        );
    }
    
    // 构建知识图谱
    public KnowledgeGraph buildKnowledgeGraph(String kbId) {
        KnowledgeBase knowledgeBase = knowledgeBases.get(kbId);
        if (knowledgeBase == null) {
            return null;
        }
        
        List<KnowledgeEntity> entities = new ArrayList<>();
        List<Relationship> relationships = new ArrayList<>();
        
        // 收集所有实体
        for (String entityId : knowledgeBase.getEntityIds()) {
            KnowledgeEntity entity = knowledgeEntities.get(entityId);
            if (entity != null) {
                entities.add(entity);
            }
        }
        
        // 构建实体之间的关系
        for (int i = 0; i < entities.size(); i++) {
            KnowledgeEntity entity1 = entities.get(i);
            for (int j = i + 1; j < entities.size(); j++) {
                KnowledgeEntity entity2 = entities.get(j);
                
                // 简单的关系检测：如果一个实体的内容包含另一个实体的名称，则认为它们之间有关系
                if (entity1.getContent().contains(entity2.getName())) {
                    Relationship relationship = new Relationship(
                        "rel_" + System.currentTimeMillis(),
                        entity1.getEntityId(),
                        entity2.getEntityId(),
                        "RELATED_TO",
                        System.currentTimeMillis()
                    );
                    relationships.add(relationship);
                }
                
                if (entity2.getContent().contains(entity1.getName())) {
                    Relationship relationship = new Relationship(
                        "rel_" + System.currentTimeMillis(),
                        entity2.getEntityId(),
                        entity1.getEntityId(),
                        "RELATED_TO",
                        System.currentTimeMillis()
                    );
                    relationships.add(relationship);
                }
            }
        }
        
        return new KnowledgeGraph(
            "graph_" + kbId,
            kbId,
            entities,
            relationships,
            System.currentTimeMillis()
        );
    }
    
    // 回答基于知识库的问题
    public KnowledgeAnswer answerQuestion(String kbId, String question) {
        KnowledgeBase knowledgeBase = knowledgeBases.get(kbId);
        if (knowledgeBase == null) {
            return null;
        }
        
        // 搜索相关实体
        List<KnowledgeEntity> relevantEntities = searchKnowledgeBase(kbId, question, null);
        
        // 构建答案
        StringBuilder answerBuilder = new StringBuilder();
        List<String> sources = new ArrayList<>();
        
        for (KnowledgeEntity entity : relevantEntities) {
            answerBuilder.append(entity.getContent()).append("\n\n");
            sources.add(entity.getName());
        }
        
        String answer = answerBuilder.toString();
        if (answer.isEmpty()) {
            answer = "未找到相关信息";
        }
        
        return new KnowledgeAnswer(
            "answer_" + System.currentTimeMillis(),
            kbId,
            question,
            answer,
            sources,
            System.currentTimeMillis()
        );
    }
    
    // 获取知识库
    public KnowledgeBase getKnowledgeBase(String kbId) {
        return knowledgeBases.get(kbId);
    }
    
    // 获取知识实体
    public KnowledgeEntity getKnowledgeEntity(String entityId) {
        return knowledgeEntities.get(entityId);
    }
    
    // 获取行业术语
    public Term getIndustryTerm(String termId) {
        return industryTerms.get(termId);
    }
    
    // 获取法规
    public Regulation getRegulation(String regulationId) {
        return regulations.get(regulationId);
    }
    
    // 知识库类
    public static class KnowledgeBase {
        private String kbId;
        private String name;
        private String industry;
        private String description;
        private List<String> entityIds;
        private long createdAt;
        
        public KnowledgeBase(String kbId, String name, String industry, String description, List<String> entityIds, long createdAt) {
            this.kbId = kbId;
            this.name = name;
            this.industry = industry;
            this.description = description;
            this.entityIds = entityIds;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getKbId() { return kbId; }
        public void setKbId(String kbId) { this.kbId = kbId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getIndustry() { return industry; }
        public void setIndustry(String industry) { this.industry = industry; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public List<String> getEntityIds() { return entityIds; }
        public void setEntityIds(List<String> entityIds) { this.entityIds = entityIds; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 知识实体类
    public static class KnowledgeEntity {
        private String entityId;
        private String kbId;
        private String type;
        private String name;
        private String content;
        private Map<String, Object> metadata;
        private long createdAt;
        
        public KnowledgeEntity(String entityId, String kbId, String type, String name, String content, Map<String, Object> metadata, long createdAt) {
            this.entityId = entityId;
            this.kbId = kbId;
            this.type = type;
            this.name = name;
            this.content = content;
            this.metadata = metadata;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getEntityId() { return entityId; }
        public void setEntityId(String entityId) { this.entityId = entityId; }
        public String getKbId() { return kbId; }
        public void setKbId(String kbId) { this.kbId = kbId; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public Map<String, Object> getMetadata() { return metadata; }
        public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 术语类
    public static class Term {
        private String termId;
        private String industry;
        private String term;
        private String definition;
        private List<String> synonyms;
        private long createdAt;
        
        public Term(String termId, String industry, String term, String definition, List<String> synonyms, long createdAt) {
            this.termId = termId;
            this.industry = industry;
            this.term = term;
            this.definition = definition;
            this.synonyms = synonyms;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getTermId() { return termId; }
        public void setTermId(String termId) { this.termId = termId; }
        public String getIndustry() { return industry; }
        public void setIndustry(String industry) { this.industry = industry; }
        public String getTerm() { return term; }
        public void setTerm(String term) { this.term = term; }
        public String getDefinition() { return definition; }
        public void setDefinition(String definition) { this.definition = definition; }
        public List<String> getSynonyms() { return synonyms; }
        public void setSynonyms(List<String> synonyms) { this.synonyms = synonyms; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 法规类
    public static class Regulation {
        private String regulationId;
        private String industry;
        private String title;
        private String content;
        private String effectiveDate;
        private long createdAt;
        
        public Regulation(String regulationId, String industry, String title, String content, String effectiveDate, long createdAt) {
            this.regulationId = regulationId;
            this.industry = industry;
            this.title = title;
            this.content = content;
            this.effectiveDate = effectiveDate;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getRegulationId() { return regulationId; }
        public void setRegulationId(String regulationId) { this.regulationId = regulationId; }
        public String getIndustry() { return industry; }
        public void setIndustry(String industry) { this.industry = industry; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getEffectiveDate() { return effectiveDate; }
        public void setEffectiveDate(String effectiveDate) { this.effectiveDate = effectiveDate; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 知识图谱类
    public static class KnowledgeGraph {
        private String graphId;
        private String kbId;
        private List<KnowledgeEntity> entities;
        private List<Relationship> relationships;
        private long createdAt;
        
        public KnowledgeGraph(String graphId, String kbId, List<KnowledgeEntity> entities, List<Relationship> relationships, long createdAt) {
            this.graphId = graphId;
            this.kbId = kbId;
            this.entities = entities;
            this.relationships = relationships;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getGraphId() { return graphId; }
        public void setGraphId(String graphId) { this.graphId = graphId; }
        public String getKbId() { return kbId; }
        public void setKbId(String kbId) { this.kbId = kbId; }
        public List<KnowledgeEntity> getEntities() { return entities; }
        public void setEntities(List<KnowledgeEntity> entities) { this.entities = entities; }
        public List<Relationship> getRelationships() { return relationships; }
        public void setRelationships(List<Relationship> relationships) { this.relationships = relationships; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 关系类
    public static class Relationship {
        private String relationshipId;
        private String sourceEntityId;
        private String targetEntityId;
        private String type;
        private long createdAt;
        
        public Relationship(String relationshipId, String sourceEntityId, String targetEntityId, String type, long createdAt) {
            this.relationshipId = relationshipId;
            this.sourceEntityId = sourceEntityId;
            this.targetEntityId = targetEntityId;
            this.type = type;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getRelationshipId() { return relationshipId; }
        public void setRelationshipId(String relationshipId) { this.relationshipId = relationshipId; }
        public String getSourceEntityId() { return sourceEntityId; }
        public void setSourceEntityId(String sourceEntityId) { this.sourceEntityId = sourceEntityId; }
        public String getTargetEntityId() { return targetEntityId; }
        public void setTargetEntityId(String targetEntityId) { this.targetEntityId = targetEntityId; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 合规性检查结果类
    public static class ComplianceCheckResult {
        private boolean compliant;
        private List<String> violations;
        private List<Regulation> relevantRegulations;
        
        public ComplianceCheckResult(boolean compliant, List<String> violations, List<Regulation> relevantRegulations) {
            this.compliant = compliant;
            this.violations = violations;
            this.relevantRegulations = relevantRegulations;
        }
        
        // Getters and setters
        public boolean isCompliant() { return compliant; }
        public void setCompliant(boolean compliant) { this.compliant = compliant; }
        public List<String> getViolations() { return violations; }
        public void setViolations(List<String> violations) { this.violations = violations; }
        public List<Regulation> getRelevantRegulations() { return relevantRegulations; }
        public void setRelevantRegulations(List<Regulation> relevantRegulations) { this.relevantRegulations = relevantRegulations; }
    }
    
    // 知识回答类
    public static class KnowledgeAnswer {
        private String answerId;
        private String kbId;
        private String question;
        private String answer;
        private List<String> sources;
        private long createdAt;
        
        public KnowledgeAnswer(String answerId, String kbId, String question, String answer, List<String> sources, long createdAt) {
            this.answerId = answerId;
            this.kbId = kbId;
            this.question = question;
            this.answer = answer;
            this.sources = sources;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getAnswerId() { return answerId; }
        public void setAnswerId(String answerId) { this.answerId = answerId; }
        public String getKbId() { return kbId; }
        public void setKbId(String kbId) { this.kbId = kbId; }
        public String getQuestion() { return question; }
        public void setQuestion(String question) { this.question = question; }
        public String getAnswer() { return answer; }
        public void setAnswer(String answer) { this.answer = answer; }
        public List<String> getSources() { return sources; }
        public void setSources(List<String> sources) { this.sources = sources; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
}