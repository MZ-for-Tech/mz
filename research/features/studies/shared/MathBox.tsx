import SafeLatex from "@/research/components/SafeLatex";

export default function MathBox({ latex, children }: { latex?: string, children?: React.ReactNode }) {
    return (
        <div
            className="my-8 p-6 bg-paper rounded-sm border border-ink/10 text-center text-xl md:text-2xl overflow-x-auto"
            dir="ltr"
        >
            {latex ? <SafeLatex>{latex}</SafeLatex> : children}
        </div>
    );
}
