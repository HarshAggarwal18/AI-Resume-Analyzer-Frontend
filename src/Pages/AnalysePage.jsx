import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getAnalyzedData } from "../services/api";

/* ---------- Helpers ---------- */
const safeArray = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    return val
      .split(/\r?\n|,|•|[-–—]\s|·/g)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

const toPercent = (val) => {
  if (val == null || isNaN(val)) return 0;
  const num = Number(val);
  if (num <= 1) return Math.round(num * 100);
  return Math.round(Math.min(num, 100));
};

/* Small presentational helpers */
const Badge = ({ children, tone = "muted" }) => {
  const toneMap = {
    muted: "bg-[rgba(255,255,255,0.03)] text-[var(--text-muted)]",
    tag: "bg-[rgba(102,252,241,0.08)] text-[var(--accent)]",
    missing: "bg-[rgba(255,107,107,0.08)] text-[#ff6b6b]",
  };
  return (
    <span
      className={`px-2 py-1 text-xs rounded-xl inline-flex items-center gap-2 ${
        toneMap[tone] || toneMap.muted
      }`}
    >
      {children}
    </span>
  );
};

/* Progress circle (SVG) */
const CircleScore = ({ value = 0, size = 88 }) => {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circum = 2 * Math.PI * radius;
  const offset = circum - (Math.max(0, Math.min(100, value)) / 100) * circum;
  return (
    <svg
      width={size}
      height={size}
      role="img"
      aria-label={`Overall match ${Math.round(value)} percent`}
    >
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        <circle
          r={radius}
          fill="transparent"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={stroke}
        />
        <circle
          r={radius}
          fill="transparent"
          stroke="url(#g)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circum} ${circum}`}
          strokeDashoffset={offset}
          transform="rotate(-90)"
        />
      </g>
      <defs>
        <linearGradient id="g" x1="0" x2="1">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent-2)" />
        </linearGradient>
      </defs>
    </svg>
  );
};

/* ---------- Page component (improved) ---------- */
const AnalysePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState(
    location.state?.analysisData ?? null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!analysisData && location.state?.resumeId) {
      fetchAnalysisData(location.state.resumeId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAnalysisData = async (resumeId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAnalyzedData(resumeId);
      setAnalysisData(data ?? null);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to load analysis data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const items = useMemo(() => {
    if (!analysisData) return [];
    return Array.isArray(analysisData) ? analysisData : [analysisData];
  }, [analysisData]);

  /* --- Loading / Error / Empty states --- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#071019]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent border-[var(--accent)] rounded-full animate-spin mx-auto mb-6" />
          <p className="text-[var(--text-primary)] text-lg font-semibold">
            Loading analysis…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#071019] px-4">
        <div className="max-w-md w-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] rounded-xl p-6 text-center shadow-lg">
          <h3 className="text-[var(--accent)] font-bold text-xl mb-2">
            Unable to load analysis
          </h3>
          <p className="text-[var(--text-muted)] mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/")}
              className="btn-accent px-4 py-2 rounded-md"
            >
              Back to Upload
            </button>
            <button
              onClick={() => fetchAnalysisData(location.state?.resumeId)}
              className="btn-ghost px-4 py-2 rounded-md"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#071019] text-[var(--text-primary)] px-4">
        <h3 className="text-2xl font-semibold mb-3">No analysis data found</h3>
        <p className="text-[var(--text-muted)] mb-6 max-w-md text-center">
          There is no analysis to display right now. Upload a resume to generate
          insights.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/")}
            className="btn-accent px-4 py-2 rounded-md"
          >
            Upload Resume
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Main UI when data is present ---------- */
  return (
    <div className="min-h-screen bg-[#071019] text-[var(--text-primary)] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--accent)]">
                Resume Analysis
              </h1>
              <p className="text-[var(--text-muted)] mt-1">
                Insights derived from your uploaded resume.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="btn-ghost px-3 py-2 rounded-md"
              >
                Back
              </button>
              <button
                onClick={() => window.print?.()}
                className="btn-accent px-3 py-2 rounded-md"
              >
                Print / Save
              </button>
            </div>
          </div>
        </motion.div>

        {/* Layout: sticky summary on large screens + list of result cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Summary (left column on large screens) */}
          <aside className="lg:col-span-1">
            {/* Use the first item's top-level summary as the page summary */}
            {items[0] && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="sticky top-6 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] rounded-xl p-4 shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <CircleScore
                      value={toPercent(items[0]?.matchScore?.overall)}
                    />
                  </div>
                  <div>
                    <div className="text-sm text-[var(--text-muted)]">
                      Overall match
                    </div>
                    <div
                      className="text-2xl font-bold text-[var(--accent)]"
                      aria-live="polite"
                    >
                      {toPercent(items[0]?.matchScore?.overall)}%
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-2 max-w-[12rem]">
                      The score shows how well this resume aligns with the job
                      posting's requirements.
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-xs text-[var(--text-muted)] mb-2">
                    Quick actions
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => navigate("/")}
                      className="btn-ghost px-3 py-2 rounded-md text-left"
                    >
                      Upload new resume
                    </button>
                    <button
                      onClick={() =>
                        window.scrollTo({
                          top: document.body.scrollHeight,
                          behavior: "smooth",
                        })
                      }
                      className="btn-accent px-3 py-2 rounded-md text-left"
                    >
                      View full report
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </aside>

          {/* Results list (main area) */}
          <main className="lg:col-span-3 space-y-6">
            {items.map((job, idx) => {
              const overallPct = toPercent(job?.matchScore?.overall);
              const skillsMatchPct = toPercent(job?.matchScore?.skillsMatch);
              const matchingSkills =
                safeArray(job?.matchingSkills) ||
                safeArray(job?.matchedSkills) ||
                safeArray(job?.skills);
              const missingSkills = safeArray(job?.missingSkills);
              const growthAreas = safeArray(job?.growthAreas);
              const strengths = safeArray(job?.strengths || job?.whyFit);

              return (
                <motion.article
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.42 }}
                  className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.03)] rounded-xl p-5 hover:shadow-lg transition"
                  role="region"
                  aria-labelledby={`job-title-${idx}`}
                >
                  {/* card header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6 border-b border-[rgba(255,255,255,0.03)] pb-3 mb-4">
                    <div>
                      <h2
                        id={`job-title-${idx}`}
                        className="text-lg font-semibold text-white"
                      >
                        {job?.title || "Untitled role"}
                      </h2>
                      <div className="text-sm text-[var(--text-muted)]">
                        {job?.employmentType || "—"}{" "}
                        {job?.company ? `· ${job.company}` : ""}{" "}
                        {job?.location ? `· ${job.location}` : ""}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-extrabold text-[var(--accent)]">
                          {overallPct}%
                        </div>
                        <div
                          className={`text-sm ${
                            overallPct >= 70
                              ? "text-green-400"
                              : overallPct >= 50
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {overallPct >= 70
                            ? "Strong fit"
                            : overallPct >= 50
                            ? "Potential fit"
                            : "Low fit"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* grid content */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Column 1: strengths / why fit */}
                    <section>
                      <h3 className="text-sm font-semibold text-[var(--accent)] mb-2">
                        Strengths
                      </h3>
                      {strengths.length ? (
                        <ul className="list-inside space-y-2 text-sm text-[var(--text-muted)]">
                          {strengths.map((s, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-[var(--accent)]">•</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-[var(--text-muted)]">
                          No specific strengths detected for this job.
                        </p>
                      )}
                    </section>

                    {/* Column 2: skills */}
                    <section>
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-[var(--accent)]">
                          Skills
                        </h3>
                        <Badge>{skillsMatchPct}%</Badge>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {matchingSkills.length ? (
                          matchingSkills.map((s, i) => (
                            <Badge key={i} tone="tag">
                              {s}
                            </Badge>
                          ))
                        ) : (
                          <div className="text-sm text-[var(--text-muted)]">
                            No matching skills detected.
                          </div>
                        )}
                      </div>

                      {missingSkills.length > 0 && (
                        <>
                          <div className="text-sm font-semibold text-[var(--danger)] mt-4">
                            Suggested skills
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {missingSkills.map((m, i) => (
                              <Badge key={i} tone="missing">
                                {m}
                              </Badge>
                            ))}
                          </div>
                        </>
                      )}
                    </section>

                    {/* Column 3: growth areas & actions */}
                    <section>
                      <h3 className="text-sm font-semibold text-[var(--accent)] mb-2">
                        Growth suggestions
                      </h3>
                      {growthAreas.length ? (
                        <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                          {growthAreas.map((g, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-orange-400">•</span>
                              <span>{g}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-[var(--text-muted)]">
                          No specific recommendations found.
                        </p>
                      )}

                      <div className="mt-4">
                        <div className="text-xs text-[var(--text-muted)] mb-2">
                          Skills match
                        </div>
                        <div className="w-full h-2 bg-[rgba(255,255,255,0.03)] rounded overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${skillsMatchPct}%` }}
                            transition={{ duration: 0.9 }}
                            className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)]"
                          />
                        </div>

                        <div className="mt-3 flex gap-2">
                          <button
                            className="btn-ghost px-3 py-1 rounded-md text-sm"
                            onClick={() =>
                              navigator.clipboard?.writeText(
                                JSON.stringify(job, null, 2)
                              )
                            }
                          >
                            Copy JSON
                          </button>
                          <button
                            className="btn-accent px-3 py-1 rounded-md text-sm"
                            onClick={() =>
                              alert("Download not implemented in this demo.")
                            }
                          >
                            Download report
                          </button>
                        </div>
                      </div>
                    </section>
                  </div>
                </motion.article>
              );
            })}
          </main>
        </div>
      </div>

      {/* Minimal local styles for tokens used above */}
      <style>{`
        :root{
          --accent: #66FCF1;
          --accent-2: #45A29E;
          --text-primary: #E6EEF3;
          --text-muted: rgba(230,238,243,0.68);
          --danger: #ff6b6b;
        }
        .btn-accent{ background: linear-gradient(90deg,var(--accent),var(--accent-2)); color:#041016; padding:0.45rem 0.8rem; }
        .btn-ghost{ background: transparent; border:1px solid rgba(255,255,255,0.04); padding:0.4rem 0.7rem; color:var(--text-primary); }
      `}</style>
    </div>
  );
};

export default AnalysePage;
