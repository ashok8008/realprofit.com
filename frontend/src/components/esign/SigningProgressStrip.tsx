"use client";
import { CheckCircle2, X } from "lucide-react";

type ProgressSigner = {
  id: string;
  name: string;
  role: string;
  order_index: number;
  color: string;
  status: string;
  signed_at?: string | null;
};

interface Props {
  signers: ProgressSigner[] | undefined;
  /** Used to decide which row is "You" (the currently authenticated signer). */
  currentSignerName: string;
}

/**
 * Slim row of avatars under the signing header showing every party's status
 * (Signed / Declined / You're next / Pending). Hides itself for solo-signer
 * documents because the existing single-row header already conveys progress.
 */
export function SigningProgressStrip({ signers, currentSignerName }: Props) {
  if (!signers || signers.length <= 1) return null;
  const sorted = signers.slice().sort((a, b) => a.order_index - b.order_index);
  return (
    <div className="bg-white border-b border-stone-200" data-testid="signing-progress-strip">
      <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] uppercase tracking-[0.18em] text-stone-500 font-semibold whitespace-nowrap pr-2 border-r border-stone-200 mr-1">
          Signing order
        </span>
        {sorted.map((s, idx, arr) => {
          const isMe = s.name === currentSignerName && s.role !== "cc";
          const isSigned = s.status === "signed" || !!s.signed_at;
          const isDeclined = s.status === "declined";
          const stateLabel = isSigned
            ? "Signed"
            : isDeclined
              ? "Declined"
              : isMe
                ? "You're next"
                : "Pending";
          const initials = (s.name || "?")
            .split(/\s+/)
            .map((w) => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
          return (
            <div key={s.id} className="flex items-center gap-2 flex-shrink-0" data-testid={`progress-signer-${s.id}`}>
              <div
                className={`relative w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${
                  isMe ? "ring-2 ring-offset-2 ring-[#C8A96E]" : ""
                } ${isSigned ? "" : isDeclined ? "opacity-60" : "opacity-70"}`}
                style={{ background: s.color }}
                title={`${s.name} — ${stateLabel}`}
              >
                {initials}
                {isSigned && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2A6B45]" />
                  </span>
                )}
                {isDeclined && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
                    <X className="w-3 h-3 text-[#B53D2F]" />
                  </span>
                )}
              </div>
              <div className="flex flex-col leading-tight">
                <span className={`text-xs font-semibold ${isMe ? "text-[#0B3D3D]" : "text-stone-800"} truncate max-w-[160px]`}>
                  {isMe ? "You" : s.name}
                  {s.role !== "signer" && (
                    <span className="ml-1 text-[9px] uppercase tracking-wider text-stone-500 font-medium">
                      {s.role}
                    </span>
                  )}
                </span>
                <span
                  className={`text-[10px] ${
                    isSigned
                      ? "text-[#2A6B45]"
                      : isDeclined
                        ? "text-[#B53D2F]"
                        : isMe
                          ? "text-[#A0621A] font-medium"
                          : "text-stone-500"
                  }`}
                >
                  {stateLabel}
                </span>
              </div>
              {idx < arr.length - 1 && (
                <span className="text-stone-300 px-1 select-none" aria-hidden>›</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
