import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Plus, 
  MessageSquare, 
  Code2, 
  GitPullRequest, 
  GitBranch, 
  Users, 
  ArrowRight,
  TrendingUp,
  Globe,
  Filter,
  Star,
  Cpu,
  ChevronDown,
  X,
  Zap,
  Send,
  Box,
  Layout
} from 'lucide-react';
import API from '../api';
import RepositoryDropdown from './RepositoryDropdown';
import AskDropdown from './AskDropdown';
import CreateDropdown from './CreateDropdown';

const MainContent = () => {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWriteCodeDropdown, setShowWriteCodeDropdown] = useState(false);
  const [showGitDropdown, setShowGitDropdown] = useState(false);
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);
  const [activeGitSection, setActiveGitSection] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleChatSubmit = async () => {
    if (!chatInput.trim() && uploadedFiles.length === 0) return;
    setIsChatLoading(true);
    setChatResponse('');
    try {
      let finalPrompt = chatInput;
      if (uploadedFiles.length > 0) {
        finalPrompt += "\n\nAttached Files Context:\n";
        for (const file of uploadedFiles) {
          try {
            const text = await file.text();
            finalPrompt += `\n--- ${file.name} ---\n${text}\n\n`;
          } catch (e) {
            console.error("Could not read file", file.name, e);
          }
        }
      }
      const res = await API.post('/chat-api/prompt', { prompt: finalPrompt });
      setChatResponse(res.data.response);
    } catch (err) {
      console.error(err);
      setChatResponse('Error fetching response from AI.');
    } finally {
      setIsChatLoading(false);
      setChatInput('');
      setUploadedFiles([]);
    }
  };

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        setLoading(true);
        const response = await API.get('/org-api/my-orgs');
        setOrgs(response.data || []);
      } catch (err) {
        console.error('Error fetching orgs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrgs();
  }, []);



  return (
    <div className="flex-1 bg-[var(--bg-primary)] p-4 lg:p-8 overflow-y-auto custom-scrollbar transition-colors">
      <div className="max-w-[1200px] mx-auto">
        {/* Top Announcement Bar removed per user request */}

        {/* AI Copilot Input Box */}
        <div className="mb-6">
          <div className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl shadow-sm flex flex-col focus-within:ring-1 focus-within:ring-[#1f6feb] transition-all">
            {uploadedFiles.length > 0 && (
              <div className="px-4 pt-4 flex flex-wrap gap-2">
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-md group">
                    <div className="w-3.5 h-3.5 flex items-center justify-center bg-[var(--bg-secondary)] rounded-[3px]">
                      <span className="text-[9px] text-[var(--text-secondary)] font-bold uppercase">{file.name.split('.').pop().substring(0,3)}</span>
                    </div>
                    <span className="text-xs font-medium text-[var(--text-primary)] max-w-[120px] truncate">{file.name}</span>
                    <button 
                      onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                      className="ml-1 text-[var(--text-secondary)] hover:text-[#f85149] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <textarea 
              id="ai-input"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleChatSubmit();
                }
              }}
              placeholder="Ask anything or type @ to add context"
              className="w-full bg-transparent border-none outline-none text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] p-4 resize-none h-24 text-sm"
            />
            
            <div className="flex items-center justify-between p-2 border-t border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <AskDropdown isCompact={false} />
                <div className="relative">
                  <button 
                    onClick={() => setShowRepoDropdown(!showRepoDropdown)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors border border-[var(--border-color)]"
                  >
                    <Box className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                    All repositories
                    <ChevronDown className="w-3 h-3 text-[var(--text-secondary)]" />
                  </button>
                  <RepositoryDropdown isOpen={showRepoDropdown} onClose={() => setShowRepoDropdown(false)} />
                </div>
                <CreateDropdown 
                  isCompact={false} 
                  onUploadComplete={(newFiles) => setUploadedFiles(prev => [...prev, ...newFiles])} 
                />
              </div>
              
              <div className="flex items-center gap-3 pr-2">
                {/* Icons removed per user request */}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons underneath */}
        <div className="flex flex-wrap items-center gap-3 mt-4 ml-1">
          {[
            { icon: Cpu, label: 'Agent', active: false },
            { icon: Layout, label: 'Spaces', path: '/spaces' },
            { icon: MessageSquare, label: 'Create issue' },
            { icon: Code2, label: 'Write code', dropdown: true },
            { icon: GitBranch, label: 'Git', dropdown: true },
            { icon: GitPullRequest, label: 'Pull requests', dropdown: true },
          ].map((btn, i) => (
            <div key={i} className="relative">
              <button 
                onClick={() => {
                  if (btn.label === 'Create issue') {
                    window.location.href = '/new-issue';
                  } else if (btn.label === 'Spaces') {
                    window.location.href = '/spaces';
                  } else if (btn.label === 'Write code') {
                    setShowWriteCodeDropdown(!showWriteCodeDropdown);
                    setShowGitDropdown(false);
                    setShowPRDropdown(false);
                  } else if (btn.label === 'Git') {
                    setShowGitDropdown(!showGitDropdown);
                    setShowWriteCodeDropdown(false);
                    setShowPRDropdown(false);
                  } else if (btn.label === 'Pull requests') {
                    window.location.href = '/pulls';
                  } else if (btn.label === 'Agent') {
                    window.location.href = '/agent';
                  }
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all`}
              >
                <btn.icon className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                {btn.label}
                {btn.dropdown && <ChevronDown className="w-3 h-3 text-[var(--text-secondary)]" />}
              </button>

              {btn.label === 'Write code' && showWriteCodeDropdown && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-md shadow-lg z-50 py-1">
                  {[
                    'Create a profile README',
                    'Generate a simple calculator',
                    'Make a Pong game',
                    'Design a Mermaid architecture overview'
                  ].map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        if (item === 'Create a profile README') {
                          setChatInput("First, create an outstanding README for my GitHub profile using only Markdown. Then ask for key details (such as profession, top skills, favorite projects, or social links) to further refine and personalize it.");
                        } else if (item === 'Make a Pong game') {
                          setChatInput("Create a simple Pong game using HTML, CSS, and JavaScript. The player should control the left paddle with their mouse and arrow keys up/down, the right paddle is the computer. Make sure the game includes a bouncing ball, a scoreboard and collision detection for paddles and walls.");
                        } else {
                          setChatInput(item);
                        }
                        setShowWriteCodeDropdown(false);
                      }}
                      className="px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[#1f6feb] hover:text-white cursor-pointer transition-colors"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}

              {btn.label === 'Git' && showGitDropdown && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-md shadow-lg z-50 py-1">
                  {[
                    'Basic Git commands',
                    'Git branching',
                    'Undoing changes'
                  ].map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        setActiveGitSection(item);
                        setShowGitDropdown(false);
                      }}
                      className="px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[#1f6feb] hover:text-white cursor-pointer transition-colors"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}


            </div>
          ))}
        </div>

        {/* AI Chat History / Response Section */}
        <AnimatePresence>
          {chatResponse && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-8 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-xl"
            >
              <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#2f81f7]" />
                  <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">AI Agent Response</span>
                </div>
                <button onClick={() => setChatResponse('')} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 prose prose-invert prose-sm max-w-none prose-pre:bg-[var(--bg-tertiary)] prose-pre:border prose-pre:border-[var(--border-color)] text-[var(--text-primary)]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {chatResponse}
                </ReactMarkdown>
              </div>
            </motion.div>
          )}

          {activeGitSection && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-6 overflow-hidden shadow-sm text-left w-full"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#238636]/10 flex items-center justify-center border border-[#238636]/20">
                    <GitBranch className="w-4 h-4 text-[#2ea043]" />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest">{activeGitSection}</h3>
                </div>
                <button onClick={() => setActiveGitSection(null)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {activeGitSection === 'Basic Git commands' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { cmd: 'git add', desc: 'Adds changes in the working directory to the staging area.', code: 'git add <file>' },
                    { cmd: 'git commit', desc: 'Saves your staged changes with a descriptive message.', code: 'git commit -m "msg"' },
                    { cmd: 'git status', desc: 'Shows the current state of your working directory and staging area.', code: 'git status' },
                    { cmd: 'git push', desc: 'Uploads local commits to the remote repository.', code: 'git push origin main' },
                    { cmd: 'git pull', desc: 'Fetches and merges changes from the remote repository.', code: 'git pull origin main' }
                  ].map((c, i) => (
                    <div key={i} className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-4 hover:border-[#8b949e] transition-colors flex flex-col gap-3 shadow-sm">
                      <div className="font-mono text-xs font-semibold text-[#2f81f7] bg-[#2f81f7]/10 px-2 py-1 rounded w-fit">{c.cmd}</div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed flex-1">{c.desc}</p>
                      {c.code && (
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded p-2.5 mt-auto">
                          <code className="text-xs text-[#e3b341] font-mono">{c.code}</code>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeGitSection === 'Git branching' && (
                <div className="space-y-6">
                  <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">What is a branch?</h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-5">
                      A branch is like a parallel universe of your project. It allows you to work on new features or bug fixes without affecting the main codebase.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-4 hover:border-[#8b949e] transition-colors">
                        <div className="font-mono text-xs font-semibold text-[#2f81f7] mb-2 bg-[#2f81f7]/10 px-2 py-1 rounded w-fit">git branch</div>
                        <p className="text-xs text-[var(--text-secondary)] mb-3">Lists all local branches. Add a name to create a new one.</p>
                        <code className="text-xs text-[#e3b341] font-mono block bg-[var(--bg-tertiary)] p-2.5 rounded border border-[var(--border-color)]">git branch feature-x</code>
                      </div>
                      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-4 hover:border-[#8b949e] transition-colors">
                        <div className="font-mono text-xs font-semibold text-[#2f81f7] mb-2 bg-[#2f81f7]/10 px-2 py-1 rounded w-fit">git checkout / switch</div>
                        <p className="text-xs text-[var(--text-secondary)] mb-3">Switches to the specified branch to work on it.</p>
                        <code className="text-xs text-[#e3b341] font-mono block bg-[var(--bg-tertiary)] p-2.5 rounded border border-[var(--border-color)]">git switch feature-x</code>
                      </div>
                      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-4 md:col-span-2 hover:border-[#8b949e] transition-colors">
                        <div className="font-mono text-xs font-semibold text-[#2f81f7] mb-2 bg-[#2f81f7]/10 px-2 py-1 rounded w-fit">git merge</div>
                        <p className="text-xs text-[var(--text-secondary)] mb-3">Combines changes from another branch into your current branch.</p>
                        <code className="text-xs text-[#e3b341] font-mono block bg-[var(--bg-tertiary)] p-2.5 rounded border border-[var(--border-color)]">git merge feature-x</code>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeGitSection === 'Undoing changes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { cmd: 'git revert', desc: 'Creates a new commit that undoes the changes from a previous commit. Safe for public history.', code: 'git revert <hash>' },
                    { cmd: 'git reset', desc: 'Moves the branch pointer backwards. Can unstage or even delete uncommitted work.', code: 'git reset --hard HEAD~1', warn: 'WARNING: --hard will erase your uncommitted changes.' }
                  ].map((c, i) => (
                    <div key={i} className="bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg p-5 flex flex-col gap-3 shadow-sm hover:border-[#8b949e] transition-colors">
                      <div className="font-mono text-xs font-semibold text-[#d2a8ff] bg-[#d2a8ff]/10 px-2 py-1 rounded w-fit">{c.cmd}</div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed flex-1">{c.desc}</p>
                      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded p-2.5">
                        <code className="text-xs text-[#e3b341] font-mono">{c.code}</code>
                      </div>
                      {c.warn && (
                        <div className="mt-2 text-[10px] text-[#f85149] flex items-center gap-1">
                          <span>⚠️</span> {c.warn}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feed Section */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4 border-b border-[var(--border-color)] pb-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Feed</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-[var(--text-secondary)]" />
              <span className="text-xs text-[var(--text-secondary)] font-medium">Your organizations • <span className="text-[#2f81f7] hover:underline cursor-pointer" onClick={() => window.location.href = '/orgs'}>See more</span></span>
            </div>

            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1f6feb] mx-auto" />
              </div>
            ) : orgs.length > 0 ? (
              orgs.map((org) => (
                <div key={org._id} className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-5 hover:bg-[var(--bg-secondary)] transition-all group shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center border border-[var(--border-color)] overflow-hidden">
                        {org.logo ? (
                          <img src={org.logo} alt={org.name} className="w-full h-full object-cover" />
                        ) : (
                          <Users className="w-5 h-5 text-[var(--text-secondary)]" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-md font-bold text-[#2f81f7] hover:underline cursor-pointer" onClick={() => window.location.href = `/org/${org._id}`}>
                          {org.name}
                        </h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-secondary)] font-medium uppercase">
                          {org.myRole || 'Member'}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => window.location.href = `/org/${org._id}`}
                      className="px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-md transition-all flex items-center gap-2 group"
                    >
                      View
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed line-clamp-2">{org.description || "No description provided."}</p>
                  <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                    {/* Visibility removed per user request */}
                    <span className="flex items-center gap-1.5 font-medium">
                      <Users className="w-3.5 h-3.5" /> Member since {new Date(org.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl">
                <p className="text-sm text-[var(--text-secondary)]">No organizations found.</p>
              </div>
            )}
          </div>
        </section>


      </div>
    </div>
  );
};

export default MainContent;
