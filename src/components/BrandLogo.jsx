export function BrandMark({ size = 40, dark = true }) {
  const background = dark ? '#1C2D4F' : '#FFFFFF';
  const primary = '#C9A870';
  const secondary = dark ? '#FFFFFF' : '#1C2D4F';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <rect x="2" y="2" width="44" height="44" rx="13" fill={background} />
      <path
        d="M15 11.5h12l7 7V36H15V11.5Z"
        stroke={primary}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M27 11.5v7h7" stroke={primary} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M20 25h9M20 30h6" stroke={secondary} strokeWidth="2" strokeLinecap="round" />
      <circle cx="36.5" cy="11.5" r="2.5" fill={primary} />
    </svg>
  );
}

export default function BrandLogo({ compact = false, dark = true, markSize = 40 }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: compact ? 8 : 11 }}>
      <BrandMark size={markSize} dark={dark} />
      <div style={{ textAlign: 'right', lineHeight: 1 }}>
        <div
          dir="ltr"
          style={{
            color: dark ? '#FFFFFF' : '#1C2D4F',
            fontSize: compact ? 15 : 20,
            fontWeight: 800,
            letterSpacing: 1.4,
          }}
        >
          LAWRAQ
        </div>
        {!compact && (
          <div style={{ color: '#C9A870', fontSize: 9.5, fontWeight: 700, marginTop: 5, letterSpacing: 0.2 }}>
            لا ورق · لا فوضى
          </div>
        )}
      </div>
    </div>
  );
}
