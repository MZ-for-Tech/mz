"use client";

import React from "react";
import { Play, Pause, RotateCcw, AlertTriangle, type LucideIcon } from "lucide-react";
import { cn } from "@/research/lib/utils";
import { animate } from "framer-motion";

// --- SLIDER ---
interface VizSliderProps {
  label?: string | React.ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  minLabel?: string;
  maxLabel?: string;
  formatValue?: (val: number) => string;
  hideValue?: boolean;
  className?: string;
}

export function VizSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  minLabel,
  maxLabel,
  formatValue,
  hideValue,
  className,
}: VizSliderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {(label || (formatValue && !hideValue)) && (
        <div className="flex justify-between items-center">
          {label && (
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-tertiary">
              {label}
            </div>
          )}
          {formatValue && !hideValue && (
            <span className="text-xs font-mono font-bold text-accent tracking-widest">
              {formatValue(value)}
            </span>
          )}
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-ink/10 rounded-sm appearance-none cursor-pointer accent-accent"
      />
      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-xs font-mono text-tertiary uppercase tracking-widest mt-1">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}

// --- TOGGLE GROUP ---
interface VizToggleOption {
  value: string;
  label: string;
  icon?: LucideIcon;
  accentWhenActive?: boolean;
}

interface VizToggleGroupProps {
  options: VizToggleOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function VizToggleGroup({
  options,
  value,
  onChange,
  className,
}: VizToggleGroupProps) {
  return (
    <div
      className={cn(
        "flex p-1 bg-ink/[0.04] border border-ink/10 rounded-sm w-fit",
        className
      )}
    >
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-4 py-1.5 rounded-[3px] text-xs font-mono uppercase tracking-widest transition-all flex items-center gap-2",
              isActive
                ? opt.accentWhenActive
                  ? "bg-accent text-paper"
                  : "bg-paper text-ink border border-ink/10"
                : "text-tertiary hover:text-secondary"
            )}
          >
            {opt.icon && <opt.icon className="w-3 h-3" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}


// --- PLAY CONTROLS ---
interface VizPlayControlsProps {
  isPlaying: boolean;
  onToggle: () => void;
  onReset: () => void;
  size?: "sm" | "md";
  className?: string;
}

export function VizPlayControls({
  isPlaying,
  onToggle,
  onReset,
  size = "md",
  className,
}: VizPlayControlsProps) {
  const isSm = size === "sm";

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        isSm && "bg-ink/[0.04] p-1 rounded-sm border border-ink/5",
        className
      )}
    >
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center justify-center rounded-sm transition-all",
          isSm
            ? cn(
                "w-8 h-8 bg-paper border border-ink/10 hover:bg-ink hover:text-paper",
                isPlaying && "bg-ink text-paper"
              )
            : cn(
                "w-10 h-10 bg-ink text-paper hover:bg-accent",
                isPlaying && "bg-accent/10 text-accent border border-accent/20"
              )
        )}
      >
        {isPlaying ? (
          <Pause className={cn(isSm ? "w-3 h-3" : "w-4 h-4", "fill-current")} />
        ) : (
          <Play
            className={cn(isSm ? "w-3 h-3" : "w-4 h-4", "fill-current ms-0.5")}
          />
        )}
      </button>
      <button
        onClick={onReset}
        className={cn(
          "flex items-center justify-center rounded-sm border border-ink/10 text-tertiary transition-colors",
          isSm
            ? "w-8 h-8 hover:text-ink/60"
            : "w-10 h-10 hover:text-accent"
        )}
      >
        <RotateCcw className={isSm ? "w-3 h-3" : "w-4 h-4"} />
      </button>
    </div>
  );
}

// --- INSIGHT BLOCK ---
interface VizInsightSection {
  title: string;
  body: React.ReactNode;
}

interface VizInsightProps {
  title?: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
  variant?: "default" | "alert";
  sections?: VizInsightSection[];
  className?: string;
}

export function VizInsight({
  title,
  icon: Icon,
  children,
  variant = "default",
  sections,
  className,
}: VizInsightProps) {
  const isAlert = variant === "alert";

  return (
    <div
      className={cn(
        "p-5 border rounded-sm",
        isAlert
          ? "border-accent/20 bg-accent/[0.04]"
          : "border-ink/10 bg-ink/[0.02]",
        className
      )}
    >
      {(title || Icon) && !sections && (
        <div
          className={cn(
            "flex items-center gap-2 mb-2 text-xs font-mono uppercase tracking-[0.2em]",
            isAlert ? "text-accent" : "text-tertiary"
          )}
        >
          {Icon ? <Icon className="w-4 h-4 shrink-0" /> : isAlert && <AlertTriangle className="w-4 h-4 shrink-0" />}
          {title && <span>{title}</span>}
        </div>
      )}
      
      {children && (
        <div
          className={cn(
            "text-sm font-latex italic leading-relaxed",
            isAlert ? "text-accent/80" : "text-secondary"
          )}
        >
          {children}
        </div>
      )}

      {sections && (
        <div className="space-y-4">
          {sections.map((section, idx) => (
            <div
              key={section.title}
              className={cn(idx > 0 && "pt-4 border-t border-ink/[0.06]")}
            >
              <h5 className="text-xs font-mono uppercase tracking-[0.2em] text-ink mb-1">
                {section.title}
              </h5>
              <div className="text-sm font-latex italic leading-relaxed text-secondary">
                {section.body}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- STAT TILE ---
interface VizStatProps {
  label: string;
  value: string | number;
  unit?: string;
  subLabel?: string;
  description?: string;
  icon?: LucideIcon;
  topBarVariant?: "accent" | "neutral";
  progress?: number;
  className?: string;
}

export function VizStat({
  label,
  value,
  unit,
  subLabel,
  description,
  icon: Icon,
  topBarVariant = "neutral",
  progress,
  className,
}: VizStatProps) {
  return (
    <div
      className={cn(
        "px-4 py-5 bg-ink/[0.03] border border-ink/10 rounded-sm relative overflow-hidden flex flex-col justify-center",
        className
      )}
    >
      <div
        className={cn(
          "absolute top-0 start-0 w-full h-[2px]",
          topBarVariant === "accent" ? "bg-accent/30" : "bg-ink/20"
        )}
      />
      <div className="flex items-center justify-between mb-4">
        <span className="block text-xs font-mono text-tertiary uppercase tracking-[0.2em]">
          {label}
        </span>
        {Icon && <Icon className="w-3.5 h-3.5 text-tertiary opacity-40" />}
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            "font-latex tracking-tight leading-none tabular-nums",
            String(value).length > 10 ? "text-lg" : String(value).length > 7 ? "text-xl" : "text-2xl",
            topBarVariant === "accent" ? "text-accent" : "text-ink"
          )}
        >
          {value}
        </span>
        {unit && <span className="text-xs font-mono text-tertiary uppercase font-bold tracking-wider">{unit}</span>}
      </div>
      {subLabel && (
        <span className="text-xs font-mono text-tertiary uppercase mt-1 tracking-widest">
          {subLabel}
        </span>
      )}
      {description && (
        <p className="text-xs text-secondary mt-3 leading-relaxed font-latex italic opacity-70">
          {description}
        </p>
      )}
      {progress !== undefined && (
        <div className="mt-4 h-1 w-full bg-ink/10 rounded-sm overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

// --- EDITORIAL PLATE ---
interface EditorialPlateProps {
  identifier?: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  spineColor?: string;
  compact?: boolean;
  figureCaption?: { number: number; text: string; label?: string };
}

export function EditorialPlate({
  identifier,
  title,
  description,
  children,
  className,
  spineColor = "var(--color-ink)",
  compact = false,
  figureCaption,
}: EditorialPlateProps) {
  const PlateWrapper = figureCaption ? "figure" : "div";

  return (
    <PlateWrapper className={cn("w-full border-y border-ink/10", compact ? "my-8 py-7" : "my-12 py-12", figureCaption && "mx-auto max-w-3xl", className)}>
      <div className={cn("relative", compact ? "ps-0" : "ps-8")}>
        {!compact && (
          <div
            className="absolute start-0 top-0 bottom-0 w-[3px] rounded-full"
            style={{ backgroundColor: spineColor, opacity: 0.15 }}
          />
        )}
        {(title || identifier || description) && (
          <div className={compact ? "mb-5" : "mb-8"}>
            {identifier && (
              <div className="text-xs font-mono uppercase tracking-[0.3em] text-tertiary mb-2 italic">
                § {identifier}
              </div>
            )}
            {title && (
                <h4 className={cn("font-latex font-bold text-ink mb-2 tracking-tight", compact ? "text-xl" : "text-2xl")}>
                {title}
              </h4>
            )}
            {description && (
              <p className="text-sm text-secondary max-w-2xl leading-relaxed font-latex italic">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="bg-paper border border-ink/10 rounded-sm overflow-hidden relative">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(var(--color-ink) 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }} />
          {children}
        </div>
      </div>
      {figureCaption && (
        <figcaption className="mt-3 w-full text-start font-serif text-base leading-relaxed text-secondary">
          <span className="font-bold text-ink">{figureCaption.label || 'Figure'} {figureCaption.number}:</span> {figureCaption.text}
        </figcaption>
      )}
    </PlateWrapper>
  );
}

// --- COUNTER ---
interface VizCounterProps {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  duration?: number;
}

export function VizCounter({
  value,
  decimals = 1,
  suffix = "",
  prefix = "",
  className,
  duration = 1,
}: VizCounterProps) {
  const [displayValue, setDisplayValue] = React.useState(value);
  const previousValue = React.useRef(value);

  React.useEffect(() => {
    const controls = animate(previousValue.current, value, {
      duration: duration,
      ease: [0.33, 1, 0.68, 1], // easeOutQuart
      onUpdate: (latest) => setDisplayValue(latest),
      onComplete: () => {
        previousValue.current = value;
      },
    });
    return () => controls.stop();
  }, [value, duration]);

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}
      {displayValue.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
