import { useState } from "react";
import { randomName } from "@/lib/raffle";

export function FlyingNames({ names }: { names: string[] }) {
  const [labels, setLabels] = useState(() => Array.from({ length: 8 }, (_, i) => names[i] ?? ""));

  return (
    <div className="flying-names pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {labels.map((name, i) => (
        <span
          key={i}
          className={`flying-name flying-lane-${i % 4} ${i % 2 === 0 ? "flying-forward" : "flying-backward"}`}
          style={{ animationDelay: `${-(i * 1.3)}s`, animationDuration: `${5 + (i % 3)}s` }}
          onAnimationIteration={() => setLabels((current) => current.map((label, j) => j === i ? randomName(names) : label))}
        >
          {name}
        </span>
      ))}
    </div>
  );
}