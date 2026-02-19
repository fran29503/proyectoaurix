"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  scrollAmount?: number;
  arrowSize?: "sm" | "md";
}

export function HorizontalScroll({
  children,
  className,
  innerClassName,
  scrollAmount = 300,
  arrowSize = "md",
}: HorizontalScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [cursorZone, setCursorZone] = useState<"left" | "right" | "center" | "out">("out");

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

  // Track cursor position relative to the container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const edgeZone = 64; // px from edge to trigger arrow

      if (x < edgeZone) {
        setCursorZone("left");
      } else if (x > rect.width - edgeZone) {
        setCursorZone("right");
      } else {
        setCursorZone("center");
      }
    };

    const handleMouseLeave = () => {
      setCursorZone("out");
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = direction === "left" ? -scrollAmount : scrollAmount;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  const showLeft = canScrollLeft && cursorZone === "left";
  const showRight = canScrollRight && cursorZone === "right";
  const isSmall = arrowSize === "sm";

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Left zone — clickable area + arrow */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 z-10 flex items-center",
          "transition-opacity duration-300 ease-out",
          showLeft ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <button
          onClick={() => scroll("left")}
          className={cn(
            "flex items-center justify-center cursor-pointer",
            "text-slate-400 hover:text-violet-500",
            "transition-all duration-200 hover:scale-110 active:scale-90",
            isSmall ? "h-10 w-8 ml-0.5" : "h-12 w-10 ml-1"
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft
            className={cn(
              "drop-shadow-sm",
              isSmall ? "h-4 w-4" : "h-5 w-5"
            )}
            strokeWidth={2.5}
          />
        </button>
      </div>

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        className={cn("overflow-x-auto", innerClassName)}
        style={{ scrollbarWidth: "thin" }}
      >
        {children}
      </div>

      {/* Right zone — clickable area + arrow */}
      <div
        className={cn(
          "absolute right-0 top-0 bottom-0 z-10 flex items-center",
          "transition-opacity duration-300 ease-out",
          showRight ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <button
          onClick={() => scroll("right")}
          className={cn(
            "flex items-center justify-center cursor-pointer",
            "text-slate-400 hover:text-violet-500",
            "transition-all duration-200 hover:scale-110 active:scale-90",
            isSmall ? "h-10 w-8 mr-0.5" : "h-12 w-10 mr-1"
          )}
          aria-label="Scroll right"
        >
          <ChevronRight
            className={cn(
              "drop-shadow-sm",
              isSmall ? "h-4 w-4" : "h-5 w-5"
            )}
            strokeWidth={2.5}
          />
        </button>
      </div>
    </div>
  );
}
