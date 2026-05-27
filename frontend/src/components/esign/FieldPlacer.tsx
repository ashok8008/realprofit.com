"use client";
// Field placement canvas: render PDF pages with overlay; click to drop fields; drag to move.
import { useState, useRef, useEffect } from "react";
import { Trash2, MousePointer2 } from "lucide-react";
import { usePdfRenderer, PageCanvas } from "./PdfRenderer";
import type { FieldType, Signer } from "./api";

interface FieldDraft {
  signer_id: string;
  page: number;
  x: number;        // 0-1 fraction of page width (top-left)
  y: number;        // 0-1 fraction of page height (top-left)
  width: number;
  height: number;
  field_type: FieldType;
  required: boolean;
  label?: string;
  _localId?: string;
}

interface Props {
  pdfUrl: string;
  signers: Signer[];
  fields: FieldDraft[];
  onChange: (fields: FieldDraft[]) => void;
  activeSignerId: string | null;
  setActiveSignerId: (id: string) => void;
}

const FIELD_TYPES: { id: FieldType; label: string; w: number; h: number }[] = [
  { id: "signature", label: "Signature", w: 0.22, h: 0.06 },
  { id: "initials", label: "Initials", w: 0.08, h: 0.05 },
  { id: "date", label: "Date", w: 0.14, h: 0.035 },
  { id: "text", label: "Text", w: 0.18, h: 0.035 },
  { id: "checkbox", label: "Checkbox", w: 0.03, h: 0.03 },
];

export function FieldPlacer({ pdfUrl, signers, fields, onChange, activeSignerId, setActiveSignerId }: Props) {
  const { pages, loading, error } = usePdfRenderer(pdfUrl, 1.5);
  const [activeFieldType, setActiveFieldType] = useState<FieldType>("signature");

  const activeSigner = signers.find((s) => s.id === activeSignerId) || signers[0];

  const handlePageClick = (page: number, e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeSigner) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const xFrac = (e.clientX - rect.left) / rect.width;
    const yFrac = (e.clientY - rect.top) / rect.height;
    const spec = FIELD_TYPES.find((f) => f.id === activeFieldType)!;
    // Center the field around the click
    const x = Math.max(0, Math.min(1 - spec.w, xFrac - spec.w / 2));
    const y = Math.max(0, Math.min(1 - spec.h, yFrac - spec.h / 2));
    const newField: FieldDraft = {
      signer_id: activeSigner.id,
      page,
      x, y,
      width: spec.w,
      height: spec.h,
      field_type: activeFieldType,
      required: true,
      _localId: `f-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };
    onChange([...fields, newField]);
  };

  const removeField = (localId: string) => {
    onChange(fields.filter((f) => f._localId !== localId));
  };

  // Drag-to-move support
  const [dragging, setDragging] = useState<{ localId: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const draggingRef = useRef(dragging);
  draggingRef.current = dragging;

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: MouseEvent) => {
      const d = draggingRef.current;
      if (!d) return;
      const pageEl = document.querySelector(`[data-testid^="pdf-page-"]`) as HTMLDivElement | null;
      if (!pageEl) return;
      const rect = pageEl.getBoundingClientRect();
      const dx = (e.clientX - d.startX) / rect.width;
      const dy = (e.clientY - d.startY) / rect.height;
      const f = fields.find((x) => x._localId === d.localId);
      if (!f) return;
      const newX = Math.max(0, Math.min(1 - f.width, d.origX + dx));
      const newY = Math.max(0, Math.min(1 - f.height, d.origY + dy));
      onChange(fields.map((x) => (x._localId === d.localId ? { ...x, x: newX, y: newY } : x)));
    };
    const handleUp = () => setDragging(null);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging, fields, onChange]);

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Sidebar */}
      <aside className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-5">
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-stone-900 mb-3">Signer</h3>
          <div className="space-y-2">
            {signers.map((s) => {
              const count = fields.filter((f) => f.signer_id === s.id).length;
              const active = s.id === activeSignerId;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSignerId(s.id)}
                  data-testid={`pick-signer-${s.id}`}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-all ${
                    active ? "bg-[#FAF5EE] ring-1 ring-[#C8A96E]" : "hover:bg-stone-50"
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0"
                    style={{ background: s.color }}
                  >
                    {s.name[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-stone-900 truncate">{s.name}</div>
                    <div className="text-xs text-stone-500 truncate">{count} field{count !== 1 ? "s" : ""}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-stone-900 mb-3">Field type</h3>
          <div className="grid grid-cols-2 gap-2">
            {FIELD_TYPES.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFieldType(f.id)}
                data-testid={`field-type-${f.id}`}
                className={`px-3 py-2 rounded-md text-xs font-medium border transition-all ${
                  activeFieldType === f.id
                    ? "border-[#0B3D3D] bg-[#0B3D3D] text-white"
                    : "border-stone-200 text-stone-700 hover:border-stone-400"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#FAF5EE] border border-[#C8A96E] rounded-xl p-4 text-xs text-stone-700 flex gap-2">
          <MousePointer2 className="w-4 h-4 mt-0.5 text-[#0B3D3D] flex-shrink-0" />
          <div>
            Click anywhere on a page to drop a field for <b style={{ color: activeSigner?.color }}>{activeSigner?.name}</b>.
            Drag fields to reposition. Click the × to remove.
          </div>
        </div>
      </aside>

      {/* PDF preview */}
      <div className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-4">
        {loading && <div className="text-stone-500 text-sm">Loading PDF…</div>}
        {error && <div className="text-[#B53D2F] text-sm">Could not load PDF: {error}</div>}
        {pages.map((p) => {
          const pageFields = fields.filter((f) => f.page === p.pageNumber);
          return (
            <PageCanvas key={p.pageNumber} info={p} onClick={(e) => handlePageClick(p.pageNumber, e)}>
              {pageFields.map((f) => {
                const owner = signers.find((s) => s.id === f.signer_id);
                return (
                  <div
                    key={f._localId}
                    data-testid={`placed-field-${f._localId}`}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setDragging({
                        localId: f._localId || "",
                        startX: e.clientX, startY: e.clientY,
                        origX: f.x, origY: f.y,
                      });
                    }}
                    style={{
                      position: "absolute",
                      left: `${f.x * 100}%`,
                      top: `${f.y * 100}%`,
                      width: `${f.width * 100}%`,
                      height: `${f.height * 100}%`,
                      background: `${owner?.color || "#0B3D3D"}22`,
                      borderColor: owner?.color || "#0B3D3D",
                    }}
                    className="border-2 border-dashed rounded cursor-move flex items-center justify-center text-[10px] font-semibold uppercase tracking-wider group"
                  >
                    <span style={{ color: owner?.color }}>{f.field_type}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeField(f._localId || "");
                      }}
                      data-testid={`remove-field-${f._localId}`}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-white border border-stone-300 rounded-full flex items-center justify-center text-stone-500 opacity-0 group-hover:opacity-100 hover:text-[#B53D2F] hover:border-[#B53D2F]"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </PageCanvas>
          );
        })}
      </div>
    </div>
  );
}
