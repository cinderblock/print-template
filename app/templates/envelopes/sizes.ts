import type { PaperSize } from "../types";

/**
 * Envelope sizes, in inches (width × height, flap opening on the long top edge).
 * React-free so it can be imported by the manifest and by react-router.config.
 */
export interface EnvelopeSize {
  id: string;
  name: string;
  description: string;
  paper: PaperSize;
}

function size(
  id: string,
  name: string,
  width: number,
  height: number,
  note: string,
): EnvelopeSize {
  const dims = `${width} × ${height} in`;
  return {
    id,
    name,
    description: `${note} (${dims}).`,
    paper: { width, height, label: `${name} · ${dims}` },
  };
}

export const envelopeSizes: EnvelopeSize[] = [
  size(
    "envelope-10",
    "#10 Envelope",
    9.5,
    4.125,
    "Standard US business envelope",
  ),
  size("envelope-9", "#9 Envelope", 8.875, 3.875, "Reply envelope"),
  size("envelope-6x9", "6×9 Envelope", 9, 6, "Booklet / catalog envelope"),
  size(
    "envelope-a7",
    "A7 Envelope",
    7.25,
    5.25,
    "5×7 invitation / greeting card",
  ),
  size("envelope-a2", "A2 Envelope", 5.75, 4.375, "Note card / RSVP"),
  size("envelope-dl", "DL Envelope", 8.66, 4.33, "International standard"),
];
