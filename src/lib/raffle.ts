export function parseNames(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    const n = line.trim().replace(/\s+/g, " ");
    if (!n || seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}

export function encodeNames(names: string[]): string {
  const bytes = new TextEncoder().encode(JSON.stringify(names));
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeNames(code: string): string[] {
  try {
    const b64 = code.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const arr = JSON.parse(new TextDecoder().decode(bytes));
    return Array.isArray(arr) ? parseNames(arr.map(String).join("\n")) : [];
  } catch {
    return [];
  }
}

function randInt(max: number): number {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0]! % max;
}

/** Picks two different names from those not yet used. Returns null if fewer than 2 remain. */
export function pickPair(names: string[], used: string[]): [string, string] | null {
  const pool = names.filter((n) => !used.includes(n));
  if (pool.length < 2) return null;
  const i = randInt(pool.length);
  let j = randInt(pool.length - 1);
  if (j >= i) j++;
  return [pool[i]!, pool[j]!];
}

export function randomName(names: string[]): string {
  return names[randInt(names.length)] ?? "";
}
