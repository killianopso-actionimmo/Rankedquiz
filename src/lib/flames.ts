import gsap from "gsap";

function spawnFlameBurst(originXPct: number, originYPct: number, count: number) {
  if (typeof window === "undefined") return;

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.inset = "0";
  container.style.pointerEvents = "none";
  container.style.zIndex = "9999";
  document.body.appendChild(container);

  const originX = window.innerWidth * originXPct;
  const originY = window.innerHeight * originYPct;

  const particles: HTMLSpanElement[] = [];
  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.textContent = "🔥";
    el.style.position = "absolute";
    el.style.left = `${originX}px`;
    el.style.top = `${originY}px`;
    el.style.fontSize = `${16 + Math.random() * 18}px`;
    el.style.willChange = "transform, opacity";
    container.appendChild(el);
    particles.push(el);
  }

  gsap.set(particles, { xPercent: -50, yPercent: -50, scale: 0, opacity: 1 });

  particles.forEach((el) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 140;
    const x = Math.cos(angle) * distance;
    const riseY = -(100 + Math.random() * 160);

    gsap
      .timeline({ onComplete: () => el.remove() })
      .to(el, {
        x,
        y: riseY * 0.3,
        scale: 1 + Math.random() * 0.6,
        rotation: (Math.random() - 0.5) * 60,
        duration: 0.35,
        ease: "back.out(2)",
      })
      .to(
        el,
        {
          y: riseY,
          opacity: 0,
          scale: 0.4,
          duration: 0.7 + Math.random() * 0.4,
          ease: "power1.out",
        },
        "-=0.05"
      );
  });

  gsap.delayedCall(2, () => container.remove());
}

/** Small flame burst for in-game milestones (streaks, correct answers). */
export function fireFlameBurst() {
  spawnFlameBurst(0.5, 0.65, 16);
}

/** Bigger flame burst for match/game completion. */
export function fireVictoryFlameBurst() {
  spawnFlameBurst(0.5, 0.55, 28);
}
