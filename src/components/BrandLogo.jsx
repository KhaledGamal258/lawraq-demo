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
      <path d="M10.5 37.5h25" stroke={primary} strokeWidth="2.2" strokeLinecap="round" />
      <rect x="11" y="12" width="6.5" height="23.5" rx="1.8" stroke={primary} strokeWidth="2" />
      <rect x="19.5" y="15.5" width="6.5" height="20" rx="1.8" stroke={secondary} strokeWidth="2" />
      <path d="M28 18.5h6.5v17H28z" stroke={primary} strokeWidth="2" strokeLinejoin="round" />
      <path d="M13.2 17h2.2M21.7 20.5h2.2M30.2 23.5h2.2" stroke={secondary} strokeWidth="1.6" strokeLinecap="round" />
      <rect x="37" y="11" width="4" height="4" rx="1.2" fill={primary} />
      <rect x="38.5" y="18.5" width="3" height="3" rx="1" fill={primary} opacity=".72" />
      <rect x="37" y="25" width="2.5" height="2.5" rx=".8" fill={primary} opacity=".45" />
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
          <div style={{ color: '#C9A870', fontSize: 9.2, fontWeight: 700, marginTop: 5, letterSpacing: 0 }}>
            إدارة قانونية بلا ورق
          </div>
        )}
      </div>
    </div>
  );
}
