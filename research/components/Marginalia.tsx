import { StickyNote } from 'lucide-react';

interface MarginaliaProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    side?: "left" | "right" | string;
    topClass?: string;
}

export default function Marginalia({ children, className, title, side, topClass }: MarginaliaProps) {
    const sideClass = side === "left" ? "breakout-left md:text-right" : "";
    return (
        <aside
            className={`breakout hidden md:block ${sideClass} text-sm text-tertiary italic latex-prose mt-1 ${topClass ? `absolute ${topClass}` : ''} ${className ?? ''}`}
        >
            {title && (
                <div className="mb-2">
                    <div className="font-bold text-ink font-latex not-italic">{title}</div>
                </div>
            )}
            <span className="block mb-2 text-accent/50">
                <StickyNote className="w-4 h-4" />
            </span>
            {children}
        </aside>
    );
}
