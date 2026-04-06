package com.promptgenie.core.config;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Configuration
public class VectorStoreConfig {

    @Bean
    public VectorStore vectorStore() {
        return new VectorStore() {
            @Override
            public void add(List<Document> documents) {
                // Do nothing
                System.out.println("Dummy VectorStore: Added " + documents.size() + " documents (no-op)");
            }

            @Override
            public Optional<Boolean> delete(List<String> idList) {
                return Optional.of(true);
            }

            @Override
            public List<Document> similaritySearch(SearchRequest request) {
                System.out.println("Dummy VectorStore: Search query '" + request.getQuery() + "'");
                return Collections.emptyList();
            }
        };
    }
}