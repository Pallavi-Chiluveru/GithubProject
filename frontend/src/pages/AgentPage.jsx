import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  PlusSquare, 
  MessageSquare, 
  Box, 
  Sparkles, 
  ChevronDown, 
  Plus, 
  Send,
  Cpu,
  Code2,
  GitBranch,
  GitPullRequest,
  X
} from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import API from '../api';
import AskDropdown from '../components/AskDropdown';
import { useTheme } from '../theme/ThemeContext';
import darkLogo from '../assets/antigravity_logo_dark.png';
import lightLogo from '../assets/image.png';

const AgentPage = () => {
  const navigate = useNavigate();
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showWriteCodeDropdown, setShowWriteCodeDropdown] = useState(false);
  const [showGitDropdown, setShowGitDropdown] = useState(false);
  const [showPRDropdown, setShowPRDropdown] = useState(false);
  const [activeGitSection, setActiveGitSection] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  let theme = 'light';
  try {
    const themeContext = useTheme();
    theme = themeContext?.theme || 'light';
  } catch (e) {
    // Fallback if rendered outside of ThemeProvider context
  }
  const logoSrc = theme === 'dark' ? darkLogo : lightLogo;

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    const prompt = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: prompt }]);
    setIsChatLoading(true);

    try {
      const res = await API.post('/chat-api/prompt', { prompt });
      setChatHistory(prev => [...prev, { role: 'bot', text: res.data.response }]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { role: 'bot', text: 'Error fetching response from AI.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleNewChat = () => {
    setChatHistory([]);
    setChatInput('');
    setIsChatLoading(false);
    setShowWriteCodeDropdown(false);
    setShowGitDropdown(false);
    setShowPRDropdown(false);
    setActiveGitSection(null);
  };

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans overflow-hidden transition-colors">
      {/* Side Bar (Left) */}
      <aside className="w-64 border-r border-[var(--border-color)] flex flex-col flex-shrink-0 bg-[var(--bg-primary)]">
        <Link to="/dashboard" className="p-4 flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={logoSrc} alt="Logo" className="w-12 h-12 object-contain select-none" />
        </Link>
        
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <div className="space-y-0.5">
            <button 
              onClick={handleNewChat}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-[#c9d1d9] hover:bg-[#21262d] rounded-md transition-colors"
            >
              <PlusSquare className="w-4 h-4 text-[#8b949e]" />
              New chat
            </button>
            <button className="flex items-center gap-3 w-full px-3 py-2 text-sm text-[#c9d1d9] bg-[#21262d] hover:bg-[#30363d] rounded-md transition-colors">
              <Cpu className="w-4 h-4 text-white" />
              <span className="text-white font-medium">Agents</span>
            </button>

          </div>


        </div>

        <div className="p-4 border-t border-[#30363d]">
          <Link to="/dashboard" className="flex items-center gap-2 hover:bg-[#21262d] p-2 rounded-lg transition-colors">
            <div className="w-6 h-6 rounded-md overflow-hidden bg-[#21262d] border border-[#30363d]">
              <img src={`https://ui-avatars.com/api/?name=${user.username || 'User'}&background=random`} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-medium text-white truncate">{user.username || 'Pallavi-Chiluveru'}</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative bg-[var(--bg-primary)]">
        {chatHistory.length === 0 ? (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="w-full max-w-3xl px-6 flex flex-col items-center">
              {/* Bot Logo placeholder matching Copilot/Agent UI */}
              <div className="mb-8 opacity-80 shrink-0">
                <div className="w-16 h-16 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center shadow-lg overflow-hidden">
                  <img src={logoSrc} alt="Logo" className="w-full h-full object-contain select-none" />
                </div>
              </div>

              {/* Input Box */}
              <div className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl shadow-lg flex flex-col focus-within:ring-1 focus-within:ring-[#1f6feb] transition-all">
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
                  className="w-full bg-transparent border-none outline-none text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] p-4 resize-none h-24 text-base custom-scrollbar"
                />
                
                <div className="flex items-center justify-between p-2 border-t border-[var(--border-color)]">
                  <div className="flex items-center gap-2">
                    <AskDropdown isCompact={false} />
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#c9d1d9] hover:bg-[#21262d] rounded-md transition-colors">
                      <Box className="w-3.5 h-3.5 text-[#8b949e]" />
                      All repositories
                      <ChevronDown className="w-3 h-3 text-[#8b949e]" />
                    </button>
                    <button className="p-1.5 text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d] rounded-md transition-colors border border-[var(--border-color)]">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3 pr-2">
                    <button className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d] rounded-md transition-colors">
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={handleChatSubmit}
                      disabled={isChatLoading || !chatInput.trim()}
                      className="text-[#8b949e] hover:text-white disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                {[
                  { icon: Cpu, label: 'Agent', active: false },
                  { icon: PlusSquare, label: 'Create issue' },
                  { icon: Code2, label: 'Write code', dropdown: true },
                  { icon: GitBranch, label: 'Git', dropdown: true },
                  { icon: GitPullRequest, label: 'Pull requests', dropdown: true },
                ].map((btn, i) => (
                  <div key={i} className="relative">
                    <button 
                      onClick={() => {
                        if (btn.label === 'Create issue') {
                          window.location.href = '/new-issue';
                        } else if (btn.label === 'Write code') {
                          setShowWriteCodeDropdown(!showWriteCodeDropdown);
                          setShowGitDropdown(false);
                          setShowPRDropdown(false);
                        } else if (btn.label === 'Git') {
                          setShowGitDropdown(!showGitDropdown);
                          setShowWriteCodeDropdown(false);
                          setShowPRDropdown(false);
                        } else if (btn.label === 'Pull requests') {
                          setShowPRDropdown(!showPRDropdown);
                          setShowWriteCodeDropdown(false);
                          setShowGitDropdown(false);
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
                    >
                      <btn.icon className="w-3.5 h-3.5 text-[#8b949e]" />
                      {btn.label}
                      {btn.dropdown && <ChevronDown className="w-3 h-3 text-[#8b949e]" />}
                    </button>

                    {btn.label === 'Write code' && showWriteCodeDropdown && (
                      <div className="git-dropdown-container absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 dark:bg-[#161b22] dark:border-[var(--border-color)] rounded-md shadow-lg z-50 py-1">
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
                            className="git-dropdown-item px-4 py-2 text-sm text-black hover:text-black hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#1f6feb] dark:hover:text-white cursor-pointer transition-colors text-left"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    )}

                    {btn.label === 'Git' && showGitDropdown && (
                      <div className="git-dropdown-container absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 dark:bg-[#161b22] dark:border-[var(--border-color)] rounded-md shadow-lg z-50 py-1">
                        {[
                          'Basic Git commands',
                          'Git branching',
                          'Advanced Git commands'
                        ].map((item, idx) => (
                          <div 
                            key={idx}
                            onClick={() => {
                              setActiveGitSection(item);
                              setShowGitDropdown(false);
                              if (item === 'Basic Git commands') {
                                 setChatInput("Explain basic Git commands and their usage. Include commands like `git init`, `git clone`, `git status`, `git add`, `git commit`, `git push`, and `git pull`. Provide examples for each command.");
                              } else if (item === 'Git branching') {
                                 setChatInput("Explain Git branching and its usage. Include concepts like what is a branch, why they are used, and commands like `git branch`, `git checkout`, `git switch`, and `git merge`. Provide examples for each command.");
                              } else if (item === 'Advanced Git commands') {
                                 setChatInput("Explain advanced Git commands and their usage. Include commands like `git stash`, `git cherry-pick`, `git revert`, and `git reset`. Provide examples for each command.");
                              }
                            }}
                            className="git-dropdown-item px-4 py-2 text-sm text-black hover:text-black hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#1f6feb] dark:hover:text-white cursor-pointer transition-colors text-left"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    )}

                    {btn.label === 'Pull requests' && showPRDropdown && (
                      <div className="git-dropdown-container absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 dark:bg-[#161b22] dark:border-[var(--border-color)] rounded-md shadow-lg z-50 py-1">
                        {[
                          'My open pull requests',
                          'Summarize my latest PR'
                        ].map((item, idx) => (
                          <div 
                            key={idx}
                            onClick={() => {
                              setShowPRDropdown(false);
                              if (item === 'My open pull requests') {
                                 setChatInput("List my latest open pull requests.");
                              } else if (item === 'Summarize my latest PR') {
                                 setChatInput("Search for my latest merged PR and summarize it. Explain the purpose of the PR, important changes made, and overall impact.");
                              }
                            }}
                            className="git-dropdown-item px-4 py-2 text-sm text-black hover:text-black hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#1f6feb] dark:hover:text-white cursor-pointer transition-colors text-left"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Git Learning Section */}
              <AnimatePresence>
                {activeGitSection && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 bg-[#0d1117] border border-[var(--border-color)] rounded-xl p-6 overflow-hidden shadow-sm text-left w-full"
                  >
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border-color)]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#238636]/10 flex items-center justify-center border border-[#238636]/20">
                          <GitBranch className="w-4 h-4 text-[#2ea043]" />
                        </div>
                        <h2 className="text-lg font-bold text-white">{activeGitSection}</h2>
                      </div>
                      <button 
                        onClick={() => setActiveGitSection(null)} 
                        className="p-1.5 rounded-md hover:bg-[#21262d] text-[#8b949e] hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {activeGitSection === 'Basic Git commands' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { cmd: 'git init', desc: 'Initialize a new empty local Git repository.' },
                          { cmd: 'git clone', desc: 'Clone an existing repository from a remote source like GitHub.', code: 'git clone <url>' },
                          { cmd: 'git status', desc: 'Shows changed and untracked files in the project.', code: 'git status' },
                          { cmd: 'git add .', desc: 'Stages all changed files, ready to be committed.', code: 'git add .' },
                          { cmd: 'git commit -m', desc: 'Saves your staged changes into the local repository.', code: 'git commit -m "Update"' },
                          { cmd: 'git push', desc: 'Uploads local commits to the remote repository.', code: 'git push origin main' },
                          { cmd: 'git pull', desc: 'Fetches and merges changes from the remote repository.', code: 'git pull origin main' }
                        ].map((c, i) => (
                          <div key={i} className="bg-[#161b22] border border-[var(--border-color)] rounded-lg p-4 hover:border-[#8b949e] transition-colors flex flex-col gap-3 shadow-sm">
                            <div className="font-mono text-xs font-semibold text-[#2f81f7] bg-[#2f81f7]/10 px-2 py-1 rounded w-fit">{c.cmd}</div>
                            <p className="text-xs text-[#8b949e] leading-relaxed flex-1">{c.desc}</p>
                            {c.code && (
                              <div className="bg-[#010409] border border-[var(--border-color)] rounded p-2.5 mt-auto">
                                <code className="text-xs text-[#e3b341] font-mono">{c.code}</code>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {activeGitSection === 'Git branching' && (
                      <div className="space-y-6">
                        <div className="bg-[#161b22] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
                          <h3 className="text-sm font-bold text-white mb-2">What is a branch?</h3>
                          <p className="text-xs text-[#8b949e] leading-relaxed mb-5">
                            A branch is like a parallel universe of your project. It allows you to work on new features or bug fixes without affecting the main codebase.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-[#010409] border border-[var(--border-color)] rounded-lg p-4 hover:border-[#8b949e] transition-colors">
                              <div className="font-mono text-xs font-semibold text-[#2f81f7] mb-2 bg-[#2f81f7]/10 px-2 py-1 rounded w-fit">git branch</div>
                              <p className="text-xs text-[#8b949e] mb-3">Lists all local branches. Add a name to create a new one.</p>
                              <code className="text-xs text-[#e3b341] font-mono block bg-[#161b22] p-2.5 rounded border border-[var(--border-color)]">git branch feature-x</code>
                            </div>
                            <div className="bg-[#010409] border border-[var(--border-color)] rounded-lg p-4 hover:border-[#8b949e] transition-colors">
                              <div className="font-mono text-xs font-semibold text-[#2f81f7] mb-2 bg-[#2f81f7]/10 px-2 py-1 rounded w-fit">git checkout / switch</div>
                              <p className="text-xs text-[#8b949e] mb-3">Switches to the specified branch to work on it.</p>
                              <code className="text-xs text-[#e3b341] font-mono block bg-[#161b22] p-2.5 rounded border border-[var(--border-color)]">git switch feature-x</code>
                            </div>
                            <div className="bg-[#010409] border border-[var(--border-color)] rounded-lg p-4 md:col-span-2 hover:border-[#8b949e] transition-colors">
                              <div className="font-mono text-xs font-semibold text-[#2f81f7] mb-2 bg-[#2f81f7]/10 px-2 py-1 rounded w-fit">git merge</div>
                              <p className="text-xs text-[#8b949e] mb-3">Combines changes from another branch into your current branch.</p>
                              <code className="text-xs text-[#e3b341] font-mono block bg-[#161b22] p-2.5 rounded border border-[var(--border-color)]">git merge feature-x</code>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeGitSection === 'Advanced Git commands' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {[
                          { cmd: 'git stash', desc: 'Temporarily saves your uncommitted changes so you can work on something else.', code: 'git stash push -m "wip"', warn: 'Don\'t forget to git stash pop later!' },
                          { cmd: 'git cherry-pick', desc: 'Applies the changes introduced by some existing commits.', code: 'git cherry-pick <hash>', warn: 'Can cause conflicts if branches diverged heavily.' },
                          { cmd: 'git revert', desc: 'Creates a new commit that undoes the changes from a previous commit. Safe for public history.', code: 'git revert <hash>' },
                          { cmd: 'git reset', desc: 'Moves the branch pointer backwards. Can unstage or even delete uncommitted work.', code: 'git reset --hard HEAD~1', warn: 'WARNING: --hard will erase your uncommitted changes.' }
                        ].map((c, i) => (
                          <div key={i} className="bg-[#161b22] border border-[var(--border-color)] rounded-lg p-5 flex flex-col gap-3 shadow-sm hover:border-[#8b949e] transition-colors">
                            <div className="font-mono text-xs font-semibold text-[#d2a8ff] bg-[#d2a8ff]/10 px-2 py-1 rounded w-fit">{c.cmd}</div>
                            <p className="text-xs text-[#8b949e] leading-relaxed flex-1">{c.desc}</p>
                            <div className="bg-[#010409] border border-[var(--border-color)] rounded p-2.5">
                              <code className="text-xs text-[#e3b341] font-mono">{c.code}</code>
                            </div>
                            {c.warn && (
                              <p className="text-[11px] text-[#ffa657] bg-[#ffa657]/10 px-2.5 py-2 rounded mt-1 border border-[#ffa657]/20 flex items-start gap-1.5 leading-relaxed">
                                <span className="font-bold">TIP:</span> {c.warn}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-8">
                  <p className="text-[#8b949e] text-xs">Copilot uses AI. Check for mistakes.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col w-full h-full relative">
            <div className="flex-1 overflow-y-auto px-6 pt-8 pb-32 custom-scrollbar">
              <div className="max-w-4xl mx-auto space-y-6">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'bot' && (
                      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-[var(--border-color)] shadow-sm bg-[var(--bg-secondary)]">
                        <img src={logoSrc} alt="Agent" className="w-full h-full object-contain select-none" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-xl p-4 text-sm leading-relaxed ${
                      msg.role === 'user' ? 'bg-[#1f6feb] text-white shadow-sm' : 'bg-[#161b22] text-[#c9d1d9] border border-[var(--border-color)] shadow-sm'
                    }`}>
                      {msg.role === 'user' ? (
                        msg.text
                      ) : (
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({node, className, children, ...props}) {
                              const match = /language-(\w+)/.exec(className || '');
                              const isBlock = match || String(children).includes('\n');
                              return isBlock ? (
                                <div className="bg-[#010409] border border-[var(--border-color)] rounded-md p-3 my-3 overflow-x-auto">
                                  <code className={`text-[#e3b341] ${className || ''}`} {...props}>
                                    {children}
                                  </code>
                                </div>
                              ) : (
                                <code className="bg-[#21262d] px-1.5 py-0.5 rounded text-[#e3b341] text-[13px]" {...props}>
                                  {children}
                                </code>
                              )
                            },
                            p({children}) { return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p> },
                            ul({children}) { return <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul> },
                            ol({children}) { return <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol> },
                            h1({children}) { return <h1 className="text-lg font-bold mb-3 mt-5 text-white">{children}</h1> },
                            h2({children}) { return <h2 className="text-base font-bold mb-3 mt-4 text-white">{children}</h2> },
                            h3({children}) { return <h3 className="text-sm font-bold mb-2 mt-3 text-white">{children}</h3> },
                            a({children, href}) { return <a href={href} className="text-[#2f81f7] hover:underline" target="_blank" rel="noopener noreferrer">{children}</a> }
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-[#21262d] flex items-center justify-center shrink-0 border border-[var(--border-color)] overflow-hidden shadow-sm">
                        <img src={`https://ui-avatars.com/api/?name=${user.username || 'User'}&background=random`} alt="user" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex gap-4 justify-start">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-[var(--border-color)] shadow-sm bg-[var(--bg-secondary)]">
                      <img src={logoSrc} alt="Agent" className="w-full h-full object-contain select-none" />
                    </div>
                    <div className="bg-[#161b22] border border-[var(--border-color)] rounded-xl p-4 flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#8b949e] border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-[#8b949e]">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Input area fixed at bottom */}
            <div className="absolute bottom-0 left-0 right-0 pt-12 pb-6 px-6" style={{background: 'linear-gradient(to top, var(--bg-primary) 60%, transparent)'}}>
              <div className="max-w-4xl mx-auto w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl shadow-lg focus-within:ring-1 focus-within:ring-[#1f6feb] transition-all">
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
                  className="w-full bg-transparent border-none outline-none text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] p-4 resize-none h-14 max-h-32 text-sm custom-scrollbar"
                />
                
                <div className="flex items-center justify-between p-2 border-t border-[var(--border-color)]">
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d] rounded-md transition-colors">
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 pr-2">
                    <button 
                      onClick={handleChatSubmit}
                      disabled={isChatLoading || !chatInput.trim()}
                      className="p-1.5 bg-[#1f6feb] hover:bg-[#2f81f7] disabled:bg-[#21262d] text-white disabled:text-[#8b949e] rounded-md transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AgentPage;
