"use client";

interface BackgroundMeshProps {
    className?: string;
    opacity?: number;
}

export default function BackgroundMesh({ className = "", opacity = 1 }: BackgroundMeshProps) {
    return (
        <div
            className={`absolute inset-0 z-0 jumbo ${className}`}
            style={{ opacity: opacity }}
        />
    );
}
