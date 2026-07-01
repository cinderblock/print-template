import { useEffect, useMemo, useState } from "react";
import type { MetaFunction } from "react-router";
import { Link, useParams } from "react-router";
import { AddressField } from "~/components/AddressField";
import { PrintArea } from "~/components/PrintArea";
import { latestEntry, saveToBook } from "~/lib/storage";
import { templateList } from "~/templates/manifest";
import { getTemplate } from "~/templates/registry";
import type { FieldValues, TemplateRender } from "~/templates/types";

export const meta: MetaFunction = ({ params }) => {
  const m = templateList.find((t) => t.id === params.id);
  return [{ title: m ? `${m.name} · Print Template` : "Print Template" }];
};

function initialValues(template: TemplateRender): FieldValues {
  const values: FieldValues = {};
  for (const field of template.fields) values[field.name] = field.default ?? "";
  return values;
}

/** Split a textarea of addresses (blank-line separated) into a list. */
function parseBatch(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function TemplatePage() {
  const { id } = useParams();
  const templateMeta = templateList.find((t) => t.id === id);
  const template = getTemplate(id);

  const [values, setValues] = useState<FieldValues>(() =>
    template ? initialValues(template) : {},
  );
  const [batch, setBatch] = useState(false);
  const [batchText, setBatchText] = useState("");
  const batchList = useMemo(() => parseBatch(batchText), [batchText]);

  // Pre-fill "latest" book-backed fields on mount (client only).
  useEffect(() => {
    if (!template) return;
    setValues((prev) => {
      let next = prev;
      for (const field of template.fields) {
        if (field.book && field.prefillLatest && !prev[field.name]?.trim()) {
          const latest = latestEntry(field.book);
          if (latest) next = { ...next, [field.name]: latest.text };
        }
      }
      return next;
    });
  }, [template]);

  if (!template || !templateMeta) {
    return (
      <main className="container">
        <p className="intro">That template doesn’t exist.</p>
        <Link className="back-link" to="/">
          ← All templates
        </Link>
      </main>
    );
  }

  const batchField = template.batchField;
  const setField = (name: string) => (value: string) =>
    setValues((v) => ({ ...v, [name]: value }));

  // Remember used addresses, then print.
  function handlePrint() {
    for (const field of template!.fields) {
      if (!field.book) continue;
      if (batch && field.name === batchField) continue;
      const v = values[field.name];
      if (v?.trim()) saveToBook(field.book, v);
    }
    if (batch && batchField) {
      const toBook = template!.fields.find((f) => f.name === batchField)?.book;
      if (toBook) for (const a of batchList) saveToBook(toBook, a);
    }
    window.print();
  }

  const Preview = template.Preview;
  const previewValues =
    batch && batchField
      ? { ...values, [batchField]: batchList[0] ?? "" }
      : values;
  const pageValues =
    batch && batchField
      ? (batchList.length ? batchList : [""]).map((a) => ({
          ...values,
          [batchField]: a,
        }))
      : [values];

  return (
    <main className="container editor">
      <Link className="back-link" to="/">
        ← All templates
      </Link>
      <div className="editor__head">
        <h1 className="editor__title">{templateMeta.name}</h1>
        {batchField && (
          <div className="mode-toggle" role="tablist" aria-label="Mode">
            <button
              type="button"
              role="tab"
              aria-selected={!batch}
              className={`mode-toggle__btn${!batch ? " is-active" : ""}`}
              onClick={() => setBatch(false)}
            >
              Single
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={batch}
              className={`mode-toggle__btn${batch ? " is-active" : ""}`}
              onClick={() => setBatch(true)}
            >
              Batch
            </button>
          </div>
        )}
      </div>

      <div className="editor__grid">
        <form className="editor__fields" onSubmit={(e) => e.preventDefault()}>
          {template.fields.map((field) => {
            if (batch && field.name === batchField) {
              return (
                <div className="field" key={field.name}>
                  <label className="field__label" htmlFor="batch-list">
                    {field.label} — one address per blank line
                  </label>
                  <textarea
                    id="batch-list"
                    className="field__input field__textarea"
                    rows={10}
                    value={batchText}
                    placeholder={
                      "First Recipient\n1 A St\nCity, ST 11111\n\nSecond Recipient\n2 B Ave\nCity, ST 22222"
                    }
                    onChange={(e) => setBatchText(e.target.value)}
                  />
                  <p className="field__hint">
                    {batchList.length} envelope
                    {batchList.length === 1 ? "" : "s"} will print.
                  </p>
                </div>
              );
            }
            if (field.type === "address") {
              return (
                <AddressField
                  key={field.name}
                  field={field}
                  value={values[field.name] ?? ""}
                  onChange={setField(field.name)}
                />
              );
            }
            return (
              <div className="field" key={field.name}>
                <label className="field__label" htmlFor={`f-${field.name}`}>
                  {field.label}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    id={`f-${field.name}`}
                    className="field__input field__textarea"
                    rows={3}
                    value={values[field.name] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(e) => setField(field.name)(e.target.value)}
                  />
                ) : (
                  <input
                    id={`f-${field.name}`}
                    className="field__input"
                    type="text"
                    value={values[field.name] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(e) => setField(field.name)(e.target.value)}
                  />
                )}
                {field.help && <p className="field__hint">{field.help}</p>}
              </div>
            );
          })}

          <button
            type="button"
            className="btn btn--primary"
            onClick={handlePrint}
          >
            {batch
              ? `Print ${batchList.length} envelope${batchList.length === 1 ? "" : "s"}`
              : "Print"}
          </button>
        </form>

        <div className="editor__preview">
          <div className="paper-note">
            {template.paper.label}
            {batch && batchList.length > 1
              ? ` · showing 1 of ${batchList.length}`
              : ""}
          </div>
          <PrintArea
            paper={template.paper}
            preview={<Preview values={previewValues} />}
            pages={pageValues.map((v) => (
              <Preview values={v} />
            ))}
          />
          <p className="field__hint">
            Set paper size to {templateMeta.name}, margins to None, and scale to
            100%. Test on plain paper first.
          </p>
        </div>
      </div>
    </main>
  );
}
