package com.promptgenie.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.promptgenie.entity.EvaluationJob;
import com.promptgenie.entity.EvaluationResult;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

public interface EvaluationService extends IService<EvaluationJob> {
    EvaluationJob createEvaluationJob(Long userId, String name, Long promptId, MultipartFile datasetFile, List<Map<String, Object>> modelConfigs, List<String> evaluationDimensions);
    
    List<EvaluationJob> getUserJobs(Long userId);
    
    EvaluationJob getJobDetails(Long jobId);
    
    void runEvaluation(Long jobId);
    
    List<EvaluationResult> getJobResults(Long jobId);
}
