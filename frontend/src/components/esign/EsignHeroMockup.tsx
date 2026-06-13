"use client";

/**
 * Stylised mockup of the eSign tool — shown on the right side of the hero on
 * /tools/esign. Pure inline SVG so it scales crisply on every device and has
 * zero load cost. Uses the brand teal + gold so it sits naturally on the
 * dark-teal hero background.
 */
export function EsignHeroMockup() {
  return (
    <svg
      viewBox="0 0 480 360"
      role="img"
      aria-label="A PDF document mockup showing one signature field already signed with a green checkmark and one field pending signature"
      className="w-full h-auto max-w-md drop-shadow-2xl"
      data-testid="esign-hero-mockup"
    >
      {/* Drop shadow */}
      <defs>
        <filter id="paperShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.35" />
        </filter>
        <linearGradient id="paperGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FAF7F0" />
        </linearGradient>
      </defs>

      {/* Page background */}
      <g filter="url(#paperShadow)">
        <rect x="40" y="20" width="400" height="320" rx="6" fill="url(#paperGrad)" />

        {/* Header bar (mimicking a document title) */}
        <rect x="64" y="44" width="180" height="14" rx="3" fill="#0B3D3D" />
        <rect x="64" y="66" width="120" height="6" rx="2" fill="#0B3D3D" opacity="0.25" />

        {/* Body lines */}
        {[100, 116, 132, 148, 164].map((y, i) => (
          <rect
            key={i}
            x="64"
            y={y}
            width={i === 4 ? 220 : 352}
            height="4"
            rx="2"
            fill="#0B3D3D"
            opacity="0.18"
          />
        ))}

        {/* Section break */}
        <rect x="64" y="190" width="80" height="6" rx="2" fill="#C8A96E" />
        {[208, 222, 236].map((y, i) => (
          <rect key={i} x="64" y={y} width={i === 2 ? 200 : 340} height="3.5" rx="2" fill="#0B3D3D" opacity="0.16" />
        ))}

        {/* SIGNED field (left) — green checkmark + handwritten-looking signature stroke */}
        <g>
          <rect x="64" y="264" width="160" height="56" rx="4" fill="#ECFBF1" stroke="#2A6B45" strokeWidth="1.5" />
          <text x="72" y="280" fontSize="9" fontWeight="700" fill="#2A6B45" fontFamily="ui-sans-serif">
            SIGNED
          </text>
          {/* Faux signature curve */}
          <path
            d="M76 308 C 96 286, 112 322, 132 296 S 160 308, 184 294"
            stroke="#0B3D3D"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          {/* Green checkmark badge */}
          <circle cx="210" cy="278" r="11" fill="#2A6B45" />
          <path d="M205 278 L209 282 L216 274" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* PENDING field (right) — dashed border + "Sign here" label */}
        <g>
          <rect
            x="256"
            y="264"
            width="160"
            height="56"
            rx="4"
            fill="none"
            stroke="#C8A96E"
            strokeWidth="1.6"
            strokeDasharray="6 4"
          />
          <text x="266" y="280" fontSize="9" fontWeight="700" fill="#C8A96E" fontFamily="ui-sans-serif">
            PENDING
          </text>
          <text
            x="336"
            y="302"
            fontSize="13"
            fontWeight="600"
            fill="#0B3D3D"
            fontFamily="ui-sans-serif"
            textAnchor="middle"
          >
            Sign here
          </text>
          {/* Pulse dot */}
          <circle cx="408" cy="278" r="5" fill="#C8A96E">
            <animate attributeName="r" values="5;8;5" dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.4;1" dur="1.6s" repeatCount="indefinite" />
          </circle>
        </g>
      </g>
    </svg>
  );
}
