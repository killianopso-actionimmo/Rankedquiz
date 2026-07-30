"use client";

import { Ladder } from "@/components/Ladder";
import { Trophy3D } from "@/components/three-d/Trophy3D";
import { Badge3D } from "@/components/three-d/Badge3D";
import { Flame3D } from "@/components/three-d/Flame3D";
import { Reveal } from "@/components/scroll/Reveal";

const PIECES = [
  { key: "trophy", label: "Classement", node: <Trophy3D />, group: "t3d-g" },
  { key: "badge", label: "Succès", node: <Badge3D />, group: "b3d-g" },
  { key: "flame", label: "Série", node: <Flame3D />, group: "f3d-g" },
];

export default function LeaderboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Reveal direction="up" distance={18}>
        <div className="flex items-end justify-center gap-6 px-4 pb-2 pt-8 sm:gap-12 sm:pt-10">
          {PIECES.map((p) => (
            <div key={p.key} className={`${p.group} flex flex-col items-center gap-3`}>
              {p.node}
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft sm:text-xs">
                {p.label}
              </span>
            </div>
          ))}
        </div>
      </Reveal>

      <Ladder />
    </div>
  );
}
