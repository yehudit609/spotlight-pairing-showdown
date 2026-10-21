import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { parseNames, encodeNames } from "@/lib/raffle";
import { DEFAULT_NAMES } from "@/lib/participants";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ניהול הגרלה — מוכנות? קדימה!!!" },
      { name: "description", content: "הזינו רשימת משתתפים וצרו קישור להגרלת התמודדות." },
      { property: "og:title", content: "ניהול הגרלה — מוכנות? קדימה!!!" },
      { property: "og:description", content: "הזינו רשימת משתתפים וצרו קישור להגרלה." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
});

const KEY = "raffle-admin-list-preset-2026-10-21";

function Admin() {
  const [text, setText] = useState(DEFAULT_NAMES.join("\n"));
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const names = useMemo(() => parseNames(text), [text]);

  useEffect(() => {
    setText(localStorage.getItem(KEY) ?? DEFAULT_NAMES.join("\n"));
  }, []);

  const save = () => {
    localStorage.setItem(KEY, names.join("\n"));
    setText(names.join("\n"));
    setLink(`${window.location.origin}/draw#${encodeNames(names)}`);
    setCopied(false);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
  };

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-10">
      <h1 className="font-display text-4xl font-bold text-primary">ניהול הגרלה</h1>
      <p className="mt-2 text-muted-foreground">הזינו שם אחד בכל שורה. שורות ריקות ושמות כפולים מסוננים אוטומטית.</p>

      <div className="card-festive mt-6 p-5">
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setLink(""); }}
          rows={14}
          placeholder={"שם ראשון\nשם שני\n..."}
          className="w-full resize-y rounded-lg border border-input bg-background p-4 text-lg leading-relaxed outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-lg">
            <b className="text-primary">{names.length}</b> שמות הוזנו
          </span>
          <Button onClick={save} disabled={names.length < 2} className="btn-gold h-auto px-6 py-3 text-lg">
            שמור וצור קישור
          </Button>
        </div>
        {names.length < 2 && text.trim() && (
          <p className="mt-2 text-sm text-destructive">נדרשים לפחות 2 שמות.</p>
        )}
      </div>

      {link && (
        <div className="card-festive mt-6 p-5">
          <p className="font-semibold text-primary">הקישור להגרלה מוכן:</p>
          <input readOnly value={link} dir="ltr" className="mt-2 w-full rounded-lg border border-input bg-muted p-3 text-sm" onFocus={(e) => e.target.select()} />
          <div className="mt-3 flex flex-wrap gap-3">
            <Button onClick={copy} className="btn-primary h-auto px-5 py-2.5">{copied ? "הועתק ✓" : "העתק קישור"}</Button>
            <a href={link} target="_blank" rel="noreferrer" className="btn-outline px-5 py-2.5">פתח תצוגה</a>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">הרשימה שמורה בתוך הקישור עצמו. אחרי עריכה, שמרו שוב ושלחו את הקישור החדש.</p>
        </div>
      )}
      <Link to="/draw" className="sr-only">הגרלה</Link>
    </main>
  );
}
