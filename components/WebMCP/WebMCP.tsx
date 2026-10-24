"use client";

import { useEffect } from "react";

// Experimental WebMCP API (https://webmachinelearning.github.io/webmcp/)
type ModelContext = {
  registerTool: (tool: unknown, options?: { signal?: AbortSignal }) => Promise<void>;
};

declare global {
  interface Document {
    modelContext?: ModelContext;
  }
  interface Navigator {
    modelContext?: ModelContext;
  }
}

export default function WebMCP() {
  useEffect(() => {
    // Older Chrome builds expose the API on navigator instead of document
    const modelContext = document.modelContext ?? navigator.modelContext;
    if (!modelContext?.registerTool) return;

    const controller = new AbortController();
    modelContext
      .registerTool(
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
            window.location.href = "/contact";
            return { success: true, message: "Redirected user to project initiation." };
          }
        },
        { signal: controller.signal }
      )
      .catch((error) => console.error("Failed to register WebMCP tools:", error));

    return () => controller.abort();
  }, []);

  return null; // This component doesn't render anything visually
}
