import type { ComponentType } from "react";
import type { BookKind } from "../lib/storage";

/** Kinds of editable input a template can expose. */
export type FieldType = "text" | "textarea" | "address";

export interface FieldDef {
  /** Key under which the value is stored. */
  name: string;
  label: string;
  type: FieldType;
  default?: string;
  placeholder?: string;
  help?: string;
  /** For `address` fields: back this field with the named address book. */
  book?: BookKind;
  /** Pre-fill this field with the most-recently-used entry from its book. */
  prefillLatest?: boolean;
}

/** Current values for a template's fields, keyed by FieldDef.name. */
export type FieldValues = Record<string, string>;

/** Physical media size, in inches. */
export interface PaperSize {
  /** Width in inches. */
  width: number;
  /** Height in inches. */
  height: number;
  label: string;
}

/** Lightweight, React-free description used for routing and the gallery. */
export interface TemplateMeta {
  id: string;
  name: string;
  description: string;
  /** Group heading, e.g. "Envelopes" or "Labels". */
  category: string;
}

/**
 * The renderable part of a template (paper size + fields + preview), keyed by
 * `id` to match a {@link TemplateMeta} in the manifest.
 */
export interface TemplateRender {
  id: string;
  paper: PaperSize;
  fields: FieldDef[];
  /** Renders the printable content for the given field values. */
  Preview: ComponentType<{ values: FieldValues }>;
  /**
   * If set, this field can vary across a batch: the template page offers a
   * "Batch" mode that prints one page per value of this field (e.g. "to").
   */
  batchField?: string;
}
