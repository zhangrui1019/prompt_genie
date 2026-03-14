package com.promptgenie.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.promptgenie.entity.Document;
import com.promptgenie.entity.KnowledgeBase;
import com.promptgenie.mapper.DocumentMapper;
import com.promptgenie.mapper.KnowledgeBaseMapper;
import org.springframework.ai.document.Document;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class KnowledgeService {

    @Autowired
    private KnowledgeBaseMapper kbMapper;

    @Autowired
    private DocumentMapper documentMapper;
    
    @Autowired
    private VectorStore vectorStore;
    
    @Autowired
    private QuotaService quotaService;

    public KnowledgeBase createKnowledgeBase(Long userId, String name, String description) {
        KnowledgeBase kb = new KnowledgeBase();
        kb.setUserId(userId);
        kb.setName(name);
        kb.setDescription(description);
        kb.setCreatedAt(LocalDateTime.now());
        kb.setUpdatedAt(LocalDateTime.now());
        kbMapper.insert(kb);
        return kb;
        public void moveKbToWorkspace(Long kbId, Long targetWorkspaceId) {
        KnowledgeBase kb = kbMapper.selectById(kbId);
        if (kb != null) {
            kb.setWorkspaceId(targetWorkspaceId);
            kbMapper.updateById(kb);
        }
    }
}

    public List<KnowledgeBase> getUserKnowledgeBases(Long userId) {
        QueryWrapper<KnowledgeBase> query = new QueryWrapper<>();
        query.eq("user_id", userId).orderByDesc("created_at");
        return kbMapper.selectList(query);
    }
    
    public KnowledgeBase getKnowledgeBase(Long kbId) {
        return kbMapper.selectById(kbId);
    }
    
    public void deleteKnowledgeBase(Long kbId) {
        kbMapper.deleteById(kbId);
        // Documents will be deleted by Cascade on DB level, but we can also do it here if needed
        QueryWrapper<Document> query = new QueryWrapper<>();
        query.eq("kb_id", kbId);
        documentMapper.delete(query);
    }

    public com.promptgenie.entity.Document uploadDocument(Long kbId, MultipartFile file) throws IOException {
        // Validate file extension
        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null) {
            String extension = "";
            int i = originalFilename.lastIndexOf('.');
            if (i > 0) {
                extension = originalFilename.substring(i + 1).toLowerCase();
            }
            
            // Allowed extensions list
            List<String> allowedExtensions = List.of("txt", "md", "json", "csv", "log");
            if (!allowedExtensions.contains(extension)) {
                throw new IOException("Unsupported file type: " + extension + ". Allowed: txt, md, json, csv, log");
            }
        }

        com.promptgenie.entity.Document doc = new com.promptgenie.entity.Document();
        doc.setKbId(kbId);
        doc.setFilename(file.getOriginalFilename());
        doc.setFileType(file.getContentType());
        doc.setFileSize(file.getSize());
        doc.setCreatedAt(LocalDateTime.now());
        
        String content = "";
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            content = reader.lines().collect(Collectors.joining("\n"));
        }
        
        doc.setContent(content);
        documentMapper.insert(doc);
        
        // Chunk and save to vector store
        try {
            TokenTextSplitter splitter = new TokenTextSplitter();
            List<String> chunks = splitter.split(content, 500); // 500 tokens per chunk
            
            List<Document> documents = chunks.stream().map(chunk -> 
                new Document(chunk, Map.of(
                    "kbId", kbId,
                    "docId", doc.getId(),
                    "filename", doc.getFilename()
                ))
            ).collect(Collectors.toList());
            
            vectorStore.add(documents);
        } catch (Exception e) {
            System.err.println("Failed to vectorize document: " + e.getMessage());
            // Optionally rollback db insert or throw error
        }
        
        return doc;
    }

    public List<com.promptgenie.entity.Document> getDocuments(Long kbId) {
        QueryWrapper<com.promptgenie.entity.Document> query = new QueryWrapper<>();
        query.eq("kb_id", kbId).orderByDesc("created_at");
        // Exclude content for list view to save bandwidth
        query.select(com.promptgenie.entity.Document.class, info -> !info.getColumn().equals("content"));
        return documentMapper.selectList(query);
    }

    public void deleteDocument(Long docId) {
        documentMapper.deleteById(docId);
        // Delete from vector store using filter expression
        // Requires more complex filter string for pgvector store, for now we skip deletion in vector DB
        // or clear the vector db entirely if needed.
    }

    public String getKnowledgeContext(Long kbId, Long userId, String queryStr) {
        // Get limits
        GenieConfig.QuotaLimits limits = quotaService.getKbLimits(userId);
        int maxDocs = limits.getMaxKbDocs() != null ? limits.getMaxKbDocs() : 3; // mapped to topK
        int maxChars = limits.getMaxKbContextChars() != null ? limits.getMaxKbContextChars() : 2000;
        
        if (queryStr == null || queryStr.trim().isEmpty()) {
            // Fallback to basic DB fetch if no query
            return fetchBasicContext(kbId, maxDocs, maxChars);
        }

        try {
            List<Document> similarDocuments = vectorStore.similaritySearch(
                SearchRequest.query(queryStr)
                    .withTopK(maxDocs)
                    .withFilterExpression("kbId == '" + kbId + "'")
            );

            if (similarDocuments.isEmpty()) {
                return "No relevant context found in knowledge base.";
            }

            StringBuilder context = new StringBuilder();
            for (Document doc : similarDocuments) {
                String filename = (String) doc.getMetadata().get("filename");
                String content = doc.getContent();
                
                String docStr = "--- Document: " + (filename != null ? filename : "Unknown") + " ---\n" + content + "\n\n";
                if (context.length() + docStr.length() > maxChars) {
                    int remaining = maxChars - context.length();
                    if (remaining > 50) {
                        context.append(docStr.substring(0, remaining)).append("... [Truncated]\n");
                    }
                    break;
                }
                context.append(docStr);
            }
            return context.toString();
        } catch (Exception e) {
            System.err.println("Vector search failed: " + e.getMessage());
            return fetchBasicContext(kbId, maxDocs, maxChars);
        }
    }

    private String fetchBasicContext(Long kbId, int maxDocs, int maxChars) {
        QueryWrapper<com.promptgenie.entity.Document> query = new QueryWrapper<>();
        query.eq("kb_id", kbId);
        List<com.promptgenie.entity.Document> docs = documentMapper.selectList(query);
        
        StringBuilder context = new StringBuilder();
        int currentDocs = 0;
        
        for (com.promptgenie.entity.Document doc : docs) {
            if (currentDocs >= maxDocs) break;
            if (doc.getContent() == null) continue;
            
            String docStr = "--- Document: " + doc.getFilename() + " ---\n" + doc.getContent() + "\n\n";
            if (context.length() + docStr.length() > maxChars) {
                int remaining = maxChars - context.length();
                if (remaining > 50) {
                    context.append(docStr.substring(0, remaining)).append("... [Truncated]\n");
                }
                break;
            }
            context.append(docStr);
            currentDocs++;
        }
        return context.toString();
    }
}
