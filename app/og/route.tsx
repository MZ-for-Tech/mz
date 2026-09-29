import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";

const size = { width: 1200, height: 630 };

function sectionFor(path: string) {
  if (path.startsWith("/research")) return "RESEARCH";
  if (path.startsWith("/work")) return "SELECTED WORK";
  if (path === "/services") return "SERVICES";
  if (path === "/contact") return "CONTACT";
  if (path === "/intel") return "STUDIO";
  return "";
}

function limit(text: string, length: number) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= length) return normalized;

  const candidate = normalized.slice(0, length - 1).trimEnd();
  const boundary = candidate.lastIndexOf(" ");
  const shortened = boundary >= length * 0.7 ? candidate.slice(0, boundary) : candidate;
  return `${shortened}…`;
}

function actionFor(path: string, isArabic: boolean) {
  if (isArabic) {
    if (path.startsWith("/research")) return "اقرأ البحث ↗";
    if (path.startsWith("/work")) return "استكشف الأعمال ↗";
    if (path === "/contact") return "ابدأ محادثة ↗";
    return "ابدأ مشروعاً ↗";
  }

  if (path.startsWith("/research")) return "READ THE RESEARCH ↗";
  if (path === "/work/nested-united") return "VIEW THE CASE STUDY ↗";
  if (path.startsWith("/work")) return "EXPLORE OUR WORK ↗";
  if (path === "/services") return "TELL US WHAT YOU'RE BUILDING ↗";
  if (path === "/contact") return "START A CONVERSATION ↗";
  if (path === "/intel") return "GET TO KNOW MZ ↗";
  return "START A PROJECT ↗";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = limit(searchParams.get("title") || "Model Zero for Technology Solutions", 110);
  const description = limit(
    searchParams.get("description") || "A Cairo-based software and AI company building custom systems and training teams to run them.",
    125,
  );
  const path = searchParams.get("path") || "/";
  const isArabic = searchParams.get("locale")?.startsWith("ar") ?? false;
  const cardDescription = path === "/"
    ? "Software and AI systems, built in Cairo. Teams trained to run them."
    : description;
  const section = sectionFor(path);
  const action = actionFor(path, isArabic);
  const logo = await readFile(join(process.cwd(), "public/mz.svg"), "utf8");
  const logoSource = `data:image/svg+xml;base64,${Buffer.from(logo).toString("base64")}`;
  const arabicFont = isArabic
    ? await readFile(join(process.cwd(), "public/fonts/og/NotoNaskhArabicUI-Regular.ttf"))
    : undefined;
  const titleSize = title.length > 68 ? 44 : title.length > 44 ? 52 : 66;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(112deg, #0d0f08 0%, #0d0f08 62%, #11150a 100%)",
          color: "#f5f5f0",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <svg
          width="1200"
          height="630"
          viewBox="0 0 1200 630"
          style={{ position: "absolute", inset: 0, display: "flex" }}
        >
          <defs>
            <linearGradient id="flow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#5a7a0a" stopOpacity="0.08" />
              <stop offset="0.4" stopColor="#d4a820" stopOpacity="0.82" />
              <stop offset="0.72" stopColor="#ffe78d" stopOpacity="0.96" />
              <stop offset="1" stopColor="#88b600" stopOpacity="0.48" />
            </linearGradient>
          </defs>
          <path
            d="M310 666 C 500 648, 576 526, 700 535 C 840 546, 876 637, 1000 560 C 1110 492, 1122 333, 1280 182"
            fill="none"
            stroke="#88b600"
            strokeWidth="82"
            opacity="0.12"
          />
          <path
            d="M310 666 C 500 648, 576 526, 700 535 C 840 546, 876 637, 1000 560 C 1110 492, 1122 333, 1280 182"
            fill="none"
            stroke="url(#flow)"
            strokeWidth="5"
            opacity="0.9"
          />
          <path
            d="M310 692 C 500 674, 584 552, 708 561 C 848 572, 884 663, 1008 586 C 1118 518, 1130 359, 1280 208"
            fill="none"
            stroke="#ffe78d"
            strokeWidth="1"
            opacity="0.28"
          />
        </svg>

        <img
          src={logoSource}
          alt="MZ logo"
          style={{
            position: "absolute",
            right: "74px",
            top: "150px",
            width: "350px",
            height: "350px",
            objectFit: "contain",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            padding: "56px 76px 40px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "rgba(245,245,240,0.58)",
              fontSize: 13,
              letterSpacing: "0.22em",
            }}
          >
            MZFORTECH.COM
          </div>
          <div
            style={{
              display: "flex",
              width: 1048,
              height: 1,
              marginTop: 26,
              background: "rgba(245,245,240,0.14)",
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: 1,
              maxWidth: 630,
              paddingTop: 12,
              paddingBottom: 18,
            }}
          >
            {section && (
              <div
                style={{
                  display: "flex",
                  color: "#a8c95d",
                  fontSize: 14,
                  letterSpacing: "0.22em",
                  marginBottom: 19,
                }}
              >
                {section}
              </div>
            )}
            <div
              dir={isArabic ? "rtl" : "ltr"}
              style={{
                display: "flex",
                maxWidth: 625,
                color: "#f5f5f0",
                fontSize: titleSize,
                fontWeight: 400,
                lineHeight: 1.08,
                letterSpacing: isArabic ? "0" : "-0.04em",
                textAlign: isArabic ? "right" : "left",
                fontFamily: isArabic ? "NotoNaskhArabic" : "Arial, sans-serif",
              }}
            >
              {title}
            </div>
            <div
              dir={isArabic ? "rtl" : "ltr"}
              style={{
                display: "flex",
                maxWidth: 600,
                color: "rgba(245,245,240,0.62)",
                fontSize: 21,
                lineHeight: 1.42,
                marginTop: 20,
                textAlign: isArabic ? "right" : "left",
                fontFamily: isArabic ? "NotoNaskhArabic" : "Arial, sans-serif",
              }}
            >
              {cardDescription}
            </div>
            <div
              style={{
                display: "flex",
                alignSelf: isArabic ? "flex-end" : "flex-start",
                alignItems: "center",
                marginTop: 24,
                border: "1px solid rgba(168,201,93,0.58)",
                borderRadius: 3,
                padding: "15px 22px",
                background: "rgba(168,201,93,0.08)",
                color: "#ffe78d",
                fontSize: 17,
                letterSpacing: "0.1em",
              }}
            >
              {action}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=31536000" },
      ...(arabicFont
        ? {
            fonts: [
              {
                name: "NotoNaskhArabic",
                data: arabicFont,
                style: "normal" as const,
                weight: 400 as const,
              },
            ],
          }
        : {}),
    },
  );
}
