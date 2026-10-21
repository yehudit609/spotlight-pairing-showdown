import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { pickPair } from "@/lib/raffle";
import { DEFAULT_NAMES } from "@/lib/participants";
import { FlyingNames } from "@/components/flying-names";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "מוכנות? קדימה!!!" },
      { name: "description", content: "לחצו על הגרל וגלו מי יתמודד מול מי." },
      { property: "og:title", content: "מוכנות? קדימה!!!" },
      { property: "og:description", content: "לחצו על הגרל וגלו מי יתמודד מול מי." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Draw,
});

type Phase = "idle" | "counting" | "result";

function Draw() {
  const names = DEFAULT_NAMES;
  const storeKey = "raffle-used-preset";
  const [pairs, setPairs] = useState<[string, string][]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [count, setCount] = useState(10);
  const [result, setResult] = useState<[string, string] | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    try { setPairs(JSON.parse(localStorage.getItem(storeKey) ?? "[]")); } catch { setPairs([]); }
  }, [storeKey]);
  useEffect(() => () => timers.current.forEach(clearInterval), []);

  const used = pairs.flat();
  const remaining = names.filter((n) => !used.includes(n)).length;

  const start = () => {
    const pair = pickPair(names, used);
    if (!pair) return;
    setPhase("counting");
    setResult(null);
    setCount(10);
    let c = 10;
    const cd = window.setInterval(() => {
      c--;
      if (c <= 0) {
        clearInterval(cd);
        const next = [...pairs, pair];
        setPairs(next);
        localStorage.setItem(storeKey, JSON.stringify(next));
        setResult(pair);
        setPhase("result");
      } else setCount(c);
    }, 1000);
    timers.current = [cd];
  };

  const reset = () => {
    if (!confirm("לאפס את כל ההגרלות?")) return;
    setPairs([]); localStorage.removeItem(storeKey); setResult(null); setPhase("idle");
  };

  const R = 88, C = 2 * Math.PI * R;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center px-4 py-10 text-center">
      <div className="ornament">✦ ✦ ✦</div>
      <h1 id="raffle-title" className="relative z-10 font-display text-4xl font-black text-primary sm:text-6xl">מוכנות? קדימה!!!</h1>
      <div className="gold-rule mt-4" />

      <section className="relative mt-10 flex min-h-[440px] w-full flex-col items-center justify-center">
        {phase === "idle" && (
          remaining < 2 ? (
            <p className="card-festive p-6 text-xl">{remaining === 1 ? "נשאר משתתף אחד בלבד — אין מספיק משתתפים להתמודדות נוספת." : "כל המשתתפים כבר הוגרלו."}</p>
          ) : (
            <Button onClick={start} className="btn-gold btn-hero h-auto">הגרל</Button>
          )
        )}

        {phase === "counting" && (
          <>
            <FlyingNames names={names.filter((name) => !used.includes(name))} />
            <div id="raffle-ring" className="relative z-10 h-56 w-56" role="status" aria-label={`ההגרלה בעוד ${count} שניות`}>
              <svg viewBox="0 0 200 200" className="absolute inset-0 -rotate-90">
                <circle cx="100" cy="100" r={R} className="ring-track" />
                <circle key={count} cx="100" cy="100" r={R} className="ring-fill" strokeDasharray={C} style={{ ["--c" as string]: C }} />
              </svg>
              <span key={`n${count}`} className="count-num absolute inset-0 flex items-center justify-center font-display text-8xl font-black text-primary">{count}</span>
            </div>
          </>
        )}

        {phase === "result" && result && (
          <>
            <Confetti />
            <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
              <div className="name-card enter-right">{result[0]}</div>
              <div className="vs enter-pop">מול</div>
              <div className="name-card enter-left">{result[1]}</div>
            </div>
            <div className="mt-10">
              {remaining >= 2 ? (
                <Button onClick={start} className="btn-gold h-auto px-10 py-4 text-2xl">הגרל שוב</Button>
              ) : (
                <p className="text-lg text-muted-foreground">{remaining === 1 ? "נשאר משתתף אחד בלבד — אין מספיק משתתפים להתמודדות נוספת." : "כל המשתתפים הוגרלו."}</p>
              )}
            </div>
          </>
        )}
      </section>

      {pairs.length > 0 && (
        <section className="card-festive mt-12 w-full max-w-md p-5 text-right">
          <h2 className="font-display text-xl font-bold text-primary">התמודדויות שהוגרלו</h2>
          <ol className="mt-3 space-y-1.5">
            {pairs.map(([a, b], i) => (
              <li key={i} className="flex gap-2 border-b border-border pb-1.5 last:border-0">
                <span className="text-gold-deep font-bold">{i + 1}.</span>
                <span>{a} <span className="text-muted-foreground">מול</span> {b}</span>
              </li>
            ))}
          </ol>
          <Button variant="outline" onClick={reset} disabled={phase === "counting"} className="btn-outline mt-4 h-auto px-4 py-2 text-sm">איפוס</Button>
        </section>
      )}
    </main>
  );
}

function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    left: Math.random() * 100, delay: Math.random() * 1.5, dur: 2.5 + Math.random() * 2, gold: i % 3 !== 0, rot: Math.random() * 360,
  })), []);
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span key={i} className={`confetti ${p.gold ? "bg-gold" : "bg-primary"}`} style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, rotate: `${p.rot}deg` }} />
      ))}
    </div>
  );
}
