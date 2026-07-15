"use client";

import { useRef, useEffect } from 'react';

const SYMBOLS = ['∫', '∑', '∂', '∇', 'α', 'β', 'μ', 'σ', 'φ', 'θ', 'λ', 'π', '∞', '≈', '≠', '≤', '≥'];

export default function DataStreamHero({ className = "" }: { className?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particleColor = 'rgba(26, 18, 8, 0.15)'; 

        const updateParticleColor = () => {
            const rootStyles = getComputedStyle(document.documentElement);
            const rgbStr = rootStyles.getPropertyValue('--color-tnh-text-rgb').trim() || '26, 18, 8';
            particleColor = `rgba(${rgbStr}, 0.15)`;
        };

        updateParticleColor();

        const themeObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    updateParticleColor();
                }
            });
        });
        themeObserver.observe(document.documentElement, { attributes: true });

        const mouse = {
            x: null as number | null,
            y: null as number | null,
            radius: 150
        };

        // TypedArrays for data-oriented particles
        let numParticles = 0;
        let pX: Float32Array;
        let pY: Float32Array;
        let pBaseX: Float32Array;
        let pBaseY: Float32Array;
        let pSize: Float32Array;
        let pDensity: Float32Array;
        let pSymbolIndex: Uint8Array;

        const init = () => {
            if (canvas.width === 0 || canvas.height === 0) return;
            
            // Dynamic gap based on resolution to strictly cap particles (preventing 4K runaway)
            const TARGET_PARTICLES = 1500;
            const area = canvas.width * canvas.height;
            // Expected particles ≈ (area / gap^2) * 0.9 (because of 90% chance below)
            let gap = Math.sqrt((area * 0.9) / TARGET_PARTICLES);
            gap = Math.max(30, gap); // ensure it doesn't get too overwhelmingly dense on tiny screens

            const cols = Math.ceil(canvas.width / gap);
            const rows = Math.ceil(canvas.height / gap);
            const maxP = cols * rows;

            pX = new Float32Array(maxP);
            pY = new Float32Array(maxP);
            pBaseX = new Float32Array(maxP);
            pBaseY = new Float32Array(maxP);
            pSize = new Float32Array(maxP);
            pDensity = new Float32Array(maxP);
            pSymbolIndex = new Uint8Array(maxP);

            numParticles = 0;

            for (let y = 0; y < canvas.height; y += gap) {
                for (let x = 0; x < canvas.width; x += gap) {
                    if (Math.random() > 0.1) {
                        pX[numParticles] = x;
                        pY[numParticles] = y;
                        pBaseX[numParticles] = x;
                        pBaseY[numParticles] = y;
                        pSize[numParticles] = Math.floor(Math.random() * 12 + 10);
                        pDensity[numParticles] = (Math.random() * 30) + 1;
                        pSymbolIndex[numParticles] = Math.floor(Math.random() * SYMBOLS.length);
                        numParticles++;
                    }
                }
            }
            
            // Sort arrays by pSize for heavily batched ctx.font rendering
            const indices = new Int32Array(numParticles);
            for (let i = 0; i < numParticles; i++) indices[i] = i;
            indices.sort((a, b) => pSize[a] - pSize[b]);

            // Copy to sorted buffers
            const sX = new Float32Array(numParticles);
            const sY = new Float32Array(numParticles);
            const sBaseX = new Float32Array(numParticles);
            const sBaseY = new Float32Array(numParticles);
            const sSize = new Float32Array(numParticles);
            const sDensity = new Float32Array(numParticles);
            const sSymbolIndex = new Uint8Array(numParticles);

            for (let i = 0; i < numParticles; i++) {
                const idx = indices[i];
                sX[i] = pX[idx];
                sY[i] = pY[idx];
                sBaseX[i] = pBaseX[idx];
                sBaseY[i] = pBaseY[idx];
                sSize[i] = pSize[idx];
                sDensity[i] = pDensity[idx];
                sSymbolIndex[i] = pSymbolIndex[idx];
            }

            pX = sX; pY = sY; pBaseX = sBaseX; pBaseY = sBaseY;
            pSize = sSize; pDensity = sDensity; pSymbolIndex = sSymbolIndex;
        };

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                canvas.width = width;
                canvas.height = height || 400; // Fallback
                init();
            }
        });

        if (canvas.parentElement) {
            resizeObserver.observe(canvas.parentElement);
        }

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };

        const handleMouseLeave = () => {
            mouse.x = null;
            mouse.y = null;
        }

        let isVisible = false;
        let isAnimating = false;

        const animate = () => {
            if (!isVisible) {
                isAnimating = false;
                return;
            }
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = particleColor;
            
            let currentSize = 0;
            const mx = mouse.x;
            const my = mouse.y;
            const mRadius = mouse.radius;
            
            for (let i = 0; i < numParticles; i++) {
                let px = pX[i];
                let py = pY[i];
                const bx = pBaseX[i];
                const by = pBaseY[i];
                
                if (mx != null && my != null) {
                    const dx = mx - px;
                    const dy = my - py;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mRadius) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (mRadius - distance) / mRadius;
                        const density = pDensity[i];
                        px -= forceDirectionX * force * density;
                        py -= forceDirectionY * force * density;
                    } else {
                        if (px !== bx) px -= (px - bx) / 10;
                        if (py !== by) py -= (py - by) / 10;
                    }
                } else {
                    if (px !== bx) px -= (px - bx) / 20;
                    if (py !== by) py -= (py - by) / 20;
                }
                
                pX[i] = px;
                pY[i] = py;

                const size = pSize[i];
                if (size !== currentSize) {
                    currentSize = size;
                    ctx.font = `${currentSize}px "Cormorant Garamond", serif`;
                }
                ctx.fillText(SYMBOLS[pSymbolIndex[i]], px, py);
            }
            
            animationFrameId = requestAnimationFrame(animate);
        };

        const observer = new IntersectionObserver(([entry]) => {
            isVisible = entry.isIntersecting;
            if (isVisible && !isAnimating) {
                isAnimating = true;
                if (animationFrameId) cancelAnimationFrame(animationFrameId);
                animate();
            } else if (!isVisible && animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                isAnimating = false;
            }
        }, { threshold: 0.01 });

        if (canvas.parentElement) {
            observer.observe(canvas.parentElement);
        }

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            themeObserver.disconnect();
            observer.disconnect();
            resizeObserver.disconnect();
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div 
          className={className} 
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0 }}
        >
            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
        </div>
    );
}
