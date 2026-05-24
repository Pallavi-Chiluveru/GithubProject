import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { 
  Activity,
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowRightLeft,
  ArrowUpRight,
  BarChart3,
  Book, 
  Box, 
  Boxes,
  Brain,
  Bug,
  Calendar,
  CheckCircle,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock,
  Cloud,
  Code, 
  Coffee,
  Copy,
  Cpu, 
  Database,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  FileCode,
  FilePlus,
  FileText,
  Fingerprint,
  Flag,
  Folder,
  FolderOpen,
  GitBranch, 
  GitCommit,
  GitFork,
  GitMerge, 
  GitPullRequest, 
  Globe, 
  Handshake,
  HelpCircle, 
  History,
  Info, 
  Key,
  Layers,
  Layout, 
  ListTodo,
  Lock,
  Menu,
  MessageCircle,
  MessageSquare, 
  Milestone,
  Monitor,
  MoreHorizontal,
  MousePointer2,
  Package,
  Play,
  Plus,
  Quote,
  RefreshCw,
  Rocket, 
  RotateCcw,
  Search, 
  Settings,
  Share2,
  Shield, 
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Smile,
  Split,
  Star, 
  Tag,
  Terminal, 
  ThumbsDown,
  ThumbsUp,
  Trash2,
  TrendingUp,
  Type,
  Unlock,
  User,
  UserCheck,
  UserPlus,
  Users, 
  Video, 
  X,
  Zap, 
  ChevronRight,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTheme } from '../theme/ThemeContext';
import GithubIcon from '../components/GithubIcon';


const SECTION_DATA = [
  {
    id: 'intro',
    title: 'Introduction',
    icon: Info,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    description: 'The industry standard for version control and the world’s largest developer community.',
    content: `` // Handled by IntroductionContent component
  },
  {
    id: 'why',
    title: 'Why RepoSphere?',
    icon: Rocket,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    description: 'From students to startups, GitHub is the essential tool for modern engineering.',
    content: `
# Why Developers Choose GitHub

Modern software development is a team sport. GitHub provides the playground and the rules that make it possible for thousands of strangers to build complex systems together.

### 🏢 Why Companies Use GitHub
*   **Distributed Teams:** Developers in Tokyo and London can work on the same file at the same time.
*   **Safe Deployments:** Code is tested automatically before it ever reaches a user.
*   **Auditing:** Every single line of code is tracked back to who wrote it and why.
*   **Agile Development:** Integrate your project management directly with your source code.

### 🎓 Why Students Should Learn It
*   **Proof of Skill:** Show, don't just tell. A green contribution graph proves you code consistently.
*   **Learn from Pros:** Read the source code of your favorite apps to see how they are structured.
*   **Team Experience:** Most internships and jobs expect you to know the RepoSphere workflow on Day 1.

### 🚩 Common Beginner Mistakes
*   **The "Final" Folder:** Thinking that manually saving versions is better than using Git.
*   **Public Secrets:** Accidentally uploading passwords or API keys to a public repo (Always use \`.env\`!).
    `
  },
  {
    id: 'git-vs-github',
    title: 'Git vs RepoSphere',
    icon: GitBranch,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    description: 'Clearing the confusion: One is the tool, the other is the platform.',
    content: `
# Understanding the Relationship

The most common point of confusion for new developers is thinking Git and GitHub are the same. They work together, but they serve different purposes.

### 💻 The Workflow Flowchart
**Developer** → (writes code) → **Local Git** → (commit) → **GitHub** → (collaboration)

| Feature | Git (The Engine) | GitHub (The Car) |
| :--- | :--- | :--- |
| **What is it?** | A local version control software. | A web-based hosting service. |
| **Where it lives** | Installed on your local machine. | On high-performance cloud servers. |
| **Does it need internet?** | No, it works completely offline. | Yes, to sync with others. |
| **Interface** | Terminal / CLI / GUI apps. | Beautiful Web Dashboard. |

### 🔍 Real-World Scenario
You use **Git** to track that you added a login page to your app while sitting on a plane. Once you land and get Wi-Fi, you "push" those changes to **GitHub** so your teammate in another country can review them.

### 💡 Why this matters
Knowing the difference helps you understand where your code is at any given time. If your computer crashes, your **Git** history is gone—unless you pushed it to **GitHub**.
    `
  },
  {
    id: 'repositories',
    title: 'Repositories',
    icon: Box,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    description: 'Everything begins here. Master the project structure and organization.',
    content: `
# The Anatomy of a Repository

A **Repository** (or "Repo") is the home for your project. It’s more than a folder; it's a living history of your work.

### 📁 Standard Repo Structure
*   **README.md:** The "front door." Tells users what the project is and how to use it.
*   **.gitignore:** A list of files Git should ignore (like \`node_modules\` or \`.env\`).
*   **LICENSE:** Legal framework for how others can use your code.
*   **.github/**: Configuration for GitHub-specific features like Actions.

### 🏆 Professional Best Practices
1.  **Naming:** Use lowercase with dashes (e.g., \`ecommerce-backend-api\`).
2.  **README First:** Write the README before you write the code. It helps you plan the project.
3.  **Small Commits:** Commit often with meaningful messages. Avoid "fixed stuff."

### 🛠️ What happens internally?
When you create a repo, Git creates a hidden \`.git\` folder. This folder is a database that stores every version of every file you've ever committed.

> [!IMPORTANT]
> **Real-World Organization:** In big companies, repositories are often organized into "Organizations." For example, Google has thousands of repositories under the \`google\` organization on RepoSphere.
    `
  },
  {
    id: 'branches',
    title: 'Branches',
    icon: GitFork,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    description: 'Work safely in parallel universes. The secret to bug-free production code.',
    content: `
# Branching: Parallel Development

In a professional environment, developers **never** work directly on the \`main\` branch. That branch is reserved for stable, working code.

### 🚦 The Branching Workflow
1.  **main:** The source of truth. Always deployable.
2.  **develop:** Where new features are integrated and tested.
3.  **feature/auth:** A temporary branch for building authentication.

### ⚔️ Dealing with Merge Conflicts
A conflict happens when two people change the same line of code in different ways. Git doesn't know which one is "right," so it asks you to choose.
*   **Professional Tip:** Pull the latest changes from \`main\` frequently (\`git pull\`) to catch conflicts early.

### 🏢 Real Company Workflow
Most companies use **GitFlow** or **GitHub Flow**:
\`main\` → \`development\` → \`feature/login\` → (Pull Request) → \`development\` → (Release) → \`main\`.

> [!CAUTION]
> **Don't work on Main!** Working directly on the main branch is like performing surgery on a patient while they are walking down the street. It's dangerous and prone to failure.
    `
  },
  {
    id: 'pull-requests',
    title: 'Pull Requests',
    icon: GitPullRequest,
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    description: 'Where code quality is born. Propose, review, and merge with confidence.',
    content: `
# The Pull Request Lifecycle

A Pull Request (PR) is an invitation for others to review your work before it's officially added to the project.

### 🔍 How Big Companies Review Code
*   **Automated Checks:** First, a computer (CI) tests the code for bugs and formatting.
*   **Peer Review:** At least one other developer must read and "Approve" the code.
*   **Security Audit:** Checks for exposed secrets or vulnerable libraries.

### ✍️ PR Etiquette
*   **Context is King:** Explain *why* you made the change, not just *what* the change is.
*   **Small PRs:** Aim for less than 200 lines of code per PR.
*   **Be Kind:** Code reviews are about improving the code, not judging the developer.

### 🏁 Merge Strategies
1.  **Create a merge commit:** Keeps all history from the feature branch.
2.  **Squash and merge:** Combines all commits into one clean commit on main.
3.  **Rebase and merge:** Keeps a perfectly linear history.
    `
  },
  {
    id: 'collaboration',
    title: 'Collaboration',
    icon: Users,
    color: 'text-indigo-400',
    bg: 'bg-indigo-400/10',
    description: 'How teams work together without stepping on each other’s toes.',
    content: `
# Teamwork at Scale

Collaboration on RepoSphere is governed by permissions and roles. This ensures that only authorized people can change critical code.

### 👥 Contributor Roles
*   **Owner:** Can do anything, including deleting the repository.
*   **Maintainer:** Can manage the project, but not destructive settings.
*   **Write Access:** Can push code directly to branches.
*   **Read Access:** Can see code and open issues, but can't change files.

### 🌍 Open Source Communities
Open source projects use the **Fork & Pull** model. Since the maintainers don't know you, they won't give you write access. Instead:
1.  You **Fork** their repo to your account.
2.  You make changes in your fork.
3.  You send a **Pull Request** from your fork back to their original repo.

> [!NOTE]
> **Activity Insights:** GitHub provides "Pulse" and "Contributor" graphs so teams can see who is contributing most and where the bottlenecks are.
    `
  },
  {
    id: 'issues',
    title: 'Issues & Tasks',
    icon: MessageSquare,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    description: 'Tracking bugs, features, and ideas in a structured way.',
    content: `
# Software Bug Tracking

Issues are the "To-Do" list for your project. They help teams stay organized and ensure nothing gets forgotten.

### 🏗️ Issue Lifecycle
1.  **Open:** A user reports a bug or suggests a feature.
2.  **Label:** A maintainer categorizes it (e.g., \`bug\`, \`help wanted\`).
3.  **Assign:** A developer is assigned to fix it.
4.  **Linked PR:** A developer opens a PR that references the issue.
5.  **Closed:** The issue is closed once the PR is merged.

### 🎯 Milestones & Sprints
Companies use **Milestones** to track progress toward a specific release date. For example, "Q3 Mobile App Update" might include 50 different issues.

> [!TIP]
> **Professional Workflow:** Use Issue Templates to ensure users give you the information you need (like browser version or steps to reproduce a bug).
    `
  },
  {
    id: 'projects',
    title: 'Projects & Agile',
    icon: Layout,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    description: 'Organize your work with Kanban boards and automated workflows.',
    content: `
# Managing Workflows

GitHub Projects is a powerful tool for **Agile Project Management**. It allows you to visualize your issues in a spreadsheet or a Kanban board.

### 📋 The Kanban Board
*   **Todo:** Work that hasn't started yet.
*   **In Progress:** Work currently being done.
*   **In Review:** Work waiting for a Pull Request approval.
*   **Done:** Completed and merged work.

### ⚡ Automation in Projects
You can set up rules so that when you open an issue, it automatically goes to "Todo," and when you open a PR, it automatically moves to "In Review."

### 🏢 How Engineering Teams Organize
Teams use **Sprints** (usually 2-week periods) to decide which tasks are the highest priority. They use GitHub Projects to track the "Velocity" of the team.
    `
  },
  {
    id: 'actions',
    title: 'CI/CD & Actions',
    icon: Zap,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    description: 'Automate your testing and deployment. Work less, ship more.',
    content: `
# Continuous Integration (CI/CD)

GitHub Actions allows you to automate tasks whenever something happens in your repository (like a push or a PR).

### 🔄 The "After Push" Pipeline
1.  **Trigger:** You push code to a branch.
2.  **Lint:** A bot checks if your code follows style guides.
3.  **Test:** Automated tests run to ensure no new bugs were introduced.
4.  **Security Scan:** Checks for vulnerable dependencies.
5.  **Build & Deploy:** If everything passes, the code is sent to production.

### 🚀 Why this matters
Automation removes human error. You don't have to remember to run tests; GitHub does it for you every single time.

> [!IMPORTANT]
> **Real Deployment:** Companies like Netflix or Amazon deploy code thousands of times a day using automated pipelines like GitHub Actions.
    `
  },
  {
    id: 'security',
    title: 'Security & Secrets',
    icon: Shield,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    description: 'Protecting your code and your users in a hostile world.',
    content: `
# Repository Security

Security is not an afterthought in software engineering; it's a foundational requirement.

### 🔐 Secrets Management
Never put API keys or database passwords in your code. If you do, anyone with access to the repo can steal them. Instead:
1.  Add them to **GitHub Secrets** in repo settings.
2.  Access them in your code via environment variables.

### 🛡️ Branch Protection Rules
Professional repos protect the \`main\` branch by requiring:
*   At least 1 approval from a human.
*   All automated tests (CI) to pass.
*   Signed commits to verify the author's identity.

### 🚨 Common Security Mistakes
*   **Public .env files:** Always add \`.env\` to your \`.gitignore\`.
*   **Vulnerable Packages:** Regularly run \`npm audit\` or use GitHub's **Dependabot** to find security flaws in your libraries.
    `
  },
  {
    id: 'commands',
    title: 'Git Commands',
    icon: Terminal,
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
    description: 'The master cheat sheet for the modern developer terminal.',
    isCommandSection: true,
    categories: [
      {
        name: 'The Basics (Setup)',
        commands: [
          { cmd: 'git init', desc: 'Create a brand new local repository.', example: 'git init' },
          { cmd: 'git clone <url>', desc: 'Download an existing project to your computer.', example: 'git clone https://github.com/user/repo.git' },
          { cmd: 'git status', desc: 'Check which files are changed, staged, or untracked.', example: 'git status' }
        ]
      },
      {
        name: 'Daily Workflow',
        commands: [
          { cmd: 'git add <file>', desc: 'Stage a specific file for the next commit.', example: 'git add index.html' },
          { cmd: 'git add .', desc: 'Stage ALL changes in the current folder.', example: 'git add .' },
          { cmd: 'git commit -m "Message"', desc: 'Save your staged changes with a descriptive note.', example: 'git commit -m "Fix mobile menu bug"' },
          { cmd: 'git push origin <branch>', desc: 'Upload your local commits to GitHub.', example: 'git push origin feature-login' }
        ]
      },
      {
        name: 'Branching & Syncing',
        commands: [
          { cmd: 'git switch -c <name>', desc: 'Create and switch to a new branch.', example: 'git switch -c dev-ui' },
          { cmd: 'git pull origin main', desc: 'Download AND merge the latest changes from GitHub.', example: 'git pull origin main' },
          { cmd: 'git fetch', desc: 'Download data from GitHub WITHOUT merging it.', example: 'git fetch origin' }
        ]
      },
      {
        name: 'Advanced Tools',
        commands: [
          { cmd: 'git stash', desc: 'Save your uncommitted changes for later.', example: 'git stash' },
          { cmd: 'git log --oneline --graph', desc: 'See a beautiful visualization of commit history.', example: 'git log --oneline --graph' },
          { cmd: 'git reset --hard HEAD~1', desc: 'DANGEROUS: Delete the last commit and all its changes.', example: 'git reset --hard HEAD~1' }
        ]
      }
    ]
  },
  {
    id: 'forks-stars',
    title: 'Forks & Stars',
    icon: Star,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    description: 'The social side of GitHub. Contribute to the world and show your appreciation.',
    content: `
# Open Source Contribution

GitHub is a social network. **Forks** and **Stars** are the primary ways we interact with projects we don't own.

### 🍴 What is a Fork?
A **Fork** is a complete copy of a repository that lives in your account. 
*   **Internal Logic:** When you fork, GitHub creates a "pointer" back to the original repo. This allows you to send Pull Requests later.
*   **Why Fork?** Use it when you want to propose changes to a project where you don't have "Push" access.

### ⭐ Why Stars Matter?
Stars are the "Like" button of the developer world.
*   **Popularity:** Projects with many stars are seen as more stable and trustworthy.
*   **Discovery:** Starring a project makes it easier for you to find it later and helps GitHub recommend similar projects to you.

### 🛠️ The Contribution Workflow
1.  **Fork** the original repo.
2.  **Clone** your fork to your machine.
3.  **Branch** out and make your changes.
4.  **Push** to your fork.
5.  **Pull Request** to the original repo's \`main\` branch.
    `
  },
  {
    id: 'videos',
    title: 'Video Tutorials',
    icon: Video,
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    description: 'Curated learning paths from beginner to advanced engineering.',
    isVideoSection: true,
    videos: [
      {
        title: 'Git & GitHub for Absolute Beginners',
        duration: '15:20',
        platform: 'YouTube',
        url: 'https://www.youtube.com/embed/iv8gwPYayS0',
        desc: 'The perfect starting point. Learn the basic mental model of version control.'
      },
      {
        title: 'Professional Git Workflow',
        duration: '22:45',
        platform: 'Engineering Blog',
        url: 'https://www.youtube.com/embed/hwP7WQkmECE',
        desc: 'How senior engineers use branching, rebasing, and clean commits in production.'
      },
      {
        title: 'Mastering GitHub Actions',
        duration: '10:15',
        platform: 'Cloud Walkthrough',
        url: 'https://www.youtube.com/embed/R8_veQiYBjI',
        desc: 'Automate your deployments like a DevOps pro.'
      }
    ]
  },
  {
    id: 'best-practices',
    title: 'Best Practices',
    icon: CheckCircle,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    description: 'The golden rules of professional software engineering on RepoSphere.',
    content: `
# Professional Engineering Standards

Writing code is only half the battle. Maintaining it in a team requires discipline and standardized habits.

### 📝 Commit Message Standards
*   **Bad:** "fixed bug"
*   **Good:** "fix(auth): resolve login timeout on slow connections"
*   **Rule:** Use the imperative mood ("Add feature" instead of "Added feature").

### 🌿 Branch Naming Conventions
*   **feature/**: New features.
*   **bugfix/**: Fixing a bug.
*   **hotfix/**: Urgent production fixes.
*   **docs/**: Documentation changes.

### 🤝 PR Etiquette
*   **Self-Review:** Always read your own code before asking someone else to.
*   **Small Chunks:** If your PR has 1,000+ lines, it's too big. Split it up.
*   **Automate Everything:** If you find yourself doing a manual task twice, write a GitHub Action for it.

> [!TIP]
> **Clean Code:** Always run your tests locally before you push. A "failed" build on RepoSphere is a sign of poor discipline.
    `
  },
  {
    id: 'revision',
    title: 'Quick Revision',
    icon: Brain,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    description: 'Master concepts through interactive flashcards and active recall.',
    isRevisionSection: true
  },
  {
    id: 'faq',
    title: 'FAQ',
    icon: HelpCircle,
    color: 'text-gray-400',
    bg: 'bg-gray-400/10',
    description: 'Answering the burning questions of new Git users.',
    isFAQSection: true,
    faqs: [
      { q: 'What is "origin"?', a: 'Origin is the default name Git gives to the remote repository on RepoSphere that you cloned from. It\'s just a shortcut name for the URL.' },
      { q: 'Why should I use Branches?', a: 'Because if you make a mistake on a branch, you haven\'t broken the live website. It allows you to experiment safely.' },
      { q: 'What is the difference between Fork and Clone?', a: 'Cloning makes a local copy on your computer. Forking makes a copy in your GitHub account. Usually, you fork a project first, then clone your fork.' },
      { q: 'Can I delete a commit after pushing it?', a: 'Yes, but it\'s difficult and can break things for your teammates. It\'s better to use `git revert`, which creates a new commit that undoes the changes.' },
      { q: 'How do I fix a Merge Conflict?', a: 'Open the file, look for `<<<<<<< HEAD`, and decide which code you want to keep. Delete the markers and commit the file.' }
    ]
  }
];

const IntroductionContent = ({ onNext }) => {
  return (
    <div className="space-y-24 pb-20">
      {/* SECTION 1 — HERO INTRODUCTION */}
      <section className="relative pt-10">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-500/[0.08] rounded-full blur-[140px] animate-pulse pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-purple-500/[0.06] rounded-full blur-[140px] animate-pulse pointer-events-none" style={{ animationDuration: '6s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/[0.03] rounded-full blur-[160px] pointer-events-none" />
        
        {/* Modern Grid Lighting Pattern */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 relative z-10"
        >
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-500/20">Beginner Friendly</span>
            <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-purple-500/20">Interactive Learning</span>
            <span className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-500/20">Real Developer Workflows</span>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
              Master the World of <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Software Collaboration</span>
            </h1>
            <p className="text-xl text-[#8b949e] leading-relaxed max-w-3xl">
              Learn how modern developers build, collaborate, and ship software using GitHub — the world's most popular development platform.
            </p>
          </div>

          <div className="flex items-center gap-8 py-6 border-y border-white/5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white">15 mins</span>
              <span className="text-xs text-[#8b949e]">Est. Time</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Book className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-white">Beginner</span>
              <span className="text-xs text-[#8b949e]">Difficulty</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-white">9 Topics</span>
              <span className="text-xs text-[#8b949e]">Concepts</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 2 — WHAT IS GITHUB? */}
      <section className="space-y-12">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Globe className="w-4 h-4 text-blue-400" />
            </div>
            What is RepoSphere?
          </h2>
          <p className="text-[#8b949e] leading-relaxed text-lg max-w-3xl">
            GitHub is a cloud-based platform built around Git, the most widely used version control system in the world. It is the complete collaboration platform for modern software engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Box, title: 'Repositories', desc: 'The home for your project files and their entire history.' },
            { icon: GitFork, title: 'Branches', desc: 'Parallel versions of your code for safe feature development.' },
            { icon: GitPullRequest, title: 'Pull Requests', desc: 'The heart of code review and team collaboration.' },
            { icon: Users, title: 'Collaboration', desc: 'Work with developers across the globe seamlessly.' },
            { icon: Zap, title: 'CI/CD Automation', desc: 'Automatically test and deploy code with Actions.' },
            { icon: Star, title: 'Open Source', desc: 'Contribute to millions of public projects world-wide.' }
          ].map((feat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8, borderColor: 'rgba(88, 166, 255, 0.4)' }}
              className="p-6 bg-[#1C2128] border border-white/5 rounded-2xl group transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feat.icon className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-white font-bold mb-2">{feat.title}</h3>
              <p className="text-sm text-[#8b949e] leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 3 — WHY GITHUB MATTERS */}
      <section className="space-y-12 py-12 px-8 bg-blue-500/[0.02] border border-white/5 rounded-[32px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px]" />
        <div className="space-y-4 relative z-10">
          <h2 className="text-3xl font-bold text-white tracking-tight">Why RepoSphere Matters</h2>
          <p className="text-[#8b949e] text-lg max-w-3xl">
            GitHub powers modern software development across startups, enterprises, AI companies, and open-source communities.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
          {[
            { val: '100M+', label: 'Developers' },
            { val: '372M+', label: 'Repositories' },
            { val: '90%', label: 'Fortune 100' },
            { val: '4B+', label: 'Contributions/Yr' }
          ].map((stat, i) => (
            <div key={i} className="space-y-1">
              <div className="text-3xl font-black text-white">{stat.val}</div>
              <div className="text-xs font-bold text-blue-400 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 relative z-10 pt-4">
          {[
            'Powers the global open-source ecosystem',
            'Industry standard for enterprise teams',
            'Helps developers build software faster',
            'Safe, secure, and highly scalable code hosting'
          ].map((point, i) => (
            <div key={i} className="flex items-center gap-3 text-[#8b949e]">
              <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
              <span className="text-sm font-medium">{point}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4 — REAL WORLD DEVELOPER WORKFLOW */}
      <section className="space-y-16">
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white tracking-tight">How Developers Use GitHub Daily</h2>
          <p className="text-[#8b949e]">The standard industry workflow for building production software.</p>
        </div>

        <div className="relative max-w-xl mx-auto">
          {/* Vertical Line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-transparent" />
          
          <div className="space-y-12">
            {[
              { icon: Box, title: 'Create Repository', text: 'Initialize your project and set up version control.' },
              { icon: Terminal, title: 'Push Code', text: 'Upload your local work to the cloud secure servers.' },
              { icon: GitFork, title: 'Create Branch', text: 'Start a separate workspace for your new feature.' },
              { icon: Code, title: 'Build Features', text: 'Write code safely without breaking the main app.' },
              { icon: GitPullRequest, title: 'Open Pull Request', text: 'Propose your changes and ask for a team review.' },
              { icon: Users, title: 'Review Code', text: 'Get feedback and improve code quality together.' },
              { icon: CheckCircle, title: 'Merge Changes', text: 'Combine your finished work into the main project.' },
              { icon: Rocket, title: 'Deploy Application', text: 'Ship your changes to millions of real users.' }
            ].map((step, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-8 relative group"
              >
                <div className="w-12 h-12 rounded-full bg-[#161B22] border border-white/10 flex items-center justify-center relative z-10 group-hover:border-blue-500/50 transition-colors shadow-xl">
                  <step.icon className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="text-white font-bold text-lg mb-1">{step.title}</h4>
                  <p className="text-sm text-[#8b949e] leading-relaxed">{step.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 — WHAT YOU WILL LEARN */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">What You'll Learn</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Book, title: 'Git Fundamentals', desc: 'The basics of local version control.' },
            { icon: RefreshCw, title: 'Git vs RepoSphere', desc: 'The difference between tool and platform.' },
            { icon: Box, title: 'Repositories', desc: 'Project structure and organization.' },
            { icon: GitFork, title: 'Branching', desc: 'Parallel development and safe code.' },
            { icon: GitPullRequest, title: 'Pull Requests', desc: 'Collaborative code review workflows.' },
            { icon: Users, title: 'Collaboration', desc: 'Team permissions and access control.' },
            { icon: MessageSquare, title: 'Issues & Tasks', desc: 'Bug tracking and feature planning.' },
            { icon: Layout, title: 'Projects & Agile', desc: 'Kanban boards and sprint management.' },
            { icon: Globe, title: 'Open Source', desc: 'Contributing to the global community.' }
          ].map((item, i) => (
            <div key={i} className="p-5 bg-[#1C2128]/50 border border-white/5 rounded-xl flex items-start gap-4 hover:bg-[#1C2128] transition-colors">
              <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
                <item.icon className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-white mb-1">{item.title}</h5>
                <p className="text-xs text-[#8b949e] leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6 — GITHUB ECOSYSTEM */}
      <section className="space-y-12 py-12 px-8 bg-purple-500/[0.02] border border-white/5 rounded-3xl">
        <div className="space-y-4 text-center">
          <h2 className="text-3xl font-bold text-white tracking-tight">The GitHub Ecosystem</h2>
          <p className="text-[#8b949e]">More than just code — a complete platform for software engineering.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: 'Actions', desc: 'CI/CD Automation' },
            { title: 'Packages', desc: 'Software Hosting' },
            { title: 'Security', desc: 'Code Scanning' },
            { title: 'Codespaces', desc: 'Cloud Dev Env' },
            { title: 'Copilot', desc: 'AI Pair Programmer' },
            { title: 'Projects', desc: 'Planning & Agile' },
            { title: 'Discussions', desc: 'Community Forum' },
            { title: 'Pages', desc: 'Static Site Hosting' }
          ].map((eco, i) => (
            <div key={i} className="p-4 bg-[#1C2128] border border-white/5 rounded-xl hover:bg-white/5 transition-colors text-center">
              <h5 className="text-white font-bold text-sm mb-1">{eco.title}</h5>
              <p className="text-[10px] text-[#8b949e]">{eco.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7 — BEHIND THE SCENES */}
      <section className="space-y-12 py-12 px-8 bg-[#161B22] border border-white/5 rounded-3xl">
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white tracking-tight">Behind The Scenes</h2>
          <p className="text-[#8b949e]">How GitHub works under the hood to power billions of contributions.</p>
        </div>

        {/* Mini Architecture Diagram */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 py-8">
          {[
            { label: 'Frontend', color: 'bg-blue-400' },
            { label: 'API Gateway', color: 'bg-purple-400' },
            { label: 'Git Service', color: 'bg-green-400' },
            { label: 'Storage', color: 'bg-orange-400' }
          ].map((node, i, arr) => (
            <React.Fragment key={i}>
              <div className="px-6 py-3 bg-[#1C2128] border border-white/10 rounded-xl relative group">
                <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${node.color} blur-[2px]`} />
                <span className="text-sm font-bold text-white">{node.label}</span>
              </div>
              {i < arr.length - 1 && (
                <div className="flex items-center">
                  <div className="h-px w-8 bg-gradient-to-r from-white/10 to-white/20 hidden md:block" />
                  <ArrowRight className="w-4 h-4 text-[#8b949e] rotate-90 md:rotate-0" />
                  <div className="h-px w-8 bg-gradient-to-l from-white/10 to-white/20 hidden md:block" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
          <div className="space-y-4">
            <h4 className="font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-400" />
              Distributed Architecture
            </h4>
            <p className="text-sm text-[#8b949e] leading-relaxed">
              GitHub uses a distributed object storage system based on the Git protocol. Every repository is replicated multiple times across global data centers to ensure zero data loss.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-green-400" />
              Secure Communication
            </h4>
            <p className="text-sm text-[#8b949e] leading-relaxed">
              All interactions are secured via SSH or HTTPS. Advanced infrastructure handles millions of concurrent requests, processing thousands of commits per second.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 8 — LEARNING PATH ROADMAP */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Your Learning Journey</h2>
        
        <div className="flex flex-col items-center gap-6 relative">
          {[
            { id: 'intro', label: 'Introduction', active: true },
            { id: 'why', label: 'Why RepoSphere', active: false },
            { id: 'git-vs-github', label: 'Git vs RepoSphere', active: false },
            { id: 'repositories', label: 'Repositories', active: false },
            { id: 'branches', label: 'Branches', active: false },
            { id: 'pull-requests', label: 'Pull Requests', active: false },
            { id: 'collaboration', label: 'Collaboration', active: false }
          ].map((path, i, arr) => (
            <React.Fragment key={path.id}>
              <div className={`px-8 py-3 rounded-2xl border transition-all ${
                path.active 
                  ? 'bg-blue-500/10 border-blue-500/40 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                  : 'bg-[#1C2128] border-white/5 text-[#8b949e]'
              }`}>
                <span className="text-sm font-bold uppercase tracking-wider">{path.label}</span>
              </div>
              {i < arr.length - 1 && (
                <div className="h-6 w-px bg-white/10" />
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* SECTION 9 — QUICK FACTS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Star, text: 'Created by Linus Torvalds, the founder of Linux.' },
          { icon: Users, text: 'Largest developer community in history.' },
          { icon: Terminal, text: 'The industry standard for all software jobs.' },
          { icon: Globe, text: 'Hosts the code that powers our modern world.' }
        ].map((fact, i) => (
          <div key={i} className="p-4 bg-[#1C2128]/30 border border-white/5 rounded-xl flex items-center gap-3">
            <fact.icon className="w-5 h-5 text-blue-400 shrink-0" />
            <span className="text-xs text-[#8b949e] leading-snug">{fact.text}</span>
          </div>
        ))}
      </section>

      {/* SECTION 10 — CALL TO ACTION */}
      <section className="relative py-16 px-12 bg-gradient-to-br from-blue-600 to-purple-700 rounded-[40px] overflow-hidden text-center group">
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="relative z-10 space-y-8">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white tracking-tight">Ready to Start Building?</h2>
            <p className="text-blue-100/80 text-lg">Start learning how developers collaborate and build applications.</p>
          </div>
          <button 
            onClick={onNext}
            className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-2xl flex items-center gap-3 mx-auto"
          >
            Continue Learning
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
};

const WhyGitHubContent = ({ onNext }) => {
  return (
    <div className="space-y-24 pb-20">
      {/* SECTION 1 — HERO HEADER */}
      <section className="relative pt-10 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 relative z-10"
        >
          <div className="flex justify-center flex-wrap gap-3">
            {['Industry Standard', 'Open Source', 'Team Collaboration'].map((badge, i) => (
              <span key={i} className="px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-purple-500/20">
                {badge}
              </span>
            ))}
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
              Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">GitHub?</span>
            </h1>
            <p className="text-xl text-[#8b949e] leading-relaxed max-w-2xl mx-auto">
              Discover why GitHub became the industry standard for modern software development and collaboration.
            </p>
          </div>

          <div className="flex justify-center items-center gap-12 py-6 border-y border-white/5">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-bold text-white">Used Worldwide</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-bold text-white">Developer Friendly</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-green-400" />
              <span className="text-sm font-bold text-white">Career Essential</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 2 — THE PROBLEM BEFORE GITHUB */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">Software Development Before GitHub</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            Before centralized platforms, developers struggled with chaotic workflows and synchronization issues.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Before Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="p-8 bg-red-500/[0.02] border border-red-500/10 rounded-[32px] space-y-6 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-[40px]" />
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <X className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Before GitHub</h3>
            </div>
            <ul className="space-y-4">
              {[
                { text: 'Sending ZIP files via email', sub: 'Version confusion was constant.' },
                { text: 'Duplicate project copies', sub: 'Which "v2_final" is the real final?' },
                { text: 'Lost changes & overwrites', sub: 'Two people editing the same file was a disaster.' },
                { text: 'Impossible teamwork', sub: 'Collaboration meant manual merging of files.' }
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500/40 mt-2 shrink-0" />
                  <div>
                    <div className="text-white font-medium">{item.text}</div>
                    <div className="text-xs text-[#8b949e]">{item.sub}</div>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* After Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="p-8 bg-green-500/[0.02] border border-green-500/10 rounded-[32px] space-y-6 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-[40px]" />
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white">After GitHub</h3>
            </div>
            <ul className="space-y-4">
              {[
                { text: 'Real-time version tracking', sub: 'Every change is logged with a timestamp.' },
                { text: 'Seamless collaboration', sub: 'Work on the same project from anywhere.' },
                { text: 'Professional Pull Requests', sub: 'Review code before it enters production.' },
                { icon: CheckCircle, text: 'Cloud-based reliability', sub: 'Your project is safe and always accessible.' }
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500/40 mt-2 shrink-0" />
                  <div>
                    <div className="text-white font-medium">{item.text}</div>
                    <div className="text-xs text-[#8b949e]">{item.sub}</div>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* SECTION 3 — WHY DEVELOPERS LOVE GITHUB */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Why Developers Love GitHub</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: RefreshCw, title: 'Version Control', desc: 'Track every change in your project history safely.' },
            { icon: Users, title: 'Collaboration', desc: 'Work with teammates on the same project simultaneously.' },
            { icon: GitFork, title: 'Branching', desc: 'Build features independently without affecting main.' },
            { icon: GitPullRequest, title: 'Pull Requests', desc: 'Review, discuss, and improve code before merging.' },
            { icon: Star, title: 'Open Source', desc: 'Contribute to projects used by millions world-wide.' },
            { icon: Zap, title: 'Automation', desc: 'Run tests, deployments, and workflows automatically.' },
            { icon: Globe, title: 'Cloud Access', desc: 'Access repositories from anywhere in the world.' },
            { icon: Shield, title: 'Security', desc: 'Manage permissions, secrets, and protected branches.' }
          ].map((feat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02, borderColor: 'rgba(168, 85, 247, 0.4)' }}
              className="p-6 bg-[#1C2128] border border-white/5 rounded-2xl group transition-all duration-300 relative overflow-hidden shadow-xl"
            >
              <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feat.icon className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-white font-bold mb-2">{feat.title}</h3>
              <p className="text-sm text-[#8b949e] leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 4 — REAL WORLD INDUSTRY USE */}
      <section className="space-y-12 py-12 px-8 bg-[#161B22] border border-white/5 rounded-[40px]">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">How Companies Use GitHub</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto">From agile startups to global enterprises, GitHub is the infrastructure for innovation.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { icon: Rocket, title: 'Startups', desc: 'Iterate fast and build initial products with small teams.' },
            { icon: Users, title: 'Enterprise', desc: 'Manage thousands of developers across global offices.' },
            { icon: Cpu, title: 'AI/ML Projects', desc: 'Collaborate on complex models and data pipelines.' },
            { icon: Globe, title: 'Cloud Platforms', desc: 'Deploy infrastructure as code at massive scale.' },
            { icon: FileCode, title: 'Mobile Apps', desc: 'Coordinate multi-platform releases seamlessly.' },
            { icon: Layout, title: 'Web Apps', desc: 'Maintain modern SaaS products with continuous delivery.' }
          ].map((item, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -5 }}
              className="p-6 bg-[#0D1117] border border-white/5 rounded-2xl hover:bg-[#1C2128] transition-all"
            >
              <item.icon className="w-6 h-6 text-blue-400 mb-4" />
              <h4 className="text-white font-bold mb-2">{item.title}</h4>
              <p className="text-xs text-[#8b949e] leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 5 — GITHUB IN DAILY WORKFLOW */}
      <section className="space-y-16">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">A Developer's Daily Workflow</h2>
        
        <div className="relative max-w-2xl mx-auto">
          {/* Central Line */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-purple-500/50 via-blue-500/50 to-transparent hidden md:block" />
          
          <div className="space-y-12 relative">
            {[
              { icon: Code, title: 'Write Code', desc: 'Implement new features or fix bugs locally.' },
              { icon: CheckCircle, title: 'Commit Changes', desc: 'Save snapshots of your work with messages.' },
              { icon: ArrowRight, title: 'Push to Repository', desc: 'Upload your local work to the cloud server.' },
              { icon: GitFork, title: 'Create Branch', desc: 'Isolate your work from the production code.' },
              { icon: GitPullRequest, title: 'Open Pull Request', desc: 'Propose your changes for team review.' },
              { icon: Users, title: 'Code Review', desc: 'Get feedback and improve code quality.' },
              { icon: RefreshCw, title: 'Merge Changes', desc: 'Combine your work into the main codebase.' },
              { icon: Rocket, title: 'Deploy Application', desc: 'Ship your changes to millions of real users.' }
            ].map((step, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                  <h4 className="text-white font-bold text-lg mb-1">{step.title}</h4>
                  <p className="text-sm text-[#8b949e]">{step.desc}</p>
                </div>
                
                <div className="w-12 h-12 rounded-full bg-[#161B22] border-2 border-purple-500/30 flex items-center justify-center relative z-10 bg-gradient-to-br from-[#161B22] to-[#0D1117] shadow-xl shrink-0">
                  <step.icon className="w-5 h-5 text-purple-400" />
                </div>
                
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — OPEN SOURCE COMMUNITY */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">Powering Open Source</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto">The open-source revolution happened because of GitHub. It enabled global collaboration on a scale never seen before.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: Globe, title: 'Global Collaboration', desc: 'Work with developers from every continent on shared goals.' },
            { icon: Book, title: 'Learning From Real Code', desc: 'Study the source code of the world\'s best applications.' },
            { icon: Users, title: 'Community Contributions', desc: 'Join established projects and leave your mark.' },
            { icon: MessageSquare, title: 'Developer Networking', desc: 'Build your reputation and connect with experts.' }
          ].map((card, i) => (
            <div key={i} className="p-8 bg-blue-500/[0.03] border border-white/5 rounded-3xl flex items-start gap-6 hover:border-blue-500/30 transition-all">
              <div className="p-3 bg-blue-500/10 rounded-2xl shrink-0">
                <card.icon className="w-6 h-6 text-blue-400" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-white">{card.title}</h4>
                <p className="text-[#8b949e] leading-relaxed">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7 — WHY STUDENTS SHOULD LEARN GITHUB */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Why Students Should Learn RepoSphere</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: Star, title: 'Build Portfolio', color: 'text-yellow-400' },
            { icon: Users, title: 'Team Collaboration', color: 'text-blue-400' },
            { icon: Rocket, title: 'Internship Ready', color: 'text-purple-400' },
            { icon: Box, title: 'Project Showcase', color: 'text-green-400' },
            { icon: Globe, title: 'Open Source', color: 'text-orange-400' }
          ].map((item, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -5 }}
              className="p-6 bg-[#1C2128] border border-white/5 rounded-2xl text-center space-y-4 shadow-xl"
            >
              <div className={`w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <h5 className="text-sm font-bold text-white leading-tight">{item.title}</h5>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 8 — BEHIND THE PLATFORM */}
      <section className="space-y-12 py-12 px-8 bg-[#161B22] border border-white/5 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">More Than Just Code Hosting</h2>
          <p className="text-[#8b949e]">GitHub is a distributed collaboration platform built for scale.</p>
        </div>

        {/* Mini Architecture Visual */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-12">
          {[
            { label: 'Developer', icon: Users, color: 'text-blue-400' },
            { label: 'GitHub Cloud', icon: Globe, color: 'text-purple-400' },
            { label: 'Team Sync', icon: RefreshCw, color: 'text-green-400' },
            { label: 'Deployment', icon: Rocket, color: 'text-orange-400' }
          ].map((node, i, arr) => (
            <React.Fragment key={i}>
              <div className="p-6 bg-[#1C2128] border border-white/10 rounded-2xl flex flex-col items-center gap-3 w-40 shadow-2xl">
                <node.icon className={`w-8 h-8 ${node.color}`} />
                <span className="text-sm font-bold text-white">{node.label}</span>
              </div>
              {i < arr.length - 1 && (
                <ArrowRight className="w-6 h-6 text-[#8b949e] rotate-90 md:rotate-0" />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-white/5">
          {[
            { title: 'Repositories', desc: 'Project containers with full history.' },
            { title: 'Commits', desc: 'Snapshot changes with metadata.' },
            { title: 'CI/CD', desc: 'Automated test & deploy pipelines.' }
          ].map((item, i) => (
            <div key={i} className="text-center">
              <h5 className="font-bold text-white mb-1">{item.title}</h5>
              <p className="text-xs text-[#8b949e]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 9 — QUICK FACTS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { val: '100M+', label: 'Developers', desc: 'Building software world-wide.' },
          { val: '372M+', label: 'Repositories', desc: 'Hosting the world\'s code.' },
          { val: '90%', label: 'Fortune 100', desc: 'Use GitHub Enterprise.' },
          { val: '4B+', label: 'Contributions', desc: 'Per year globally.' }
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-gradient-to-br from-[#1C2128] to-[#0D1117] border border-white/5 rounded-2xl space-y-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-1 h-full bg-purple-500/20 group-hover:bg-purple-500/50 transition-colors" />
            <div className="text-3xl font-black text-white">{stat.val}</div>
            <div className="text-xs font-bold text-purple-400 uppercase tracking-widest">{stat.label}</div>
            <p className="text-[10px] text-[#8b949e]">{stat.desc}</p>
          </div>
        ))}
      </section>

      {/* SECTION 10 — MOTIVATIONAL CTA */}
      <section className="relative py-20 px-12 bg-gradient-to-br from-purple-600 to-blue-700 rounded-[40px] overflow-hidden text-center group">
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white tracking-tight">Start Your GitHub Journey</h2>
            <p className="text-purple-100/80 text-lg leading-relaxed">
              Learning GitHub is one of the most valuable skills for modern developers. From personal projects to enterprise software, GitHub powers how the world builds technology.
            </p>
          </div>
          <button 
            onClick={onNext}
            className="px-10 py-5 bg-white text-purple-600 rounded-2xl font-bold text-xl hover:scale-105 transition-all shadow-2xl flex items-center gap-3 mx-auto group/btn"
          >
            Continue Learning
            <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
};

const GitVsGitHubContent = ({ onNext }) => {
  return (
    <div className="space-y-24 pb-20">
      {/* SECTION 1 — HERO HEADER */}
      <section className="relative pt-10 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/10 rounded-full blur-[120px] animate-pulse" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 relative z-10"
        >
          <div className="flex justify-center flex-wrap gap-3">
            {['Beginner Friendly', 'Core Concept', 'Developer Essential'].map((badge, i) => (
              <span key={i} className="px-3 py-1 bg-orange-500/10 text-orange-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-orange-500/20">
                {badge}
              </span>
            ))}
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
              Git vs <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">GitHub</span>
            </h1>
            <p className="text-xl text-[#8b949e] leading-relaxed max-w-2xl mx-auto">
              Understand the difference between Git and GitHub — and how they work together to power modern software development.
            </p>
          </div>

          <div className="flex justify-center items-center gap-12 py-6 border-y border-white/5">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-orange-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Concepts</span>
                <span className="text-[10px] text-[#8b949e]">Git, GitHub, VC</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Book className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Difficulty</span>
                <span className="text-[10px] text-[#8b949e]">Beginner</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Time</span>
                <span className="text-[10px] text-[#8b949e]">10 mins</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 2 — COMMON BEGINNER CONFUSION */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">Why Beginners Get Confused</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            Many new developers think Git and GitHub are the same thing — but they are different technologies that work together.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="relative p-12 bg-gradient-to-br from-[#1C2128] to-[#0D1117] border border-white/10 rounded-[40px] overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[80px]" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-6">
              <div className="p-6 bg-orange-500/10 border border-orange-500/20 rounded-3xl">
                <div className="flex items-center gap-4 mb-2">
                  <Terminal className="w-6 h-6 text-orange-400" />
                  <h3 className="text-2xl font-black text-white">Git is the Tool</h3>
                </div>
                <p className="text-orange-100/60 leading-relaxed">It's the software that runs on your computer and tracks your work history.</p>
              </div>
              <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl">
                <div className="flex items-center gap-4 mb-2">
                  <Globe className="w-6 h-6 text-blue-400" />
                  <h3 className="text-2xl font-black text-white">GitHub is the Platform</h3>
                </div>
                <p className="text-blue-100/60 leading-relaxed">It's the cloud-based site that hosts your Git projects for the whole world to see.</p>
              </div>
            </div>

            <div className="space-y-8 text-center md:text-left">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">The Key Difference</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-4xl font-black text-white leading-tight">Different Tech,<br />Same Mission.</h3>
                <p className="text-[#8b949e] leading-relaxed">Git works locally to track changes, while GitHub works globally to help people share those changes.</p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="w-2 h-2 rounded-full bg-orange-400" />
                  <span className="text-sm font-bold text-white">Git = Version Control System</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-sm font-bold text-white">GitHub = Cloud Collaboration Platform</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 3 — WHAT IS GIT? */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white tracking-tight">What is Git?</h2>
            <p className="text-[#8b949e] max-w-xl">Git is a distributed version control system created to track changes in source code.</p>
          </div>
          <div className="px-6 py-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <span className="block text-xs text-orange-400 font-bold uppercase tracking-widest">The Analogy</span>
              <span className="text-sm text-white font-medium">Git is like a time machine for your code.</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: History, title: 'Commit History', desc: 'Save snapshots of your code at any point in time.' },
            { icon: GitBranch, title: 'Branching', desc: 'Experiment with new features in parallel universes.' },
            { icon: RefreshCw, title: 'Version Tracking', desc: 'See exactly what changed, when, and by whom.' },
            { icon: Terminal, title: 'Local Development', desc: 'Works completely offline on your own machine.' },
            { icon: Zap, title: 'Safe Experimentation', desc: 'Revert mistakes instantly without losing work.' },
            { icon: GitFork, title: 'Distributed Control', desc: 'Every developer has a full copy of the project history.' }
          ].map((feat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5, borderColor: 'rgba(251, 146, 60, 0.4)' }}
              className="p-8 bg-[#1C2128] border border-white/5 rounded-[32px] group transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                <feat.icon className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
              <p className="text-[#8b949e] leading-relaxed text-sm">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 4 — WHAT IS GITHUB? */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div className="space-y-2 text-right md:order-2">
            <h2 className="text-3xl font-bold text-white tracking-tight">What is RepoSphere?</h2>
            <p className="text-[#8b949e] max-w-xl">GitHub is a cloud-based platform built around Git that allows developers to host and collaborate.</p>
          </div>
          <div className="px-6 py-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-3 group md:order-1">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <span className="block text-xs text-blue-400 font-bold uppercase tracking-widest">The Analogy</span>
              <span className="text-sm text-white font-medium">GitHub is the entire platform built around the engine.</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Box, title: 'Repository Hosting', desc: 'Store your project history in the cloud securely.' },
            { icon: GitPullRequest, title: 'Pull Requests', desc: 'Collaborative code review before merging work.' },
            { icon: Users, title: 'Team Collaboration', desc: 'Manage permissions and work together globally.' },
            { icon: Star, title: 'Open Source', desc: 'Join a community of millions of developers.' },
            { icon: Zap, title: 'Actions & Automation', desc: 'Automate testing and deployment workflows.' },
            { icon: Globe, title: 'Cloud Access', desc: 'Access your code from any computer in the world.' }
          ].map((feat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5, borderColor: 'rgba(59, 130, 246, 0.4)' }}
              className="p-8 bg-[#1C2128] border border-white/5 rounded-[32px] group transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:-rotate-12 transition-transform">
                <feat.icon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
              <p className="text-[#8b949e] leading-relaxed text-sm">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 5 — SIDE-BY-SIDE COMPARISON */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Git vs RepoSphere Comparison</h2>
        
        <div className="overflow-x-auto rounded-[32px] border border-white/5 bg-[#1C2128]/50 shadow-2xl">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-8 text-sm font-bold text-[#8b949e] uppercase tracking-widest">Category</th>
                <th className="p-8 text-sm font-bold text-orange-400 uppercase tracking-widest bg-orange-400/5">Git (The Tool)</th>
                <th className="p-8 text-sm font-bold text-blue-400 uppercase tracking-widest bg-blue-400/5">GitHub (The Platform)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { cat: 'Type', git: 'Version Control System', github: 'Cloud Hosting Platform' },
                { cat: 'Works Online?', git: 'No (Local First)', github: 'Yes (Cloud Based)' },
                { cat: 'Main Purpose', git: 'Tracking code changes', github: 'Collaboration & Hosting' },
                { cat: 'Requires Internet?', git: 'No', github: 'Usually Yes' },
                { cat: 'Interface', git: 'Command Line / GUI', github: 'Web Dashboard / Desktop App' },
                { cat: 'Created By', git: 'Linus Torvalds', github: 'GitHub Inc. (Microsoft)' }
              ].map((row, i) => (
                <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="p-8 font-bold text-white">{row.cat}</td>
                  <td className="p-8 text-[#8b949e] bg-orange-400/[0.01]">{row.git}</td>
                  <td className="p-8 text-[#8b949e] bg-blue-400/[0.01]">{row.github}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 6 — HOW THEY WORK TOGETHER */}
      <section className="relative p-16 bg-[#161B22] border border-white/5 rounded-[48px] overflow-hidden text-center space-y-12">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-purple-500 to-blue-400" />
        
        <div className="space-y-4">
          <h2 className="text-4xl font-black text-white tracking-tight">The Perfect Power Couple</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed text-lg">
            GitHub doesn't replace Git — it makes Git more powerful by bringing your local code into the global developer ecosystem.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-12 max-w-4xl mx-auto relative">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400/30 via-purple-500/30 to-blue-400/30 -translate-y-1/2 hidden md:block" />
          
          <div className="z-10 p-1 bg-gradient-to-br from-orange-400 to-orange-600 rounded-[32px] shadow-2xl">
            <div className="p-8 bg-[#0D1117] rounded-[31px] space-y-4 w-64">
              <Terminal className="w-12 h-12 text-orange-400 mx-auto" />
              <div className="font-black text-white text-xl">LOCAL GIT</div>
              <p className="text-[10px] text-[#8b949e] uppercase font-bold tracking-widest leading-relaxed">Save your work<br />& keep history</p>
            </div>
          </div>

          <div className="z-20 w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-2xl">
            <RefreshCw className="w-8 h-8 text-purple-600 animate-spin-slow" />
          </div>

          <div className="z-10 p-1 bg-gradient-to-br from-blue-400 to-blue-600 rounded-[32px] shadow-2xl">
            <div className="p-8 bg-[#0D1117] rounded-[31px] space-y-4 w-64">
              <Globe className="w-12 h-12 text-blue-400 mx-auto" />
              <div className="font-black text-white text-xl">CLOUD GITHUB</div>
              <p className="text-[10px] text-[#8b949e] uppercase font-bold tracking-widest leading-relaxed">Share with team<br />& deploy code</p>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="relative py-20 px-12 bg-gradient-to-br from-orange-600 to-red-700 rounded-[40px] overflow-hidden text-center group">
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white tracking-tight">Ready to Master Repositories?</h2>
            <p className="text-orange-100/80 text-lg leading-relaxed">
              Now that you understand the tool (Git) and the platform (GitHub), let's learn how to organize your code into professional Repositories.
            </p>
          </div>
          <button 
            onClick={onNext}
            className="px-10 py-5 bg-white text-orange-600 rounded-2xl font-bold text-xl hover:scale-105 transition-all shadow-2xl flex items-center gap-3 mx-auto group/btn"
          >
            Explore Repositories
            <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
};

const RepositoriesContent = ({ onNext }) => {
  return (
    <div className="space-y-24 pb-20">
      {/* SECTION 1 — HERO HEADER */}
      <section className="relative pt-10 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-green-500/10 rounded-full blur-[120px] animate-pulse" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 relative z-10"
        >
          <div className="flex justify-center flex-wrap gap-3">
            {['Core GitHub Concept', 'Beginner Friendly', 'Project Management'].map((badge, i) => (
              <span key={i} className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-500/20">
                {badge}
              </span>
            ))}
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
              Repositories
            </h1>
            <p className="text-xl text-[#8b949e] leading-relaxed max-w-2xl mx-auto">
              Learn how repositories store, organize, and manage software projects using Git and GitHub.
            </p>
          </div>

          <div className="flex justify-center items-center gap-12 py-6 border-y border-white/5">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-green-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Topic</span>
                <span className="text-[10px] text-[#8b949e]">Repositories</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Book className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Difficulty</span>
                <span className="text-[10px] text-[#8b949e]">Beginner</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Time</span>
                <span className="text-[10px] text-[#8b949e]">12 mins</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 2 — WHAT IS A REPOSITORY? */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">What is a Repository?</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            A repository (repo) is a project workspace that contains source code, folders, files, commit history, branches, and documentation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="p-8 bg-green-500/[0.03] border border-green-500/20 rounded-[32px] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Info className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white">The Analogy</h3>
              </div>
              <p className="text-green-100/60 text-lg italic leading-relaxed">
                "A repository is like a smart project folder with memory."
              </p>
              <p className="text-[#8b949e] text-sm leading-relaxed">
                Unlike a normal folder, a repo remembers every change you ever made, who made it, and why. It's the ultimate tool for organization and safety.
              </p>
            </div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="p-8 bg-gradient-to-br from-[#1C2128] to-[#0D1117] border border-white/10 rounded-[32px] relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-[40px] group-hover:bg-green-500/10 transition-colors" />
              <div className="relative z-10 space-y-4">
                <div className="text-xs font-bold text-green-400 uppercase tracking-widest">Master Formula</div>
                <h3 className="text-2xl font-black text-white leading-tight">
                  Repository = <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                    Project + History + Collaboration
                  </span>
                </h3>
              </div>
              {/* Animated Border Effect */}
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-green-400/50 to-blue-400/50 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: FileCode, label: 'Source Code' },
              { icon: Folder, label: 'Folders' },
              { icon: History, label: 'Commit History' },
              { icon: GitBranch, label: 'Branches' },
              { icon: MessageSquare, label: 'Issues' },
              { icon: GitPullRequest, label: 'Pull Requests' }
            ].map((item, i) => (
              <div key={i} className="p-6 bg-[#161B22] border border-white/5 rounded-2xl flex flex-col items-center gap-3 hover:bg-white/5 transition-all group">
                <item.icon className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — WHAT DOES A REPOSITORY CONTAIN? */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Inside a Repository</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Code, title: 'Source Code', desc: 'The actual application or software files that make up your project.' },
            { icon: FileText, title: 'README.md', desc: 'The documentation front page explaining the project to users.' },
            { icon: GitBranch, title: 'Branches', desc: 'Parallel versions of development for safe experimentation.' },
            { icon: History, title: 'Commit History', desc: 'A chronological timeline of all changes made to the project.' },
            { icon: MessageSquare, title: 'Issues', desc: 'Where teams discuss bugs, features, and project tasks.' },
            { icon: GitPullRequest, title: 'Pull Requests', desc: 'The system for code review and merging new changes.' },
            { icon: Settings, title: 'Config Files', desc: 'Project setup, environment variables, and tool configuration.' },
            { icon: Shield, title: 'License', desc: 'Legal framework defining how others can use your code.' }
          ].map((feat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5, borderColor: 'rgba(34, 197, 94, 0.4)' }}
              className="p-6 bg-[#1C2128] border border-white/5 rounded-2xl group transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-colors" />
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feat.icon className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-white font-bold mb-2">{feat.title}</h3>
              <p className="text-xs text-[#8b949e] leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 4 — LOCAL VS REMOTE REPOSITORIES */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Local vs Remote Repositories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative">
          {/* Animated Sync Arrows */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col gap-4">
            <motion.div 
              animate={{ x: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="p-2 bg-green-500/20 rounded-full border border-green-500/30"
            >
              <ArrowRight className="w-5 h-5 text-green-400" />
            </motion.div>
            <motion.div 
              animate={{ x: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="p-2 bg-blue-500/20 rounded-full border border-blue-500/30"
            >
              <ArrowLeft className="w-5 h-5 text-blue-400" />
            </motion.div>
          </div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-10 bg-[#161B22] border border-white/5 rounded-[40px] space-y-6 relative group overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-[40px]" />
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <Monitor className="w-7 h-7 text-green-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Local Repository</h3>
                <span className="text-xs font-bold text-green-400 uppercase tracking-widest">On Your Computer</span>
              </div>
            </div>
            <ul className="space-y-4">
              {[
                { icon: Zap, text: 'Work completely offline' },
                { icon: Shield, text: 'Make changes safely' },
                { icon: Cpu, text: 'Test features locally' }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-[#8b949e]">
                  <item.icon className="w-4 h-4 text-green-400/50" />
                  <span className="text-sm">{item.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-10 bg-[#161B22] border border-white/5 rounded-[40px] space-y-6 relative group overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px]" />
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Cloud className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Remote Repository</h3>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">On GitHub Cloud</span>
              </div>
            </div>
            <ul className="space-y-4">
              {[
                { icon: Database, text: 'Cloud project backup' },
                { icon: Users, text: 'Collaborate with teams' },
                { icon: Globe, text: 'Share code globally' }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-[#8b949e]">
                  <item.icon className="w-4 h-4 text-blue-400/50" />
                  <span className="text-sm">{item.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* SECTION 5 — HOW DEVELOPERS USE REPOSITORIES */}
      <section className="space-y-16">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">How Developers Use Repositories Daily</h2>
        
        <div className="relative max-w-2xl mx-auto">
          {/* Central Line */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-green-500/50 via-blue-500/50 to-transparent hidden md:block" />
          
          <div className="space-y-12 relative">
            {[
              { icon: Plus, title: 'Create Repository', desc: 'Initialize the project home on RepoSphere.' },
              { icon: Code, title: 'Add Files', desc: 'Create your source code and project structure.' },
              { icon: History, title: 'Commit Changes', desc: 'Save snapshots of your progress locally.' },
              { icon: Share2, title: 'Push to GitHub', desc: 'Sync your local work with the remote cloud repo.' },
              { icon: GitBranch, title: 'Create Branches', desc: 'Start a separate workspace for new features.' },
              { icon: Users, title: 'Collaborate with Team', desc: 'Invite others to contribute to your repository.' },
              { icon: GitPullRequest, title: 'Review Pull Requests', desc: 'Review and merge code changes from teammates.' },
              { icon: Rocket, title: 'Deploy Project', desc: 'Ship your live application from the repository.' }
            ].map((step, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                  <h4 className="text-white font-bold text-lg mb-1">{step.title}</h4>
                  <p className="text-sm text-[#8b949e]">{step.desc}</p>
                </div>
                
                <div className="w-12 h-12 rounded-full bg-[#161B22] border-2 border-green-500/30 flex items-center justify-center relative z-10 bg-gradient-to-br from-[#161B22] to-[#0D1117] shadow-xl shrink-0">
                  <step.icon className="w-5 h-5 text-green-400" />
                </div>
                
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — REPOSITORY STRUCTURE VISUALIZATION */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Typical Repository Structure</h2>
        
        <div className="max-w-3xl mx-auto p-8 bg-[#0d1117] border border-white/10 rounded-[32px] font-mono relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-4">
            <Terminal className="w-5 h-5 text-[#8b949e]/30" />
          </div>
          
          <div className="space-y-4 text-sm leading-relaxed">
            <div className="flex items-center gap-3">
              <FolderOpen className="w-4 h-4 text-green-400" />
              <span className="text-white font-bold">project-repo/</span>
            </div>
            
            <div className="pl-6 space-y-3">
              <div className="flex items-center gap-3 group">
                <div className="w-px h-6 bg-white/10" />
                <Folder className="w-4 h-4 text-blue-400" />
                <span className="text-[#8b949e] group-hover:text-white transition-colors">src/</span>
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-[#8b949e]">Application source code</span>
              </div>
              
              <div className="flex items-center gap-3 group">
                <div className="w-px h-6 bg-white/10" />
                <Folder className="w-4 h-4 text-blue-400" />
                <span className="text-[#8b949e] group-hover:text-white transition-colors">public/</span>
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-[#8b949e]">Static assets like images</span>
              </div>

              <div className="flex items-center gap-3 group">
                <div className="w-px h-6 bg-white/10" />
                <FileCode className="w-4 h-4 text-purple-400" />
                <span className="text-[#8b949e] group-hover:text-white transition-colors">package.json</span>
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-[#8b949e]">Dependencies and scripts</span>
              </div>

              <div className="flex items-center gap-3 group">
                <div className="w-px h-6 bg-white/10" />
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="text-[#8b949e] group-hover:text-white transition-colors">README.md</span>
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-[#8b949e]">Project documentation</span>
              </div>

              <div className="flex items-center gap-3 group">
                <div className="w-px h-6 bg-white/10" />
                <Settings className="w-4 h-4 text-gray-400" />
                <span className="text-[#8b949e] group-hover:text-white transition-colors">.gitignore</span>
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-[#8b949e]">Files Git should ignore</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
              <h5 className="text-white font-bold text-xs mb-2">Pro Tip: README.md</h5>
              <p className="text-[10px] text-[#8b949e] leading-relaxed">Always keep your README updated. It's the first thing recruiters and teammates look at when visiting your repo.</p>
            </div>
            <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
              <h5 className="text-white font-bold text-xs mb-2">Pro Tip: .gitignore</h5>
              <p className="text-[10px] text-[#8b949e] leading-relaxed">Never push node_modules or secret keys. Use .gitignore to keep your repository clean and secure.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — PUBLIC VS PRIVATE REPOSITORIES */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Public vs Private Repositories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            whileHover={{ y: -5 }}
            className="p-10 bg-blue-500/[0.02] border border-blue-500/10 rounded-[40px] space-y-6 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px]" />
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Globe className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Public Repository</h3>
            </div>
            <ul className="space-y-4">
              {[
                'Visible to everyone on RepoSphere',
                'Used for Open Source projects',
                'Encourages community contribution',
                'Great for building a public portfolio'
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-3 text-[#8b949e]">
                  <CheckCircle2 className="w-4 h-4 text-blue-400/50" />
                  <span className="text-sm">{text}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="p-10 bg-purple-500/[0.02] border border-purple-500/10 rounded-[40px] space-y-6 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-[40px]" />
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <Lock className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Private Repository</h3>
            </div>
            <ul className="space-y-4">
              {[
                'Restricted access (only you and invited)',
                'Used for internal/company projects',
                'Secure development for private ideas',
                'Control exactly who can see the code'
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-3 text-[#8b949e]">
                  <CheckCircle2 className="w-4 h-4 text-purple-400/50" />
                  <span className="text-sm">{text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* SECTION 8 — WHY REPOSITORIES ARE IMPORTANT */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Why Repositories Matter</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { icon: FolderOpen, title: 'Organized Projects', color: 'text-green-400' },
            { icon: History, title: 'Version Tracking', color: 'text-blue-400' },
            { icon: Users, title: 'Team Collaboration', color: 'text-purple-400' },
            { icon: Rocket, title: 'Deployment Ready', color: 'text-orange-400' },
            { icon: Shield, title: 'Safe Development', color: 'text-red-400' },
            { icon: Globe, title: 'Cloud Access', color: 'text-cyan-400' }
          ].map((item, i) => (
            <motion.div 
              key={i} 
              whileHover={{ scale: 1.05 }}
              className="p-6 bg-[#1C2128] border border-white/5 rounded-2xl text-center space-y-4 shadow-xl group"
            >
              <div className={`w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <h5 className="text-sm font-bold text-white">{item.title}</h5>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 9 — REAL-WORLD EXAMPLES */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Real-World Repository Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Layout, title: 'Portfolio Website', tech: ['React', 'Tailwind'], desc: 'Contains frontend code, assets, and deployment config.' },
            { icon: Smartphone, title: 'Mobile Application', tech: ['Flutter', 'Firebase'], desc: 'Contains app source code, APIs, and asset folders.' },
            { icon: Activity, title: 'AI/ML Project', tech: ['Python', 'PyTorch'], desc: 'Contains datasets, models, training scripts, and notebooks.' },
            { icon: Code, title: 'Open Source Library', tech: ['TypeScript', 'NPM'], desc: 'Contains reusable code, tests, and documentation.' },
            { icon: Database, title: 'Enterprise Backend', tech: ['Node.js', 'PostgreSQL'], desc: 'Contains scalable server-side systems and databases.' }
          ].map((item, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -8 }}
              className="p-8 bg-[#161B22] border border-white/5 rounded-[32px] space-y-6 hover:border-green-500/30 transition-all shadow-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                <item.icon className="w-6 h-6 text-green-400" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-white">{item.title}</h4>
                <p className="text-xs text-[#8b949e] leading-relaxed">{item.desc}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.tech.map((t, idx) => (
                  <span key={idx} className="px-2 py-1 bg-white/5 rounded text-[10px] text-white/50 border border-white/10 uppercase tracking-widest">{t}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 10 — QUICK FACTS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { val: '372M+', label: 'Repositories', desc: 'Exist on RepoSphere today.' },
          { val: '100%', label: 'Trackable', desc: 'Every code change is logged.' },
          { val: 'Standard', label: 'Industry', desc: 'Most projects use Git repos.' },
          { val: 'Global', label: 'Open Source', desc: 'Relies on repositories.' }
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-[#1C2128] border border-white/5 rounded-2xl space-y-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-1 h-full bg-green-500/20 group-hover:bg-green-500/50 transition-colors" />
            <div className="text-3xl font-black text-white">{stat.val}</div>
            <div className="text-xs font-bold text-green-400 uppercase tracking-widest">{stat.label}</div>
            <p className="text-[10px] text-[#8b949e]">{stat.desc}</p>
          </div>
        ))}
      </section>

      {/* SECTION 11 — INTERACTIVE MINI DEMO */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Repository Lifecycle</h2>
        
        <div className="flex flex-wrap justify-center gap-6 py-12 relative">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 -translate-y-1/2 hidden lg:block" />
          
          {[
            { label: 'Initialize', icon: Plus },
            { label: 'Add Files', icon: Code },
            { label: 'Commit', icon: History },
            { label: 'Push', icon: Share2 },
            { label: 'Collaborate', icon: Users },
            { label: 'Deploy', icon: Rocket }
          ].map((node, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center gap-4 relative z-10"
            >
              <div className="w-16 h-16 rounded-full bg-[#161B22] border-2 border-green-500/30 flex items-center justify-center bg-gradient-to-br from-[#161B22] to-[#0D1117] shadow-2xl group cursor-help">
                <node.icon className="w-6 h-6 text-green-400 group-hover:scale-125 transition-transform" />
              </div>
              <span className="text-xs font-bold text-white uppercase tracking-widest">{node.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 12 — MOTIVATIONAL CTA */}
      <section className="relative py-20 px-12 bg-gradient-to-br from-green-600 to-blue-700 rounded-[40px] overflow-hidden text-center group">
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white tracking-tight">Ready to Build Your First Repository?</h2>
            <p className="text-green-100/80 text-lg leading-relaxed">
              Repositories are the foundation of modern software development. Learning how to organize and manage repositories is the first step toward becoming a professional developer.
            </p>
          </div>
          <button 
            onClick={onNext}
            className="px-10 py-5 bg-white text-green-600 rounded-2xl font-bold text-xl hover:scale-105 transition-all shadow-2xl flex items-center gap-3 mx-auto group/btn"
          >
            Master Branching
            <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
};

const BranchesContent = ({ onNext }) => {
  return (
    <div className="space-y-24 pb-20">
      {/* SECTION 1 — HERO HEADER */}
      <section className="relative pt-10 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-yellow-500/10 rounded-full blur-[120px] animate-pulse" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 relative z-10"
        >
          <div className="flex justify-center flex-wrap gap-3">
            {['Core Git Concept', 'Collaboration Workflow', 'Beginner Friendly'].map((badge, i) => (
              <span key={i} className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-yellow-500/20">
                {badge}
              </span>
            ))}
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
              Branches
            </h1>
            <p className="text-xl text-[#8b949e] leading-relaxed max-w-2xl mx-auto">
              Learn how developers safely build features, fix bugs, and collaborate using Git branches.
            </p>
          </div>

          <div className="flex justify-center items-center gap-12 py-6 border-y border-white/5">
            <div className="flex items-center gap-2">
              <GitFork className="w-5 h-5 text-yellow-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Topic</span>
                <span className="text-[10px] text-[#8b949e]">Branching</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Book className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Difficulty</span>
                <span className="text-[10px] text-[#8b949e]">Beginner</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Time</span>
                <span className="text-[10px] text-[#8b949e]">14 mins</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 2 — WHAT IS A BRANCH? */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">What is a Branch?</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            A branch is an independent line of development inside a repository. It's like a parallel universe where you can change code without affecting the main project.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="p-8 bg-yellow-500/[0.03] border border-yellow-500/20 rounded-[32px] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <Info className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold text-white">The Analogy</h3>
              </div>
              <p className="text-yellow-100/60 text-lg italic leading-relaxed">
                "A branch is like creating a separate workspace for experimenting without touching the original project."
              </p>
              <p className="text-[#8b949e] text-sm leading-relaxed">
                Think of it like a "Save As" copy of your project that stays connected to the original, allowing you to merge your changes back when they're ready.
              </p>
            </div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="p-8 bg-gradient-to-br from-[#1C2128] to-[#0D1117] border border-white/10 rounded-[32px] relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-[40px] group-hover:bg-yellow-500/10 transition-colors" />
              <div className="relative z-10 space-y-4">
                <div className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Core Value</div>
                <h3 className="text-2xl font-black text-white leading-tight">
                  Branch = <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                    Safe Workspace for Development
                  </span>
                </h3>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-yellow-400/50 to-orange-400/50 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Zap, label: 'Build Features Safely' },
              { icon: Split, label: 'Experiment Freely' },
              { icon: AlertTriangle, label: 'Fix Bugs Independently' },
              { icon: Users, label: 'Collaborate Together' }
            ].map((item, i) => (
              <div key={i} className="p-6 bg-[#161B22] border border-white/5 rounded-2xl flex flex-col items-center gap-3 hover:bg-white/5 transition-all group text-center">
                <item.icon className="w-6 h-6 text-yellow-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — WHY DEVELOPERS USE BRANCHES */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Why Developers Use Branches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Rocket, title: 'Safe Feature Development', desc: 'Build complex features without ever breaking the production code that users see.' },
            { icon: Users, title: 'Parallel Collaboration', desc: 'Dozens of developers can work on the same project simultaneously in their own branches.' },
            { icon: Activity, title: 'Independent Bug Fixing', desc: 'Fix critical issues on a separate branch while development continues on other features.' },
            { icon: Split, title: 'Free Experimentation', desc: 'Test wild ideas safely. If it works, merge it. If it doesn’t, just delete the branch.' },
            { icon: Layers, title: 'Organized Workflow', desc: 'Keep your history clean and manageable by grouping related changes together.' },
            { icon: CheckCircle, title: 'Continuous Integration', desc: 'Automatically test each branch before it ever reaches the main codebase.' }
          ].map((feat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5, borderColor: 'rgba(234, 179, 8, 0.4)' }}
              className="p-6 bg-[#1C2128] border border-white/5 rounded-2xl group transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-colors" />
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feat.icon className="w-5 h-5 text-yellow-400" />
              </div>
              <h3 className="text-white font-bold mb-2">{feat.title}</h3>
              <p className="text-xs text-[#8b949e] leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 4 — MAIN BRANCH EXPLANATION */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">The Main Branch</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            The main branch (often called <code>main</code> or <code>master</code>) is the source of truth. It contains the stable, production-ready version of your project.
          </p>
        </div>

        <div className="max-w-4xl mx-auto p-12 bg-[#0D1117] border border-white/10 rounded-[40px] relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-yellow-500" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {[
                { label: 'Production Ready', desc: 'Code that is currently live for users.', color: 'bg-green-500' },
                { label: 'Stable State', desc: 'The project state that everyone starts from.', color: 'bg-blue-500' },
                { label: 'Central Hub', desc: 'Where all features eventually live.', color: 'bg-purple-500' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className={`w-1 shrink-0 ${item.color} rounded-full group-hover:scale-y-110 transition-transform`} />
                  <div>
                    <h4 className="text-white font-bold text-sm">{item.label}</h4>
                    <p className="text-xs text-[#8b949e]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative py-10 px-6 bg-white/[0.02] rounded-3xl border border-white/5">
              <div className="space-y-8 relative z-10">
                {/* Main Branch Line */}
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  <span className="text-sm font-black text-white tracking-widest uppercase">main</span>
                </div>
                
                {/* Sub Branches */}
                <div className="pl-6 space-y-6 relative">
                  <div className="absolute left-[5px] top-[-20px] bottom-0 w-px bg-white/10" />
                  
                  {[
                    { name: 'feature-login', color: 'bg-yellow-500' },
                    { name: 'feature-dashboard', color: 'bg-purple-500' },
                    { name: 'bugfix-auth', color: 'bg-red-500' }
                  ].map((branch, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4 relative"
                    >
                      <div className="absolute left-[-19px] top-1/2 -translate-y-1/2 w-4 h-px bg-white/10" />
                      <div className={`w-2 h-2 rounded-full ${branch.color}`} />
                      <span className="text-xs font-mono text-[#8b949e] group-hover:text-white transition-colors">{branch.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — HOW BRANCHES WORK */}
      <section className="space-y-16">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">How Branching Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Plus, title: '1. Create Branch', desc: 'Spawn a new development universe.' },
            { icon: RefreshCw, title: '2. Switch to Branch', desc: 'Enter your new workspace.' },
            { icon: Code, title: '3. Make Changes', desc: 'Write code safely in parallel.' },
            { icon: History, title: '4. Commit Changes', desc: 'Save progress in your branch.' },
            { icon: Cloud, title: '5. Push Branch', desc: 'Share your branch with GitHub.' },
            { icon: GitPullRequest, title: '6. Open Pull Request', desc: 'Ask to merge your work.' },
            { icon: CheckCircle, title: '7. Review & Approve', desc: 'Get team feedback.' },
            { icon: GitMerge, title: '8. Merge into Main', desc: 'Join the main code timeline.' }
          ].map((step, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -5 }}
              className="p-6 bg-[#161B22] border border-white/5 rounded-2xl space-y-3 group relative"
            >
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <step.icon className="w-5 h-5 text-yellow-400" />
              </div>
              <h4 className="text-white font-bold text-sm leading-tight">{step.title}</h4>
              <p className="text-[10px] text-[#8b949e]">{step.desc}</p>
              {i < 7 && <ArrowUpRight className="absolute top-4 right-4 w-3 h-3 text-[#8b949e]/30 hidden lg:block" />}
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 6 — REAL-WORLD DEVELOPMENT EXAMPLE */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">Real Developer Workflow</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            Imagine an e-commerce team building a store. Instead of everyone editing the same files, they create specialized branches.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { role: 'Developer A', task: 'Authentication', branch: 'feature-auth', color: 'border-yellow-500/30' },
            { role: 'Developer B', task: 'Payment System', branch: 'feature-payments', color: 'border-blue-500/30' },
            { role: 'Developer C', task: 'Bug Fixing', branch: 'bugfix-checkout', color: 'border-red-500/30' }
          ].map((dev, i) => (
            <div key={i} className={`p-8 bg-[#1C2128] border ${dev.color} rounded-[32px] space-y-4 relative overflow-hidden group shadow-2xl`}>
               <div className="flex items-center justify-between">
                 <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">{dev.role}</span>
                 <GitFork className="w-4 h-4 text-[#8b949e]/50" />
               </div>
               <h4 className="text-white font-bold text-lg">{dev.task}</h4>
               <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg border border-white/5 font-mono text-[10px] text-yellow-400">
                 <GitBranch className="w-3 h-3" />
                 {dev.branch}
               </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center gap-6 py-10">
           <div className="px-6 py-3 bg-white/5 rounded-full border border-white/10 text-xs font-bold text-white uppercase tracking-widest">Branches</div>
           <ArrowRight className="w-4 h-4 text-[#8b949e]" />
           <div className="px-6 py-3 bg-blue-500/20 rounded-full border border-blue-500/30 text-xs font-bold text-blue-400 uppercase tracking-widest">Pull Request</div>
           <ArrowRight className="w-4 h-4 text-[#8b949e]" />
           <div className="px-6 py-3 bg-green-500/20 rounded-full border border-green-500/30 text-xs font-bold text-green-400 uppercase tracking-widest">Merge into Main</div>
        </div>
      </section>

      {/* SECTION 7 — BRANCHING STRATEGIES */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Common Branching Strategies</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              icon: Layout, 
              title: 'Feature Branch', 
              desc: 'Every single new feature or bug fix gets its own temporary branch. The simplest and most popular workflow.' 
            },
            { 
              icon: RefreshCw, 
              title: 'Git Flow', 
              desc: 'A structured model using separate branches for features, releases, and hotfixes. Ideal for complex enterprise apps.' 
            },
            { 
              icon: Rocket, 
              title: 'Release Branches', 
              desc: 'Dedicated branches used only for preparing stable releases, allowing work on new features to continue independently.' 
            }
          ].map((strat, i) => (
            <div key={i} className="p-8 bg-[#161B22] border border-white/5 rounded-[32px] space-y-4 hover:border-yellow-500/30 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <strat.icon className="w-6 h-6 text-yellow-400" />
              </div>
              <h4 className="text-xl font-bold text-white">{strat.title}</h4>
              <p className="text-sm text-[#8b949e] leading-relaxed">{strat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 8 — MERGING BRANCHES */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Merging Branches</h2>
        
        <div className="max-w-3xl mx-auto p-12 bg-gradient-to-br from-[#1C2128] to-[#0D1117] border border-white/10 rounded-[40px] relative overflow-hidden text-center space-y-8 shadow-2xl">
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-white">The Handshake</h3>
            <p className="text-[#8b949e] leading-relaxed">
              When a feature is finished and tested, it's time to merge. This process combines your branch's history with the main branch's timeline.
            </p>
          </div>

          <div className="flex justify-center items-center gap-8 relative">
            <div className="space-y-4 z-10">
               <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto">
                 <GitBranch className="w-8 h-8 text-yellow-400" />
               </div>
               <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">feature-branch</span>
            </div>

            <div className="flex-1 flex flex-col items-center gap-2 relative">
               <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 -translate-y-1/2" />
               <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center relative z-20"
               >
                 <GitMerge className="w-5 h-5 text-blue-400" />
               </motion.div>
               <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-400/10 px-2 py-1 rounded">Pull Request</span>
            </div>

            <div className="space-y-4 z-10">
               <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
                 <Layout className="w-8 h-8 text-green-400" />
               </div>
               <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">main-branch</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9 — MERGE CONFLICTS */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">What Are Merge Conflicts?</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            Conflicts happen when two developers edit the same part of a file differently. Git stops the merge and asks you to decide which change is correct.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="p-8 bg-[#1C2128] border border-red-500/20 rounded-[32px] space-y-6 relative overflow-hidden shadow-2xl group">
             <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Developer A</span>
                <AlertTriangle className="w-4 h-4 text-red-400/50" />
             </div>
             <div className="bg-black/40 rounded-xl p-6 font-mono text-sm border border-white/5 relative">
                <div className="text-white/30 mb-2">1 | // Header.jsx</div>
                <div className="flex items-center gap-2 text-red-400">
                  <span className="text-white/30">2 |</span> 
                  <span className="bg-red-500/20 px-1 rounded">const color = 'blue';</span>
                </div>
             </div>
          </div>

          <div className="p-8 bg-[#1C2128] border border-green-500/20 rounded-[32px] space-y-6 relative overflow-hidden shadow-2xl group">
             <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Developer B</span>
                <CheckCircle className="w-4 h-4 text-green-400/50" />
             </div>
             <div className="bg-black/40 rounded-xl p-6 font-mono text-sm border border-white/5 relative">
                <div className="text-white/30 mb-2">1 | // Header.jsx</div>
                <div className="flex items-center gap-2 text-green-400">
                  <span className="text-white/30">2 |</span> 
                  <span className="bg-green-500/20 px-1 rounded">const color = 'green';</span>
                </div>
             </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-6 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl flex items-center gap-4">
          <Info className="w-6 h-6 text-yellow-400 shrink-0" />
          <p className="text-sm text-yellow-100/60 leading-relaxed italic">
            "Conflicts aren't errors—they're just questions. Git is asking: 'Which change should I keep?'"
          </p>
        </div>
      </section>

      {/* SECTION 10 — LOCAL VS REMOTE BRANCHES */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Local vs Remote Branches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-10 bg-[#161B22] border border-white/5 rounded-[40px] space-y-6 relative overflow-hidden">
             <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
               <Monitor className="w-7 h-7 text-yellow-400" />
             </div>
             <h3 className="text-2xl font-bold text-white">Local Branch</h3>
             <ul className="space-y-4 text-[#8b949e]">
               <li className="flex items-center gap-3"><CheckCircle className="w-4 h-4 text-yellow-400" /> <span className="text-sm">Exists only on your computer</span></li>
               <li className="flex items-center gap-3"><CheckCircle className="w-4 h-4 text-yellow-400" /> <span className="text-sm">Used for private development work</span></li>
               <li className="flex items-center gap-3"><CheckCircle className="w-4 h-4 text-yellow-400" /> <span className="text-sm">Not visible to teammates yet</span></li>
             </ul>
          </div>

          <div className="p-10 bg-[#161B22] border border-white/5 rounded-[40px] space-y-6 relative overflow-hidden">
             <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
               <Cloud className="w-7 h-7 text-blue-400" />
             </div>
             <h3 className="text-2xl font-bold text-white">Remote Branch</h3>
             <ul className="space-y-4 text-[#8b949e]">
               <li className="flex items-center gap-3"><CheckCircle className="w-4 h-4 text-blue-400" /> <span className="text-sm">Stored on RepoSphere servers</span></li>
               <li className="flex items-center gap-3"><CheckCircle className="w-4 h-4 text-blue-400" /> <span className="text-sm">Visible to your entire team</span></li>
               <li className="flex items-center gap-3"><CheckCircle className="w-4 h-4 text-blue-400" /> <span className="text-sm">Used for sharing and reviewing code</span></li>
             </ul>
          </div>
        </div>
      </section>

      {/* SECTION 11 — BRANCH COMMANDS */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Essential Git Branch Commands</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { cmd: 'git branch feature-login', desc: 'Create a new branch' },
            { cmd: 'git checkout feature-login', desc: 'Switch to a branch' },
            { cmd: 'git checkout -b feature-login', desc: 'Create and switch to a new branch' },
            { cmd: 'git push origin feature-login', desc: 'Upload branch to GitHub' },
            { cmd: 'git merge feature-login', desc: 'Merge a branch into current' },
            { cmd: 'git branch -d feature-login', desc: 'Delete a branch safely' }
          ].map((c, i) => (
            <div key={i} className="bg-[#1C2128] border border-white/5 rounded-2xl p-6 flex items-center justify-between group hover:border-yellow-500/30 transition-all shadow-xl">
              <div>
                <code className="text-yellow-400 font-mono text-sm">{c.cmd}</code>
                <p className="text-xs text-[#8b949e] mt-2">{c.desc}</p>
              </div>
              <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/5 rounded-md">
                <Copy className="w-4 h-4 text-[#8b949e]" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 12 — WHY BRANCHING IS POWERFUL */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Why Branching Changed Everything</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[
            { icon: Zap, title: 'Faster Dev', color: 'text-yellow-400' },
            { icon: Users, title: 'Better Collab', color: 'text-blue-400' },
            { icon: Shield, title: 'Safer Releases', color: 'text-green-400' },
            { icon: Rocket, title: 'CI/CD Ready', color: 'text-purple-400' },
            { icon: Split, title: 'Experiment', color: 'text-orange-400' }
          ].map((item, i) => (
            <motion.div 
              key={i} 
              whileHover={{ scale: 1.05 }}
              className="p-6 bg-[#1C2128] border border-white/5 rounded-2xl text-center space-y-4 shadow-xl group"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <h5 className="text-xs font-bold text-white uppercase tracking-widest">{item.title}</h5>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 13 — QUICK FACTS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { val: 'Lightweight', label: 'History', desc: 'Branches are just pointers.' },
          { val: 'Parallel', label: 'Universe', desc: 'Work on 100 things at once.' },
          { val: 'Safe', label: 'Playground', desc: 'Main stays stable forever.' },
          { val: 'Instant', label: 'Switching', desc: 'Move between contexts in ms.' }
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-[#1C2128] border border-white/5 rounded-2xl space-y-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-1 h-full bg-yellow-500/20 group-hover:bg-yellow-500/50 transition-colors" />
            <div className="text-2xl font-black text-white">{stat.val}</div>
            <div className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">{stat.label}</div>
            <p className="text-[10px] text-[#8b949e]">{stat.desc}</p>
          </div>
        ))}
      </section>

      {/* SECTION 14 — INTERACTIVE BRANCH VISUALIZER */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Branch Lifecycle</h2>
        
        <div className="max-w-4xl mx-auto py-20 relative px-10">
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/5 -translate-y-1/2" />
          
          <div className="flex flex-wrap justify-center gap-10">
            {[
              { label: 'main', icon: Layout, color: 'text-blue-500' },
              { label: 'Branch', icon: GitFork, color: 'text-yellow-500' },
              { label: 'Develop', icon: Code, color: 'text-purple-500' },
              { label: 'Commit', icon: History, color: 'text-yellow-500' },
              { label: 'Push', icon: Share2, color: 'text-blue-500' },
              { label: 'PR', icon: GitPullRequest, color: 'text-red-500' },
              { label: 'Merge', icon: GitMerge, color: 'text-green-500' }
            ].map((node, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-4 relative z-10"
              >
                <div className={`w-14 h-14 rounded-full bg-[#161B22] border-2 border-white/10 flex items-center justify-center bg-gradient-to-br from-[#161B22] to-[#0D1117] shadow-2xl group hover:border-yellow-500/50 transition-all`}>
                  <node.icon className={`w-6 h-6 ${node.color} group-hover:scale-125 transition-transform`} />
                </div>
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">{node.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 15 — MOTIVATIONAL CTA */}
      <section className="relative py-20 px-12 bg-gradient-to-br from-yellow-600 to-orange-700 rounded-[40px] overflow-hidden text-center group">
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white tracking-tight">Ready to Start Branching?</h2>
            <p className="text-yellow-100/80 text-lg leading-relaxed">
              Branches are one of Git's most powerful features. Mastering branching workflows helps developers build software safely, collaboratively, and efficiently.
            </p>
          </div>
          <button 
            onClick={onNext}
            className="px-10 py-5 bg-white text-yellow-600 rounded-2xl font-bold text-xl hover:scale-105 transition-all shadow-2xl flex items-center gap-3 mx-auto group/btn"
          >
            Review Code with PRs
            <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
};

const PullRequestsContent = ({ onNext }) => {
  return (
    <div className="space-y-32 pb-20">
      {/* SECTION 1 — HERO HEADER */}
      <section className="relative pt-10 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-500/10 rounded-full blur-[120px] animate-pulse" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 relative z-10"
        >
          <div className="flex justify-center flex-wrap gap-3">
            {['Collaboration Workflow', 'Code Review System', 'Team Development'].map((badge, i) => (
              <span key={i} className="px-3 py-1 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-red-500/20">
                {badge}
              </span>
            ))}
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
              Pull Requests
            </h1>
            <p className="text-xl text-[#8b949e] leading-relaxed max-w-2xl mx-auto">
              Learn how developers collaborate, review code, discuss changes, and safely merge features using Pull Requests.
            </p>
          </div>

          <div className="flex justify-center items-center gap-12 py-6 border-y border-white/5">
            <div className="flex items-center gap-2">
              <GitPullRequest className="w-5 h-5 text-red-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Topic</span>
                <span className="text-[10px] text-[#8b949e]">Pull Requests</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Book className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Difficulty</span>
                <span className="text-[10px] text-[#8b949e]">Beginner to Intermediate</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Time</span>
                <span className="text-[10px] text-[#8b949e]">18 mins</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 2 — WHAT IS A PULL REQUEST? */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">What is a Pull Request?</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            A Pull Request (PR) is a formal request to merge changes from one branch into another. It's the central hub for team discussion and code quality checks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="p-8 bg-red-500/[0.03] border border-red-500/20 rounded-[32px] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <Info className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white">The Analogy</h3>
              </div>
              <p className="text-red-100/60 text-lg italic leading-relaxed">
                "A Pull Request is like asking your team: 'Please review my work before adding it to the main project.'"
              </p>
              <p className="text-[#8b949e] text-sm leading-relaxed">
                Just as you wouldn't publish a book without an editor's review, developers don't merge code without a Pull Request review.
              </p>
            </div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="p-8 bg-gradient-to-br from-[#1C2128] to-[#0D1117] border border-white/10 rounded-[32px] relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-[40px] group-hover:bg-red-500/10 transition-colors" />
              <div className="relative z-10 space-y-4">
                <div className="text-xs font-bold text-red-400 uppercase tracking-widest">Master Formula</div>
                <h3 className="text-2xl font-black text-white leading-tight">
                  Pull Request = <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                    Review + Collab + Safe Merge
                  </span>
                </h3>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-red-400/50 to-orange-400/50 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Search, label: 'Review Code' },
              { icon: MessageSquare, label: 'Discuss Implementation' },
              { icon: AlertTriangle, label: 'Detect Bugs' },
              { icon: Shield, label: 'Safe Merging' }
            ].map((item, i) => (
              <div key={i} className="p-6 bg-[#161B22] border border-white/5 rounded-2xl flex flex-col items-center gap-3 hover:bg-white/5 transition-all group text-center">
                <item.icon className="w-6 h-6 text-red-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — WHY DEVELOPERS USE PULL REQUESTS */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Why Developers Use Pull Requests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Search, title: 'Code Review', desc: 'Ensure multiple eyes catch errors and suggest better ways to write logic.' },
            { icon: Users, title: 'Team Collaboration', desc: 'The PR becomes a forum for discussing architectural choices and design patterns.' },
            { icon: Activity, title: 'Bug Detection', desc: 'Identify edge cases and logical flaws before they hit production.' },
            { icon: Shield, title: 'Safe Merging', desc: 'Protect the main branch from broken code through required status checks.' },
            { icon: Book, title: 'Knowledge Sharing', desc: 'Junior developers learn from senior feedback, and seniors stay updated on the codebase.' },
            { icon: Zap, title: 'Quality Assurance', desc: 'Automated tests (CI) run on every PR to guarantee that nothing else broke.' }
          ].map((feat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5, borderColor: 'rgba(239, 68, 68, 0.4)' }}
              className="p-6 bg-[#1C2128] border border-white/5 rounded-2xl group transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors" />
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feat.icon className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-white font-bold mb-2">{feat.title}</h3>
              <p className="text-xs text-[#8b949e] leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 4 — PULL REQUEST WORKFLOW */}
      <section className="space-y-16">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Pull Request Workflow</h2>
        
        <div className="relative max-w-4xl mx-auto px-10">
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-red-500/50 via-blue-500/50 to-transparent hidden md:block" />
          
          <div className="space-y-12 relative">
            {[
              { icon: GitBranch, title: '1. Create Feature Branch', desc: 'Spawn a safe workspace from the latest main branch.' },
              { icon: Code, title: '2. Write Code', desc: 'Develop your feature or fix in isolation.' },
              { icon: GitCommit, title: '3. Commit Changes', desc: 'Save descriptive snapshots of your work.' },
              { icon: Cloud, title: '4. Push Branch to GitHub', desc: 'Upload your branch to the central servers.' },
              { icon: GitPullRequest, title: '5. Open Pull Request', desc: 'Formally request to merge your branch into main.' },
              { icon: MessageCircle, title: '6. Review & Discuss', desc: 'Receive feedback and refine your code.' },
              { icon: CheckCircle, title: '7. Approve Changes', desc: 'Get the "LGTM" (Looks Good To Me) from teammates.' },
              { icon: GitMerge, title: '8. Merge into Main', desc: 'Integrate the feature into the stable project.' },
              { icon: X, title: '9. Delete Branch', desc: 'Clean up the repository history.' }
            ].map((step, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                  <h4 className="text-white font-bold text-lg mb-1">{step.title}</h4>
                  <p className="text-sm text-[#8b949e] leading-relaxed">{step.desc}</p>
                </div>
                
                <div className="w-14 h-14 rounded-full bg-[#161B22] border-2 border-red-500/30 flex items-center justify-center relative z-10 bg-gradient-to-br from-[#161B22] to-[#0D1117] shadow-xl shrink-0">
                  <step.icon className="w-6 h-6 text-red-400" />
                  <div className="absolute -bottom-8 text-[10px] font-bold text-red-400/50 uppercase tracking-widest md:hidden">Step {i+1}</div>
                </div>
                
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 — REAL-WORLD TEAM EXAMPLE */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">Real Team Collaboration Example</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            See how a professional team handles a new "Login Feature" from start to finish.
          </p>
        </div>

        <div className="max-w-4xl mx-auto p-12 bg-[#0D1117] border border-white/10 rounded-[40px] relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px]" />
          
          <div className="space-y-12 relative z-10">
            <div className="flex justify-between items-center px-10">
              <div className="flex flex-col items-center gap-4">
                 <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                    <GitBranch className="w-8 h-8 text-yellow-400" />
                 </div>
                 <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">feature-login</span>
              </div>
              <motion.div 
                animate={{ x: [0, 20, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex flex-col items-center gap-2"
              >
                 <ArrowRight className="w-6 h-6 text-red-400" />
                 <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Open PR</span>
              </motion.div>
              <div className="flex flex-col items-center gap-4">
                 <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Search className="w-8 h-8 text-blue-400" />
                 </div>
                 <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">Code Review</span>
              </div>
              <motion.div 
                animate={{ x: [0, 20, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex flex-col items-center gap-2"
              >
                 <ArrowRight className="w-6 h-6 text-green-400" />
                 <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Approval</span>
              </motion.div>
              <div className="flex flex-col items-center gap-4">
                 <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <GitMerge className="w-8 h-8 text-green-400" />
                 </div>
                 <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">Merged to main</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/5 space-y-4">
                  <h4 className="text-white font-bold flex items-center gap-2">
                    <Users className="w-4 h-4 text-yellow-400" />
                    Developer's Goal
                  </h4>
                  <p className="text-xs text-[#8b949e] leading-relaxed">
                    "I built the auth logic. I'm opening a PR to make sure my security implementation is correct and follows our coding standards."
                  </p>
               </div>
               <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/5 space-y-4">
                  <h4 className="text-white font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    Reviewer's Goal
                  </h4>
                  <p className="text-xs text-[#8b949e] leading-relaxed">
                    "I'll check for performance bottlenecks and verify that the error handling is robust enough for our production environment."
                  </p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — ANATOMY OF A PULL REQUEST */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Inside a Pull Request</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Type, title: 'PR Title', desc: 'A clear, concise summary of the purpose of the PR.' },
            { icon: FileText, title: 'Description', desc: 'Detailed explanation of work done and how to test it.' },
            { icon: Box, title: 'Changed Files', desc: 'A count and list of every file touched in this branch.' },
            { icon: Code, title: 'Code Diff', desc: 'Side-by-side view showing lines added (+) and removed (-).' },
            { icon: MessageSquare, title: 'Comments', desc: 'In-line discussion attached to specific lines of code.' },
            { icon: Activity, title: 'Review Status', desc: 'Summary of team feedback (Approve/Reject).' },
            { icon: Shield, title: 'Checks & CI', desc: 'Results of automated tests, linting, and security scans.' },
            { icon: GitMerge, title: 'Merge Button', desc: 'The final action to move code into the target branch.' }
          ].map((comp, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-[#1C2128] border border-white/5 rounded-2xl group transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <comp.icon className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-white font-bold text-sm mb-2">{comp.title}</h3>
              <p className="text-[10px] text-[#8b949e] leading-relaxed">{comp.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 7 — CODE REVIEWS */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">Code Reviews</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            Reviewers don't just look for bugs—they check for readability, performance, security, and architectural consistency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="p-8 bg-green-500/[0.03] border border-green-500/20 rounded-[32px] space-y-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                 <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <h4 className="text-white font-bold">Approved</h4>
              <p className="text-xs text-[#8b949e] leading-relaxed">"The code looks solid, tests pass, and it follows our style guide. Ready to merge!"</p>
           </div>
           <div className="p-8 bg-yellow-500/[0.03] border border-yellow-500/20 rounded-[32px] space-y-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                 <Settings className="w-5 h-5 text-yellow-400" />
              </div>
              <h4 className="text-white font-bold">Changes Requested</h4>
              <p className="text-xs text-[#8b949e] leading-relaxed">"There are a few logic errors and a missing test case. Please fix these before we merge."</p>
           </div>
           <div className="p-8 bg-blue-500/[0.03] border border-blue-500/20 rounded-[32px] space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                 <MessageSquare className="w-5 h-5 text-blue-400" />
              </div>
              <h4 className="text-white font-bold">Comment Added</h4>
              <p className="text-xs text-[#8b949e] leading-relaxed">"Just a minor suggestion: we could use a ternary operator here for cleaner code."</p>
           </div>
        </div>

        <div className="max-w-2xl mx-auto p-8 bg-[#0D1117] border border-white/10 rounded-3xl space-y-6 shadow-xl">
           <h4 className="text-white font-bold text-xs uppercase tracking-widest text-[#8b949e]">Review Conversation</h4>
           <div className="space-y-4">
              <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                 <div className="w-8 h-8 rounded-full bg-blue-500/20 shrink-0" />
                 <div className="space-y-1">
                    <span className="text-xs font-bold text-white">Alex (Senior Dev)</span>
                    <p className="text-xs text-[#8b949e]">"Can we optimize this database query? It might be slow with 10k+ users."</p>
                 </div>
              </div>
              <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 ml-10">
                 <div className="w-8 h-8 rounded-full bg-yellow-500/20 shrink-0" />
                 <div className="space-y-1">
                    <span className="text-xs font-bold text-white">Sarah (Frontend Dev)</span>
                    <p className="text-xs text-[#8b949e]">"Good point! I'll add indexing to that field and push an update."</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* SECTION 8 — PULL REQUEST STATUS FLOW */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Pull Request Lifecycle</h2>
        <div className="flex flex-wrap justify-center gap-10 py-10 relative">
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/5 -translate-y-1/2 hidden lg:block" />
          {[
            { label: 'Draft', color: 'bg-gray-500', icon: FileText },
            { label: 'Open', color: 'bg-green-500', icon: GitPullRequest },
            { label: 'Reviewing', color: 'bg-blue-500', icon: Search },
            { label: 'Approved', color: 'bg-purple-500', icon: CheckCircle },
            { label: 'Merged', color: 'bg-red-500', icon: GitMerge },
            { label: 'Closed', color: 'bg-gray-700', icon: X }
          ].map((status, i) => (
            <motion.div 
              key={i} 
              whileHover={{ scale: 1.1 }}
              className="flex flex-col items-center gap-4 relative z-10"
            >
              <div className={`w-14 h-14 rounded-full ${status.color}/20 border-2 border-${status.color}/50 flex items-center justify-center bg-[#0D1117] shadow-xl group cursor-help`}>
                 <status.icon className={`w-6 h-6 text-white`} />
              </div>
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">{status.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 9 — MERGING STRATEGIES */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Merging Strategies</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { title: 'Merge Commit', desc: 'Preserves the entire history of the feature branch. Good for tracking complex development timelines.', icon: GitMerge },
             { title: 'Squash & Merge', desc: 'Combines all commits into a single clean commit on main. Perfect for keeping the main branch history readable.', icon: Box },
             { title: 'Rebase & Merge', desc: 'Moves the entire feature branch history to the front of main. Creates a perfectly linear project timeline.', icon: RefreshCw }
           ].map((strat, i) => (
             <div key={i} className="p-10 bg-[#161B22] border border-white/5 rounded-[40px] space-y-6 group hover:border-red-500/30 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <strat.icon className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white">{strat.title}</h3>
                <p className="text-sm text-[#8b949e] leading-relaxed">{strat.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* SECTION 11 — AUTOMATION & CI/CD */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Automation in Pull Requests</h2>
        <div className="max-w-4xl mx-auto p-12 bg-[#0D1117] border border-white/10 rounded-[40px] space-y-12 relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-blue-500 to-green-500" />
           <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative">
              <div className="flex flex-col items-center gap-3">
                 <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <GitPullRequest className="w-8 h-8 text-red-400" />
                 </div>
                 <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">PR Opened</span>
              </div>
              <ArrowRight className="w-6 h-6 text-[#8b949e] hidden md:block" />
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[
                   { label: 'Unit Tests', icon: CheckCircle, color: 'text-green-400' },
                   { icon: Layers, label: 'Linting', color: 'text-blue-400' },
                   { icon: Shield, label: 'Security', color: 'text-red-400' },
                   { icon: Zap, label: 'Preview', color: 'text-yellow-400' }
                 ].map((check, i) => (
                   <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center space-y-2 group hover:scale-105 transition-transform">
                      <check.icon className={`w-5 h-5 ${check.color} mx-auto`} />
                      <span className="text-[8px] font-bold text-white uppercase tracking-widest">{check.label}</span>
                   </div>
                 ))}
              </div>
              <ArrowRight className="w-6 h-6 text-[#8b949e] hidden md:block" />
              <div className="flex flex-col items-center gap-3">
                 <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <Rocket className="w-8 h-8 text-green-400" />
                 </div>
                 <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Ready!</span>
              </div>
           </div>
        </div>
      </section>

      {/* SECTION 13 — COMMON PULL REQUEST MISTAKES */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Common Beginner Mistakes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Huge PRs', desc: 'Merging 50 files at once is impossible to review. Keep PRs focused on one goal.', tip: 'Solution: Break changes into smaller PRs.' },
            { title: 'No Description', desc: 'If you don’t explain your work, reviewers have to guess your intent.', tip: 'Solution: Use a PR template.' },
            { title: 'Ignoring Feedback', desc: 'Pull Requests are a conversation. Ignoring suggestions reduces code quality.', tip: 'Solution: Discuss and implement feedback.' },
            { title: 'Merging Without CI', desc: 'Ignoring failed tests will break the main project for everyone.', tip: 'Solution: Fix all red tests before merging.' },
            { title: 'Poor Commit History', desc: 'Messages like "fixed stuff" make it hard to understand the evolution of the PR.', tip: 'Solution: Use descriptive commit messages.' }
          ].map((mistake, i) => (
            <div key={i} className="p-8 bg-red-500/[0.02] border border-red-500/10 rounded-[32px] space-y-4 hover:border-red-500/30 transition-all">
               <div className="flex items-center gap-3">
                 <X className="w-5 h-5 text-red-400" />
                 <h4 className="text-white font-bold">{mistake.title}</h4>
               </div>
               <p className="text-xs text-[#8b949e] leading-relaxed">{mistake.desc}</p>
               <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-[10px] text-red-200/60 italic">
                  💡 {mistake.tip}
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 15 — GITHUB-STYLE PULL REQUEST UI */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Example Pull Request Interface</h2>
        <div className="max-w-4xl mx-auto bg-[#0D1117] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
           {/* PR Header */}
           <div className="p-8 border-b border-white/10 space-y-4 bg-[#161B22]/50">
              <div className="flex items-center gap-4 text-xs">
                 <span className="px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full font-bold">Open</span>
                 <span className="text-[#8b949e] font-mono">alex opened this PR 2 hours ago • 4 commits</span>
              </div>
              <h1 className="text-3xl font-bold text-white leading-tight">Add Responsive Contact Page Feature #42</h1>
              <div className="flex items-center gap-2 text-sm">
                 <div className="px-2 py-1 bg-white/5 border border-white/10 rounded font-mono text-blue-400">feature-contact-page</div>
                 <ArrowRight className="w-3 h-3 text-[#8b949e]" />
                 <div className="px-2 py-1 bg-white/5 border border-white/10 rounded font-mono text-white">main</div>
              </div>
           </div>

           {/* PR Body */}
           <div className="grid grid-cols-1 lg:grid-cols-4">
              <div className="lg:col-span-3 p-8 space-y-8 border-r border-white/10">
                 <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white border-b border-white/10 pb-2">Description</h4>
                    <p className="text-sm text-[#8b949e] leading-relaxed">
                      This PR adds a fully responsive contact section to the portfolio website. It includes a working form with validation and a Google Maps integration.
                    </p>
                 </div>
                 
                 <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                       <h4 className="text-sm font-bold text-white">Review Status</h4>
                       <span className="text-[10px] text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approved by Sarah</span>
                    </div>
                    <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl space-y-2">
                       <div className="flex items-center gap-2 text-green-400 font-bold text-xs">
                          <CheckCircle className="w-4 h-4" />
                          All checks have passed
                       </div>
                       <p className="text-[10px] text-green-100/40">14 successful checks completed</p>
                    </div>
                 </div>

                 <button className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-black text-lg shadow-xl shadow-green-500/10 transition-all flex items-center justify-center gap-3">
                    <GitMerge className="w-6 h-6" />
                    Merge Pull Request
                 </button>
              </div>

              <div className="p-6 space-y-8 bg-[#161B22]/20">
                 <div className="space-y-4">
                    <h5 className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">Reviewers</h5>
                    <div className="flex flex-col gap-3">
                       <div className="flex items-center gap-2 text-xs text-white">
                          <div className="w-6 h-6 rounded-full bg-blue-500/20" /> Sarah <CheckCircle className="w-3 h-3 text-green-400 ml-auto" />
                       </div>
                       <div className="flex items-center gap-2 text-xs text-[#8b949e]">
                          <div className="w-6 h-6 rounded-full bg-gray-500/20" /> Alex (Waiting)
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* HANDS-ON PRACTICAL EXAMPLE */}
      <section className="space-y-16 pt-20 border-t border-white/5">
        <div className="text-center space-y-4">
          <div className="flex justify-center flex-wrap gap-3">
            {['Practical Learning', 'Real Workflow', 'Beginner Friendly'].map((badge, i) => (
              <span key={i} className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-500/20">
                {badge}
              </span>
            ))}
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight">Hands-On Pull Request Example</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            Learn Pull Requests step-by-step using a real project example and actual Git commands.
          </p>
        </div>

        {/* Practical Step-by-Step */}
        <div className="space-y-32">
           {/* PART 1 — PROJECT SETUP */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                 <h3 className="text-2xl font-bold text-white">1. Project Setup</h3>
                 <p className="text-[#8b949e] leading-relaxed">
                    Imagine we are building a simple portfolio website project. The project already exists on RepoSphere and we want to add a new feature safely.
                 </p>
                 <div className="p-6 bg-[#0D1117] border border-white/10 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 text-xs text-[#8b949e] border-b border-white/5 pb-2">
                       <FolderOpen className="w-4 h-4" />
                       portfolio-website/
                    </div>
                    <div className="pl-6 space-y-2 font-mono text-[10px]">
                       <div className="flex items-center gap-2 text-[#8b949e]"><FileCode className="w-3 h-3 text-blue-400" /> index.html</div>
                       <div className="flex items-center gap-2 text-[#8b949e]"><FileText className="w-3 h-3 text-purple-400" /> styles.css</div>
                       <div className="flex items-center gap-2 text-[#8b949e]"><FileCode className="w-3 h-3 text-yellow-400" /> app.js</div>
                       <div className="flex items-center gap-2 text-[#8b949e]"><FileText className="w-3 h-3 text-green-400" /> README.md</div>
                    </div>
                 </div>
              </div>
              <div className="p-8 bg-blue-500/5 border border-blue-500/20 rounded-[40px] text-center space-y-4 relative overflow-hidden group">
                 <Terminal className="w-12 h-12 text-blue-400 mx-auto" />
                 <h4 className="text-white font-bold">Lab Environment</h4>
                 <p className="text-xs text-[#8b949e]">We will use a simulated terminal to perform real Git commands.</p>
              </div>
           </div>

           {/* PART 2 & 3 — CLONE & BRANCH */}
           <div className="space-y-12">
              <div className="space-y-6 max-w-2xl">
                 <h3 className="text-2xl font-bold text-white">2. Clone & Branch</h3>
                 <p className="text-[#8b949e] leading-relaxed">
                    First, download the project and create a new feature branch so our changes don't affect the main project immediately.
                 </p>
              </div>
              
              <div className="space-y-6">
                 <div className="p-6 bg-[#0D1117] border border-white/10 rounded-2xl space-y-6 group shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                       <Terminal className="w-5 h-5 text-blue-400" />
                    </div>
                    
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Command: Clone</div>
                          <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-sm text-green-400">
                             <code>git clone https://github.com/user/portfolio-website.git</code>
                             <Copy className="w-4 h-4 text-[#8b949e] hover:text-white cursor-pointer transition-colors" />
                          </div>
                       </div>
                       
                       <div className="space-y-2">
                          <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Command: Change Directory</div>
                          <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-sm text-green-400">
                             <code>cd portfolio-website</code>
                             <Copy className="w-4 h-4 text-[#8b949e] hover:text-white cursor-pointer transition-colors" />
                          </div>
                       </div>

                       <div className="space-y-2 pt-4 border-t border-white/5">
                          <div className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">Command: Create Branch</div>
                          <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-sm text-yellow-400">
                             <code>git checkout -b feature-contact-page</code>
                             <Copy className="w-4 h-4 text-[#8b949e] hover:text-white cursor-pointer transition-colors" />
                          </div>
                          <p className="text-[10px] text-[#8b949e] italic">This creates and switches to a new branch for the contact page feature.</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* PART 4 & 5 — MAKE CHANGES & STATUS */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 order-2 md:order-1">
                 <div className="p-6 bg-[#0D1117] border border-white/10 rounded-2xl space-y-4">
                    <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Command: Status</div>
                    <div className="p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-xs">
                       <div className="text-white">On branch feature-contact-page</div>
                       <div className="text-[#8b949e] mt-2">Changes not staged for commit:</div>
                       <div className="text-red-400 mt-1 pl-4">modified: index.html</div>
                       <div className="text-red-400 pl-4">modified: styles.css</div>
                    </div>
                 </div>
              </div>
              <div className="space-y-6 order-1 md:order-2">
                 <h3 className="text-2xl font-bold text-white">3. Make Changes & Verify</h3>
                 <p className="text-[#8b949e] leading-relaxed">
                    Now add the new Contact section code to <code>index.html</code>. You can use <code>git status</code> to see exactly which files Git has tracked as "modified."
                 </p>
                 <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-center gap-4">
                    <AlertTriangle className="w-6 h-6 text-blue-400 shrink-0" />
                    <p className="text-xs text-[#8b949e]">Always run <code>git status</code> before staging to ensure you're not accidentally including temporary files.</p>
                 </div>
              </div>
           </div>

           {/* PART 6 & 7 — STAGE & COMMIT */}
           <div className="space-y-12">
              <div className="text-center space-y-4">
                 <h3 className="text-2xl font-bold text-white">4. Stage & Commit</h3>
                 <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
                    Staging tells Git which changes to include in the next "snapshot." Committing then saves that snapshot permanently in your history.
                 </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="p-8 bg-[#161B22] border border-white/10 rounded-[40px] space-y-6">
                    <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Action: Staging</div>
                    <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-sm text-green-400">
                       <code>git add .</code>
                    </div>
                    <div className="flex flex-col items-center gap-4 py-4">
                       <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] text-[#8b949e]">Working Dir</div>
                       <ArrowDown className="w-4 h-4 text-red-400" />
                       <div className="px-4 py-2 bg-red-400/20 border border-red-400/30 rounded-lg text-[10px] text-red-400 font-bold">Staging Area</div>
                    </div>
                 </div>

                 <div className="p-8 bg-[#161B22] border border-white/10 rounded-[40px] space-y-6">
                    <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Action: Committing</div>
                    <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-sm text-blue-400">
                       <code>git commit -m "Added contact page section"</code>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                       <div className="p-3 bg-green-500/5 border border-green-500/10 rounded-xl space-y-1">
                          <span className="text-[8px] font-bold text-green-400 uppercase tracking-widest">✅ Good Message</span>
                          <p className="text-[10px] text-white">"Added responsive contact form"</p>
                       </div>
                       <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl space-y-1">
                          <span className="text-[8px] font-bold text-red-400 uppercase tracking-widest">❌ Bad Message</span>
                          <p className="text-[10px] text-white">"stuff changed"</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* PART 8 & 9 — PUSH & PR */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                 <h3 className="text-2xl font-bold text-white">5. Push & Open PR</h3>
                 <p className="text-[#8b949e] leading-relaxed">
                    Now upload your local feature branch to GitHub. Once pushed, GitHub will automatically suggest opening a Pull Request.
                 </p>
                 <div className="p-6 bg-[#0D1117] border border-white/10 rounded-2xl space-y-4 shadow-xl">
                    <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Command: Push</div>
                    <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-sm text-green-400">
                       <code>git push origin feature-contact-page</code>
                    </div>
                 </div>
              </div>
              <div className="p-8 bg-gradient-to-br from-red-600 to-red-800 rounded-[40px] text-center space-y-6 shadow-2xl relative overflow-hidden group">
                 <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <GitPullRequest className="w-16 h-16 text-white mx-auto animate-bounce" />
                 <div className="space-y-2">
                    <h4 className="text-2xl font-black text-white">GitHub Prompt</h4>
                    <p className="text-red-100/80 text-sm">"feature-contact-page had recent pushes. Compare & pull request"</p>
                 </div>
                 <button className="px-6 py-3 bg-white text-red-600 rounded-xl font-bold text-sm shadow-xl">Create Pull Request</button>
              </div>
           </div>

           {/* PART 11 — MERGE & CLEANUP */}
           <div className="space-y-12">
              <div className="text-center space-y-4">
                 <h3 className="text-2xl font-bold text-white">6. Merge & Cleanup</h3>
                 <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
                    After your team approves the PR, merge it into <code>main</code> and delete the feature branch to keep your workspace tidy.
                 </p>
              </div>
              
              <div className="max-w-3xl mx-auto p-12 bg-white/[0.02] border border-white/10 rounded-[40px] relative overflow-hidden flex flex-col items-center gap-8 shadow-2xl">
                 <div className="flex items-center gap-12">
                    <div className="flex flex-col items-center gap-3">
                       <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                          <GitBranch className="w-6 h-6 text-yellow-400" />
                       </div>
                       <span className="text-[10px] text-[#8b949e] font-mono">feature-branch</span>
                    </div>
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                       <GitMerge className="w-8 h-8 text-green-400" />
                    </motion.div>
                    <div className="flex flex-col items-center gap-3">
                       <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                          <Layout className="w-6 h-6 text-blue-400" />
                       </div>
                       <span className="text-[10px] text-[#8b949e] font-mono">main</span>
                    </div>
                 </div>

                 <div className="w-full space-y-4 pt-8 border-t border-white/5">
                    <div className="text-[10px] font-bold text-red-400 uppercase tracking-widest text-center">Final Cleanup Command</div>
                    <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-sm text-red-400 max-w-sm mx-auto">
                       <code>git branch -d feature-contact-page</code>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* SECTION 18 — MOTIVATIONAL CTA */}
      <section className="relative py-20 px-12 bg-gradient-to-br from-red-600 to-orange-700 rounded-[40px] overflow-hidden text-center group shadow-[0_0_50px_rgba(239,68,68,0.2)]">
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white tracking-tight leading-tight">Ready to Collaborate Like Real Developers?</h2>
            <p className="text-red-100/80 text-lg leading-relaxed">
              Pull Requests are the heart of modern team collaboration. Mastering Pull Requests helps developers build software safely, efficiently, and professionally.
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className="px-10 py-5 bg-white text-red-600 rounded-2xl font-bold text-xl shadow-2xl flex items-center gap-3 mx-auto group/btn transition-all"
          >
            Explore Collaboration
            <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </section>
    </div>
  );
};

const CollaboratorsContent = ({ onNext }) => {
  return (
    <div className="space-y-32 pb-20">
      {/* SECTION 1 — HERO HEADER */}
      <section className="relative pt-10 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 relative z-10"
        >
          <div className="flex justify-center flex-wrap gap-3">
            {['Team Collaboration', 'Repository Access', 'Real Developer Workflow'].map((badge, i) => (
              <span key={i} className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-500/20">
                {badge}
              </span>
            ))}
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
              Collaborators
            </h1>
            <p className="text-xl text-[#8b949e] leading-relaxed max-w-2xl mx-auto">
              Learn how developers work together on repositories using GitHub collaboration workflows.
            </p>
          </div>

          <div className="flex justify-center items-center gap-12 py-6 border-y border-white/5">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Topic</span>
                <span className="text-[10px] text-[#8b949e]">Collaborators</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Book className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Difficulty</span>
                <span className="text-[10px] text-[#8b949e]">Beginner to Intermediate</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Time</span>
                <span className="text-[10px] text-[#8b949e]">16 mins</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 2 — WHAT ARE COLLABORATORS? */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">What Are Collaborators?</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            Collaborators are users who are granted explicit permission to work on a repository together. They are the members of your project's inner circle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="p-8 bg-indigo-500/[0.03] border border-indigo-500/20 rounded-[32px] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <Info className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white">The Analogy</h3>
              </div>
              <p className="text-indigo-100/60 text-lg italic leading-relaxed">
                "A collaborator is like a teammate invited to work inside a shared project workspace."
              </p>
              <p className="text-[#8b949e] text-sm leading-relaxed">
                Think of your repository as a high-security lab. You don't let just anyone in—you specifically invite trusted colleagues and give them a keycard (access permissions).
              </p>
            </div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="p-8 bg-gradient-to-br from-[#1C2128] to-[#0D1117] border border-white/10 rounded-[32px] relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] group-hover:bg-indigo-500/10 transition-colors" />
              <div className="relative z-10 space-y-4">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Team Definition</div>
                <h3 className="text-2xl font-black text-white leading-tight">
                  Collaborators = <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
                    Shared Dev + Teamwork + Code
                  </span>
                </h3>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-400/50 to-blue-400/50 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Code, label: 'Push Changes' },
              { icon: Split, label: 'Create Branches' },
              { icon: GitPullRequest, label: 'Open PRs' },
              { icon: Search, label: 'Review Code' }
            ].map((item, i) => (
              <div key={i} className="p-6 bg-[#161B22] border border-white/5 rounded-2xl flex flex-col items-center gap-3 hover:bg-white/5 transition-all group text-center">
                <item.icon className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — WHY COLLABORATION MATTERS */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Why Collaboration is Important</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Users, title: 'Team Development', desc: 'Allow multiple developers to contribute simultaneously to the same codebase without chaos.' },
            { icon: Rocket, title: 'Faster Shipping', desc: 'Divide tasks across teammates to build complex features in a fraction of the time.' },
            { icon: Search, title: 'Code Reviews', desc: 'Maintain high quality by having peers review and validate each other’s contributions.' },
            { icon: Book, title: 'Shared Knowledge', desc: 'Avoid "knowledge silos" by ensuring multiple people understand every part of the project.' },
            { icon: Settings, title: 'Project Management', desc: 'Integrate issues, tasks, and project boards directly with the people writing the code.' },
            { icon: Globe, title: 'Global Communities', desc: 'Leverage the power of open-source to build software with contributors from around the world.' }
          ].map((feat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5, borderColor: 'rgba(99, 102, 241, 0.4)' }}
              className="p-6 bg-[#1C2128] border border-white/5 rounded-2xl group transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feat.icon className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-white font-bold mb-2">{feat.title}</h3>
              <p className="text-xs text-[#8b949e] leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 4 — REPOSITORY ACCESS & PERMISSIONS */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">Repository Access & Permissions</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            GitHub uses Role-Based Access Control (RBAC) to ensure that only the right people can make critical changes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[
             { role: 'Read', icon: Lock, desc: 'Can view code, open issues, and discuss PRs, but cannot change files.', color: 'text-blue-400' },
             { role: 'Write', icon: Edit3, desc: 'Can push code, create branches, and manage PRs directly.', color: 'text-green-400' },
             { role: 'Admin', icon: Settings, desc: 'Full control over settings, webhooks, and adding new collaborators.', color: 'text-purple-400' },
             { role: 'Owner', icon: ShieldCheck, desc: 'Highest authority. Can delete the repo and manage billing/org settings.', color: 'text-indigo-400' }
           ].map((item, i) => (
             <motion.div 
               key={i} 
               whileHover={{ y: -10 }}
               className="p-8 bg-[#161B22] border border-white/5 rounded-[40px] space-y-6 relative overflow-hidden group shadow-2xl"
             >
                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                   <item.icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <div className="space-y-2">
                   <h4 className="text-2xl font-black text-white uppercase tracking-tight">{item.role}</h4>
                   <p className="text-xs text-[#8b949e] leading-relaxed">{item.desc}</p>
                </div>
                <div className="absolute top-4 right-8 opacity-10 group-hover:opacity-100 transition-opacity">
                   <Shield className={`w-12 h-12 ${item.color}`} />
                </div>
             </motion.div>
           ))}
        </div>
      </section>

      {/* SECTION 5 — HOW TEAM COLLABORATION WORKS */}
      <section className="space-y-16">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">How Teams Collaborate on RepoSphere</h2>
        
        <div className="max-w-4xl mx-auto py-20 relative px-10 bg-[#0D1117] border border-white/10 rounded-[60px] shadow-2xl">
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent -translate-y-1/2 hidden lg:block" />
          
          <div className="flex flex-wrap justify-center gap-10">
            {[
              { label: 'Project Init', icon: Rocket, color: 'text-blue-500' },
              { label: 'Invite Team', icon: UserPlus, color: 'text-indigo-500' },
              { label: 'New Branches', icon: GitBranch, color: 'text-yellow-500' },
              { label: 'Push Changes', icon: Cloud, color: 'text-purple-500' },
              { label: 'Pull Request', icon: GitPullRequest, color: 'text-red-500' },
              { label: 'Peer Review', icon: Search, color: 'text-blue-400' },
              { label: 'Merge Code', icon: GitMerge, color: 'text-green-500' }
            ].map((node, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-4 relative z-10"
              >
                <div className={`w-16 h-16 rounded-full bg-[#161B22] border-2 border-white/10 flex items-center justify-center bg-gradient-to-br from-[#161B22] to-[#0D1117] shadow-2xl group hover:border-indigo-500/50 transition-all`}>
                  <node.icon className={`w-6 h-6 ${node.color} group-hover:scale-125 transition-transform`} />
                </div>
                <span className="text-[10px] font-bold text-white uppercase tracking-widest text-center max-w-[80px]">{node.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — REAL DEVELOPMENT TEAM EXAMPLE */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">Real Development Team Example</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            Imagine a team building a modern food delivery application. Everyone has a specialized role but works on the same repository.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {[
             { name: 'Alice', role: 'Authentication', branch: 'feature-auth', color: 'border-yellow-500/30' },
             { name: 'Bob', role: 'Payment System', branch: 'feature-payments', color: 'border-blue-500/30' },
             { name: 'Charlie', role: 'UI Design', branch: 'feature-ui', color: 'border-purple-500/30' },
             { name: 'David', role: 'Backend APIs', branch: 'feature-api', color: 'border-red-500/30' }
           ].map((dev, i) => (
             <div key={i} className={`p-6 bg-[#1C2128] border ${dev.color} rounded-[32px] space-y-4 relative overflow-hidden group shadow-xl hover:scale-105 transition-all`}>
                <div className="flex items-center justify-between">
                   <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-xs text-white">
                      {dev.name[0]}
                   </div>
                   <span className="text-[8px] font-bold text-[#8b949e] uppercase tracking-widest">{dev.name}</span>
                </div>
                <div>
                   <h4 className="text-white font-bold text-sm">{dev.role}</h4>
                   <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-[#8b949e]">
                      <GitBranch className="w-3 h-3" />
                      {dev.branch}
                   </div>
                </div>
             </div>
           ))}
        </div>

        <div className="flex justify-center items-center gap-6 py-10 bg-white/[0.02] border border-white/5 rounded-3xl max-w-2xl mx-auto">
           <div className="text-center">
              <span className="block text-2xl font-black text-white">4</span>
              <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">Branches</span>
           </div>
           <ArrowRight className="w-4 h-4 text-[#8b949e]" />
           <div className="text-center">
              <span className="block text-2xl font-black text-white">4</span>
              <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">Pull Requests</span>
           </div>
           <ArrowRight className="w-4 h-4 text-[#8b949e]" />
           <div className="text-center">
              <span className="block text-2xl font-black text-white">1</span>
              <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">Main Codebase</span>
           </div>
        </div>
      </section>

      {/* SECTION 7 — INVITING COLLABORATORS */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">How to Add Collaborators</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
           <div className="space-y-6">
              {[
                { step: '1', title: 'Open Settings', desc: 'Navigate to the repository you own.' },
                { step: '2', title: 'Select Collaborators', desc: 'Click on "Collaborators" in the left sidebar.' },
                { step: '3', title: 'Search & Invite', desc: 'Enter the username or email of your teammate.' },
                { step: '4', title: 'Assign Role', desc: 'Choose the appropriate permission level.' }
              ].map((s, i) => (
                <div key={i} className="flex gap-4 group">
                   <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 font-bold text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      {s.step}
                   </div>
                   <div>
                      <h4 className="text-white font-bold">{s.title}</h4>
                      <p className="text-xs text-[#8b949e]">{s.desc}</p>
                   </div>
                </div>
              ))}
           </div>

           <div className="p-8 bg-[#0D1117] border border-white/10 rounded-[40px] shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500" />
              <h5 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">GitHub Interface Mockup</h5>
              <div className="space-y-4">
                 <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Search className="w-4 h-4 text-[#8b949e]" />
                       <span className="text-xs text-[#8b949e]">Search by username or email...</span>
                    </div>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-[10px]">Add member</button>
                 </div>
                 
                 <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between opacity-50">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-blue-500/20" />
                       <div className="space-y-0.5">
                          <div className="text-xs font-bold text-white">Sarah Jenkins</div>
                          <div className="text-[8px] text-[#8b949e]">Pending Invite</div>
                       </div>
                    </div>
                    <span className="text-[8px] font-bold text-yellow-400 uppercase tracking-widest px-2 py-0.5 bg-yellow-400/10 rounded">Collaborator</span>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* SECTION 9 — COMMUNICATION & CODE REVIEWS */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Communication is Key</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[
             { icon: MessageCircle, text: '"Can you optimize this function?"', sub: 'Performance feedback' },
             { icon: AlertTriangle, text: '"Please fix merge conflicts."', sub: 'Workflow coordination' },
             { icon: CheckCircle, text: '"Looks good to merge!"', sub: 'Validation & Approval' },
             { icon: Monitor, text: '"Let\'s improve mobile view."', sub: 'UX/UI consistency' }
           ].map((msg, i) => (
             <motion.div 
              key={i} 
              whileHover={{ y: -5 }}
              className="p-6 bg-[#161B22] border border-white/5 rounded-2xl space-y-4 relative overflow-hidden group shadow-xl"
             >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <msg.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <p className="text-xs text-white font-medium italic leading-relaxed">{msg.text}</p>
                <div className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest">{msg.sub}</div>
             </motion.div>
           ))}
        </div>
      </section>

      {/* SECTION 10 — HANDLING MERGE CONFLICTS */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">Handling Merge Conflicts</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            Conflicts happen when two collaborators edit the same part of a file differently. It's a normal part of development.
          </p>
        </div>

        <div className="max-w-4xl mx-auto p-10 bg-[#0D1117] border border-red-500/20 rounded-[40px] shadow-2xl space-y-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-[40px]" />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                 <div className="flex items-center gap-2 text-red-400 font-bold text-[10px] uppercase tracking-widest">
                    <User className="w-3 h-3" /> Alice's Change
                 </div>
                 <div className="p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-xs">
                    <span className="text-red-400">const color = 'blue';</span>
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center gap-2 text-green-400 font-bold text-[10px] uppercase tracking-widest">
                    <User className="w-3 h-3" /> Bob's Change
                 </div>
                 <div className="p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-xs">
                    <span className="text-green-400">const color = 'green';</span>
                 </div>
              </div>
           </div>
           <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center gap-4">
              <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
              <p className="text-xs text-[#8b949e] leading-relaxed italic">
                "Git stops the merge and says: 'I don't know which color you want. Please choose one!'"
              </p>
           </div>
        </div>
      </section>

      {/* SECTION 12 — COLLABORATION BEST PRACTICES */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Collaboration Best Practices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Meaningful Branch Names', desc: 'Use "feature-login" instead of "stuff-1".', icon: GitBranch },
            { title: 'Clear Commit Messages', desc: 'Describe *what* and *why* you changed.', icon: GitCommit },
            { title: 'Review Code Carefully', desc: 'Check logic, performance, and readability.', icon: Search },
            { title: 'Communicate Respectfully', desc: 'Be kind and constructive in PR discussions.', icon: MessageCircle },
            { title: 'Small Focused PRs', desc: 'Fix one thing at a time for easier reviews.', icon: GitPullRequest },
            { title: 'Pull Changes Frequently', desc: 'Stay in sync to avoid big merge conflicts.', icon: RefreshCw }
          ].map((item, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -5 }}
              className="p-8 bg-indigo-500/[0.02] border border-indigo-500/10 rounded-[32px] space-y-4 hover:border-indigo-500/30 transition-all shadow-xl"
            >
               <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-indigo-400" />
               </div>
               <h4 className="text-white font-bold">{item.title}</h4>
               <p className="text-xs text-[#8b949e] leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HANDS-ON PRACTICAL EXAMPLE */}
      <section className="space-y-16 pt-20 border-t border-white/5">
        <div className="text-center space-y-4">
          <div className="flex justify-center flex-wrap gap-3">
            {['Practical Learning', 'Real Workflow', 'Beginner Friendly'].map((badge, i) => (
              <span key={i} className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-500/20">
                {badge}
              </span>
            ))}
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight">Hands-On Collaboration Example</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            Learn real GitHub collaboration using practical repository and branch workflows.
          </p>
        </div>

        <div className="space-y-32">
           {/* PART 1 & 2 — PROJECT SETUP & INIT */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                 <h3 className="text-2xl font-bold text-white">1. Owner Creates Repository</h3>
                 <p className="text-[#8b949e] leading-relaxed">
                    The repository owner initializes the project and uploads it to GitHub. This becomes the central hub for the entire team.
                 </p>
                 <div className="p-6 bg-[#0D1117] border border-white/10 rounded-2xl space-y-6 group shadow-2xl relative overflow-hidden">
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Command: Init</div>
                          <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-sm text-green-400">
                             <code>git init</code>
                             <Copy className="w-4 h-4 text-[#8b949e] hover:text-white cursor-pointer transition-colors" />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Command: Add Remote</div>
                          <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-sm text-green-400">
                             <code>git remote add origin https://github.com/team/task-manager.git</code>
                             <Copy className="w-4 h-4 text-[#8b949e] hover:text-white cursor-pointer transition-colors" />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="p-8 bg-indigo-500/5 border border-indigo-500/20 rounded-[40px] text-center space-y-4 shadow-2xl">
                 <div className="p-6 bg-[#0D1117] border border-white/10 rounded-2xl space-y-4 inline-block text-left">
                    <div className="flex items-center gap-2 text-xs text-[#8b949e] border-b border-white/5 pb-2">
                       <FolderOpen className="w-4 h-4" />
                       task-manager-app/
                    </div>
                    <div className="pl-6 space-y-2 font-mono text-[10px]">
                       <div className="flex items-center gap-2 text-[#8b949e]"><FileCode className="w-3 h-3 text-blue-400" /> index.html</div>
                       <div className="flex items-center gap-2 text-[#8b949e]"><FileCode className="w-3 h-3 text-yellow-400" /> app.js</div>
                    </div>
                 </div>
                 <h4 className="text-white font-bold mt-4">Project Structure</h4>
                 <p className="text-xs text-[#8b949e]">The foundational files of our team project.</p>
              </div>
           </div>

           {/* PART 4 — EACH DEVELOPER CREATES BRANCH */}
           <div className="space-y-12">
              <div className="text-center space-y-4">
                 <h3 className="text-2xl font-bold text-white">2. Parallel Development</h3>
                 <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
                    Collaborators create separate branches to work independently without breaking each other's code.
                 </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { user: 'Alice', cmd: 'git checkout -b feature-login', color: 'text-yellow-400' },
                   { user: 'Bob', cmd: 'git checkout -b feature-dashboard', color: 'text-blue-400' },
                   { user: 'Charlie', cmd: 'git checkout -b feature-darkmode', color: 'text-purple-400' }
                 ].map((dev, i) => (
                   <div key={i} className="p-6 bg-[#161B22] border border-white/5 rounded-2xl space-y-4 shadow-xl">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-white">{dev.user[0]}</div>
                         <span className="text-[10px] font-bold text-white uppercase tracking-widest">{dev.user}</span>
                      </div>
                      <div className="p-3 bg-black/40 rounded-xl border border-white/5 font-mono text-[10px]">
                         <code className={dev.color}>{dev.cmd}</code>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="max-w-4xl mx-auto py-12 relative px-10">
                 <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/5 -translate-y-1/2" />
                 <div className="flex justify-center gap-16">
                    <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] z-10" />
                    <div className="flex flex-col gap-6">
                       {[
                         { name: 'feature-login', color: 'bg-yellow-500' },
                         { name: 'feature-dashboard', color: 'bg-blue-500' },
                         { name: 'feature-darkmode', color: 'bg-purple-500' }
                       ].map((b, i) => (
                         <div key={i} className="flex items-center gap-4 relative">
                            <div className="absolute left-[-24px] top-1/2 -translate-y-1/2 w-6 h-px bg-white/10" />
                            <div className={`w-2 h-2 rounded-full ${b.color}`} />
                            <span className="text-[10px] font-mono text-[#8b949e]">{b.name}</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>

           {/* PART 7 & 8 — PUSH & PR */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                 <h3 className="text-2xl font-bold text-white">3. Push & Collaborate</h3>
                 <p className="text-[#8b949e] leading-relaxed">
                    Collaborators upload their branches to GitHub and open Pull Requests for the team to review.
                 </p>
                 <div className="p-6 bg-[#0D1117] border border-white/10 rounded-2xl space-y-6 shadow-xl">
                    <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Action: Push Branch</div>
                    <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-sm text-green-400">
                       <code>git push origin feature-login</code>
                    </div>
                 </div>
              </div>
              <div className="p-8 bg-[#161B22] border border-white/10 rounded-[40px] shadow-2xl space-y-6 relative overflow-hidden">
                 <div className="flex items-center justify-between">
                    <h5 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Active Pull Requests</h5>
                    <span className="text-[8px] font-bold text-[#8b949e]">3 Open</span>
                 </div>
                 <div className="space-y-3">
                    {[
                      { title: 'Add Login Feature', user: 'Alice', status: 'Reviewing' },
                      { title: 'Create Dashboard UI', user: 'Bob', status: 'Approved' },
                      { title: 'Implement Dark Mode', user: 'Charlie', status: 'Draft' }
                    ].map((pr, i) => (
                      <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                         <div className="space-y-0.5">
                            <div className="text-xs font-bold text-white">{pr.title}</div>
                            <div className="text-[8px] text-[#8b949e]">by {pr.user}</div>
                         </div>
                         <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${pr.status === 'Approved' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>
                            {pr.status}
                         </span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* PART 11 — SYNC TEAM CHANGES */}
           <div className="space-y-12">
              <div className="text-center space-y-4">
                 <h3 className="text-2xl font-bold text-white">4. Stay in Sync</h3>
                 <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
                    Once a teammate's PR is merged, everyone else should pull the latest changes to keep their local project updated.
                 </p>
              </div>
              
              <div className="max-w-3xl mx-auto p-12 bg-indigo-500/5 border border-indigo-500/10 rounded-[40px] relative overflow-hidden flex flex-col items-center gap-8 shadow-2xl">
                 <div className="flex items-center justify-center gap-8 py-6">
                    <div className="flex flex-col items-center gap-3">
                       <Cloud className="w-10 h-10 text-blue-400 animate-pulse" />
                       <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">GitHub Central</span>
                    </div>
                    <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                       <ArrowDown className="w-6 h-6 text-indigo-400" />
                    </motion.div>
                    <div className="flex flex-col items-center gap-3">
                       <Monitor className="w-10 h-10 text-[#8b949e]" />
                       <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">Your Computer</span>
                    </div>
                 </div>
                 
                 <div className="w-full space-y-4 pt-8 border-t border-white/5">
                    <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest text-center">Command: Pull Latest</div>
                    <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-sm text-indigo-400 max-w-sm mx-auto">
                       <code>git pull origin main</code>
                    </div>
                    <p className="text-[10px] text-[#8b949e] text-center italic">"This brings Alice's merged Login feature into my local project."</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* FINAL WORKFLOW SUMMARY */}
      <section className="space-y-12">
         <h2 className="text-3xl font-bold text-white tracking-tight text-center">Full Collaboration Cycle</h2>
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { label: 'Invite', icon: UserPlus },
              { label: 'Branch', icon: GitBranch },
              { label: 'Push', icon: Cloud },
              { label: 'PR', icon: GitPullRequest },
              { label: 'Review', icon: Search },
              { label: 'Merge', icon: GitMerge },
              { label: 'Sync', icon: RefreshCw },
              { label: 'Repeat', icon: RotateCcw }
            ].map((step, i) => (
              <div key={i} className="p-6 bg-[#1C2128] border border-white/5 rounded-2xl text-center space-y-3 shadow-xl">
                 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto">
                    <step.icon className="w-5 h-5 text-indigo-400" />
                 </div>
                 <span className="text-[10px] font-bold text-white uppercase tracking-widest">{step.label}</span>
              </div>
            ))}
         </div>
      </section>

      {/* SECTION 18 — MOTIVATIONAL CTA */}
      <section className="relative py-20 px-12 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[40px] overflow-hidden text-center group shadow-[0_0_50px_rgba(99,102,241,0.2)]">
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white tracking-tight leading-tight">Now You Understand Real Team Collaboration</h2>
            <p className="text-indigo-100/80 text-lg leading-relaxed">
              Modern software is built by teams collaborating through repositories, branches, Pull Requests, and code reviews. You now understand how professional developers work together using GitHub.
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className="px-10 py-5 bg-white text-indigo-600 rounded-2xl font-bold text-xl shadow-2xl flex items-center gap-3 mx-auto group/btn transition-all"
          >
            Master Issues & Tasks
            <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </section>
    </div>
  );
};

const IssuesTasksContent = ({ onNext }) => {
  return (
    <div className="space-y-32 pb-20">
      {/* SECTION 1 — HERO HEADER */}
      <section className="relative pt-10 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-green-500/10 rounded-full blur-[120px] animate-pulse" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 relative z-10"
        >
          <div className="flex justify-center flex-wrap gap-3">
            {['Project Management', 'Bug Tracking', 'Team Workflow'].map((badge, i) => (
              <span key={i} className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-500/20">
                {badge}
              </span>
            ))}
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
              Issues & Tasks
            </h1>
            <p className="text-xl text-[#8b949e] leading-relaxed max-w-2xl mx-auto">
              Learn how developers track bugs, plan features, assign work, and manage software projects using GitHub Issues.
            </p>
          </div>

          <div className="flex justify-center items-center gap-12 py-6 border-y border-white/5">
            <div className="flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-green-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Topic</span>
                <span className="text-[10px] text-[#8b949e]">Issues & Tasks</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Book className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Difficulty</span>
                <span className="text-[10px] text-[#8b949e]">Beginner to Intermediate</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Time</span>
                <span className="text-[10px] text-[#8b949e]">18 mins</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 2 — WHAT ARE GITHUB ISSUES? */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">What Are GitHub Issues?</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            Issues act like a shared project discussion and task tracking system for developers. They are the primary way to track work, report bugs, and plan features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="p-8 bg-green-500/[0.03] border border-green-500/20 rounded-[32px] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Info className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white">The Analogy</h3>
              </div>
              <p className="text-green-100/60 text-lg italic leading-relaxed">
                "An Issue is like a digital task or problem card shared with the entire development team."
              </p>
              <p className="text-[#8b949e] text-sm leading-relaxed">
                Imagine a bulletin board in a workshop where everyone pins notes about tools that need fixing, new benches to build, or ideas to improve the lighting. That board is GitHub Issues.
              </p>
            </div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="p-8 bg-gradient-to-br from-[#1C2128] to-[#0D1117] border border-white/10 rounded-[32px] relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-[40px] group-hover:bg-green-500/10 transition-colors" />
              <div className="relative z-10 space-y-4">
                <div className="text-xs font-bold text-green-400 uppercase tracking-widest">Project Core</div>
                <h3 className="text-2xl font-black text-white leading-tight">
                  Issues = <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                    Bugs + Features + Discussion
                  </span>
                </h3>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-green-400/50 to-emerald-400/50 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: Bug, title: 'Report Bugs', desc: 'Identify and track software glitches that need fixing.' },
              { icon: Rocket, title: 'Plan Features', desc: 'Propose and discuss new functionality for the application.' },
              { icon: MessageSquare, title: 'Discuss Changes', desc: 'Collaborate with the team on implementation details.' },
              { icon: ListTodo, title: 'Track Tasks', desc: 'Break down large projects into manageable individual units of work.' }
            ].map((item, i) => (
              <div key={i} className="p-6 bg-[#161B22] border border-white/5 rounded-2xl flex items-start gap-4 hover:bg-white/5 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <item.icon className="w-5 h-5 text-green-400" />
                </div>
                <div>
                   <h4 className="text-white font-bold text-sm">{item.title}</h4>
                   <p className="text-[10px] text-[#8b949e] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — WHY ISSUES ARE IMPORTANT */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Why Developers Use Issues</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Bug, title: 'Bug Tracking', desc: 'Never lose track of a bug. Assign it, label it by severity, and monitor its fix progress.' },
            { icon: Rocket, title: 'Feature Requests', desc: 'Allow users and teammates to propose new ideas in a structured, searchable format.' },
            { icon: ListTodo, title: 'Task Organization', desc: 'Break down complex features into smaller, assignable sub-tasks for the team.' },
            { icon: MessageCircle, title: 'Team Communication', desc: 'Keep all discussions about a specific feature or bug in one organized thread.' },
            { icon: Activity, title: 'Progress Tracking', desc: 'Use milestones and project boards to see exactly how much work is left for a release.' },
            { icon: FileText, title: 'Documentation', desc: 'Old issues act as a searchable historical record of why certain technical decisions were made.' }
          ].map((feat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5, borderColor: 'rgba(52, 211, 153, 0.4)' }}
              className="p-6 bg-[#1C2128] border border-white/5 rounded-2xl group transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-colors" />
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feat.icon className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-white font-bold mb-2">{feat.title}</h3>
              <p className="text-xs text-[#8b949e] leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 4 — TYPES OF ISSUES */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Common Types of Issues</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[
             { label: 'Bug Report', icon: Bug, color: 'bg-red-500/10 text-red-400', example: 'Login button not working on mobile.' },
             { label: 'Feature Request', icon: Rocket, color: 'bg-blue-500/10 text-blue-400', example: 'Add dark mode support.' },
             { label: 'Documentation', icon: FileText, color: 'bg-indigo-500/10 text-indigo-400', example: 'README setup instructions missing.' },
             { label: 'Enhancement', icon: Zap, color: 'bg-yellow-500/10 text-yellow-400', example: 'Improve dashboard loading speed.' },
             { label: 'Maintenance', icon: Settings, color: 'bg-slate-500/10 text-slate-400', example: 'Upgrade React dependencies.' }
           ].map((type, i) => (
             <div key={i} className="p-6 bg-[#161B22] border border-white/5 rounded-2xl space-y-4 hover:bg-white/5 transition-all group">
                <div className={`px-3 py-1 ${type.color} rounded-full text-[10px] font-bold uppercase tracking-widest w-fit flex items-center gap-2`}>
                   <type.icon className="w-3 h-3" />
                   {type.label}
                </div>
                <div className="space-y-1">
                   <div className="text-[10px] text-[#8b949e] font-bold uppercase tracking-widest">Example:</div>
                   <p className="text-sm text-white font-medium italic">"{type.example}"</p>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* SECTION 5 — ISSUE WORKFLOW */}
      <section className="space-y-16">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">The Issue Lifecycle</h2>
        
        <div className="max-w-4xl mx-auto py-20 relative px-10 bg-[#0D1117] border border-white/10 rounded-[60px] shadow-2xl overflow-hidden">
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-green-500/30 to-transparent -translate-y-1/2 hidden lg:block" />
          
          <div className="flex flex-wrap justify-center gap-10">
            {[
              { label: 'Created', icon: FilePlus, color: 'text-blue-500' },
              { label: 'Discussed', icon: MessageSquare, color: 'text-indigo-500' },
              { label: 'Assigned', icon: UserCheck, color: 'text-yellow-500' },
              { label: 'In Progress', icon: Code, color: 'text-purple-500' },
              { label: 'Review PR', icon: GitPullRequest, color: 'text-red-500' },
              { label: 'Closed', icon: CheckCircle2, color: 'text-green-500' }
            ].map((node, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-4 relative z-10"
              >
                <div className={`w-16 h-16 rounded-full bg-[#161B22] border-2 border-white/10 flex items-center justify-center bg-gradient-to-br from-[#161B22] to-[#0D1117] shadow-2xl group hover:border-green-500/50 transition-all`}>
                  <node.icon className={`w-6 h-6 ${node.color} group-hover:scale-125 transition-transform`} />
                </div>
                <span className="text-[10px] font-bold text-white uppercase tracking-widest text-center max-w-[80px]">{node.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — ANATOMY OF A GITHUB ISSUE */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Anatomy of a GitHub Issue</h2>
        
        <div className="max-w-5xl mx-auto p-10 bg-[#0D1117] border border-white/10 rounded-[40px] shadow-2xl space-y-8 relative overflow-hidden">
           {/* Header Area */}
           <div className="space-y-4 pb-8 border-b border-white/5">
              <div className="flex items-center gap-4">
                 <h3 className="text-2xl font-bold text-white tracking-tight">Login button not working on mobile</h3>
                 <span className="text-2xl font-light text-[#8b949e]">#42</span>
              </div>
              <div className="flex items-center gap-3">
                 <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/20 flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3" /> Open
                 </span>
                 <span className="text-xs text-[#8b949e]">
                    <span className="font-bold text-white">Alice</span> opened this issue 2 days ago · 8 comments
                 </span>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-6">
                 {/* Description Block */}
                 <div className="p-6 bg-[#161B22] border border-white/5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                       <span className="text-xs font-bold text-[#8b949e]">Description</span>
                       <Edit3 className="w-4 h-4 text-[#8b949e]" />
                    </div>
                    <p className="text-sm text-[#8b949e] leading-relaxed">
                       When using the application on a screen smaller than 480px, the login button in the navbar becomes unclickable. It seems to be overlapping with the search bar container.
                    </p>
                    <div className="pt-4 space-y-2">
                       <div className="text-[10px] font-bold text-white uppercase tracking-widest">Steps to reproduce:</div>
                       <ul className="list-disc pl-4 text-xs text-[#8b949e] space-y-1">
                          <li>Open app on mobile browser</li>
                          <li>Click on the hamburger menu</li>
                          <li>Try to click 'Login'</li>
                       </ul>
                    </div>
                 </div>

                 {/* Comment Example */}
                 <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center font-bold text-[10px] text-white">B</div>
                    <div className="flex-1 p-6 bg-[#161B22] border border-white/5 rounded-2xl relative">
                       <div className="absolute top-4 left-[-8px] w-4 h-4 bg-[#161B22] border-l border-b border-white/5 rotate-45" />
                       <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-bold text-white">Bob <span className="text-[#8b949e] font-normal italic ml-2">commented 1 hour ago</span></span>
                          <Smile className="w-4 h-4 text-[#8b949e]" />
                       </div>
                       <p className="text-sm text-[#8b949e]">I've reproduced this on iOS Safari. I'll assign this to myself and fix the CSS layering.</p>
                    </div>
                 </div>
              </div>

              {/* Sidebar Controls */}
              <div className="space-y-8">
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest border-b border-white/5 pb-2">Assignees</h4>
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[8px] font-bold text-white">B</div>
                       <span className="text-xs text-white">Bob</span>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest border-b border-white/5 pb-2">Labels</h4>
                    <div className="flex flex-wrap gap-2">
                       <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[9px] font-bold rounded-full border border-red-500/20">bug</span>
                       <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 text-[9px] font-bold rounded-full border border-yellow-500/20">urgent</span>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest border-b border-white/5 pb-2">Milestone</h4>
                    <div className="space-y-2">
                       <div className="text-xs text-white font-medium">Version 1.0 Release</div>
                       <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="w-[65%] h-full bg-green-500" />
                       </div>
                       <div className="text-[9px] text-[#8b949e] font-medium uppercase tracking-widest text-right">65% Complete</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* SECTION 9 — MILESTONES & SPRINT PLANNING */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Milestones & Sprint Planning</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[
             { title: 'v1.0 Launch', progress: 90, color: 'from-green-400 to-emerald-500', icon: Milestone },
             { title: 'User Auth System', progress: 45, color: 'from-blue-400 to-indigo-500', icon: Lock },
             { title: 'Payment Gateway', progress: 20, color: 'from-purple-400 to-pink-500', icon: Database },
             { title: 'Mobile App Sync', progress: 5, color: 'from-orange-400 to-red-500', icon: Smartphone }
           ].map((m, i) => (
             <motion.div 
              key={i} 
              whileHover={{ y: -5 }}
              className="p-8 bg-[#161B22] border border-white/5 rounded-[32px] space-y-6 relative overflow-hidden group shadow-xl"
             >
                <div className="flex items-center justify-between">
                   <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <m.icon className="w-5 h-5 text-green-400" />
                   </div>
                   <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">{m.progress}%</span>
                </div>
                <h4 className="text-lg font-bold text-white">{m.title}</h4>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${m.progress}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className={`h-full bg-gradient-to-r ${m.color}`}
                   />
                </div>
             </motion.div>
           ))}
        </div>
      </section>

      {/* SECTION 11 — LINKING ISSUES WITH PRs */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Connecting Issues with Pull Requests</h2>
        <div className="max-w-4xl mx-auto p-12 bg-green-500/[0.02] border border-green-500/10 rounded-[40px] space-y-12 shadow-2xl relative overflow-hidden">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center">
              <div className="space-y-4">
                 <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto border border-white/10 group hover:border-red-400/50 transition-all">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                 </div>
                 <div>
                    <span className="block text-white font-bold">Issue #24</span>
                    <span className="text-[10px] text-[#8b949e] uppercase tracking-widest font-bold">Open Bug</span>
                 </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                 <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl font-mono text-[10px] text-green-400">
                    "Fixes #24"
                 </div>
                 <ArrowRight className="w-6 h-6 text-green-500 animate-pulse" />
              </div>

              <div className="space-y-4">
                 <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto border border-white/10 group hover:border-green-400/50 transition-all">
                    <GitMerge className="w-8 h-8 text-green-400" />
                 </div>
                 <div>
                    <span className="block text-white font-bold">Merged PR</span>
                    <span className="text-[10px] text-green-400 uppercase tracking-widest font-bold">Auto-Closed</span>
                 </div>
              </div>
           </div>
           
           <div className="p-6 bg-[#0D1117] border border-white/10 rounded-2xl space-y-4">
              <p className="text-xs text-[#8b949e] leading-relaxed italic">
                "Professional Tip: When you type <span className="text-green-400 font-bold">'Fixes #24'</span> in your Pull Request description, GitHub will automatically close the issue as soon as your code is merged into the main branch. It's magic for project management!"
              </p>
           </div>
        </div>
      </section>

      {/* SECTION 12 — ISSUE TEMPLATES */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Issue Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
           {[
             { title: 'Bug Report', fields: ['Steps to Reproduce', 'Expected Result', 'Actual Result', 'OS/Browser Info'] },
             { title: 'Feature Request', fields: ['Problem Description', 'Proposed Solution', 'Alternative Ideas', 'Value to Users'] }
           ].map((temp, i) => (
             <div key={i} className="p-8 bg-[#161B22] border border-white/5 rounded-[32px] space-y-6 shadow-2xl group hover:border-white/20 transition-all">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                   <h4 className="text-white font-black uppercase tracking-tight">{temp.title} Template</h4>
                   <FileText className="w-5 h-5 text-green-400" />
                </div>
                <div className="space-y-4">
                   {temp.fields.map((f, j) => (
                     <div key={j} className="space-y-2">
                        <label className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">{f}</label>
                        <div className="w-full h-10 bg-black/40 border border-white/5 rounded-lg" />
                     </div>
                   ))}
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* SECTION 16 — HANDS-ON PRACTICAL EXAMPLE */}
      <section className="space-y-16 pt-20 border-t border-white/5">
        <div className="text-center space-y-4">
          <div className="flex justify-center flex-wrap gap-3">
            {['Project Management', 'Practical Lab', 'Real Workflow'].map((badge, i) => (
              <span key={i} className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-500/20">
                {badge}
              </span>
            ))}
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight">Hands-On Issues Workflow</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            Follow the lifecycle of a bug report from creation to automated closure.
          </p>
        </div>

        <div className="space-y-32">
           {/* PART 1 & 2 — CREATE ISSUE */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                 <h3 className="text-2xl font-bold text-white">1. Create & Label the Issue</h3>
                 <p className="text-[#8b949e] leading-relaxed">
                    A user reports that the "Checkout" button is missing on the food delivery app. We create an issue, label it, and assign a developer.
                 </p>
                 <div className="p-8 bg-[#0D1117] border border-white/10 rounded-[32px] space-y-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
                    <div className="space-y-4">
                       <h4 className="text-white font-bold">Checkout button missing #102</h4>
                       <div className="flex gap-2">
                          <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[8px] font-bold rounded-full border border-red-500/20 uppercase tracking-widest">bug</span>
                          <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 text-[8px] font-bold rounded-full border border-orange-500/20 uppercase tracking-widest">high-priority</span>
                       </div>
                       <div className="flex items-center gap-3 pt-4 text-[10px] text-[#8b949e]">
                          <User className="w-3 h-3" /> Assignee: <span className="text-white font-bold">Alice</span>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="p-8 bg-[#161B22] border border-white/10 rounded-[40px] space-y-4 text-center">
                 <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto border-4 border-red-500/10 animate-pulse">
                    <AlertOctagon className="w-8 h-8 text-red-500" />
                 </div>
                 <p className="text-xs text-[#8b949e] italic leading-relaxed">"The project manager marked this as a critical bug for the v1.0 milestone."</p>
              </div>
           </div>

           {/* PART 3 & 4 — WORKFLOW */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 p-8 bg-indigo-500/5 border border-indigo-500/20 rounded-[40px] space-y-6 shadow-2xl">
                 <div className="space-y-4">
                    <div className="p-4 bg-black/40 border border-white/5 rounded-xl font-mono text-xs text-green-400">
                       <code>git checkout -b fix-checkout-button</code>
                    </div>
                    <div className="p-4 bg-black/40 border border-white/5 rounded-xl font-mono text-xs text-blue-400 italic">
                       // Alice fixes the CSS issue where the button was hidden...
                    </div>
                    <div className="p-4 bg-black/40 border border-white/5 rounded-xl font-mono text-xs text-green-400">
                       <code>git commit -m "Fixes #102: restore checkout button visibility"</code>
                    </div>
                 </div>
              </div>
              <div className="order-1 md:order-2 space-y-6">
                 <h3 className="text-2xl font-bold text-white">2. Fixing the Problem</h3>
                 <p className="text-[#8b949e] leading-relaxed">
                    The assigned developer creates a dedicated branch, fixes the code, and references the issue number in the commit message.
                 </p>
              </div>
           </div>

           {/* PART 9 — MERGE & CLOSE */}
           <div className="space-y-12">
              <div className="text-center space-y-4">
                 <h3 className="text-2xl font-bold text-white">3. Merged & Resolved</h3>
                 <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
                    As soon as the Pull Request is merged, the issue status changes automatically.
                 </p>
              </div>

              <div className="max-w-3xl mx-auto p-12 bg-green-500/5 border border-green-500/20 rounded-[40px] flex flex-col items-center gap-8 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-[40px]" />
                 <CheckCircle2 className="w-20 h-20 text-green-400 animate-bounce" />
                 <div className="text-center space-y-2">
                    <h4 className="text-2xl font-black text-white uppercase tracking-tight">Issue #102 Closed</h4>
                    <p className="text-xs text-[#8b949e]">Successfully resolved by Pull Request #105</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-20 px-12 bg-gradient-to-br from-emerald-600 to-green-700 rounded-[40px] overflow-hidden text-center group shadow-[0_0_50px_rgba(16,185,129,0.2)]">
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white tracking-tight leading-tight">Now You Understand Real Project Management</h2>
            <p className="text-emerald-100/80 text-lg leading-relaxed">
              Issues and task management help development teams organize work, track progress, fix bugs, and collaborate efficiently on modern software projects.
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className="px-10 py-5 bg-white text-emerald-600 rounded-2xl font-bold text-xl shadow-2xl flex items-center gap-3 mx-auto group/btn transition-all"
          >
            Explore CI/CD Basics
            <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </section>
    </div>
  );
};

const ProjectsAgileContent = ({ onNext }) => {
  return (
    <div className="space-y-32 pb-20">
      {/* SECTION 1 — HERO HEADER */}
      <section className="relative pt-10 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 relative z-10"
        >
          <div className="flex justify-center flex-wrap gap-3">
            {['Agile Workflow', 'Team Productivity', 'Project Management'].map((badge, i) => (
              <span key={i} className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-500/20">
                {badge}
              </span>
            ))}
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
              Projects & Agile
            </h1>
            <p className="text-xl text-[#8b949e] leading-relaxed max-w-2xl mx-auto">
              Learn how modern development teams organize work, track progress, and manage software projects using Agile workflows and GitHub Projects.
            </p>
          </div>

          <div className="flex justify-center items-center gap-12 py-6 border-y border-white/5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Topic</span>
                <span className="text-[10px] text-[#8b949e]">Projects & Agile</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Book className="w-5 h-5 text-indigo-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Difficulty</span>
                <span className="text-[10px] text-[#8b949e]">Beginner to Intermediate</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Time</span>
                <span className="text-[10px] text-[#8b949e]">22 mins</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 2 — WHAT ARE GITHUB PROJECTS? */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">What Are GitHub Projects?</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            GitHub Projects is a project management system that helps teams visualize work, coordinate software delivery, and keep everyone on the same page.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="p-8 bg-blue-500/[0.03] border border-blue-500/20 rounded-[32px] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Info className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white">The Analogy</h3>
              </div>
              <p className="text-blue-100/60 text-lg italic leading-relaxed">
                "A GitHub Project is like a smart digital task board for software teams."
              </p>
              <p className="text-[#8b949e] text-sm leading-relaxed">
                It's more than just a list; it's a dynamic workspace that connects your planning directly to the code being written in Issues and Pull Requests.
              </p>
            </div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="p-8 bg-gradient-to-br from-[#1C2128] to-[#0D1117] border border-white/10 rounded-[32px] relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px] group-hover:bg-blue-500/10 transition-colors" />
              <div className="relative z-10 space-y-4">
                <div className="text-xs font-bold text-blue-400 uppercase tracking-widest">Efficiency Core</div>
                <h3 className="text-2xl font-black text-white leading-tight">
                  Projects = <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                    Tracking + Coordination + Planning
                  </span>
                </h3>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-400/50 to-indigo-400/50 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: ListTodo, label: 'Organize Tasks' },
              { icon: Bug, label: 'Track Issues' },
              { icon: GitPullRequest, label: 'Manage PRs' },
              { icon: Rocket, label: 'Plan Features' }
            ].map((item, i) => (
              <div key={i} className="p-6 bg-[#161B22] border border-white/5 rounded-2xl flex flex-col items-center gap-3 hover:bg-white/5 transition-all group text-center">
                <item.icon className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — WHAT IS AGILE? */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">What is Agile Development?</h2>
        <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed text-center">
          Agile is a methodology where teams build software incrementally in small cycles called **sprints**, adapting to change quickly instead of following a rigid plan.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { icon: Zap, title: 'Fast Iterations', desc: 'Working in 1-4 week cycles to deliver value quickly.' },
            { icon: Handshake, title: 'Team Collab', desc: 'Constant communication between developers and stakeholders.' },
            { icon: RefreshCw, title: 'Continuous Imp.', desc: 'Reviewing progress and improving the process every sprint.' },
            { icon: Rocket, title: 'Faster Delivery', desc: 'Shipping smaller features frequently rather than one big launch.' },
            { icon: ClipboardList, title: 'Organized Planning', desc: 'Prioritizing the most important work first to maximize impact.' }
          ].map((feat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5, borderColor: 'rgba(59, 130, 246, 0.4)' }}
              className="p-6 bg-[#1C2128] border border-white/5 rounded-2xl group transition-all duration-300 relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feat.icon className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-white font-bold text-sm mb-2">{feat.title}</h3>
              <p className="text-[10px] text-[#8b949e] leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 4 — AGILE WORKFLOW OVERVIEW */}
      <section className="space-y-16">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Typical Agile Workflow</h2>
        
        <div className="max-w-4xl mx-auto py-20 relative px-10 bg-[#0D1117] border border-white/10 rounded-[60px] shadow-2xl overflow-hidden">
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent -translate-y-1/2 hidden lg:block" />
          
          <div className="flex flex-wrap justify-center gap-10">
            {[
              { label: 'Plan Tasks', icon: ClipboardList, color: 'text-blue-500' },
              { label: 'Create Issues', icon: FilePlus, color: 'text-indigo-500' },
              { label: 'Assign Devs', icon: UserCheck, color: 'text-yellow-500' },
              { label: 'Build Features', icon: Code, color: 'text-purple-500' },
              { label: 'Open PRs', icon: GitPullRequest, color: 'text-red-500' },
              { label: 'Deploy', icon: Rocket, color: 'text-green-500' }
            ].map((node, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-4 relative z-10"
              >
                <div className={`w-16 h-16 rounded-full bg-[#161B22] border-2 border-white/10 flex items-center justify-center bg-gradient-to-br from-[#161B22] to-[#0D1117] shadow-2xl group hover:border-blue-500/50 transition-all`}>
                  <node.icon className={`w-6 h-6 ${node.color} group-hover:scale-125 transition-transform`} />
                </div>
                <span className="text-[10px] font-bold text-white uppercase tracking-widest text-center max-w-[80px]">{node.label}</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 text-center text-[10px] text-blue-400 font-bold uppercase tracking-widest animate-pulse">
            Repeat Sprint Cycle
          </div>
        </div>
      </section>

      {/* SECTION 5 — KANBAN BOARD EXPLANATION */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">Understanding Kanban Boards</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            Kanban boards visually organize tasks into stages. It's the most popular way to track progress in software teams.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 p-10 bg-[#0D1117] border border-white/10 rounded-[40px] shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px]" />
           
           {[
             { title: 'To Do', color: 'bg-white/5', tasks: ['Add login page', 'Create API routes'] },
             { title: 'In Progress', color: 'bg-blue-500/5', tasks: ['Build dashboard UI'] },
             { title: 'Review', color: 'bg-purple-500/5', tasks: ['Payment integration PR'] },
             { title: 'Done', color: 'bg-green-500/5', tasks: ['Authentication setup'] }
           ].map((col, i) => (
             <div key={i} className={`p-6 ${col.color} border border-white/5 rounded-3xl space-y-6 flex flex-col h-full`}>
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                   <h4 className="text-[10px] font-black text-white uppercase tracking-widest">{col.title}</h4>
                   <span className="text-[10px] font-bold text-[#8b949e]">{col.tasks.length}</span>
                </div>
                <div className="space-y-4 flex-1">
                   {col.tasks.map((task, j) => (
                     <motion.div 
                      key={j} 
                      whileHover={{ scale: 1.02 }}
                      className="p-4 bg-[#161B22] border border-white/5 rounded-2xl shadow-xl space-y-3 cursor-grab active:cursor-grabbing"
                     >
                        <p className="text-xs text-white font-medium">{task}</p>
                        <div className="flex items-center justify-between">
                           <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[8px] font-bold text-white">
                              {['A', 'B', 'C'][j % 3]}
                           </div>
                           <div className="flex gap-1">
                              <div className="w-3 h-1 bg-blue-500/30 rounded-full" />
                              <div className="w-3 h-1 bg-blue-500/30 rounded-full" />
                           </div>
                        </div>
                     </motion.div>
                   ))}
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* SECTION 6 — SPRINTS & ITERATIONS */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">What Are Sprints?</h2>
        <div className="max-w-4xl mx-auto p-12 bg-blue-500/[0.02] border border-blue-500/10 rounded-[40px] space-y-12 shadow-2xl">
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                { label: 'Planning', icon: ClipboardList },
                { label: 'Dev', icon: Code },
                { label: 'Review', icon: Search },
                { label: 'Testing', icon: ShieldCheck },
                { label: 'Release', icon: Rocket },
                { label: 'Retro', icon: RefreshCw }
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-3 text-center">
                   <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-blue-500/50 transition-all">
                      <step.icon className="w-5 h-5 text-blue-400" />
                   </div>
                   <span className="text-[9px] font-bold text-[#8b949e] uppercase tracking-widest">{step.label}</span>
                </div>
              ))}
           </div>
           
           <div className="flex items-center gap-6 p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
              <Calendar className="w-8 h-8 text-blue-400 shrink-0" />
              <p className="text-xs text-[#8b949e] leading-relaxed">
                "Professional teams usually work in <span className="text-white font-bold">2-week sprints</span>. This allows enough time to build something real, but keeps the feedback loop short enough to adapt to changes."
              </p>
           </div>
        </div>
      </section>

      {/* SECTION 12 — AGILE TEAM MEETINGS */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Agile Team Meetings (Ceremonies)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Sprint Planning', desc: 'Team decides which tasks from the backlog will be completed in the upcoming sprint.', icon: ClipboardList },
            { title: 'Daily Standup', desc: 'A quick 15-min meeting to discuss progress and identify any blockers.', icon: Coffee },
            { title: 'Sprint Review', desc: 'Demonstrating the completed features to stakeholders for feedback.', icon: Search },
            { title: 'Retrospective', desc: 'Discussing what went well and what could be improved for the next cycle.', icon: RefreshCw }
          ].map((item, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -5 }}
              className="p-8 bg-[#161B22] border border-white/5 rounded-[32px] space-y-4 hover:border-blue-500/30 transition-all shadow-xl text-center"
            >
               <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-2">
                  <item.icon className="w-6 h-6 text-blue-400" />
               </div>
               <h4 className="text-white font-bold">{item.title}</h4>
               <p className="text-xs text-[#8b949e] leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 11 — PROJECT AUTOMATION */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">Automation in GitHub Projects</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            GitHub can automatically handle the manual work of moving tasks, saving hours for the team.
          </p>
        </div>

        <div className="max-w-4xl mx-auto p-12 bg-[#0D1117] border border-white/10 rounded-[40px] shadow-2xl relative overflow-hidden">
           <div className="flex items-center justify-between gap-8 relative z-10">
              {[
                { label: 'Open PR', icon: GitPullRequest, color: 'text-red-400' },
                { label: 'Run Tests', icon: ShieldCheck, color: 'text-blue-400' },
                { label: 'Move to Review', icon: ArrowRight, color: 'text-indigo-400' },
                { label: 'Merge PR', icon: GitMerge, color: 'text-green-400' },
                { label: 'Move to Done', icon: CheckCircle2, color: 'text-green-500' }
              ].map((auto, i) => (
                <div key={i} className="flex flex-col items-center gap-4 text-center">
                   <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                      <auto.icon className={`w-5 h-5 ${auto.color}`} />
                   </div>
                   <span className="text-[8px] font-bold text-[#8b949e] uppercase tracking-widest">{auto.label}</span>
                </div>
              ))}
           </div>
           <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5 -translate-y-4" />
        </div>
      </section>

      {/* HANDS-ON PRACTICAL EXAMPLE */}
      <section className="space-y-16 pt-20 border-t border-white/5">
        <div className="text-center space-y-4">
          <div className="flex justify-center flex-wrap gap-3">
            {['Agile Lab', 'Hands-On Workflow', 'Team Simulation'].map((badge, i) => (
              <span key={i} className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-500/20">
                {badge}
              </span>
            ))}
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight">Hands-On GitHub Projects Workflow</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            Learn real-world Agile project management using practical RepoSphere workflows.
          </p>
        </div>

        <div className="space-y-32">
           {/* PART 2 — CREATE PROJECT BOARD */}
           <div className="space-y-12">
              <div className="text-center space-y-4">
                 <h3 className="text-2xl font-bold text-white">1. Create Project Board</h3>
                 <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
                    A team is building an E-Commerce platform. They set up a Kanban board with four primary columns.
                 </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 {['📋 To Do', '⚡ In Progress', '🔍 Review', '✅ Done'].map((col, i) => (
                   <div key={i} className="p-6 bg-[#161B22] border border-white/5 rounded-2xl space-y-4 shadow-xl">
                      <div className="text-[10px] font-bold text-white uppercase tracking-widest border-b border-white/5 pb-2">{col}</div>
                      <div className="space-y-3 opacity-30">
                         <div className="h-12 bg-white/5 rounded-xl" />
                         <div className="h-12 bg-white/5 rounded-xl" />
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* PART 5 — TASK MOVES TO IN PROGRESS */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                 <h3 className="text-2xl font-bold text-white">2. Task Lifecycle in Motion</h3>
                 <p className="text-[#8b949e] leading-relaxed">
                    When Alice starts working on the <span className="text-white font-bold">"feature-wishlist"</span> branch, she drags her task from "To Do" to "In Progress".
                 </p>
                 <div className="p-8 bg-[#0D1117] border border-white/10 rounded-[32px] space-y-8 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center gap-4">
                       <div className="p-4 bg-white/5 border border-white/5 rounded-xl font-mono text-xs text-blue-400">
                          To Do
                       </div>
                       <motion.div animate={{ x: [0, 50, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
                          <ArrowRight className="w-5 h-5 text-blue-500" />
                       </motion.div>
                       <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl font-mono text-xs text-blue-400">
                          In Progress
                       </div>
                    </div>
                    <div className="p-4 bg-[#161B22] border border-white/5 rounded-xl shadow-xl space-y-2">
                       <div className="text-[10px] font-bold text-white">Add wishlist feature #108</div>
                       <div className="flex items-center gap-2">
                          <Tag className="w-3 h-3 text-blue-400" />
                          <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">feature</span>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="p-8 bg-blue-500/5 border border-blue-500/20 rounded-[40px] text-center space-y-4 shadow-2xl">
                 <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto border-4 border-blue-500/10">
                    <TrendingUp className="w-8 h-8 text-blue-500" />
                 </div>
                 <p className="text-xs text-[#8b949e] italic leading-relaxed">"The project lead can now see that the wishlist feature is officially under development."</p>
              </div>
           </div>

           {/* PART 11 — FINAL SUMMARY */}
           <div className="space-y-12">
              <div className="text-center space-y-4">
                 <h3 className="text-2xl font-bold text-white">3. Sprint Completion</h3>
                 <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
                    At the end of the 2-week sprint, the team looks at their dashboard to see what they delivered.
                 </p>
              </div>
              
              <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[
                   { label: 'Tasks Completed', value: '12', icon: CheckSquare, color: 'text-green-400' },
                   { label: 'Features Delivered', value: '4', icon: Rocket, color: 'text-blue-400' },
                   { label: 'Bugs Resolved', value: '8', icon: Bug, color: 'text-red-400' }
                 ].map((stat, i) => (
                   <div key={i} className="p-8 bg-[#161B22] border border-white/5 rounded-[32px] space-y-4 text-center shadow-xl">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto">
                         <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <div className="text-3xl font-black text-white">{stat.value}</div>
                      <div className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">{stat.label}</div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-20 px-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] overflow-hidden text-center group shadow-[0_0_50px_rgba(59,130,246,0.2)]">
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white tracking-tight leading-tight">Now You Understand Agile Development</h2>
            <p className="text-blue-100/80 text-lg leading-relaxed">
              Modern software teams use GitHub Projects and Agile workflows to organize development, collaborate efficiently, and deliver software continuously.
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className="px-10 py-5 bg-white text-blue-600 rounded-2xl font-bold text-xl shadow-2xl flex items-center gap-3 mx-auto group/btn transition-all"
          >
            Explore CI/CD Basics
            <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </section>
    </div>
  );
};

const CICDContent = ({ onNext }) => {
  return (
    <div className="space-y-32 pb-20">
      {/* SECTION 1 — HERO HEADER */}
      <section className="relative pt-10 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-yellow-500/10 rounded-full blur-[120px] animate-pulse" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 relative z-10"
        >
          <div className="flex justify-center flex-wrap gap-3">
            {['DevOps', 'Automation', 'GitHub Actions'].map((badge, i) => (
              <span key={i} className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-yellow-500/20">
                {badge}
              </span>
            ))}
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
              CI/CD & Actions
            </h1>
            <p className="text-xl text-[#8b949e] leading-relaxed max-w-2xl mx-auto">
              Master Continuous Integration, Continuous Deployment, and GitHub Actions to automate your testing, building, and deployment workflows.
            </p>
          </div>

          <div className="flex justify-center items-center gap-12 py-6 border-y border-white/5">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Topic</span>
                <span className="text-[10px] text-[#8b949e]">CI/CD & Actions</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Book className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Difficulty</span>
                <span className="text-[10px] text-[#8b949e]">Beginner to Intermediate</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Time</span>
                <span className="text-[10px] text-[#8b949e]">25 mins</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 1 — WHAT IS CI/CD? */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">What is CI/CD?</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            Continuous Integration and Continuous Deployment are the backbone of modern DevOps. They ensure that code is always tested, stable, and ready for users.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="p-10 bg-blue-500/[0.03] border border-blue-500/20 rounded-[40px] space-y-6 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px]" />
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                 <RefreshCw className="w-7 h-7 text-blue-400 group-hover:rotate-180 transition-transform duration-700" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-2xl font-black text-white">Continuous Integration (CI)</h3>
                 <p className="text-sm text-[#8b949e] leading-relaxed">
                    The practice of merging code into a shared repository frequently. Each merge triggers an automated build and test sequence to catch bugs early.
                 </p>
              </div>
              <ul className="space-y-3">
                 {['Run Unit Tests', 'Check Code Style', 'Verify Security'].map((item, i) => (
                   <li key={i} className="flex items-center gap-3 text-xs text-blue-100/60 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-blue-400" /> {item}
                   </li>
                 ))}
              </ul>
           </div>

           <div className="p-10 bg-green-500/[0.03] border border-green-500/20 rounded-[40px] space-y-6 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-[40px]" />
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center">
                 <Rocket className="w-7 h-7 text-green-400 group-hover:-translate-y-2 group-hover:translate-x-2 transition-transform" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-2xl font-black text-white">Continuous Deployment (CD)</h3>
                 <p className="text-sm text-[#8b949e] leading-relaxed">
                    The practice of automatically deploying every change that passes the CI stage directly to your users. It ensures fast, reliable shipping.
                 </p>
              </div>
              <ul className="space-y-3">
                 {['Build Production Assets', 'Push to Servers', 'Notify Team'].map((item, i) => (
                   <li key={i} className="flex items-center gap-3 text-xs text-green-100/60 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-green-400" /> {item}
                   </li>
                 ))}
              </ul>
           </div>
        </div>
      </section>

      {/* SECTION 2 — WHAT ARE GITHUB ACTIONS? */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">What are GitHub Actions?</h2>
        <div className="max-w-4xl mx-auto p-12 bg-yellow-500/[0.02] border border-yellow-500/10 rounded-[40px] space-y-12 shadow-2xl relative overflow-hidden">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                 <p className="text-lg text-[#8b949e] leading-relaxed italic">
                    "RepoSphere Actions is an automation platform that allows you to run custom scripts directly on RepoSphere's servers."
                 </p>
                 <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl group hover:border-yellow-400/50 transition-all">
                       <Zap className="w-6 h-6 text-yellow-400 group-hover:scale-125 transition-transform" />
                       <span className="text-sm text-white font-medium italic">Automate anything: builds, tests, releases.</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl group hover:border-blue-400/50 transition-all">
                       <Cloud className="w-6 h-6 text-blue-400 group-hover:scale-125 transition-transform" />
                       <span className="text-sm text-white font-medium italic">Run on Linux, Windows, or macOS.</span>
                    </div>
                 </div>
              </div>
              <div className="p-8 bg-black/40 border border-white/10 rounded-[32px] space-y-4 shadow-xl">
                 <div className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest border-b border-white/5 pb-2">The Engine</div>
                 <div className="grid grid-cols-2 gap-4">
                    {['Workflow', 'Job', 'Step', 'Action'].map((item, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-xl text-center border border-white/5 group hover:bg-yellow-400/10 transition-colors">
                         <div className="text-lg font-black text-white">{i+1}</div>
                         <div className="text-[8px] font-bold text-yellow-400 uppercase tracking-widest">{item}</div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* SECTION 4 — YAML WORKFLOW ANATOMY */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">YAML Workflow Anatomy</h2>
        
        <div className="max-w-4xl mx-auto p-8 bg-[#0D1117] border border-white/10 rounded-[40px] shadow-2xl space-y-8 relative overflow-hidden font-mono text-sm leading-relaxed">
           <div className="absolute top-0 right-0 p-4 opacity-30">
              <FileCode className="w-20 h-20 text-blue-400" />
           </div>

           <div className="space-y-4">
              <div className="flex items-start gap-4 group">
                 <span className="text-[#8b949e] w-20 shrink-0">name:</span>
                 <div className="flex-1 space-y-1">
                    <span className="text-green-400">CI Pipeline</span>
                    <p className="text-[10px] text-[#8b949e] font-sans">The title displayed on RepoSphere.</p>
                 </div>
              </div>

              <div className="flex items-start gap-4 group">
                 <span className="text-[#8b949e] w-20 shrink-0">on:</span>
                 <div className="flex-1 space-y-1 text-blue-400">
                    [push, pull_request]
                    <p className="text-[10px] text-[#8b949e] font-sans italic">The "Triggers" that start the workflow.</p>
                 </div>
              </div>

              <div className="flex items-start gap-4 group">
                 <span className="text-[#8b949e] w-20 shrink-0">jobs:</span>
                 <div className="flex-1 space-y-6">
                    <div className="pl-4 space-y-4 border-l-2 border-white/5">
                       <div className="space-y-1">
                          <span className="text-yellow-400">test:</span>
                          <p className="text-[10px] text-[#8b949e] font-sans uppercase font-bold tracking-widest">A container for tasks</p>
                       </div>
                       <div className="pl-4 space-y-4">
                          <div className="flex items-center gap-2">
                             <span className="text-[#8b949e]">runs-on:</span>
                             <span className="text-purple-400">ubuntu-latest</span>
                          </div>
                          <div className="space-y-2">
                             <span className="text-[#8b949e]">steps:</span>
                             <div className="pl-4 space-y-3">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5 group-hover:border-blue-500/30 transition-all">
                                   <div className="text-blue-400">- uses: actions/checkout@v4</div>
                                   <div className="text-[9px] text-[#8b949e] mt-1 font-sans italic">Fetches your code.</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5 group-hover:border-green-500/30 transition-all">
                                   <div className="text-green-400">- run: npm test</div>
                                   <div className="text-[9px] text-[#8b949e] mt-1 font-sans italic">Executes your scripts.</div>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* SECTION 13 — MATRIX BUILDS */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
           <h2 className="text-3xl font-bold text-white tracking-tight">Matrix Builds</h2>
           <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
             Why test on one version when you can test on all of them? Matrix builds allow you to run the same job across multiple OS and software versions.
           </p>
        </div>

        <div className="max-w-5xl mx-auto p-12 bg-indigo-500/[0.03] border border-indigo-500/10 rounded-[60px] shadow-2xl relative overflow-hidden">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 font-mono text-xs">
                 <div className="p-6 bg-black/40 rounded-2xl border border-white/10 space-y-2">
                    <div className="text-[#8b949e]">strategy:</div>
                    <div className="pl-4 text-white">matrix:</div>
                    <div className="pl-8 text-blue-400">os: [ubuntu, windows, macos]</div>
                    <div className="pl-8 text-green-400">node: [18, 20, 22]</div>
                 </div>
                 <p className="text-[#8b949e] font-sans text-sm italic">"This single configuration triggers <span className="text-white font-bold">9 parallel jobs</span> automatically."</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                 {[...Array(9)].map((_, i) => (
                   <motion.div 
                    key={i} 
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="aspect-square bg-[#161B22] border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 group hover:border-blue-500/50 transition-all shadow-xl"
                   >
                      <Cpu className="w-4 h-4 text-[#8b949e] group-hover:text-blue-400 transition-colors" />
                      <div className="flex items-center gap-1">
                         <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                         <span className="text-[8px] font-bold text-white uppercase tracking-tighter">Job {i+1}</span>
                      </div>
                   </motion.div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* SECTION 12 — SECRETS MANAGEMENT */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Security & Secrets</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="p-10 bg-red-500/[0.03] border border-red-500/20 rounded-[40px] space-y-6 shadow-2xl">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                 <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight leading-tight">The Big Mistake</h3>
              <p className="text-xs text-[#8b949e] leading-relaxed italic">
                 "Never hardcode API keys or passwords in your YAML files. Anyone who can see your code can steal them."
              </p>
           </div>

           <div className="p-10 bg-green-500/[0.03] border border-green-500/20 rounded-[40px] space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <ShieldCheck className="w-16 h-16 text-green-400" />
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                 <Lock className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight leading-tight">The Professional Way</h3>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                 Use **GitHub Secrets**. Store your keys in the repo settings and access them in your workflow via the secrets context.
              </p>
              <div className="p-3 bg-black/40 rounded-xl border border-white/5 font-mono text-[10px] text-green-400">
                 {"${{ secrets.API_KEY }}"}
              </div>
           </div>
        </div>
      </section>

      {/* SECTION 19 — HANDS-ON PRACTICAL EXAMPLE */}
      <section className="space-y-20 pt-20 border-t border-white/5">
        <div className="text-center space-y-4">
          <div className="flex justify-center flex-wrap gap-3">
            {['Practical Lab', 'Real-World Automation', 'React Deployment'].map((badge, i) => (
              <span key={i} className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-yellow-500/20">
                {badge}
              </span>
            ))}
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight">Deploying a React App</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed text-center">
            Let's build a real pipeline that tests, builds, and deploys a React application automatically.
          </p>
        </div>

        <div className="space-y-32">
           {/* PART 1 — THE YAML */}
           <div className="space-y-12">
              <div className="text-center space-y-4">
                 <h3 className="text-2xl font-bold text-white">1. The .github/workflows/deploy.yml</h3>
                 <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
                    This file lives in your repository and defines the entire automation journey.
                 </p>
              </div>

              <div className="max-w-4xl mx-auto p-10 bg-[#0D1117] border border-white/10 rounded-[40px] font-mono text-xs leading-relaxed shadow-2xl relative overflow-hidden">
                 <div className="absolute top-4 right-8 px-3 py-1 bg-white/5 rounded-full text-[8px] text-[#8b949e] uppercase font-bold tracking-widest">YAML Configuration</div>
                 <div className="space-y-4">
                    <div className="text-[#8b949e]">name: <span className="text-white">Prod Deployment</span></div>
                    <div className="text-[#8b949e]">on:</div>
                    <div className="pl-4 text-[#8b949e]">push:</div>
                    <div className="pl-8 text-[#8b949e]">branches: <span className="text-green-400">[main]</span></div>
                    <div className="pt-4 text-[#8b949e]">jobs:</div>
                    <div className="pl-4 text-[#8b949e]">build-and-deploy:</div>
                    <div className="pl-8 text-[#8b949e]">runs-on: <span className="text-purple-400">ubuntu-latest</span></div>
                    <div className="pl-8 text-[#8b949e]">steps:</div>
                    <div className="pl-12 space-y-2">
                       <div className="text-blue-400">- uses: actions/checkout@v4</div>
                       <div className="text-blue-400">- uses: actions/setup-node@v4</div>
                       <div className="text-[#8b949e]">- run: <span className="text-green-400">npm install</span></div>
                       <div className="text-[#8b949e]">- run: <span className="text-green-400">npm test</span></div>
                       <div className="text-[#8b949e]">- run: <span className="text-green-400">npm run build</span></div>
                       <div className="text-blue-400">- uses: peaceiris/actions-gh-pages@v3</div>
                       <div className="pl-4 text-[#8b949e]">with:</div>
                       <div className="pl-8 text-[#8b949e]">github_token: <span className="text-yellow-400">{"${{ secrets.GITHUB_TOKEN }}"}</span></div>
                    </div>
                 </div>
              </div>
           </div>

           {/* PART 2 — PIPELINE VISUALIZATION */}
           <div className="space-y-12">
              <div className="text-center space-y-4">
                 <h3 className="text-2xl font-bold text-white">2. Pipeline in Motion</h3>
                 <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
                    Watch how GitHub executes each step in parallel or sequence.
                 </p>
              </div>

              <div className="max-w-5xl mx-auto py-20 px-12 bg-white/[0.02] border border-white/10 rounded-[60px] relative overflow-hidden shadow-2xl">
                 <div className="flex flex-col md:flex-row items-center justify-center gap-10">
                    {[
                      { label: 'Checkout', icon: FileCode, status: 'complete' },
                      { label: 'Install', icon: Box, status: 'complete' },
                      { label: 'Test', icon: CheckSquare, status: 'active' },
                      { label: 'Build', icon: Boxes, status: 'pending' },
                      { label: 'Deploy', icon: Rocket, status: 'pending' }
                    ].map((step, i) => (
                      <div key={i} className="flex flex-col md:flex-row items-center gap-10">
                         <div className="flex flex-col items-center gap-3">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-xl ${
                              step.status === 'complete' ? 'bg-green-500/10 border-green-500/40 text-green-400' :
                              step.status === 'active' ? 'bg-blue-500/10 border-blue-500/40 text-blue-400 animate-pulse' :
                              'bg-white/5 border-white/10 text-[#8b949e]'
                            }`}>
                               <step.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">{step.label}</span>
                         </div>
                         {i < 4 && <ArrowRight className="w-6 h-6 text-white/10 hidden md:block" />}
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* PART 3 — ARTIFACTS & RESULTS */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                 <h3 className="text-2xl font-bold text-white">3. Build Artifacts</h3>
                 <p className="text-[#8b949e] leading-relaxed">
                    Once the build is finished, GitHub can save the output (like your `dist` folder) as an **Artifact** so you can download it later.
                 </p>
                 <div className="p-8 bg-[#161B22] border border-white/10 rounded-[32px] flex items-center gap-6 group hover:border-yellow-400/50 transition-all shadow-xl">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <Package className="w-8 h-8 text-yellow-400" />
                    </div>
                    <div>
                       <div className="text-white font-bold text-lg">build-production.zip</div>
                       <div className="text-xs text-[#8b949e]">2.4 MB · Created 10 mins ago</div>
                    </div>
                 </div>
              </div>
              <div className="p-10 bg-indigo-500/5 border border-indigo-500/20 rounded-[40px] text-center space-y-6 shadow-2xl relative overflow-hidden group">
                 <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <TrendingUp className="w-12 h-12 text-indigo-400 mx-auto" />
                 <p className="text-xs text-[#8b949e] italic leading-relaxed font-sans">
                    "Automation improves team velocity by 40% on average. You focus on code, GitHub focuses on shipping."
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* SECTION 20 — BEST PRACTICES */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Automation Best Practices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[
             { title: 'Use Specific Versions', desc: 'Lock your actions (e.g., @v4) to prevent breaking changes from upstream updates.', icon: ShieldCheck },
             { title: 'Keep Workflows Fast', desc: 'Use caching for npm modules and dependencies to slash build times.', icon: Zap },
             { title: 'Modular Design', desc: 'Break large workflows into smaller, reusable ones to keep them maintainable.', icon: Layers },
             { title: 'Least Privilege', desc: 'Use minimal scopes for GITHUB_TOKEN to keep your repo secure.', icon: Lock },
             { title: 'Fail Fast', desc: 'Run linting and quick tests before heavy integration tests to save time.', icon: Clock },
             { title: 'Clean Up Artifacts', desc: 'Set retention policies to avoid wasting storage space on old builds.', icon: Trash2 }
           ].map((item, i) => (
             <div key={i} className="p-8 bg-[#161B22] border border-white/5 rounded-[32px] space-y-4 hover:border-white/20 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-yellow-400/10 transition-colors">
                   <item.icon className="w-5 h-5 text-yellow-400" />
                </div>
                <h4 className="text-white font-bold">{item.title}</h4>
                <p className="text-[10px] text-[#8b949e] leading-relaxed">{item.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-20 px-12 bg-gradient-to-br from-yellow-600 to-orange-700 rounded-[40px] overflow-hidden text-center group shadow-[0_0_50px_rgba(234,179,8,0.2)]">
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white tracking-tight leading-tight">Ship Smarter, Not Harder</h2>
            <p className="text-yellow-100/80 text-lg leading-relaxed">
              You've mastered the art of automation. Now, go forth and build pipelines that do the heavy lifting for you.
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className="px-10 py-5 bg-white text-orange-600 rounded-2xl font-bold text-xl shadow-2xl flex items-center gap-3 mx-auto group/btn transition-all"
          >
            Explore Security Basics
            <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </section>
    </div>
  );
};

const SecurityContent = ({ onNext }) => {
  return (
    <div className="space-y-32 pb-20">
      {/* SECTION 1 — HERO HEADER */}
      <section className="relative pt-10 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-500/10 rounded-full blur-[120px] animate-pulse" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 relative z-10"
        >
          <div className="flex justify-center flex-wrap gap-3">
            {['Cybersecurity', 'Access Control', 'Hardening'].map((badge, i) => (
              <span key={i} className="px-3 py-1 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-red-500/20">
                {badge}
              </span>
            ))}
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
              Security & Secrets
            </h1>
            <p className="text-xl text-[#8b949e] leading-relaxed max-w-2xl mx-auto">
              Secure your source code, manage sensitive credentials, and implement enterprise-grade protection workflows on RepoSphere.
            </p>
          </div>

          <div className="flex justify-center items-center gap-12 py-6 border-y border-white/5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-red-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Topic</span>
                <span className="text-[10px] text-[#8b949e]">Security & Secrets</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Book className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Difficulty</span>
                <span className="text-[10px] text-[#8b949e]">Intermediate</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Time</span>
                <span className="text-[10px] text-[#8b949e]">30 mins</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 1 — WHAT IS GITHUB SECURITY? */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">What is RepoSphere Security?</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            GitHub Security is a suite of tools and best practices designed to protect your code from vulnerabilities and your credentials from being exposed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { title: 'Code Protection', desc: 'Scan for bugs and vulnerabilities automatically.', icon: Code, color: 'text-blue-400' },
             { title: 'Identity & Access', desc: 'Ensure only the right people can access your code.', icon: Fingerprint, color: 'text-purple-400' },
             { title: 'Credential Safety', desc: 'Store API keys and passwords in encrypted vaults.', icon: Key, color: 'text-yellow-400' }
           ].map((item, i) => (
             <div key={i} className="p-8 bg-white/[0.02] border border-white/5 rounded-[32px] space-y-4 group hover:border-white/20 transition-all shadow-xl">
                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                   <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-[10px] text-[#8b949e] leading-relaxed">{item.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* SECTION 3 — GITHUB SECRETS */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Encrypted Secrets</h2>
        <div className="max-w-4xl mx-auto p-12 bg-yellow-500/[0.02] border border-yellow-500/10 rounded-[40px] space-y-12 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Lock className="w-40 h-40 text-yellow-400" />
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 relative z-10">
                 <p className="text-lg text-[#8b949e] leading-relaxed italic">
                    "Secrets are variables that you create in an organization, repository, or environment. They are encrypted and can only be used in GitHub Actions."
                 </p>
                 <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
                       <ShieldCheck className="w-6 h-6 text-green-400" />
                       <span className="text-sm text-white font-medium italic">Encrypted at rest and in transit.</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
                       <EyeOff className="w-6 h-6 text-red-400" />
                       <span className="text-sm text-white font-medium italic">Redacted from logs automatically.</span>
                    </div>
                 </div>
              </div>

              <div className="p-8 bg-black/40 border border-white/10 rounded-[32px] space-y-6 shadow-xl">
                 <div className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest border-b border-white/5 pb-2">The Secret Vault</div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                       <div className="flex items-center gap-3">
                          <Lock className="w-4 h-4 text-yellow-400" />
                          <span className="text-xs text-white font-mono">DATABASE_URL</span>
                       </div>
                       <div className="text-[8px] px-2 py-1 bg-green-500/20 text-green-400 rounded-full font-bold uppercase tracking-widest">Active</div>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                       <div className="flex items-center gap-3">
                          <Lock className="w-4 h-4 text-yellow-400" />
                          <span className="text-xs text-white font-mono">STRIPE_API_KEY</span>
                       </div>
                       <div className="text-[8px] px-2 py-1 bg-green-500/20 text-green-400 rounded-full font-bold uppercase tracking-widest">Active</div>
                    </div>
                 </div>
                 <p className="text-[9px] text-[#8b949e] text-center italic leading-relaxed">Once saved, you can never see the value again. You can only update or delete it.</p>
              </div>
           </div>
        </div>
      </section>

      {/* SECTION 7 — BRANCH PROTECTION RULES */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Branch Protection</h2>
        <div className="max-w-5xl mx-auto p-12 bg-blue-500/[0.03] border border-blue-500/10 rounded-[60px] shadow-2xl relative overflow-hidden">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                 <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white">Guarding the Mainline</h3>
                    <p className="text-sm text-[#8b949e] leading-relaxed">
                       Branch protection rules ensure that your stable code stays stable. They prevent accidents and ensure code quality.
                    </p>
                 </div>
                 <div className="space-y-4">
                    {[
                      { title: 'Require Reviews', desc: 'At least one person must approve the code.' },
                      { title: 'Require Status Checks', desc: 'Tests must pass before merging.' },
                      { title: 'Restrict Pushes', desc: 'Only admins or specific teams can push directly.' },
                      { title: 'Require Signed Commits', desc: 'Verifies the identity of the author.' }
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4 p-5 bg-white/5 border border-white/5 rounded-2xl group hover:border-blue-500/50 transition-all cursor-default">
                         <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-blue-400" />
                         </div>
                         <div>
                            <div className="text-sm font-bold text-white">{item.title}</div>
                            <div className="text-[10px] text-[#8b949e]">{item.desc}</div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="p-10 bg-black/40 border border-white/10 rounded-[40px] space-y-8 shadow-xl">
                 <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                       <ShieldAlert className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                       <div className="text-sm font-bold text-white tracking-tight">Main Branch Protected</div>
                       <div className="text-[10px] text-[#8b949e]">Default policy active</div>
                    </div>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="flex items-center gap-3 opacity-50">
                       <GitBranch className="w-4 h-4 text-white" />
                       <span className="text-xs text-white font-mono">git push origin main</span>
                    </div>
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-2">
                       <div className="flex items-center gap-2">
                          <AlertOctagon className="w-4 h-4 text-red-500" />
                          <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Push Rejected</span>
                       </div>
                       <p className="text-[9px] text-red-200/60 leading-relaxed font-mono">
                          error: protected branch hook declined.<br />
                          Required: 1 review approval.
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* SECTION 10-12 — SECURITY SCANNING */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
           <h2 className="text-3xl font-bold text-white tracking-tight">Automated Scanning</h2>
           <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
             GitHub scans your code 24/7 to find vulnerabilities before they reach production.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { title: 'Dependabot', desc: 'Alerts you about insecure libraries and opens PRs to fix them.', icon: Box, color: 'text-blue-400' },
             { title: 'Secret Scanning', desc: 'Prevents you from pushing API keys and tokens to your repo.', icon: Search, color: 'text-yellow-400' },
             { title: 'Code Scanning', desc: 'Uses CodeQL to find security flaws in your actual code logic.', icon: ShieldAlert, color: 'text-red-400' }
           ].map((item, i) => (
             <div key={i} className="p-10 bg-white/[0.02] border border-white/5 rounded-[40px] space-y-6 relative overflow-hidden group hover:border-white/20 transition-all shadow-2xl">
                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:rotate-12 transition-transform`}>
                   <item.icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <div className="space-y-2">
                   <h3 className="text-xl font-bold text-white">{item.title}</h3>
                   <p className="text-xs text-[#8b949e] leading-relaxed">{item.desc}</p>
                </div>
                <div className="pt-4 border-t border-white/5">
                   <div className="flex items-center gap-2 text-[10px] font-bold text-green-400 uppercase tracking-widest">
                      <Zap className="w-3 h-3" /> Enabled by Default
                   </div>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* SECTION 20 — HANDS-ON PRACTICAL EXAMPLE */}
      <section className="space-y-20 pt-20 border-t border-white/5">
        <div className="text-center space-y-4">
          <div className="flex justify-center flex-wrap gap-3">
            {['Practical Lab', 'Security Workflow', 'Zero Trust'].map((badge, i) => (
              <span key={i} className="px-3 py-1 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-red-500/20">
                {badge}
              </span>
            ))}
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight">A Secure PR Workflow</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed text-center">
            Let's walk through a professional, secure developer workflow from the first line of code to the final merge.
          </p>
        </div>

        <div className="space-y-32">
           {/* PART 1 — SECRETS IN ACTIONS */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                 <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white">1. Secure Actions</h3>
                    <p className="text-[#8b949e] leading-relaxed">
                       When your CI pipeline needs to deploy, it uses **Secrets** to authenticate without exposing keys.
                    </p>
                 </div>
                 <div className="p-8 bg-[#0D1117] border border-white/10 rounded-[32px] font-mono text-xs leading-relaxed shadow-xl">
                    <div className="text-[#8b949e]">- name: <span className="text-white">Deploy to Prod</span></div>
                    <div className="text-[#8b949e]">  run: <span className="text-blue-400">./deploy.sh</span></div>
                    <div className="text-[#8b949e]">  env:</div>
                    <div className="pl-4 text-[#8b949e]">DEPLOY_TOKEN: <span className="text-yellow-400">{"${{ secrets.PROD_KEY }}"}</span></div>
                 </div>
              </div>
              <div className="p-10 bg-yellow-500/[0.03] border border-yellow-500/20 rounded-[40px] space-y-6 shadow-2xl relative overflow-hidden group">
                 <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <Lock className="w-12 h-12 text-yellow-500 mx-auto" />
                 <h4 className="text-lg font-bold text-white text-center tracking-tight">The "Masking" Magic</h4>
                 <p className="text-xs text-[#8b949e] leading-relaxed text-center italic">
                    If your script accidentally prints a secret to the logs, GitHub will automatically replace it with <span className="text-white font-black">***</span> to keep it safe.
                 </p>
              </div>
           </div>

           {/* PART 2 — VULNERABILITY ALERT */}
           <div className="max-w-4xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                 <h3 className="text-2xl font-bold text-white uppercase tracking-tight">2. The Dependabot Alert</h3>
                 <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
                    Dependabot finds a critical security flaw in one of your project's libraries.
                 </p>
              </div>

              <div className="p-12 bg-red-500/[0.03] border border-red-500/20 rounded-[60px] relative overflow-hidden shadow-2xl">
                 <div className="flex flex-col items-center gap-10">
                    <div className="p-8 bg-black/60 border border-red-500/30 rounded-[32px] w-full max-w-lg space-y-6">
                       <div className="flex items-center justify-between border-b border-white/5 pb-4">
                          <div className="flex items-center gap-3">
                             <Box className="w-5 h-5 text-red-500" />
                             <span className="text-xs font-bold text-white tracking-tight">lodash @ 4.17.15</span>
                          </div>
                          <div className="text-[10px] px-3 py-1 bg-red-500/20 text-red-400 rounded-full font-black uppercase tracking-widest border border-red-500/20">Critical</div>
                       </div>
                       <div className="space-y-4">
                          <div className="text-xs text-white leading-relaxed">Vulnerability found: <span className="text-red-400 font-bold italic">Prototype Pollution</span></div>
                          <div className="text-[10px] text-[#8b949e] leading-relaxed italic">"Attackers can inject properties into existing objects, leading to arbitrary code execution."</div>
                       </div>
                       <button className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-red-400 transition-colors">
                          Open Fix Pull Request
                       </button>
                    </div>
                 </div>
              </div>
           </div>

           {/* PART 3 — SIGNED COMMITS */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="p-10 bg-green-500/5 border border-green-500/20 rounded-[40px] space-y-6 shadow-2xl group relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldCheck className="w-20 h-20 text-green-400" />
                 </div>
                 <div className="flex items-center gap-4">
                    <img src="https://github.com/identicons/codeforge.png" className="w-12 h-12 rounded-full border border-white/10" alt="Avatar" />
                    <div>
                       <div className="text-sm font-bold text-white">Update security.config</div>
                       <div className="text-[10px] text-[#8b949e]">Authored by <span className="text-white">@palla</span></div>
                    </div>
                 </div>
                 <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-lg w-fit border border-green-500/20">
                    <ShieldCheck className="w-3 h-3" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Verified</span>
                 </div>
                 <p className="text-[10px] text-[#8b949e] leading-relaxed">
                    Signed commits use GPG or SSH keys to prove that the person who made the commit is actually who they say they are.
                 </p>
              </div>
              <div className="space-y-6">
                 <h3 className="text-2xl font-bold text-white tracking-tight">3. Identity Verification</h3>
                 <p className="text-[#8b949e] leading-relaxed">
                    In high-security projects, every single commit must be **Verified**. This prevents impersonation attacks where a hacker pretends to be a trusted maintainer.
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* SECTION 21 — BEST PRACTICES */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Security Best Practices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[
             { title: 'Enable 2FA', desc: 'Always use Two-Factor Authentication for your GitHub account.', icon: Smartphone },
             { title: 'Least Privilege', desc: 'Only give the minimum permissions needed to each team member.', icon: Lock },
             { title: 'Audit Logs', desc: 'Regularly check organization audit logs for suspicious activity.', icon: History },
             { title: 'Rotate Secrets', desc: 'Change your API keys and tokens every 90 days or if a team member leaves.', icon: RefreshCw },
             { title: 'Scan Public Repos', desc: 'Treat your public repositories as the most vulnerable assets.', icon: Globe },
             { title: 'Secure Your Local Machine', desc: 'A compromised laptop means a compromised repository.', icon: Monitor }
           ].map((item, i) => (
             <div key={i} className="p-8 bg-[#161B22] border border-white/5 rounded-[32px] space-y-4 hover:border-white/20 transition-all group shadow-xl">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-red-400/10 transition-colors shadow-inner">
                   <item.icon className="w-5 h-5 text-red-400 shadow-xl" />
                </div>
                <h4 className="text-white font-bold">{item.title}</h4>
                <p className="text-[10px] text-[#8b949e] leading-relaxed">{item.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-20 px-12 bg-gradient-to-br from-red-600 to-rose-700 rounded-[40px] overflow-hidden text-center group shadow-[0_0_50px_rgba(225,29,72,0.2)]">
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">Ready for Graduation?</h2>
            <p className="text-red-100/80 text-lg leading-relaxed">
              You've mastered the architecture, the collaboration, and the security of GitHub. It's time to verify your knowledge.
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className="px-10 py-5 bg-white text-red-600 rounded-2xl font-bold text-xl shadow-2xl flex items-center gap-3 mx-auto group/btn transition-all"
          >
            Take the Master Quiz
            <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </section>
    </div>
  );
};

const GitCommandsContent = ({ onNext }) => {
  const [copiedCmd, setCopiedCmd] = useState(null);

  const handleCopy = (cmd) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const commandGroups = [
    {
      title: 'Repository Setup',
      icon: FolderOpen,
      commands: [
        { cmd: 'git init', desc: 'Initialize a new local repository.', detail: 'Turns the current directory into a Git project.' },
        { cmd: 'git clone <url>', desc: 'Clone a remote repository.', detail: 'Downloads the entire project history to your machine.' },
        { cmd: 'git config --global user.name "Your Name"', desc: 'Set your identity.', detail: 'Ensures your commits are correctly attributed.' }
      ]
    },
    {
      title: 'Tracking Changes',
      icon: Activity,
      commands: [
        { cmd: 'git status', desc: 'Check the state of your project.', detail: 'Shows modified, staged, and untracked files.' },
        { cmd: 'git add .', desc: 'Stage all changes.', detail: 'Prepares all modified files for the next commit.' },
        { cmd: 'git commit -m "Message"', desc: 'Record your changes.', detail: 'Saves a snapshot of your staged files with a description.' }
      ]
    },
    {
      title: 'Branching & Merging',
      icon: Split,
      commands: [
        { cmd: 'git branch', desc: 'List or create branches.', detail: 'Manages different versions of your project code.' },
        { cmd: 'git checkout <name>', desc: 'Switch branches.', detail: 'Moves your working directory to a different branch.' },
        { cmd: 'git merge <branch>', desc: 'Join branch histories.', detail: 'Combines changes from another branch into your current one.' }
      ]
    },
    {
      title: 'Remote Collaboration',
      icon: Globe,
      commands: [
        { cmd: 'git push origin main', desc: 'Upload local commits.', detail: 'Sends your code to the remote server (e.g., GitHub).' },
        { cmd: 'git pull', desc: 'Download and merge changes.', detail: 'Fetches updates from others and merges them into your code.' },
        { cmd: 'git fetch', desc: 'Download without merging.', detail: 'Checks for updates from the remote without changing your files.' }
      ]
    }
  ];

  return (
    <div className="space-y-32 pb-20 font-sans">
      {/* SECTION 1 — HERO HEADER */}
      <section className="relative pt-10 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-pink-500/10 rounded-full blur-[120px] animate-pulse" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 relative z-10"
        >
          <div className="flex justify-center flex-wrap gap-3">
            {['Command Line', 'Developer Tools', 'Git CLI'].map((badge, i) => (
              <span key={i} className="px-3 py-1 bg-pink-500/10 text-pink-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-pink-500/20">
                {badge}
              </span>
            ))}
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
              Git Commands
            </h1>
            <p className="text-xl text-[#8b949e] leading-relaxed max-w-2xl mx-auto italic font-medium">
              "Real developers use the terminal." Master the CLI commands that power the world's most popular version control system.
            </p>
          </div>

          <div className="flex justify-center items-center gap-12 py-6 border-y border-white/5">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-pink-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Topic</span>
                <span className="text-[10px] text-[#8b949e]">Git CLI & Syntax</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Book className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Difficulty</span>
                <span className="text-[10px] text-[#8b949e]">Beginner to Advanced</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Time</span>
                <span className="text-[10px] text-[#8b949e]">20 mins</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 2 — GIT WORKFLOW OVERVIEW */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">The Git Lifecycle</h2>
        <div className="max-w-5xl mx-auto py-16 px-8 bg-[#0D1117] border border-white/10 rounded-[60px] shadow-2xl relative overflow-hidden">
           <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              {[
                { label: 'Working Directory', desc: 'Untracked Files', icon: Folder, color: 'text-blue-400' },
                { label: 'Staging Area', desc: 'Ready for Commit', icon: Layers, color: 'text-yellow-400' },
                { label: 'Local Repo', desc: 'Committed History', icon: Database, color: 'text-green-400' },
                { label: 'Remote Repo', desc: 'Shared on RepoSphere', icon: Globe, color: 'text-purple-400' }
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-6 text-center group">
                   <div className="relative">
                      <div className={`w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center group-hover:border-solid group-hover:scale-110 transition-all duration-500 shadow-xl`}>
                         <step.icon className={`w-10 h-10 ${step.color}`} />
                      </div>
                      {i < 3 && (
                        <div className="absolute top-1/2 -right-12 -translate-y-1/2 hidden md:block opacity-20 group-hover:opacity-100 transition-opacity">
                           <ArrowRight className="w-8 h-8 text-white" />
                        </div>
                      )}
                   </div>
                   <div className="space-y-1">
                      <div className="text-sm font-bold text-white tracking-tight uppercase tracking-widest">{step.label}</div>
                      <div className="text-[10px] text-[#8b949e] italic">{step.desc}</div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* SECTION 3-12 — COMMAND CHEAT SHEET */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
           <h2 className="text-3xl font-bold text-white tracking-tight">Essential Commands</h2>
           <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed italic">
             "Click to copy any command and start your development journey."
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {commandGroups.map((group, i) => (
             <div key={i} className="p-10 bg-white/[0.02] border border-white/5 rounded-[40px] space-y-8 hover:border-white/20 transition-all group shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                   <group.icon className="w-32 h-32 text-white" />
                </div>
                
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center">
                      <group.icon className="w-6 h-6 text-pink-400" />
                   </div>
                   <h3 className="text-xl font-bold text-white tracking-tight uppercase tracking-widest">{group.title}</h3>
                </div>

                <div className="space-y-4 relative z-10">
                   {group.commands.map((c, j) => (
                     <div key={j} className="p-5 bg-black/40 border border-white/5 rounded-2xl space-y-3 group/item hover:border-pink-500/30 transition-all cursor-pointer shadow-lg" onClick={() => handleCopy(c.cmd)}>
                        <div className="flex justify-between items-center">
                           <div className="font-mono text-sm text-pink-400 font-black">{c.cmd}</div>
                           <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                              {copiedCmd === c.cmd ? (
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-[#8b949e]" />
                              )}
                           </div>
                        </div>
                        <div className="space-y-1">
                           <div className="text-xs text-white font-bold tracking-tight">{c.desc}</div>
                           <div className="text-[10px] text-[#8b949e] leading-relaxed italic">{c.detail}</div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* SECTION 9 — UNDOING CHANGES */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Undoing & Resetting</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="p-10 bg-red-500/[0.03] border border-red-500/20 rounded-[40px] space-y-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                 <RotateCcw className="w-16 h-16 text-red-400" />
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:rotate-[-45deg] transition-transform">
                 <RotateCcw className="w-6 h-6 text-red-500" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-xl font-black text-white">git reset --hard</h3>
                 <p className="text-xs text-[#8b949e] leading-relaxed italic">
                    "The nuclear option. Discards all local changes and resets to the last commit. Use with extreme caution!"
                 </p>
              </div>
              <div className="p-3 bg-black/60 rounded-xl border border-white/5 font-mono text-[10px] text-red-400">
                 # Warning: Irreversible!
              </div>
           </div>

           <div className="p-10 bg-blue-500/[0.03] border border-blue-500/20 rounded-[40px] space-y-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                 <RefreshCw className="w-16 h-16 text-blue-400" />
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:rotate-45 transition-transform">
                 <RefreshCw className="w-6 h-6 text-blue-500" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-xl font-black text-white">git revert</h3>
                 <p className="text-xs text-[#8b949e] leading-relaxed italic">
                    "The safe option. Creates a new commit that undoes the changes of a previous commit, keeping history intact."
                 </p>
              </div>
              <div className="p-3 bg-black/60 rounded-xl border border-white/5 font-mono text-[10px] text-blue-400">
                 # Best for shared branches.
              </div>
           </div>
        </div>
      </section>

      {/* SECTION 14 — HANDS-ON PRACTICAL EXAMPLE */}
      <section className="space-y-20 pt-20 border-t border-white/5">
        <div className="text-center space-y-4">
          <div className="flex justify-center flex-wrap gap-3">
            {['Practical Lab', 'CLI Workflow', 'Terminal Practice'].map((badge, i) => (
              <span key={i} className="px-3 py-1 bg-pink-500/10 text-pink-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-pink-500/20">
                {badge}
              </span>
            ))}
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight">Deploying a Portfolio</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed text-center italic font-medium">
            Walk through the exact steps a developer takes to publish their first website on RepoSphere.
          </p>
        </div>

        <div className="space-y-32">
           {/* STEP 1 — INIT */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                 <div className="space-y-4">
                    <div className="text-[10px] font-black text-pink-400 uppercase tracking-[0.2em]">Step 01</div>
                    <h3 className="text-3xl font-bold text-white">Initialize Repository</h3>
                    <p className="text-[#8b949e] leading-relaxed">
                       You've just finished your HTML/CSS portfolio. Now, turn it into a Git repository to start tracking versions.
                    </p>
                 </div>
                 <div className="p-8 bg-[#0D1117] border border-white/10 rounded-[32px] font-mono text-xs leading-relaxed shadow-xl space-y-3">
                    <div className="flex items-center gap-2 text-blue-400 opacity-50"><Terminal className="w-3 h-3" /> portfolio-project $</div>
                    <div className="text-white">git init</div>
                    <div className="text-[#8b949e] italic leading-relaxed font-sans mt-2">
                       "Initialized empty Git repository in /Users/dev/portfolio/.git/"
                    </div>
                 </div>
              </div>
              <div className="p-12 bg-white/[0.02] border border-white/5 rounded-[40px] text-center space-y-6 shadow-inner group">
                 <Folder className="w-16 h-16 text-[#8b949e] mx-auto group-hover:scale-110 transition-transform" />
                 <div className="space-y-1">
                    <div className="text-sm font-bold text-white tracking-widest uppercase">Portfolio Project</div>
                    <div className="text-[10px] text-[#8b949e] italic">.git folder added (hidden)</div>
                 </div>
              </div>
           </div>

           {/* STEP 2 — ADD & COMMIT */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1 p-10 bg-black/40 border border-white/10 rounded-[40px] space-y-6 shadow-2xl">
                 <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="ml-2 text-[10px] text-[#8b949e] font-mono">Terminal — bash</span>
                 </div>
                 <div className="space-y-4 font-mono text-xs">
                    <div className="text-[#8b949e] italic leading-relaxed"># Stage all files</div>
                    <div className="text-white">git add .</div>
                    <div className="pt-2 text-[#8b949e] italic leading-relaxed"># Record the snapshot</div>
                    <div className="text-pink-400">git commit -m "Initial portfolio release"</div>
                    <div className="pt-4 text-green-400 leading-relaxed">
                       [main (root-commit) 5f1b2c3] Initial portfolio release<br />
                       3 files changed, 450 insertions(+)<br />
                       create mode 100644 index.html
                    </div>
                 </div>
              </div>
              <div className="order-1 lg:order-2 space-y-8">
                 <div className="space-y-4">
                    <div className="text-[10px] font-black text-pink-400 uppercase tracking-[0.2em]">Step 02</div>
                    <h3 className="text-3xl font-bold text-white tracking-tight">Stage & Commit</h3>
                    <p className="text-[#8b949e] leading-relaxed italic">
                       "Staging is like posing for a photo. Committing is pressing the shutter button."
                    </p>
                 </div>
                 <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-6 group hover:border-green-500/30 transition-all shadow-xl">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                       <CheckCircle2 className="w-6 h-6 text-green-400" />
                    </div>
                    <p className="text-[10px] text-[#8b949e] leading-relaxed italic">Your progress is now saved locally. Even if you delete your code, Git can restore it.</p>
                 </div>
              </div>
           </div>

           {/* STEP 3 — REMOTE PUSH */}
           <div className="max-w-4xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                 <div className="text-[10px] font-black text-pink-400 uppercase tracking-[0.2em]">Step 03</div>
                 <h3 className="text-3xl font-bold text-white tracking-tight">Going Global</h3>
                 <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
                    Finally, push your local history to GitHub so the world can see your work.
                 </p>
              </div>

              <div className="p-12 bg-pink-500/[0.02] border border-pink-500/20 rounded-[60px] relative overflow-hidden shadow-2xl">
                 <div className="flex flex-col items-center gap-10">
                    <div className="flex items-center gap-20">
                       <div className="flex flex-col items-center gap-3 group">
                          <Monitor className="w-16 h-16 text-blue-400 group-hover:scale-110 transition-transform" />
                          <span className="text-[8px] font-bold text-white uppercase tracking-widest">Your Computer</span>
                       </div>
                       <motion.div 
                        initial={{ x: -50, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        className="flex flex-col items-center gap-2"
                       >
                          <ArrowRight className="w-10 h-10 text-pink-400 animate-pulse" />
                          <span className="text-[10px] font-mono text-pink-400">git push</span>
                       </motion.div>
                       <div className="flex flex-col items-center gap-3 group">
                          <Globe className="w-16 h-16 text-purple-400 group-hover:scale-110 transition-transform" />
                          <span className="text-[8px] font-bold text-white uppercase tracking-widest">GitHub.com</span>
                       </div>
                    </div>
                    <p className="text-[10px] text-[#8b949e] text-center italic max-w-sm leading-relaxed">
                       Congratulations! Your project is now safely stored on the cloud and accessible via your profile URL.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* SECTION 16 — COMMON MISTAKES */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Avoid These CLI Traps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[
             { title: 'Force Pushing to Main', desc: 'Rewriting history on shared branches will break your team’s workflow. Avoid --force.', icon: AlertTriangle },
             { title: 'Massive Commits', desc: 'Don’t commit 500 lines at once. Keep commits small and focused on one task.', icon: Layers },
             { title: 'Cryptic Messages', desc: '“Updated files” is useless. Use “Fix bug in login validation” instead.', icon: Type },
             { title: 'Hardcoding Secrets', desc: 'Never commit API keys. Use .gitignore to hide your .env files.', icon: Lock },
             { title: 'Forgotten Stash', desc: 'Stashing is great, but don’t forget to pop your changes back later.', icon: Clock },
             { title: 'Dirty Workspace', desc: 'Always check git status before committing to avoid adding trash files.', icon: Trash2 }
           ].map((item, i) => (
             <div key={i} className="p-8 bg-[#161B22] border border-white/5 rounded-[32px] space-y-4 hover:border-pink-500/30 transition-all group shadow-xl">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-pink-400/10 transition-colors">
                   <item.icon className="w-5 h-5 text-pink-400 shadow-xl" />
                </div>
                <h4 className="text-white font-bold">{item.title}</h4>
                <p className="text-[10px] text-[#8b949e] leading-relaxed italic">{item.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-20 px-12 bg-gradient-to-br from-pink-600 to-purple-700 rounded-[40px] overflow-hidden text-center group shadow-[0_0_50px_rgba(219,39,119,0.2)]">
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">Master the Shell</h2>
            <p className="text-pink-100/80 text-lg leading-relaxed font-medium italic">
              "You now have the power of Git in your fingertips. Time to build something legendary."
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className="px-10 py-5 bg-white text-pink-600 rounded-2xl font-bold text-xl shadow-2xl flex items-center gap-3 mx-auto group/btn transition-all"
          >
            Start the Master Quiz
            <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </section>
    </div>
  );
};

const FAQContent = ({ onNext }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);

  const categories = ['All', 'Git Basics', 'Repository', 'Workflow', 'Security', 'Advanced'];

  const faqData = [
    { 
      q: 'What is the difference between Git and GitHub?', 
      a: 'Git is the local version control tool installed on your computer. GitHub is the cloud-based platform where you host your Git repositories to collaborate with others.',
      cat: 'Git Basics'
    },
    { 
      q: 'What is a "Merge Conflict" and how do I fix it?', 
      a: 'A conflict happens when two people change the same line of code. To fix it, you must manually choose which code to keep in your editor, remove the conflict markers (<<<<<<<, =======, >>>>>>>), and commit the fix.',
      cat: 'Workflow'
    },
    { 
      q: 'Should I use SSH or HTTPS to clone?', 
      a: 'SSH is generally more secure and convenient because you don\'t have to type your password every time (using SSH keys). HTTPS is easier for beginners but requires Personal Access Tokens (PATs) for authentication.',
      cat: 'Security'
    },
    { 
      q: 'What is the difference between Fork and Clone?', 
      a: 'Cloning creates a local copy on your computer. Forking creates a copy of someone else\'s repository in your own GitHub account so you can experiment without affecting the original project.',
      cat: 'Repository'
    },
    { 
      q: 'When should I use "git rebase" instead of "git merge"?', 
      a: 'Use "git merge" to keep a complete history of how branches joined. Use "git rebase" to maintain a perfectly linear history. Never rebase on public, shared branches!',
      cat: 'Advanced'
    },
    { 
      q: 'What is a README.md file?', 
      a: 'It is the front page of your repository. It explains what the project is, how to install it, and how to contribute. It uses Markdown syntax for formatting.',
      cat: 'Repository'
    },
    { 
      q: 'What does "git push -f" do?', 
      a: 'It "force pushes" your local changes, overwriting whatever is on the server. This is dangerous and should only be used on personal feature branches where you are the only developer.',
      cat: 'Advanced'
    },
    { 
      q: 'How do I hide sensitive files like API keys?', 
      a: 'Add the filenames to a `.gitignore` file. This tells Git to never track or upload those files to GitHub. Always do this for `.env` or `node_modules`.',
      cat: 'Security'
    }
  ];

  const filteredFaqs = faqData.filter(faq => {
    const matchesCat = activeCategory === 'All' || faq.cat === activeCategory;
    const matchesSearch = faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-24 pb-20">
      {/* SECTION 1 — HERO HEADER */}
      <section className="relative pt-10 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gray-500/10 rounded-full blur-[120px] animate-pulse" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 relative z-10"
        >
          <div className="flex justify-center flex-wrap gap-3">
            {['Support', 'Knowledge Base', 'Help Center'].map((badge, i) => (
              <span key={i} className="px-3 py-1 bg-white/5 text-white/60 text-[10px] font-bold uppercase tracking-widest rounded-full border border-white/10">
                {badge}
              </span>
            ))}
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
              Common Questions
            </h1>
            <p className="text-xl text-[#8b949e] leading-relaxed max-w-2xl mx-auto italic font-medium">
              Everything you ever wanted to know about Git and GitHub, but were too afraid to ask.
            </p>
          </div>

          {/* SEARCH BAR */}
          <div className="max-w-2xl mx-auto relative group pt-4">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8b949e] group-hover:text-white transition-colors" />
             <input 
               type="text"
               placeholder="Search for questions (e.g., 'merge conflicts')..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-16 pr-6 py-5 bg-[#0D1117] border border-white/10 rounded-3xl text-white focus:outline-none focus:border-white/30 focus:ring-4 focus:ring-white/5 transition-all text-lg shadow-2xl placeholder:text-[#484f58]"
             />
          </div>
        </motion.div>
      </section>

      {/* CATEGORY TABS */}
      <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
         {categories.map((cat, i) => (
           <button
             key={i}
             onClick={() => setActiveCategory(cat)}
             className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
               activeCategory === cat 
               ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
               : 'bg-white/5 text-[#8b949e] border-white/10 hover:border-white/30 hover:text-white'
             }`}
           >
             {cat}
           </button>
         ))}
      </div>

      {/* FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto space-y-4">
         {filteredFaqs.length > 0 ? (
           filteredFaqs.map((faq, i) => (
             <motion.div 
               layout
               key={i}
               className={`border border-white/5 rounded-3xl overflow-hidden transition-all duration-500 ${expandedIndex === i ? 'bg-white/[0.03] border-white/20' : 'bg-white/[0.01] hover:bg-white/[0.02]'}`}
             >
                <button 
                  onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                  className="w-full p-8 flex items-center justify-between text-left group"
                >
                   <div className="flex items-center gap-6">
                      <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 transition-transform duration-500 ${expandedIndex === i ? 'rotate-12' : ''}`}>
                         <HelpCircle className={`w-5 h-5 ${expandedIndex === i ? 'text-white' : 'text-[#8b949e]'}`} />
                      </div>
                      <span className={`text-lg font-bold tracking-tight transition-colors ${expandedIndex === i ? 'text-white' : 'text-[#c9d1d9]'}`}>{faq.q}</span>
                   </div>
                   <div className={`p-2 rounded-full bg-white/5 transition-transform duration-500 ${expandedIndex === i ? 'rotate-180' : ''}`}>
                      <ChevronDown className="w-4 h-4 text-[#8b949e]" />
                   </div>
                </button>
                <AnimatePresence>
                   {expandedIndex === i && (
                     <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: 'circOut' }}
                     >
                        <div className="px-8 pb-8 pt-0 space-y-6">
                           <div className="w-full h-px bg-white/10" />
                           <div className="flex gap-6">
                              <Quote className="w-8 h-8 text-white/10 shrink-0" />
                              <div className="space-y-4">
                                 <p className="text-[#8b949e] leading-relaxed text-base italic">{faq.a}</p>
                                 <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-white/5 text-[#8b949e] text-[8px] font-bold uppercase tracking-widest rounded-md border border-white/10">{faq.cat}</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </motion.div>
                   )}
                </AnimatePresence>
             </motion.div>
           ))
         ) : (
           <div className="text-center py-20 space-y-4">
              <Search className="w-12 h-12 text-white/5 mx-auto" />
              <p className="text-[#8b949e] italic font-medium text-lg">"No questions found matching your search. Try a different term!"</p>
           </div>
         )}
      </section>

      {/* QUICK TIPS GRID */}
      <section className="space-y-12 pt-20 border-t border-white/5">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center">Pro Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[
             { title: 'Commit Often', desc: 'Atomic commits are easier to track and debug.', icon: GitCommit },
             { title: 'Use Descriptions', desc: 'A good commit message saves hours for your teammates.', icon: MessageSquare },
             { title: 'Always Pull First', desc: 'Avoid conflicts by syncing with remote before you start work.', icon: ArrowDown },
             { title: 'Safety Branches', desc: 'Never work directly on main. Use feature branches for everything.', icon: GitBranch },
             { title: 'Check Status', desc: 'Run "git status" before every major command to stay oriented.', icon: Terminal },
             { title: 'Read the Docs', desc: 'GitHub documentation is world-class. Use it frequently.', icon: Book }
           ].map((item, i) => (
             <div key={i} className="p-8 bg-[#161B22] border border-white/5 rounded-[32px] space-y-4 hover:border-white/20 transition-all group shadow-xl">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors shadow-inner">
                   <item.icon className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-white font-bold tracking-tight">{item.title}</h4>
                <p className="text-[10px] text-[#8b949e] leading-relaxed italic">{item.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-20 px-12 bg-gradient-to-br from-gray-600 to-slate-700 rounded-[40px] overflow-hidden text-center group shadow-[0_0_50px_rgba(255,255,255,0.05)] border border-white/10">
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase italic">Still Confused?</h2>
            <p className="text-gray-100/80 text-lg leading-relaxed font-medium">
              Join our community discussion or explore the next module to learn more about advanced collaboration.
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className="px-10 py-5 bg-white text-black rounded-2xl font-bold text-xl shadow-2xl flex items-center gap-3 mx-auto group/btn transition-all"
          >
            Explore Forks & Stars
            <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </section>
    </div>
  );
};

const ForksStarsContent = ({ onNext }) => {
  return (
    <div className="space-y-32 pb-20">
      {/* SECTION 1 — HERO HEADER */}
      <section className="relative pt-10 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-yellow-400/10 rounded-full blur-[120px] animate-pulse" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 relative z-10"
        >
          <div className="flex justify-center flex-wrap gap-3">
            {['Open Source', 'Social Coding', 'Contribution'].map((badge, i) => (
              <span key={i} className="px-3 py-1 bg-yellow-400/10 text-yellow-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-yellow-400/20">
                {badge}
              </span>
            ))}
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
              Forks & Stars
            </h1>
            <p className="text-xl text-[#8b949e] leading-relaxed max-w-2xl mx-auto italic font-medium">
              "The social fabric of GitHub." Learn how to contribute to the world's software and show your appreciation for amazing projects.
            </p>
          </div>

          <div className="flex justify-center items-center gap-12 py-6 border-y border-white/5">
            <div className="flex items-center gap-2">
              <GitFork className="w-5 h-5 text-yellow-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Activity</span>
                <span className="text-[10px] text-[#8b949e]">Fork & Contribute</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Social</span>
                <span className="text-[10px] text-[#8b949e]">Star & Discovery</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Impact</span>
                <span className="text-[10px] text-[#8b949e]">Open Source</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 1-2 — FORKS VS STARS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[40px] space-y-6 hover:border-yellow-400/20 transition-all group">
            <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 flex items-center justify-center group-hover:scale-110 transition-transform">
               <GitFork className="w-8 h-8 text-yellow-400" />
            </div>
            <h3 className="text-2xl font-black text-white italic">The Fork</h3>
            <p className="text-[#8b949e] leading-relaxed italic">
               "A copy of a repository that you manage." Forking allows you to freely experiment with changes without affecting the original project. It's the first step to contributing to open source.
            </p>
            <div className="pt-4 border-t border-white/5">
               <div className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">When to use:</div>
               <div className="text-xs text-white/60 mt-2 italic leading-relaxed">
                  To propose changes to a project you don't have write access to, or to use a project as a starting point for your own.
               </div>
            </div>
         </div>

         <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[40px] space-y-6 hover:border-yellow-400/20 transition-all group">
            <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 flex items-center justify-center group-hover:scale-110 transition-transform">
               <Star className="w-8 h-8 text-yellow-400" />
            </div>
            <h3 className="text-2xl font-black text-white italic">The Star</h3>
            <p className="text-[#8b949e] leading-relaxed italic">
               "Your personal bookmarking system." Starring a repository shows appreciation to the maintainers and makes it easier to find the project later in your 'Stars' list.
            </p>
            <div className="pt-4 border-t border-white/5">
               <div className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">Why it matters:</div>
               <div className="text-xs text-white/60 mt-2 italic leading-relaxed">
                  High star counts signal project popularity and trustworthiness to the community. It's like a "Like" button for code.
               </div>
            </div>
         </div>
      </section>

      {/* SECTION 5 — UPSTREAM DIAGRAM */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center italic">Understanding "Upstream"</h2>
        <div className="max-w-4xl mx-auto p-12 bg-[#0D1117] border border-white/10 rounded-[60px] relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 p-12 opacity-5">
              <RefreshCw className="w-48 h-48 text-white animate-spin-slow" />
           </div>
           
           <div className="flex flex-col items-center gap-16 relative z-10">
              <div className="flex flex-col items-center gap-4 group">
                 <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Globe className="w-10 h-10 text-blue-400" />
                 </div>
                 <div className="text-center">
                    <div className="text-sm font-black text-white uppercase tracking-widest">Original Repository</div>
                    <div className="text-[10px] text-blue-400 font-mono italic mt-1">"upstream"</div>
                 </div>
              </div>

              <div className="flex items-center gap-12">
                 <div className="flex flex-col items-center gap-3">
                    <ArrowRightLeft className="w-8 h-8 text-[#8b949e]" />
                    <span className="text-[8px] font-bold text-[#8b949e] uppercase tracking-widest">Syncing</span>
                 </div>
              </div>

              <div className="flex flex-col items-center gap-4 group">
                 <div className="w-20 h-20 rounded-3xl bg-yellow-400/10 border-2 border-yellow-400/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <GitFork className="w-10 h-10 text-yellow-400" />
                 </div>
                 <div className="text-center">
                    <div className="text-sm font-black text-white uppercase tracking-widest">Your Fork</div>
                    <div className="text-[10px] text-yellow-400 font-mono italic mt-1">"origin"</div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* SECTION 12 — HANDS-ON PRACTICAL EXAMPLE */}
      <section className="space-y-20 pt-20 border-t border-white/5">
        <div className="text-center space-y-4">
          <div className="flex justify-center flex-wrap gap-3">
            {['Contribution Flow', 'Open Source', 'Step-by-Step'].map((badge, i) => (
              <span key={i} className="px-3 py-1 bg-yellow-400/10 text-yellow-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-yellow-400/20">
                {badge}
              </span>
            ))}
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight italic uppercase">Your First Contribution</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed text-center italic font-medium">
            Master the "Fork and Pull" model used by millions of open-source projects.
          </p>
        </div>

        <div className="space-y-32">
           {/* STEP 1 — FORK */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                 <div className="space-y-4">
                    <div className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.2em]">Step 01</div>
                    <h3 className="text-3xl font-bold text-white tracking-tight">Fork the Repository</h3>
                    <p className="text-[#8b949e] leading-relaxed italic">
                       Click the 'Fork' button on the original project. GitHub will create a copy of the repository under your own account.
                    </p>
                 </div>
                 <div className="p-8 bg-[#161B22] border border-white/10 rounded-[40px] shadow-2xl space-y-4">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                       </div>
                       <span className="text-[10px] text-[#8b949e] font-mono italic">github.com/original/project</span>
                    </div>
                    <div className="flex justify-center py-4">
                       <button className="px-6 py-2 bg-[#21262d] border border-white/10 rounded-lg flex items-center gap-2 hover:bg-[#30363d] transition-colors shadow-xl">
                          <GitFork className="w-4 h-4 text-[#8b949e]" />
                          <span className="text-sm font-bold text-white">Fork</span>
                          <span className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] text-[#8b949e]">1.2k</span>
                       </button>
                    </div>
                 </div>
              </div>
              <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[40px] text-center space-y-6 group hover:bg-yellow-400/[0.02] transition-colors">
                 <Rocket className="w-16 h-16 text-yellow-400 mx-auto group-hover:translate-y-[-10px] transition-transform" />
                 <div className="space-y-1">
                    <div className="text-sm font-bold text-white tracking-widest uppercase">Copy Created</div>
                    <div className="text-[10px] text-[#8b949e] italic leading-relaxed">You now have complete ownership of this copy.</div>
                 </div>
              </div>
           </div>

           {/* STEP 2 — CLONE & BRANCH */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1 p-10 bg-black/40 border border-white/10 rounded-[40px] space-y-6 shadow-2xl">
                 <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <Terminal className="w-4 h-4 text-yellow-400" />
                    <span className="text-[10px] text-[#8b949e] font-mono">Terminal — bash</span>
                 </div>
                 <div className="space-y-4 font-mono text-xs leading-relaxed">
                    <div className="text-[#8b949e] italic"># Clone your copy</div>
                    <div className="text-white">git clone https://github.com/YOU/project.git</div>
                    <div className="pt-2 text-[#8b949e] italic"># Create a feature branch</div>
                    <div className="text-yellow-400">git checkout -b fix-typo</div>
                    <div className="pt-2 text-[#8b949e] italic"># Make changes and commit</div>
                    <div className="text-white italic">git commit -m "Fix typo in README"</div>
                 </div>
              </div>
              <div className="order-1 lg:order-2 space-y-8">
                 <div className="space-y-4">
                    <div className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.2em]">Step 02</div>
                    <h3 className="text-3xl font-bold text-white tracking-tight italic">Work Locally</h3>
                    <p className="text-[#8b949e] leading-relaxed italic">
                       Clone YOUR fork (not the original), create a new branch for your work, and commit your changes.
                    </p>
                 </div>
                 <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-6 group hover:border-yellow-400/30 transition-all shadow-xl">
                    <div className="w-12 h-12 rounded-xl bg-yellow-400/10 flex items-center justify-center shrink-0">
                       <CheckCircle2 className="w-6 h-6 text-yellow-400" />
                    </div>
                    <p className="text-[10px] text-[#8b949e] leading-relaxed italic italic">Never work on 'main' when contributing. Feature branches make code reviews much easier.</p>
                 </div>
              </div>
           </div>

           {/* STEP 3 — PULL REQUEST */}
           <div className="max-w-4xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                 <div className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.2em]">Step 03</div>
                 <h3 className="text-3xl font-bold text-white tracking-tight italic">Propose Changes</h3>
                 <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed italic">
                    Push your branch to your fork and open a Pull Request to the original repository's 'main' branch.
                 </p>
              </div>

              <div className="p-12 bg-yellow-400/[0.02] border border-yellow-400/20 rounded-[60px] relative overflow-hidden shadow-2xl">
                 <div className="flex flex-col items-center gap-10">
                    <div className="flex items-center gap-20">
                       <div className="flex flex-col items-center gap-3 group">
                          <GitFork className="w-16 h-16 text-yellow-400 group-hover:scale-110 transition-transform" />
                          <span className="text-[8px] font-bold text-white uppercase tracking-widest">Your Fork</span>
                       </div>
                       <motion.div 
                        initial={{ x: -50, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        className="flex flex-col items-center gap-2"
                       >
                          <ArrowRight className="w-10 h-10 text-yellow-400 animate-pulse" />
                          <span className="text-[8px] font-black text-yellow-400 uppercase italic">Pull Request</span>
                       </motion.div>
                       <div className="flex flex-col items-center gap-3 group">
                          <Globe className="w-16 h-16 text-blue-400 group-hover:scale-110 transition-transform" />
                          <span className="text-[8px] font-bold text-white uppercase tracking-widest">Original Project</span>
                       </div>
                    </div>
                    <p className="text-[10px] text-[#8b949e] text-center italic max-w-sm leading-relaxed font-medium">
                       Once the maintainer approves and merges your PR, your code becomes part of the project. You've officially contributed to open source!
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* QUICK FACTS */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center italic">Quick Facts</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[
             { title: 'Stars ≠ Popularity', desc: 'Stars are a measure of interest, but activity (commits/PRs) is a better measure of project health.', icon: Star },
             { title: 'Forking is Free', desc: 'You can fork as many public repositories as you want without any cost.', icon: GitFork },
             { title: 'Upstream Sync', desc: 'GitHub provides a "Sync fork" button to easily pull latest changes from the original repo.', icon: RefreshCw }
           ].map((fact, i) => (
             <div key={i} className="p-8 bg-white/[0.01] border border-white/5 rounded-[32px] space-y-4 hover:border-yellow-400/20 transition-all shadow-xl">
                <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center">
                   <fact.icon className="w-5 h-5 text-yellow-400 shadow-xl" />
                </div>
                <h4 className="text-white font-bold italic tracking-tight">{fact.title}</h4>
                <p className="text-[10px] text-[#8b949e] leading-relaxed italic">{fact.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-24 px-12 bg-gradient-to-br from-yellow-600 to-orange-700 rounded-[60px] overflow-hidden text-center group shadow-[0_0_50px_rgba(234,179,8,0.2)]">
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="relative z-10 space-y-10 max-w-3xl mx-auto">
          <div className="space-y-6">
            <h2 className="text-5xl font-black text-white tracking-tight leading-tight uppercase italic">Join the Community</h2>
            <p className="text-yellow-500 text-xl leading-relaxed font-black italic bg-white/10 py-4 px-8 rounded-full inline-block border border-white/20">
              "Every great developer was once a beginner who opened their first PR."
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className="px-12 py-6 bg-white text-yellow-600 rounded-[30px] font-black text-2xl shadow-2xl flex items-center gap-4 mx-auto group/btn transition-all hover:shadow-yellow-400/20"
          >
            Master the Academy Quiz
            <ArrowRight className="w-7 h-7 group-hover/btn:translate-x-2 transition-transform" />
          </motion.button>
        </div>
      </section>
    </div>
  );
};

const VideosContent = ({ onNext }) => {
  const [activePath, setActivePath] = useState('Beginner');

  const paths = ['Beginner', 'Intermediate', 'Advanced', 'DevOps'];

  const tutorials = [
    { 
      title: 'Git & GitHub Crash Course', 
      duration: '15:20', 
      difficulty: 'Beginner', 
      path: 'Beginner',
      url: 'https://www.youtube.com/embed/iv8gwPYayS0',
      desc: 'The absolute basics of version control and GitHub usage.'
    },
    { 
      title: 'Mastering the Pull Request', 
      duration: '12:45', 
      difficulty: 'Intermediate', 
      path: 'Intermediate',
      url: 'https://www.youtube.com/embed/hwP7WQkmECE',
      desc: 'Learn how to review code and merge features like a pro.'
    },
    { 
      title: 'Advanced Git Workflow', 
      duration: '25:10', 
      difficulty: 'Advanced', 
      path: 'Advanced',
      url: 'https://www.youtube.com/embed/R8_veQiYBjI',
      desc: 'Rebasing, cherry-picking, and managing complex histories.'
    },
    { 
      title: 'GitHub Actions for DevOps', 
      duration: '18:30', 
      difficulty: 'Advanced', 
      path: 'DevOps',
      url: 'https://www.youtube.com/embed/R8_veQiYBjI',
      desc: 'Automate your builds, tests, and deployments with ease.'
    }
  ];

  const filteredTutorials = tutorials.filter(t => t.path === activePath);

  return (
    <div className="space-y-32 pb-20">
      {/* SECTION 1 — HERO HEADER */}
      <section className="relative pt-10 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 relative z-10"
        >
          <div className="flex justify-center flex-wrap gap-3">
            {['Visual Academy', 'Learning Paths', 'Video Tutorials'].map((badge, i) => (
              <span key={i} className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-cyan-500/20">
                {badge}
              </span>
            ))}
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
              Video Tutorials
            </h1>
            <p className="text-xl text-[#8b949e] leading-relaxed max-w-2xl mx-auto italic font-medium">
              "See it, do it, master it." Curated video lessons to guide you from your first commit to production-grade automation.
            </p>
          </div>

          <div className="flex justify-center items-center gap-12 py-6 border-y border-white/5">
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-cyan-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Lessons</span>
                <span className="text-[10px] text-[#8b949e]">24 Modules</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Runtime</span>
                <span className="text-[10px] text-[#8b949e]">12 Hours</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Difficulty</span>
                <span className="text-[10px] text-[#8b949e]">All Levels</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* LEARNING PATH TABS */}
      <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
         {paths.map((p, i) => (
           <button
             key={i}
             onClick={() => setActivePath(p)}
             className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${
               activePath === p 
               ? 'bg-cyan-500 text-white border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]' 
               : 'bg-white/5 text-[#8b949e] border-white/10 hover:border-white/30 hover:text-white'
             }`}
           >
             {p} Path
           </button>
         ))}
      </div>

      {/* VIDEO GRID */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
         {filteredTutorials.map((vid, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: i * 0.1 }}
             className="group bg-[#0D1117] border border-white/5 rounded-[40px] overflow-hidden hover:border-cyan-500/30 transition-all shadow-2xl relative"
           >
              <div className="aspect-video relative overflow-hidden bg-black/40">
                 <iframe 
                   src={vid.url} 
                   title={vid.title} 
                   className="w-full h-full border-none opacity-80 group-hover:opacity-100 transition-opacity"
                   allowFullScreen
                 />
                 <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white flex items-center gap-2 border border-white/10">
                    <Clock className="w-3 h-3 text-cyan-400" /> {vid.duration}
                 </div>
              </div>
              <div className="p-10 space-y-4">
                 <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${vid.difficulty === 'Beginner' ? 'text-green-400' : vid.difficulty === 'Intermediate' ? 'text-yellow-400' : 'text-red-400'}`}>
                       {vid.difficulty}
                    </span>
                    <div className="flex items-center gap-1">
                       {[1,2,3,4,5].map(star => <Star key={star} className="w-3 h-3 text-cyan-400" />)}
                    </div>
                 </div>
                 <h3 className="text-xl font-bold text-white tracking-tight">{vid.title}</h3>
                 <p className="text-xs text-[#8b949e] leading-relaxed italic">{vid.desc}</p>
                 <div className="pt-4 flex items-center gap-4">
                    <button className="flex-1 py-4 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-inner">
                       Resume Lesson
                    </button>
                    <button className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all">
                       <Plus className="w-4 h-4" />
                    </button>
                 </div>
              </div>
           </motion.div>
         ))}
      </section>

      {/* RECOMMENDED LEARNING PATH */}
      <section className="space-y-12 pt-20 border-t border-white/5">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center italic">The Mastery Roadmap</h2>
        <div className="max-w-4xl mx-auto space-y-8 relative">
           <div className="absolute top-0 bottom-0 left-8 w-px bg-white/5 border-l border-dashed border-white/20" />
           
           {[
             { title: 'The Starting Line', desc: 'Git basics, local repositories, and first commits.', icon: Flag, status: 'Completed' },
             { title: 'The Cloud Shift', desc: 'Pushing to GitHub, cloning, and remote collaboration.', icon: Cloud, status: 'In Progress' },
             { title: 'Team Player', desc: 'Pull Requests, code reviews, and issue tracking.', icon: Users, status: 'Locked' },
             { title: 'Automation Master', desc: 'GitHub Actions, CI/CD pipelines, and webhooks.', icon: Zap, status: 'Locked' }
           ].map((step, i) => (
             <div key={i} className="flex gap-12 group relative z-10">
                <div className={`w-16 h-16 rounded-2xl ${step.status === 'Completed' ? 'bg-green-500/10 border-green-500/30' : step.status === 'In Progress' ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-white/5 border-white/10'} border-2 flex items-center justify-center shrink-0 transition-all group-hover:scale-110 shadow-xl`}>
                   <step.icon className={`w-6 h-6 ${step.status === 'Completed' ? 'text-green-400' : step.status === 'In Progress' ? 'text-cyan-400' : 'text-[#8b949e]'}`} />
                </div>
                <div className="space-y-2 py-2">
                   <div className="flex items-center gap-3">
                      <h4 className="text-lg font-bold text-white tracking-tight">{step.title}</h4>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${step.status === 'Completed' ? 'bg-green-400/10 text-green-400' : step.status === 'In Progress' ? 'bg-cyan-400/10 text-cyan-400' : 'bg-white/5 text-[#8b949e]'}`}>
                         {step.status}
                      </span>
                   </div>
                   <p className="text-sm text-[#8b949e] italic leading-relaxed">{step.desc}</p>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-24 px-12 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-[60px] overflow-hidden text-center group shadow-[0_0_50px_rgba(6,182,212,0.2)]">
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="relative z-10 space-y-10 max-w-3xl mx-auto">
          <div className="space-y-6">
            <h2 className="text-5xl font-black text-white tracking-tight leading-tight uppercase italic">Start Your Project</h2>
            <p className="text-cyan-100/80 text-xl leading-relaxed font-medium italic">
              "Don't just watch. Code along with our practice repositories and build your profile."
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className="px-12 py-6 bg-white text-cyan-600 rounded-[30px] font-black text-2xl shadow-2xl flex items-center gap-4 mx-auto group/btn transition-all"
          >
            Explore Best Practices
            <ArrowRight className="w-7 h-7 group-hover/btn:translate-x-2 transition-transform" />
          </motion.button>
        </div>
      </section>
    </div>
  );
};

const BestPracticesContent = ({ onNext }) => {
  return (
    <div className="space-y-32 pb-20">
      {/* SECTION 1 — HERO HEADER */}
      <section className="relative pt-10 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-green-500/10 rounded-full blur-[120px] animate-pulse" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 relative z-10"
        >
          <div className="flex justify-center flex-wrap gap-3">
            {['Professional Grade', 'Engineering habits', 'Clean Code'].map((badge, i) => (
              <span key={i} className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-500/20">
                {badge}
              </span>
            ))}
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
              Best Practices
            </h1>
            <p className="text-xl text-[#8b949e] leading-relaxed max-w-2xl mx-auto italic font-medium">
              "How senior engineers build software." Master the habits that differentiate professional developers from hobbyists.
            </p>
          </div>

          <div className="flex justify-center items-center gap-12 py-6 border-y border-white/5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Standards</span>
                <span className="text-[10px] text-[#8b949e]">Industry Approved</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Teamwork</span>
                <span className="text-[10px] text-[#8b949e]">Collaboration Rules</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Hygiene</span>
                <span className="text-[10px] text-[#8b949e]">Clean Repositories</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 2 — COMMIT MESSAGES (GOOD VS BAD) */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center italic">The Art of the Commit</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
           <div className="p-10 bg-red-500/[0.03] border border-red-500/20 rounded-[40px] space-y-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                 <ThumbsDown className="w-16 h-16 text-red-400" />
              </div>
              <h3 className="text-xl font-black text-red-400 uppercase tracking-widest italic">Avoid These</h3>
              <div className="space-y-4 font-mono text-xs">
                 {['git commit -m "update"', 'git commit -m "fixed bug"', 'git commit -m "added some files"', 'git commit -m "it works now!!!"'].map((msg, i) => (
                   <div key={i} className="p-3 bg-black/40 rounded-xl border border-white/5 text-[#8b949e] italic line-through opacity-50">
                      {msg}
                   </div>
                 ))}
              </div>
              <p className="text-[10px] text-[#8b949e] leading-relaxed italic">
                 Vague messages make it impossible to track down bugs or understand project history months later.
              </p>
           </div>

           <div className="p-10 bg-green-500/[0.03] border border-green-500/20 rounded-[40px] space-y-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                 <ThumbsUp className="w-16 h-16 text-green-400" />
              </div>
              <h3 className="text-xl font-black text-green-400 uppercase tracking-widest italic">Use These</h3>
              <div className="space-y-4 font-mono text-xs">
                 {[
                   'fix(auth): resolve login timeout on slow connections',
                   'feat(ui): add dark mode toggle to navigation',
                   'docs(readme): update installation steps for windows',
                   'refactor(core): optimize database query performance'
                 ].map((msg, i) => (
                   <div key={i} className="p-3 bg-black/60 rounded-xl border border-green-500/20 text-green-400 font-bold">
                      {msg}
                   </div>
                 ))}
              </div>
              <p className="text-[10px] text-[#8b949e] leading-relaxed italic">
                 Standardized prefixes (fix, feat, docs) help automate changelogs and assist teammates in scanning history.
              </p>
           </div>
        </div>
      </section>

      {/* SECTION 3 — BRANCH NAMING */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center italic">Branching Strategy</h2>
        <div className="max-w-4xl mx-auto p-12 bg-[#0D1117] border border-white/10 rounded-[60px] shadow-2xl relative overflow-hidden">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
              <div className="space-y-6">
                 <div className="p-6 bg-white/5 rounded-3xl space-y-3 border border-white/10 hover:border-blue-400/30 transition-all">
                    <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">New Features</div>
                    <div className="font-mono text-sm text-white">feature/user-profile-v2</div>
                 </div>
                 <div className="p-6 bg-white/5 rounded-3xl space-y-3 border border-white/10 hover:border-red-400/30 transition-all">
                    <div className="text-[10px] font-black text-red-400 uppercase tracking-widest">Bug Fixes</div>
                    <div className="font-mono text-sm text-white">bugfix/fix-header-overlap</div>
                 </div>
              </div>
              <div className="space-y-6">
                 <div className="p-6 bg-white/5 rounded-3xl space-y-3 border border-white/10 hover:border-yellow-400/30 transition-all">
                    <div className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">Documentation</div>
                    <div className="font-mono text-sm text-white">docs/update-api-spec</div>
                 </div>
                 <div className="p-6 bg-white/5 rounded-3xl space-y-3 border border-white/10 hover:border-green-400/30 transition-all">
                    <div className="text-[10px] font-black text-green-400 uppercase tracking-widest">Urgent Hotfixes</div>
                    <div className="font-mono text-sm text-white">hotfix/server-crash-patch</div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* SECTION 4 — PULL REQUEST QUALITY */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center italic">Professional Pull Requests</h2>
        <div className="max-w-4xl mx-auto p-12 bg-[#161B22] border border-white/10 rounded-[60px] shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
              <GitPullRequest className="w-64 h-64 text-white" />
           </div>
           
           <div className="space-y-8 relative z-10">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center">
                    <Edit3 className="w-8 h-8 text-blue-400" />
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white">The PR Checklist</h3>
                    <p className="text-xs text-[#8b949e] italic">Follow these steps before hitting "Create Pull Request".</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                 {[
                   'Self-review your code first',
                   'Include screenshots for UI changes',
                   'Explain "Why" not just "What"',
                   'Link the related GitHub Issue',
                   'Pass all automated CI checks',
                   'Keep it under 500 lines of code'
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-4 group/item">
                      <div className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0 border border-green-500/20 group-hover/item:bg-green-500/20 transition-all">
                         <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                      </div>
                      <span className="text-sm text-[#c9d1d9] italic group-hover/item:text-white transition-colors">{item}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* SECTION 18 — HANDS-ON PRACTICAL EXAMPLE */}
      <section className="space-y-20 pt-20 border-t border-white/5">
        <div className="text-center space-y-4">
          <div className="flex justify-center flex-wrap gap-3">
            {['Expert Flow', 'Engineering Standards', 'Team Habits'].map((badge, i) => (
              <span key={i} className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-500/20">
                {badge}
              </span>
            ))}
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight uppercase italic">The Senior Workflow</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto leading-relaxed text-center italic font-medium">
             "Work like a pro, even if you're alone." Implementing industrial standards in your personal projects.
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-12">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {[
                { title: 'Semantic Versioning', desc: 'Use v1.2.3 (Major.Minor.Patch) to signal the size of your updates.', icon: Tag, color: 'text-blue-400' },
                { title: 'Code Reviews', desc: 'Always request a review. Even a second pair of eyes finds hidden bugs.', icon: Eye, color: 'text-purple-400' },
                { title: 'Automated Linting', desc: 'Use tools to auto-format code so your team stays consistent.', icon: Zap, color: 'text-yellow-400' }
              ].map((item, i) => (
                <div key={i} className="p-8 bg-white/[0.01] border border-white/5 rounded-[40px] space-y-4 hover:border-green-400/20 transition-all shadow-xl group">
                   <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                   </div>
                   <h4 className="text-white font-bold tracking-tight italic">{item.title}</h4>
                   <p className="text-[10px] text-[#8b949e] leading-relaxed italic">{item.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-24 px-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-[60px] overflow-hidden text-center group shadow-[0_0_50px_rgba(16,185,129,0.2)]">
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="relative z-10 space-y-10 max-w-3xl mx-auto">
          <div className="space-y-6">
            <h2 className="text-5xl font-black text-white tracking-tight leading-tight uppercase italic">Master the Academy</h2>
            <p className="text-green-500 text-xl leading-relaxed font-black italic bg-white/10 py-4 px-8 rounded-full inline-block border border-white/20">
              "You are now ready to build production-grade software."
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNext()}
            className="px-12 py-6 bg-white text-green-600 rounded-[30px] font-black text-2xl shadow-2xl flex items-center gap-4 mx-auto group/btn transition-all"
          >
            Start Final Assessment
            <ArrowRight className="w-7 h-7 group-hover/btn:translate-x-2 transition-transform" />
          </motion.button>
        </div>
      </section>
    </div>
  );
};

const QuickRevisionContent = ({ onNext }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeMode, setActiveMode] = useState('Flashcards');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const categories = [
    { name: 'Git Basics', icon: Brain, count: 8, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { name: 'Repositories', icon: Box, count: 4, color: 'text-green-400', bg: 'bg-green-400/10' },
    { name: 'Branches', icon: GitBranch, count: 5, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { name: 'Pull Requests', icon: GitPullRequest, count: 4, color: 'text-red-400', bg: 'bg-red-400/10' },
    { name: 'CI/CD', icon: Zap, count: 5, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { name: 'Security', icon: Shield, count: 4, color: 'text-red-500', bg: 'bg-red-500/10' },
    { name: 'Commands', icon: Terminal, count: 13, color: 'text-pink-400', bg: 'bg-pink-400/10' }
  ];

  const flashcards = [
    { cat: 'Git Basics', q: 'What is Git?', a: 'A distributed version control system for tracking code changes.' },
    { cat: 'Git Basics', q: 'What is version control?', a: 'A system that tracks changes to files over time.' },
    { cat: 'Git Basics', q: 'Who created Git?', a: 'Linus Torvalds.' },
    { cat: 'Git Basics', q: 'What is a commit?', a: 'A snapshot of project changes saved in history.' },
    { cat: 'Git Basics', q: 'What is staging?', a: 'Preparing files before committing them.' },
    { cat: 'Git Basics', q: 'What is a repository?', a: 'A project folder tracked by Git.' },
    { cat: 'Git Basics', q: 'Local vs Remote?', a: 'Local is on your machine; Remote is on RepoSphere/cloud.' },
    { cat: 'Git Basics', q: 'Why use Git?', a: 'To track history, collaborate safely, and manage versions.' },
    
    { cat: 'Repositories', q: 'What is README.md?', a: 'Documentation explaining the project.' },
    { cat: 'Repositories', q: 'What is .gitignore?', a: 'A file specifying ignored files/folders.' },
    { cat: 'Repositories', q: 'Public vs Private?', a: 'Public is visible to everyone; Private is restricted.' },
    { cat: 'Repositories', q: 'What does a repo contain?', a: 'Source code, history, branches, and docs.' },

    { cat: 'Branches', q: 'What is a branch?', a: 'An independent line of development.' },
    { cat: 'Branches', q: 'Why use feature branches?', a: 'To build features safely without affecting main.' },
    { cat: 'Branches', q: 'What is the main branch?', a: 'The stable production-ready branch.' },
    { cat: 'Branches', q: 'What is merging?', a: 'Combining changes from branches together.' },
    { cat: 'Branches', q: 'What is a merge conflict?', a: 'Incompatible changes in the same file location.' },

    { cat: 'Pull Requests', q: 'What is a Pull Request?', a: 'A request to merge code between branches.' },
    { cat: 'Pull Requests', q: 'Why use PRs?', a: 'They enable code reviews and safe collaboration.' },
    { cat: 'Pull Requests', q: 'What is code review?', a: 'Reviewing changes before they are merged.' },
    { cat: 'Pull Requests', q: 'What is a draft PR?', a: 'A work-in-progress PR for early feedback.' },

    { cat: 'CI/CD', q: 'What is CI?', a: 'Continuous Integration: frequent code merging and testing.' },
    { cat: 'CI/CD', q: 'What is CD?', a: 'Continuous Deployment/Delivery: automated shipping.' },
    { cat: 'CI/CD', q: 'What is RepoSphere Actions?', a: 'RepoSphere workflow automation platform.' },
    { cat: 'CI/CD', q: 'What triggers workflows?', a: 'Events like push, pull_request, or release.' },
    { cat: 'CI/CD', q: 'What is a runner?', a: 'A machine executing workflow jobs.' },

    { cat: 'Security', q: 'What are GitHub Secrets?', a: 'Secure encrypted environment variables.' },
    { cat: 'Security', q: 'Why avoid hardcoding keys?', a: 'It exposes sensitive credentials publicly.' },
    { cat: 'Security', q: 'What is branch protection?', a: 'Rules preventing unsafe changes to main branches.' },
    { cat: 'Security', q: 'What is 2FA?', a: 'Two-Factor Authentication for account security.' },

    { cat: 'Commands', q: 'git init', a: 'Creates a new Git repository.' },
    { cat: 'Commands', q: 'git clone', a: 'Downloads a repository locally.' },
    { cat: 'Commands', q: 'git status', a: 'Shows modified/staged files.' },
    { cat: 'Commands', q: 'git add .', a: 'Stages all changes.' },
    { cat: 'Commands', q: 'git commit -m', a: 'Saves changes with a message.' },
    { cat: 'Commands', q: 'git push', a: 'Uploads changes to remote.' },
    { cat: 'Commands', q: 'git pull', a: 'Downloads latest remote changes.' },
    { cat: 'Commands', q: 'git branch', a: 'Lists or creates branches.' },
    { cat: 'Commands', q: 'git checkout -b', a: 'Creates and switches to a branch.' },
    { cat: 'Commands', q: 'git merge', a: 'Combines branch changes.' },
    { cat: 'Commands', q: 'git stash', a: 'Temporarily saves uncommitted changes.' },
    { cat: 'Commands', q: 'git reset', a: 'Resets changes/history.' },
    { cat: 'Commands', q: 'git revert', a: 'Reverts a previous commit safely.' }
  ];

  const filteredCards = activeCategory === 'All' 
    ? flashcards 
    : flashcards.filter(f => f.cat === activeCategory);

  const handleNext = () => {
    setIsFlipped(false);
    if (currentCardIndex < filteredCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
    }
  };

  const resetRevision = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowResult(false);
  };

  return (
    <div className="space-y-32 pb-20">
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
      {/* SECTION 1 — HERO HEADER */}
      <section className="relative pt-10 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-yellow-400/10 rounded-full blur-[120px] animate-pulse" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 relative z-10"
        >
          <div className="flex justify-center flex-wrap gap-3">
            {['Active Recall', 'Interactive Learning', 'Developer Practice'].map((badge, i) => (
              <span key={i} className="px-3 py-1 bg-yellow-400/10 text-yellow-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-yellow-400/20">
                {badge}
              </span>
            ))}
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
              Quick Revision
            </h1>
            <p className="text-xl text-[#8b949e] leading-relaxed max-w-3xl mx-auto italic font-medium">
              "Master concepts through active recall." Reinforce your Git & GitHub knowledge with interactive flashcards and challenges.
            </p>
          </div>

          <div className="flex justify-center items-center gap-12 py-6 border-y border-white/5">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-yellow-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">All Topics</span>
                <span className="text-[10px] text-[#8b949e]">Full Coverage</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Interactive</span>
                <span className="text-[10px] text-[#8b949e]">Flashcards Mode</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-400" />
              <div className="text-left">
                <span className="block text-sm font-bold text-white leading-none">Intermediate</span>
                <span className="text-[10px] text-[#8b949e]">Difficulty Level</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 2 — REVISION CATEGORIES */}
      <section className="space-y-12">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white tracking-tight">Revision Categories</h2>
          <button 
            onClick={() => setActiveCategory('All')}
            className={`text-sm font-bold ${activeCategory === 'All' ? 'text-yellow-400' : 'text-[#8b949e] hover:text-white'} transition-colors`}
          >
            Reset Filters
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {categories.map((cat, i) => (
            <motion.button
              key={i}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveCategory(cat.name);
                setCurrentCardIndex(0);
                setIsFlipped(false);
                setShowResult(false);
              }}
              className={`p-6 rounded-[32px] border transition-all text-center space-y-3 group ${
                activeCategory === cat.name 
                  ? 'bg-yellow-400/10 border-yellow-400/30' 
                  : 'bg-[#161B22] border-white/5 hover:border-white/20'
              }`}
            >
              <div className={`w-10 h-10 mx-auto rounded-xl ${cat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <cat.icon className={`w-5 h-5 ${cat.color}`} />
              </div>
              <div>
                <span className="block text-xs font-bold text-white truncate">{cat.name}</span>
                <span className="text-[9px] text-[#8b949e]">{cat.count} Cards</span>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* SECTION 3 — INTERACTIVE FLASHCARDS */}
      <section className="max-w-3xl mx-auto space-y-12 py-10">
        {!showResult ? (
          <div className="space-y-10">
            <div className="flex items-center justify-between text-[#8b949e] font-mono text-xs uppercase tracking-widest">
              <span>Category: <span className="text-white">{filteredCards[currentCardIndex].cat}</span></span>
              <span>Card {currentCardIndex + 1} of {filteredCards.length}</span>
            </div>

            {/* THE CARD */}
            <div 
              className="relative h-[400px] w-full cursor-pointer perspective-1000 group"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <motion.div
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                className="w-full h-full relative preserve-3d"
              >
                {/* FRONT */}
                <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-[#1C2128] to-[#161B22] border-2 border-white/5 rounded-[48px] flex flex-col items-center justify-center p-12 text-center shadow-2xl space-y-8 group-hover:border-white/10 transition-colors">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                    <HelpCircle className="w-8 h-8 text-[#8b949e]" />
                  </div>
                  <h3 className="text-3xl font-bold text-white leading-tight">
                    {filteredCards[currentCardIndex].q}
                  </h3>
                  <p className="text-sm text-[#8b949e] italic animate-pulse">
                    Click to flip
                  </p>
                </div>

                {/* BACK */}
                <div 
                  className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-yellow-400/5 to-yellow-400/10 border-2 border-yellow-400/20 rounded-[48px] flex flex-col items-center justify-center p-12 text-center shadow-2xl space-y-8 rotate-y-180"
                >
                  <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div className="space-y-4">
                    <span className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.2em]">Answer</span>
                    <p className="text-2xl font-bold text-white leading-relaxed">
                      {filteredCards[currentCardIndex].a}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* CONTROLS */}
            <div className="flex items-center justify-center gap-6">
              <motion.button
                whileHover={{ x: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                disabled={currentCardIndex === 0}
                className={`p-5 rounded-full border border-white/5 bg-[#161B22] shadow-xl text-white disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                <ArrowLeft className="w-6 h-6" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => { e.stopPropagation(); setIsFlipped(!isFlipped); }}
                className="px-10 py-5 bg-white text-black rounded-2xl font-bold text-lg shadow-2xl flex items-center gap-3 transition-all"
              >
                {isFlipped ? 'Show Question' : 'Reveal Answer'}
              </motion.button>

              <motion.button
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="p-5 rounded-full border border-white/5 bg-[#161B22] shadow-xl text-white"
              >
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-16 bg-[#161B22] border border-white/5 rounded-[48px] text-center space-y-8 shadow-2xl"
          >
            <div className="w-24 h-24 mx-auto bg-green-500/10 rounded-[32px] flex items-center justify-center">
              <Rocket className="w-12 h-12 text-green-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-black text-white italic uppercase tracking-tight">Revision Complete!</h3>
              <p className="text-[#8b949e] italic">"Repetition is the mother of skill."</p>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <span className="block text-2xl font-black text-white">{filteredCards.length}</span>
                <span className="text-[10px] text-[#8b949e] uppercase">Cards Reviewed</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <span className="block text-2xl font-black text-yellow-400">100%</span>
                <span className="text-[10px] text-[#8b949e] uppercase">Accuracy</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button 
                onClick={resetRevision}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/10"
              >
                Try Again
              </button>
              <button 
                onClick={onNext}
                className="px-8 py-4 bg-yellow-400 text-black rounded-2xl font-bold transition-all shadow-xl shadow-yellow-400/20"
              >
                Finish Module
              </button>
            </div>
          </motion.div>
        )}
      </section>

      {/* SECTION 4 — COMMAND CHALLENGE (RAPID RECALL) */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black text-white tracking-tight uppercase italic">Command Rapid Recall</h2>
          <p className="text-[#8b949e] max-w-2xl mx-auto italic">Test your memory on the most essential Git CLI commands.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[
             { q: 'Create a new repo', cmd: 'git init', icon: Plus },
             { q: 'Stage all changes', cmd: 'git add .', icon: CheckSquare },
             { q: 'Save with message', cmd: 'git commit -m', icon: Edit3 },
             { q: 'Switch to new branch', cmd: 'git checkout -b', icon: GitBranch },
             { q: 'Upload to GitHub', cmd: 'git push', icon: ArrowUpRight },
             { q: 'Get latest updates', cmd: 'git pull', icon: ArrowDown }
           ].map((challenge, i) => (
             <div key={i} className="group p-8 bg-[#161B22] border border-white/5 rounded-[40px] space-y-6 hover:border-yellow-400/30 transition-all shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <challenge.icon className="w-16 h-16 text-yellow-400" />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">Scenario</span>
                  <h4 className="text-xl font-bold text-white leading-tight">{challenge.q}</h4>
                </div>
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 font-mono text-sm text-[#8b949e] flex items-center justify-between group/code cursor-help">
                   <span className="opacity-0 group-hover:opacity-100 transition-opacity text-yellow-400 font-bold">{challenge.cmd}</span>
                   <span className="group-hover:hidden italic opacity-50">Hover to reveal...</span>
                   <Terminal className="w-4 h-4 opacity-30" />
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* SECTION 5 — WORKFLOW REVISION DIAGRAMS */}
      <section className="p-12 bg-gradient-to-br from-[#1C2128] to-[#0D1117] rounded-[50px] border border-white/5 shadow-2xl space-y-16 overflow-hidden relative group">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]" />
        
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black text-white tracking-tight uppercase italic">The Perfect PR Workflow</h2>
          <p className="text-[#8b949e] max-w-xl mx-auto italic font-medium leading-relaxed">
            Revise the professional sequence of steps for collaborating on a production codebase.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-white/5 -translate-y-1/2 hidden lg:block" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {[
              { step: 1, title: 'Branch', desc: 'Isolate changes from main.', icon: GitBranch, color: 'text-blue-400' },
              { step: 2, title: 'Commit', desc: 'Snapshots of your progress.', icon: GitCommit, color: 'text-purple-400' },
              { step: 3, title: 'Push', desc: 'Sync your local work to cloud.', icon: Rocket, color: 'text-green-400' },
              { step: 4, title: 'Review', desc: 'Teammates verify your code.', icon: Eye, color: 'text-yellow-400' }
            ].map((node, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 bg-[#161B22] border border-white/5 rounded-[40px] text-center space-y-6 shadow-2xl hover:border-white/20 transition-all"
              >
                <div className="w-16 h-16 mx-auto rounded-3xl bg-white/5 flex items-center justify-center relative shadow-inner">
                  <node.icon className={`w-8 h-8 ${node.color}`} />
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-white text-black text-xs font-black rounded-full flex items-center justify-center border-2 border-[#161B22]">
                    {node.step}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-black text-white tracking-tight">{node.title}</h4>
                  <p className="text-xs text-[#8b949e] leading-relaxed italic">{node.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — SCENARIO CHALLENGES */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold text-white tracking-tight text-center italic">Scenario Survival Lab</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="p-10 bg-red-500/[0.03] border border-red-500/20 rounded-[40px] space-y-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                 <ShieldAlert className="w-16 h-16 text-red-400" />
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:rotate-12 transition-transform">
                 <ShieldAlert className="w-6 h-6 text-red-500" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-xl font-black text-white">The Secret Leak</h3>
                 <p className="text-xs text-[#8b949e] leading-relaxed italic">
                    "You accidentally pushed an API key to a public repo. What is the immediate first step?"
                 </p>
              </div>
              <div className="p-4 bg-black/60 rounded-xl border border-white/5 font-mono text-[10px] text-red-400 italic">
                 # Answer: Rotate/Revoke the key immediately!
              </div>
           </div>

           <div className="p-10 bg-blue-500/[0.03] border border-blue-500/20 rounded-[40px] space-y-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                 <RefreshCw className="w-16 h-16 text-blue-400" />
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:rotate-180 transition-transform duration-700">
                 <RefreshCw className="w-6 h-6 text-blue-500" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-xl font-black text-white">Wrong Branch Blues</h3>
                 <p className="text-xs text-[#8b949e] leading-relaxed italic">
                    "You spent 3 hours coding only to realize you are on the 'main' branch. How do you move your work safely?"
                 </p>
              </div>
              <div className="p-4 bg-black/60 rounded-xl border border-white/5 font-mono text-[10px] text-blue-400 italic">
                 # Answer: Use 'git stash', switch branches, then 'git stash pop'.
              </div>
           </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-24 px-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-[60px] overflow-hidden text-center group shadow-[0_0_50px_rgba(234,179,8,0.2)]">
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="relative z-10 space-y-10 max-w-3xl mx-auto">
          <div className="space-y-6">
            <h2 className="text-5xl font-black text-white tracking-tight leading-tight uppercase italic">You're Becoming a Real Developer</h2>
            <p className="text-yellow-100 text-xl leading-relaxed font-black italic bg-black/20 py-4 px-8 rounded-full inline-block border border-white/10">
              "Confidence comes from active recall."
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetRevision}
              className="px-12 py-6 bg-white text-yellow-600 rounded-[30px] font-black text-2xl shadow-2xl flex items-center gap-4 group/btn transition-all"
            >
              Restart Revision
              <RotateCcw className="w-7 h-7 group-hover/btn:-rotate-45 transition-transform" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNext}
              className="px-12 py-6 bg-black text-white rounded-[30px] font-black text-2xl shadow-2xl flex items-center gap-4 group/btn transition-all border border-white/10"
            >
              Final Assessment
              <ArrowRight className="w-7 h-7 group-hover/btn:translate-x-2 transition-transform" />
            </motion.button>
          </div>
        </div>
      </section>
    </div>
  );
};

const GitHubCompanion = () => {
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState('intro');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'bot', text: 'Hi! I am your RepoSphere Assistant. Ask me anything about Git or GitHub!' }
  ]);
  const [copiedCmd, setCopiedCmd] = useState(null);
  
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({ container: scrollRef });
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const filteredSections = SECTION_DATA.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeData = SECTION_DATA.find(s => s.id === activeSection);

  const handleNextSection = () => {
    const idx = SECTION_DATA.findIndex(s => s.id === activeSection);
    if (idx < SECTION_DATA.length - 1) setActiveSection(SECTION_DATA[idx+1].id);
  };

  const handleCopy = (cmd) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    const userMsg = chatMessage;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatMessage('');
    
    // Simple mock response logic
    setTimeout(() => {
      let response = "That's a great question! You can find more about that in the '" + activeData.title + "' section above. For professional workflows, we recommend checking our Git Commands section.";
      
      const lowMsg = userMsg.toLowerCase();
      if (lowMsg.includes('branch')) {
        response = "Branches are parallel versions of your code. Pro tip: Always use `git switch -c <name>` to start a new feature safely without breaking the main branch!";
      } else if (lowMsg.includes('repo') || lowMsg.includes('repository')) {
        response = "A repository is your project's home on RepoSphere. It stores all files, history, and configuration. Think of it as a highly advanced project folder!";
      } else if (lowMsg.includes('pr') || lowMsg.includes('pull request')) {
        response = "Pull Requests (PRs) are the heart of collaboration. They allow you to propose changes and get them reviewed by teammates before merging.";
      } else if (lowMsg.includes('commit')) {
        response = "A commit is a snapshot of your project. Professional tip: Keep commits small and use descriptive messages like 'fix: resolve navbar overlap on mobile'.";
      } else if (lowMsg.includes('security') || lowMsg.includes('secret')) {
        response = "Never push secrets like API keys to GitHub! Use 'GitHub Secrets' in your repository settings and access them via environment variables.";
      } else if (lowMsg.includes('conflict')) {
        response = "Merge conflicts happen when two people change the same line. Don't panic! Open the file, choose the correct code, remove the markers, and commit.";
      }
      
      setChatHistory(prev => [...prev, { role: 'bot', text: response }]);
    }, 1000);
  };

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-[#0D1117] text-[#c9d1d9]' : 'bg-[#f8fafc] text-slate-800 companion-light-mode'} font-sans overflow-hidden`}>
      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-[#58A6FF] z-[60] origin-left"
        style={{ scaleX }}
      />

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-72 bg-[#161B22] border-r border-white/10 flex flex-col z-50 shrink-0"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GithubIcon className="w-12 h-12 object-contain" />

                <h2 className="font-bold text-white text-lg tracking-tight">Companion</h2>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-white/5 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b949e]" />
                <input 
                  type="text" 
                  placeholder="Search guide..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#0d1117] border border-white/10 rounded-md py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-[#58A6FF] transition-all outline-none"
                />
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar space-y-1">
              {filteredSections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all group ${
                    activeSection === section.id 
                      ? 'bg-[#58A6FF]/10 text-[#58A6FF] border border-[#58A6FF]/20 shadow-[0_0_15px_rgba(88,166,255,0.05)]' 
                      : 'text-[#8b949e] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <section.icon className={`w-4 h-4 ${activeSection === section.id ? 'text-[#58A6FF]' : 'group-hover:text-white'}`} />
                  <span className="font-medium">{section.title}</span>
                  {activeSection === section.id && (
                    <motion.div layoutId="active-nav" className="ml-auto w-1 h-4 rounded-full bg-[#58A6FF]" />
                  )}
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-white/10 bg-[#0d1117]/50">
               <button 
                onClick={() => navigate('/dashboard')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-md text-sm font-medium transition-all"
               >
                 Exit to Dashboard
               </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0D1117] relative">
        {/* Top Navbar */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#0D1117]/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-white/5 rounded-md transition-colors mr-2"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>
            )}
            <div className="flex items-center gap-2 text-sm text-[#8b949e]">
              <Book className="w-4 h-4" />
              <span>Learning Path</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white font-medium">{activeData.title}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-xs text-[#8b949e] hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              Pro Tips
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div className="max-w-4xl mx-auto px-8 py-12">
            {activeSection === 'intro' ? (
              <IntroductionContent onNext={handleNextSection} />
            ) : activeSection === 'why' ? (
              <WhyGitHubContent onNext={handleNextSection} />
            ) : activeSection === 'git-vs-github' ? (
              <GitVsGitHubContent onNext={handleNextSection} />
            ) : activeSection === 'repositories' ? (
              <RepositoriesContent onNext={handleNextSection} />
            ) : activeSection === 'branches' ? (
              <BranchesContent onNext={handleNextSection} />
            ) : activeSection === 'pull-requests' ? (
              <PullRequestsContent onNext={handleNextSection} />
            ) : activeSection === 'collaboration' ? (
              <CollaboratorsContent onNext={handleNextSection} />
            ) : activeSection === 'issues' ? (
              <IssuesTasksContent onNext={handleNextSection} />
            ) : activeSection === 'projects' ? (
              <ProjectsAgileContent onNext={handleNextSection} />
            ) : activeSection === 'actions' ? (
              <CICDContent onNext={handleNextSection} />
            ) : activeSection === 'security' ? (
              <SecurityContent onNext={handleNextSection} />
            ) : activeSection === 'commands' ? (
              <GitCommandsContent onNext={handleNextSection} />
            ) : activeSection === 'faq' ? (
              <FAQContent onNext={handleNextSection} />
            ) : activeSection === 'forks-stars' ? (
              <ForksStarsContent onNext={handleNextSection} />
            ) : activeSection === 'videos' ? (
              <VideosContent onNext={handleNextSection} />
            ) : activeSection === 'best-practices' ? (
              <BestPracticesContent onNext={handleNextSection} />
            ) : activeSection === 'revision' ? (
              <QuickRevisionContent onNext={handleNextSection} />
            ) : (
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-12"
              >
                {/* Hero Section */}
                <div className="space-y-6">
                  <div className={`w-16 h-16 rounded-2xl ${activeData.bg} flex items-center justify-center border border-white/5 shadow-xl`}>
                    <activeData.icon className={`w-8 h-8 ${activeData.color}`} />
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-4xl font-black text-white tracking-tight">{activeData.title}</h1>
                    <p className="text-xl text-[#8b949e] leading-relaxed max-w-2xl">{activeData.description}</p>
                  </div>
                </div>

                {/* MD Content Rendering */}
                <div className="prose prose-invert prose-blue max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({children}) => <h2 className="text-2xl font-bold text-white mb-6 mt-12 pb-3 border-b border-white/5">{children}</h2>,
                      h2: ({children}) => <h3 className="text-xl font-bold text-white mb-4 mt-8">{children}</h3>,
                      h3: ({children}) => <h4 className="text-lg font-bold text-white/90 mb-3 mt-6">{children}</h4>,
                      p: ({children}) => <p className="text-[#8b949e] leading-7 mb-4">{children}</p>,
                      ul: ({children}) => <ul className="list-disc pl-6 space-y-2 mb-6 text-[#8b949e]">{children}</ul>,
                      li: ({children}) => <li className="leading-relaxed">{children}</li>,
                      code: ({node, inline, className, children, ...props}) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline ? (
                          <div className="relative group my-6">
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleCopy(String(children))}
                                className="p-1.5 bg-[#161B22] border border-white/10 rounded-md hover:border-[#58A6FF] transition-colors"
                              >
                                {copiedCmd === String(children) ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-[#8b949e]" />}
                              </button>
                            </div>
                            <pre className="bg-[#161B22] border border-white/10 rounded-xl p-5 overflow-x-auto text-sm font-mono text-blue-100">
                              <code {...props}>{children}</code>
                            </pre>
                          </div>
                        ) : (
                          <code className="bg-[#58A6FF]/10 text-[#58A6FF] px-1.5 py-0.5 rounded font-mono text-xs" {...props}>{children}</code>
                        )
                      },
                      blockquote: ({children}) => (
                        <div className="my-8 p-5 bg-blue-500/5 border-l-4 border-blue-500 rounded-r-xl">
                          <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                            <div className="text-sm italic text-blue-100/80">{children}</div>
                          </div>
                        </div>
                      ),
                      table: ({children}) => (
                        <div className="overflow-x-auto my-8 border border-white/10 rounded-xl">
                          <table className="w-full text-left border-collapse">{children}</table>
                        </div>
                      ),
                      th: ({children}) => <th className="bg-white/5 p-4 text-sm font-bold text-white border-b border-white/10">{children}</th>,
                      td: ({children}) => <td className="p-4 text-sm text-[#8b949e] border-b border-white/5">{children}</td>
                    }}
                  >
                    {activeData.content}
                  </ReactMarkdown>
                </div>

                {/* Custom Sections Based on Type */}
                {activeData.cards && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                    {activeData.cards.map((card, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        className="p-6 bg-[#1C2128] border border-white/5 rounded-2xl hover:border-[#58A6FF]/30 transition-all group"
                      >
                        <card.icon className="w-6 h-6 text-[#58A6FF] mb-4 group-hover:scale-110 transition-transform" />
                        <h4 className="font-bold text-white mb-2">{card.title}</h4>
                        <p className="text-sm text-[#8b949e]">{card.text}</p>
                      </motion.div>
                    ))}
                  </div>
                )}

                {activeData.isCommandSection && (
                  <div className="space-y-12">
                    {activeData.categories.map((cat, idx) => (
                      <div key={idx} className="space-y-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <Terminal className="w-5 h-5 text-[#58A6FF]" />
                          {cat.name}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {cat.commands.map((c, i) => (
                            <div key={i} className="bg-[#1C2128] border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-white/20 transition-all">
                              <div>
                                <code className="text-[#58A6FF] font-mono text-sm">{c.cmd}</code>
                                <p className="text-xs text-[#8b949e] mt-1">{c.desc}</p>
                              </div>
                              <button 
                                onClick={() => handleCopy(c.cmd)}
                                className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/5 rounded-md"
                              >
                                {copiedCmd === c.cmd ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-[#8b949e]" />}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeData.isVideoSection && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {activeData.videos.map((vid, i) => (
                      <div key={i} className="group bg-[#1C2128] border border-white/5 rounded-2xl overflow-hidden hover:border-[#58A6FF]/30 transition-all">
                        <div className="aspect-video bg-black relative flex items-center justify-center">
                          <iframe 
                            src={vid.url} 
                            title={vid.title} 
                            className="w-full h-full border-none"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                          ></iframe>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-[#58A6FF] bg-[#58A6FF]/10 px-2 py-0.5 rounded uppercase tracking-wider">{vid.platform}</span>
                            <span className="text-[10px] text-[#8b949e] flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {vid.duration}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-white mb-2">{vid.title}</h4>
                          <p className="text-sm text-[#8b949e] mb-4">{vid.desc}</p>
                          <button className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-all flex items-center justify-center gap-2">
                            <Play className="w-4 h-4" /> Watch now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeData.isFAQSection && (
                  <div className="space-y-4">
                    {activeData.faqs.map((faq, i) => (
                      <div key={i} className="bg-[#1C2128] border border-white/5 rounded-2xl overflow-hidden">
                        <details className="group">
                          <summary className="p-6 cursor-pointer list-none flex items-center justify-between">
                            <span className="font-bold text-white group-hover:text-[#58A6FF] transition-colors">{faq.q}</span>
                            <ChevronRight className="w-5 h-5 text-[#8b949e] group-open:rotate-90 transition-transform" />
                          </summary>
                          <div className="px-6 pb-6 text-sm text-[#8b949e] leading-relaxed border-t border-white/5 pt-4">
                            {faq.a}
                          </div>
                        </details>
                      </div>
                    ))}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-12 border-t border-white/5">
                  <button 
                    onClick={() => {
                      const idx = SECTION_DATA.findIndex(s => s.id === activeSection);
                      if (idx > 0) setActiveSection(SECTION_DATA[idx-1].id);
                    }}
                    className={`flex items-center gap-2 text-sm font-medium ${activeSection === SECTION_DATA[0].id ? 'opacity-0 cursor-default' : 'text-[#8b949e] hover:text-white'}`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous Section
                  </button>
                  <button 
                    onClick={() => {
                      const idx = SECTION_DATA.findIndex(s => s.id === activeSection);
                      if (idx < SECTION_DATA.length - 1) setActiveSection(SECTION_DATA[idx+1].id);
                    }}
                    className={`flex items-center gap-2 text-sm font-medium ${activeSection === SECTION_DATA[SECTION_DATA.length-1].id ? 'opacity-0 cursor-default' : 'text-[#58A6FF] hover:text-[#58A6FF]/80'}`}
                  >
                    Next Section
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Floating AI Assistant */}
        <div className="fixed bottom-8 right-8 z-[100]">
          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="absolute bottom-20 right-0 w-96 bg-[#161B22] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              >
                <div className="p-4 bg-[#1C2128] border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#58A6FF]/20 flex items-center justify-center">
                      <Cpu className="w-4 h-4 text-[#58A6FF]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-none">AI Assistant</h4>
                      <span className="text-[10px] text-green-400">Online & ready to help</span>
                    </div>
                  </div>
                  <button onClick={() => setIsChatOpen(false)} className="p-1 hover:bg-white/5 rounded">
                    <X className="w-4 h-4 text-[#8b949e]" />
                  </button>
                </div>

                <div className="h-96 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#0d1117]">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                        msg.role === 'user' 
                          ? 'bg-[#58A6FF] text-white rounded-br-none' 
                          : 'bg-[#1C2128] text-[#c9d1d9] border border-white/5 rounded-bl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleChatSubmit} className="p-4 bg-[#1C2128] border-t border-white/10">
                  <div className="relative">
                    <input 
                      type="text" 
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Ask anything about GitHub..."
                      className="w-full bg-[#0d1117] border border-white/10 rounded-xl py-2.5 pl-4 pr-12 text-sm outline-none focus:ring-1 focus:ring-[#58A6FF] transition-all"
                    />
                    <button 
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#58A6FF] text-white rounded-lg hover:bg-[#58A6FF]/80 transition-all"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all ${
              isChatOpen ? 'bg-white text-black rotate-90' : 'bg-[#58A6FF] text-white hover:scale-110'
            }`}
          >
            {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
          </button>
        </div>
      </main>
    </div>
  );
};

export default GitHubCompanion;
