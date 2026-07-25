export default function BrandLogo({ compact = false, dark = true }) {
  const primary = dark ? '#FFFFFF' : '#1C2D4F';

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1 }}>
      <div
        dir="ltr"
        aria-label="LAWRAQ"
        style={{
          display: 'inline-flex',
          alignItems: 'baseline',
          color: primary,
          fontFamily: "'Almarai', Arial, sans-serif",
          fontSize: compact ? 16 : 22,
          fontWeight: 800,
          letterSpacing: compact ? 1.7 : 2.3,
        }}
      >
        <span>LAW</span>
        <span style={{ color: '#C9A870' }}>RAQ</span>
      </div>
      {!compact && (
        <div
          style={{
            color: dark ? '#E4D3AE' : '#8D7141',
            fontSize: 9,
            fontWeight: 700,
            marginTop: 6,
            letterSpacing: 0,
          }}
        >
          إدارة قانونية بلا ورق
        </div>
      )}
    </div>
  );
}
