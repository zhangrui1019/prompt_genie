package com.promptgenie.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.promptgenie.entity.Document;
import com.promptgenie.entity.KnowledgeBase;
import com.promptgenie.mapper.DocumentMapper;
import com.promptgenie.mapper.KnowledgeBaseMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class KnowledgeService {

    @Autowired
    private KnowledgeBaseMapper kbMapper;

    @Autowired
    private DocumentMapper documentMapper;

    public KnowledgeBase createKnowledgeBase(Long userId, String name, String description) {
        KnowledgeBase kb = new KnowledgeBase();
        kb.setUserId(userId);
        kb.setName(name);
        kb.setDescription(description);
        kb.setCreatedAt(LocalDateTime.now());
        kb.setUpdatedAt(LocalDateTime.now());
        kbMapper.insert(kb);
        return kb;
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

    public Document uploadDocument(Long kbId, MultipartFile file) throws IOException {
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

        Document doc = new Document();
        doc.setKbId(kbId);
        doc.setFilename(file.getOriginalFilename());
        doc.setFileType(file.getContentType());
        doc.setFileSize(file.getSize());
        doc.setCreatedAt(LocalDateTime.now());
        
        // Simple text extraction for .txt, .md, .json, .csv
        // For PDF/Word we would need libraries like Apache PDFBox or POI, skipping for MVP
        String content = "";
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            content = reader.lines().collect(Collectors.joining("\n"));
        }
        
        doc.setContent(content);
        documentMapper.insert(doc);
        return doc;
    }
    
    public List<Document> getDocuments(Long kbId) {
        QueryWrapper<Document> query = new QueryWrapper<>();
        query.eq("kb_id", kbId).orderByDesc("created_at");
        // Exclude content for list view to save bandwidth
        query.select(Document.class, info -> !info.getColumn().equals("content"));
        return documentMapper.selectList(query);
    }

    public void deleteDocument(Long docId) {
        documentMapper.deleteById(docId);
    }
    
    public String getKnowledgeContext(Long kbId) {
        QueryWrapper<Document> query = new QueryWrapper<>();
        query.eq("kb_id", kbId);
        List<Document> docs = documentMapper.selectList(query);
        
        StringBuilder context = new StringBuilder();
        for (Document doc : docs) {
            context.append("--- Document: ").append(doc.getFilename()).append(" ---\n");
            context.append(doc.getContent()).append("\n\n");
        }
        return context.toString();
    }
}
