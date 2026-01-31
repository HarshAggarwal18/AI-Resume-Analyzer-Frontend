import React, { lazy, Suspense, useState, useMemo } from "react";
import { motion } from "framer-motion";
import FeatureCard from "../components/common/FeatureCard";

const UploadSections = lazy(() => import("../components/UploadPage/UploadSections"));

const FileUploadPage = () => {
  return (
    <div className="min-h-screen w-full bg-[#0B1120] text-slate-200 relative overflow-hidden font-sans selection:bg-cyan-500/30">

      {/* Background Ambience (Cosmic) */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />
      <div className="absolute top-[-100px] left-[20%] w-[1000px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Stars (simulated) */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0B1120]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="text-cyan-400">⚡</span> ResumeAI
          </div>
          <div className="flex items-center gap-6">
            <span className="text-xs text-slate-500 hidden md:block">New Scan</span>
            <button className="px-5 py-2 rounded-full border border-cyan-500/30 text-cyan-400 text-sm font-medium hover:bg-cyan-500/10 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero */}
      <main className="relative max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left: Text Content */}
          <div className="space-y-8 z-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-white"
            >
              Optimize your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Career Path
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-400 max-w-lg leading-relaxed"
            >
              Unlock recruiter-level insights. Our AI analyzes your resume to boost your job prospects and guide your career growth.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4"
            >
              <button className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 transition-transform">
                Upload Resume
              </button>
              <button className="px-8 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white font-medium hover:bg-white/10 transition-colors">
                Watch Demo
              </button>
            </motion.div>
          </div>

          {/* Right: Upload Card */}
          <div className="relative z-20 w-full">
            <Suspense fallback={<div className="h-96 w-full animate-pulse bg-white/5 rounded-3xl" />}>
              <UploadSections />
            </Suspense>
          </div>

        </div>

        {/* Feature Row (Powered by Advanced AI) */}
        <div className="mt-24 md:mt-32">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-white">Powered by Advanced AI</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard icon="🤖" title="AI Match Insights" desc="Compare resume and job descriptions & track matches" delay={0.1} />
            <FeatureCard icon="⚠" title="Skill Gap Detection" desc="See missing skills and personalized learning paths" delay={0.2} />
            <FeatureCard icon="📝" title="ATS Compatibility" desc="Format and optimize for application tracking systems" delay={0.3} />
            <FeatureCard icon="⚡" title="Instant Recommendations" desc="Get actionable steps to improve your career" delay={0.4} />
          </div>
        </div>

      </main>
    </div>
  );
};

export default FileUploadPage;
