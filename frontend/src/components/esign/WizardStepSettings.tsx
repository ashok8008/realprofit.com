"use client";

interface Props {
  docTitle: string;
  signerCount: number;
  fieldCount: number;
  signingOrder: "sequential" | "parallel";
  expiryDays: number;
  setExpiryDays: (v: number) => void;
  uuidEnabled: boolean;
  setUuidEnabled: (v: boolean) => void;
  brandEnabled: boolean;
  setBrandEnabled: (v: boolean) => void;
}

/**
 * Step 4 of the eSign wizard: final settings + ready-to-send summary.
 */
export function WizardStepSettings({
  docTitle,
  signerCount,
  fieldCount,
  signingOrder,
  expiryDays,
  setExpiryDays,
  uuidEnabled,
  setUuidEnabled,
  brandEnabled,
  setBrandEnabled,
}: Props) {
  return (
    <section data-testid="step-4-settings" className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-stone-900 mb-1">Final settings</h2>
      <p className="text-sm text-stone-600 mb-6">Configure how this document behaves once sent.</p>

      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Expires in</label>
          <select
            value={expiryDays}
            onChange={(e) => setExpiryDays(parseInt(e.target.value))}
            data-testid="expiry-select"
            className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:border-[#0B3D3D]"
          >
            <option value={7}>7 days</option>
            <option value={15}>15 days (recommended)</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={0}>No expiry</option>
          </select>
        </div>

        <label className="flex items-start gap-3 cursor-pointer" data-testid="setting-uuid">
          <input
            type="checkbox"
            checked={uuidEnabled}
            onChange={(e) => setUuidEnabled(e.target.checked)}
            className="mt-1 w-4 h-4 accent-[#0B3D3D]"
          />
          <div>
            <div className="text-sm font-medium text-stone-900">Show signer ID under each signature</div>
            <div className="text-xs text-stone-600 mt-0.5">
              Adds a unique identifier under each signature for legal traceability.
            </div>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer" data-testid="setting-brand">
          <input
            type="checkbox"
            checked={brandEnabled}
            onChange={(e) => setBrandEnabled(e.target.checked)}
            className="mt-1 w-4 h-4 accent-[#0B3D3D]"
          />
          <div>
            <div className="text-sm font-medium text-stone-900">&quot;Powered by RealProfits&quot; footer</div>
            <div className="text-xs text-stone-600 mt-0.5">
              Free plans display this footer on signed PDFs. Pro removes it.
            </div>
          </div>
        </label>
      </div>

      <div className="mt-6 bg-[#FAF5EE] border border-[#C8A96E] rounded-xl p-5">
        <div className="text-sm font-semibold text-[#0B3D3D] mb-2">Ready to send</div>
        <ul className="text-sm text-stone-700 space-y-1">
          <li>• {docTitle}</li>
          <li>• {signerCount} signer{signerCount !== 1 ? "s" : ""} ({signingOrder})</li>
          <li>• {fieldCount} field{fieldCount !== 1 ? "s" : ""} to fill</li>
          <li>• Expires {expiryDays > 0 ? `in ${expiryDays} days` : "never"}</li>
        </ul>
      </div>
    </section>
  );
}
