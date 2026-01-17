package com.promptgenie.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.promptgenie.entity.Prompt;
import com.promptgenie.entity.Tag;
import com.promptgenie.entity.PromptVersion;
import com.promptgenie.entity.PromptLike;
import com.promptgenie.mapper.PromptMapper;
import com.promptgenie.mapper.TagMapper;
import com.promptgenie.mapper.PromptVersionMapper;
import com.promptgenie.mapper.PromptLikeMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PromptService extends ServiceImpl<PromptMapper, Prompt> {

    @Autowired
    private TagMapper tagMapper;

    @Autowired
    private PromptVersionMapper versionMapper;

    @Autowired
    private PromptLikeMapper likeMapper;
    
    public List<Prompt> getPromptsByUser(Long userId) {
        List<Prompt> prompts = baseMapper.selectByUserIdOrderByCreatedAtDesc(userId);
        prompts.forEach(this::loadTags);
        return prompts;
    }

    public List<Prompt> searchPrompts(Long userId, String search, String tag) {
        List<Prompt> prompts = baseMapper.selectByUserIdAndFilters(userId, search, tag);
        prompts.forEach(this::loadTags);
        return prompts;
    }

    @Override
    public Prompt getById(java.io.Serializable id) {
        Prompt prompt = super.getById(id);
        if (prompt != null) {
            loadTags(prompt);
        }
        return prompt;
    }

    @Transactional
    public boolean createPrompt(Prompt prompt) {
        boolean result = save(prompt);
        if (result && prompt.getTags() != null) {
            saveTags(prompt);
        }
        return result;
    }

    @Transactional
    public boolean updatePrompt(Prompt prompt) {
        boolean result = updateById(prompt);
        if (result && prompt.getTags() != null) {
            tagMapper.deleteByPromptId(prompt.getId());
            saveTags(prompt);
        }
        return result;
    }
    
    private void loadTags(Prompt prompt) {
        prompt.setTags(tagMapper.selectByPromptId(prompt.getId()));
    }

    private void saveTags(Prompt prompt) {
        for (Tag tag : prompt.getTags()) {
            tag.setPromptId(prompt.getId());
            tag.setId(null); // Ensure new ID is generated
            tagMapper.insert(tag);
        }
    }

    public List<String> getAllTags(Long userId) {
        return tagMapper.selectDistinctTagsByUserId(userId);
    }

    public List<Prompt> getPublicPrompts(String search, Long currentUserId) {
        List<Prompt> prompts = baseMapper.selectPublicPrompts(search);
        prompts.forEach(p -> {
            loadTags(p);
            if (currentUserId != null) {
                p.setIsLiked(likeMapper.existsByPromptIdAndUserId(p.getId(), currentUserId));
            }
        });
        return prompts;
    }

    @Transactional
    public boolean toggleLike(Long promptId, Long userId) {
        Prompt prompt = getById(promptId);
        if (prompt == null) throw new RuntimeException("Prompt not found");

        QueryWrapper<PromptLike> query = new QueryWrapper<>();
        query.eq("prompt_id", promptId).eq("user_id", userId);
        PromptLike existing = likeMapper.selectOne(query);

        boolean isLiked;
        if (existing != null) {
            // Unlike
            likeMapper.deleteById(existing.getId());
            prompt.setLikesCount(Math.max(0, prompt.getLikesCount() - 1));
            isLiked = false;
        } else {
            // Like
            PromptLike like = new PromptLike();
            like.setPromptId(promptId);
            like.setUserId(userId);
            likeMapper.insert(like);
            prompt.setLikesCount(prompt.getLikesCount() + 1);
            isLiked = true;
        }
        updateById(prompt);
        return isLiked;
    }

    @Transactional
    public void incrementUsage(Long promptId) {
        Prompt prompt = getById(promptId);
        if (prompt != null) {
            prompt.setUsageCount(prompt.getUsageCount() + 1);
            updateById(prompt);
        }
    }

    @Transactional
    public Prompt forkPrompt(Long promptId, Long userId) {
        incrementUsage(promptId); // Fork counts as usage
        
        Prompt original = getById(promptId);
        if (original == null) {
            throw new RuntimeException("Prompt not found");
        }
        
        Prompt copy = new Prompt();
        copy.setUserId(userId);
        copy.setTitle(original.getTitle() + " (Copy)");
        copy.setContent(original.getContent());
        copy.setVariables(original.getVariables());
        copy.setIsPublic(false); // Forked prompts are private by default
        
        createPrompt(copy);
        
        // Copy tags too
        if (original.getTags() != null) {
            List<Tag> newTags = original.getTags().stream().map(t -> {
                Tag newTag = new Tag();
                newTag.setName(t.getName());
                newTag.setColor(t.getColor());
                return newTag;
            }).collect(Collectors.toList());
            copy.setTags(newTags);
            saveTags(copy);
        }
        
        return copy;
    }

    public List<PromptVersion> getVersions(Long promptId) {
        return versionMapper.selectByPromptId(promptId);
    }

    @Transactional
    public PromptVersion createVersion(Long promptId, String note) {
        Prompt prompt = getById(promptId);
        if (prompt == null) {
            throw new RuntimeException("Prompt not found");
        }

        Integer maxVersion = versionMapper.getMaxVersionNumber(promptId);
        
        PromptVersion version = new PromptVersion();
        version.setPromptId(promptId);
        version.setVersionNumber(maxVersion + 1);
        version.setTitle(prompt.getTitle());
        version.setContent(prompt.getContent());
        version.setChangeNote(note);
        
        versionMapper.insert(version);
        return version;
    }

    @Transactional
    public Prompt restoreVersion(Long promptId, Long versionId) {
        Prompt prompt = getById(promptId);
        if (prompt == null) throw new RuntimeException("Prompt not found");

        PromptVersion version = versionMapper.selectById(versionId);
        if (version == null) throw new RuntimeException("Version not found");
        
        if (!version.getPromptId().equals(promptId)) {
            throw new RuntimeException("Version mismatch");
        }

        // Create a backup of current state before restoring? 
        // Optional, but good practice. For now, let's just restore.
        // Or better: save current as "Auto-save before restore"
        createVersion(promptId, "Auto-save before restoring v" + version.getVersionNumber());

        prompt.setTitle(version.getTitle());
        prompt.setContent(version.getContent());
        updatePrompt(prompt);
        
        return prompt;
    }
}
