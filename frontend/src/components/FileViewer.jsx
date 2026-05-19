import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  File, Folder, Search, ChevronDown, GitBranch, 
  Copy, Download, Edit2, MoreHorizontal, FileText, 
  Maximize2, Share2, History, Code, FileJson, 
  Terminal, FileCode2, Image as ImageIcon
} from 'lucide-react';
import API from '../api';
import BranchSelector from './BranchSelector';

const getFileIcon = (fileName) => {
  if (!fileName) return <File className="h-4 w-4" />;
  const lowerName = fileName.toLowerCase();
  if (lowerName.endsWith('.js') || lowerName.endsWith('.jsx')) return <FileCode2 className="h-4 w-4 text-yellow-400" />;
  if (lowerName.endsWith('.ts') || lowerName.endsWith('.tsx')) return <FileCode2 className="h-4 w-4 text-blue-400" />;
  if (lowerName.endsWith('.css')) return <FileCode2 className="h-4 w-4 text-sky-400" />;
  if (lowerName.endsWith('.html')) return <FileCode2 className="h-4 w-4 text-orange-400" />;
  if (lowerName.endsWith('.json')) return <FileJson className="h-4 w-4 text-green-400" />;
  if (lowerName.endsWith('.md')) return <FileText className="h-4 w-4 text-blue-300" />;
  if (lowerName.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return <ImageIcon className="h-4 w-4 text-purple-400" />;
  return <File className="h-4 w-4 text-slate-400" />;
};

const getLanguage = (fileName) => {
  if (!fileName) return 'text';
  const ext = fileName.split('.').pop().toLowerCase();
  const map = {
    js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx',
    html: 'html', css: 'css', json: 'json', md: 'markdown',
    py: 'python', java: 'java', c: 'c', cpp: 'cpp',
    go: 'go', rs: 'rust', rb: 'ruby', php: 'php',
    sh: 'bash', yml: 'yaml', yaml: 'yaml', xml: 'xml', sql: 'sql'
  };
  return map[ext] || 'text';
};

export default function FileViewer({ repo, files, initialFile, onClose }) {
  const [selectedFile, setSelectedFile] = useState(initialFile);
  const [fileContent, setFileContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editBuffer, setEditBuffer] = useState("");
  const [saving, setSaving] = useState(false);
  const [viewTab, setViewTab] = useState('code');

  useEffect(() => {
    if (selectedFile) {
      fetchFileContent(selectedFile);
    }
  }, [selectedFile]);

  const fetchFileContent = async (file) => {
    // Basic check for text/image files
    const name = file.originalName || "";
    const mime = file.mimeType || "";
    const isText = name.match(/\.(js|jsx|json|css|html|md|txt|py|java|c|cpp|h|ts|tsx|sh|yml|yaml|xml|sql)$/i) || mime.startsWith("text/");
    const isImage = mime.startsWith("image/") || name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);

    if (isImage) {
      setFileContent(file.cloudUrl || `${API.defaults.baseURL || 'http://localhost:5000'}/file-api/download/${file._id}`);
      setLoading(false);
      return;
    }

    if (!isText) {
      setFileContent("Preview not available for this file format.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await API.get(`/file-api/content/${file._id}`);
      setFileContent(res.data.content || "");
    } catch (err) {
      console.error("Failed to fetch file content:", err);
      setFileContent("Error loading file content.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!selectedFile) return;
    try {
      const res = await API.get(`/file-api/download/${selectedFile._id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', selectedFile.originalName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("Download failed", err);
      alert("Failed to download file");
    }
  };

  const startEditing = () => {
    setEditBuffer(fileContent);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditBuffer("");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.put(`/file-api/content/${selectedFile._id}`, { content: editBuffer });
      setFileContent(editBuffer);
      setIsEditing(false);
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save file changes");
    } finally {
      setSaving(false);
    }
  };

  const filteredFiles = files.filter(f => 
    f.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isImageFile = selectedFile && (selectedFile.mimeType?.startsWith('image/') || selectedFile.originalName.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i));

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden shadow-2xl transition-colors">
      {/* LEFT SIDEBAR - FILE EXPLORER */}
      <div className="w-72 flex flex-col border-r border-[var(--border-color)] bg-[var(--bg-tertiary)]">
        <div className="p-4 border-b border-[var(--border-color)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Files</h3>
            <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-xs font-semibold px-2 py-1 bg-[var(--bg-primary)] rounded-md border border-[var(--border-color)]">
              Close
            </button>
          </div>
          
          <BranchSelector currentBranch={repo.defaultBranch || "main"} branches={repo.branches || ["main"]} />

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-secondary)]" />
            <input 
              type="text" 
              placeholder="Go to file" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] py-1.5 pl-9 pr-3 text-xs text-[var(--text-primary)] focus:border-[#2f81f7] focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          {filteredFiles.map(file => {
            const isSelected = selectedFile?._id === file._id;
            return (
              <div 
                key={file._id}
                onClick={() => setSelectedFile(file)}
                className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors ${
                  isSelected 
                    ? 'bg-[#2f81f7]/10 border-l-2 border-[#2f81f7]' 
                    : 'border-l-2 border-transparent hover:bg-[var(--bg-primary)]/50'
                }`}
              >
                {getFileIcon(file.originalName)}
                <span className={`text-xs font-medium truncate ${isSelected ? 'text-[#2f81f7] font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                  {file.originalName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT - CODE VIEWER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[var(--bg-primary)]">
        {selectedFile ? (
          <>
            {/* FILE HEADER TOP */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2 text-sm font-semibold truncate">
                <span className="text-[#2f81f7] cursor-pointer hover:underline">{repo.name}</span>
                <span className="text-[var(--text-secondary)]">/</span>
                <span className="text-[var(--text-primary)] flex items-center gap-2">
                  {getFileIcon(selectedFile.originalName)}
                  {selectedFile.originalName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                   <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* COMMIT INFO ROW */}
            <div className="px-6 py-3 flex items-center justify-between bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-xs">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-md overflow-hidden border border-[var(--border-color)]">
                  <img src={`https://ui-avatars.com/api/?name=${repo.owner?.username || "Guest"}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <span className="font-bold text-[var(--text-primary)] hover:text-[#2f81f7] cursor-pointer">{repo.owner?.username}</span>
                <span className="text-[var(--text-secondary)] hidden sm:inline">Latest commit file update</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-[#2f81f7]">a1b2c3d</span>
                <span className="text-[var(--text-secondary)]">last week</span>
                <button className="flex items-center gap-1.5 font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                   <History className="h-3.5 w-3.5" /> History
                </button>
              </div>
            </div>

            {/* CODE VIEWER ACTIONS / STATS */}
            <div className="px-6 py-2.5 flex items-center justify-between bg-[var(--bg-tertiary)] border-b border-[var(--border-color)] text-xs font-semibold">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-[var(--bg-primary)] rounded-md p-0.5 border border-[var(--border-color)]">
                  <button 
                    onClick={() => setViewTab('code')}
                    className={`px-3 py-1 rounded-sm transition-colors ${viewTab === 'code' ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                  >Code</button>
                  <button 
                    onClick={() => setViewTab('blame')}
                    className={`px-3 py-1 rounded-sm transition-colors ${viewTab === 'blame' ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                  >Blame</button>
                </div>
                <span className="text-[var(--text-secondary)] hidden sm:inline">
                  {fileContent.split('\n').length} lines | {fileContent.length} bytes
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-md border border-[var(--border-color)] overflow-hidden bg-[var(--bg-primary)]">
                   <button 
                    onClick={() => setViewTab(viewTab === 'raw' ? 'code' : 'raw')}
                    className={`px-3 py-1.5 transition-colors border-r border-[var(--border-color)] font-medium ${viewTab === 'raw' ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                  >Raw</button>
                  <button 
                    onClick={handleCopy}
                    className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors border-r border-[var(--border-color)]"
                    title="Copy content"
                  >
                    {copied ? <span className="text-green-500 font-bold px-1">Copied!</span> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <button onClick={handleDownload} className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors" title="Download">
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
                {!isEditing ? (
                  <button 
                    onClick={startEditing}
                    className="p-1.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={cancelEditing}
                      className="px-3 py-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors border border-[var(--border-color)] font-medium"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={saving}
                      className="px-3 py-1 rounded-md bg-[#238636] text-white hover:bg-[#2ea043] transition-colors font-medium disabled:opacity-50 border border-[#238636] shadow-sm"
                    >
                      {saving ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ACTUAL CODE RENDERER */}
            <div className="flex-1 overflow-auto bg-[var(--bg-primary)]">
              {loading ? (
                <div className="flex items-center justify-center h-full text-[var(--text-secondary)] animate-pulse font-medium">
                  Loading content...
                </div>
              ) : isImageFile ? (
                <div className="flex items-center justify-center h-full p-8 bg-pattern">
                  <img src={fileContent} alt={selectedFile.originalName} className="max-w-full max-h-full object-contain rounded-lg shadow-xl ring-1 ring-slate-800" />
                </div>
              ) : isEditing ? (
                <textarea
                  value={editBuffer}
                  onChange={(e) => setEditBuffer(e.target.value)}
                  className="w-full h-full min-h-[500px] bg-[var(--bg-primary)] p-6 text-[13px] text-[var(--text-primary)] focus:outline-none font-mono leading-relaxed resize-none"
                  spellCheck="false"
                />
              ) : viewTab === 'raw' ? (
                <div className="flex-1 h-full bg-[var(--bg-primary)] overflow-auto p-8 select-text">
                  <pre className="text-[13px] text-[var(--text-primary)] font-mono leading-relaxed whitespace-pre-wrap">
                    {fileContent || "/* Empty file */"}
                  </pre>
                </div>
              ) : viewTab === 'blame' ? (
                <div className="flex w-full min-h-full">
                  <div className="w-64 flex-shrink-0 border-r border-[var(--border-color)] bg-[var(--bg-tertiary)] flex flex-col py-[1.5rem] font-mono text-[11px] text-[var(--text-secondary)] select-none">
                    {(() => {
                      const lines = fileContent.split('\n');
                      const mockBlame = lines.map((line) => {
                        if (line.includes('<h1>') || line.toLowerCase().includes('chiluveru') || line.toLowerCase().includes('pallavi')) {
                          return { commit: 'f7e8d9c', time: 'now', author: repo.owner?.username || "Dev" };
                        }
                        return { commit: 'a1b2c3d', time: '3d', author: repo.owner?.username || "Dev" };
                      });

                      return mockBlame.map((blame, i) => {
                        const isNewBlock = i === 0 || blame.commit !== mockBlame[i - 1].commit;
                        return (
                          <div key={i} className={`h-[19.5px] px-3 flex items-center justify-between hover:bg-[var(--bg-primary)] group transition-colors ${isNewBlock && i !== 0 ? 'border-t border-[var(--border-color)] mt-[1px] -mb-[1px]' : ''}`}>
                              <div className="flex items-center gap-2 overflow-hidden truncate">
                                {isNewBlock ? (
                                  <>
                                    <img src={`https://ui-avatars.com/api/?name=${blame.author}&background=random`} alt="User" className="w-3 h-3 rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                                    <span className="truncate opacity-70 group-hover:opacity-100 group-hover:text-[var(--text-primary)] transition-all">{blame.author}</span>
                                  </>
                                ) : (
                                  <div className="w-3" />
                                )}
                              </div>
                              <div className={`flex gap-2 transition-opacity ${isNewBlock ? 'opacity-40 group-hover:opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                <span className="text-[var(--text-secondary)]">{blame.time}</span>
                                <span className="text-[#2f81f7] hover:underline cursor-pointer">{blame.commit}</span>
                              </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  <div className="flex-1 overflow-x-auto min-w-0 bg-[var(--bg-primary)]">
                    <SyntaxHighlighter
                      language={getLanguage(selectedFile.originalName)}
                      style={vscDarkPlus}
                      customStyle={{
                        margin: 0,
                        padding: '1.5rem',
                        background: 'transparent',
                        fontSize: '13px',
                        lineHeight: '1.5',
                        overflowX: 'visible'
                      }}
                      showLineNumbers={true}
                      wrapLines={false}
                      wrapLongLines={false}
                      lineNumberStyle={{
                        minWidth: '3.5em',
                        paddingRight: '1em',
                        color: '#6e7681',
                        textAlign: 'right',
                        borderRight: '1px solid var(--border-color)',
                        marginRight: '1em'
                      }}
                    >
                      {fileContent || "/* No content */"}
                    </SyntaxHighlighter>
                  </div>
                </div>
              ) : (
                <SyntaxHighlighter
                  language={getLanguage(selectedFile.originalName)}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: '1.5rem',
                    background: '#0d1117',
                    fontSize: '13px',
                    lineHeight: '1.5',
                  }}
                  showLineNumbers={true}
                  wrapLines={true}
                  lineNumberStyle={{
                    minWidth: '3.5em',
                    paddingRight: '1em',
                    color: '#6e7681',
                    textAlign: 'right',
                    borderRight: '1px solid #30363d',
                    marginRight: '1em'
                  }}
                >
                  {fileContent || "/* No content */"}
                </SyntaxHighlighter>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)]">
            <FileCode2 className="h-16 w-16 mb-4 opacity-20" />
            <p className="font-semibold text-lg">Select a file to view</p>
            <p className="text-sm mt-2">Browse the repository files on the left.</p>
          </div>
        )}
      </div>
    </div>
  );
}
