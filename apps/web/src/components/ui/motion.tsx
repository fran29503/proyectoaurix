"use client";

import { motion, type HTMLMotionProps, AnimatePresence } from "framer-motion";
import { forwardRef } from "react";

// Animation presets
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  fadeInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  slideInFromLeft: {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  },
  slideInFromRight: {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  },
  slideInFromBottom: {
    initial: { y: "100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
};

// Spring transition preset
export const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

// Smooth transition preset
export const smoothTransition = {
  duration: 0.4,
  ease: [0.16, 1, 0.3, 1] as const,
};

// Fast transition preset
export const fastTransition = {
  duration: 0.2,
  ease: [0.16, 1, 0.3, 1] as const,
};

// Stagger children configuration
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// Fade In component
interface FadeInProps extends HTMLMotionProps<"div"> {
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
}

export const FadeIn = forwardRef<HTMLDivElement, FadeInProps>(
  ({ children, delay = 0, direction = "up", duration = 0.5, ...props }, ref) => {
    const directionOffset = {
      up: { y: 20 },
      down: { y: -20 },
      left: { x: 20 },
      right: { x: -20 },
      none: {},
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, ...directionOffset[direction] }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{
          duration,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
FadeIn.displayName = "FadeIn";

// Scale In component
interface ScaleInProps extends HTMLMotionProps<"div"> {
  delay?: number;
  duration?: number;
}

export const ScaleIn = forwardRef<HTMLDivElement, ScaleInProps>(
  ({ children, delay = 0, duration = 0.4, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
ScaleIn.displayName = "ScaleIn";

// Stagger container component
interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  staggerDelay?: number;
  initialDelay?: number;
}

export const StaggerContainer = forwardRef<HTMLDivElement, StaggerContainerProps>(
  ({ children, staggerDelay = 0.05, initialDelay = 0.1, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial="initial"
        animate="animate"
        variants={{
          initial: {},
          animate: {
            transition: {
              staggerChildren: staggerDelay,
              delayChildren: initialDelay,
            },
          },
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
StaggerContainer.displayName = "StaggerContainer";

// Stagger item component
interface StaggerItemProps extends HTMLMotionProps<"div"> {
  direction?: "up" | "down" | "left" | "right";
}

export const StaggerItem = forwardRef<HTMLDivElement, StaggerItemProps>(
  ({ children, direction = "up", ...props }, ref) => {
    const directionOffset = {
      up: { y: 20, x: 0 },
      down: { y: -20, x: 0 },
      left: { x: 20, y: 0 },
      right: { x: -20, y: 0 },
    };

    return (
      <motion.div
        ref={ref}
        variants={{
          initial: { opacity: 0, ...directionOffset[direction] },
          animate: { opacity: 1, y: 0, x: 0 },
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
StaggerItem.displayName = "StaggerItem";

// Hover scale component
interface HoverScaleProps extends HTMLMotionProps<"div"> {
  scale?: number;
}

export const HoverScale = forwardRef<HTMLDivElement, HoverScaleProps>(
  ({ children, scale = 1.02, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{ scale }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
HoverScale.displayName = "HoverScale";

// Hover lift component (lift up with shadow)
interface HoverLiftProps extends HTMLMotionProps<"div"> {
  liftAmount?: number;
}

export const HoverLift = forwardRef<HTMLDivElement, HoverLiftProps>(
  ({ children, liftAmount = -4, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={className}
        whileHover={{
          y: liftAmount,
          transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
        }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
HoverLift.displayName = "HoverLift";

// Page transition wrapper
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Number counter animation
interface CounterProps {
  value: number;
  duration?: number;
  className?: string;
  formatFn?: (value: number) => string;
}

export function Counter({
  value,
  duration = 1,
  className,
  formatFn = (v) => v.toLocaleString(),
}: CounterProps) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={value}
      >
        {formatFn(value)}
      </motion.span>
    </motion.span>
  );
}

// Presence animation wrapper
interface PresenceProps {
  children: React.ReactNode;
  show: boolean;
  animation?: keyof typeof animations;
}

export function Presence({
  children,
  show,
  animation = "fadeInUp",
}: PresenceProps) {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          {...animations[animation]}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Export AnimatePresence for use in other components
export { AnimatePresence, motion };
