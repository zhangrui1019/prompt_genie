package com.promptgenie.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.promptgenie.entity.Model;
import com.promptgenie.mapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ModelService extends ServiceImpl<ModelMapper, Model> {
    
    @Autowired
    private ModelMapper modelMapper;
    
    public List<Model> getAvailableModels() {
        return modelMapper.selectByStatus("active");
    }
    
    public Model getModelByName(String name) {
        return modelMapper.selectByName(name);
    }
    
    public Model getModelByProvider(String provider) {
        List<Model> models = modelMapper.selectByProvider(provider);
        return models.isEmpty() ? null : models.get(0);
    }
    
    public List<Model> getModelsByType(String modelType) {
        return modelMapper.selectList(null);
    }
    
    public Model createModel(String name, String provider, String modelType, String apiKey, String baseUrl, String description) {
        Model model = new Model();
        model.setName(name);
        model.setProvider(provider);
        model.setModelType(modelType);
        model.setApiKey(apiKey);
        model.setBaseUrl(baseUrl);
        model.setDescription(description);
        model.setStatus("active");
        save(model);
        return model;
    }
    
    public void updateModel(Long id, String name, String description, String status) {
        Model model = getById(id);
        if (model != null) {
            model.setName(name);
            model.setDescription(description);
            model.setStatus(status);
            updateById(model);
        }
    }
    
    public void updateApiKey(Long id, String apiKey) {
        Model model = getById(id);
        if (model != null) {
            model.setApiKey(apiKey);
            updateById(model);
        }
    }
    
    public void deactivateModel(Long id) {
        Model model = getById(id);
        if (model != null) {
            model.setStatus("inactive");
            updateById(model);
        }
    }
    
    public List<Model> getAllModels() {
        return modelMapper.selectList(null);
    }
    
    public Model getFastestModel() {
        // 这里应该实现获取响应速度最快的模型的逻辑
        // 暂时返回第一个模型
        List<Model> models = modelMapper.selectByStatus("active");
        return models.isEmpty() ? null : models.get(0);
    }
    
    public Model getMostReliableModel() {
        // 这里应该实现获取最可靠的模型的逻辑
        // 暂时返回第一个模型
        List<Model> models = modelMapper.selectByStatus("active");
        return models.isEmpty() ? null : models.get(0);
    }
}
