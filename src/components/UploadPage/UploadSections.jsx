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

/* ---------- Small Icon Components ---------- */
const FileIcon = ({ type }) => {
  if (!type) return <div className="w-10 h-10 rounded-md bg-accent/10" />;
  if (type.includes("pdf"))
    return (
      <div className="w-10 h-10 rounded-md bg-gradient-to-br from-[#FF6B6B] to-[#FFB86B] flex items-center justify-center text-white font-bold">
        PDF
      </div>
    );
  return (
    <div className="w-10 h-10 rounded-md bg-accent-2/10 flex items-center justify-center text-accent-2 font-semibold">
      DOC
    </div>
  );
};

/* ---------- Progress Ring (SVG) ---------- */
const ProgressRing = ({ size = 64, stroke = 6, progress = 0 }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <svg width={size} height={size} className="block">
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        <circle
          r={radius}
          fill="transparent"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        <circle
          r={radius}
          fill="transparent"
          stroke="url(#grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
        />
      </g>
      <defs>
        <linearGradient id="grad" x1="0" x2="1">
          <stop offset="0%" stopColor="#66FCF1" />
          <stop offset="100%" stopColor="#45A29E" />
        </linearGradient>
      </defs>
    </svg>
  );
};

/* ---------- Upload Card (memoized) ---------- */
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
  const { handleDragOver, handleDragLeave, handleDrop, isDragging } =
    onDragHandlers;

  return (
    <div
      className={`w-full max-w-2xl relative overflow-hidden rounded-2xl transition-shadow duration-300
        ${
          isDragging
            ? "ring-2 ring-offset-2 ring-accent/40 shadow-2xl"
            : "shadow-lg"
        }
        bg-gradient-to-br from-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.04)]`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="region"
      aria-label="Resume upload"
    >
      {/* Decorative header */}
      <div className="p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-accent-2/12 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3v12"
                stroke="#66FCF1"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 7h8"
                stroke="#66FCF1"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 15v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2"
                stroke="#66FCF1"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-accent">
              Quick Resume Analysis
            </h3>
            <p className="text-sm text-primary/80">
              Upload your resume to get instant AI insights
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label
            htmlFor="file-input"
            className="btn-ghost px-3 py-2 rounded-md cursor-pointer text-sm border border-[rgba(255,255,255,0.04)] hover:bg-accent-2/6"
          >
            Choose File
            <input
              id="file-input"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={onChooseFile}
              className="hidden"
            />
          </label>
          <button
            className="btn-accent px-4 py-2 rounded-md text-sm"
            onClick={onStartUpload}
            disabled={!selectedFile || isUploading}
          >
            Analyze
          </button>
        </div>
      </div>

      <div className="px-6 pb-6">
        {/* Main body */}
        <div
          className={`relative rounded-lg p-6 border-2 border-dashed transition-colors duration-200 ${
            isDragging
              ? "border-accent/60 bg-[rgba(102,252,241,0.03)]"
              : "border-[rgba(255,255,255,0.03) bg-[transparent]"
          }`}
          onDragOver={(e) => e.preventDefault()}
        >
          {!selectedFile && !isUploading && (
            <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-accent/6 flex items-center justify-center text-accent text-xl">
                  📄
                </div>
                <div>
                  <p className="text-sm text-primary/80">
                    Drag & drop your file here
                  </p>
                  <p className="text-xs text-primary/60 mt-1">
                    PDF, DOC, and DOCX accepted • Max 10MB
                  </p>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <button
                  className="btn-outline px-4 py-2 rounded-md text-sm"
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  Browse files
                </button>
              </div>
            </div>
          )}

          {selectedFile && !isUploading && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <FileIcon type={selectedFile.type} />
                <div>
                  <div className="text-sm font-medium text-accent">
                    {selectedFile.name}
                  </div>
                  <div className="text-xs text-primary/70">
                    {filesizeMB(selectedFile.size)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  className="btn-ghost px-3 py-2 rounded-md text-sm"
                  onClick={onRemoveFile}
                >
                  Change
                </button>
                <button
                  className="btn-accent px-4 py-2 rounded-md text-sm"
                  onClick={onStartUpload}
                >
                  Analyze
                </button>
              </div>
            </div>
          )}

          {isUploading && (
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 flex items-center justify-center">
                  <ProgressRing
                    size={72}
                    stroke={7}
                    progress={Math.round(uploadProgress)}
                  />
                  <div className="absolute text-sm font-semibold text-accent">
                    {Math.round(uploadProgress)}%
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-accent">
                    Analyzing resume
                  </div>
                  <div className="text-xs text-primary/70">
                    This may take a few seconds — results are private and
                    encrypted.
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  className="btn-ghost px-3 py-2 rounded-md text-sm"
                  onClick={onCancelUpload}
                >
                  Cancel
                </button>
                <div className="text-xs text-primary/60">
                  {Math.round(uploadProgress)}% complete
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-md bg-red-600/6 border border-red-600/20 text-red-500 text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {/* Footer quick tips */}
        <div className="mt-4 text-xs text-primary/60 flex items-center justify-between">
          <div>
            Tip: Remove personal details like DOB or photo for best ATS results.
          </div>
          <div className="hidden md:block">
            Powered by secure AI · GDPR friendly
          </div>
        </div>
      </div>
    </div>
  );
});
UploadCard.displayName = "UploadCard";

/* ---------- Main Component ---------- */
const UploadSections = () => {
  const navigate = useNavigate();

  // UI state
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  // refs for rAF and abort
  const rafRef = useRef(null);
  const progressStartRef = useRef(null);
  const abortRef = useRef(null);

  /* prefer-reduced-motion */
  const prefersReduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  /* ---------- Smooth progress using rAF ---------- */
  const startSmoothProgress = useCallback(() => {
    progressStartRef.current = performance.now();
    const start = uploadProgress || 0;
    const duration = 1800; // ms to ease to ~90
    const target = 90;

    const tick = (now) => {
      const elapsed = now - progressStartRef.current;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const next = start + (target - start) * eased;
      setUploadProgress(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setUploadProgress(target);
        rafRef.current = null;
      }
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, [uploadProgress]);

  const stopSmoothProgress = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  /* ---------- File handlers ---------- */
  const handleChooseFile = useCallback((e) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isAllowedFile(file)) {
      setError("Please upload a PDF, DOC, or DOCX file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Max 10MB.");
      return;
    }
    setSelectedFile(file);
  }, []);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setError(null);
  }, []);

  /* Drag handlers */
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!isAllowedFile(file)) {
      setError("Please upload a PDF, DOC, or DOCX file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Max 10MB.");
      return;
    }
    setSelectedFile(file);
  }, []);

  /* ---------- Upload logic ---------- */
  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    // Abort controller
    const controller = new AbortController();
    abortRef.current = controller;

    // Start smooth progress unless reduced-motion is on
    if (!prefersReduced) startSmoothProgress();
    else setUploadProgress(50);

    try {
      const res = await analyzeResume(selectedFile, {
        signal: controller.signal,
      });
      stopSmoothProgress();
      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        navigate("/analyze", { state: { analysisData: res } });
      }, 350);
    } catch (err) {
      stopSmoothProgress();
      if (err.name === "AbortError") setError("Upload cancelled.");
      else
        setError(err?.message || "Failed to upload resume. Please try again.");
      setIsUploading(false);
      setUploadProgress(0);
    } finally {
      abortRef.current = null;
    }
  }, [
    selectedFile,
    navigate,
    prefersReduced,
    startSmoothProgress,
    stopSmoothProgress,
  ]);

  const handleCancelUpload = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setIsUploading(false);
    stopSmoothProgress();
    setUploadProgress(0);
  }, [stopSmoothProgress]);

  /* cleanup */
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const dragHandlers = {
    handleDragOver,
    handleDragLeave,
    handleDrop,
    isDragging,
  };

  return (
    <section className="py-12 px-4 md:px-12 lg:px-0">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-accent">
            Upload your resume — get actionable AI insights
          </h2>
          <p className="text-primary/80 mt-2 max-w-2xl">
            Secure, fast, and optimized for ATS. We never share your data.
          </p>
        </motion.div>

        <UploadCard
          selectedFile={selectedFile}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          error={error}
          onChooseFile={handleChooseFile}
          onRemoveFile={handleRemoveFile}
          onStartUpload={handleUpload}
          onCancelUpload={handleCancelUpload}
          onDragHandlers={dragHandlers}
        />
      </div>
    </section>
  );
};

export default UploadSections;
