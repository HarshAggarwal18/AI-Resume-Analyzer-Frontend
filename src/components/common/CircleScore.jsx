import React from "react";

const CircleScore = ({ value = 0, size = 120 }) => {
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circum = 2 * Math.PI * radius;
    const offset = circum - (Math.max(0, Math.min(100, value)) / 100) * circum;

    return (
        <div className="relative inline-flex items-center justify-center">
            {/* Glow Effect */}
            <div
                className="absolute inset-0 rounded-full opacity-20 blur-xl"
                style={{ background: `radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)` }}
            />

            <svg
                width={size}
                height={size}
                className="transform -rotate-90 relative z-10"
            >
                {/* Track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth={strokeWidth}
                />
                {/* Progress */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="var(--accent-primary)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={`${circum} ${circum}`}
                    strokeDashoffset={offset}
                    style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
                />
            </svg>

            {/* Inner Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <span className="text-4xl font-bold text-[var(--msg-primary)]" style={{ textShadow: "0 0 20px rgba(45,212,191,0.3)" }}>
                    {value}<span className="text-xl align-top opacity-70">%</span>
                </span>
            </div>
        </div>
    );
};

export default CircleScore;
