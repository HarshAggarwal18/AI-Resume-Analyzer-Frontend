import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAnalyzedData } from "../services/api";
import CircleScore from "../components/common/CircleScore";
import ProgressBar from "../components/common/ProgressBar";
import { motion } from "framer-motion";

/* ---------- Helpers ---------- */
const safeArray = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    return val.split(/\r?\n|,|•|[-–—]\s|·/g).map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

const toPercent = (val) => {
  if (val == null || isNaN(val)) return 0;
  const num = Number(val);
  if (num <= 1) return Math.round(num * 100);
  return Math.round(Math.min(num, 100));
};

/* ---------- Components ---------- */
const SkillRow = ({ title, skills, colorClass }) => {
  if (!skills || skills.length === 0) return null;
  return (
    <div className="py-4 border-b border-white/5 last:border-0">
      <div className="flex items-center justify-between mb-3 text-sm text-slate-300 font-medium">
        <span>{title}</span>
        <span className="text-xs opacity-50">❯</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, i) => (
          <span key={i} className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 ${colorClass}`}>
            <span className="text-[10px] opacity-70">✓</span> {skill}
          </span>
        ))}
      </div>
    </div>
  );
};

const ImprovementCard = ({ items }) => (
  <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 relative overflow-hidden h-fit">
    {/* Glow */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[50px] pointer-events-none" />

    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
      <span className="text-amber-500">💡</span> What to Improve Next
    </h3>

    <div className="space-y-4">
      {items.length > 0 ? (
        items.slice(0, 5).map((item, i) => (
          <div key={i} className="flex gap-4 group">
            <div className="mt-1 shrink-0 w-5 h-5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center text-xs font-bold group-hover:bg-red-500/20 transition-colors">
              ✕
            </div>
            <div>
              <div className="text-white text-sm font-medium mb-1 group-hover:text-red-300 transition-colors">{item}</div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${i === 0 ? 'border-amber-500/30 text-amber-500 bg-amber-500/10' : 'border-blue-500/30 text-blue-500 bg-blue-500/10'
                }`}>
                {i === 0 ? 'High Impact' : 'Medium Impact'}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="text-sm text-center text-slate-400 py-6 border border-dashed border-white/10 rounded-xl bg-white/5">
          <span className="block text-2xl mb-2">🎉</span>
          No critical improvements found. <br /> Your profile is very strong!
        </div>
      )}
    </div>
  </div>
);

/* ---------- Main Component ---------- */
const AnalysePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      let data = location.state?.analysisData;
      if (!data && location.state?.resumeId) {
        try { data = await getAnalyzedData(location.state.resumeId); }
        catch (e) { console.error(e); }
      }
      if (data) {
        const arr = Array.isArray(data) ? data : [data];
        setItems(arr.sort((a, b) => toPercent(b?.matchScore?.overall) - toPercent(a?.matchScore?.overall)));
      }
      setLoading(false);
    };
    init();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center text-white">
      <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
      <p className="text-cyan-400 text-sm font-medium uppercase tracking-widest animate-pulse">Analyzing Resume...</p>
    </div>
  );

  if (!items || items.length === 0) return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center p-10 text-white text-center">
      <h2 className="text-2xl font-bold mb-2">No results found</h2>
      <p className="text-slate-400 mb-6">We couldn't analyze the resume provided.</p>
      <button onClick={() => navigate("/")} className="px-6 py-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">Go Back</button>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#0B1120] text-slate-200 font-sans selection:bg-cyan-500/30 overflow-x-hidden">

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[800px] h-[800px] bg-cyan-600/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-[#0B1120]/80 backdrop-blur-xl border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center no-print">
        <div className="text-white font-bold text-lg tracking-tight flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">R</div>
          <span>ResumeAI <span className="text-slate-600 font-normal mx-2">|</span> <span className="text-slate-400 font-normal">Report</span></span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate("/")} className="hidden sm:block px-4 py-2 rounded-full border border-white/10 text-xs text-white hover:bg-white/5 transition-colors">New Scan</button>
          <button onClick={() => window.print()} className="px-5 py-2 rounded-full bg-slate-800 border border-cyan-500/30 text-cyan-400 text-xs font-semibold hover:bg-slate-700 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all">Download PDF</button>
        </div>
      </header>

      {/* Scrollable Main Content */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-32">

        {items.map((job, idx) => {
          const score = toPercent(job?.matchScore?.overall);
          const skillsScore = toPercent(job?.matchScore?.skillsMatch);
          const matchedSkills = safeArray(job.matchingSkills || job.matchedSkills);
          const missingSkills = safeArray(job.missingSkills);
          const improvements = safeArray(job.growthAreas);

          const techSkills = matchedSkills.slice(0, Math.ceil(matchedSkills.length / 2));
          const otherSkills = matchedSkills.slice(Math.ceil(matchedSkills.length / 2));

          return (
            <motion.section
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {/* Visual Divider */}
              {idx > 0 && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full opacity-50"></div>
              )}

              {/* Header Info */}
              <div className="mb-8 pl-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest border border-cyan-500/20 bg-cyan-500/5 px-2 py-0.5 rounded">Role {idx + 1}</span>
                  <div className="h-px w-10 bg-white/10"></div>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">{job.title}</h2>
                <div className="flex flex-wrap gap-3">
                  {job.company && <span className="bg-[#1e2330] border border-white/10 px-3 py-1.5 rounded-lg text-xs text-slate-300 flex items-center gap-2 font-medium"><span className="text-blue-400 text-sm">🏢</span> {job.company}</span>}
                  {job.location && <span className="bg-[#1e2330] border border-white/10 px-3 py-1.5 rounded-lg text-xs text-slate-300 flex items-center gap-2 font-medium"><span className="text-red-400 text-sm">📍</span> {job.location}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                {/* LEFT: Sticky Score Card */}
                <div className="lg:col-span-4 lg:sticky lg:top-28">
                  <div className="bg-[#1e2330]/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 text-center relative overflow-hidden shadow-2xl">
                    {/* Inner Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />

                    <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-8 relative z-10 opacity-80">Match Strength</h3>

                    <div className="flex justify-center mb-8 relative z-10 scale-110">
                      <CircleScore value={score} size={160} />
                    </div>

                    <div className="space-y-6 relative z-10 text-left px-2 mb-8">
                      <ProgressBar
                        label="Keyword Match"
                        value={toPercent(job.matchScore?.skillsMatch)}
                        height="h-1.5"
                        color={score > 70 ? "#10b981" : "#3b82f6"}
                      />
                      <ProgressBar
                        label="Experience Fit"
                        value={Math.min(score + 10, 100)}
                        height="h-1.5"
                        color={score > 50 ? "#06b6d4" : "#f59e0b"}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 relative z-10">
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 flex flex-col items-center gap-1 hover:bg-emerald-500/10 transition-colors">
                        <div className="text-2xl font-bold text-emerald-400">{matchedSkills.length}</div>
                        <div className="text-[10px] uppercase text-emerald-500/70 font-bold">Matched</div>
                      </div>
                      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 flex flex-col items-center gap-1 hover:bg-red-500/10 transition-colors">
                        <div className="text-2xl font-bold text-red-400">{missingSkills.length}</div>
                        <div className="text-[10px] uppercase text-red-500/70 font-bold">Missing</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Detailed Analysis */}
                <div className="lg:col-span-8 space-y-8">

                  {/* Skill Alignment Card */}
                  <div className="bg-gradient-to-br from-[#1e293b]/60 to-[#0f172a]/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                      <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <span className="text-amber-400 text-xl">⚡</span> Skill Alignment
                      </h3>
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full border w-fit ${skillsScore > 60 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                        {skillsScore > 60 ? 'High Technical Match' : 'Potential Technical Match'}
                      </span>
                    </div>

                    <div className="mb-8 pl-1">
                      <div className="flex justify-between text-xs text-slate-500 mb-2 font-mono uppercase tracking-wider">
                        <span>Confidence</span>
                        <span>{skillsScore}%</span>
                      </div>
                      <div className="w-full bg-slate-800/50 rounded-full h-3 p-0.5 border border-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skillsScore}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 shadow-[0_0_15px_rgba(52,211,153,0.4)] relative"
                        >
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-sm" />
                        </motion.div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <SkillRow
                        title="Technical Skills"
                        skills={techSkills}
                        colorClass="bg-emerald-900/40 text-emerald-300 border border-emerald-500/20"
                      />
                      <SkillRow
                        title="Competencies & Tools"
                        skills={otherSkills}
                        colorClass="bg-indigo-900/40 text-indigo-300 border border-indigo-500/20"
                      />
                      {missingSkills.length > 0 && (
                        <div className="py-4">
                          <div className="flex items-center justify-between mb-3 text-sm text-slate-300 font-medium">
                            <span>Missing / Critical Gaps</span>
                            <span className="text-xs opacity-50">❯</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {missingSkills.slice(0, 12).map((skill, i) => (
                              <span key={i} className="px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-help" title="Missing from resume">
                                <span className="text-[10px] opacity-70">✕</span> {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Improvements Card */}
                  <ImprovementCard items={improvements} />

                </div>
              </div>
            </motion.section>
          );
        })}
      </main>
    </div>
  );
};

export default AnalysePage;
