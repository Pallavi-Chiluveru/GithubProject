# Sequence Diagrams & Execution Flow ⏱️

This document details the step-by-step execution flows of the most critical complex operations within the application.

## 1. Repository Creation Flow

This sequence demonstrates the hybrid architecture approach, synchronizing state between MongoDB (Metadata) and Gitea (Git Engine).

```mermaid
sequenceDiagram
    autonumber
    
    %% Actors and Participants
    actor User as Developer
    participant UI as Frontend Form
    participant Backend as Express Route (repoAPI)
    participant RepoSvc as Repository Service
    participant Gitea as Gitea API (Docker)
    participant Mongo as MongoDB (Metadata)
    
    User->>UI: Fills repo details & clicks 'Create'
    UI->>Backend: POST /repo-api/create
    Backend->>Backend: Middleware verifies JWT Auth
    Backend->>RepoSvc: initiateCreateRepo()
    
    %% Sync Process
    rect rgb(236, 253, 245)
    Note over RepoSvc, Gitea: Phase 1: Engine Initialization
    RepoSvc->>Gitea: POST /api/v1/user/repos
    Gitea-->>RepoSvc: 201 Created (clone URLs, repo ID)
    end
    
    rect rgb(254, 243, 199)
    Note over RepoSvc, Mongo: Phase 2: Metadata Storage
    RepoSvc->>Mongo: Create Repository Document
    Mongo-->>RepoSvc: Saved successfully
    end
    
    RepoSvc-->>Backend: Repo Data Formatted
    Backend-->>UI: 201 Created Response
    UI-->>User: Redirects to Repository Dashboard
```

## 2. AI Agent Architecture Flow

This sequence traces the lifecycle of a Groq AI LLM call, from the user's prompt to the formatted response.

```mermaid
sequenceDiagram
    autonumber
    
    %% Actors and Participants
    actor User as Developer
    participant UI as GitHub Companion (React)
    participant Backend as Express Route (chatAPI)
    participant Builder as Prompt Builder
    participant Groq as Groq API
    participant Formatter as Response Formatter
    
    User->>UI: Types prompt & highlights code
    UI->>Backend: POST /chat-api/review {prompt, codeContext}
    Backend->>Backend: Middleware verifies JWT Auth
    Backend->>Builder: constructSystemPrompt()
    
    %% AI Processing
    rect rgb(243, 232, 255)
    Note over Builder, Groq: AI Inference Phase
    Builder->>Groq: SDK Call (llama3 model)
    Groq-->>Builder: Stream/JSON Response (Markdown)
    end
    
    Builder->>Formatter: cleanMarkdown()
    Formatter-->>Backend: Formatted Insights
    Backend-->>UI: 200 OK (AI Response)
    UI-->>User: Renders Markdown UI
```
