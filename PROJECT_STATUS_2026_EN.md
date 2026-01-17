# Prompt Genie - Project Status & Roadmap
*Date: 2026-01-17*

## 1. Current Features Overview (Implemented Features)

In this development iteration, we focused on enhancing Prompt Genie's multi-modal capabilities and the interactive experience of the Playground.

### A. Multi-Modal Generation Support
We have successfully integrated the full suite of large model capabilities from Alibaba Cloud Bailian (DashScope):

*   **Text-to-Text**
    *   **Models**: Supports Qwen-Turbo, Qwen-Plus, Qwen-Max.
    *   **Implementation**: Based on DashScope SDK.
*   **Text-to-Image**
    *   **Models**: Supports Wanx-V1 (Tongyi Wanxiang).
    *   **Implementation**: Based on DashScope SDK (`ImageSynthesis`).
    *   **Display**: Renders generated images directly in the Playground.
*   **Text-to-Video**
    *   **Models**: Supports **Wanx 2.1 Turbo**, **Wanx 2.1 Plus**, **Wan 2.6**.
    *   **Implementation**: 
        *   Uses native HTTP interface calls (`/api/v1/services/aigc/video-generation/video-synthesis`), bypassing SDK version limitations.
        *   Implemented **Async Polling Mechanism**: Checks task status every 15 seconds, with a maximum timeout of 15 minutes, ensuring long-running video tasks can complete successfully.
    *   **Parameter Optimization**: Configured smart default parameters for different models (e.g., resolution 1280*720, duration 5s, enable Prompt extension).

### B. Playground Upgrades
*   **Model Comparison**: 
    *   Supports selecting multiple models simultaneously (e.g., running Qwen-Max and Qwen-Turbo at the same time, or generating two videos simultaneously).
    *   Results area automatically splits into columns for intuitive comparison.
*   **Mode Switching**: Added Text / Image / Video mode switcher at the top.
*   **Result Display Optimization**:
    *   Video generation results provide **embedded player** and **open in new tab** links to resolve browser compatibility issues.
    *   Added loading states and error messages.

### C. Experience & Engineering Optimization
*   **Unified UI**: 
    *   Fixed inconsistent width issues in pages like `PromptsList` (unified to `max-w-[1600px]`).
    *   Encapsulated and applied the global `BackButton` component.
*   **Backend Stability**:
    *   Fixed compilation errors in SDK calls.
    *   Added detailed logging to facilitate troubleshooting of API calls.

---

## 2. Future Roadmap

To build Prompt Genie into a more professional AIGC prompt engineering platform, we suggest proceeding with the following phases:

### Phase 1: Fine-grained Parameter Control
Currently, video generation uses "smart defaults" which users cannot customize.
*   **Feature**: Add a parameter configuration panel in the Playground sidebar.
*   **Content**:
    *   **Video**: Resolution (720P/1080P/480P), Duration (5s/10s), Seed, Watermark toggle.
    *   **Image**: Resolution, Number of generations (n), Style selection.
    *   **Text**: Temperature, Top_P, Max Tokens.

### Phase 2: Multi-Modal Workflow (Multi-Modal Chains)
The current Prompt Chain mainly targets text.
*   **Goal**: Implement an automated workflow of "Text -> Image -> Video".
*   **Scenario**: **AI Storybook/Short Film Generation**.
    *   Step 1 (Text): Input story outline, LLM generates storyboard scripts (Prompts).
    *   Step 2 (Image): Automatically pass storyboard Prompts to Wanx to generate keyframes.
    *   Step 3 (Video): (Optional) Convert keyframes to video (Image-to-Video).

### Phase 3: History & Persistence
*   **Current Status**: Results are lost after refreshing the Playground.
*   **Improvement**:
    *   Add `PlaygroundHistory` table to record Prompt, parameters, model, and results (text/S3 link) for each run.
    *   Support "one-click reuse" of parameters from history.

### Phase 4: Cost Management
Video and image generation costs are relatively high.
*   **Feature**: 
    *   Estimate Token/credit consumption for the current call based on selected model and parameters before clicking "Run".
    *   Add usage statistics Dashboard in the backend.

### Phase 5: Knowledge Base & RAG
*   **Feature**: Allow users to upload private documents and reference knowledge base content when generating Prompts to improve generation quality in professional domains.
