// Shared types for the eSign wizard sub-components.
import type { FieldType } from "./api";

export interface SignerDraft {
  name: string;
  email: string;
  role: "signer" | "approver" | "cc" | "witness";
  color: string;
}

export interface FieldDraft {
  signer_id: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  field_type: FieldType;
  required: boolean;
  label?: string;
  /** local id for tracking */
  _localId?: string;
}
