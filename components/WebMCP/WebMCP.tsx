"use client";

import { useEffect } from "react";

// Extend navigator type to include experimental modelContext
declare global {
  interface Navigator {
    modelContext?: {
      provideContext: (config: unknown) => void;
    };
  }
}

export default function WebMCP() {
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
                // In a real implementation this would navigate to the contact form or open a modal
                window.location.href = "/start";
                return { success: true, message: "Redirected user to project initiation." };
              }
            },
            {
              name: "readManifesto",
              description: "Navigate the user to the MZ manifesto section to understand our philosophy.",
              inputSchema: {
                type: "object",
                properties: {},
                required: []
              },
              execute: async () => {
                const element = document.querySelector("#manifesto");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                  return { success: true, message: "Scrolled to manifesto." };
                }
                return { success: false, message: "Manifesto section not found." };
              }
            }
          ]
        });
        console.log("WebMCP tools registered successfully.");
      } catch (error) {
        console.error("Failed to register WebMCP tools:", error);
      }
    }
  }, []);

  return null; // This component doesn't render anything visually
}
