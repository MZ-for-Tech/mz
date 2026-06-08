"use client";

import { motion } from "framer-motion";

interface LinearBackgroundProps {
    opacity?: number;
    className?: string;
    angle?: number;
}

export default function LinearBackground({
    opacity = 0.1,
    className = "",
    angle = 45,
}: LinearBackgroundProps) {
    return (
        <div
            className={`absolute inset-0 z-0 overflow-hidden pointer-events-none ${className}`}
            style={{ opacity }}
        >
            <motion.div
                className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%]"
                style={{
                    backgroundImage: `repeating-linear-gradient(${angle}deg, var(--primary) 0, var(--primary) 1px, transparent 1px, transparent 28px)`,
                }}
                animate={{
                    x: [0, -28],
                    y: [0, 28],
                }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: 3,
                }}
            />
        </div>
    );
}
