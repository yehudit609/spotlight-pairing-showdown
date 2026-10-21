import { useEffect, useState } from "react";
import { randomName } from "@/lib/raffle";

// Presentation only: names pop up in place, stay still, and fade out within 2s.
// Positions avoid the title (#raffle-title) and countdown ring (#raffle-ring).
type Flyer = { id: number; name: string; x: number; y: number; size: number; delay: number; gold: boolean };

let seq = 0;
const DUR = 2;

function blocked(): DOMRect[] {
  return ["raffle-title", "raffle-ring"]
    .map((id) => document.getElementById(id)?.getBoundingClientRect())
    .filter((r): r is DOMRect => !!r);
}

function makeFlyer(names: string[], others: Flyer[], delay: number): Flyer {
  const w = window.innerWidth, h = window.innerHeight;
  const rects = blocked();
  const name = randomName(names);
  let best: Flyer | null = null;
  for (let t = 0; t < 40; t++) {
    const size = 1 + Math.random() * 2.2; // rem
    const px = size * 16;
    const halfW = (name.length * px * 0.55) / 2 + 8, halfH = px * 0.7;
    const x = halfW + Math.random() * Math.max(1, w - 2 * halfW);
    const y = halfH + Math.random() * Math.max(1, h - 2 * halfH);
    const pad = 12;
    const hit = rects.some((r) => x + halfW > r.left - pad && x - halfW < r.right + pad && y + halfH > r.top - pad && y - halfH < r.bottom + pad);
    if (hit) continue;
    const crowd = others.some((o) => Math.abs(o.x - x) < halfW * 1.5 && Math.abs(o.y - y) < halfH * 2);
    best = { id: seq++, name, x, y, size, delay, gold: Math.random() < 0.4 };
    if (!crowd) break;
  }
  return best ?? { id: seq++, name, x: -9999, y: -9999, size: 1, delay, gold: false };
}

export function FlyingNames({ names }: { names: string[] }) {
  const [flyers, setFlyers] = useState<Flyer[]>([]);

  useEffect(() => {
    const list: Flyer[] = [];
    for (let i = 0; i < 10; i++) list.push(makeFlyer(names, list, Math.random() * 1.6));
    setFlyers(list);
  }, [names]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {flyers.map((f, i) => (
        <span
          key={f.id}
          className={`flying-name ${f.gold ? "text-gold-deep" : ""}`}
          style={{ left: f.x, top: f.y, fontSize: `${f.size}rem`, animationDuration: `${DUR}s`, animationDelay: `${f.delay}s` }}
          onAnimationEnd={() => setFlyers((cur) => cur.map((c, j) => (j === i ? makeFlyer(names, cur.filter((_, k) => k !== i), Math.random() * 0.3) : c)))}
        >
          {f.name}
        </span>
      ))}
    </div>
  );
}
