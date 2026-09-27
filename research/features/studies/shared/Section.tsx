
export default function Section({ id, children }: { id?: string, children: React.ReactNode }) {
    return (
        <section id={id} className="scroll-mt-32">
            {children}
        </section>
    );
}
