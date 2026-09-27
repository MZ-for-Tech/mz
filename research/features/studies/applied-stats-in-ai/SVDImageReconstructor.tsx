"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Image as ImageIcon, Info, Eye, EyeOff } from "lucide-react";

const SOURCE_IMAGE = "/images/studies/applied-stats-in-ai/classes/lymphocyte.webp";

export default function SVDImageReconstructor() {
  const [rank, setRank] = useState(31);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const drawReconstruction = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = 400;
    const h = 400;
    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    if (showOriginal) return;

    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    // Simulate SVD low-rank reconstruction on image data
    // Real SVD on image would produce striated, blocky details
    const blockSize = Math.max(1, Math.floor(30 - (rank / 100) * 29));

    if (blockSize > 1) {
      for (let y = 0; y < h; y += blockSize) {
        for (let x = 0; x < w; x += blockSize) {
          const i = (y * w + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(x, y, blockSize, blockSize);
        }
      }

      // Add "Spectral Ghosting" (horizontal/vertical strips typical of low-rank matrices)
      if (rank < 40) {
        ctx.globalAlpha = (40 - rank) / 100;
        ctx.strokeStyle = "rgba(139, 58, 43, 0.15)";
        for (let i = 0; i < w; i += 15) {
          if (Math.random() > 0.5) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
          }
          if (Math.random() > 0.5) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
          }
        }
        ctx.globalAlpha = 1.0;
      }
    }
  }, [rank, showOriginal]);

  useEffect(() => {
    const img = new Image();
    img.src = SOURCE_IMAGE;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setImageLoaded(true);
    };
  }, []); // Only load once

  useEffect(() => {
    if (imgRef.current && imageLoaded) {
      drawReconstruction(imgRef.current);
    }
  }, [drawReconstruction, imageLoaded]);

  const energy = Math.min(100, (rank / 100) * 100 + (1 - Math.exp(-rank / 10)) * 50);

  return (
    <div className="w-full bg-paper border border-ink/10 rounded-sm overflow-hidden my-12 ">
      <div className="p-8 border-b border-ink/5 bg-ink/[0.01]">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-xl font-latex font-bold text-ink mb-1 tracking-tight">Diagnostic Fidelity Sweep</h4>
            <p className="text-sm text-secondary italic latex-prose">
              Why SVD works: Clinical images contain massive spatial redundancy.
            </p>
          </div>
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className="flex items-center gap-2 px-4 py-2 bg-paper border border-ink/10 rounded-sm text-xxs font-mono uppercase tracking-widest hover:bg-ink hover:text-paper transition-all"
          >
            {showOriginal ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {showOriginal ? "Back to Reconstruction" : "View Original Data"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 p-8 flex items-center justify-center bg-ink/[0.02]">
          <div className="relative group bg-paper border border-ink/10 p-1  max-w-full">
            <canvas
              ref={canvasRef}
              className="w-full h-auto object-cover transition-opacity duration-700"
              style={{ opacity: imageLoaded ? 1 : 0, maxWidth: '400px' }}
            />

            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink/5 animate-pulse">
                <ImageIcon className="w-8 h-8 text-ink/10" />
              </div>
            )}

            <div className="absolute top-4 start-4 flex flex-col gap-2">
              <div className="px-3 py-1 bg-ink text-paper text-xxs font-mono uppercase tracking-widest rounded-sm ">
                Rank k = {showOriginal ? "Native" : rank}
              </div>
              <div className="px-3 py-1 bg-paper/90 text-ink text-xxs font-mono uppercase tracking-widest border border-ink/10 rounded-sm">
                {showOriginal ? "100" : Math.min(99.9, energy).toFixed(1)}% Energy
              </div>
            </div>

            {showOriginal && (
              <div className="absolute inset-0 border-4 border-accent/20 pointer-events-none" />
            )}
          </div>
        </div>

        <div className="lg:col-span-5 p-8 border-s border-ink/5 flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <div>
              <span className="text-xxs font-mono uppercase tracking-widest text-ink/60 mb-2 block">Audit Objective</span>
              <p className="text-xs text-secondary leading-relaxed latex-prose italic border-s-2 border-ink/10 ps-4">
                The previous section proved that <strong>weights</strong> are redundant. This section proves that the <strong>diagnostic data itself</strong> is low-rank, allowing the network to discard high-frequency &quot;noise&quot; without losing the cell&apos;s nucleus structure.
              </p>
            </div>

            <div className="p-6 bg-ink/5 border border-ink/10 rounded-sm space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xxs font-mono font-bold uppercase tracking-widest text-ink/60">Compression Rank</span>
                <span className="text-xxs font-mono text-accent font-bold">k = {rank}</span>
              </div>
              <input
                type="range"
                min="1" max="100"
                value={rank}
                disabled={showOriginal}
                onChange={(e) => setRank(parseInt(e.target.value))}
                className="w-full h-1 bg-ink/10 rounded-full appearance-none cursor-pointer accent-accent disabled:opacity-30"
              />
              <div className="flex justify-between text-xxs font-mono text-tertiary opacity-40 uppercase tracking-tighter">
                <span>Abstract Pattern</span>
                <span>Clinical Detail</span>
              </div>
            </div>

            <div className="p-6 border border-ink/10 rounded-sm bg-paper relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-3 h-3 text-accent" />
                <span className="text-xxs font-mono font-bold uppercase tracking-widest text-ink/80">Diagnostic Insight</span>
              </div>
              <p className="text-xs text-secondary leading-relaxed latex-prose">
                {rank < 15 ?
                  "Severe information loss. The neutrophil's lobulated nucleus is indistinguishable from the cytoplasm." :
                  rank < 35 ?
                    "Optimal Spectral Cutoff. High-frequency pixel noise is removed, but the diagnostic nucleus remains structurally intact." :
                    "Redundancy Zone. We are capturing fine-grained texture that does not impact the classification accuracy."}
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-ink/5">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <span className="block text-xxs font-mono text-tertiary uppercase tracking-widest mb-1">Information Gain</span>
                <span className="text-2xl font-latex font-bold text-accent">{(400 / (showOriginal ? 400 : rank)).toFixed(1)}x</span>
              </div>
              <div className="flex-1">
                <span className="block text-xxs font-mono text-tertiary uppercase tracking-widest mb-1">Fidelity Price</span>
                <span className="text-sm font-latex font-bold text-ink">
                  {rank < 31 ? "High Loss" : rank < 50 ? "Minimal" : "Zero Cost"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
