import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Search, 
  ChevronRight, 
  Layout, 
  FileCode2, 
  Database, 
  Shield, 
  GitBranch, 
  Zap, 
  MessageSquare, 
  Users, 
  Settings, 
  Cpu, 
  Terminal, 
  Globe, 
  Rocket, 
  ChevronDown, 
  Maximize2, 
  Share2, 
  RefreshCcw, 
  Download, 
  BookOpen, 
  History, 
  MoreHorizontal, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Activity, 
  FolderOpen, 
  Code2, 
  ExternalLink, 
  Menu,
  X,
  PlayCircle,
  Book,
  GraduationCap,
  Lightbulb,
  Map,
  Navigation,
  Trophy,
  GitMerge,
  FilePlus,
  Info,
  Clock,
  GitPullRequest,
  GitFork,
  ZoomIn,
  ZoomOut,
  Maximize,
  Settings2,
  FileSearch,
  Code,
  FileJson,
  Hash,
  Boxes,
  Workflow
} from 'lucide-react';

// --- Constants & Mock Insights ---
const ANALYSIS_STEPS = [
  { id: 1, label: 'Scanning codebase structure', icon: FolderOpen },
  { id: 2, label: 'Detecting technology stack', icon: Cpu },
  { id: 3, label: 'Mapping execution flows', icon: Activity },
  { id: 4, label: 'Analyzing API endpoints', icon: Terminal },
  { id: 5, label: 'Verifying database schemas', icon: Database },
  { id: 6, label: 'Generating intelligent summary', icon: Sparkles },
];

const MOCK_FILES = [
  {
    name: 'src', type: 'folder', purpose: 'Contains all source code for frontend and backend.', children: [
      { name: 'controllers', type: 'folder', purpose: 'Logic for handling incoming API requests.' },
      { name: 'models', type: 'folder', purpose: 'Database schema definitions using Mongoose.' },
      { name: 'routes', type: 'folder', purpose: 'API route definitions and middleware mapping.' },
      { name: 'middleware', type: 'folder', purpose: 'Authentication and validation logic.' },
    ]
  },
  { name: 'server.js', type: 'file', importance: 'Critical', purpose: 'Entry point for the Node.js application.' },
  { name: '.env.example', type: 'file', importance: 'High', purpose: 'Template for environment variables.' },
  { name: 'package.json', type: 'file', importance: 'High', purpose: 'Project metadata and dependencies.' },
];

const MOCK_APIS = [
  { method: 'POST', path: '/api/auth/register', description: 'User registration', protected: false },
  { method: 'POST', path: '/api/auth/login', description: 'User authentication', protected: false },
  { method: 'GET', path: '/api/tasks', description: 'Fetch all tasks', protected: true },
  { method: 'POST', path: '/api/tasks', description: 'Create new task', protected: true },
];

const MOCK_FLOWS = [
  { id: 'auth', title: 'User Authentication Flow', steps: ['Frontend Form', 'Auth Controller', 'Password Validation', 'JWT Generation', 'Response Cookie'] },
  { id: 'task', title: 'Task Creation Flow', steps: ['Create Task API', 'Auth Middleware', 'Schema Validation', 'MongoDB Write', 'Real-time Socket Update'] },
];

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group ${active
      ? 'bg-indigo-500/15 text-white border border-indigo-500/20 shadow-lg shadow-indigo-500/5'
      : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
  >
    <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? 'text-indigo-400 scale-110 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' : 'group-hover:scale-110'}`} />
    {!collapsed && <span className="text-sm font-medium truncate">{label}</span>}
    {active && !collapsed && (
      <motion.div layoutId="sidebar-active" className="ml-auto w-1 h-1 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
    )}
  </button>
);

const RepositoryGuideWorkspace = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [isBeginnerMode, setIsBeginnerMode] = useState(true);
  const [askAiQuery, setAskAiQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [explorerSearch, setExplorerSearch] = useState('');
  const [isExplorerExpanded, setIsExplorerExpanded] = useState(true);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [learningStep, setLearningStep] = useState(0);
  const [expandedFolders, setExpandedFolders] = useState(['src']);
  const [activeTab, setActiveTab] = useState('explorer'); 

  const navigate = useNavigate();

  // Initial Analysis Simulation
  useEffect(() => {
    const hasAnalyzed = sessionStorage.getItem('guide_analyzed');
    if (!hasAnalyzed) {
      setIsAnalyzing(true);
      sessionStorage.setItem('guide_analyzed', 'true');
    }
  }, []);

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setAnalysisStep(prev => {
          if (prev >= 6) {
            clearInterval(interval);
            setTimeout(() => setIsAnalyzing(false), 800);
            return 6;
          }
          return prev + 1;
        });
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  const toggleAnalysis = () => {
    setAnalysisStep(0);
    setIsAnalyzing(true);
  };

  const AnalysisOverlay = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-[#030712]/90 backdrop-blur-2xl flex flex-col items-center justify-center p-8"
    >
      <div className="max-w-xl w-full flex flex-col items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="relative mb-12"
        >
          <div className="w-24 h-24 rounded-full border-4 border-indigo-500/10 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
        </motion.div>

        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">AI Repository Deep Scan</h2>
        <p className="text-slate-500 mb-10 text-sm text-center max-w-sm">
          Indexing architecture and mapping logic flows for instant codebase understanding.
        </p>

        <div className="w-full space-y-3 mb-8">
          {ANALYSIS_STEPS.map((step) => {
            const isActive = analysisStep === step.id;
            const isCompleted = analysisStep > step.id;
            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-3 rounded-xl border transition-all duration-500 ${isActive ? 'bg-indigo-500/10 border-indigo-500/40' :
                  isCompleted ? 'bg-emerald-500/5 border-emerald-500/10 opacity-60' : 'bg-white/5 border-white/5 opacity-30'
                  }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-indigo-500 text-white animate-pulse' :
                  isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'
                  }`}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                </div>
                <span className={`text-xs font-bold ${isActive ? 'text-white' : isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {step.label}
                </span>
                {isActive && <div className="ml-auto w-12 h-1 bg-white/10 rounded-full overflow-hidden"><motion.div initial={{ x: '-100%' }} animate={{ x: '0%' }} transition={{ duration: 1.2 }} className="h-full w-full bg-indigo-500" /></div>}
              </div>
            );
          })}
        </div>

        <div className="w-full bg-black/40 rounded-xl p-4 font-mono text-[10px] text-slate-500 overflow-hidden border border-white/5">
          <motion.div animate={{ y: [0, -40] }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}>
            <p className="text-indigo-400">[CORE] Reading server.js...</p>
            <p className="text-slate-600">[AST] Mapping route handlers in /routes/auth.js</p>
            <p className="text-slate-600">[DB] Detecting Mongoose models in /models</p>
            <p className="text-emerald-400">[AI] Generating architecture diagram...</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );

  const OverviewSection = () => {
  const [learningStep, setLearningStep] = useState(0);

  const GITHUB_CONCEPTS = [
    {
      title: 'Repository',
      icon: BookOpen,
      desc: 'A digital project folder where all your work lives.',
      analogy: 'Think of it like a Project Binder or a Google Doc for your whole app.',
      why: 'It keeps everything organized and tracks who changed what.'
    },
    {
      title: 'Commit',
      icon: CheckCircle2,
      desc: 'A permanent "save point" for your code changes.',
      analogy: 'Like saving your progress in a video game before a big boss fight.',
      why: 'You can always go back to a previous commit if you break something.'
    },
    {
      title: 'Branch',
      icon: GitBranch,
      desc: 'A parallel version of your project to test new ideas.',
      analogy: 'Like a parallel universe where you can try new things safely.',
      why: 'Prevents experimental code from breaking the "Main" working version.'
    },
    {
      title: 'Pull Request',
      icon: GitPullRequest,
      desc: 'Asking the team to review and accept your new changes.',
      analogy: 'Like a student asking a teacher to grade their homework before it’s final.',
      why: 'Ensures quality and prevents bugs through peer review.'
    },
    {
      title: 'Merge',
      icon: GitMerge,
      desc: 'Combining two branches into one final version.',
      analogy: 'Like mixing two streams of water into one big river.',
      why: 'Integrates new features into the main production code.'
    },
    {
      title: 'Fork',
      icon: GitFork,
      desc: 'Creating your own copy of someone else’s project.',
      analogy: 'Like taking a photocopy of a recipe so you can change it yourself.',
      why: 'Allows you to contribute to open source without editing the original directly.'
    }
  ];

  const LEARNING_PATH = [
    { id: 1, title: 'Project Mission', desc: 'Understand why this app was built.', icon: Rocket },
    { id: 2, title: 'Folder Tour', desc: 'Explore where the important logic lives.', icon: FolderOpen },
    { id: 3, title: 'Tech Stack 101', desc: 'Learn the tools used to build this.', icon: Cpu },
    { id: 4, title: 'Setup & Run', desc: 'Get the app running on your computer.', icon: Terminal },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* 1. WELCOME HERO */}
      <section className="relative min-h-[400px] flex items-center justify-center text-center p-12 rounded-[3rem] border border-white/5 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        </div>
        <div className="relative z-10 max-w-4xl space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest"
          >
            <GraduationCap className="w-4 h-4" /> Welcome to Learning Mode
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
            Explore. Understand. <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Collaborate.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            This interactive workspace is your guide to mastering this repository. Whether you're a student or a pro, we'll help you navigate every line of code.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
            <button onClick={() => setLearningStep(1)} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center gap-3">
              Start Learning <ChevronRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black rounded-2xl transition-all flex items-center gap-3">
              Watch Intro <PlayCircle className="w-5 h-5 text-indigo-400" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. WHAT IS GITHUB & WHY REPOS? */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-10 bg-[#0d1117] border border-white/5 rounded-[2.5rem] space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Globe className="w-40 h-40 text-white" />
          </div>
          <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20">
            <Info className="w-7 h-7" />
          </div>
          <h3 className="text-3xl font-black text-white">What is GitHub?</h3>
          <p className="text-lg text-slate-400 leading-relaxed italic">
            "Think of GitHub like <span className="text-blue-400 font-bold underline decoration-blue-500/30">Google Docs for Code</span>."
          </p>
          <p className="text-slate-500 leading-relaxed">
            It's a magical place where developers store their work, track every change ever made, and build software together from anywhere in the world.
          </p>
          <div className="pt-4 flex gap-6">
            <div className="space-y-2">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Store</p>
              <p className="text-sm text-slate-300">Safe place for files</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Share</p>
              <p className="text-sm text-slate-300">Invite collaborators</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Solve</p>
              <p className="text-sm text-slate-300">Fix bugs together</p>
            </div>
          </div>
        </div>

        <div className="p-10 bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Book className="w-40 h-40 text-white" />
          </div>
          <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <Layers className="w-7 h-7" />
          </div>
          <h3 className="text-3xl font-black text-white">Why Repositories?</h3>
          <p className="text-lg text-slate-400 leading-relaxed italic">
            "A repository is your <span className="text-indigo-400 font-bold underline decoration-indigo-500/30">Project Universe</span>."
          </p>
          <p className="text-slate-500 leading-relaxed">
            Instead of having files scattered everywhere, a repository (or 'Repo') keeps all your code, history, and discussions in one organized, searchable home.
          </p>
          <div className="flex items-center gap-2 text-sm font-bold text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-xl w-fit">
            <Lightbulb className="w-4 h-4" /> Tip: This current page is inside a Repo!
          </div>
        </div>
      </section>

      {/* 4. BASIC GITHUB CONCEPTS */}
      <section className="space-y-8">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl font-black text-white">Core GitHub Concepts</h2>
          <p className="text-slate-500">Master these few terms and you'll speak the language of professional developers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GITHUB_CONCEPTS.map((concept, i) => (
            <motion.div
              key={concept.title}
              whileHover={{ y: -5 }}
              className="p-8 bg-[#161b22] border border-white/5 rounded-3xl space-y-4 group transition-all hover:bg-white/5 hover:border-indigo-500/20"
            >
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-all border border-white/5">
                <concept.icon className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-black text-white tracking-tight">{concept.title}</h4>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">{concept.desc}</p>
              <div className="pt-4 border-t border-white/5 space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">The Analogy</p>
                  <p className="text-xs text-slate-500 italic">"{concept.analogy}"</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Why it matters</p>
                  <p className="text-xs text-slate-400">{concept.why}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. UNDERSTAND THIS REPOSITORY */}
      <section className="bg-[#0d1117] border border-white/5 rounded-[3rem] p-12 space-y-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 pointer-events-none opacity-5">
          <Sparkles className="w-64 h-64 text-indigo-500" />
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              Active Project
            </div>
            <h2 className="text-4xl font-black text-white leading-none">About This Project</h2>
            <p className="text-slate-400 text-lg max-w-xl">AI-generated summaries to help you understand what's happening under the hood.</p>
          </div>
          <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
            {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
              <button
                key={lvl}
                className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${lvl === 'Beginner' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          <div className="lg:col-span-2 p-8 bg-white/5 border border-white/10 rounded-3xl space-y-6">
            <p className="text-xl text-slate-300 leading-relaxed font-medium">
              The <span className="text-white font-black">Enterprise Task Studio</span> is a smart application that helps teams manage their work in real-time.
              It's like a shared whiteboard where everyone can see updates instantly.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-black/40 rounded-2xl border border-white/5">
                <h5 className="font-bold text-white mb-2 flex items-center gap-2"><Users className="w-4 h-4 text-blue-400" /> Who is it for?</h5>
                <p className="text-sm text-slate-500">Project managers, remote teams, and students tracking assignments.</p>
              </div>
              <div className="p-5 bg-black/40 rounded-2xl border border-white/5">
                <h5 className="font-bold text-white mb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" /> Main Goal</h5>
                <p className="text-sm text-slate-500">To make collaboration seamless and prevent tasks from being forgotten.</p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl space-y-6">
            <h4 className="text-lg font-black text-white">Project Vitals</h4>
            <div className="space-y-4">
              {[
                { label: 'Technology', value: 'JavaScript (MERN)', icon: Cpu },
                { label: 'Difficulty', value: 'Moderate', icon: Activity },
                { label: 'Status', value: 'Production Ready', icon: CheckCircle2 },
              ].map(v => (
                <div key={v.label} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 border border-white/10">
                    <v.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{v.label}</p>
                    <p className="text-sm font-bold text-white">{v.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. REPOSITORY LEARNING PATH */}
      <section className="space-y-10">
        <h3 className="text-3xl font-black text-white flex items-center gap-3">
          <Map className="w-8 h-8 text-indigo-400" />
          Your Onboarding Journey
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connecting line for desktop */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 hidden lg:block -translate-y-12" />

          {LEARNING_PATH.map((path, i) => (
            <div key={path.id} className="relative group">
              <div className={`w-full p-8 rounded-3xl border transition-all duration-500 ${learningStep >= path.id ? 'bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-600/20' : 'bg-[#161b22] border-white/5'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${learningStep >= path.id ? 'bg-white text-indigo-600 border-white/20' : 'bg-white/5 text-slate-500 border-white/5'}`}>
                  <path.icon className="w-6 h-6" />
                </div>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${learningStep >= path.id ? 'text-indigo-200' : 'text-slate-500'}`}>Step {path.id}</p>
                <h5 className={`text-lg font-black mb-2 ${learningStep >= path.id ? 'text-white' : 'text-slate-300'}`}>{path.title}</h5>
                <p className={`text-sm ${learningStep >= path.id ? 'text-indigo-100' : 'text-slate-500'}`}>{path.desc}</p>
                <button
                  onClick={() => setLearningStep(path.id)}
                  className={`mt-6 w-full py-2.5 rounded-xl text-xs font-black transition-all ${learningStep >= path.id ? 'bg-white text-indigo-600 hover:bg-slate-100' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
                >
                  {learningStep >= path.id ? 'Explore Now' : 'Lock Progress'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. BEGINNER-FRIENDLY ARCHITECTURE */}
      <section className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-12 text-center space-y-12">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-4xl font-black text-white tracking-tight">How the Magic Happens</h2>
          <p className="text-slate-500">A simplified view of how data flows through this application.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-12 max-w-5xl mx-auto py-10 relative">
          {/* Animated paths */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-white/5 -translate-y-1/2 overflow-hidden rounded-full">
            <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} className="w-1/3 h-full bg-indigo-500 blur-sm" />
          </div>

          {[
            { label: 'You (The User)', icon: Users, color: 'indigo', desc: 'Interact with the screen' },
            { label: 'The Interface', icon: Globe, color: 'blue', desc: 'React Frontend code' },
            { label: 'The Engine', icon: Terminal, color: 'purple', desc: 'Node.js Backend API' },
            { label: 'The Storage', icon: Database, color: 'emerald', desc: 'MongoDB Database' },
          ].map((comp, i) => (
            <div key={comp.label} className="relative z-10 flex flex-col items-center gap-4 w-48">
              <div className={`w-20 h-20 rounded-3xl bg-${comp.color}-500/10 border border-${comp.color}-500/30 flex items-center justify-center text-${comp.color}-400 shadow-2xl shadow-${comp.color}-500/5`}>
                <comp.icon className="w-10 h-10" />
              </div>
              <div className="text-center">
                <p className="font-black text-white mb-1">{comp.label}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">{comp.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. COMMON DEVELOPER ACTIONS & COLLABORATION */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-3xl font-black text-white">How Developers Work</h3>
          <p className="text-slate-400 leading-relaxed">
            Collaboration on GitHub follows a very specific "Workflow".
            It's like an assembly line where everyone works together without stepping on each other's toes.
          </p>
          <div className="space-y-4 pt-4">
            {[
              'Create a Branch (Safe workspace)',
              'Write & Save code (Commits)',
              'Ask for feedback (Pull Request)',
              'Combine code (Merge)'
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm font-bold text-slate-300">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                {text}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 p-1 bg-[#0d1117] border border-white/5 rounded-[2.5rem]">
          <div className="p-10 bg-white/[0.02] rounded-[2.2rem] space-y-8">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Interactive Sandbox</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            </div>

            <div className="space-y-6 relative pl-12">
              <div className="absolute left-4 top-2 bottom-2 w-1 bg-white/5 rounded-full" />

              {[
                { icon: GitBranch, user: 'Dev A', action: 'Created branch', details: 'feature/new-button', color: 'blue' },
                { icon: Code2, user: 'Dev A', action: 'Committed code', details: 'Added new UI component', color: 'indigo' },
                { icon: GitPullRequest, user: 'Dev A', action: 'Opened Pull Request', details: 'Review my changes please!', color: 'purple' },
                { icon: CheckCircle2, user: 'Admin', action: 'Approved & Merged', details: 'Great work! Code is now live.', color: 'emerald' },
              ].map((step, i) => (
                <div key={i} className="relative group">
                  <div className={`absolute -left-10 top-0 w-5 h-5 rounded-full bg-${step.color}-500/20 border border-${step.color}-500 flex items-center justify-center z-10 transition-transform group-hover:scale-125`}>
                    <step.icon className={`w-2.5 h-2.5 text-${step.color}-400`} />
                  </div>
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl group-hover:border-white/10 transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-black text-white">{step.user}</p>
                      <span className="text-[10px] text-slate-600 font-mono">2m ago</span>
                    </div>
                    <p className="text-sm font-bold text-slate-300">{step.action}</p>
                    <p className="text-xs text-slate-500 mt-1">{step.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 9. AI REPOSITORY TUTOR */}
      <section className="bg-indigo-600 rounded-[3rem] p-12 text-center space-y-8 shadow-2xl shadow-indigo-600/30">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-xl border border-white/20">
            <Cpu className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-black text-white">Meet Your Repository Tutor</h2>
          <p className="text-indigo-100 text-lg opacity-90">I'm your AI teacher. I know every line of code in this project. What can I explain for you today?</p>
        </div>

        <div className="max-w-xl mx-auto relative group">
          <input
            type="text"
            placeholder="Ask me anything... (e.g. 'What is a branch?')"
            className="w-full px-8 py-5 bg-white text-indigo-900 rounded-2xl font-bold placeholder:text-indigo-300 focus:outline-none shadow-2xl"
          />
          <button className="absolute right-3 top-3 bottom-3 px-6 bg-indigo-900 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-black transition-colors">
            Ask Gemini
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            "Why is there a server.js?",
            "Explain Backend simply",
            "How do I contribute?",
            "What is a commit?",
            "Where is the database?"
          ].map(q => (
            <button key={q} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-full text-xs font-black text-white transition-all border border-white/10">
              {q}
            </button>
          ))}
        </div>
      </section>

      {/* 10. QUICK START SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 p-10 bg-[#161b22] border border-white/5 rounded-[2.5rem] space-y-6">
          <h3 className="text-2xl font-black text-white flex items-center gap-3">
            <Rocket className="w-6 h-6 text-amber-500" />
            Quick Setup
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">Ready to run the code locally? Follow this simple checklist to get started.</p>
          <div className="space-y-3">
            {[
              { label: 'Install Node.js', done: true },
              { label: 'Clone Repository', done: true },
              { label: 'Install Dependencies', done: false },
              { label: 'Setup Env Variables', done: false },
              { label: 'npm run dev', done: false }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${item.done ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-600'}`}>
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <span className={`text-xs font-bold ${item.done ? 'text-slate-300' : 'text-slate-500'}`}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 p-10 bg-[#0d1117] border border-white/5 rounded-[2.5rem] space-y-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-white">Developer Toolbox</h3>
            <div className="flex gap-2">
              <div className="px-2 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded text-[8px] font-black uppercase tracking-widest">Live System</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Terminal', icon: Terminal, desc: 'Command center for devs' },
              { title: 'Editor', icon: Code2, desc: 'Where the writing happens' },
              { title: 'Debugger', icon: Activity, desc: 'Finding & squashing bugs' },
              { title: 'Git', icon: GitBranch, desc: 'The time-travel machine' },
            ].map(tool => (
              <div key={tool.title} className="p-5 bg-white/5 border border-white/5 rounded-2xl hover:border-indigo-500/20 transition-all flex items-center gap-4 group">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all">
                  <tool.icon className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-white text-sm">{tool.title}</h5>
                  <p className="text-[11px] text-slate-500">{tool.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black rounded-2xl transition-all text-sm uppercase tracking-widest">
            Open Full Documentation
          </button>
        </div>
      </section>

      {/* Footer Lesson */}
      <div className="p-12 bg-indigo-500/10 border border-indigo-500/20 rounded-[3rem] text-center space-y-4">
        <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">Module 1 Complete</p>
        <h3 className="text-3xl font-black text-white">You've mastered the basics!</h3>
        <p className="text-slate-400 max-w-xl mx-auto">Now head over to the <b>Folder Structure</b> or <b>Execution Flow</b> sections to see how these concepts are applied in this specific codebase.</p>
        <div className="pt-6">
          <button onClick={() => navigate('/repos')} className="px-8 py-3 bg-white text-black font-black rounded-xl hover:bg-slate-200 transition-all text-xs uppercase tracking-widest">
            Finish Lesson
          </button>
        </div>
      </div>
    </div>
  );
  };

  const FolderStructureSection = () => {
  const toggleFolder = (path) => {
      setExpandedFolders(prev =>
        prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
      );
    };

    const ARCHITECTURE_NODES = [
      { id: 'client', label: 'Frontend Client', type: 'UI', icon: Globe, color: 'blue', x: 0, y: 0 },
      { id: 'gateway', label: 'API Gateway', type: 'Middleware', icon: Shield, color: 'purple', x: 250, y: 0 },
      { id: 'logic', label: 'Business Logic', type: 'Controller', icon: Terminal, color: 'indigo', x: 500, y: 0 },
      { id: 'data', label: 'Database Service', type: 'Storage', icon: Database, color: 'emerald', x: 750, y: 0 },
    ];

    const ArchitectureNode = ({ node }) => (
      <motion.div
        layoutId={node.id}
        onHoverStart={() => setHoveredNode(node.id)}
        onHoverEnd={() => setHoveredNode(null)}
        className={`absolute p-6 rounded-3xl border bg-[#0d1117] transition-all cursor-pointer group
          ${hoveredNode === node.id ? 'border-white/20 shadow-2xl scale-110 z-50' : 'border-white/5'}
        `}
        style={{ left: node.x, top: node.y }}
      >
        <div className={`w-12 h-12 rounded-2xl bg-${node.color}-500/10 flex items-center justify-center text-${node.color}-400 mb-4 border border-${node.color}-500/20`}>
          <node.icon className="w-6 h-6" />
        </div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{node.type}</p>
        <p className="font-bold text-white text-sm">{node.label}</p>
      </motion.div>
    );

    return (
      <div className="flex flex-col h-full space-y-8">
        {/* TOP TOOLBAR */}
        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
          <div className="flex p-1 bg-black/40 rounded-xl border border-white/5">
            {[
              { id: 'explorer', label: 'File Explorer', icon: FolderOpen },
              { id: 'architecture', label: 'Architecture Map', icon: Layers },
              { id: 'relationships', label: 'Relationships', icon: Boxes },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all
                    ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'}
                  `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative group mr-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Fuzzy search files..."
                className="bg-black/40 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 w-48"
                onChange={(e) => setExplorerSearch(e.target.value)}
              />
            </div>
            <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all tooltip" title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
            <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all tooltip" title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
            <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all tooltip" title="Expand All" onClick={() => setIsExplorerExpanded(!isExplorerExpanded)}><Maximize className="w-4 h-4" /></button>
            <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all tooltip" title="Settings"><Settings2 className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden min-h-[600px]">
          {/* LEFT PANEL: EXPLORER */}
          <div className={`lg:col-span-4 flex flex-col space-y-4 ${activeTab !== 'explorer' && 'hidden lg:flex'}`}>
            <div className="flex-1 bg-[#0d1117] border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <FileSearch className="w-5 h-5 text-indigo-400" /> Repository Index
                </h3>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">v1.2.0</span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {MOCK_FILES.map((folder, i) => (
                  <div key={folder.name} className="space-y-1">
                    <div
                      onClick={() => toggleFolder(folder.name)}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 cursor-pointer group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <motion.div animate={{ rotate: expandedFolders.includes(folder.name) ? 90 : 0 }}>
                          <ChevronRight className="w-3 h-3 text-slate-600" />
                        </motion.div>
                        <FolderOpen className={`w-5 h-5 ${expandedFolders.includes(folder.name) ? 'text-indigo-400' : 'text-slate-600'}`} />
                        <span className="text-sm font-black text-white group-hover:text-indigo-300 transition-colors">{folder.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-600 font-bold">{folder.children?.length || 0} items</span>
                    </div>

                    <AnimatePresence>
                      {expandedFolders.includes(folder.name) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="ml-6 pl-4 border-l border-white/5 space-y-1 overflow-hidden"
                        >
                          {folder.children?.map(child => (
                            <div
                              key={child.name}
                              onClick={() => setSelectedFile(child)}
                              className={`p-3 rounded-xl hover:bg-indigo-500/10 cursor-pointer transition-all group flex flex-col gap-1
                                       ${selectedFile?.name === child.name ? 'bg-indigo-500/10 border border-indigo-500/20 shadow-lg' : 'border border-transparent'}
                                     `}
                            >
                              <div className="flex items-center gap-3">
                                <FileCode2 className={`w-4 h-4 ${selectedFile?.name === child.name ? 'text-indigo-400' : 'text-slate-500'}`} />
                                <span className={`text-xs font-bold ${selectedFile?.name === child.name ? 'text-white' : 'text-slate-400'} group-hover:text-white transition-colors`}>{child.name}</span>
                              </div>
                              <p className="ml-7 text-[10px] text-slate-600 leading-tight line-clamp-1">{child.purpose}</p>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MAIN PANEL: VISUALIZATION OR PREVIEW */}
          <div className="lg:col-span-8 space-y-6">
            {activeTab === 'architecture' ? (
              <div className="h-full bg-[#0d1117] border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

                <div className="absolute top-8 left-8 z-10 space-y-2">
                  <h3 className="text-2xl font-black text-white">Live System Architecture</h3>
                  <p className="text-slate-500 text-sm">Interactive data-flow map between modules.</p>
                </div>

                <div className="h-full flex items-center justify-center p-20 relative">
                  {/* Interactive Flow Diagram */}
                  <div className="relative w-full h-full">
                    {/* Connection lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                      <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                          <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" opacity="0.3" />
                        </marker>
                      </defs>
                      <motion.line
                        x1="120" y1="40" x2="250" y2="40"
                        stroke="#6366f1" strokeWidth="2" strokeDasharray="5,5"
                        animate={{ strokeDashoffset: [0, -20] }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        style={{ opacity: 0.3 }}
                      />
                      <motion.line
                        x1="370" y1="40" x2="500" y2="40"
                        stroke="#6366f1" strokeWidth="2" strokeDasharray="5,5"
                        animate={{ strokeDashoffset: [0, -20] }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        style={{ opacity: 0.3 }}
                      />
                      <motion.line
                        x1="620" y1="40" x2="750" y2="40"
                        stroke="#6366f1" strokeWidth="2" strokeDasharray="5,5"
                        animate={{ strokeDashoffset: [0, -20] }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        style={{ opacity: 0.3 }}
                      />
                    </svg>

                    {ARCHITECTURE_NODES.map(node => (
                      <ArchitectureNode key={node.id} node={node} />
                    ))}
                  </div>
                </div>

                {/* Insight Overlay */}
                <AnimatePresence>
                  {hoveredNode && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute bottom-8 left-8 right-8 p-6 bg-indigo-600 rounded-3xl text-white shadow-2xl z-50 border border-white/20"
                    >
                      <h4 className="text-xl font-black mb-2">Deep Insights: {ARCHITECTURE_NODES.find(n => n.id === hoveredNode).label}</h4>
                      <p className="text-sm text-indigo-100 leading-relaxed">
                        This component handles the {hoveredNode} lifecycle. It is tightly coupled with the backend routing system and ensures high availability through automated load balancing.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : selectedFile ? (
              <div className="h-full flex flex-col space-y-6">
                {/* FILE PREVIEW HEADER */}
                <div className="p-8 bg-[#161b22] border border-white/5 rounded-[2.5rem] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                      <FileCode2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">{selectedFile.name}</h3>
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-black">Module Intelligence</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"><Share2 className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all" onClick={() => setSelectedFile(null)}><X className="w-4 h-4" /></button>
                  </div>
                </div>

                {/* FILE INSIGHTS CONTENT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 bg-[#0d1117] border border-white/5 rounded-3xl space-y-6">
                    <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Info className="w-4 h-4 text-indigo-400" /> AI File Analysis
                    </h4>
                    <p className="text-slate-300 leading-relaxed font-medium">
                      {selectedFile.purpose} This file is critical for the application's {activeSection} logic. It handles core data transformations and ensures proper synchronization.
                    </p>
                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Importance Score</span>
                        <span className="text-xs font-black text-emerald-400">9.8 / 10</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '98%' }} className="h-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-[#0d1117] border border-white/5 rounded-3xl space-y-6">
                    <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Workflow className="w-4 h-4 text-purple-400" /> Execution Role
                    </h4>
                    <ul className="space-y-3">
                      {[
                        'Primary entry point for auth flow',
                        'Manages persistent socket connections',
                        'Validates incoming request payload'
                      ].map((role, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-slate-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                          {role}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* FILE RELATIONSHIPS */}
                <div className="flex-1 p-8 bg-[#0d1117] border border-white/5 rounded-[2.5rem] space-y-6 overflow-hidden">
                  <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-amber-400" /> Dependency Graph
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {['UserModel.js', 'authMiddleware.js', 'jwtService.js', 'logger.js'].map(dep => (
                      <div key={dep} className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:border-indigo-500/30 cursor-pointer transition-all flex items-center gap-2">
                        <Code className="w-3.5 h-3.5" /> {dep}
                      </div>
                    ))}
                  </div>
                  <div className="aspect-video bg-black/40 border border-white/5 rounded-2xl flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-slate-600 mb-2">
                      <Layers className="w-8 h-8" />
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Visualizing dependency links for {selectedFile.name}...</p>
                    <button className="px-6 py-2 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-black uppercase tracking-widest">Generate Full Graph</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center space-y-6 text-center">
                <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center border border-white/5 relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 border border-dashed border-indigo-500/20 rounded-[2.5rem]"
                  />
                  <Search className="w-10 h-10 text-slate-700" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-400">Select a file to explore</h3>
                  <p className="text-slate-600 max-w-sm">AI will analyze the file purpose, execution flow, and module relationships instantly.</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setExpandedFolders(['src'])} className="text-xs font-black text-indigo-400 hover:text-indigo-300 underline underline-offset-4 decoration-indigo-500/30">Browse Source Code</button>
                  <button onClick={() => setActiveTab('architecture')} className="text-xs font-black text-purple-400 hover:text-purple-300 underline underline-offset-4 decoration-purple-500/30">View Architecture Map</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ApiSection = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black text-white">Restful Endpoints Analysis</h3>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all">Documentation Export</button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition-all">Test in Sandbox</button>
        </div>
      </div>

      <div className="overflow-hidden border border-white/5 rounded-3xl bg-[#0d1117]">
        <table className="w-full text-left">
          <thead className="bg-[#161b22] border-b border-white/5">
            <tr>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Method</th>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Route</th>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Action</th>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Auth</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {MOCK_APIS.map((api, i) => (
              <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-black ${api.method === 'POST' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'} border border-white/10`}>
                    {api.method}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-sm text-slate-300 group-hover:text-white transition-colors">{api.path}</td>
                <td className="px-6 py-4 text-sm text-slate-400">{api.description}</td>
                <td className="px-6 py-4 text-center">
                  {api.protected ? <Shield className="w-4 h-4 text-amber-500 mx-auto" /> : <Globe className="w-4 h-4 text-slate-600 mx-auto" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const ExecutionFlowSection = () => (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {MOCK_FLOWS.map(flow => (
          <div key={flow.id} className="p-8 bg-[#161b22] border border-white/5 rounded-3xl space-y-6">
            <h4 className="text-xl font-bold text-white flex items-center gap-3">
              <PlayCircle className="w-6 h-6 text-indigo-400" />
              {flow.title}
            </h4>
            <div className="space-y-4">
              {flow.steps.map((step, i) => (
                <div key={i} className="flex items-center gap-6 relative">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-sm font-black text-slate-500 border border-white/10 z-10">
                    {i + 1}
                  </div>
                  <div className="flex-1 p-3 bg-white/[0.02] border border-white/5 rounded-xl text-sm font-medium text-slate-300">
                    {step}
                  </div>
                  {i < flow.steps.length - 1 && (
                    <div className="absolute left-5 top-10 w-[1px] h-4 bg-indigo-500/30" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const SyntaxCommandsSection = () => {
    const categories = [
      {
        title: 'Project Commands',
        icon: Terminal,
        items: [
          { cmd: 'npm run dev', desc: 'Start the Vite development server with HMR.', shortcut: '⌘D' },
          { cmd: 'npm run start', desc: 'Run the production Node.js server.', shortcut: '⌘S' },
          { cmd: 'npm test', desc: 'Execute the test suite using Jest.', shortcut: '⌘T' },
          { cmd: 'npm run build', desc: 'Generate a production-ready bundle.', shortcut: '⌘B' },
        ]
      },
      {
        title: 'Git Workflow',
        icon: GitBranch,
        items: [
          { cmd: 'git pull origin main', desc: 'Sync local branch with latest changes.' },
          { cmd: 'git commit -m "feat:..."', desc: 'Follow conventional commit standards.' },
          { cmd: 'git push', desc: 'Push commits to the remote repository.' },
        ]
      },
      {
        title: 'Environment Variables',
        icon: Shield,
        items: [
          { cmd: 'PORT', desc: 'Backend server port (Default: 5000).' },
          { cmd: 'MONGODB_URI', desc: 'Connection string for the database.' },
          { cmd: 'JWT_SECRET', desc: 'Encryption key for auth tokens.' },
        ]
      }
    ];

    return (
      <div className="space-y-12">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-black text-white">Commands & Syntax Reference</h2>
          <p className="text-slate-400">Master the project's ecosystem with these standard commands and configurations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {categories.map((cat, i) => (
            <div key={i} className="bg-[#111827] border border-white/5 rounded-[2rem] p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                  <cat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">{cat.title}</h3>
              </div>
              <div className="space-y-4">
                {cat.items.map((item, j) => (
                  <div key={j} className="group p-4 bg-black/40 border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-xs font-black text-indigo-400 font-mono tracking-tight">{item.cmd}</code>
                      {item.shortcut && <span className="text-[10px] font-black text-slate-600 bg-white/5 px-1.5 py-0.5 rounded uppercase tracking-tighter">{item.shortcut}</span>}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed group-hover:text-slate-300 transition-colors">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-[2.5rem] p-10 flex items-center justify-between">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white">Coding Standards</h3>
            <p className="text-slate-400 max-w-xl">We use ESLint and Prettier for consistency. Please ensure your code follows the established patterns before opening a PR.</p>
          </div>
          <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center gap-3 whitespace-nowrap">
            View Style Guide <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const AskAiSection = () => (
    <div className="h-full flex flex-col items-center justify-center max-w-4xl mx-auto py-12">
      <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mb-8 border border-indigo-500/20">
        <MessageSquare className="w-10 h-10 text-indigo-400" />
      </div>
      <h2 className="text-3xl font-black text-white mb-4">Chat with the Codebase</h2>
      <p className="text-slate-400 mb-12 text-center text-lg">Ask questions about architecture, logic, or specific features. The AI understands every line of code.</p>

      <div className="w-full relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition-all" />
        <div className="relative bg-[#0d1117] border border-white/10 rounded-2xl flex items-center p-2">
          <input
            type="text"
            placeholder="e.g. 'How does authentication work?' or 'Where is the task creation logic?'"
            value={askAiQuery}
            onChange={(e) => setAskAiQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-white px-6 py-4 text-lg"
          />
          <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-indigo-500/20">
            Ask Gemini
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {['Setup Guide', 'Security Audit', 'Explain JWT flow', 'Main dependencies'].map(tag => (
          <button
            key={tag}
            onClick={() => setAskAiQuery(`Explain ${tag}`)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-[#030712] text-slate-200 font-sans overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      <AnimatePresence>
        {isAnalyzing && <AnalysisOverlay />}
      </AnimatePresence>

      {/* Analysis Sidebar */}
      <motion.aside
        animate={{ width: isSidebarCollapsed ? '80px' : '280px' }}
        className="relative z-30 flex flex-col bg-[#0d1117]/60 backdrop-blur-3xl border-r border-white/5 transition-all duration-300"
      >
        <div className="p-6 flex items-center justify-between">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight text-white leading-none">Insight</span>
                <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Analysis</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all"
          >
            {isSidebarCollapsed ? <Menu className="w-5 h-5" /> : <ChevronRight className="w-5 h-5 rotate-180" />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-6 overflow-y-auto custom-scrollbar">
          <SidebarItem icon={Layout} label="Overview" active={activeSection === 'overview'} onClick={() => setActiveSection('overview')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={FolderOpen} label="Folder Structure" active={activeSection === 'folders'} onClick={() => setActiveSection('folders')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Layers} label="Architecture" active={activeSection === 'architecture'} onClick={() => setActiveSection('architecture')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Terminal} label="APIs" active={activeSection === 'apis'} onClick={() => setActiveSection('apis')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Database} label="Database" active={activeSection === 'database'} onClick={() => setActiveSection('database')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Shield} label="Authentication" active={activeSection === 'auth'} onClick={() => setActiveSection('auth')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={PlayCircle} label="Execution Flow" active={activeSection === 'flow'} onClick={() => setActiveSection('flow')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={Activity} label="Insights" active={activeSection === 'insights'} onClick={() => setActiveSection('insights')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={MessageSquare} label="Ask AI" active={activeSection === 'ask'} onClick={() => setActiveSection('ask')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={FileCode2} label="Commands & Syntax" active={activeSection === 'syntax'} onClick={() => setActiveSection('syntax')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={BookOpen} label="Setup Guide" active={activeSection === 'setup'} onClick={() => setActiveSection('setup')} collapsed={isSidebarCollapsed} />
        </nav>

        <div className="p-6 border-t border-white/5">
          {!isSidebarCollapsed && (
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Beginner Mode</span>
              <button
                onClick={() => setIsBeginnerMode(!isBeginnerMode)}
                className={`w-10 h-5 rounded-full p-1 transition-all duration-300 ${isBeginnerMode ? 'bg-indigo-600' : 'bg-slate-800'}`}
              >
                <motion.div animate={{ x: isBeginnerMode ? 20 : 0 }} className="w-3 h-3 bg-white rounded-full shadow-lg" />
              </button>
            </div>
          )}
          <button
            onClick={() => navigate('/repos')}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 text-slate-400 border border-white/5 rounded-xl text-xs font-bold hover:bg-white/10 hover:text-white transition-all"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            {!isSidebarCollapsed && 'Back to Dashboard'}
          </button>
        </div>
      </motion.aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col relative z-20 overflow-hidden">
        {/* Top Toolbar */}
        <header className="h-20 flex items-center justify-between px-8 bg-[#0d1117]/20 backdrop-blur-xl border-b border-white/5 relative z-40">
          <div className="flex items-center gap-4">
            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
              <GitBranch className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-bold text-white">main</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </div>
            <div className="h-6 w-[1px] bg-white/10" />
            <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
              <BookOpen className="w-4 h-4" />
              / Enterprise-Task-Studio
            </div>
          </div>

          <div className="flex-1 flex justify-center max-w-xl mx-auto px-4">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="text"
                placeholder="Ask anything about this repository..."
                className="w-full h-11 bg-white/5 border border-white/5 rounded-2xl pl-11 pr-4 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all shadow-inner shadow-black/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleAnalysis} className="p-2.5 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all group">
              <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
            </button>
            <button className="p-2.5 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all">
              <Share2 className="w-5 h-5" />
            </button>
            <div className="h-6 w-[1px] bg-white/10 mx-2" />
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-slate-200 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-xl active:scale-95">
              <Download className="w-3.5 h-3.5" />
              Export Guide
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col p-10">
          <div className="max-w-6xl w-full mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {activeSection === 'overview' && <OverviewSection />}
                {activeSection === 'folders' && <FolderStructureSection />}
                {activeSection === 'apis' && <ApiSection />}
                {activeSection === 'flow' && <ExecutionFlowSection />}
                {activeSection === 'syntax' && <SyntaxCommandsSection />}
                {activeSection === 'ask' && <AskAiSection />}
                {/* Placeholders for other sections */}
                {['architecture', 'database', 'auth', 'insights', 'setup'].includes(activeSection) && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mb-6 border border-indigo-500/20">
                      <Cpu className="w-10 h-10 text-indigo-400" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Synthesizing {activeSection} Details</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">AI is analyzing the underlying logic to generate deep technical insights for this module.</p>
                    <button className="mt-8 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black text-white hover:bg-white/10 transition-all uppercase tracking-widest">Regenerate Analysis</button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Status */}
        <footer className="h-14 flex items-center justify-between px-10 bg-[#0d1117]/40 backdrop-blur-xl border-t border-white/5 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
          <div className="flex items-center gap-8">
            <span className="text-indigo-500/60">AI Onboarding Engine v2.0</span>
            <div className="flex items-center gap-4">
              <span className="hover:text-slate-400 transition-colors cursor-pointer">Security Protocol</span>
              <span className="hover:text-slate-400 transition-colors cursor-pointer">Tech Stack Detector</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Scanning Complete</span>
            </div>
          </div>
        </footer>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        ::selection {
          background: rgba(99, 102, 241, 0.3);
          color: white;
        }
      `}</style>
    </div>
  );
};

export default RepositoryGuideWorkspace;
