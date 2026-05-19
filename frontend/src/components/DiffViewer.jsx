import React, { useState } from 'react';
import { MessageSquare, Plus, Send } from 'lucide-react';

export default function DiffViewer({ fileName, diffText, comments = [], onAddComment }) {
  const [activeLine, setActiveLine] = useState(null);
  const [commentText, setCommentText] = useState("");

  const lines = diffText.split('\n');

  const handleCommentSubmit = (lineNumber) => {
    if (!commentText.trim()) return;
    onAddComment(fileName, lineNumber, commentText);
    setCommentText("");
    setActiveLine(null);
  };

  return (
    <div className="border border-[#30363d] rounded-xl overflow-hidden bg-[#0d1117] mb-8 shadow-2xl transition-all hover:border-[#444c56]">
      <div className="bg-[#161b22] px-4 py-3 border-b border-[#30363d] flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="h-2 w-2 rounded-full bg-[#f78166] shadow-[0_0_8px_#f78166]" />
           <span className="text-sm font-mono font-bold text-[#f0f6fc]">{fileName}</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-full font-mono text-[13px] leading-6">
          {lines.map((line, i) => {
            const lineNumber = i + 1;
            const isAdded = line.startsWith('+');
            const isRemoved = line.startsWith('-');
            const bgColor = isAdded ? 'bg-[#2ea0431a]' : isRemoved ? 'bg-[#f851491a]' : '';
            const textColor = isAdded ? 'text-[#3fb950]' : isRemoved ? 'text-[#f85149]' : 'text-[#c9d1d9]';
            const marker = isAdded ? '+' : isRemoved ? '-' : ' ';
            const lineComments = comments.filter(c => c.fileName === fileName && c.lineNumber === lineNumber);

            return (
              <React.Fragment key={i}>
                <div 
                  className={`group flex ${bgColor} hover:brightness-125 transition-all relative cursor-pointer`}
                  onClick={() => setActiveLine(activeLine === lineNumber ? null : lineNumber)}
                >
                  {/* Line Number Column */}
                  <div className="w-12 flex-shrink-0 text-right pr-3 text-[#8b949e] select-none border-r border-[#30363d]/50 bg-[#010409] opacity-50 group-hover:opacity-100 transition-opacity">
                    {lineNumber}
                  </div>
                  
                  {/* Plus Icon on Hover */}
                  <div className="absolute left-12 top-0 bottom-0 flex items-center px-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                     <div className="bg-[#2f81f7] rounded p-0.5 text-white shadow-lg">
                        <Plus size={10} />
                     </div>
                  </div>

                  {/* Marker Column */}
                  <div className={`w-6 flex-shrink-0 text-center select-none ${textColor} opacity-40 font-bold`}>
                    {marker}
                  </div>

                  {/* Code Column */}
                  <div className={`px-2 whitespace-pre flex-1 ${textColor}`}>
                    {isAdded || isRemoved ? line.substring(1) : line}
                  </div>
                </div>

                {/* Inline Comment Form */}
                {activeLine === lineNumber && (
                  <div className="p-4 bg-[#161b22] border-y border-[#30363d] animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-start gap-3">
                       <div className="h-8 w-8 rounded-full bg-[#30363d] flex-shrink-0" />
                       <div className="flex-1 space-y-3">
                          <textarea
                            autoFocus
                            placeholder="Write a review comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-sm text-[#f0f6fc] focus:border-[#2f81f7] focus:ring-1 focus:ring-[#2f81f7] outline-none min-h-[80px] resize-none"
                          />
                          <div className="flex justify-end gap-2">
                             <button 
                               onClick={() => setActiveLine(null)}
                               className="px-3 py-1.5 text-xs font-bold text-[#8b949e] hover:text-[#f0f6fc] transition-colors"
                             >
                               Cancel
                             </button>
                             <button 
                               onClick={() => handleCommentSubmit(lineNumber)}
                               className="bg-[#238636] hover:bg-[#2ea043] text-white px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all shadow-lg"
                             >
                               <Send size={12} /> Add comment
                             </button>
                          </div>
                       </div>
                    </div>
                  </div>
                )}

                {/* Existing Line Comments */}
                {lineComments.length > 0 && (
                  <div className="bg-[#161b22]/50 border-y border-[#30363d]/50 divide-y divide-[#30363d]/30">
                    {lineComments.map((c, idx) => (
                      <div key={idx} className="p-4 flex items-start gap-3 animate-in fade-in duration-300">
                         <img 
                           src={c.createdBy?.profileImageUrl || `https://ui-avatars.com/api/?name=${c.createdBy?.username}&background=random`} 
                           className="h-8 w-8 rounded-full border border-[#30363d]" 
                         />
                         <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                               <span className="text-sm font-bold text-[#f0f6fc]">{c.createdBy?.username}</span>
                               <span className="text-[10px] text-[#8b949e]">{new Date(c.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-[#c9d1d9] whitespace-pre-wrap">{c.comment}</p>
                         </div>
                         <button className="text-[#8b949e] hover:text-[#f0f6fc] opacity-0 group-hover:opacity-100 transition-opacity">
                            <MessageSquare size={14} />
                         </button>
                      </div>
                    ))}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
