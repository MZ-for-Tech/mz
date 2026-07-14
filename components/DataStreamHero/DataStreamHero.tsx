"use client";

import { useRef, useEffect } from 'react';

class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    baseX: number;
    baseY: number;
    size: number;
    density: number;
    color: string;

    value: string; // The mathematical symbol

    constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.vx = (Math.random() - 0.5);
        this.vy = (Math.random() - 0.5);
        this.size = Math.floor(Math.random() * 12 + 10); // Font size (rounded for grouping)
        this.density = (Math.random() * 30) + 1;
        this.color = color;
        // Mathematical symbols instead of binary
        const symbols = ['∫', '∑', '∂', '∇', 'α', 'β', 'μ', 'σ', 'φ', 'θ', 'λ', 'π', '∞', '≈', '≠', '≤', '≥'];
        this.value = symbols[Math.floor(Math.random() * symbols.length)];
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillText(this.value, this.x, this.y);
    }

    update(mouse: { x: number | null, y: number | null, radius: number }) {
        if (mouse.x != null && mouse.y != null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const maxDistance = mouse.radius;
            const force = (maxDistance - distance) / maxDistance;
            const directionX = forceDirectionX * force * this.density;
            const directionY = forceDirectionY * force * this.density;

            if (distance < mouse.radius) {
                this.x -= directionX;
                this.y -= directionY;
            } else {
                if (this.x !== this.baseX) {
                    const dx = this.x - this.baseX;
                    this.x -= dx / 10;
                }
                if (this.y !== this.baseY) {
                    const dy = this.y - this.baseY;
                    this.y -= dy / 10;
                }
            }
        } else {
            // Return to base if no mouse
            if (this.x !== this.baseX) { this.x -= (this.x - this.baseX) / 20; }
            if (this.y !== this.baseY) { this.y -= (this.y - this.baseY) / 20; }
        }
    }
}

export default function DataStreamHero({ className = "" }: { className?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles: Particle[] = [];
        let animationFrameId: number;

        let particleColor = 'rgba(26, 18, 8, 0.15)'; // matching --color-tnh-text

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

        const init = () => {
            particles = [];
            if (canvas.width === 0 || canvas.height === 0) return;

            const gap = 40; // OPTIMIZED
            for (let y = 0; y < canvas.height; y += gap) {
                for (let x = 0; x < canvas.width; x += gap) {
                    if (Math.random() > 0.1) {
                        particles.push(new Particle(x, y, particleColor));
                    }
                }
            }
            
            // Sort by size so we can batch ctx.font changes in the render loop
            particles.sort((a, b) => a.size - b.size);
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
            
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                if (p.size !== currentSize) {
                    currentSize = p.size;
                    ctx.font = `${currentSize}px "Cormorant Garamond", serif`;
                }
                p.draw(ctx);
                p.update(mouse);
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
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            overflow: 'hidden', 
            zIndex: 0 
          }}
        >
            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
        </div>
    );
}
