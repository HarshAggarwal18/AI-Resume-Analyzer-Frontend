import React from "react";
import { motion } from "framer-motion";

const FeatureCard = ({ icon, title, desc, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="bg-[#1e293b]/40 border border-white/5 p-5 rounded-2xl hover:bg-[#1e293b]/60 transition-colors group"
        >
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <div>
                    <h3 className="text-white font-bold text-base mb-1 group-hover:text-cyan-400 transition-colors">
                        {title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        {desc}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default FeatureCard;
