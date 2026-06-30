import { useEffect, useRef, useState } from "react";
import type { FieldDef } from "~/templates/types";
import {
  addToAddressBook,
  loadAddressBook,
  removeFromAddressBook,
  saveFromAddress,
  type BookEntry,
} from "~/lib/storage";

/** First line of an address, used to label saved entries in the picker. */
function summarize(text: string): string {
  const first = text.trim().split("\n")[0]?.trim() ?? "";
  return first.length > 42 ? `${first.slice(0, 41)}…` : first || "(blank)";
}

/**
 * A multi-line address input. For a `from` field it persists as the user's
 * default return address; for a `to` field it offers a recent-address book.
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
  const [savedFlash, setSavedFlash] = useState(false);
  const saveTimer = useRef<number | undefined>(undefined);

  // Load the address book (client only).
  useEffect(() => {
    if (field.addressBook) setBook(loadAddressBook());
  }, [field.addressBook]);

  // Persist the default "from" address, debounced.
  useEffect(() => {
    if (!field.isDefaultFrom) return;
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => saveFromAddress(value), 400);
    return () => window.clearTimeout(saveTimer.current);
  }, [value, field.isDefaultFrom]);

  function handleSaveToBook() {
    if (!value.trim()) return;
    setBook(addToAddressBook(value, Date.now()));
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1600);
  }

  function handleForget(text: string) {
    setBook(removeFromAddressBook(text));
  }

  return (
    <div className="field">
      <label className="field__label" htmlFor={`f-${field.name}`}>
        {field.label}
      </label>

      {field.addressBook && book.length > 0 && (
        <div className="field__recents">
          <select
            aria-label="Recent addresses"
            value=""
            onChange={(e) => {
              if (e.target.value) onChange(e.target.value);
            }}
          >
            <option value="">Recent addresses…</option>
            {book.map((entry) => (
              <option key={entry.text} value={entry.text}>
                {summarize(entry.text)}
              </option>
            ))}
          </select>
        </div>
      )}

      <textarea
        id={`f-${field.name}`}
        className="field__input field__textarea"
        rows={4}
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />

      <div className="field__row">
        {field.isDefaultFrom && (
          <span className="field__hint">
            Saved as your default return address on this device.
          </span>
        )}
        {field.addressBook && (
          <>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={handleSaveToBook}
              disabled={!value.trim()}
            >
              {savedFlash ? "Saved ✓" : "Save to address book"}
            </button>
            {book.some((e) => e.text.trim() === value.trim()) &&
              value.trim() && (
                <button
                  type="button"
                  className="btn btn--ghost btn--danger"
                  onClick={() => handleForget(value)}
                >
                  Forget
                </button>
              )}
          </>
        )}
      </div>

      {field.help && <p className="field__hint">{field.help}</p>}
    </div>
  );
}
