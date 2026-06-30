import { useEffect, useState } from "react";
import type { MetaFunction } from "react-router";
import { Link, useParams } from "react-router";
import { AddressField } from "~/components/AddressField";
import { PrintArea } from "~/components/PrintArea";
import { loadFromAddress } from "~/lib/storage";
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

export default function TemplatePage() {
  const { id } = useParams();
  const templateMeta = templateList.find((t) => t.id === id);
  const template = getTemplate(id);

  const [values, setValues] = useState<FieldValues>(() =>
    template ? initialValues(template) : {},
  );

  // Pre-fill the saved default "from" address (client only).
  useEffect(() => {
    if (!template) return;
    const fromField = template.fields.find((f) => f.isDefaultFrom);
    if (!fromField) return;
    const saved = loadFromAddress();
    if (saved) setValues((v) => ({ ...v, [fromField.name]: saved }));
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

  const setField = (name: string) => (value: string) =>
    setValues((v) => ({ ...v, [name]: value }));

  return (
    <main className="container editor">
      <Link className="back-link" to="/">
        ← All templates
      </Link>
      <h1 className="editor__title">{templateMeta.name}</h1>

      <div className="editor__grid">
        <form className="editor__fields" onSubmit={(e) => e.preventDefault()}>
          {template.fields.map((field) => {
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
            onClick={() => window.print()}
          >
            Print
          </button>
        </form>

        <div className="editor__preview">
          <div className="paper-note">{template.paper.label}</div>
          <PrintArea paper={template.paper}>
            <template.Preview values={values} />
          </PrintArea>
          <p className="field__hint">
            Before printing, set paper size to {templateMeta.name}, margins to
            None, and scale to 100%. Run a plain-paper test first.
          </p>
        </div>
      </div>
    </main>
  );
}
