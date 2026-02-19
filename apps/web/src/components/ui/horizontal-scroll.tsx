"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
  /** Additional classes for the scrollable inner container */
  innerClassName?: string;
  /** Scroll amount in pixels per click (default 300) */
  scrollAmount?: number;
  /** Arrow button size variant */
  arrowSize?: "sm" | "md";
  /** Tailwind gradient class for edge fade (e.g. "from-slate-50") */
  fadeFrom?: string;
}

export function HorizontalScroll({
  children,
  className,
  innerClassName,
  scrollAmount = 300,
  arrowSize = "md",
  fadeFrom = "from-white dark:from-slate-950",
}: HorizontalScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();

    el.addEventListener("scroll", checkScroll, { passive: true });
    const observer = new ResizeObserver(checkScroll);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      observer.disconnect();
    };
  }, [checkScroll]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = direction === "left" ? -scrollAmount : scrollAmount;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  const isSmall = arrowSize === "sm";

  return (
    <div className={cn("relative group/scroll", className)}>
      {/* Left arrow */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 z-10 flex items-center pointer-events-none transition-opacity duration-200",
          canScrollLeft ? "opacity-100" : "opacity-0"
        )}
      >
        <button
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className={cn(
            "pointer-events-auto flex items-center justify-center rounded-full",
            "bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm",
            "border border-slate-200 dark:border-slate-700",
            "shadow-lg shadow-black/5",
            "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
            "hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300",
            "transition-all duration-200 hover:scale-105 active:scale-95",
            "disabled:opacity-0 disabled:pointer-events-none",
            isSmall ? "h-7 w-7 ml-1" : "h-8 w-8 ml-1.5"
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft className={isSmall ? "h-3.5 w-3.5" : "h-4 w-4"} />
        </button>
      </div>

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        className={cn(
          "overflow-x-auto scrollbar-thin",
          innerClassName
        )}
        style={{ scrollbarWidth: "thin" }}
      >
        {children}
      </div>

      {/* Right arrow */}
      <div
        className={cn(
          "absolute right-0 top-0 bottom-0 z-10 flex items-center pointer-events-none transition-opacity duration-200",
          canScrollRight ? "opacity-100" : "opacity-0"
        )}
      >
        <button
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className={cn(
            "pointer-events-auto flex items-center justify-center rounded-full",
            "bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm",
            "border border-slate-200 dark:border-slate-700",
            "shadow-lg shadow-black/5",
            "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
            "hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300",
            "transition-all duration-200 hover:scale-105 active:scale-95",
            "disabled:opacity-0 disabled:pointer-events-none",
            isSmall ? "h-7 w-7 mr-1" : "h-8 w-8 mr-1.5"
          )}
          aria-label="Scroll right"
        >
          <ChevronRight className={isSmall ? "h-3.5 w-3.5" : "h-4 w-4"} />
        </button>
      </div>

      {/* Fade edges when scrollable */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r to-transparent pointer-events-none transition-opacity duration-200 z-[5]",
          fadeFrom,
          canScrollLeft ? "opacity-100" : "opacity-0"
        )}
      />
      <div
        className={cn(
          "absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l to-transparent pointer-events-none transition-opacity duration-200 z-[5]",
          fadeFrom,
          canScrollRight ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}
