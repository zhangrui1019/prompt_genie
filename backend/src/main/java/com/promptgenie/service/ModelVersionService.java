package com.promptgenie.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.promptgenie.entity.Model;
import com.promptgenie.entity.ModelVersion;
import com.promptgenie.mapper.ModelMapper;
import com.promptgenie.mapper.ModelVersionMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ModelVersionService extends ServiceImpl<ModelVersionMapper, ModelVersion> {
    
    @Autowired
    private ModelVersionMapper modelVersionMapper;
    
    @Autowired
    private ModelMapper modelMapper;
    
    public List<ModelVersion> getModelVersions(Long modelId) {
        return modelVersionMapper.selectByModelId(modelId);
    }
    
    public ModelVersion createModelVersion(Long modelId, String versionName, String description, String modelPath, String modelConfig) {
        // 创建版本
        ModelVersion modelVersion = new ModelVersion();
        modelVersion.setModelId(modelId);
        modelVersion.setVersionName(versionName);
        modelVersion.setDescription(description);
        modelVersion.setModelPath(modelPath);
        modelVersion.setModelConfig(modelConfig);
        modelVersion.setStatus("active");
        save(modelVersion);
        
        // 更新模型的当前版本
        Model model = modelMapper.selectById(modelId);
        if (model != null) {
            // 这里假设Model类有currentVersionId字段
            model.setCurrentVersionId(modelVersion.getId());
            modelMapper.updateById(model);
        }
        
        return modelVersion;
    }
    
    public void activateVersion(Long versionId) {
        // 激活指定版本
        ModelVersion version = getById(versionId);
        if (version != null) {
            // 先将同一模型的所有版本设为非活跃
            List<ModelVersion> versions = modelVersionMapper.selectByModelId(version.getModelId());
            for (ModelVersion v : versions) {
                v.setStatus("inactive");
                updateById(v);
            }
            
            // 激活指定版本
            version.setStatus("active");
            updateById(version);
            
            // 更新模型的当前版本
            Model model = modelMapper.selectById(version.getModelId());
            if (model != null) {
                model.setCurrentVersionId(versionId);
                modelMapper.updateById(model);
            }
        }
    }
    
    public void deactivateVersion(Long versionId) {
        ModelVersion version = getById(versionId);
        if (version != null) {
            version.setStatus("inactive");
            updateById(version);
            
            // 如果是当前版本，将当前版本设为null
            Model model = modelMapper.selectById(version.getModelId());
            if (model != null && model.getCurrentVersionId() != null && model.getCurrentVersionId().equals(versionId)) {
                model.setCurrentVersionId(null);
                modelMapper.updateById(model);
            }
        }
    }
    
    public ModelVersion getCurrentVersion(Long modelId) {
        Model model = modelMapper.selectById(modelId);
        if (model != null && model.getCurrentVersionId() != null) {
            return getById(model.getCurrentVersionId());
        }
        return null;
    }
    
    public List<ModelVersion> getActiveVersions() {
        // 这里应该实现获取所有活跃版本的逻辑
        // 暂时返回空列表
        return List.of();
    }
}
