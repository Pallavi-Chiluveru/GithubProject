import { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { Eye, Check, X } from "lucide-react";

// Simple toast component (reuse from SettingsPage if needed)
function Toast({ msg, ok }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-xl transition-all ${ok ? "bg-[#238636] text-white" : "bg-[#da3633] text-white"}`}>
      {ok ? <Check size={16} /> : <X size={16} />} {msg}
    </div>
  );
}

export default function AccessibilitySettings() {
  const navigate = useNavigate();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState("medium");
  const [focusMode, setFocusMode] = useState(false);
  const [preview, setPreview] = useState({}); // placeholder for preview state
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  // Load existing settings
  useEffect(() => {
    API.get("/user-api/accessibility")
      .then(res => {
        const s = res.data || {};
        setReduceMotion(!!s.reduceMotion);
        setHighContrast(!!s.highContrast);
        setFontSize(s.fontSize || "medium");
        setFocusMode(!!s.focusMode);
        // Apply preview immediately
        applyPreview({
          reduceMotion: !!s.reduceMotion,
          highContrast: !!s.highContrast,
          fontSize: s.fontSize || "medium",
          focusMode: !!s.focusMode,
        });
      })
      .catch(() => {});
  }, []);

  const applyPreview = (prefs) => {
    // Reduce motion
    document.documentElement.style.transition = prefs.reduceMotion ? "none" : "all 0.2s ease";
    // High contrast – toggle a CSS class (you may define in global CSS)
    if (prefs.highContrast) document.body.classList.add("high-contrast");
    else document.body.classList.remove("high-contrast");
    // Font size – adjust root font size
    const sizeMap = { small: "14px", medium: "16px", large: "18px" };
    document.documentElement.style.fontSize = sizeMap[prefs.fontSize] || "16px";
    // Focus mode – add a class to dim other UI parts (simple example)
    if (prefs.focusMode) document.body.classList.add("focus-mode");
    else document.body.classList.remove("focus-mode");
    setPreview(prefs);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const payload = { reduceMotion, highContrast, fontSize, focusMode };
      await API.put("/user-api/accessibility", payload);
      applyPreview(payload);
      showToast("Accessibility settings saved!");
    } catch (e) {
      showToast(e.response?.data?.message || "Failed", false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans py-8 px-4 md:px-8 lg:px-12">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2"><Eye size={24} /> Accessibility</h1>
      <p className="mb-6 text-gray-400">Customize your experience to improve readability, visibility, and navigation.</p>

      {/* Reduce Motion */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Reduce Motion</h2>
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={reduceMotion} onChange={e => setReduceMotion(e.target.checked)} className="form-checkbox h-5 w-5 text-pink-600" />
          <span>Disable animations and transitions</span>
        </label>
      </div>

      {/* High Contrast */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">High Contrast Mode</h2>
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={highContrast} onChange={e => setHighContrast(e.target.checked)} className="form-checkbox h-5 w-5 text-pink-600" />
          <span>Increase UI contrast for better visibility</span>
        </label>
      </div>

      {/* Font Size */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Font Size</h2>
        <select value={fontSize} onChange={e => setFontSize(e.target.value)} className="rounded-md border border-gray-600 bg-[#161b22] text-[#c9d1d9] px-3 py-2">
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      {/* Focus Mode */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Focus Mode</h2>
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={focusMode} onChange={e => setFocusMode(e.target.checked)} className="form-checkbox h-5 w-5 text-pink-600" />
          <span>Dim surrounding UI to focus on main content</span>
        </label>
      </div>

      {/* Preview Panel */}
      <div className="mb-6 p-4 border border-gray-600 rounded-md bg-[#161b22]">
        <h3 className="text-md font-medium mb-2">Preview</h3>
        <div className={`p-4 rounded ${preview.highContrast ? "bg-black text-white" : "bg-[#0d1117] text-[#c9d1d9]"}`} style={{ fontSize: preview.fontSize === "small" ? "14px" : preview.fontSize === "large" ? "18px" : "16px", transition: preview.reduceMotion ? "none" : "all 0.2s" }}>
          Sample text demonstrating the current settings.
        </div>
      </div>

      <button onClick={saveSettings} disabled={saving} className="rounded-md bg-[#238636] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2ea043] disabled:opacity-50">
        Save Settings
      </button>

      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
    </div>
  );
}
