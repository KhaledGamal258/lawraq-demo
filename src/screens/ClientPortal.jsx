import { useState } from 'react';
import BrandLogo from '../components/BrandLogo';

function FileIcon() {
  return (
    <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
      <path
        d="M11 1H3a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"
        stroke="#1C2D4F"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <path d="M11 1v6h6" stroke="#1C2D4F" strokeWidth="1.35" strokeLinejoin="round" />
      <rect x="4" y="13" width="7" height="1.4" rx="0.7" fill="#1C2D4F" opacity="0.45" />
      <rect x="4" y="16" width="5" height="1.4" rx="0.7" fill="#1C2D4F" opacity="0.3" />
    </svg>
  );
}

export default function ClientPortal({ client, lawyerName, latestSession, caseContent, onSendMessage }) {
  const [messageText, setMessageText] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const docs = caseContent.docs.filter((doc) => doc.visible);
  const visibleUpdates = caseContent.updates.filter((item) => item.visible);
  const messages = caseContent.messages;

  const displayedUpdates = latestSession
    ? [
        { title: 'قرار الجلسة الأخيرة', desc: latestSession.decision, date: latestSession.date.full, dot: '#C9A870' },
        ...visibleUpdates.map((item) => ({ ...item, dot: item.dotColor })),
      ]
    : visibleUpdates.map((item) => ({ ...item, dot: item.dotColor }));

  const onSend = () => {
    if (!messageText.trim()) return;
    onSendMessage(messageText);
    setMessageSent(true);
    setMessageText('');
  };

  return (
    <div dir="rtl" style={{ fontFamily: "'Almarai',sans-serif", background: '#F6F4F0', paddingBottom: 48, minHeight: '100vh' }}>
      {/* App nav bar */}
      <div style={{ background: '#1C2D4F', padding: '20px 20px' }}>
        <div style={{ maxWidth: 640, marginInline: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <BrandLogo compact dark markSize={34} />
          <div style={{ width: 38, height: 38, borderRadius: 19, background: 'rgba(201,168,112,0.14)', border: '1.5px solid rgba(201,168,112,0.32)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="3.5" fill="#C9A870" />
              <path d="M5 20c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="#C9A870" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <div style={{ maxWidth: 640, margin: '12px auto 0', color: 'rgba(255,255,255,0.78)', fontSize: 13, fontWeight: 700 }}>
          أهلًا {client.name} · دي آخر حالة لملفك
        </div>
      </div>

      <div style={{ padding: '20px 15px 0', maxWidth: 640, marginInline: 'auto', display: 'flex', flexDirection: 'column', gap: 26 }}>
        {/* HERO: CASE STATUS CARD */}
        <div style={{ background: '#1C2D4F', borderRadius: 18, overflow: 'hidden', boxShadow: '0 10px 32px rgba(28,45,79,0.24)' }}>
          <div style={{ height: 2.5, background: 'linear-gradient(to left, transparent 0%, #C9A870 20%, #C9A870 80%, transparent 100%)' }} />
          <div style={{ padding: '19px 19px 22px' }}>
            <div style={{ marginBottom: 15 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: client.statusBg, border: `1px solid ${client.statusBorder}`, borderRadius: 20, padding: '5px 12px' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: client.statusColor, animation: 'statusBlink 2.2s ease-in-out infinite', flexShrink: 0 }} />
                <span style={{ color: client.statusColor, fontSize: 12, fontWeight: 700 }}>{client.status}</span>
              </div>
            </div>

            <div style={{ color: '#fff', fontSize: 19, fontWeight: 800, lineHeight: 1.35, marginBottom: 5 }}>{client.caseTitle}</div>
            <div style={{ color: 'rgba(255,255,255,0.36)', fontSize: 12, lineHeight: 1.7, marginBottom: 22 }}>رقم القضية: {client.caseNumber} · {client.court}</div>

            {/* Stage tracker */}
            <div style={{ position: 'relative', paddingBottom: 2 }}>
              <div style={{ position: 'absolute', top: 4.5, right: '12.5%', left: '12.5%', height: 1.5, background: 'rgba(255,255,255,0.13)', borderRadius: 2 }} />
              <div style={{ position: 'absolute', top: 4.5, right: '12.5%', width: '50%', height: 1.5, background: 'rgba(255,255,255,0.5)', borderRadius: 2 }} />
              <div style={{ display: 'flex', position: 'relative', zIndex: 1 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.82)' }} />
                  <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 9, textAlign: 'center', lineHeight: 1.5 }}>رفع<br />الدعوى</div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.82)' }} />
                  <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 9, textAlign: 'center', lineHeight: 1.5 }}>مذكرة<br />الدفاع</div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#C9A870', marginTop: -1, animation: 'dotGlow 2.2s ease-in-out infinite' }} />
                  <div style={{ color: '#C9A870', fontSize: 9, textAlign: 'center', lineHeight: 1.5, fontWeight: 700 }}>الجلسة<br />القادمة</div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'transparent', border: '1.5px solid rgba(255,255,255,0.18)' }} />
                  <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9, textAlign: 'center', lineHeight: 1.5 }}>الحكم</div>
                </div>
              </div>
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '20px 0' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 5 }}>الجلسة القادمة</div>
                <div style={{ color: '#C9A870', fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{client.nextHearing.full}</div>
                <div style={{ color: 'rgba(255,255,255,0.36)', fontSize: 12, marginTop: 4 }}>{client.nextHearing.dayOfWeek} · الساعة {client.nextHearing.time}</div>
              </div>
              <div style={{ width: 50, height: 50, borderRadius: 12, background: 'rgba(201,168,112,0.1)', border: '1px solid rgba(201,168,112,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="#C9A870" strokeWidth="1.5" />
                  <path d="M3 10h18" stroke="#C9A870" strokeWidth="1.5" />
                  <path d="M8 3v3M16 3v3" stroke="#C9A870" strokeWidth="1.5" strokeLinecap="round" />
                  <rect x="7" y="14" width="2" height="2" rx="0.5" fill="#C9A870" />
                  <rect x="11" y="14" width="2" height="2" rx="0.5" fill="#C9A870" />
                  <rect x="15" y="14" width="2" height="2" rx="0.5" fill="#C9A870" />
                </svg>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, paddingTop: 15, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(201,168,112,0.17)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="3.5" fill="#C9A870" />
                    <path d="M5 20c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="#C9A870" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 10.5 }}>المحامي المسؤول</div>
                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginTop: 1 }}>{lawyerName}</div>
                </div>
              </div>
              <button
                type="button"
                style={{ background: 'rgba(201,168,112,0.14)', border: '1px solid rgba(201,168,112,0.3)', borderRadius: 20, padding: '7px 16px', color: '#C9A870', fontSize: 12, fontWeight: 700, fontFamily: "'Almarai',sans-serif", cursor: 'pointer', lineHeight: 1 }}
              >
                تواصل
              </button>
            </div>
          </div>
        </div>

        {/* SHARED DOCUMENTS */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13, padding: '0 2px' }}>
            <span style={{ color: '#1C2D4F', fontSize: 16, fontWeight: 800 }}>المستندات المشتركة</span>
            <span style={{ color: '#C9A870', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>عرض الكل</span>
          </div>
          <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            {docs.length === 0 && (
              <div style={{ color: '#9BA3AF', fontSize: 13, padding: '18px 16px', textAlign: 'center' }}>
                لا توجد مستندات مشاركة حاليًا
              </div>
            )}
            {docs.map((doc, idx) => (
              <div
                key={doc.name}
                style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 15px', borderBottom: idx < docs.length - 1 ? '1px solid #F0ECE5' : 'none' }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(28,45,79,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileIcon />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#1C2D4F', fontSize: 14, fontWeight: 700 }}>{doc.name}</div>
                  <div style={{ color: '#9BA3AF', fontSize: 12, marginTop: 2 }}>{doc.date} · {doc.size}</div>
                </div>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, cursor: 'pointer' }}>
                  <path d="M12 16V4M12 16l-4-4M12 16l4-4" stroke="#C9A870" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 20h16" stroke="#C9A870" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* CASE UPDATES TIMELINE */}
        <div>
          <div style={{ marginBottom: 13, padding: '0 2px' }}>
            <span style={{ color: '#1C2D4F', fontSize: 16, fontWeight: 800 }}>آخر التحديثات</span>
          </div>
          <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            {displayedUpdates.map((upd, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === displayedUpdates.length - 1;
              return (
                <div
                  key={upd.title}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    padding: isFirst ? '18px 17px 0' : isLast ? '0 17px 18px' : '0 17px',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 18, flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: upd.dot, marginTop: 3, flexShrink: 0 }} />
                    {!isLast && <div style={{ flex: 1, width: 1, background: '#ECE8E0', marginTop: 7, minHeight: 40 }} />}
                  </div>
                  <div style={{ flex: 1, paddingBottom: isLast ? 0 : 18 }}>
                    <div style={{ color: '#1C2D4F', fontSize: 14, fontWeight: 700, lineHeight: 1.4, marginBottom: 5 }}>{upd.title}</div>
                    <div style={{ color: '#5D6579', fontSize: 13, lineHeight: 1.6 }}>{upd.desc}</div>
                    <div style={{ color: '#B2B8C2', fontSize: 11.5, marginTop: 7 }}>{upd.date}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SHARED CONVERSATION */}
        <div>
          <div style={{ marginBottom: 13, padding: '0 2px' }}>
            <span style={{ color: '#1C2D4F', fontSize: 16, fontWeight: 800 }}>المحادثة مع مكتبك</span>
          </div>
          <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px rgba(0,0,0,0.05)', padding: '16px 15px' }}>
            {messageSent && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.18)', borderRadius: 10, padding: '10px 13px', marginBottom: 13 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M20 6L9 17l-5-5" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ color: '#16A34A', fontSize: 12.5, fontWeight: 700 }}>تم إرسال رسالتك بنجاح</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 14, maxHeight: 230, overflowY: 'auto' }}>
              {messages.slice(-5).map((message) => {
                const fromClient = message.from === 'client';
                return (
                  <div
                    key={message.id}
                    style={{
                      alignSelf: fromClient ? 'flex-start' : 'flex-end',
                      maxWidth: '88%',
                      background: fromClient ? '#F6F4F0' : '#1C2D4F',
                      color: fromClient ? '#1C2D4F' : '#FFFFFF',
                      borderRadius: fromClient ? '12px 12px 12px 3px' : '12px 12px 3px 12px',
                      padding: '9px 12px',
                    }}
                  >
                    <div style={{ fontSize: 12.5, lineHeight: 1.65 }}>{message.text}</div>
                    <div style={{ color: fromClient ? '#9BA3AF' : 'rgba(255,255,255,0.45)', fontSize: 9.5, marginTop: 4 }}>
                      {fromClient ? 'أنت' : lawyerName} · {message.time}
                    </div>
                  </div>
                );
              })}
            </div>

            <textarea
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                setMessageSent(false);
              }}
              placeholder="اكتب رسالتك هنا..."
              rows={3}
              aria-label="رسالتك لمحاميك"
              style={{ width: '100%', background: '#F6F4F0', border: '1.5px solid #ECE8E0', borderRadius: 10, padding: '12px 14px', fontFamily: "'Almarai',sans-serif", fontSize: 13, color: '#1C2D4F', resize: 'none', outline: 'none', lineHeight: 1.6, boxSizing: 'border-box', display: 'block' }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#B2B8C2', fontSize: 11.5 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#B2B8C2" strokeWidth="1.6" />
                  <path d="M12 8v4M12 16h.01" stroke="#B2B8C2" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <span>محاميك سيرد عند توفّره</span>
              </div>
              <button
                type="button"
                onClick={onSend}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1C2D4F', borderRadius: 20, padding: '8px 18px', cursor: 'pointer', border: 'none' }}
              >
                <span style={{ color: '#C9A870', fontSize: 12.5, fontWeight: 700, lineHeight: 1 }}>إرسال</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="#C9A870" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
