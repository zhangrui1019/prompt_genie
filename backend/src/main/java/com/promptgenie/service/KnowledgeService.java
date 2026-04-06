package com.promptgenie.service;

import com.promptgenie.entity.Document;
import com.promptgenie.entity.KnowledgeBase;
import com.promptgenie.mapper.DocumentMapper;
import com.promptgenie.mapper.KnowledgeBaseMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;
import java.util.Arrays;
import org.springframework.web.multipart.MultipartFile;

@Service
public class KnowledgeService {
    
    @Autowired
    private KnowledgeBaseMapper knowledgeBaseMapper;
    
    @Autowired
    private DocumentMapper documentMapper;
    
    @Autowired
    private EmbeddingService embeddingService;
    
    public KnowledgeBase createKnowledgeBase(Long userId, String name, String description) {
        KnowledgeBase kb = new KnowledgeBase();
        kb.setUserId(userId);
        kb.setName(name);
        kb.setDescription(description);
        knowledgeBaseMapper.insert(kb);
        return kb;
    }
    
    public List<KnowledgeBase> getUserKnowledgeBases(Long userId) {
        return knowledgeBaseMapper.selectList(null);
    }
    
    public KnowledgeBase getKnowledgeBase(Long id) {
        return knowledgeBaseMapper.selectById(id);
    }
    
    public void deleteKnowledgeBase(Long id) {
        // 删除知识库
        knowledgeBaseMapper.deleteById(id);
        // 删除相关文档
        documentMapper.deleteById(id);
    }
    
    public Document uploadDocument(Long kbId, MultipartFile file) throws IOException {
        Document document = new Document();
        document.setKbId(kbId);
        document.setFilename(file.getOriginalFilename());
        document.setFileType(file.getContentType());
        
        // 解析和切分文档
        String content = parseAndChunkDocument(file);
        document.setContent(content);
        document.setFileSize(file.getSize());
        documentMapper.insert(document);
        
        // 生成嵌入向量
        embeddingService.generateEmbedding(document);
        
        return document;
    }
    
    private String parseAndChunkDocument(MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename();
        String contentType = file.getContentType();
        
        // 读取文件内容
        byte[] bytes = file.getBytes();
        String content = new String(bytes);
        
        // 根据文件类型进行解析
        if (filename != null) {
            if (filename.endsWith(".pdf")) {
                // PDF 解析逻辑（简化实现）
                content = "[PDF Document] " + content.substring(0, Math.min(1000, content.length()));
            } else if (filename.endsWith(".docx") || filename.endsWith(".doc")) {
                // Word 解析逻辑（简化实现）
                content = "[Word Document] " + content.substring(0, Math.min(1000, content.length()));
            } else if (filename.endsWith(".txt")) {
                // 文本文件直接使用
            } else if (contentType != null && contentType.startsWith("text")) {
                // 其他文本类型
            }
        }
        
        // 自动分块（简化实现，实际应根据语义进行分块）
        StringBuilder chunkedContent = new StringBuilder();
        int chunkSize = 1000; // 每个块的大小
        int start = 0;
        while (start < content.length()) {
            int end = Math.min(start + chunkSize, content.length());
            chunkedContent.append("[Chunk " + (start / chunkSize + 1) + "]\n");
            chunkedContent.append(content.substring(start, end));
            chunkedContent.append("\n\n");
            start = end;
        }
        
        return chunkedContent.toString();
    }
    
    public List<Document> getDocuments(Long kbId) {
        return documentMapper.selectList(null);
    }
    
    public void deleteDocument(Long docId) {
        documentMapper.deleteById(docId);
    }
    
    public String getKnowledgeContext(Long kbId, Long userId, String query) {
        // 实现混合检索：向量检索 + 全文检索
        List<Document> documents = documentMapper.selectList(null);
        List<Document> relevantDocuments = new ArrayList<>();
        
        // 全文检索（简化实现）
        for (Document doc : documents) {
            if (doc.getContent().toLowerCase().contains(query.toLowerCase())) {
                relevantDocuments.add(doc);
            }
        }
        
        // 向量检索（简化实现，实际应使用真实的向量相似度计算）
        if (relevantDocuments.isEmpty()) {
            // 如果全文检索没有结果，使用向量检索
            for (Document doc : documents) {
                // 计算相似度（简化实现）
                double similarity = calculateSimilarity(doc.getContent(), query);
                if (similarity > 0.5) { // 相似度阈值
                    relevantDocuments.add(doc);
                }
            }
        }
        
        // 构建上下文
        StringBuilder context = new StringBuilder();
        context.append("[Knowledge Base Context]\n");
        context.append("Query: " + query + "\n\n");
        
        if (relevantDocuments.isEmpty()) {
            context.append("No relevant documents found.\n");
        } else {
            for (Document doc : relevantDocuments) {
                context.append("Document: " + doc.getFilename() + "\n");
                context.append("Content: " + doc.getContent() + "\n\n");
            }
        }
        
        return context.toString();
    }
    
    private double calculateSimilarity(String text1, String text2) {
        // 简化的相似度计算实现
        // 实际应使用真实的向量嵌入和余弦相似度计算
        String[] words1 = text1.toLowerCase().split("\\s+");
        String[] words2 = text2.toLowerCase().split("\\s+");
        
        Set<String> set1 = new HashSet<>(Arrays.asList(words1));
        Set<String> set2 = new HashSet<>(Arrays.asList(words2));
        
        Set<String> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);
        
        Set<String> union = new HashSet<>(set1);
        union.addAll(set2);
        
        return union.isEmpty() ? 0.0 : (double) intersection.size() / union.size();
    }
    
    public void moveKbToWorkspace(Long kbId, Long workspaceId) {
        KnowledgeBase kb = knowledgeBaseMapper.selectById(kbId);
        if (kb != null) {
            kb.setWorkspaceId(workspaceId);
            knowledgeBaseMapper.updateById(kb);
        }
    }
}
