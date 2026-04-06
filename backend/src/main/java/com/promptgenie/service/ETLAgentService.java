package com.promptgenie.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class ETLAgentService {
    
    private final Map<String, ETLJob> etlJobs = new ConcurrentHashMap<>();
    private final Map<String, DataSource> dataSources = new ConcurrentHashMap<>();
    private final Map<String, ExtractionRule> extractionRules = new ConcurrentHashMap<>();
    private final Map<String, DataSchema> dataSchemas = new ConcurrentHashMap<>();
    private final Map<String, ExtractedData> extractedData = new ConcurrentHashMap<>();
    
    // 初始化ETL服务
    public void init() {
        // 初始化默认数据源
        initDefaultDataSources();
        
        // 初始化默认提取规则
        initDefaultExtractionRules();
    }
    
    // 初始化默认数据源
    private void initDefaultDataSources() {
        // PDF文档数据源
        createDataSource(
            "pdf_source",
            "PDF文档",
            "PDF",
            Map.of(
                "file_pattern", "*.pdf",
                "max_file_size", 10485760 // 10MB
            ),
            System.currentTimeMillis()
        );
        
        // CSV文件数据源
        createDataSource(
            "csv_source",
            "CSV文件",
            "CSV",
            Map.of(
                "file_pattern", "*.csv",
                "delimiter", ","
            ),
            System.currentTimeMillis()
        );
        
        // 网页数据源
        createDataSource(
            "web_source",
            "网页",
            "WEB",
            Map.of(
                "url_pattern", "https://*"
            ),
            System.currentTimeMillis()
        );
    }
    
    // 初始化默认提取规则
    private void initDefaultExtractionRules() {
        // 联系人信息提取规则
        createExtractionRule(
            "contact_rule",
            "联系人信息提取",
            "CONTACT",
            Map.of(
                "fields", Arrays.asList("name", "email", "phone", "address"),
                "patterns", Map.of(
                    "email", "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
                    "phone", "(\\+\\d{1,3})?[\\s-]?(\\d{3,4})[\\s-]?(\\d{4,5})"
                )
            ),
            System.currentTimeMillis()
        );
        
        // 产品信息提取规则
        createExtractionRule(
            "product_rule",
            "产品信息提取",
            "PRODUCT",
            Map.of(
                "fields", Arrays.asList("name", "price", "description", "category"),
                "patterns", Map.of(
                    "price", "\\$\\s*\\d+(\\.\\d{2})?"
                )
            ),
            System.currentTimeMillis()
        );
    }
    
    // 创建数据源
    public DataSource createDataSource(String sourceId, String name, String type, Map<String, Object> config, long createdAt) {
        DataSource dataSource = new DataSource(
            sourceId,
            name,
            type,
            config,
            createdAt
        );
        dataSources.put(sourceId, dataSource);
        return dataSource;
    }
    
    // 创建提取规则
    public ExtractionRule createExtractionRule(String ruleId, String name, String type, Map<String, Object> config, long createdAt) {
        ExtractionRule rule = new ExtractionRule(
            ruleId,
            name,
            type,
            config,
            createdAt
        );
        extractionRules.put(ruleId, rule);
        return rule;
    }
    
    // 创建数据 schema
    public DataSchema createDataSchema(String schemaId, String name, List<SchemaField> fields, long createdAt) {
        DataSchema schema = new DataSchema(
            schemaId,
            name,
            fields,
            createdAt
        );
        dataSchemas.put(schemaId, schema);
        return schema;
    }
    
    // 创建并执行ETL任务
    public ETLJob createETLJob(String jobId, String name, String sourceId, String ruleId, String schemaId, Map<String, Object> config, long createdAt) {
        ETLJob job = new ETLJob(
            jobId,
            name,
            sourceId,
            ruleId,
            schemaId,
            config,
            "PENDING",
            createdAt,
            null
        );
        etlJobs.put(jobId, job);
        
        // 执行ETL任务
        executeETLJob(job);
        
        return job;
    }
    
    // 执行ETL任务
    private void executeETLJob(ETLJob job) {
        try {
            job.setStatus("RUNNING");
            
            // 1. 数据提取
            List<Map<String, Object>> extractedRecords = extractData(job.getSourceId(), job.getRuleId());
            
            // 2. 数据转换
            List<Map<String, Object>> transformedRecords = transformData(extractedRecords, job.getSchemaId());
            
            // 3. 数据加载
            loadData(transformedRecords, job.getSchemaId(), job.getJobId());
            
            job.setStatus("COMPLETED");
            job.setCompletedAt(System.currentTimeMillis());
            job.setRecordCount(transformedRecords.size());
            
        } catch (Exception e) {
            job.setStatus("FAILED");
            job.setCompletedAt(System.currentTimeMillis());
            job.setError(e.getMessage());
        }
    }
    
    // 数据提取
    private List<Map<String, Object>> extractData(String sourceId, String ruleId) {
        DataSource source = dataSources.get(sourceId);
        ExtractionRule rule = extractionRules.get(ruleId);
        
        if (source == null || rule == null) {
            return Collections.emptyList();
        }
        
        // 模拟数据提取
        List<Map<String, Object>> records = new ArrayList<>();
        
        // 根据数据源类型提取数据
        switch (source.getType()) {
            case "PDF":
                records = extractFromPDF(source, rule);
                break;
            case "CSV":
                records = extractFromCSV(source, rule);
                break;
            case "WEB":
                records = extractFromWeb(source, rule);
                break;
            default:
                break;
        }
        
        return records;
    }
    
    // 从PDF提取数据
    private List<Map<String, Object>> extractFromPDF(DataSource source, ExtractionRule rule) {
        // 模拟从PDF提取数据
        List<Map<String, Object>> records = new ArrayList<>();
        
        // 生成模拟数据
        for (int i = 1; i <= 5; i++) {
            Map<String, Object> record = new HashMap<>();
            record.put("name", "联系人" + i);
            record.put("email", "contact" + i + "@example.com");
            record.put("phone", "+86 138 0013 800" + i);
            record.put("address", "北京市朝阳区某某路" + i + "号");
            records.add(record);
        }
        
        return records;
    }
    
    // 从CSV提取数据
    private List<Map<String, Object>> extractFromCSV(DataSource source, ExtractionRule rule) {
        // 模拟从CSV提取数据
        List<Map<String, Object>> records = new ArrayList<>();
        
        // 生成模拟数据
        for (int i = 1; i <= 5; i++) {
            Map<String, Object> record = new HashMap<>();
            record.put("name", "产品" + i);
            record.put("price", 100.0 + i * 10);
            record.put("description", "这是产品" + i + "的描述");
            record.put("category", "类别" + (i % 3 + 1));
            records.add(record);
        }
        
        return records;
    }
    
    // 从网页提取数据
    private List<Map<String, Object>> extractFromWeb(DataSource source, ExtractionRule rule) {
        // 模拟从网页提取数据
        List<Map<String, Object>> records = new ArrayList<>();
        
        // 生成模拟数据
        for (int i = 1; i <= 5; i++) {
            Map<String, Object> record = new HashMap<>();
            record.put("name", "网页数据" + i);
            record.put("url", "https://example.com/data" + i);
            record.put("content", "这是网页" + i + "的内容");
            record.put("date", new Date().toString());
            records.add(record);
        }
        
        return records;
    }
    
    // 数据转换
    private List<Map<String, Object>> transformData(List<Map<String, Object>> records, String schemaId) {
        DataSchema schema = dataSchemas.get(schemaId);
        if (schema == null) {
            return records;
        }
        
        List<Map<String, Object>> transformedRecords = new ArrayList<>();
        
        for (Map<String, Object> record : records) {
            Map<String, Object> transformedRecord = new HashMap<>();
            
            // 根据schema转换数据
            for (SchemaField field : schema.getFields()) {
                String fieldName = field.getName();
                String fieldType = field.getType();
                
                if (record.containsKey(fieldName)) {
                    Object value = record.get(fieldName);
                    
                    // 类型转换
                    try {
                        switch (fieldType) {
                            case "string":
                                transformedRecord.put(fieldName, String.valueOf(value));
                                break;
                            case "number":
                                if (value instanceof String) {
                                    transformedRecord.put(fieldName, Double.parseDouble((String) value));
                                } else {
                                    transformedRecord.put(fieldName, value);
                                }
                                break;
                            case "date":
                                if (value instanceof String) {
                                    transformedRecord.put(fieldName, new Date((String) value));
                                } else {
                                    transformedRecord.put(fieldName, value);
                                }
                                break;
                            default:
                                transformedRecord.put(fieldName, value);
                                break;
                        }
                    } catch (Exception e) {
                        // 转换失败，使用默认值
                        transformedRecord.put(fieldName, field.getDefaultValue());
                    }
                } else {
                    // 字段不存在，使用默认值
                    transformedRecord.put(fieldName, field.getDefaultValue());
                }
            }
            
            transformedRecords.add(transformedRecord);
        }
        
        return transformedRecords;
    }
    
    // 数据加载
    private void loadData(List<Map<String, Object>> records, String schemaId, String jobId) {
        // 模拟数据加载
        String dataId = "data_" + jobId;
        ExtractedData data = new ExtractedData(
            dataId,
            schemaId,
            records,
            System.currentTimeMillis()
        );
        extractedData.put(dataId, data);
    }
    
    // 获取ETL任务
    public ETLJob getETLJob(String jobId) {
        return etlJobs.get(jobId);
    }
    
    // 获取数据源
    public DataSource getDataSource(String sourceId) {
        return dataSources.get(sourceId);
    }
    
    // 获取提取规则
    public ExtractionRule getExtractionRule(String ruleId) {
        return extractionRules.get(ruleId);
    }
    
    // 获取数据schema
    public DataSchema getDataSchema(String schemaId) {
        return dataSchemas.get(schemaId);
    }
    
    // 获取提取的数据
    public ExtractedData getExtractedData(String dataId) {
        return extractedData.get(dataId);
    }
    
    // ETL任务类
    public static class ETLJob {
        private String jobId;
        private String name;
        private String sourceId;
        private String ruleId;
        private String schemaId;
        private Map<String, Object> config;
        private String status;
        private long createdAt;
        private Long completedAt;
        private Integer recordCount;
        private String error;
        
        public ETLJob(String jobId, String name, String sourceId, String ruleId, String schemaId, Map<String, Object> config, String status, long createdAt, Long completedAt) {
            this.jobId = jobId;
            this.name = name;
            this.sourceId = sourceId;
            this.ruleId = ruleId;
            this.schemaId = schemaId;
            this.config = config;
            this.status = status;
            this.createdAt = createdAt;
            this.completedAt = completedAt;
        }
        
        // Getters and setters
        public String getJobId() { return jobId; }
        public void setJobId(String jobId) { this.jobId = jobId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getSourceId() { return sourceId; }
        public void setSourceId(String sourceId) { this.sourceId = sourceId; }
        public String getRuleId() { return ruleId; }
        public void setRuleId(String ruleId) { this.ruleId = ruleId; }
        public String getSchemaId() { return schemaId; }
        public void setSchemaId(String schemaId) { this.schemaId = schemaId; }
        public Map<String, Object> getConfig() { return config; }
        public void setConfig(Map<String, Object> config) { this.config = config; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
        public Long getCompletedAt() { return completedAt; }
        public void setCompletedAt(Long completedAt) { this.completedAt = completedAt; }
        public Integer getRecordCount() { return recordCount; }
        public void setRecordCount(Integer recordCount) { this.recordCount = recordCount; }
        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
    }
    
    // 数据源类
    public static class DataSource {
        private String sourceId;
        private String name;
        private String type;
        private Map<String, Object> config;
        private long createdAt;
        
        public DataSource(String sourceId, String name, String type, Map<String, Object> config, long createdAt) {
            this.sourceId = sourceId;
            this.name = name;
            this.type = type;
            this.config = config;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getSourceId() { return sourceId; }
        public void setSourceId(String sourceId) { this.sourceId = sourceId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public Map<String, Object> getConfig() { return config; }
        public void setConfig(Map<String, Object> config) { this.config = config; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 提取规则类
    public static class ExtractionRule {
        private String ruleId;
        private String name;
        private String type;
        private Map<String, Object> config;
        private long createdAt;
        
        public ExtractionRule(String ruleId, String name, String type, Map<String, Object> config, long createdAt) {
            this.ruleId = ruleId;
            this.name = name;
            this.type = type;
            this.config = config;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getRuleId() { return ruleId; }
        public void setRuleId(String ruleId) { this.ruleId = ruleId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public Map<String, Object> getConfig() { return config; }
        public void setConfig(Map<String, Object> config) { this.config = config; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // 数据schema类
    public static class DataSchema {
        private String schemaId;
        private String name;
        private List<SchemaField> fields;
        private long createdAt;
        
        public DataSchema(String schemaId, String name, List<SchemaField> fields, long createdAt) {
            this.schemaId = schemaId;
            this.name = name;
            this.fields = fields;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getSchemaId() { return schemaId; }
        public void setSchemaId(String schemaId) { this.schemaId = schemaId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public List<SchemaField> getFields() { return fields; }
        public void setFields(List<SchemaField> fields) { this.fields = fields; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
    
    // Schema字段类
    public static class SchemaField {
        private String name;
        private String type;
        private Object defaultValue;
        private boolean required;
        
        public SchemaField(String name, String type, Object defaultValue, boolean required) {
            this.name = name;
            this.type = type;
            this.defaultValue = defaultValue;
            this.required = required;
        }
        
        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public Object getDefaultValue() { return defaultValue; }
        public void setDefaultValue(Object defaultValue) { this.defaultValue = defaultValue; }
        public boolean isRequired() { return required; }
        public void setRequired(boolean required) { this.required = required; }
    }
    
    // 提取的数据类
    public static class ExtractedData {
        private String dataId;
        private String schemaId;
        private List<Map<String, Object>> records;
        private long createdAt;
        
        public ExtractedData(String dataId, String schemaId, List<Map<String, Object>> records, long createdAt) {
            this.dataId = dataId;
            this.schemaId = schemaId;
            this.records = records;
            this.createdAt = createdAt;
        }
        
        // Getters and setters
        public String getDataId() { return dataId; }
        public void setDataId(String dataId) { this.dataId = dataId; }
        public String getSchemaId() { return schemaId; }
        public void setSchemaId(String schemaId) { this.schemaId = schemaId; }
        public List<Map<String, Object>> getRecords() { return records; }
        public void setRecords(List<Map<String, Object>> records) { this.records = records; }
        public long getCreatedAt() { return createdAt; }
        public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
    }
}