package com.promptgenie.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.promptgenie.entity.Prompt;
import com.promptgenie.entity.Tag;
import com.promptgenie.mapper.PromptMapper;
import com.promptgenie.mapper.TagMapper;
import com.promptgenie.service.PromptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PromptServiceImpl extends ServiceImpl<PromptMapper, Prompt> implements PromptService {

    @Autowired
    private TagMapper tagMapper;

    @Override
    @Transactional
    public Prompt createPrompt(Prompt prompt) {
        if (prompt.getCreatedAt() == null) {
            prompt.setCreatedAt(LocalDateTime.now());
        }
        prompt.setUpdatedAt(LocalDateTime.now());
        
        save(prompt);
        
        if (prompt.getTags() != null) {
            for (Tag tag : prompt.getTags()) {
                tag.setPromptId(prompt.getId());
                tagMapper.insert(tag);
            }
        }
        
        return prompt;
    }

    @Override
    public List<Prompt> getAll(Long userId) {
        List<Prompt> prompts = baseMapper.selectPromptsByUser(userId);
        loadTagsForPrompts(prompts);
        return prompts;
    }

    @Override
    public Prompt getById(Long id) {
        Prompt prompt = baseMapper.selectById(id);
        if (prompt != null) {
            QueryWrapper<Tag> query = new QueryWrapper<>();
            query.eq("prompt_id", id);
            prompt.setTags(tagMapper.selectList(query));
        }
        return prompt;
    }

    @Override
    @Transactional
    public Prompt updatePrompt(Prompt prompt) {
        prompt.setUpdatedAt(LocalDateTime.now());
        updateById(prompt);
        
        // Update tags: delete all and re-insert
        QueryWrapper<Tag> query = new QueryWrapper<>();
        query.eq("prompt_id", prompt.getId());
        tagMapper.delete(query);
        
        if (prompt.getTags() != null) {
            for (Tag tag : prompt.getTags()) {
                tag.setPromptId(prompt.getId());
                tagMapper.insert(tag);
            }
        }
        
        return getById(prompt.getId());
    }

    @Override
    public List<Prompt> getByWorkspaceId(Long workspaceId) {
        List<Prompt> prompts = baseMapper.selectByWorkspaceId(workspaceId);
        loadTagsForPrompts(prompts);
        return prompts;
    }

    @Override
    @Transactional
    public void movePromptToWorkspace(Long promptId, Long targetWorkspaceId) {
        Prompt prompt = getById(promptId);
        if (prompt == null) {
            throw new RuntimeException("Prompt not found");
        }
        prompt.setWorkspaceId(targetWorkspaceId);
        updateById(prompt);
    }

    @Override
    @Transactional
    public Prompt forkPrompt(Long promptId, Long userId, Long targetWorkspaceId) {
        Prompt original = getById(promptId);
        if (original == null) throw new RuntimeException("Prompt not found");
        
        // Only public prompts or own prompts can be forked (or shared within workspace)
        if (!original.getIsPublic() && !original.getUserId().equals(userId)) {
             // TODO: Check workspace access if it's a team prompt
            throw new RuntimeException("Permission denied");
        }
        
        Prompt copy = new Prompt();
        copy.setUserId(userId);
        copy.setWorkspaceId(targetWorkspaceId); // Can be null for personal
        copy.setTitle(original.getTitle() + " (Forked)");
        copy.setContent(original.getContent());
        copy.setVariables(original.getVariables());
        copy.setIsPublic(false);
        copy.setLikesCount(0);
        copy.setUsageCount(0);
        copy.setCreatedAt(LocalDateTime.now());
        copy.setUpdatedAt(LocalDateTime.now());
        
        save(copy);
        
        // Copy Tags
        if (original.getTags() != null) {
            for (Tag tag : original.getTags()) {
                Tag newTag = new Tag();
                newTag.setPromptId(copy.getId());
                newTag.setName(tag.getName());
                newTag.setColor(tag.getColor());
                tagMapper.insert(newTag);
            }
        }
        
        return copy;
    }

    private void loadTagsForPrompts(List<Prompt> prompts) {
        if (prompts != null && !prompts.isEmpty()) {
            for (Prompt p : prompts) {
                QueryWrapper<Tag> query = new QueryWrapper<>();
                query.eq("prompt_id", p.getId());
                p.setTags(tagMapper.selectList(query));
            }
        }
    }
}
