import { useMemo, useState } from 'react';
import { clients as clientsDefault, caseTypes, courts, governorates, getTeamMemberById } from '../data/clients';
import WhatsAppButton from '../components/WhatsAppButton';

function buildClientLink(id) {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('client', id);
  return url.toString();
}

function selectStyle() {
  return {
    background: '#fff',
    border: '1.5px solid #E8E4DC',
    borderRadius: 10,
    padding: '9px 10px',
    fontFamily: "'Almarai',sans-serif",
    fontSize: 12.5,
    color: '#1C2D4F',
    outline: 'none',
    cursor: 'pointer',
  };
}

export default function ClientsView({ onOpenCase, allClients = clientsDefault, onCopied, onWhatsAppClick }) {
  const [tab, setTab] = useState('active');
  const [search, setSearch] = useState('');
  const [caseType, setCaseType] = useState('');
  const [court, setCourt] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const tabClients = useMemo(
    () => allClients.filter((c) => (tab === 'archived' ? c.archived : !c.archived)),
    [allClients, tab]
  );

  const filtered = useMemo(() => {
    return tabClients.filter((c) => {
      if (search.trim() && !c.name.includes(search.trim())) return false;
      if (caseType && c.caseType !== caseType) return false;
      if (court && c.court !== court) return false;
      if (governorate && c.governorate !== governorate) return false;
      return true;
    });
  }, [tabClients, search, caseType, court, governorate]);

  const emptyMessage = tab === 'archived' ? 'لا توجد قضايا مؤرشفة مطابقة' : 'لا يوجد موكّلون مطابقون';

  const onCopyLink = (id) => {
    const link = buildClientLink(id);
    navigator.clipboard?.writeText(link)?.catch(() => {});
    setCopiedId(id);
    if (onCopied) onCopied();
    setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1800);
  };

  return (
    <div style={{ padding: '20px 16px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ color: '#1C2D4F', fontSize: 18, fontWeight: 800 }}>الموكّلون</span>
        <span style={{ color: '#9BA3AF', fontSize: 12.5 }}>{filtered.length} من {tabClients.length}</span>
      </div>

      {/* Active / Archive tabs */}
      <div style={{ display: 'flex', background: '#fff', borderRadius: 20, padding: 3, width: 'fit-content', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
        {[
          { key: 'active', label: 'النشطون' },
          { key: 'archived', label: 'الأرشيف' },
        ].map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setTab(opt.key)}
            style={{
              background: tab === opt.key ? '#1C2D4F' : 'transparent',
              border: 'none',
              borderRadius: 18,
              padding: '7px 16px',
              color: tab === opt.key ? '#C9A870' : '#9BA3AF',
              fontSize: 12.5,
              fontWeight: 700,
              fontFamily: "'Almarai',sans-serif",
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px rgba(0,0,0,0.05)', padding: '14px 14px', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالاسم..."
          aria-label="بحث بالاسم"
          style={{ flex: '1 1 200px', background: '#F6F4F0', border: '1.5px solid #ECE8E0', borderRadius: 10, padding: '9px 12px', fontFamily: "'Almarai',sans-serif", fontSize: 13, color: '#1C2D4F', outline: 'none' }}
        />
        <select value={caseType} onChange={(e) => setCaseType(e.target.value)} style={{ ...selectStyle(), flex: '1 1 130px' }}>
          <option value="">كل أنواع القضايا</option>
          {caseTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select value={court} onChange={(e) => setCourt(e.target.value)} style={{ ...selectStyle(), flex: '1 1 160px' }}>
          <option value="">كل المحاكم</option>
          {courts.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={governorate} onChange={(e) => setGovernorate(e.target.value)} style={{ ...selectStyle(), flex: '1 1 130px' }}>
          <option value="">كل المحافظات</option>
          {governorates.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block" style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Almarai',sans-serif" }}>
          <thead>
            <tr style={{ background: '#F6F4F0' }}>
              {['الموكّل', 'القضايا النشطة', 'الجلسة القادمة', 'الحالة', 'المسند إليه', ''].map((h) => (
                <th key={h} style={{ textAlign: 'right', padding: '12px 16px', color: '#9BA3AF', fontSize: 11.5, fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} style={{ borderTop: '1px solid #F0ECE5' }}>
                <td style={{ padding: '12px 16px', cursor: 'pointer' }} onClick={() => onOpenCase(c.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: c.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14, fontWeight: 800, color: c.avatarColor }}>{c.initial}</div>
                    <div>
                      <div style={{ color: '#1C2D4F', fontSize: 13.5, fontWeight: 800 }}>{c.name}</div>
                      <div style={{ color: '#9BA3AF', fontSize: 11.5 }}>{c.caseTitle}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', color: '#5D6579', fontSize: 13 }}>{c.activeCases}</td>
                <td style={{ padding: '12px 16px', color: '#5D6579', fontSize: 13 }}>{c.nextHearing.full}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: c.statusBg, border: `1px solid ${c.statusBorder}`, borderRadius: 20, padding: '3px 9px' }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: c.statusColor }} />
                    <span style={{ color: c.statusColor, fontSize: 11, fontWeight: 700 }}>{c.status}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {(() => { const m = getTeamMemberById(c.assignedTo); return m ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: m.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: m.avatarColor, flexShrink: 0 }}>{m.initial}</div>
                      <span style={{ color: '#5D6579', fontSize: 12.5, fontWeight: 700 }}>{m.name}</span>
                    </div>
                  ) : null; })()}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => onCopyLink(c.id)}
                      style={{ background: copiedId === c.id ? 'rgba(22,163,74,0.1)' : 'rgba(28,45,79,0.07)', border: 'none', borderRadius: 20, padding: '6px 12px', cursor: 'pointer', color: copiedId === c.id ? '#16A34A' : '#1C2D4F', fontSize: 11.5, fontWeight: 700, fontFamily: "'Almarai',sans-serif", whiteSpace: 'nowrap' }}
                    >
                      {copiedId === c.id ? 'تم النسخ' : 'نسخ رابط الموكّل'}
                    </button>
                    <WhatsAppButton compact onClick={onWhatsAppClick} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: '#9BA3AF', fontSize: 13 }}>{emptyMessage}</div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="flex md:hidden" style={{ flexDirection: 'column', gap: 10 }}>
        {filtered.map((c) => (
          <div key={c.id} style={{ background: '#fff', borderRadius: 14, padding: '14px 15px', boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
            <div role="button" tabIndex={0} onClick={() => onOpenCase(c.id)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpenCase(c.id)} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: c.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16, fontWeight: 800, color: c.avatarColor }}>{c.initial}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
                  <div style={{ color: '#1C2D4F', fontSize: 14.5, fontWeight: 800 }}>{c.name}</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: c.statusBg, border: `1px solid ${c.statusBorder}`, borderRadius: 20, padding: '3px 9px', flexShrink: 0 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: c.statusColor }} />
                    <span style={{ color: c.statusColor, fontSize: 11, fontWeight: 700 }}>{c.status}</span>
                  </div>
                </div>
                <div style={{ color: '#5D6579', fontSize: 12.5, marginBottom: 6 }}>{c.caseTitle}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#B2B8C2', fontSize: 11, marginBottom: 6 }}>
                  <span>{c.nextHearing.full}</span>
                  <span style={{ color: '#D4CFC5', margin: '0 2px' }}>·</span>
                  <span>{c.courtShort}</span>
                </div>
                {(() => { const m = getTeamMemberById(c.assignedTo); return m ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: m.avatarColor }} />
                    <span style={{ color: '#9BA3AF', fontSize: 11, fontWeight: 700 }}>{m.name}</span>
                  </div>
                ) : null; })()}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => onCopyLink(c.id)}
                style={{ flex: 1, background: copiedId === c.id ? 'rgba(22,163,74,0.1)' : 'rgba(28,45,79,0.07)', border: 'none', borderRadius: 20, padding: '8px 12px', cursor: 'pointer', color: copiedId === c.id ? '#16A34A' : '#1C2D4F', fontSize: 12, fontWeight: 700, fontFamily: "'Almarai',sans-serif" }}
              >
                {copiedId === c.id ? 'تم النسخ' : 'نسخ رابط الموكّل'}
              </button>
              <WhatsAppButton compact onClick={onWhatsAppClick} />
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: '#9BA3AF', fontSize: 13, background: '#fff', borderRadius: 14 }}>{emptyMessage}</div>
        )}
      </div>
    </div>
  );
}
