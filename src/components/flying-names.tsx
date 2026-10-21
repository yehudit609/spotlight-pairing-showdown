import { useState } from "react";
import { randomName } from "@/lib/raffle";

type Flyer = { id: number; name: string; x1: number; y1: number; x2: number; y2: number; r1: number; r2: number; dur: number; delay: number; gold: boolean };

// Even spread: the screen is divided into a grid of cells; flyers pop up in
// cells taken from a shuffled bag so every area gets its turn, and cells too
// close to the countdown circle (screen center) are never used.
const COLS = 6, ROWS = 4, EXCLUDE_R = 24;
type Cell = { x: number; y: number };
const ALL_CELLS: Cell[] = [];
for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    const x = ((col + 0.5) / COLS) * 100;
    const y = ((row + 0.5) / ROWS) * 100;
    const dx = x - 50, dy = y - 50;
    if (Math.sqrt(dx * dx + dy * dy) > EXCLUDE_R) ALL_CELLS.push({ x, y });
  }
}

let bag: Cell[] = [];
function nextCell(): Cell {
  if (bag.length === 0) {
    bag = [...ALL_CELLS];
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
  }
  return bag.pop()!;
}

function jitter(cell: Cell): Cell {
  const halfW = 100 / COLS / 2, halfH = 100 / ROWS / 2;
  let x = cell.x + (Math.random() * 1.4 - 0.7) * halfW;
  let y = cell.y + (Math.random() * 1.4 - 0.7) * halfH;
  const dx = x - 50, dy = y - 50;
  if (Math.sqrt(dx * dx + dy * dy) <= EXCLUDE_R) {
    // Keep jittered points outside the exclusion circle around the counter.
    const ang = Math.atan2(dy, dx);
    x = 50 + Math.cos(ang) * (EXCLUDE_R + 3);
    y = 50 + Math.sin(ang) * (EXCLUDE_R + 3);
  }
  return { x: Math.min(98, Math.max(2, x)), y: Math.min(96, Math.max(4, y)) };
}

function makeFlyer(names: string[], delay = 0): Flyer {
  const r = Math.random;
  return {
    id: seq++, name: randomName(names),
    ...(() => { const c1 = nextCell(), c2 = nextCell(); const p1 = jitter(c1), p2 = jitter(c2); return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y }; })(),
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
