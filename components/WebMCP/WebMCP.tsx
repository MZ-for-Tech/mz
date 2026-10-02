"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Extend navigator type to include experimental modelContext
declare global {
  interface Navigator {
    modelContext?: {
      provideContext: (config: unknown) => void;
    };
  }
}

export default function WebMCP() {
  const router = useRouter();
  useEffect(() => {
    // Check if the browser supports WebMCP API
    if (typeof navigator !== "undefined" && navigator.modelContext?.provideContext) {
      try {
        navigator.modelContext.provideContext({
          tools: [
            {
              name: "initiateProject",
              description: "Initiate a new software or research project with MZ. Opens the contact/initiate view.",
              inputSchema: {
                type: "object",
                properties: {
                  projectType: {
                    type: "string",
                    enum: ["software", "research", "ocr", "other"],
                    description: "The type of project you want to discuss"
                  }
                },
                required: ["projectType"]
              },
              execute: async () => {
                router.push("/contact");
                return { success: true, message: "Redirected user to project initiation." };
              }
            }
          ]
        });
      } catch (error) {
        console.error("Failed to register WebMCP tools:", error);
      }
    }
  }, [router]);

  return null; // This component doesn't render anything visually
}
