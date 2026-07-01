import "./envelope.css";
import type { FieldValues, TemplateRender } from "../types";
import { envelopeSizes } from "./sizes";

function EnvelopePreview({ values }: { values: FieldValues }) {
  const from = values.from ?? "";
  const to = values.to ?? "";
  const endorsement = values.endorsement ?? "";
  return (
    <div className="envelope">
      {from.trim() && <div className="envelope__return">{from}</div>}
      {endorsement.trim() && (
        <div className="envelope__endorsement">{endorsement}</div>
      )}
      {to.trim() && <div className="envelope__delivery">{to}</div>}
    </div>
  );
}

/** All envelope templates share the same fields and preview; only paper differs. */
export const envelopeTemplates: TemplateRender[] = envelopeSizes.map((s) => ({
  id: s.id,
  paper: s.paper,
  batchField: "to",
  fields: [
    {
      name: "from",
      label: "Return address (from)",
      type: "address",
      book: "from",
      prefillLatest: true,
      placeholder: "Your Name\n123 Main St\nCity, ST 12345",
    },
    {
      name: "to",
      label: "Delivery address (to)",
      type: "address",
      book: "to",
      placeholder: "Recipient Name\n456 Oak Ave\nCity, ST 67890",
    },
    {
      name: "endorsement",
      label: "Endorsement (optional)",
      type: "text",
      placeholder: "e.g. CERTIFIED MAIL",
      help: "Printed in bold above the delivery address. Leave blank for none.",
    },
  ],
  Preview: EnvelopePreview,
}));
