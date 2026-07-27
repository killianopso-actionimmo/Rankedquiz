"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/** Tweens a displayed number toward `target` whenever it changes. Not DOM-scoped, so a plain effect + tween.kill() cleanup is enough (no gsap.context needed). */
export function useCountUp(target: number, duration = 0.8): number {
  const [value, setValue] = useState(target);
  const proxy = useRef({ val: target });

  useEffect(() => {
    const obj = proxy.current;
    const tween = gsap.to(obj, {
      val: target,
      duration,
      ease: "power2.out",
      onUpdate: () => setValue(Math.round(obj.val)),
    });
    return () => {
      tween.kill();
    };
  }, [target, duration]);

  return value;
}
