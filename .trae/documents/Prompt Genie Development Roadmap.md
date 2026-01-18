# Prompt Genie Phase 3 & 4 Development Plan

Following the successful implementation of the Multi-modal Workflow and Test Coverage, we are ready to move towards Community features and Production readiness.

## Phase 3: Community & Social Features (Enhancing User Engagement)
Current implementation has `Templates.tsx` for public feed, but lacks interaction depth.
1.  **Comment System**:
    *   **Backend**: Create `Comment` entity and `CommentController`. API: `POST /api/prompts/{id}/comments`, `GET /api/prompts/{id}/comments`.
    *   **Frontend**: Add "Comments" section in `PromptsList` or a dedicated `PromptDetail` page.
2.  **User Profiles**:
    *   **Frontend**: Create a public profile page `/u/{username}` showing their public prompts and stats (likes received, forks).
    *   **Backend**: Endpoint `GET /api/users/{username}/profile`.

## Phase 4: DevOps & Infrastructure (Production Readiness)
1.  **Containerization**:
    *   Create `Dockerfile` for Backend (Java 17) and Frontend (Nginx/Node).
    *   Create `docker-compose.yml` to orchestrate App, MySQL, and Redis.
2.  **CI/CD Pipeline**:
    *   Set up GitHub Actions workflow for automated testing (`mvn test`, `vitest`) and building images.

## Phase 5: Advanced Engineering & Optimization
1.  **Redis Caching**:
    *   Implement `@Cacheable` for `getPublicPrompts` to reduce DB load on the feed.
    *   Cache invalidation on new prompt creation.
2.  **Rate Limiting**:
    *   Protect API endpoints (especially Generation/LLM calls) using Bucket4j or Redis-based limiter to control costs.

## Immediate Recommendation
I recommend starting with **Phase 4 (Dockerization)** to ensure the app can be easily deployed and shared, followed by **Phase 3 (Comments)** to boost community interaction.
