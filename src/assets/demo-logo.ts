// A compact SVG logo as a data URI for the demo company profile.
// This is a professional logistics-themed logo for "TradeFlow Nepal Exports"
export const DEMO_LOGO_BASE64 = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" fill="none">
  <rect width="240" height="80" rx="8" fill="#0F1B3D"/>
  <g transform="translate(10,8)">
    <!-- Globe -->
    <circle cx="32" cy="32" r="26" stroke="#F97316" stroke-width="2.5" fill="none"/>
    <ellipse cx="32" cy="32" rx="12" ry="26" stroke="#F97316" stroke-width="1.5" fill="none"/>
    <line x1="6" y1="32" x2="58" y2="32" stroke="#F97316" stroke-width="1.5"/>
    <line x1="32" y1="6" x2="32" y2="58" stroke="#F97316" stroke-width="1.5"/>
    <path d="M10 20 Q32 16 54 20" stroke="#F97316" stroke-width="1" fill="none"/>
    <path d="M10 44 Q32 48 54 44" stroke="#F97316" stroke-width="1" fill="none"/>
    <!-- Airplane -->
    <g transform="translate(20,12) rotate(-30)">
      <path d="M0 8 L6 6 L18 2 L20 0 L20 4 L18 6 L6 10 L0 12Z" fill="#F97316" opacity="0.8"/>
    </g>
  </g>
  <!-- Text -->
  <text x="72" y="30" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="18" fill="white" letter-spacing="1">TRADEFLOW</text>
  <text x="72" y="50" font-family="Arial,sans-serif" font-weight="700" font-size="11" fill="#F97316" letter-spacing="3">NEPAL EXPORTS</text>
  <line x1="72" y1="55" x2="220" y2="55" stroke="#F97316" stroke-width="1.5"/>
  <text x="72" y="68" font-family="Arial,sans-serif" font-weight="400" font-size="8" fill="#94A3B8" letter-spacing="1">IMPORT · EXPORT · LOGISTICS</text>
</svg>`)}`;
