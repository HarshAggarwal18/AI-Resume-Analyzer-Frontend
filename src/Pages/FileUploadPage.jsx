import React, { lazy, Suspense, useState, useMemo } from "react";
import { motion } from "framer-motion";

/**
 * FileUploadPage.jsx
 * - improved hero, feature grid, perf-mode toggle
 * - lazy-loads UploadSections (keeps initial paint fast)
 * - no GSAP; purely CSS for continuous visuals
 */

const UploadSections = lazy(() =>
  import("../components/UploadPage/UploadSections")
);

const FeatureCard = ({ emoji, title, desc }) => (
  <div className="p-4 rounded-xl border bg-[rgba(255,255,255,0.02)]">
    <div className="flex items-start gap-3">
      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-[rgba(102,252,241,0.06)]">
        {emoji}
      </div>
      <div>
        <div className="text-sm font-semibold text-[var(--text-primary)]">
          {title}
        </div>
        <div className="text-xs text-[var(--text-muted)] mt-1">{desc}</div>
      </div>
    </div>
  </div>
);

const FileUploadPage = () => {
  const [perfMode, setPerfMode] = useState(false);

  const features = useMemo(
    () => [
      {
        emoji: "🤖",
        title: "AI Match Insights",
        desc: "Compare resume to job descriptions & rank matches",
      },
      {
        emoji: "🔎",
        title: "Skill Gap Detection",
        desc: "See missing skills and personalized learning paths",
      },
      {
        emoji: "🧾",
        title: "ATS Compatibility",
        desc: "Format and content checks for parsers",
      },
      {
        emoji: "⚡",
        title: "Instant Recommendations",
        desc: "Concise action items to improve your profile",
      },
    ],
    []
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#071019] to-[#0b1320] text-white">
      {/* header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[rgba(0,0,0,0.25)] border-b border-[rgba(255,255,255,0.03)]">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-lg font-semibold text-[var(--text-primary)]">
              Resume<span className="text-[var(--accent-2)]">AI</span>
            </div>
            <div className="hidden md:block text-sm text-[var(--text-muted)]">
              Analyze · Improve · Apply
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-[var(--text-muted)] cursor-pointer">
              <input
                type="checkbox"
                checked={perfMode}
                onChange={(e) => setPerfMode(e.target.checked)}
              />
              Performance mode
            </label>
            <a href="#upload" className="btn-accent px-3 py-2 rounded-md">
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6 py-14 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-extrabold leading-tight"
            >
              Land your next job faster with{" "}
              <span className="text-[var(--accent-2)]">
                AI-powered resume insights
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="mt-4 text-[var(--text-muted)] max-w-xl"
            >
              Upload your resume to get recruiter-grade feedback: ATS checks,
              skill gaps, and tailored improvements in seconds.
            </motion.p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((f) => (
                <FeatureCard key={f.title} {...f} />
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="p-6 rounded-2xl border bg-[rgba(255,255,255,0.02)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-[var(--text-muted)]">
                  Secure • Private
                </div>
                <div className="text-lg font-semibold text-[var(--text-primary)] mt-1">
                  Upload a resume to start
                </div>
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                No signup required
              </div>
            </div>

            <div className="mt-6">
              <div className="p-4 rounded-lg border bg-[rgba(102,252,241,0.02)]">
                <div className="text-sm text-[var(--text-muted)]">
                  Supported formats
                </div>
                <div className="mt-2 flex gap-2">
                  <div className="px-3 py-1 rounded-md bg-[rgba(102,252,241,0.06)] text-xs">
                    PDF
                  </div>
                  <div className="px-3 py-1 rounded-md bg-[rgba(102,252,241,0.06)] text-xs">
                    DOC
                  </div>
                  <div className="px-3 py-1 rounded-md bg-[rgba(102,252,241,0.06)] text-xs">
                    DOCX
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <a href="#upload" className="btn-accent px-4 py-2 rounded-md">
                  Upload Resume →
                </a>
                <a
                  href="/learn-more"
                  className="btn-ghost px-4 py-2 rounded-md"
                >
                  Learn more
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Decorative visuals (CSS only). Hide when perfMode is true */}
      {!perfMode && (
        <>
          <div className="absolute right-10 top-20 w-72 h-72 rounded-full blur-3xl bg-[rgba(69,162,158,0.08)] pointer-events-none" />
          <div className="absolute left-6 bottom-10 w-72 h-72 rounded-full blur-3xl bg-[rgba(102,252,241,0.06)] pointer-events-none" />
        </>
      )}

      {/* Upload section (lazy loaded) */}
      <section id="upload" className="py-8">
        <Suspense
          fallback={
            <div className="max-w-4xl mx-auto p-8 text-center">
              <div className="inline-block w-12 h-12 border-4 border-t-transparent border-[var(--accent)] rounded-full animate-spin mb-4" />
              Loading upload UI…
            </div>
          }
        >
          <UploadSections />
        </Suspense>
      </section>

      <footer className="text-center py-6 text-sm text-[var(--text-muted)] border-t border-[rgba(255,255,255,0.03)]">
        © {new Date().getFullYear()} ResumeAI — Empowering Smarter Careers
      </footer>

      {/* small local style tokens (safe to keep here) */}
      <style>{`
        :root{
          --text-primary: #E6EEF3;
          --text-muted: rgba(230,238,243,0.65);
          --accent: #66FCF1;
          --accent-2: #45A29E;
        }
        .btn-accent{ background: linear-gradient(90deg,var(--accent),var(--accent-2)); color: #021217; padding: 0.5rem 0.9rem; }
        .btn-ghost{ background: transparent; border: 1px solid rgba(255,255,255,0.04); padding: 0.45rem 0.8rem; }
      `}</style>
    </div>
  );
};

export default FileUploadPage;
