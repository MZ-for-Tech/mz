import { TransitionLink } from "@/components/TransitionLink/TransitionLink";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--color-bg)",
        color: "var(--color-text)",
        fontFamily: "var(--font-geist)",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(6rem, 15vw, 12rem)",
          lineHeight: 1,
          fontWeight: 700,
          margin: 0,
          letterSpacing: "-0.04em",
        }}
      >
        404
      </h1>
      <p
        style={{
          fontSize: "1.25rem",
          marginTop: "1rem",
          marginBottom: "3rem",
          opacity: 0.7,
        }}
      >
        This page doesn&apos;t exist.
      </p>
      <TransitionLink
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem 2rem",
          backgroundColor: "var(--color-olive)",
          color: "var(--color-bg)",
          textDecoration: "none",
          fontWeight: 500,
          borderRadius: "999px",
          transition: "opacity 0.2s ease",
        }}
        onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")}
        onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
      >
        Return Home
      </TransitionLink>
    </div>
  );
}
