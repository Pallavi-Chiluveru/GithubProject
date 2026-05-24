import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Sparkles, 
  PlusSquare, 
  Code, 
  HelpCircle,
  FileText,
  AlertCircle
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import API from "../api";
import { useTheme } from "../theme/ThemeContext";
import darkLogo from "../assets/antigravity_logo_dark.png";
import lightLogo from "../assets/image.png";

export default function AgentsTab({ repoId, repo }) {
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  let theme = "light";
  try {
    const themeContext = useTheme();
    theme = themeContext?.theme || "light";
  } catch (e) {
    // Fallback if rendered outside of ThemeProvider context
  }
  const logoSrc = theme === "dark" ? darkLogo : lightLogo;

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleChatSubmit = async (promptText = null) => {
    const prompt = promptText || chatInput;
    if (!prompt.trim()) return;

    setChatInput("");
    setChatHistory(prev => [...prev, { role: "user", text: prompt }]);
    setIsChatLoading(true);

    // Enhance the prompt with repository-specific context if it's the first message or if requested
    const enhancedPrompt = `[Context: You are an expert developer assistant auditing the repository named "${repo?.name}" owned by "${repo?.owner?.username}".] ${prompt}`;

    try {
      const res = await API.post("/chat-api/prompt", { prompt: enhancedPrompt });
      setChatHistory(prev => [...prev, { role: "bot", text: res.data.response }]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { role: "bot", text: "Error fetching response from AI. Please ensure the Grok API configuration is active." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isChatLoading]);

  const quickActions = [
    { label: "Explain repository architecture", prompt: "Explain the code architecture of this repository, its design principles, and how developers should get started." },
    { label: "Draft a beautiful README.md", prompt: "Help me write a professional, premium-designed README.md for this repository featuring installation guides, screenshots placeholders, and build scripts." },
    { label: "Analyze dependencies stack", prompt: "Review my typical node.js or backend dependencies stack for security best practices and suggest improvements." },
    { label: "Generate unit test template", prompt: "Write a high-quality unit and integration testing suite template in Jest or Vitest for testing repository endpoints." }
  ];

  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden flex flex-col min-h-[550px]">
      {/* Agent Page Header */}
      <div className="px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 overflow-hidden rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center shadow-sm shrink-0">
            <img src={logoSrc} alt="Logo" className="w-full h-full object-contain select-none" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">RepoSphere AI Agent</h3>
            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Your repository-aware assistant. Code generation, design, and architecture audits.</p>
          </div>
        </div>
        <button
          onClick={() => setChatHistory([])}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
        >
          <PlusSquare className="h-3.5 w-3.5" /> Clear History
        </button>
      </div>

      {/* Chat scroll workspace */}
      <div className="flex-1 p-6 overflow-y-auto max-h-[420px] min-h-[300px] space-y-6">
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-10 text-center space-y-6">
            <Sparkles className="h-8 w-8 text-[#2f81f7] animate-pulse" />
            <div className="space-y-1 max-w-md">
              <h4 className="text-sm font-bold text-[var(--text-primary)]">Ask your Repository Agent</h4>
              <p className="text-xs text-[var(--text-secondary)]">
                Ask coding questions, generate complex setup steps, design layouts, or use one of the quick suggestions below.
              </p>
            </div>

            {/* Quick Actions Suggestions list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChatSubmit(action.prompt)}
                  className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-3 text-left hover:border-[#2f81f7]/50 hover:bg-[#2f81f7]/5 transition-all text-xs flex items-center justify-between group"
                >
                  <span className="text-[var(--text-primary)] font-bold">{action.label}</span>
                  <Code className="h-3.5 w-3.5 text-[var(--text-secondary)] group-hover:text-[#2f81f7] shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "bot" && (
                  <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-[var(--border-color)] shadow-sm bg-[var(--bg-secondary)]">
                    <img src={logoSrc} alt="Agent" className="w-full h-full object-contain select-none" />
                  </div>
                )}

                <div className={`max-w-[80%] rounded-xl p-4 text-xs leading-relaxed ${
                  msg.role === "user" ? "bg-[#1f6feb] text-white shadow-sm font-semibold" : "bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm"
                }`}>
                  {msg.role === "user" ? (
                    msg.text
                  ) : (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({node, className, children, ...props}) {
                          const match = /language-(\w+)/.exec(className || "");
                          const isBlock = match || String(children).includes("\n");
                          return isBlock ? (
                            <div className="bg-[#010409] border border-[var(--border-color)] rounded-md p-3 my-3 overflow-x-auto">
                              <code className={`text-[#e3b341] ${className || ""}`} {...props}>
                                {children}
                              </code>
                            </div>
                          ) : (
                            <code className="bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded text-[#e3b341] text-[11px]" {...props}>
                              {children}
                            </code>
                          );
                        },
                        p({children}) { return <p className="mb-2.5 last:mb-0 leading-relaxed">{children}</p>; },
                        ul({children}) { return <ul className="list-disc pl-5 mb-2.5 space-y-1">{children}</ul>; },
                        ol({children}) { return <ol className="list-decimal pl-5 mb-2.5 space-y-1">{children}</ol>; },
                        h1({children}) { return <h1 className="text-sm font-bold mb-2.5 mt-4 text-white uppercase border-b border-[var(--border-color)] pb-1">{children}</h1>; },
                        h2({children}) { return <h2 className="text-xs font-bold mb-2 mt-3 text-white uppercase">{children}</h2>; },
                        a({children, href}) { return <a href={href} className="text-[#2f81f7] hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>; }
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-[#21262d] flex items-center justify-center shrink-0 border border-[var(--border-color)] overflow-hidden shadow-sm">
                    <img src={`https://ui-avatars.com/api/?name=${user.username || "U"}&background=random`} alt="user" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            ))}

            {isChatLoading && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-[var(--border-color)] shadow-sm bg-[var(--bg-secondary)]">
                  <img src={logoSrc} alt="Agent" className="w-full h-full object-contain select-none" />
                </div>
                <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#8b949e] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-[var(--text-secondary)] font-bold">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Input area footer */}
      <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-primary)]/10">
        <div className="flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-1.5 focus-within:ring-1 focus-within:ring-[#1f6feb] transition-all">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isChatLoading) handleChatSubmit();
            }}
            placeholder={`Ask our repository agent about ${repo?.name || "this codebase"}...`}
            className="flex-1 bg-transparent text-xs text-[var(--text-primary)] focus:outline-none px-3 py-2"
          />
          <button
            onClick={() => handleChatSubmit()}
            disabled={isChatLoading || !chatInput.trim()}
            className="rounded-lg bg-[#238636] p-2 text-white hover:bg-[#2ea043] transition-all disabled:opacity-30 disabled:hover:bg-[#238636]"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
