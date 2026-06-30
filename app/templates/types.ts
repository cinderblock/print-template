import type { ComponentType } from "react";

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
  /**
   * For `address` fields: persist this value as the user's default "from"
   * address in localStorage, and pre-fill it on load.
   */
  isDefaultFrom?: boolean;
  /**
   * For `address` fields: offer a "recently used" address book — pick from
   * past entries and optionally save new ones.
   */
  addressBook?: boolean;
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
 * `id` to match a {@link TemplateMeta} in the manifest. Kept separate from the
 * metadata so the manifest stays React-free for routing/prerender.
 */
export interface TemplateRender {
  id: string;
  paper: PaperSize;
  fields: FieldDef[];
  /** Renders the printable content for the given field values. */
  Preview: ComponentType<{ values: FieldValues }>;
}
