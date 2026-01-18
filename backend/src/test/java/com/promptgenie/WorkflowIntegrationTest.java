package com.promptgenie;

import com.promptgenie.entity.ChainStep;
import com.promptgenie.entity.Prompt;
import com.promptgenie.entity.PromptChain;
import com.promptgenie.entity.User;
import com.promptgenie.service.ChainService;
import com.promptgenie.service.PromptService;
import com.promptgenie.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@Transactional
public class WorkflowIntegrationTest {

    @Autowired
    private PromptService promptService;

    @Autowired
    private ChainService chainService;

    @Autowired
    private UserService userService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    public void setupSchema() {
        try {
            jdbcTemplate.execute("ALTER TABLE chain_steps ADD COLUMN model_type VARCHAR(20) DEFAULT 'text'");
        } catch (Exception e) { /* Ignore if exists */ }
        
        try {
            jdbcTemplate.execute("ALTER TABLE chain_steps ADD COLUMN model_name VARCHAR(50)");
        } catch (Exception e) { /* Ignore if exists */ }
        
        try {
            jdbcTemplate.execute("ALTER TABLE chain_steps ADD COLUMN parameters JSON");
        } catch (Exception e) { /* Ignore if exists */ }
    }

    @Test
    public void testTextToImageToVideoWorkflow() {
        System.out.println("Starting Integration Test: Text -> Image -> Video Workflow");

        // 1. Setup Data
        User user = new User();
        user.setEmail("integration_test_" + System.currentTimeMillis() + "@example.com");
        user.setName("Integration Test User");
        user.setPasswordHash("dummy_hash");
        userService.save(user);
        
        Long userId = user.getId();
        System.out.println("Created Test User: " + userId);

        // Step 1: Text Generation (Generate a description)
        Prompt textPrompt = new Prompt();
        textPrompt.setUserId(userId);
        textPrompt.setTitle("Step 1: Description Generator");
        textPrompt.setContent("Write a very short, one-sentence description of a cyberpunk street food vendor.");
        promptService.createPrompt(textPrompt);
        System.out.println("Created Text Prompt: " + textPrompt.getId());

        // Step 2: Image Generation (Visualize the description)
        Prompt imagePrompt = new Prompt();
        imagePrompt.setUserId(userId);
        imagePrompt.setTitle("Step 2: Visualizer");
        imagePrompt.setContent("A cinematic shot of {{description}}, neon lights, rain, high detail.");
        promptService.createPrompt(imagePrompt);
        System.out.println("Created Image Prompt: " + imagePrompt.getId());

        // Step 3: Video Generation (Animate the description)
        // Note: Currently supporting T2V (Text-to-Video)
        Prompt videoPrompt = new Prompt();
        videoPrompt.setUserId(userId);
        videoPrompt.setTitle("Step 3: Animator");
        videoPrompt.setContent("Cinematic camera movement showing {{description}}, neon lights, 4k.");
        promptService.createPrompt(videoPrompt);
        System.out.println("Created Video Prompt: " + videoPrompt.getId());

        // 2. Create Chain
        PromptChain chain = new PromptChain();
        chain.setUserId(userId);
        chain.setTitle("Integration Test Chain");
        
        List<ChainStep> steps = new ArrayList<>();
        
        // Step 1 Config
        ChainStep step1 = new ChainStep();
        step1.setPromptId(textPrompt.getId());
        step1.setStepOrder(0);
        step1.setModelType("text");
        step1.setModelName("qwen-turbo");
        step1.setTargetVariable("description");
        // Parameters for text
        step1.setParameters("{\"temperature\": 0.8}");
        steps.add(step1);

        // Step 2 Config
        ChainStep step2 = new ChainStep();
        step2.setPromptId(imagePrompt.getId());
        step2.setStepOrder(1);
        step2.setModelType("image");
        step2.setModelName("wanx-v1");
        step2.setTargetVariable("image_url");
        // Parameters for image
        step2.setParameters("{\"size\": \"1024*1024\"}");
        steps.add(step2);

        // Step 3 Config
        ChainStep step3 = new ChainStep();
        step3.setPromptId(videoPrompt.getId());
        step3.setStepOrder(2);
        step3.setModelType("video");
        step3.setModelName("wanx2.1-t2v-turbo"); // Use turbo for speed
        step3.setTargetVariable("video_url");
        // Parameters for video
        step3.setParameters("{\"size\": \"1280*720\", \"duration\": 5}");
        steps.add(step3);

        chain.setSteps(steps);
        chainService.createChain(chain);
        System.out.println("Created Chain: " + chain.getId());

        // 3. Execute Chain
        System.out.println("Executing Chain... (This may take some time)");
        long startTime = System.currentTimeMillis();
        
        List<Map<String, Object>> results = chainService.executeChain(chain.getId(), new HashMap<>());
        
        long duration = System.currentTimeMillis() - startTime;
        System.out.println("Chain Execution Completed in " + duration + "ms");

        // 4. Verify Results
        assertNotNull(results);
        assertTrue(results.size() >= 3);

        // Check Step 1 (Text)
        Map<String, Object> res1 = results.stream().filter(r -> (int)r.get("step") == 0).findFirst().orElse(null);
        assertNotNull(res1);
        String description = (String) res1.get("output");
        System.out.println("Step 1 Output (Text): " + description);
        assertNotNull(description);
        assertTrue(description.length() > 5);

        // Check Step 2 (Image)
        Map<String, Object> res2 = results.stream().filter(r -> (int)r.get("step") == 1).findFirst().orElse(null);
        assertNotNull(res2);
        String imageUrl = (String) res2.get("output");
        System.out.println("Step 2 Output (Image): " + imageUrl);
        assertNotNull(imageUrl);
        assertTrue(imageUrl.startsWith("http"));

        // Check Step 3 (Video)
        Map<String, Object> res3 = results.stream().filter(r -> (int)r.get("step") == 2).findFirst().orElse(null);
        assertNotNull(res3);
        String videoUrl = (String) res3.get("output");
        System.out.println("Step 3 Output (Video): " + videoUrl);
        assertNotNull(videoUrl);
        assertTrue(videoUrl.startsWith("http") || videoUrl.contains("Mock"));
        
        System.out.println("Integration Test PASSED!");
    }
}
