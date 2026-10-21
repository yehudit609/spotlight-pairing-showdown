import { useState } from "react";
import { randomName } from "@/lib/raffle";

type Flyer = { id: number; name: string; x1: number; y1: number; x2: number; y2: number; r1: number; r2: number; dur: number; delay: number; gold: boolean };

let seq = 0;
function makeFlyer(names: string[], delay = 0): Flyer {
  const r = Math.random;
  return {
    id: seq++, name: randomName(names),
    x1: r() * 90 + 5, y1: r() * 90 + 5, x2: r() * 90 + 5, y2: r() * 90 + 5,
    r1: r() * 40 - 20, r2: r() * 40 - 20,
    dur: 1.2 + r() * 0.8, delay, gold: r() < 0.4,
  };
}

export function FlyingNames({ names }: { names: string[] }) {
  const [flyers, setFlyers] = useState(() => Array.from({ length: 9 }, (_, i) => makeFlyer(names, Math.random() * 1.5 + i * 0.05)));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {flyers.map((f, i) => (
        <span
          key={f.id}
          className={`flying-name ${f.gold ? "text-gold-deep" : ""}`}
          style={{
            ["--x1" as string]: `${f.x1}%`, ["--y1" as string]: `${f.y1}%`,
            ["--x2" as string]: `${f.x2}%`, ["--y2" as string]: `${f.y2}%`,
            ["--r1" as string]: `${f.r1}deg`, ["--r2" as string]: `${f.r2}deg`,
            animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s`,
          }}
          onAnimationEnd={() => setFlyers((cur) => cur.map((c, j) => (j === i ? makeFlyer(names, Math.random() * 0.4) : c)))}
        >
          {f.name}
        </span>
      ))}
    </div>
  );
}
