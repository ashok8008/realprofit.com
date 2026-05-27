"use client";
import { useEffect, useRef, useState } from "react";
import SignaturePad from "react-signature-canvas";
import { Pen, Type as TypeIcon, Upload as UploadIcon, Eraser } from "lucide-react";

const SIG_FONTS = [
  { id: "dancing", family: "'Dancing Script', cursive", label: "Handwritten" },
  { id: "alex", family: "'Alex Brush', cursive", label: "Elegant" },
  { id: "great", family: "'Great Vibes', cursive", label: "Formal" },
  { id: "homemade", family: "'Homemade Apple', cursive", label: "Casual" },
];

const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&family=Alex+Brush&family=Great+Vibes&family=Homemade+Apple&display=swap";

export type SignatureMethod = "draw" | "type" | "upload";

interface Props {
  onChange: (base64Png: string | null) => void;
  initialName?: string;
}

export function SignatureCreator({ onChange, initialName = "" }: Props) {
  const [method, setMethod] = useState<SignatureMethod>("draw");
  const [typedName, setTypedName] = useState(initialName);
  const [typedFont, setTypedFont] = useState(SIG_FONTS[0].id);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const padRef = useRef<SignaturePad | null>(null);

  // Load font CSS once
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("esign-fonts")) return;
    const link = document.createElement("link");
    link.id = "esign-fonts";
    link.rel = "stylesheet";
    link.href = GOOGLE_FONTS_URL;
    document.head.appendChild(link);
  }, []);

  // Emit current signature whenever the source changes
  useEffect(() => {
    if (method === "type" && typedName.trim()) {
      // Render typed name onto a canvas and emit PNG
      const c = document.createElement("canvas");
      c.width = 600;
      c.height = 160;
      const ctx = c.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.fillStyle = "#1C1B18";
        const font = SIG_FONTS.find((f) => f.id === typedFont)?.family || SIG_FONTS[0].family;
        ctx.font = `64px ${font}`;
        ctx.textBaseline = "middle";
        ctx.fillText(typedName, 16, 90);
        onChange(c.toDataURL("image/png"));
      }
    } else if (method === "upload") {
      onChange(uploadedPreview);
    }
    // for "draw" we emit onEnd via the SignaturePad onEnd callback
  }, [method, typedName, typedFont, uploadedPreview, onChange]);

  const handleDrawEnd = () => {
    if (!padRef.current) return;
    if (padRef.current.isEmpty()) {
      onChange(null);
      return;
    }
    onChange(padRef.current.toDataURL("image/png"));
  };

  const clearDraw = () => {
    padRef.current?.clear();
    onChange(null);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setUploadedPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full">
      <div className="flex gap-1 p-1 bg-stone-100 rounded-lg mb-3">
        {[
          { id: "draw" as const, icon: Pen, label: "Draw" },
          { id: "type" as const, icon: TypeIcon, label: "Type" },
          { id: "upload" as const, icon: UploadIcon, label: "Upload" },
        ].map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMethod(m.id)}
            data-testid={`sig-method-${m.id}`}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              method === m.id
                ? "bg-white text-[#0B3D3D] shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <m.icon className="w-4 h-4" />
            {m.label}
          </button>
        ))}
      </div>

      {method === "draw" && (
        <div className="space-y-2">
          <div className="border-2 border-dashed border-stone-300 rounded-lg bg-stone-50/50 relative" data-testid="sig-pad-wrapper">
            <SignaturePad
              ref={padRef}
              onEnd={handleDrawEnd}
              canvasProps={{
                className: "w-full h-40",
              }}
              penColor="#1C1B18"
            />
          </div>
          <div className="flex justify-between items-center text-xs text-stone-500">
            <span>Sign with mouse or touch</span>
            <button
              type="button"
              onClick={clearDraw}
              data-testid="sig-clear-btn"
              className="flex items-center gap-1 text-stone-600 hover:text-[#B53D2F]"
            >
              <Eraser className="w-3 h-3" /> Clear
            </button>
          </div>
        </div>
      )}

      {method === "type" && (
        <div className="space-y-3">
          <input
            type="text"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder="Type your full name"
            data-testid="sig-type-input"
            className="w-full px-3 py-2 border border-stone-300 rounded-md text-base focus:outline-none focus:border-[#0B3D3D]"
            maxLength={40}
          />
          <div className="border-2 border-stone-200 rounded-lg p-4 bg-white h-32 flex items-center">
            <div
              style={{
                fontFamily: SIG_FONTS.find((f) => f.id === typedFont)?.family,
                fontSize: 44,
                color: "#1C1B18",
              }}
              data-testid="sig-type-preview"
            >
              {typedName || "Your signature"}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {SIG_FONTS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setTypedFont(f.id)}
                data-testid={`sig-font-${f.id}`}
                style={{ fontFamily: f.family }}
                className={`px-3 py-1.5 rounded-md text-base border transition-all ${
                  typedFont === f.id
                    ? "border-[#C8A96E] bg-[#FAF5EE] text-[#0B3D3D]"
                    : "border-stone-200 text-stone-600 hover:border-stone-400"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {method === "upload" && (
        <div className="space-y-2">
          <label
            htmlFor="sig-upload"
            data-testid="sig-upload-label"
            className="block border-2 border-dashed border-stone-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#0B3D3D] transition-colors bg-stone-50/50"
          >
            <UploadIcon className="w-6 h-6 mx-auto text-stone-400 mb-2" />
            <div className="text-sm text-stone-600">
              {uploadedPreview ? "Replace signature image" : "Upload signature image (PNG/JPG)"}
            </div>
            <input
              id="sig-upload"
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleFile}
              className="hidden"
              data-testid="sig-upload-input"
            />
          </label>
          {uploadedPreview && (
            <div className="border border-stone-200 rounded-md p-2 bg-white">
              <img
                src={uploadedPreview}
                alt="Signature preview"
                className="max-h-32 mx-auto"
                data-testid="sig-upload-preview"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
