import { useEffect, useState } from "react";
import type { FieldDef } from "~/templates/types";
import {
  loadBook,
  removeFromBook,
  saveToBook,
  touchBook,
  type BookEntry,
} from "~/lib/storage";

function firstLine(text: string): string {
  const line = text.trim().split("\n")[0]?.trim() ?? "";
  return line.length > 40 ? `${line.slice(0, 39)}…` : line || "(blank)";
}

function optionLabel(entry: BookEntry): string {
  return entry.nickname
    ? `${entry.nickname} — ${firstLine(entry.text)}`
    : firstLine(entry.text);
}

/**
 * A multi-line address input backed by an address book (when `field.book` is
 * set): pick a saved address, save the current one with an optional nickname,
 * or forget it.
 */
export function AddressField({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: string;
  onChange: (value: string) => void;
}) {
  const [book, setBook] = useState<BookEntry[]>([]);
  const [nickname, setNickname] = useState("");
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (field.book) setBook(loadBook(field.book));
  }, [field.book]);

  const saved = field.book
    ? book.find((e) => e.text.trim() === value.trim())
    : undefined;

  function pick(text: string) {
    onChange(text);
    if (field.book) touchBook(field.book, text);
  }

  function save() {
    if (!field.book || !value.trim()) return;
    setBook(saveToBook(field.book, value, nickname));
    setNickname("");
    setFlash(true);
    window.setTimeout(() => setFlash(false), 1600);
  }

  return (
    <div className="field">
      <label className="field__label" htmlFor={`f-${field.name}`}>
        {field.label}
      </label>

      {field.book && book.length > 0 && (
        <select
          className="field__recents"
          aria-label={`Saved ${field.book} addresses`}
          value=""
          onChange={(e) => {
            if (e.target.value) pick(e.target.value);
          }}
        >
          <option value="">Saved addresses…</option>
          {book.map((entry) => (
            <option key={entry.id} value={entry.text}>
              {optionLabel(entry)}
            </option>
          ))}
        </select>
      )}

      <textarea
        id={`f-${field.name}`}
        className="field__input field__textarea"
        rows={4}
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />

      {field.book && (
        <div className="field__row">
          <input
            className="field__input field__nick"
            type="text"
            aria-label="Nickname"
            placeholder="Nickname (optional)"
            value={saved?.nickname ?? nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <button
            type="button"
            className="btn btn--ghost"
            onClick={save}
            disabled={!value.trim()}
          >
            {flash ? "Saved ✓" : saved ? "Update" : "Save"}
          </button>
          {saved && (
            <button
              type="button"
              className="btn btn--ghost btn--danger"
              onClick={() =>
                field.book && setBook(removeFromBook(field.book, saved.id))
              }
            >
              Forget
            </button>
          )}
        </div>
      )}

      {field.help && <p className="field__hint">{field.help}</p>}
    </div>
  );
}
