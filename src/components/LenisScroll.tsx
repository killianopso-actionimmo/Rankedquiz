"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function LenisScroll() {
  useEffect(() => {
    // Initialize Lenis with autoRaf: true for automatic RAF integration
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      autoRaf: true, // Automatically uses requestAnimationFrame
    });

    // No need to call raf loop manually since autoRaf: true handles it

    return () => {
      lenis.destroy();
    };
  }, []);

  return null;
}
