# Database Design & Architecture 🗄️

This document outlines the comprehensive MongoDB schema design, collections, and relationships that form the backbone of the application's metadata storage.

## 1. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    %% Core Entities
    USER {
        ObjectId _id PK
        String username "Unique"
        String email "Unique"
        String password
        Number giteaUserId
        String giteaToken
    }
    
    REPOSITORY {
        ObjectId _id PK
        String name
        Boolean isPrivate
        ObjectId owner FK
        Number giteaRepoId
        String cloneUrlHttps
    }

    PULL_REQUEST {
        ObjectId _id PK
        String title
        String status
        ObjectId repository FK
        ObjectId author FK
    }

    ISSUE {
        ObjectId _id PK
        String title
        String status
        ObjectId repository FK
        ObjectId author FK
    }

    ORGANIZATION {
        ObjectId _id PK
        String name
        ObjectId owner FK
    }
    
    COMMIT {
        ObjectId _id PK
        String sha "Unique"
        String message
        ObjectId repository FK
        ObjectId author FK
    }
    
    BRANCH {
        ObjectId _id PK
        String name
        ObjectId repository FK
    }

    %% Relationships
    USER ||--o{ REPOSITORY : "owns / creates"
    USER ||--o{ ORGANIZATION : "owns / joins"
    USER ||--o{ PULL_REQUEST : "authors"
    USER ||--o{ ISSUE : "opens"
    USER ||--o{ COMMIT : "authors"
    
    ORGANIZATION ||--o{ REPOSITORY : "owns"

    REPOSITORY ||--o{ PULL_REQUEST : "has"
    REPOSITORY ||--o{ ISSUE : "contains"
    REPOSITORY ||--o{ COMMIT : "tracks"
    REPOSITORY ||--o{ BRANCH : "contains"
```

## 2. Collection Definitions

### `users` Collection (`UserModel.js`)
- **Fields**: `username`, `email`, `password` (hashed), `avatarUrl`, `socialLinks`, `notificationPrefs`, `giteaUserId`, `giteaToken`.
- **References**: `followers` (User), `following` (User).
- **Indexes**: Unique index on `username` and `email`.

### `repositories` Collection (`RepositoryModel.js`)
- **Fields**: `name`, `description`, `language`, `isPrivate`, `visibility`, `defaultBranch`, `giteaRepoId`, `cloneUrlHttps`, `cloneUrlSsh`.
- **References**: `owner` (User), `organization` (Organization), `collaborators` (User), `parentRepoId` (Repository - for forks).
- **Relationships**: Core entity linking Users to Git Operations.

### `pullrequests` Collection (`PullRequestModel.js`)
- **Fields**: `title`, `description`, `status` (OPEN, CLOSED, MERGED), `baseBranch`, `headBranch`.
- **References**: `repository` (Repository), `author` (User), `reviewers` (User).

### `issues` Collection (`IssueModel.js`)
- **Fields**: `title`, `body`, `status` (OPEN, CLOSED), `labels`.
- **References**: `repository` (Repository), `author` (User), `assignees` (User).

### `organizations` Collection (`OrganizationModel.js`)
- **Fields**: `name`, `description`, `avatarUrl`.
- **References**: `owner` (User), `members` (User).

## 3. Data Synchronization Strategy

While MongoDB stores the **metadata** (titles, descriptions, comments, stars, organizations), the actual Git data (blobs, trees, commits, diffs) resides in the **Gitea Container Database**. 

- **Cross-Referencing**: Every MongoDB `Repository` document holds a `giteaRepoId`.
- **Webhooks**: Gitea Webhooks trigger the Express backend (`webhookAPI.js`) to sync status changes (e.g., when a PR is merged via CLI, Gitea notifies Node.js to update the MongoDB `PullRequest` status to `MERGED`).
