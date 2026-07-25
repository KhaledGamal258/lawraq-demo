import { useState } from 'react';
import BrandLogo from './BrandLogo';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'لوحة التحكم' },
  { key: 'clients', label: 'الموكّلون' },
  { key: 'team', label: 'فريق المكتب' },
  { key: 'inheritance', label: 'حاسبة المواريث' },
];

function NavIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke={active ? '#C9A870' : 'rgba(255,255,255,0.45)'} strokeWidth="1.6" />
    </svg>
  );
}

export default function LawyerLayout({
  activeView,
  onNavigate,
  onAddClient,
  onHome,
  lawyerName,
  currentMember,
  teamMembers = [],
  onSwitchAccount,
  canAddClient = true,
  children,
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navButton = (item, mobile = false) => {
    const isActive = activeView === item.key;
    return (
      <button
        key={item.key}
        type="button"
        onClick={() => {
          onNavigate(item.key);
          if (mobile) setMobileNavOpen(false);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          width: '100%',
          textAlign: 'right',
          background: isActive ? 'rgba(201,168,112,0.14)' : 'transparent',
          border: 'none',
          borderRadius: 10,
          padding: '11px 14px',
          color: isActive ? '#C9A870' : 'rgba(255,255,255,0.65)',
          fontFamily: "'Almarai',sans-serif",
          fontSize: 14,
          fontWeight: isActive ? 800 : 700,
          cursor: 'pointer',
        }}
      >
        <NavIcon active={isActive} />
        {item.label}
      </button>
    );
  };

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: '#F6F4F0', display: 'flex', fontFamily: "'Almarai',sans-serif" }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex"
        style={{ width: 248, flexShrink: 0, background: '#1C2D4F', flexDirection: 'column', padding: '24px 16px', position: 'sticky', top: 0, height: '100vh' }}
      >
        <button
          type="button"
          onClick={onHome}
          style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'right', marginBottom: 32, padding: 0 }}
        >
          <BrandLogo dark markSize={40} />
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 24 }}>
          {NAV_ITEMS.map((item) => navButton(item))}
        </div>

        {canAddClient && (
          <button
            type="button"
            onClick={onAddClient}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'rgba(201,168,112,0.14)', border: '1px solid rgba(201,168,112,0.3)', borderRadius: 20, padding: '9px 14px', cursor: 'pointer' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="#C9A870" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            <span style={{ color: '#C9A870', fontSize: 12.5, fontWeight: 700 }}>قضية جديدة</span>
          </button>
        )}

        <div style={{ flex: 1 }} />

        <div style={{ paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 9.5, fontWeight: 700, marginBottom: 7 }}>تجربة حساب الفريق</div>
          <select
            value={currentMember?.id || ''}
            onChange={(event) => onSwitchAccount?.(event.target.value)}
            aria-label="تبديل حساب فريق المكتب"
            style={{ width: '100%', background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, padding: '8px 9px', fontFamily: "'Almarai',sans-serif", fontSize: 10.5, fontWeight: 700, outline: 'none', marginBottom: 11 }}
          >
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id} style={{ color: '#1C2D4F' }}>{member.name} — {member.role}</option>
            ))}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(201,168,112,0.17)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="3.5" fill="#C9A870" />
              <path d="M5 20c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="#C9A870" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
            <div>
              <div style={{ color: '#fff', fontSize: 11.5, fontWeight: 800 }}>{lawyerName}</div>
              <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 9, marginTop: 3 }}>{currentMember?.role}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Mobile top bar */}
        <div className="flex lg:hidden" style={{ background: '#1C2D4F', padding: '16px 16px', alignItems: 'center', justifyContent: 'space-between', gap: 10, position: 'relative' }}>
          <button
            type="button"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label="القائمة"
            style={{ width: 36, height: 36, borderRadius: 18, background: 'rgba(255,255,255,0.09)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <div style={{ textAlign: 'center' }}>
            <div dir="ltr" style={{ color: '#C9A870', fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>LAWRAQ</div>
            <div style={{ color: '#fff', fontSize: 14, fontWeight: 800 }}>{NAV_ITEMS.find((n) => n.key === activeView)?.label ?? ''}</div>
          </div>
          {canAddClient ? (
            <button
              type="button"
              onClick={onAddClient}
              aria-label="قضية جديدة"
              style={{ width: 36, height: 36, borderRadius: 18, background: 'rgba(201,168,112,0.14)', border: '1.5px solid rgba(201,168,112,0.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="#C9A870" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </button>
          ) : <div style={{ width: 36 }} />}

          {mobileNavOpen && (
            <div style={{ position: 'absolute', top: '100%', insetInline: 0, background: '#1C2D4F', padding: '10px 16px 16px', display: 'flex', flexDirection: 'column', gap: 4, zIndex: 30, boxShadow: '0 12px 24px rgba(0,0,0,0.18)' }}>
              {NAV_ITEMS.map((item) => navButton(item, true))}
              <select
                value={currentMember?.id || ''}
                onChange={(event) => {
                  onSwitchAccount?.(event.target.value);
                  setMobileNavOpen(false);
                }}
                aria-label="تبديل حساب فريق المكتب"
                style={{ width: '100%', background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, padding: '9px 11px', fontFamily: "'Almarai',sans-serif", fontSize: 11, fontWeight: 700 }}
              >
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id} style={{ color: '#1C2D4F' }}>{member.name} — {member.role}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  onHome();
                  setMobileNavOpen(false);
                }}
                style={{ background: 'none', border: 'none', textAlign: 'right', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700, padding: '11px 14px', cursor: 'pointer', fontFamily: "'Almarai',sans-serif" }}
              >
                رجوع لاختيار الواجهة
              </button>
            </div>
          )}
        </div>

        <div style={{ flex: 1, padding: '0', maxWidth: 1200, width: '100%', marginInline: 'auto' }}>{children}</div>
      </div>
    </div>
  );
}
