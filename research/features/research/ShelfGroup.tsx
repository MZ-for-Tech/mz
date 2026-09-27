'use client';

import { useEffect, useRef } from 'react';
import type { Study } from '@/research/lib/types';
import BookItem from '@/research/features/research/BookItem';

interface ShelfGroupProps {
    studies: Study[];
    locale: string;
    index: number;
}

export default function ShelfGroup({ studies, locale, index }: ShelfGroupProps) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const topPathRef = useRef<SVGPathElement>(null);
    const bottomPathRef = useRef<SVGPathElement>(null);
    const frontPathRef = useRef<SVGPathElement>(null);
    const svgBackRef = useRef<SVGSVGElement>(null);
    const svgFrontRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        let rafId = 0;

        const drawShelf = () => {
            rafId = 0;
            const wrapper = wrapperRef.current;
            if (!wrapper) return;

            const rect = wrapper.getBoundingClientRect();
            const width = rect.width;
            const originY = window.innerHeight * 0.55 - rect.top;
            const perspective = 1200;
            const scale = perspective / (perspective + 100);
            const inset = (width - width * scale) / 2;
            const frontTopY = 50;
            const frontBottomY = 65;
            const backTopY = originY + (frontTopY - originY) * scale;
            const backBottomY = originY + (frontBottomY - originY) * scale;
            const topPath = topPathRef.current;
            const bottomPath = bottomPathRef.current;
            const frontPath = frontPathRef.current;

            if (topPath && bottomPath && frontPath) {
                topPath.setAttribute('d', originY < frontTopY
                    ? `M 0 ${frontTopY} L ${width} ${frontTopY} L ${width - inset} ${backTopY} L ${inset} ${backTopY} Z`
                    : '');
                bottomPath.setAttribute('d', originY > frontBottomY
                    ? `M 0 ${frontBottomY} L ${width} ${frontBottomY} L ${width - inset} ${backBottomY} L ${inset} ${backBottomY} Z`
                    : '');
                frontPath.setAttribute('d', `M 0 ${frontTopY} L ${width} ${frontTopY} L ${width} ${frontBottomY} L 0 ${frontBottomY} Z`);
            }

            wrapper.style.setProperty('--book-origin-y', `${originY + 210}px`);
            const zIndex = originY > frontTopY ? '5' : '1';
            if (svgBackRef.current) svgBackRef.current.style.zIndex = zIndex;
            if (svgFrontRef.current) svgFrontRef.current.style.zIndex = zIndex;
        };

        const scheduleDraw = () => {
            if (!rafId) rafId = requestAnimationFrame(drawShelf);
        };
        const observer = new ResizeObserver(scheduleDraw);
        if (wrapperRef.current) observer.observe(wrapperRef.current);
        window.addEventListener('scroll', scheduleDraw, { passive: true });
        window.addEventListener('resize', scheduleDraw);
        scheduleDraw();

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', scheduleDraw);
            window.removeEventListener('resize', scheduleDraw);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <div className="shelf-group">
            <div className="shelf-wrapper" ref={wrapperRef}>
                <svg className="bookshelf-svg bookshelf-svg-back" ref={svgBackRef}>
                    <defs>
                        <linearGradient id={`shelfTopGrad-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="var(--shelf-top-0)" />
                            <stop offset="25%" stopColor="var(--shelf-top-1)" />
                            <stop offset="60%" stopColor="var(--shelf-top-2)" />
                            <stop offset="100%" stopColor="var(--shelf-top-3)" />
                        </linearGradient>
                        <linearGradient id={`shelfBottomGrad-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="var(--shelf-bottom-0)" />
                            <stop offset="50%" stopColor="var(--shelf-bottom-1)" />
                            <stop offset="100%" stopColor="var(--shelf-bottom-2)" />
                        </linearGradient>
                        <filter id={`woodNoise-back-${index}`} x="0%" y="0%" width="100%" height="100%">
                            <feTurbulence type="fractalNoise" baseFrequency="0.015 0.12" numOctaves="3" result="noise" />
                            <feColorMatrix type="matrix" values="
                                0.32 0 0 0 0.16
                                0 0.22 0 0 0.11
                                0 0 0.12 0 0.06
                                0 0 0 0.18 0" in="noise" result="coloredNoise" />
                            <feComposite operator="arithmetic" k1="0" k2="1" k3="1" k4="0" in="SourceGraphic" in2="coloredNoise" result="blended" />
                            <feComposite operator="in" in="blended" in2="SourceGraphic" />
                        </filter>
                    </defs>
                    <path ref={topPathRef} className="shelf-top" fill={`url(#shelfTopGrad-${index})`} filter={`url(#woodNoise-back-${index})`} stroke="var(--shelf-stroke-top)" strokeWidth="0.5" strokeLinejoin="round" strokeLinecap="round" />
                    <path ref={bottomPathRef} className="shelf-bottom" fill={`url(#shelfBottomGrad-${index})`} filter={`url(#woodNoise-back-${index})`} stroke="var(--shelf-stroke-bottom)" strokeWidth="0.5" strokeLinejoin="round" strokeLinecap="round" />
                </svg>
                
                <div className="shelf-scroll-area">
                    <div className="shelf-content">
                        {studies.map(study => (
                            <BookItem key={study.slug} study={study} locale={locale} />
                        ))}
                    </div>
                </div>

                <svg className="bookshelf-svg bookshelf-svg-front" ref={svgFrontRef}>
                    <defs>
                        <linearGradient id={`shelfFrontGrad-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="var(--shelf-front-0)" />
                            <stop offset="30%" stopColor="var(--shelf-front-1)" />
                            <stop offset="100%" stopColor="var(--shelf-front-2)" />
                        </linearGradient>
                        <filter id={`woodNoise-front-${index}`} x="0%" y="0%" width="100%" height="100%">
                            <feTurbulence type="fractalNoise" baseFrequency="0.015 0.12" numOctaves="3" result="noise" />
                            <feColorMatrix type="matrix" values="
                                0.32 0 0 0 0.16
                                0 0.22 0 0 0.11
                                0 0 0.12 0 0.06
                                0 0 0 0.18 0" in="noise" result="coloredNoise" />
                            <feComposite operator="arithmetic" k1="0" k2="1" k3="1" k4="0" in="SourceGraphic" in2="coloredNoise" result="blended" />
                            <feComposite operator="in" in="blended" in2="SourceGraphic" />
                        </filter>
                    </defs>
                    <path ref={frontPathRef} className="shelf-front" fill={`url(#shelfFrontGrad-${index})`} filter={`url(#woodNoise-front-${index})`} stroke="var(--shelf-stroke-front)" strokeWidth="0.5" strokeLinejoin="round" strokeLinecap="round" />
                </svg>
            </div>
        </div>
    );
}
