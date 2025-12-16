"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import React, { createContext, useCallback, useContext, useRef, useState } from "react";

type NavigationDirection = "forward" | "back" | "none";

interface NavigationContextType {
  direction: NavigationDirection;
  navigateTo: (path: string) => void;
  navigateBack: () => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return context;
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [direction, setDirection] = useState<NavigationDirection>("none");
  const historyStack = useRef<string[]>([]);
  const pathname = usePathname();

  // Track current page in history
  React.useEffect(() => {
    if (historyStack.current[historyStack.current.length - 1] !== pathname) {
      if (direction === "forward" || direction === "none") {
        historyStack.current.push(pathname);
      }
    }
  }, [pathname, direction]);

  const navigateTo = useCallback((path: string) => {
    setDirection("forward");
    historyStack.current.push(path);
    router.push(path);
  }, [router]);

  const navigateBack = useCallback(() => {
    setDirection("back");
    historyStack.current.pop();
    router.back();
  }, [router]);

  return (
    <NavigationContext.Provider value={{ direction, navigateTo, navigateBack }}>
      {children}
    </NavigationContext.Provider>
  );
}

// Page transition variants
const pageVariants = {
  initial: (direction: NavigationDirection) => ({
    x: direction === "forward" ? "100%" : direction === "back" ? "-100%" : 0,
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: "spring" as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  },
  exit: (direction: NavigationDirection) => ({
    x: direction === "forward" ? "-100%" : direction === "back" ? "100%" : 0,
    opacity: 0,
    transition: {
      x: { type: "spring" as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  }),
};

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  const pathname = usePathname();
  const context = useContext(NavigationContext);
  const direction = context?.direction || "none";

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        custom={direction}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={`min-h-screen ${className}`}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
