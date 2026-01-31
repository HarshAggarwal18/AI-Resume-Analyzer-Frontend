import React from "react";

const Badge = ({ children, tone = "muted", icon = null }) => {
    const toneClasses = {
        muted: "bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)] border-transparent",
        success: "bg-[var(--success-bg)] text-[var(--success)] border border-[rgba(74,222,128,0.2)]",
        failure: "bg-[var(--danger-bg)] text-[var(--danger)] border border-[rgba(248,113,113,0.2)]",
        warning: "bg-[var(--warning-bg)] text-[var(--warning)] border border-[rgba(251,191,36,0.2)]",
        brand: "bg-[rgba(45,212,191,0.1)] text-[var(--accent-primary)] border border-[rgba(45,212,191,0.2)]",
    };

    return (
        <span
            className={`px-3 py-1.5 text-xs font-semibold rounded-full inline-flex items-center gap-1.5 border transition-all duration-300 hover:scale-105 cursor-default ${toneClasses[tone] || toneClasses.muted
                }`}
        >
            {icon && <span className="opacity-80">{icon}</span>}
            {children}
        </span>
    );
};

export default Badge;
