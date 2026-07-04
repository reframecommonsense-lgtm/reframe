"use client";

import { useEffect, useRef, useState } from "react";

interface StrikeThroughProps {
  children: React.ReactNode;
}

export function StrikeThrough({ children }: StrikeThroughProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [struck, setStruck] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStruck(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className="relative inline-block">
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 bg-(--color-vermilion)"
        style={{
          height: 2,
          width: "100%",
          transformOrigin: "left",
          transform: struck ? "scaleX(1)" : "scaleX(0)",
          transition: "transform var(--duration-strike) var(--ease-brush)",
        }}
      />
    </span>
  );
}
