/**
 * localStorage-backed address books. Two books — `from` (return/send addresses)
 * and `to` (delivery addresses) — each a list of entries with an optional
 * nickname. All access is guarded for SSR/prerender and tolerant of errors.
 */

export interface BookEntry {
  id: string;
  nickname?: string;
  text: string;
  usedAt: number;
}

export type BookKind = "from" | "to";

const bookKey = (kind: BookKind) => `print-template:book:${kind}`;
const OLD_FROM_KEY = "print-template:fromAddress";
const OLD_TO_KEY = "print-template:addressBook";
const LIMIT = 100;

function hasStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

function norm(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

function makeId(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {
    // fall through
  }
  return `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

function isEntry(e: unknown): e is BookEntry {
  return (
    typeof e === "object" &&
    e !== null &&
    typeof (e as BookEntry).id === "string" &&
    typeof (e as BookEntry).text === "string" &&
    typeof (e as BookEntry).usedAt === "number"
  );
}

function read(kind: BookKind): BookEntry[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(bookKey(kind));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isEntry) : [];
  } catch {
    return [];
  }
}

function write(kind: BookKind, entries: BookEntry[]): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(
      bookKey(kind),
      JSON.stringify(entries.slice(0, LIMIT)),
    );
  } catch {
    // ignore quota / disabled storage
  }
}

let migrated = false;
function migrateOnce(): void {
  if (migrated || !hasStorage()) return;
  migrated = true;
  try {
    const oldFrom = window.localStorage.getItem(OLD_FROM_KEY);
    if (oldFrom && oldFrom.trim()) {
      const from = read("from");
      if (!from.some((e) => norm(e.text) === norm(oldFrom))) {
        write("from", [
          { id: makeId(), text: oldFrom.trim(), usedAt: Date.now() },
          ...from,
        ]);
      }
    }
    window.localStorage.removeItem(OLD_FROM_KEY);
  } catch {
    // ignore
  }
  try {
    const oldRaw = window.localStorage.getItem(OLD_TO_KEY);
    if (oldRaw) {
      const old: unknown = JSON.parse(oldRaw);
      if (Array.isArray(old)) {
        const to = read("to");
        const seen = new Set(to.map((e) => norm(e.text)));
        const additions: BookEntry[] = [];
        for (const e of old) {
          const text = typeof e?.text === "string" ? e.text.trim() : "";
          if (!text || seen.has(norm(text))) continue;
          seen.add(norm(text));
          additions.push({
            id: makeId(),
            text,
            usedAt: typeof e?.usedAt === "number" ? e.usedAt : Date.now(),
          });
        }
        if (additions.length) write("to", [...additions, ...to]);
      }
    }
    window.localStorage.removeItem(OLD_TO_KEY);
  } catch {
    // ignore
  }
}

/** Entries for a book, most-recently-used first. */
export function loadBook(kind: BookKind): BookEntry[] {
  migrateOnce();
  return read(kind).sort((a, b) => b.usedAt - a.usedAt);
}

/** The most-recently-used entry, if any. */
export function latestEntry(kind: BookKind): BookEntry | undefined {
  return loadBook(kind)[0];
}

/** Add or update (by normalized text) an entry; bumps usedAt. */
export function saveToBook(
  kind: BookKind,
  text: string,
  nickname?: string,
): BookEntry[] {
  const trimmed = text.trim();
  if (!hasStorage() || !trimmed) return loadBook(kind);
  const key = norm(trimmed);
  const existing = read(kind);
  const found = existing.find((e) => norm(e.text) === key);
  const nick = nickname?.trim();
  let next: BookEntry[];
  if (found) {
    next = existing.map((e) =>
      e.id === found.id
        ? {
            ...e,
            text: trimmed,
            usedAt: Date.now(),
            nickname: nick || e.nickname,
          }
        : e,
    );
  } else {
    next = [
      {
        id: makeId(),
        text: trimmed,
        nickname: nick || undefined,
        usedAt: Date.now(),
      },
      ...existing,
    ];
  }
  write(kind, next);
  return loadBook(kind);
}

/** Bump usedAt for an already-saved address (no-op if not present). */
export function touchBook(kind: BookKind, text: string): void {
  const key = norm(text);
  if (!hasStorage() || !key) return;
  const existing = read(kind);
  if (existing.some((e) => norm(e.text) === key)) {
    write(
      kind,
      existing.map((e) =>
        norm(e.text) === key ? { ...e, usedAt: Date.now() } : e,
      ),
    );
  }
}

export function setNickname(
  kind: BookKind,
  id: string,
  nickname: string,
): BookEntry[] {
  write(
    kind,
    read(kind).map((e) =>
      e.id === id ? { ...e, nickname: nickname.trim() || undefined } : e,
    ),
  );
  return loadBook(kind);
}

export function removeFromBook(kind: BookKind, id: string): BookEntry[] {
  write(
    kind,
    read(kind).filter((e) => e.id !== id),
  );
  return loadBook(kind);
}

export interface ExportData {
  app: "print-template";
  version: 1;
  from: BookEntry[];
  to: BookEntry[];
}

export function exportData(): ExportData {
  return {
    app: "print-template",
    version: 1,
    from: loadBook("from"),
    to: loadBook("to"),
  };
}

/** Merge an exported file into the current books (dedup by text). Returns counts added. */
export function importData(json: string): { from: number; to: number } {
  const parsed: unknown = JSON.parse(json);
  const counts = { from: 0, to: 0 };
  for (const kind of ["from", "to"] as BookKind[]) {
    const incoming = (parsed as Record<string, unknown>)?.[kind];
    if (!Array.isArray(incoming)) continue;
    const existing = read(kind);
    const seen = new Set(existing.map((e) => norm(e.text)));
    const additions: BookEntry[] = [];
    for (const e of incoming) {
      const text = typeof e?.text === "string" ? e.text.trim() : "";
      if (!text || seen.has(norm(text))) continue;
      seen.add(norm(text));
      const nick = typeof e?.nickname === "string" ? e.nickname.trim() : "";
      additions.push({
        id: makeId(),
        text,
        nickname: nick || undefined,
        usedAt: typeof e?.usedAt === "number" ? e.usedAt : Date.now(),
      });
      counts[kind]++;
    }
    if (additions.length) write(kind, [...additions, ...existing]);
  }
  return counts;
}
