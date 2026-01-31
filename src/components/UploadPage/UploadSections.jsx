import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
  useMemo,
} from "react";
import { analyzeResume } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

/* ---------- Helpers ---------- */
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const isAllowedFile = (file) => file && ALLOWED_TYPES.has(file.type);
const filesizeMB = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

/* ---------- Components ---------- */
const UploadCard = memo(function UploadCard({
  selectedFile,
  isUploading,
  uploadProgress,
  error,
  onChooseFile,
  onRemoveFile,
  onStartUpload,
  onCancelUpload,
  onDragHandlers,
}) {
  const { handleDragOver, handleDragLeave, handleDrop, isDragging } = onDragHandlers;

  return (
    <div className="w-full max-w-xl mx-auto backdrop-blur-3xl bg-[#0f172a]/40 border border-white/10 rounded-[2rem] p-1 shadow-2xl relative overflow-hidden group">
      {/* Outer Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 p-8 text-center pb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Instant Analysis</h2>
        <p className="text-cyan-200/60 text-sm">Upload PDF, DOC, or DOCX</p>
      </div>

      {/* Inner Dark Card */}
      <div className="bg-[#0B1120] rounded-[1.5rem] p-6 mx-2 mb-2 border border-white/5 relative shadow-inner">

        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
            Upload your resume — get <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">actionable AI insights</span>
          </h3>
          <p className="text-slate-400 text-sm">Secure, fast, and optimized for ATS. We never share data.</p>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-3 mb-4 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-sm font-semibold text-white">Quick Analysis</div>
              <div className="text-xs text-slate-500">Upload now</div>
            </div>
          </div>

          <div className="flex gap-2">
            <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors">
              Choose File
              <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={onChooseFile} />
            </label>
            <button
              onClick={onStartUpload}
              disabled={!selectedFile || isUploading}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedFile && !isUploading ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_20px_rgba(6,182,212,0.6)]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
            >
              Analyze
            </button>
          </div>
        </div>

        {/* Drag Drop Area */}
        <div
          className={`relative rounded-xl border-2 border-dashed transition-all duration-200 h-32 flex flex-col items-center justify-center text-center
            ${isDragging ? 'border-cyan-500 bg-cyan-500/5' : 'border-slate-700/50 hover:border-slate-600 bg-slate-900/50'}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-cyan-400 animate-spin mb-3"></div>
              <span className="text-cyan-400 font-bold text-sm">Analyzing... {Math.round(uploadProgress)}%</span>
            </div>
          ) : selectedFile ? (
            <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-lg border border-white/5">
              <div className="w-8 h-8 bg-blue-500/20 rounded text-blue-400 flex items-center justify-center font-bold text-xs">DOC</div>
              <div className="text-left">
                <div className="text-white text-sm font-medium">{selectedFile.name}</div>
                <div className="text-slate-500 text-xs">{filesizeMB(selectedFile.size)}</div>
              </div>
              <button onClick={onRemoveFile} className="ml-2 text-slate-500 hover:text-red-400">×</button>
            </div>
          ) : (
            <>
              <div className="text-slate-500 mb-2">Drag & drop your file here...</div>
              <div className="text-xs text-slate-600">PDF, DOC and DOCX accepted.</div>
            </>
          )}

          {error && <div className="absolute bottom-2 text-red-400 text-xs font-medium">{error}</div>}
        </div>

        <div className="mt-4 text-[10px] text-slate-600 text-center">
          Tip: Remove personal details like DOB for best results. Powered by ResumeAI.
        </div>
      </div>

      {/* Footer Icons */}
      <div className="flex justify-center gap-6 pb-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="text-amber-400">🔒</span> Private
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="text-cyan-400">⚡</span> Fast
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="text-blue-400">🛡️</span> Secure
        </div>
      </div>

    </div>
  );
});

/* ---------- Container Component ---------- */
const UploadSections = () => {
  const navigate = useNavigate();
  // State
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  // Refs
  const rafRef = useRef(null);
  const progressStartRef = useRef(null);
  const abortRef = useRef(null);

  /* Animation Logic (Same as before) */
  const startSmoothProgress = useCallback(() => {
    progressStartRef.current = performance.now();
    const start = uploadProgress || 0;
    const duration = 2000;
    const tick = (now) => {
      const elapsed = now - progressStartRef.current;
      const t = Math.min(elapsed / duration, 1);
      const next = start + (90 - start) * (1 - Math.pow(1 - t, 3));
      setUploadProgress(next);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, [uploadProgress]);

  const handleHandleChoose = (e) => validateAndSelect(e.target.files?.[0]);
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false); validateAndSelect(e.dataTransfer.files?.[0]);
  };

  const validateAndSelect = (file) => {
    setError(null);
    if (!file) return;
    if (!isAllowedFile(file)) return setError("Invalid file type.");
    if (file.size > 10 * 1024 * 1024) return setError("File too large (Max 10MB).");
    setSelectedFile(file);
  };

  const onStartUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadProgress(0);
    startSmoothProgress();

    // Simulate/Real Upload
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await analyzeResume(selectedFile, { signal: controller.signal });
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        navigate("/analyze", { state: { analysisData: res } });
      }, 500);
    } catch (err) {
      setError(err.message || "Upload Failed");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <UploadCard
      selectedFile={selectedFile}
      isUploading={isUploading}
      uploadProgress={uploadProgress}
      error={error}
      onChooseFile={handleHandleChoose}
      onRemoveFile={() => setSelectedFile(null)}
      onStartUpload={onStartUpload}
      onCancelUpload={() => { }} // simplified
      onDragHandlers={{
        isDragging,
        handleDragOver: (e) => { e.preventDefault(); setIsDragging(true); },
        handleDragLeave: (e) => { e.preventDefault(); setIsDragging(false); },
        handleDrop
      }}
    />
  );
};

export default UploadSections;
