import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  FileText, 
  Users, 
  Activity, 
  Cpu, 
  Layout, 
  Plus, 
  Search, 
  MoreVertical, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Paperclip,
  Send,
  Zap,
  Globe,
  Lock,
  ChevronRight,
  Shield,
  Trash2,
  Edit2,
  Share2,
  Settings,
  Terminal,
  Copy
} from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Layout },
  { id: 'files', label: 'Files', icon: FileText },
  { id: 'commands', label: 'Commands', icon: Terminal },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'ai', label: 'AI Assistant', icon: Cpu },
  { id: 'activity', label: 'Activity', icon: Activity }
];

const MOCK_DATA = {
  '1': {
    title: 'AI Research Space',
    description: 'Central workspace for LLM experimentation and research papers.',
    visibility: 'Private',
    members: [
      { id: 'u1', name: 'Pallavi Chiluveru', role: 'Owner', avatar: 'https://ui-avatars.com/api/?name=Pallavi&background=6366F1&color=fff' },
      { id: 'u2', name: 'Dev Assistant', role: 'Admin', avatar: 'https://ui-avatars.com/api/?name=Dev&background=8B5CF6&color=fff' }
    ],
    files: [
      { name: 'research_plan.pdf', size: '2.4 MB', date: '2 days ago', type: 'PDF' },
      { name: 'model_config.json', size: '12 KB', date: '5 hours ago', type: 'JSON' },
      { name: 'training_data.csv', size: '150 MB', date: 'Yesterday', type: 'CSV' }
    ],
    tasks: [
      { id: 't1', title: 'Gather base model weights', status: 'completed' },
      { id: 't2', title: 'Prepare fine-tuning dataset', status: 'pending' },
      { id: 't3', title: 'Initialize validation metrics', status: 'pending' }
    ],
    activity: [
      { user: 'Pallavi Chiluveru', action: 'uploaded', target: 'training_data.csv', time: 'Yesterday' },
      { user: 'Dev Assistant', action: 'updated', target: 'research_plan.pdf', time: '2 days ago' }
    ]
  }
};

const TabButton = ({ tab, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`relative flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all ${
      active ? 'text-white' : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
    }`}
  >
    <tab.icon className={`w-4 h-4 ${active ? 'text-[#6366F1]' : ''}`} />
    {tab.label}
    {active && (
      <motion.div 
        layoutId="details-tab-underline"
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6366F1]"
      />
    )}
  </button>
);

const SpaceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [chatInput, setChatInput] = useState('');
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchSpaceDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://127.0.0.1:5000/space-api/${id}`);
        setSpace(res.data.payload);
      } catch (err) {
        console.error('Error fetching space details:', err);
        setError('Failed to load space details. It might have been deleted.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchSpaceDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing Space...</p>
        </div>
      </div>
    );
  }

  if (error || !space) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-6">
        <div className="bg-[#111827] border border-white/5 p-12 rounded-[3rem] text-center max-w-md">
          <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 mx-auto border border-red-500/20">
            <Trash2 className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-4">Space Not Found</h2>
          <p className="text-slate-400 mb-8">{error || 'The workspace you are looking for does not exist or has been archived.'}</p>
          <button onClick={() => navigate('/spaces')} className="px-8 py-3 bg-white text-black font-black rounded-xl hover:bg-slate-200 transition-all">
            Return to Spaces
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F3F4F6] font-sans flex flex-col">
      {/* Top Header */}
      <header className="border-b border-white/5 bg-[#111827]/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/spaces')}
              className="p-2 hover:bg-white/5 rounded-xl text-[#9CA3AF] hover:text-white transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-8 w-[1px] bg-white/5" />
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-xl flex items-center justify-center shadow-lg shadow-[#6366F1]/20">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-3">
                  {space.title}
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/5 text-[#9CA3AF] border border-white/5">
                    {space.visibility}
                  </span>
                </h1>
                <p className="text-xs text-[#9CA3AF] mt-0.5">Workspace for high-performance collaboration</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold border border-white/5 transition-all">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button className="p-2 hover:bg-white/5 rounded-xl text-[#9CA3AF] transition-all">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-[1400px] mx-auto px-6 flex items-center overflow-x-auto scrollbar-hide">
          {TABS.map(tab => (
            <TabButton 
              key={tab.id} 
              tab={tab} 
              active={activeTab === tab.id} 
              onClick={() => setActiveTab(tab.id)} 
            />
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-8 overflow-hidden flex gap-8">
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-20">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                {/* Space Intro */}
                <section className="bg-gradient-to-br from-[#111827] to-[#0B1120] border border-white/5 rounded-3xl p-8 relative overflow-hidden">
                  <div className="relative z-10">
                    <h2 className="text-2xl font-black text-white">About this space</h2>
                    <p className="text-[#9CA3AF] mt-4 leading-relaxed max-w-2xl">{space.description}</p>
                    <div className="mt-8 flex gap-4">
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex-1">
                        <p className="text-[10px] font-bold text-[#6366F1] uppercase tracking-wider">Resources</p>
                        <p className="text-xl font-black text-white mt-1">12 Files</p>
                      </div>
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex-1">
                        <p className="text-[10px] font-bold text-[#8B5CF6] uppercase tracking-wider">Members</p>
                        <p className="text-xl font-black text-white mt-1">4 Active</p>
                      </div>
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex-1">
                        <p className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Status</p>
                        <p className="text-xl font-black text-white mt-1">Operational</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#6366F1] opacity-[0.03] blur-[80px] -translate-y-1/2 translate-x-1/2 rounded-full" />
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Tasks Card */}
                  <div className="bg-[#111827] border border-white/5 rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#6366F1]" /> Tasks
                      </h3>
                      <button className="text-[10px] font-bold text-[#6366F1] hover:underline">View All</button>
                    </div>
                    <div className="space-y-3">
                      {space.tasks.map(task => (
                        <div key={task.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#6366F1]/30 transition-all cursor-pointer">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            task.status === 'completed' ? 'bg-[#6366F1] border-[#6366F1]' : 'border-white/10'
                          }`}>
                            {task.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          <span className={`text-sm ${task.status === 'completed' ? 'text-[#9CA3AF] line-through' : 'text-white'}`}>
                            {task.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Files Card */}
                  <div className="bg-[#111827] border border-white/5 rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#8B5CF6]" /> Recent Files
                      </h3>
                      <button className="text-[10px] font-bold text-[#8B5CF6] hover:underline">Manage</button>
                    </div>
                    <div className="space-y-3">
                      {space.files.map(file => (
                        <div key={file.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-[#8B5CF6]/30 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-[#0B1120] flex items-center justify-center text-[10px] font-black text-[#8B5CF6] border border-white/5">
                              {file.type}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white group-hover:text-[#8B5CF6] transition-colors">{file.name}</p>
                              <p className="text-[10px] text-[#9CA3AF]">{file.size} • {file.date}</p>
                            </div>
                          </div>
                          <button className="p-2 text-[#9CA3AF] hover:text-white transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'commands' && (
              <motion.div 
                key="commands"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-black text-white">Workspace Commands</h2>
                  <p className="text-[#9CA3AF] text-sm">Commonly used commands for this specific space environment.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { cmd: 'npm run dev', desc: 'Launch local dev server' },
                    { cmd: 'npm test', desc: 'Run unit and integration tests' },
                    { cmd: 'npm run build', desc: 'Compile production assets' },
                    { cmd: 'git pull origin main', desc: 'Sync with remote' }
                  ].map((item, i) => (
                    <div key={i} className="group p-5 bg-[#111827] border border-white/5 rounded-3xl hover:border-indigo-500/30 transition-all flex items-center justify-between">
                      <div>
                        <code className="text-xs font-black text-indigo-400 font-mono tracking-tight">{item.cmd}</code>
                        <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
                      </div>
                      <button className="p-2 hover:bg-white/5 rounded-lg text-[#9CA3AF] opacity-0 group-hover:opacity-100 transition-all">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'ai' && (
              <motion.div 
                key="ai"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full flex flex-col"
              >
                <div className="flex-1 bg-[#111827] border border-white/5 rounded-3xl flex flex-col overflow-hidden">
                  <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#6366F1] flex items-center justify-center shadow-lg shadow-[#6366F1]/20">
                        <Cpu className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold">Space Assistant</h3>
                        <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Active Context</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#9CA3AF]">
                      <Shield className="w-3 h-3" /> Secure AI Instance
                    </div>
                  </div>

                  <div className="flex-1 p-8 space-y-6 overflow-y-auto custom-scrollbar">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#6366F1] flex items-center justify-center flex-shrink-0">
                        <Cpu className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 text-sm max-w-[80%] leading-relaxed border border-white/5">
                        Hello Pallavi! I've analyzed the files in this space. I see you have a research plan and a JSON configuration for the LLM. How can I help you move forward today?
                      </div>
                    </div>
                    
                    <div className="flex gap-4 flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-[#8B5CF6] flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-[#6366F1]/10 rounded-2xl rounded-tr-none p-4 text-sm max-w-[80%] leading-relaxed border border-[#6366F1]/20 text-white font-medium">
                        Can you summarize the key milestones from research_plan.pdf?
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-t border-white/5">
                    <div className="relative group">
                      <input 
                        type="text" 
                        placeholder="Ask anything about this space..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="w-full bg-[#0B1120] border border-white/10 rounded-2xl py-4 pl-6 pr-24 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 transition-all placeholder:text-[#9CA3AF]/40"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <button className="p-2 text-[#9CA3AF] hover:text-white transition-colors">
                          <Paperclip className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-[#6366F1] text-white rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-[#6366F1]/20">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sidebar - Stats & Members */}
        <aside className="w-80 hidden xl:flex flex-col gap-8">
          {/* Members Panel */}
          <div className="bg-[#111827] border border-white/5 rounded-3xl p-6">
            <h3 className="font-bold flex items-center gap-2 mb-6 text-sm">
              <Users className="w-4 h-4 text-[#6366F1]" /> Members
            </h3>
            <div className="space-y-4">
              {space.members.map(member => (
                <div key={member.id} className="flex items-center gap-3">
                  <img src={member.avatar} className="w-10 h-10 rounded-xl border border-white/5" alt={member.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{member.name}</p>
                    <p className="text-[10px] text-[#9CA3AF]">{member.role}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                </div>
              ))}
              <button className="w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-[#9CA3AF] hover:text-white hover:bg-white/10 transition-all">
                <Plus className="w-3 h-3" /> Invite Team
              </button>
            </div>
          </div>

          {/* Activity Panel */}
          <div className="bg-[#111827] border border-white/5 rounded-3xl p-6 flex-1 flex flex-col">
            <h3 className="font-bold flex items-center gap-2 mb-6 text-sm">
              <Activity className="w-4 h-4 text-green-400" /> Recent Activity
            </h3>
            <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
              {space.activity.map((act, i) => (
                <div key={i} className="relative pl-6 pb-6 border-l border-white/5 last:pb-0">
                  <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-[#6366F1]" />
                  <p className="text-[11px] leading-relaxed">
                    <span className="font-bold text-white">{act.user}</span> {act.action} <span className="font-bold text-[#6366F1]">{act.target}</span>
                  </p>
                  <p className="text-[9px] text-[#9CA3AF] mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {act.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* Floating Action Menu for mobile */}
      <button className="fixed bottom-8 right-8 xl:hidden w-14 h-14 bg-[#6366F1] text-white rounded-full shadow-2xl flex items-center justify-center z-50">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default SpaceDetailsPage;
