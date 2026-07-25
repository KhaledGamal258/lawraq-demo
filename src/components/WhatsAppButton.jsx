function WhatsAppIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#25D366">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.87 9.87 0 0 0 4.75 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m0 1.67c2.2 0 4.27.86 5.82 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.55-3.7 8.24-8.24 8.24a8.24 8.24 0 0 1-4.19-1.14l-.3-.18-3.14.82.84-3.06-.2-.32a8.2 8.2 0 0 1-1.26-4.38c0-4.55 3.7-8.23 8.26-8.23m-4.52 4.7c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02 0 1.19.87 2.34 1 2.5.12.16 1.7 2.72 4.19 3.71 2.07.82 2.49.66 2.94.62.45-.04 1.45-.59 1.65-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28-.24-.12-1.45-.72-1.68-.8-.22-.08-.39-.12-.55.12-.16.24-.63.8-.77.96-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.19-.71-.63-1.19-1.42-1.33-1.66-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.81-.2-.48-.4-.42-.55-.42h-.24" />
    </svg>
  );
}

export default function WhatsAppButton({ onClick, compact = false, label = 'إرسال تذكير عبر واتساب', disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: compact ? 0 : 6,
        background: disabled ? '#F1EFEA' : 'rgba(37,211,102,0.1)',
        border: disabled ? '1px solid #E4E0D8' : '1px solid rgba(37,211,102,0.3)',
        borderRadius: 20,
        padding: compact ? '6px' : '6px 12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        flexShrink: 0,
      }}
    >
      <WhatsAppIcon />
      {!compact && <span style={{ color: disabled ? '#8E95A0' : '#1B8F4F', fontSize: 11.5, fontWeight: 700, fontFamily: "'Almarai',sans-serif", whiteSpace: 'nowrap' }}>{label}</span>}
    </button>
  );
}
