import { useState } from 'react';
import { upcomingHearings as upcomingHearingsDefault, getTeamMemberById } from '../data/clients';
import { getUrgentDeadlines, getUrgencyStyle, formatDeadlineMessage } from '../utils/deadlines';
import { toArNum } from '../utils/arabicDate';

const OWNER_ID = 'nadine';

export default function LawyerDashboard({ lawyerName, onOpenCase, onOpenClients, upcomingHearings = upcomingHearingsDefault, allClients = [] }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'mine'

  const displayedHearings = filter === 'mine'
    ? upcomingHearings.filter((h) => h.assignedTo === OWNER_ID)
    : upcomingHearings;

  const urgentDeadlines = getUrgentDeadlines(allClients);
  const activeClients = allClients.filter((client) => !client.archived);
  const activeCases = activeClients.filter((client) => client.status !== 'منتهية');

  return (
    <div dir="rtl" style={{ fontFamily: "'Almarai',sans-serif", padding: '20px 16px 40px', display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Greeting + stats hero card */}
      <div style={{ background: '#1C2D4F', borderRadius: 18, overflow: 'hidden', boxShadow: '0 10px 32px rgba(28,45,79,0.24)' }}>
        <div style={{ height: 2.5, background: 'linear-gradient(to left, transparent 0%, #C9A870 20%, #C9A870 80%, transparent 100%)' }} />
        <div style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <div style={{ color: '#C9A870', fontSize: 11, fontWeight: 700, letterSpacing: 0.8, marginBottom: 3 }}>أهلاً بعودتك</div>
              <div style={{ color: '#fff', fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{lawyerName}</div>
            </div>
            <div style={{ position: 'relative', width: 38, height: 38, borderRadius: 19, background: 'rgba(201,168,112,0.14)', border: '1.5px solid rgba(201,168,112,0.32)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#C9A870" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#C9A870" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', top: 5, left: 5, width: 8, height: 8, borderRadius: '50%', background: '#EF4444', border: '1.5px solid #1C2D4F' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { value: toArNum(activeClients.length), label: 'موكّل\nنشط' },
              { value: toArNum(activeCases.length), label: 'قضية\nجارية' },
              { value: toArNum(upcomingHearings.length), label: 'جلسات\nقادمة' },
            ].map((stat) => (
              <div key={stat.value} style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ color: '#C9A870', fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 5, lineHeight: 1.5 }}>
                  {stat.label.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i === 0 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Urgent appeal/deadline alerts */}
      {urgentDeadlines.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '15px 16px 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#EF4444" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M12 9v4M12 17h.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ color: '#1C2D4F', fontSize: 15, fontWeight: 800 }}>مواعيد عاجلة</span>
          </div>
          <div style={{ padding: '6px 8px 10px' }}>
            {urgentDeadlines.map(({ client, daysLeft }) => {
              const style = getUrgencyStyle(daysLeft < 0 ? 'overdue' : daysLeft <= 3 ? 'critical' : daysLeft <= 7 ? 'warning' : 'soft');
              return (
                <div
                  key={client.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenCase(client.id)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpenCase(client.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, background: style.bg, border: `1px solid ${style.border}`, borderRadius: 10, padding: '10px 12px', margin: '4px 8px', cursor: 'pointer' }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: style.icon, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: style.text, fontSize: 12.5, fontWeight: 800, marginBottom: 2 }}>
                      {formatDeadlineMessage(daysLeft, client.appealLabel || 'الاستئناف')}
                    </div>
                    <div style={{ color: style.text, opacity: 0.75, fontSize: 11 }}>{client.name} — {client.caseTitle}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming hearings */}
      <div style={{ background: '#1C2D4F', borderRadius: 18, overflow: 'hidden', boxShadow: '0 10px 32px rgba(28,45,79,0.24)' }}>
        <div style={{ height: 2.5, background: 'linear-gradient(to left, transparent 0%, #C9A870 20%, #C9A870 80%, transparent 100%)' }} />
        <div style={{ padding: '18px 20px 6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ color: '#C9A870', fontSize: 11, fontWeight: 700, letterSpacing: 0.8, marginBottom: 3 }}>المواعيد الأقرب</div>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 800 }}>الجلسات القادمة</div>
            </div>
            <div style={{ background: 'rgba(201,168,112,0.12)', border: '1px solid rgba(201,168,112,0.22)', borderRadius: 20, padding: '4px 13px' }}>
              <span style={{ color: '#C9A870', fontSize: 12, fontWeight: 700 }}>{toArNum(displayedHearings.length)} جلسات</span>
            </div>
          </div>

          {/* Segmented toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.07)', borderRadius: 22, padding: 3, marginBottom: 18, width: 'fit-content' }}>
            {[{ key: 'all', label: 'كل القضايا' }, { key: 'mine', label: 'قضاياي' }].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setFilter(opt.key)}
                style={{
                  background: filter === opt.key ? 'rgba(201,168,112,0.2)' : 'transparent',
                  border: filter === opt.key ? '1px solid rgba(201,168,112,0.35)' : '1px solid transparent',
                  borderRadius: 19,
                  padding: '5px 14px',
                  color: filter === opt.key ? '#C9A870' : 'rgba(255,255,255,0.45)',
                  fontSize: 12,
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

          {displayedHearings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 16px', color: 'rgba(255,255,255,0.3)', fontSize: 13, paddingBottom: 26 }}>
              لا توجد جلسات قادمة مسجلة باسمك
            </div>
          ) : (
            displayedHearings.map((h, idx) => {
              const assignee = getTeamMemberById(h.assignedTo);
              return (
                <div
                  key={h.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenCase(h.id)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpenCase(h.id)}
                  style={{ display: 'flex', alignItems: 'flex-start', marginBottom: idx < displayedHearings.length - 1 ? 15 : 0, paddingBottom: idx < displayedHearings.length - 1 ? 15 : 20, borderBottom: idx < displayedHearings.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none', cursor: 'pointer' }}
                >
                  <div style={{ width: 42, flexShrink: 0, textAlign: 'center' }}>
                    <div style={{ color: '#C9A870', fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{h.nextHearing.day}</div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9.5, marginTop: 2 }}>{h.nextHearing.month}</div>
                  </div>
                  <div style={{ width: 1, background: 'rgba(201,168,112,0.25)', alignSelf: 'stretch', margin: '0 14px', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontSize: 13.5, fontWeight: 700, marginBottom: 3, lineHeight: 1.3 }}>{h.caseTitle}</div>
                    <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: 11, marginBottom: 2 }}>{h.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.24)', fontSize: 10.5, marginBottom: assignee ? 7 : 0 }}>{h.courtShort} · {h.nextHearing.timeShort}</div>
                    {assignee && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: assignee.avatarColor }} />
                        <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: 10.5, fontWeight: 700 }}>{assignee.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CTA to full clients list */}
      <button
        type="button"
        onClick={onOpenClients}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#fff', border: '1.5px solid #E8E4DC', borderRadius: 14, padding: '14px 20px', cursor: 'pointer', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}
      >
        <span style={{ color: '#1C2D4F', fontSize: 14, fontWeight: 800 }}>عرض كل الموكّلين</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M15 6l-6 6 6 6" stroke="#1C2D4F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
