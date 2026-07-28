"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { JetpunkItem } from "@/types/quiz";

interface JetpunkGridProps {
  items: JetpunkItem[];
  foundIds: Set<string>;
  revealed: boolean;
}

export function JetpunkGrid({ items, foundIds, revealed }: JetpunkGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {items.map((item) => {
        const isFound = foundIds.has(item.id);
        const showAnswer = isFound || revealed;

        return (
          <motion.div
            key={item.id}
            initial={false}
            animate={isFound ? { scale: [1, 1.06, 1] } : {}}
            transition={{ duration: 0.3 }}
            className={cn(
              "flex min-h-[3.75rem] flex-col items-center justify-center rounded-xl border px-2 py-2 text-center shadow-card",
              isFound
                ? "border-success/50 bg-success-bg"
                : revealed
                  ? "border-danger/40 bg-danger-bg"
                  : "border-black/[0.06] bg-white"
            )}
          >
            {showAnswer ? (
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-xs font-medium text-ink-faint">
                  {item.hint ?? "?"}
                </span>
                <span className="flex items-center gap-1 font-display text-sm font-bold text-ink">
                  {isFound && <Check className="h-3.5 w-3.5 shrink-0 text-success" />}
                  {item.answers[0]}
                </span>
              </div>
            ) : (
              <span className="text-xs font-medium text-ink-faint">
                {item.hint ?? "?"}
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
