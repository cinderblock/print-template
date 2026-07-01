import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import {
  exportData,
  importData,
  loadBook,
  removeFromBook,
  setNickname,
  type BookEntry,
  type BookKind,
} from "~/lib/storage";

export const meta: MetaFunction = () => [
  { title: "Address Book · Print Template" },
];

export default function Addresses() {
  const [from, setFrom] = useState<BookEntry[]>([]);
  const [to, setTo] = useState<BookEntry[]>([]);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function reload() {
    setFrom(loadBook("from"));
    setTo(loadBook("to"));
  }
  useEffect(reload, []);

  const setters: Record<BookKind, (e: BookEntry[]) => void> = {
    from: setFrom,
    to: setTo,
  };

  function download() {
    const blob = new Blob([JSON.stringify(exportData(), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "print-template-addresses.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const c = importData(await file.text());
      reload();
      const n = c.from + c.to;
      setMessage(`Imported ${n} new address${n === 1 ? "" : "es"}.`);
    } catch {
      setMessage("Import failed — not a valid export file.");
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  function section(kind: BookKind, title: string, entries: BookEntry[]) {
    const set = setters[kind];
    return (
      <section className="book">
        <h2 className="gallery__heading">
          {title} ({entries.length})
        </h2>
        {entries.length === 0 ? (
          <p className="field__hint">No saved addresses yet.</p>
        ) : (
          <ul className="book__list">
            {entries.map((e) => (
              <li className="book__item" key={e.id}>
                <input
                  className="field__input field__nick"
                  defaultValue={e.nickname ?? ""}
                  placeholder="Nickname"
                  aria-label="Nickname"
                  onBlur={(ev) => set(setNickname(kind, e.id, ev.target.value))}
                />
                <pre className="book__addr">{e.text}</pre>
                <button
                  type="button"
                  className="btn btn--ghost btn--danger"
                  onClick={() => set(removeFromBook(kind, e.id))}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  return (
    <main className="container">
      <Link className="back-link" to="/">
        ← All templates
      </Link>
      <h1 className="editor__title">Address Book</h1>
      <p className="intro">
        Saved addresses live only in this browser. Export to back them up or
        move them to another device.
      </p>

      <div className="field__row">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={download}
          disabled={from.length + to.length === 0}
        >
          Export JSON
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => fileRef.current?.click()}
        >
          Import JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={onFile}
        />
        {message && <span className="field__hint">{message}</span>}
      </div>

      {section("from", "Send-from addresses", from)}
      {section("to", "Send-to addresses", to)}
    </main>
  );
}
