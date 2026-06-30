import "./envelope.css";
import type { FieldValues, TemplateRender } from "../types";

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

export const envelope10: TemplateRender = {
  id: "envelope-10",
  paper: { width: 9.5, height: 4.125, label: "#10 Envelope · 9.5 × 4.125 in" },
  fields: [
    {
      name: "from",
      label: "Return address (from)",
      type: "address",
      isDefaultFrom: true,
      placeholder: "Your Name\n123 Main St\nCity, ST 12345",
    },
    {
      name: "to",
      label: "Delivery address (to)",
      type: "address",
      addressBook: true,
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
};
