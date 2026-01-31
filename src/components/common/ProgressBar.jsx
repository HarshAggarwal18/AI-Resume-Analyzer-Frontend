import React from "react";
import { motion } from "framer-motion";

const ProgressBar = ({ label, value, color = "var(--accent-primary)", height = "h-2" }) => {
    const clampedValue = Math.min(Math.max(Number(value) || 0, 0), 100);

    return (
        <div className="w-full">
            <div className="flex justify-between items-end mb-2">
                {label && (
                    <span className="text-sm font-medium text-[var(--text-color)] opacity-80">
                        {label}
                    </span>
                )}
                <span className="text-sm font-bold" style={{ color }}>
                    {clampedValue}%
                </span>
            </div>
            <div className={`w-full bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden ${height}`}>
                <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${clampedValue}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="h-full rounded-full relative"
                    style={{ backgroundColor: color }}
                >
                    <div className="absolute right-0 top-0 bottom-0 w-2 blur-[4px] bg-white opacity-40"></div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProgressBar;
