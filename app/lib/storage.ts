/**
 * localStorage-backed persistence. All access is guarded for SSR/prerender
 * (no `window`) and tolerant of disabled storage / parse errors.
 */

const FROM_KEY = "print-template:fromAddress";
const BOOK_KEY = "print-template:addressBook";
const BOOK_LIMIT = 12;

function hasStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

/** The user's saved default return ("from") address. */
export function loadFromAddress(): string {
  if (!hasStorage()) return "";
  try {
    return window.localStorage.getItem(FROM_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveFromAddress(value: string): void {
  if (!hasStorage()) return;
  try {
    if (value.trim()) window.localStorage.setItem(FROM_KEY, value);
    else window.localStorage.removeItem(FROM_KEY);
  } catch {
    // ignore
  }
}

export interface BookEntry {
  text: string;
  usedAt: number;
}

/** Recently used addresses (most recent first). */
export function loadAddressBook(): BookEntry[] {
  if (!hasStorage()) return [];
  try {
    const raw = window.localStorage.getItem(BOOK_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e): e is BookEntry =>
          typeof e === "object" &&
          e !== null &&
          typeof (e as BookEntry).text === "string",
      )
      .sort((a, b) => b.usedAt - a.usedAt);
  } catch {
    return [];
  }
}

/**
 * Add (or bump) an address in the book. De-duplicates on normalized text,
 * keeps the most recent `BOOK_LIMIT`, and returns the updated list.
 */
export function addToAddressBook(text: string, now: number): BookEntry[] {
  const trimmed = text.trim();
  if (!hasStorage() || !trimmed) return loadAddressBook();
  const norm = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();
  const key = norm(trimmed);
  try {
    const existing = loadAddressBook().filter((e) => norm(e.text) !== key);
    const next: BookEntry[] = [
      { text: trimmed, usedAt: now },
      ...existing,
    ].slice(0, BOOK_LIMIT);
    window.localStorage.setItem(BOOK_KEY, JSON.stringify(next));
    return next;
  } catch {
    return loadAddressBook();
  }
}

export function removeFromAddressBook(text: string): BookEntry[] {
  if (!hasStorage()) return [];
  const norm = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();
  const key = norm(text);
  try {
    const next = loadAddressBook().filter((e) => norm(e.text) !== key);
    window.localStorage.setItem(BOOK_KEY, JSON.stringify(next));
    return next;
  } catch {
    return loadAddressBook();
  }
}
