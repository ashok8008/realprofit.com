"use client";
import { Plus, Trash2, GripVertical } from "lucide-react";
import type { SignerDraft } from "./wizardTypes";

interface Props {
  signers: SignerDraft[];
  setSigners: (v: SignerDraft[]) => void;
  signingOrder: "sequential" | "parallel";
  setSigningOrder: (v: "sequential" | "parallel") => void;
  dragIdx: number | null;
  setDragIdx: (v: number | null) => void;
  onAddSigner: () => void;
  onUpdateSigner: (i: number, patch: Partial<SignerDraft>) => void;
  onRemoveSigner: (i: number) => void;
}

/**
 * Step 2 of the eSign wizard: collect signers + signing order.
 * State lives in EsignWizard so it can be PATCHed to the server.
 */
export function WizardStepSigners({
  signers,
  setSigners,
  signingOrder,
  setSigningOrder,
  dragIdx,
  setDragIdx,
  onAddSigner,
  onUpdateSigner,
  onRemoveSigner,
}: Props) {
  return (
    <section data-testid="step-2-signers" className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold text-stone-900 mb-1">Who needs to sign?</h2>
      <p className="text-sm text-stone-600 mb-6">
        Add up to 5 signers. Each will get a unique signing link by email.
      </p>

      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
        <div className="space-y-3">
          {signers.map((s, i) => {
            const reorderable = signingOrder === "sequential";
            return (
              <div
                key={i}
                className={`grid grid-cols-12 gap-3 items-center rounded-md transition-colors ${
                  dragIdx === i ? "opacity-40" : ""
                }`}
                data-testid={`signer-row-${i}`}
                draggable={reorderable}
                onDragStart={(e) => {
                  if (!reorderable) return;
                  setDragIdx(i);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  if (!reorderable || dragIdx === null) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  if (!reorderable || dragIdx === null || dragIdx === i) return;
                  e.preventDefault();
                  const next = signers.slice();
                  const [moved] = next.splice(dragIdx, 1);
                  next.splice(i, 0, moved);
                  setSigners(next);
                  setDragIdx(null);
                }}
                onDragEnd={() => setDragIdx(null)}
              >
                <div className="col-span-1 flex items-center gap-1">
                  {reorderable && (
                    <button
                      type="button"
                      data-testid={`signer-drag-handle-${i}`}
                      className="p-1 text-stone-400 hover:text-stone-700 cursor-grab active:cursor-grabbing"
                      aria-label={`Drag signer ${i + 1} to reorder`}
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-4 h-4" />
                    </button>
                  )}
                  <div
                    className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center"
                    style={{ background: s.color }}
                  >
                    {i + 1}
                  </div>
                </div>
                <input
                  type="text"
                  value={s.name}
                  onChange={(e) => onUpdateSigner(i, { name: e.target.value })}
                  placeholder="Full name"
                  data-testid={`signer-name-${i}`}
                  className="col-span-4 px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:border-[#0B3D3D]"
                />
                <input
                  type="email"
                  value={s.email}
                  onChange={(e) => onUpdateSigner(i, { email: e.target.value })}
                  placeholder="email@company.com"
                  data-testid={`signer-email-${i}`}
                  className="col-span-4 px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:border-[#0B3D3D]"
                />
                <select
                  value={s.role}
                  onChange={(e) => onUpdateSigner(i, { role: e.target.value as SignerDraft["role"] })}
                  data-testid={`signer-role-${i}`}
                  className="col-span-2 px-2 py-2 border border-stone-300 rounded-md text-xs focus:outline-none focus:border-[#0B3D3D]"
                >
                  <option value="signer">Signer</option>
                  <option value="approver">Approver</option>
                  <option value="cc">CC</option>
                  <option value="witness">Witness</option>
                </select>
                <button
                  onClick={() => onRemoveSigner(i)}
                  disabled={signers.length <= 1}
                  data-testid={`signer-remove-${i}`}
                  className="col-span-1 p-2 rounded-md text-stone-400 hover:text-[#B53D2F] hover:bg-stone-50 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={onAddSigner}
          data-testid="add-signer-btn"
          className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0B3D3D] border border-[#0B3D3D] rounded-md hover:bg-[#0B3D3D] hover:text-white transition-colors"
        >
          <Plus className="w-4 h-4" /> Add signer
        </button>

        {signers.length > 1 && (
          <div className="mt-6 pt-6 border-t border-stone-200">
            <label className="block text-sm font-medium text-stone-700 mb-2">Signing order</label>
            <div className="flex gap-2">
              {[
                { id: "parallel" as const, label: "Anyone, any order", desc: "All signers notified at once" },
                { id: "sequential" as const, label: "In order", desc: "One at a time — drag rows to reorder" },
              ].map((o) => (
                <button
                  key={o.id}
                  onClick={() => setSigningOrder(o.id)}
                  data-testid={`signing-order-${o.id}`}
                  className={`flex-1 text-left p-3 rounded-md border transition-all ${
                    signingOrder === o.id
                      ? "border-[#0B3D3D] bg-[#FAF5EE]"
                      : "border-stone-200 hover:border-stone-400"
                  }`}
                >
                  <div className="text-sm font-medium text-stone-900">{o.label}</div>
                  <div className="text-xs text-stone-600 mt-0.5">{o.desc}</div>
                </button>
              ))}
            </div>
            {signingOrder === "sequential" && (
              <p className="mt-3 text-xs text-stone-500" data-testid="reorder-hint">
                Drag the <GripVertical className="w-3 h-3 inline -mt-0.5" /> handle on any signer row to change the order.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
