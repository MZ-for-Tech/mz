export default function Loading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--color-bg)",
        width: "100%",
        height: "100%",
      }}
    >
      <div
        style={{
          width: "24px",
          height: "24px",
          border: "2px solid rgba(255,255,255,0.1)",
          borderTopColor: "var(--color-text)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
