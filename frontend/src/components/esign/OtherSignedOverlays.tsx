"use client";
import type { Field } from "./api";

type SignerSummary = {
  id: string;
  name: string;
  color: string;
};

interface Props {
  fields: Field[];
  signers: SignerSummary[] | undefined;
}

/**
 * Renders previous signers' already-applied signatures as non-interactive
 * overlays on the current page. Witnesses + later sequential signers see
 * earlier signatures, which makes the document feel "alive" while preserving
 * tamper evidence (these elements are pointer-events:none).
 */
export function OtherSignedOverlays({ fields, signers }: Props) {
  if (!fields || fields.length === 0) return null;
  return (
    <>
      {fields.map((f) => {
        const owner = signers?.find((s) => s.id === f.signer_id);
        const accent = owner?.color || "#2A6B45";
        const val = f.value || "";
        const isImg = val.startsWith("data:image");
        return (
          <div
            key={`other-${f.id}`}
            data-testid={`other-signed-field-${f.id}`}
            style={{
              position: "absolute",
              left: `${f.x * 100}%`,
              top: `${f.y * 100}%`,
              width: `${f.width * 100}%`,
              height: `${f.height * 100}%`,
              borderColor: accent,
              background: `${accent}14`,
            }}
            className="border rounded flex items-center justify-center overflow-hidden pointer-events-none"
            title={owner ? `Signed by ${owner.name}` : "Signed"}
          >
            {isImg ? (
              <img src={val} alt={`${owner?.name || "Signer"} signature`} className="max-h-full max-w-full" />
            ) : (
              <span className="text-xs px-1 truncate" style={{ fontSize: "min(14px, 90%)", color: accent }}>
                {val}
              </span>
            )}
          </div>
        );
      })}
    </>
  );
}
