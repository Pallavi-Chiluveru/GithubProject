import React, { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, File, Image as ImageIcon, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function UploadModal({ onClose, onUploadComplete }) {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles) => {
    const mappedFiles = newFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      progress: 0,
      status: 'pending' // pending, uploading, success, error
    }));
    setFiles(prev => [...prev, ...mappedFiles]);
  };

  const getFileIcon = (fileName) => {
    if (fileName.match(/\.(jpg|jpeg|png|gif|svg)$/i)) return <ImageIcon className="w-5 h-5 text-[#8b949e]" />;
    if (fileName.match(/\.(js|jsx|ts|tsx|html|css|json)$/i)) return <FileCode className="w-5 h-5 text-[#8b949e]" />;
    return <File className="w-5 h-5 text-[#8b949e]" />;
  };

  const simulateUpload = async () => {
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'success') continue;
      
      // Update status to uploading
      setFiles(prev => prev.map(f => f.id === files[i].id ? { ...f, status: 'uploading' } : f));
      
      // Simulate progress
      for (let p = 10; p <= 100; p += 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setFiles(prev => prev.map(f => f.id === files[i].id ? { ...f, progress: p } : f));
      }
      
      // Mark as success
      setFiles(prev => prev.map(f => f.id === files[i].id ? { ...f, status: 'success', progress: 100 } : f));
    }
    setUploading(false);
    
    if (onUploadComplete) {
      onUploadComplete(files.map(f => f.file));
    }
    
    // Wait briefly to show success state, then redirect and close
    setTimeout(() => {
      onClose();
      navigate('/dashboard');
    }, 600);
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-[#0d1117] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
            <h2 className="text-base font-semibold text-[#f0f6fc]">Upload from computer</h2>
            <button 
              onClick={onClose}
              className="text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
            <div 
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-colors cursor-pointer
                ${dragActive ? 'border-[#58a6ff] bg-[#58a6ff]/10' : 'border-[#30363d] hover:border-[#8b949e] bg-[#161b22]/50'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className={`w-12 h-12 mb-4 ${dragActive ? 'text-[#58a6ff]' : 'text-[#8b949e]'}`} />
              <p className="text-[#c9d1d9] font-medium mb-1">Drag and drop your files here</p>
              <p className="text-[#8b949e] text-sm mb-4">or click to browse your computer</p>
              <button className="px-4 py-2 bg-[#21262d] border border-[#30363d] text-[#c9d1d9] rounded-md text-sm font-medium hover:bg-[#30363d] transition-colors">
                Select Files
              </button>
              <input 
                ref={fileInputRef}
                type="file" 
                multiple 
                onChange={handleChange} 
                className="hidden" 
              />
            </div>

            {files.length > 0 && (
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-medium text-[#c9d1d9]">Selected Files ({files.length})</h3>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                  {files.map(fileObj => (
                    <div key={fileObj.id} className="flex items-center gap-3 p-3 bg-[#161b22] border border-[#30363d] rounded-lg group">
                      {getFileIcon(fileObj.file.name)}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-[#c9d1d9] font-medium truncate">{fileObj.file.name}</span>
                          {fileObj.status === 'success' && <CheckCircle2 className="w-4 h-4 text-[#2ea043]" />}
                          {fileObj.status === 'error' && <AlertCircle className="w-4 h-4 text-[#f85149]" />}
                          {fileObj.status === 'pending' && (
                            <button 
                              onClick={() => removeFile(fileObj.id)}
                              className="text-[#8b949e] hover:text-[#f85149] opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {(fileObj.status === 'uploading' || fileObj.status === 'success') && (
                          <div className="w-full bg-[#30363d] rounded-full h-1.5 overflow-hidden">
                            <motion.div 
                              className={`h-full ${fileObj.status === 'success' ? 'bg-[#2ea043]' : 'bg-[#58a6ff]'}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${fileObj.progress}%` }}
                              transition={{ duration: 0.2 }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-[#30363d] bg-[#161b22] flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#c9d1d9] bg-transparent hover:bg-[#21262d] rounded-md transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={simulateUpload}
              disabled={files.length === 0 || uploading}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                files.length === 0 || uploading 
                ? 'bg-[#238636]/50 text-[#ffffff]/50 cursor-not-allowed' 
                : 'bg-[#238636] hover:bg-[#2ea043] text-white'
              }`}
            >
              {uploading ? 'Uploading...' : 'Upload Files'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
