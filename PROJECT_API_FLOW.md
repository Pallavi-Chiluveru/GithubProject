# API Dependency & Flow Architecture 🌐

This document maps the complete API call lifecycle from the Frontend React components through to the Backend Services and Databases.

## 1. Complete API Dependency Graph

```mermaid
flowchart TD
    %% Themes and Colors
    classDef frontend fill:#3b82f6,stroke:#1d4ed8,color:#fff,stroke-width:2px;
    classDef service fill:#8b5cf6,stroke:#6d28d9,color:#fff,stroke-width:2px;
    classDef controller fill:#10b981,stroke:#047857,color:#fff,stroke-width:2px;
    classDef model fill:#f59e0b,stroke:#b45309,color:#fff,stroke-width:2px;
    classDef database fill:#0f172a,stroke:#334155,color:#fff,stroke-width:2px;

    subgraph Client Layer [🖥️ React Frontend Layer]
        ReactC[React Components\n(Hooks, Context)]:::frontend
        Redux[State Management\n(Context/Zustand)]:::frontend
        Axios[Axios Instance\n(api.js)]:::frontend
        
        ReactC -->|Dispatches| Redux
        ReactC -->|Calls| Axios
        Redux -->|Calls| Axios
    end

    subgraph API Gateway [🚪 API Gateway / Router]
        Router[Express Router\n(/user-api, /repo-api)]:::controller
        MW[Middleware Chain\n(Auth, Validate)]:::controller
        
        Axios -->|HTTP Request| Router
        Router --> MW
    end

    subgraph Controller Layer [⚙️ Express Controllers]
        UserCtrl[User Controller]:::controller
        RepoCtrl[Repository Controller]:::controller
        AICtrl[AI Chat Controller]:::controller
        
        MW --> UserCtrl
        MW --> RepoCtrl
        MW --> AICtrl
    end

    subgraph Service Layer [🛠️ Business Logic Services]
        GiteaAuthSvc[giteaAuthService]:::service
        GiteaRepoSvc[giteaRepoService]:::service
        GroqAISvc[AI Processing Service]:::service
        
        UserCtrl --> GiteaAuthSvc
        RepoCtrl --> GiteaRepoSvc
        AICtrl --> GroqAISvc
    end

    subgraph Model Layer [📊 Mongoose Models]
        UserModel[UserModel]:::model
        RepoModel[RepositoryModel]:::model
        
        UserCtrl --> UserModel
        RepoCtrl --> RepoModel
    end

    subgraph Data & External Services [🗄️ Infrastructure]
        MongoDB[(MongoDB Atlas)]:::database
        Gitea[(Gitea Engine)]:::database
        GroqAPI((Groq LLM)):::database
        
        UserModel --> MongoDB
        RepoModel --> MongoDB
        GiteaAuthSvc --> Gitea
        GiteaRepoSvc --> Gitea
        GroqAISvc --> GroqAPI
    end
```

## 2. API Tracing: Domain Breakdown

### 2.1 User & Authentication Domain
**Frontend Elements**: `Login.jsx`, `Register.jsx`, `AuthContext.jsx`  
**API Call**: `POST /user-api/login`  
**Controller**: `userAPI.js` -> `loginUser()`  
**Service**: Validation logic, JWT signing  
**Model**: `UserModel.js`  
**Storage**: MongoDB (Stores User Document), Gitea (Syncs user account)

### 2.2 Repository Management Domain
**Frontend Elements**: `CreateRepo.jsx`, `RepoDetails.jsx`, `useRepoHook()`  
**API Call**: `POST /repo-api/create`  
**Controller**: `repoAPI.js` -> `createRepository()`  
**Service**: `giteaRepoService.js` (Creates repo in Gitea)  
**Model**: `RepositoryModel.js`  
**Storage**: MongoDB (Metadata), Gitea API (Git Storage)

### 2.3 Pull Request Domain
**Frontend Elements**: `PullRequests.jsx`, `CreatePR.jsx`  
**API Call**: `POST /pr-api/create`  
**Controller**: `prAPI.js` -> `createPR()`  
**Service**: `giteaPRService.js` (Checks diffs, merges)  
**Model**: `PullRequestModel.js`  
**Storage**: MongoDB (PR Comments, Metadata), Gitea API (Git Diff, Merging)

### 2.4 AI Companion Domain
**Frontend Elements**: `GitHubCompanion.jsx`, `CodeViewer.jsx`  
**API Call**: `POST /chat-api/review`  
**Controller**: `chatAPI.js` -> `analyzeCode()`  
**Service**: Directly calls Groq SDK with system prompts  
**Storage**: Groq LLM  

---

*This document outlines the strict flow of data and dependencies to maintain a clean separation of concerns within the MERN architecture.*
