import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { 
  MessageSquare, 
  MessageCircle, 
  Plus, 
  Search, 
  ThumbsUp, 
  CheckCircle, 
  Pin, 
  Lock, 
  Users, 
  HelpCircle, 
  Lightbulb, 
  Megaphone, 
  Trophy, 
  LifeBuoy, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Info,
  Clock,
  Book,
  Cpu,
  Star,
  ChevronRight,
  Terminal,
  Zap,
  Globe,
  Share2,
  X,
  User,
  MoreVertical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';

const DiscussionsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({ container: scrollRef });
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  const categories = [
    { icon: HelpCircle, label: "Q&A", color: "text-blue-400", bg: "bg-blue-400/10", desc: "Ask technical questions and get answers." },
    { icon: Lightbulb, label: "Ideas", color: "text-purple-400", bg: "bg-purple-400/10", desc: "Suggest improvements or new features." },
    { icon: Megaphone, label: "Announcements", color: "text-green-400", bg: "bg-green-400/10", desc: "Project updates from maintainers." },
    { icon: MessageSquare, label: "General", color: "text-gray-400", bg: "bg-gray-400/10", desc: "Community conversations and chats." },
    { icon: Trophy, label: "Show & Tell", color: "text-yellow-400", bg: "bg-yellow-400/10", desc: "Share your projects and achievements." },
    { icon: LifeBuoy, label: "Help", color: "text-red-400", bg: "bg-red-400/10", desc: "Beginner guidance and troubleshooting." },
  ];

  const workflowSteps = [
    { title: "Create Discussion", desc: "Start a conversation or ask a question.", icon: Plus },
    { title: "Community Replies", desc: "Other developers jump in to help or share thoughts.", icon: Users },
    { title: "Questions Answered", desc: "The community provides solutions and feedback.", icon: MessageCircle },
    { title: "Ideas Shared", desc: "New concepts are brainstormed and refined.", icon: Lightbulb },
    { title: "Solutions Marked", desc: "The best answer is highlighted for everyone.", icon: CheckCircle },
    { title: "Knowledge Archived", desc: "The discussion remains searchable for future learners.", icon: Book },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[#1f6feb]/30 overflow-x-hidden">
      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-[#2f81f7] z-[100] origin-left"
        style={{ scaleX }}
      />

      <TopNavbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        <main ref={scrollRef} className="flex-1 h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar pt-20 px-4 sm:px-8 pb-32">
          <div className="max-w-5xl mx-auto space-y-32">
            
            {/* SECTION 1 — HERO HEADER */}
            <section className="relative pt-10">
              <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-500/[0.08] rounded-full blur-[140px] animate-pulse pointer-events-none" />
              <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-purple-500/[0.06] rounded-full blur-[140px] animate-pulse pointer-events-none" style={{ animationDuration: '6s' }} />
              
              {/* Modern Grid Lighting Pattern */}
              <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-8 relative z-10"
              >
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-500/20">Community Collaboration</span>
                  <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-purple-500/20">Developer Communication</span>
                  <span className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-500/20">Open Source Discussions</span>
                </div>
                
                <div className="space-y-4">
                  <h1 className="text-7xl font-black text-white leading-[1.1] tracking-tight">
                    GitHub <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Discussions</span>
                  </h1>
                  <p className="text-xl text-[#8b949e] leading-relaxed max-w-3xl">
                    Learn how developers communicate, ask questions, share ideas, and collaborate through GitHub Discussions.
                  </p>
                </div>

                <div className="flex items-center gap-8 py-6 border-y border-white/5">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-white">Discussions</span>
                    <span className="text-xs text-[#8b949e]">Topic</span>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex items-center gap-2">
                    <Book className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-white">Beginner</span>
                    <span className="text-xs text-[#8b949e]">Difficulty</span>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-white">8 mins</span>
                    <span className="text-xs text-[#8b949e]">Est. Time</span>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* SECTION 2 — WHAT ARE GITHUB DISCUSSIONS? */}
            <section className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Info className="w-4 h-4 text-blue-400" />
                  </div>
                  What Are GitHub Discussions?
                </h2>
                <p className="text-[#8b949e] leading-relaxed text-lg max-w-3xl">
                  GitHub Discussions is a community communication system that allows developers to ask questions, share ideas, and interact with project communities directly inside a repository.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="p-8 bg-[#161B22] border border-white/5 rounded-3xl space-y-4 relative group">
                    <div className="absolute inset-0 bg-blue-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                    <h3 className="text-xl font-bold text-white">Conversational vs Task-Oriented</h3>
                    <p className="text-[#8b949e] text-sm leading-relaxed">
                      Unlike Issues, which are focused on tracking specific bugs or tasks, Discussions are for open-ended conversations, brainstorming, and community help.
                    </p>
                    <div className="pt-4 flex items-center gap-4">
                      <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 font-bold text-xs uppercase tracking-widest">Forum Style</div>
                      <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 font-bold text-xs uppercase tracking-widest">Community Focused</div>
                    </div>
                  </div>
                  <div className="p-6 bg-gradient-to-r from-blue-600/10 to-transparent border-l-4 border-blue-500 rounded-r-xl">
                    <p className="text-sm text-blue-200 italic">
                      "Discussions are like a community forum built directly inside a repository."
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="p-1 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-[32px]"
                  >
                    <div className="bg-[#0d1117] p-8 rounded-[30px] border border-white/5 space-y-6 text-center">
                      <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto">
                        <MessageSquare className="w-8 h-8 text-blue-400" />
                      </div>
                      <div className="space-y-2">
                        <div className="text-2xl font-black text-white">Discussions = </div>
                        <div className="text-sm text-[#8b949e]">Questions + Ideas + Collaboration</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="h-1 bg-blue-500 rounded-full" />
                        <div className="h-1 bg-purple-500 rounded-full" />
                        <div className="h-1 bg-green-500 rounded-full" />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* SECTION 3 — WHY DEVELOPERS USE DISCUSSIONS */}
            <section className="space-y-12">
              <h2 className="text-3xl font-bold text-white tracking-tight text-center">Why Developers Use Discussions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { icon: HelpCircle, title: "Ask Questions", desc: "Developers get help from the community without opening formal bug reports." },
                  { icon: Lightbulb, title: "Share Ideas", desc: "Teams discuss new features and potential improvements before writing code." },
                  { icon: Users, title: "Community Support", desc: "Contributors help each other solve problems and learn the codebase." },
                  { icon: Globe, title: "Open Source Collaboration", desc: "Global communities communicate efficiently on a single platform." },
                  { icon: Megaphone, title: "Project Announcements", desc: "Maintainers share important updates and roadmap changes." },
                  { icon: Book, title: "Knowledge Sharing", desc: "Common questions are archived, creating a searchable learning base." }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -8, borderColor: 'rgba(88, 166, 255, 0.4)' }}
                    className="p-6 bg-[#1C2128] border border-white/5 rounded-2xl group transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <item.icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="text-white font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-[#8b949e] leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* SECTION 4 — DISCUSSIONS VS ISSUES */}
            <section className="space-y-12">
              <h2 className="text-3xl font-bold text-white tracking-tight text-center">Discussions vs Issues</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className="p-8 bg-blue-500/[0.02] border border-blue-500/20 rounded-[32px] space-y-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Discussions</h3>
                  </div>
                  <ul className="space-y-3">
                    {["Conversations", "Questions & Help", "Brainstorming", "Community Interaction"].map((point, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-[#8b949e]">
                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className="p-8 bg-orange-500/[0.02] border border-orange-500/20 rounded-[32px] space-y-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-orange-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Issues</h3>
                  </div>
                  <ul className="space-y-3">
                    {["Bug Tracking", "Tasks & To-Dos", "Feature Tracking", "Development Work"].map((point, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-[#8b949e]">
                        <CheckCircle2 className="w-4 h-4 text-orange-400" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            </section>

            {/* SECTION 5 — DISCUSSION CATEGORIES */}
            <section className="space-y-12">
              <h2 className="text-3xl font-bold text-white tracking-tight text-center">Common Discussion Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className="p-6 bg-[#161B22] border border-white/5 rounded-2xl space-y-4 hover:border-white/10 transition-all"
                  >
                    <div className={`w-12 h-12 rounded-xl ${cat.bg} flex items-center justify-center`}>
                      <cat.icon className={`w-6 h-6 ${cat.color}`} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{cat.label}</h3>
                      <p className="text-xs text-[#8b949e] leading-relaxed mt-1">{cat.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* SECTION 6 — REAL-WORLD OPEN SOURCE EXAMPLE */}
            <section className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-white tracking-tight">Real Open Source Community Example</h2>
                <p className="text-[#8b949e] text-lg max-w-3xl">
                  An open-source React UI library has thousands of users. Community members use Discussions to ask setup questions, request features, and help beginners.
                </p>
              </div>

              {/* Realistic Discussion Thread UI */}
              <div className="bg-[#0d1117] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-6 bg-[#161B22] border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">How can I customize the dark theme?</h4>
                      <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">❓ Q&A</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-white/5 rounded-md"><MoreVertical size={16} className="text-[#8b949e]" /></button>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  {/* OP Post */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-500/20 shrink-0" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">beginner_dev</span>
                        <span className="text-[10px] text-[#8b949e]">2 days ago</span>
                      </div>
                      <p className="text-sm text-[#c9d1d9] leading-relaxed">
                        I want to change the navbar colors dynamically. Is there a recommended approach? I tried CSS variables but it doesn't seem to work with the library components.
                      </p>
                    </div>
                  </div>

                  {/* Replies */}
                  <div className="ml-8 pl-8 border-l border-white/5 space-y-8">
                    {[
                      { user: "ui_expert", text: "Use the theme provider configuration. It handles dynamic updates automatically.", isAnswer: true },
                      { user: "docs_bot", text: "Check the documentation here: /docs/theming. There's a section on dynamic overrides.", isAnswer: false },
                      { user: "code_master", text: "Here’s a working example: codesandbox.io/s/dynamic-theme-ui-lib", isAnswer: false }
                    ].map((reply, i) => (
                      <div key={i} className="flex gap-4 relative">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 shrink-0" />
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{reply.user}</span>
                            <span className="text-[10px] text-[#8b949e]">{i + 1} day ago</span>
                          </div>
                          <p className="text-sm text-[#c9d1d9] leading-relaxed">{reply.text}</p>
                          {reply.isAnswer && (
                            <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
                              <CheckCircle size={10} /> Accepted Answer
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 7 — HOW DISCUSSIONS WORK */}
            <section className="space-y-16">
              <h2 className="text-3xl font-bold text-white tracking-tight text-center">Typical Discussion Workflow</h2>
              <div className="relative max-w-xl mx-auto">
                <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-transparent" />
                
                <div className="space-y-12">
                  {workflowSteps.map((step, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-8 relative group"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#161B22] border border-white/10 flex items-center justify-center relative z-10 group-hover:border-blue-500/50 transition-colors shadow-xl">
                        <step.icon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1 pt-1">
                        <h4 className="text-white font-bold text-lg mb-1">{step.title}</h4>
                        <p className="text-sm text-[#8b949e] leading-relaxed">{step.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* SECTION 8 — BEST PRACTICES */}
            <section className="space-y-12">
              <h2 className="text-3xl font-bold text-white tracking-tight text-center">Discussion Best Practices</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Ask clear and specific questions",
                  "Provide context and screenshots",
                  "Be respectful and professional",
                  "Search before posting duplicates",
                  "Help other developers in the community",
                  "Keep discussions organized in categories"
                ].map((item, i) => (
                  <div key={i} className="p-5 bg-green-500/[0.02] border border-green-500/10 rounded-2xl flex items-center gap-4 group hover:bg-green-500/[0.05] transition-all">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    </div>
                    <span className="text-sm font-medium text-[#c9d1d9]">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 9 — COMMON BEGINNER MISTAKES */}
            <section className="space-y-12">
              <h2 className="text-3xl font-bold text-white tracking-tight text-center">Common Beginner Mistakes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: "Asking Vague Questions", tip: "Always include details like library versions and error messages." },
                  { title: "Posting Bugs as Discussions", tip: "Real bugs belong in 'Issues' so they can be tracked to a fix." },
                  { title: "Ignoring Categories", tip: "Using categories like 'Q&A' helps experts find your question faster." },
                  { title: "Poor Communication", tip: "Avoid slang or demanding tones. Be kind and professional." },
                  { title: "Duplicate Discussions", tip: "Search the archives first. Most questions have already been answered!" }
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-red-500/[0.02] border border-red-500/10 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <h3 className="text-white font-bold">{item.title}</h3>
                    </div>
                    <p className="text-xs text-[#8b949e] leading-relaxed">
                      <span className="text-blue-400 font-bold">Pro Tip:</span> {item.tip}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 10 — QUICK FACTS */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "Community Driven", text: "Open-source communities rely heavily on Discussions for growth." },
                { label: "Efficiency", text: "Discussions help reduce repeated questions and support burden." },
                { label: "Onboarding", text: "New contributors learn faster by reading archived conversations." },
                { label: "Collaboration", text: "Discussions bridge the gap between users and maintainers." }
              ].map((fact, i) => (
                <div key={i} className="p-6 bg-[#1C2128] border border-white/5 rounded-2xl flex items-start gap-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Zap className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white mb-1">{fact.label}</h5>
                    <p className="text-xs text-[#8b949e] leading-relaxed">{fact.text}</p>
                  </div>
                </div>
              ))}
            </section>

            {/* SECTION 11 — HANDS-ON PRACTICAL EXAMPLE */}
            <section className="space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-white tracking-tight">Hands-On Discussion Example</h2>
                <p className="text-[#8b949e]">Learn how developers interact using real GitHub Discussions workflows.</p>
              </div>

              <div className="bg-[#161B22] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                  <Terminal className="w-64 h-64 text-blue-400" />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
                  {/* Left Sidebar - Repo Info */}
                  <div className="lg:col-span-3 bg-[#0d1117]/50 border-r border-white/5 p-8 space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-blue-400">
                        <Book className="w-5 h-5" />
                        <span className="text-sm font-bold tracking-tight">Repository</span>
                      </div>
                      <div className="font-mono text-xs text-white bg-white/5 p-3 rounded-lg border border-white/10">
                        awesome-ui-library/
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-purple-400">
                        <Users className="w-5 h-5" />
                        <span className="text-sm font-bold tracking-tight">Status</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] text-[#8b949e]">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active Community
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-[#8b949e]">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> 2.4k Discussions
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Interactive Steps */}
                  <div className="lg:col-span-9 p-8 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { step: "01", label: "Create", desc: "Ask about navbar theme." },
                        { step: "02", label: "Discuss", desc: "Community provides options." },
                        { step: "03", label: "Solve", desc: "Mark the best answer." }
                      ].map((s, i) => (
                        <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                          <span className="text-[10px] font-black text-blue-400">{s.step}</span>
                          <h4 className="text-sm font-bold text-white">{s.label}</h4>
                          <p className="text-[10px] text-[#8b949e]">{s.desc}</p>
                        </div>
                      ))}
                    </div>

                    {/* Step 1 Preview - Creation UI */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-bold text-white">Create New Discussion</h4>
                        <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded">Step 1/3</span>
                      </div>
                      
                      <div className="space-y-4 bg-[#0d1117] p-6 rounded-2xl border border-white/10 shadow-inner">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">Title</label>
                          <div className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white font-medium">
                            How do I customize the navbar theme?
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">Category</label>
                            <div className="w-full bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-xs text-blue-400 font-bold flex items-center gap-2">
                              <HelpCircle className="w-3 h-3" /> Q&A
                            </div>
                          </div>
                          <div className="space-y-2 text-right">
                             <label className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest opacity-0">Action</label>
                             <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-900/20 transition-all">
                               Post Discussion
                             </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Visual Flow Summary */}
                    <div className="pt-8 border-t border-white/5 flex flex-wrap justify-center gap-4">
                       {[
                         "Question Asked",
                         "Community Discussion",
                         "Solution Provided",
                         "Answer Accepted"
                       ].map((step, i, arr) => (
                         <React.Fragment key={i}>
                           <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-400">
                               {i + 1}
                             </div>
                             <span className="text-[10px] font-bold text-[#8b949e]">{step}</span>
                           </div>
                           {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-white/10 self-center" />}
                         </React.Fragment>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 12 — QUICK REVISION FLASHCARDS */}

            <section className="space-y-12">
              <h2 className="text-3xl font-bold text-white tracking-tight text-center italic">Quick Revision</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { q: "What are GitHub Discussions?", a: "A community communication system built directly inside repositories." },
                  { q: "Discussions vs Issues?", a: "Discussions are for conversations; Issues are for specific tasks or bug tracking." },
                  { q: "Why are Discussions important?", a: "They foster community collaboration and searchable knowledge sharing." },
                  { q: "What is a Q&A category?", a: "A specific discussion category used for asking and answering technical questions." }
                ].map((card, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className="group perspective-1000 h-48"
                  >
                    <div className="relative w-full h-full transition-transform duration-500 transform-style-3d group-hover:rotate-y-180">
                      {/* Front */}
                      <div className="absolute inset-0 bg-[#161B22] border border-white/5 rounded-[32px] p-8 flex flex-col justify-center items-center text-center backface-hidden shadow-2xl">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Question</span>
                        <p className="text-white font-bold">{card.q}</p>
                        <div className="mt-4 text-[10px] text-[#8b949e] italic">Hover to flip</div>
                      </div>
                      {/* Back */}
                      <div className="absolute inset-0 bg-blue-600 rounded-[32px] p-8 flex flex-col justify-center items-center text-center backface-hidden rotate-y-180 shadow-2xl">
                        <span className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-2 text-white/60">Answer</span>
                        <p className="text-white font-bold leading-relaxed">{card.a}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* SECTION 13 — FINAL CTA */}
            <section className="relative py-24 px-12 bg-gradient-to-br from-blue-600 to-purple-700 rounded-[60px] overflow-hidden text-center group shadow-2xl">
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative z-10 space-y-10 max-w-3xl mx-auto">
                <div className="space-y-6">
                  <h2 className="text-5xl font-black text-white tracking-tight leading-tight">Join the Developer Community</h2>
                  <p className="text-blue-100 text-lg leading-relaxed max-w-xl mx-auto">
                    Modern software development is built on collaboration, communication, and shared knowledge. Start participating today!
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/companion')}
                    className="px-12 py-5 bg-white text-blue-600 rounded-[30px] font-black text-xl shadow-2xl flex items-center gap-4 group/btn transition-all"
                  >
                    Continue Learning
                    <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" />
                  </motion.button>
                </div>
              </div>
            </section>

          </div>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-1000 { perspective: 1000px; }
        .backface-hidden { backface-visibility: hidden; }
        .transform-style-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}} />
    </div>
  );
};

export default DiscussionsPage;
