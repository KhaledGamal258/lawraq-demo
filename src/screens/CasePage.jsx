import { useState } from 'react';
import { team, getTeamMemberById, CASE_STATUS_OPTIONS } from '../data/clients';
import { buildDateObj } from '../utils/arabicDate';
import { openMockDocument, getFileTypeLabel } from '../utils/mockFiles';
import { generateId } from '../utils/id';
import { getDaysRemaining, getAppealUrgency, getUrgencyStyle, formatDeadlineMessage } from '../utils/deadlines';
import WhatsAppButton from '../components/WhatsAppButton';

function FileIcon() {
  return (
    <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
      <path d="M11 1H3a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" stroke="#1C2D4F" strokeWidth="1.35" strokeLinejoin="round" />
      <path d="M11 1v6h6" stroke="#1C2D4F" strokeWidth="1.35" strokeLinejoin="round" />
      <rect x="4" y="13" width="7" height="1.3" rx="0.65" fill="#1C2D4F" opacity="0.4" />
      <rect x="4" y="16" width="5" height="1.3" rx="0.65" fill="#1C2D4F" opacity="0.25" />
    </svg>
  );
}

function VisiblePill({ compact }) {
  const size = compact ? 12 : 13;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: compact ? 5 : 6, background: 'rgba(22,163,74,0.09)', border: '1.5px solid rgba(22,163,74,0.3)', borderRadius: 20, padding: compact ? '4px 10px 4px 8px' : '5px 13px 5px 10px' }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#16A34A" strokeWidth={compact ? 1.9 : 1.8} strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" stroke="#16A34A" strokeWidth={compact ? 1.9 : 1.8} />
      </svg>
      <span style={{ color: '#16A34A', fontSize: compact ? 10.5 : 12, fontWeight: 700, lineHeight: 1, whiteSpace: compact ? 'nowrap' : undefined }}>
        {compact ? 'للموكّل' : 'مرئي للموكّل'}
      </span>
    </div>
  );
}

function NotVisiblePill({ compact }) {
  const size = compact ? 12 : 13;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: compact ? 5 : 6, background: 'rgba(156,163,175,0.1)', border: '1.5px solid rgba(156,163,175,0.28)', borderRadius: 20, padding: compact ? '4px 10px 4px 8px' : '5px 13px 5px 10px' }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="11" width="18" height="11" rx="2" stroke="#9CA3AF" strokeWidth={compact ? 1.9 : 1.8} />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#9CA3AF" strokeWidth={compact ? 1.9 : 1.8} strokeLinecap="round" />
      </svg>
      <span style={{ color: '#9CA3AF', fontSize: compact ? 10.5 : 12, fontWeight: 700, lineHeight: 1, whiteSpace: compact ? 'nowrap' : undefined }}>
        {compact ? 'داخلي' : 'داخلي فقط'}
      </span>
    </div>
  );
}

export default function CasePage({
  client,
  lawyerName,
  onBack,
  sessions = [],
  onAddSession,
  onReassign,
  onArchive,
  onRestore,
  onStatusChange,
  caseContent,
  onToggleDocument,
  onToggleUpdate,
  onSendCaseMessage,
  onWhatsAppClick,
  onTemplatesClick,
}) {
  const archived = !!client.archived;
  const docs = caseContent.docs;
  const updates = caseContent.updates;
  const messages = caseContent.messages;
  const [replyText, setReplyText] = useState('');
  const [teamMessages, setTeamMessages] = useState(() =>
    (client.teamDiscussion || []).map((m) => (m.id ? m : { ...m, id: generateId('team-msg') }))
  );
  const [teamReplyText, setTeamReplyText] = useState('');

  const [reassignOpen, setReassignOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formDate, setFormDate] = useState('');
  const [formDecision, setFormDecision] = useState('');
  const [formNextDate, setFormNextDate] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmArchiveOpen, setConfirmArchiveOpen] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [finishPromptDismissed, setFinishPromptDismissed] = useState(false);

  const showFinishPrompt = client.status === 'منتهية' && !archived && !finishPromptDismissed;

  const appealDaysLeft = client.appealDeadline ? getDaysRemaining(client.appealDeadline) : null;
  const showAppealBanner = !archived && appealDaysLeft !== null && appealDaysLeft <= 10;
  const appealUrgency = showAppealBanner ? getAppealUrgency(appealDaysLeft) : null;
  const appealStyle = showAppealBanner ? getUrgencyStyle(appealUrgency) : null;

  const handleStatusSelect = (key) => {
    setStatusMenuOpen(false);
    if (onStatusChange) onStatusChange(key);
    if (key === 'منتهية') setFinishPromptDismissed(false);
  };

  const toggleDoc = (documentId) => {
    if (archived) return;
    onToggleDocument(documentId);
  };

  const toggleUpdate = (updateId) => {
    if (archived) return;
    onToggleUpdate(updateId);
  };

  const confirmArchive = () => {
    setConfirmArchiveOpen(false);
    setMenuOpen(false);
    if (onArchive) onArchive();
  };

  const onSendReply = () => {
    const text = replyText.trim();
    if (!text) return;
    onSendCaseMessage(text);
    setReplyText('');
  };

  const onSendTeamReply = () => {
    const text = teamReplyText.trim();
    if (!text) return;
    setTeamMessages([...teamMessages, { id: generateId('team-msg'), from: 'nadine', text, time: 'الآن' }]);
    setTeamReplyText('');
  };

  const handleSaveSession = () => {
    if (!formDecision.trim()) return;
    const dateObj = formDate ? buildDateObj(formDate) : { day: '', month: '', full: 'تاريخ غير محدد' };
    const nextHearingObj = formNextDate ? buildDateObj(formNextDate) : null;
    const newSession = {
      id: generateId('session'),
      date: dateObj,
      decision: formDecision.trim(),
      nextHearing: nextHearingObj,
    };
    if (onAddSession) onAddSession(newSession);
    setFormDate('');
    setFormDecision('');
    setFormNextDate('');
    setShowAddForm(false);
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setFormDate('');
    setFormDecision('');
    setFormNextDate('');
  };

  const inputStyle = {
    width: '100%',
    background: '#fff',
    border: '1.5px solid #E8E4DC',
    borderRadius: 8,
    padding: '8px 10px',
    fontFamily: "'Almarai',sans-serif",
    fontSize: 13,
    color: '#1C2D4F',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div dir="rtl" style={{ fontFamily: "'Almarai',sans-serif", background: '#F6F4F0' }}>
      {/* NAVY NAV BAR */}
      <div style={{ background: '#1C2D4F', padding: '20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <button
          type="button"
          onClick={onBack}
          aria-label="رجوع"
          style={{ width: 34, height: 34, borderRadius: 17, background: 'rgba(255,255,255,0.09)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 10.5, marginBottom: 2 }}>ملف القضية</div>
          <div style={{ color: '#fff', fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>{client.caseTitle}</div>
        </div>
        {!archived ? (
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="خيارات القضية"
              style={{ width: 34, height: 34, borderRadius: 17, background: 'rgba(255,255,255,0.09)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="5" r="1.5" fill="rgba(255,255,255,0.7)" />
                <circle cx="12" cy="12" r="1.5" fill="rgba(255,255,255,0.7)" />
                <circle cx="12" cy="19" r="1.5" fill="rgba(255,255,255,0.7)" />
              </svg>
            </button>
            {menuOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, background: '#fff', borderRadius: 10, boxShadow: '0 8px 28px rgba(0,0,0,0.18)', padding: '6px 0', minWidth: 170, zIndex: 60 }}>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); setConfirmArchiveOpen(true); }}
                  style={{ display: 'block', width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'Almarai',sans-serif", textAlign: 'right', color: '#1C2D4F', fontSize: 13, fontWeight: 700 }}
                >
                  أرشفة القضية
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ width: 34, flexShrink: 0 }} />
        )}
      </div>

      {archived && (
        <div dir="rtl" style={{ background: 'rgba(156,163,175,0.14)', borderBottom: '1px solid rgba(156,163,175,0.28)', padding: '11px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="7" width="18" height="13" rx="2" stroke="#6B7280" strokeWidth="1.8" />
              <path d="M3 7l2-4h14l2 4" stroke="#6B7280" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M10 12h4" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span style={{ color: '#6B7280', fontSize: 12.5, fontWeight: 700 }}>هذه القضية مؤرشفة — للعرض فقط</span>
          </div>
          <button
            type="button"
            onClick={onRestore}
            style={{ background: '#1C2D4F', color: '#C9A870', border: 'none', borderRadius: 20, padding: '6px 16px', fontSize: 12.5, fontWeight: 700, fontFamily: "'Almarai',sans-serif", cursor: 'pointer' }}
          >
            استعادة
          </button>
        </div>
      )}

      {confirmArchiveOpen && (
        <div
          onClick={() => setConfirmArchiveOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(28,45,79,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}
        >
          <div
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 16, padding: '22px 22px', maxWidth: 360, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
          >
            <div style={{ color: '#1C2D4F', fontSize: 16, fontWeight: 800, marginBottom: 10 }}>أرشفة القضية</div>
            <div style={{ color: '#5D6579', fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
              سيتم نقل هذه القضية إلى الأرشيف. يمكنك استعادتها لاحقاً من قسم الأرشيف في أي وقت.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={confirmArchive}
                style={{ flex: 1, background: '#1C2D4F', color: '#C9A870', border: 'none', borderRadius: 20, padding: '10px 16px', fontSize: 13, fontWeight: 700, fontFamily: "'Almarai',sans-serif", cursor: 'pointer' }}
              >
                تأكيد الأرشفة
              </button>
              <button
                type="button"
                onClick={() => setConfirmArchiveOpen(false)}
                style={{ flex: 1, background: 'transparent', border: '1.5px solid #E8E4DC', borderRadius: 20, padding: '10px 16px', fontSize: 13, fontWeight: 700, fontFamily: "'Almarai',sans-serif", color: '#9BA3AF', cursor: 'pointer' }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '20px 16px 0', maxWidth: 1100, marginInline: 'auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* CASE HEADER CARD */}
        <div style={{ background: '#1C2D4F', borderRadius: 18, overflow: 'hidden', boxShadow: '0 10px 32px rgba(28,45,79,0.24)' }}>
          <div style={{ height: 2.5, background: 'linear-gradient(to left, transparent 0%, #C9A870 20%, #C9A870 80%, transparent 100%)' }} />
          <div style={{ padding: '17px 19px 19px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}>
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => !archived && setStatusMenuOpen((o) => !o)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: client.statusBg, border: `1px solid ${client.statusBorder}`, borderRadius: 20, padding: '4px 12px', cursor: archived ? 'default' : 'pointer', fontFamily: "'Almarai',sans-serif" }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: client.statusColor }} />
                  <span style={{ color: client.statusColor, fontSize: 12, fontWeight: 700 }}>{client.status}</span>
                  {!archived && (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" style={{ marginRight: 1 }}>
                      <path d="M6 9l6 6 6-6" stroke={client.statusColor} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                {statusMenuOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: '#fff', borderRadius: 10, boxShadow: '0 8px 28px rgba(0,0,0,0.18)', padding: '6px 0', minWidth: 160, zIndex: 50 }}>
                    {CASE_STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleStatusSelect(opt.key)}
                        style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '9px 14px', background: opt.key === client.status ? 'rgba(28,45,79,0.05)' : 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'Almarai',sans-serif", textAlign: 'right' }}
                      >
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: opt.color, flexShrink: 0 }} />
                        <span style={{ color: '#1C2D4F', fontSize: 13, fontWeight: opt.key === client.status ? 800 : 700, flex: 1 }}>{opt.key}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 9.5, marginBottom: 3 }}>الجلسة القادمة</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'flex-end' }}>
                  <div style={{ color: '#C9A870', fontSize: 14, fontWeight: 800, lineHeight: 1 }}>{client.nextHearing.full}</div>
                  <WhatsAppButton compact onClick={onWhatsAppClick} />
                </div>
              </div>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(201,168,112,0.14)', border: '1px solid rgba(201,168,112,0.3)', borderRadius: 20, padding: '4px 12px', marginBottom: 9 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="3.5" fill="#C9A870" />
                <path d="M5 20c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="#C9A870" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <span style={{ color: '#C9A870', fontSize: 12.5, fontWeight: 800 }}>الموكّل: {client.name}</span>
            </div>

            <div style={{ color: '#fff', fontSize: 18, fontWeight: 800, lineHeight: 1.25, marginBottom: 4 }}>{client.caseTitle}</div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11.5, marginBottom: 10 }}>رقم القضية: {client.caseNumber}</div>

            {/* Assignee chip with reassignment dropdown */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 14 }}>
              <button
                type="button"
                onClick={() => !archived && setReassignOpen((o) => !o)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: '5px 12px 5px 10px', cursor: archived ? 'default' : 'pointer', fontFamily: "'Almarai',sans-serif" }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: getTeamMemberById(client.assignedTo)?.avatarColor || '#C9A870', flexShrink: 0 }} />
                <span style={{ color: 'rgba(255,255,255,0.78)', fontSize: 12, fontWeight: 700 }}>المسند إليه: {getTeamMemberById(client.assignedTo)?.name || '—'}</span>
                {!archived && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{ marginRight: 2 }}>
                    <path d="M6 9l6 6 6-6" stroke="rgba(255,255,255,0.45)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              {!archived && reassignOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: '#fff', borderRadius: 10, boxShadow: '0 8px 28px rgba(0,0,0,0.18)', padding: '6px 0', minWidth: 210, zIndex: 50 }}>
                  {team.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => { if (onReassign) onReassign(member.id); setReassignOpen(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', background: member.id === client.assignedTo ? 'rgba(28,45,79,0.05)' : 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'Almarai',sans-serif", textAlign: 'right' }}
                    >
                      <div style={{ width: 26, height: 26, borderRadius: 7, background: member.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: member.avatarColor, flexShrink: 0 }}>{member.initial}</div>
                      <span style={{ color: '#1C2D4F', fontSize: 13, fontWeight: member.id === client.assignedTo ? 800 : 700, flex: 1 }}>{member.name}</span>
                      {member.id === client.assignedTo && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17l-5-5" stroke="#1C2D4F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.055)', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 1 }}>
              <div style={{ display: 'flex', gap: 1, background: 'rgba(255,255,255,0.055)' }}>
                <div style={{ flex: 1, background: '#1C2D4F', padding: '11px 14px' }}>
                  <div style={{ color: '#C9A870', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, marginBottom: 5 }}>رقم القضية</div>
                  <div style={{ color: '#fff', fontSize: 12.5, fontWeight: 700 }}>{client.caseNumber}</div>
                </div>
                <div style={{ flex: 1, background: '#1C2D4F', padding: '11px 14px' }}>
                  <div style={{ color: '#C9A870', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, marginBottom: 5 }}>تاريخ الرفع</div>
                  <div style={{ color: '#fff', fontSize: 12.5, fontWeight: 700 }}>{client.filedDate}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 1, background: 'rgba(255,255,255,0.055)' }}>
                <div style={{ flex: 1, background: '#1C2D4F', padding: '11px 14px' }}>
                  <div style={{ color: '#C9A870', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, marginBottom: 5 }}>المحكمة</div>
                  <div style={{ color: '#fff', fontSize: 12.5, fontWeight: 700 }}>{client.courtShort}</div>
                </div>
                <div style={{ flex: 1, background: '#1C2D4F', padding: '11px 14px' }}>
                  <div style={{ color: '#C9A870', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, marginBottom: 5 }}>المرحلة الحالية</div>
                  <div style={{ color: '#fff', fontSize: 12.5, fontWeight: 700 }}>{client.stage}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showAppealBanner && (
          <div
            style={{
              background: appealStyle.bg,
              border: `2px solid ${appealStyle.border}`,
              borderRadius: 14,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              animation: appealUrgency === 'critical' || appealUrgency === 'overdue' ? 'appealPulse 2s ease-in-out infinite' : 'none',
            }}
          >
            <style>{`@keyframes appealPulse { 0%,100% { box-shadow: 0 0 0 0 ${appealStyle.border}55; } 50% { box-shadow: 0 0 0 6px ${appealStyle.border}00; } }`}</style>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: appealStyle.icon, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M12 9v4M12 17h.01" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: appealStyle.text, fontSize: 14, fontWeight: 800, lineHeight: 1.4 }}>
                {formatDeadlineMessage(appealDaysLeft, client.appealLabel || 'الاستئناف')}
              </div>
              <div style={{ color: appealStyle.text, opacity: 0.75, fontSize: 11.5, marginTop: 2 }}>
                تاريخ الميعاد: {new Date(client.appealDeadline).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
        )}

        {showFinishPrompt && (
          <div style={{ background: 'rgba(22,163,74,0.07)', border: '1.5px solid rgba(22,163,74,0.25)', borderRadius: 14, padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" stroke="#16A34A" strokeWidth="1.8" />
                <path d="M8 12.5l2.5 2.5L16 9" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ color: '#15803D', fontSize: 13, fontWeight: 700 }}>القضية انتهت — هل تريد نقلها للأرشيف؟</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => setConfirmArchiveOpen(true)}
                style={{ background: '#16A34A', color: '#fff', border: 'none', borderRadius: 20, padding: '7px 16px', fontSize: 12.5, fontWeight: 700, fontFamily: "'Almarai',sans-serif", cursor: 'pointer' }}
              >
                نقل للأرشيف
              </button>
              <button
                type="button"
                onClick={() => setFinishPromptDismissed(true)}
                style={{ background: 'transparent', border: '1.5px solid rgba(22,163,74,0.3)', borderRadius: 20, padding: '7px 16px', fontSize: 12.5, fontWeight: 700, fontFamily: "'Almarai',sans-serif", color: '#15803D', cursor: 'pointer' }}
              >
                ليس الآن
              </button>
            </div>
          </div>
        )}

        {/* TEAM DISCUSSION — internal only, never shown to client */}
        <div>
          <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid rgba(201,168,112,0.4)', boxShadow: '0 2px 16px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderBottom: '1px solid rgba(201,168,112,0.25)' }}>
              <span style={{ color: '#B5924A', fontSize: 16, fontWeight: 800 }}>نقاش الفريق</span>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(201,168,112,0.1)', border: '1px solid rgba(201,168,112,0.25)', borderRadius: 20, padding: '4px 11px', flexShrink: 0 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="11" width="14" height="9" rx="1.8" stroke="#B5924A" strokeWidth="1.8" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#B5924A" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <span style={{ color: '#B5924A', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>داخلي فقط — غير مرئي للموكّل</span>
              </div>
            </div>

            <div style={{ padding: '14px 15px 12px', display: 'flex', flexDirection: 'column', gap: 15 }}>
              {teamMessages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '10px 16px', color: '#B2B8C2', fontSize: 12.5 }}>
                  لا توجد رسائل بعد في نقاش الفريق
                </div>
              ) : (
                teamMessages.map((msg) => {
                  const member = getTeamMemberById(msg.from);
                  return (
                    <div key={msg.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: member?.avatarBg || '#F0ECE5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 800, color: member?.avatarColor || '#9BA3AF' }}>
                        {member?.initial || '?'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{ color: '#1C2D4F', fontSize: 13, fontWeight: 800 }}>{member?.name || 'زميل'}</span>
                          <span style={{ color: '#C4C9D4', fontSize: 10.5 }}>{msg.time}</span>
                        </div>
                        <div style={{ background: '#FBF9F5', border: '1px solid #F0ECE5', borderRadius: 10, padding: '9px 12px', color: '#1C2D4F', fontSize: 12.5, lineHeight: 1.6 }}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ borderTop: '1px solid rgba(201,168,112,0.25)' }} />
            {archived ? (
              <div style={{ padding: '13px 15px', textAlign: 'center', color: '#B2B8C2', fontSize: 12.5 }}>
                القضية مؤرشفة — لا يمكن إضافة رسائل جديدة
              </div>
            ) : (
              <div style={{ padding: '11px 14px', display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                <textarea
                  value={teamReplyText}
                  onChange={(e) => setTeamReplyText(e.target.value)}
                  placeholder="اكتب رسالة للفريق..."
                  rows={2}
                  aria-label="رسالة لفريق المكتب"
                  style={{ flex: 1, background: '#FBF9F5', border: 'none', borderRadius: 10, padding: '9px 12px', fontFamily: "'Almarai',sans-serif", fontSize: 13, color: '#1C2D4F', resize: 'none', outline: 'none', lineHeight: 1.55 }}
                />
                <button
                  type="button"
                  onClick={onSendTeamReply}
                  aria-label="إرسال لفريق المكتب"
                  style={{ width: 36, height: 36, borderRadius: 18, background: '#C9A870', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginBottom: 1 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="#1C2D4F" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SESSIONS LOG */}
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ height: 2.5, background: 'linear-gradient(to left, transparent 0%, #C9A870 20%, #C9A870 80%, transparent 100%)' }} />
          <div style={{ padding: '15px 15px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
              <span style={{ color: '#1C2D4F', fontSize: 16, fontWeight: 800 }}>سجل الجلسات</span>
              {!archived && (
                <button
                  type="button"
                  onClick={() => setShowAddForm((f) => !f)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: showAddForm ? 'rgba(28,45,79,0.12)' : 'rgba(28,45,79,0.07)', border: 'none', borderRadius: 20, padding: '6px 13px', cursor: 'pointer' }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="#1C2D4F" strokeWidth="2.4" strokeLinecap="round" />
                  </svg>
                  <span style={{ color: '#1C2D4F', fontSize: 12, fontWeight: 700, opacity: 0.7, fontFamily: "'Almarai',sans-serif" }}>إضافة جلسة</span>
                </button>
              )}
            </div>

            {!archived && showAddForm && (
              <div style={{ background: '#F6F4F0', borderRadius: 10, padding: '14px', marginBottom: 16, border: '1px solid #E8E4DC' }}>
                <div style={{ color: '#1C2D4F', fontSize: 13, fontWeight: 700, marginBottom: 12 }}>تسجيل جلسة جديدة</div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 140px' }}>
                    <div style={{ color: '#9BA3AF', fontSize: 11, fontWeight: 700, marginBottom: 5 }}>تاريخ الجلسة</div>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      onInput={(e) => setFormDate(e.currentTarget.value)}
                      aria-label="تاريخ الجلسة"
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ flex: '1 1 140px' }}>
                    <div style={{ color: '#9BA3AF', fontSize: 11, fontWeight: 700, marginBottom: 5 }}>الجلسة القادمة</div>
                    <input
                      type="date"
                      value={formNextDate}
                      onChange={(e) => setFormNextDate(e.target.value)}
                      onInput={(e) => setFormNextDate(e.currentTarget.value)}
                      aria-label="تاريخ الجلسة القادمة"
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ color: '#9BA3AF', fontSize: 11, fontWeight: 700, marginBottom: 5 }}>
                    قرار الجلسة <span style={{ color: '#EF4444' }}>*</span>
                  </div>
                  <textarea
                    value={formDecision}
                    onChange={(e) => setFormDecision(e.target.value)}
                    rows={3}
                    placeholder="اكتب قرار المحكمة في هذه الجلسة..."
                    style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'rgba(201,168,112,0.12)', border: '1px solid rgba(201,168,112,0.26)', borderRadius: 9, padding: '9px 10px', marginBottom: 12 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                    <path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z" stroke="#B5924A" strokeWidth="1.7" strokeLinejoin="round" />
                  </svg>
                  <div style={{ color: '#7F683C', fontSize: 10.5, lineHeight: 1.6 }}>
                    عند الحفظ، LAWRAQ يسجل النشاط ويحدّث موعد الجلسة القادمة في بوابة الموكّل تلقائيًا.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={handleSaveSession}
                    disabled={!formDecision.trim()}
                    style={{
                      background: formDecision.trim() ? '#1C2D4F' : '#E8E4DC',
                      color: formDecision.trim() ? '#C9A870' : '#B2B8C2',
                      border: 'none',
                      borderRadius: 20,
                      padding: '8px 18px',
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: "'Almarai',sans-serif",
                      cursor: formDecision.trim() ? 'pointer' : 'not-allowed',
                    }}
                  >
                    حفظ وتشغيل التحديث
                  </button>
                  <button
                    type="button"
                    onClick={cancelForm}
                    style={{ background: 'transparent', border: '1.5px solid #E8E4DC', borderRadius: 20, padding: '8px 18px', fontSize: 13, fontWeight: 700, fontFamily: "'Almarai',sans-serif", color: '#9BA3AF', cursor: 'pointer' }}
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}

            {sessions.length === 0 && !showAddForm ? (
              <div style={{ textAlign: 'center', padding: '24px 16px', color: '#B2B8C2', fontSize: 13 }}>
                لا توجد جلسات مسجلة بعد — أضف أول جلسة
              </div>
            ) : (
              sessions.map((session, idx) => (
                <div
                  key={session.id}
                  style={{
                    display: 'flex',
                    gap: 13,
                    paddingBottom: 16,
                    marginBottom: idx < sessions.length - 1 ? 0 : 0,
                    borderBottom: idx < sessions.length - 1 ? '1px solid #F0ECE5' : 'none',
                    paddingTop: idx > 0 ? 16 : 0,
                  }}
                >
                  <div style={{ width: 38, flexShrink: 0, textAlign: 'center', paddingTop: 2 }}>
                    <div style={{ color: '#1C2D4F', fontSize: 19, fontWeight: 800, lineHeight: 1 }}>{session.date.day}</div>
                    <div style={{ color: '#9BA3AF', fontSize: 9.5, marginTop: 2 }}>{session.date.month}</div>
                  </div>
                  <div style={{ width: 1, background: 'rgba(201,168,112,0.3)', alignSelf: 'stretch', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#1C2D4F', fontSize: 13, fontWeight: 700, lineHeight: 1.6, marginBottom: session.nextHearing ? 8 : 0 }}>{session.decision}</div>
                    {session.nextHearing && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(201,168,112,0.09)', border: '1px solid rgba(201,168,112,0.25)', borderRadius: 20, padding: '3px 10px' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="5" width="18" height="16" rx="2" stroke="#B5924A" strokeWidth="1.8" />
                          <path d="M3 10h18M8 3v3M16 3v3" stroke="#B5924A" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        <span style={{ color: '#B5924A', fontSize: 11, fontWeight: 700 }}>الجلسة القادمة: {session.nextHearing.full}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            <div style={{ height: sessions.length === 0 && !showAddForm ? 0 : 8 }} />
          </div>
        </div>

        {/* DOCUMENTS + TIMELINE (side by side on desktop) */}
        <div className="flex lg:grid lg:grid-cols-2 lg:gap-[22px]" style={{ flexDirection: 'column', gap: 22 }}>
          {/* DOCUMENTS */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13, padding: '0 2px' }}>
              <span style={{ color: '#1C2D4F', fontSize: 16, fontWeight: 800 }}>المستندات</span>
              {!archived && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(28,45,79,0.07)', borderRadius: 20, padding: '6px 13px', cursor: 'pointer' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="#1C2D4F" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                  <span style={{ color: '#1C2D4F', fontSize: 12, fontWeight: 700, opacity: 0.65 }}>رفع مستند</span>
                </div>
              )}
            </div>

            <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              {docs.map((item, idx) => (
                <div key={item.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 15px' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(28,45,79,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileIcon />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#1C2D4F', fontSize: 13.5, fontWeight: 700, marginBottom: 3 }}>{item.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9BA3AF', fontSize: 11.5, marginBottom: 10 }}>
                        <span>{item.date} · {item.size}</span>
                        <span style={{ background: 'rgba(28,45,79,0.07)', color: '#5D6579', fontSize: 9.5, fontWeight: 800, letterSpacing: 0.3, borderRadius: 5, padding: '1px 6px' }}>
                          {getFileTypeLabel(item.type)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <div
                          role={archived ? undefined : 'button'}
                          tabIndex={archived ? undefined : 0}
                          onClick={() => toggleDoc(item.id)}
                          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleDoc(item.id)}
                          style={{ display: 'inline-flex', cursor: archived ? 'default' : 'pointer' }}
                        >
                          {item.visible ? <VisiblePill /> : <NotVisiblePill />}
                        </div>
                        <button
                          type="button"
                          onClick={() => openMockDocument(item)}
                          aria-label={item.type === 'word' ? `تحميل ${item.name}` : `فتح ${item.name}`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(28,45,79,0.07)', border: 'none', borderRadius: 20, padding: '5px 11px', cursor: 'pointer' }}
                        >
                          {item.type === 'word' ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M12 16V4M12 16l-4-4M12 16l4-4" stroke="#1C2D4F" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M4 20h16" stroke="#1C2D4F" strokeWidth="1.9" strokeLinecap="round" />
                            </svg>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#1C2D4F" strokeWidth="1.8" strokeLinejoin="round" />
                              <circle cx="12" cy="12" r="3" stroke="#1C2D4F" strokeWidth="1.8" />
                            </svg>
                          )}
                          <span style={{ color: '#1C2D4F', fontSize: 11, fontWeight: 700 }}>{item.type === 'word' ? 'تحميل' : 'فتح'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  {idx < docs.length - 1 && <div style={{ height: 1, background: '#F0ECE5', margin: '0 15px' }} />}
                </div>
              ))}
            </div>

            <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px rgba(0,0,0,0.05)', padding: '16px 15px', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ color: '#1C2D4F', fontSize: 13.5, fontWeight: 800 }}>نماذج جاهزة (صحف دعاوى، مذكرات)</span>
                  <span style={{ background: 'rgba(201,168,112,0.16)', color: '#B5924A', fontSize: 9.5, fontWeight: 800, borderRadius: 6, padding: '2px 7px' }}>قريبًا</span>
                </div>
                <div style={{ color: '#B2B8C2', fontSize: 11.5 }}>نماذج قانونية جاهزة للاستخدام المباشر — دعاوى، مذكرات دفاع، وأكثر</div>
              </div>
              <button
                type="button"
                onClick={onTemplatesClick}
                style={{ background: '#EDEBE6', border: 'none', borderRadius: 20, padding: '8px 16px', color: '#9BA1AE', fontSize: 12, fontWeight: 700, fontFamily: "'Almarai',sans-serif", cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
              >
                استعراض النماذج
              </button>
            </div>
          </div>

          {/* ACTIVITY TIMELINE */}
          <div>
            <div style={{ marginBottom: 13, padding: '0 2px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ color: '#1C2D4F', fontSize: 16, fontWeight: 800 }}>سجل النشاط</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 20, padding: '4px 9px', color: '#15803D', fontSize: 9.5, fontWeight: 800 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A' }} />
                الأتمتة نشطة
              </span>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#EEF2F6', border: '1px solid #DCE3EB', borderRadius: 12, padding: '11px 12px', marginBottom: 10 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                <path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z" stroke="#1C2D4F" strokeWidth="1.7" strokeLinejoin="round" />
              </svg>
              <div>
                <div style={{ color: '#1C2D4F', fontSize: 11.5, fontWeight: 800, marginBottom: 2 }}>السجل يتحدث من إجراءاتك تلقائيًا</div>
                <div style={{ color: '#6B7484', fontSize: 10.5, lineHeight: 1.6 }}>تسجيل جلسة أو مشاركة مستند أو تغيير الحالة يضيف نشاطًا هنا. أنت تختار فقط هل يظل داخليًا أم يظهر للموكّل.</div>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              {updates.map((item, idx) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 13, padding: '16px 15px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 18, flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.dotColor, marginTop: 5, flexShrink: 0 }} />
                    {idx < updates.length - 1 && <div style={{ flex: 1, width: 1.5, background: '#ECE8E0', marginTop: 7, minHeight: 44 }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, paddingBottom: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ color: '#1C2D4F', fontSize: 13.5, fontWeight: 700, lineHeight: 1.4 }}>{item.title}</span>
                          {item.source === 'system' && (
                            <span style={{ background: 'rgba(28,45,79,0.07)', color: '#68758A', borderRadius: 6, padding: '2px 6px', fontSize: 8.5, fontWeight: 800 }}>تلقائي</span>
                          )}
                        </div>
                      </div>
                      <div
                        role={archived ? undefined : 'button'}
                        tabIndex={archived ? undefined : 0}
                        onClick={() => toggleUpdate(item.id)}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleUpdate(item.id)}
                        style={{ display: 'inline-flex', cursor: archived ? 'default' : 'pointer', flexShrink: 0, marginTop: 2 }}
                      >
                        {item.visible ? <VisiblePill compact /> : <NotVisiblePill compact />}
                      </div>
                    </div>
                    <div style={{ color: '#5D6579', fontSize: 12.5, lineHeight: 1.6, marginBottom: 6 }}>{item.desc}</div>
                    <div style={{ color: '#B2B8C2', fontSize: 11 }}>{item.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MESSAGES THREAD */}
        <div>
          <div style={{ marginBottom: 13, padding: '0 2px' }}>
            <span style={{ color: '#1C2D4F', fontSize: 16, fontWeight: 800 }}>رسائل الموكّل</span>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 15px 12px', display: 'flex', flexDirection: 'column', gap: 13 }}>
              {messages.map((msg) => {
                const senderLabel = msg.from === 'client' ? client.name : lawyerName;
                return msg.from === 'client' ? (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ maxWidth: '80%' }}>
                      <div style={{ background: '#F3F1ED', borderRadius: '14px 14px 14px 4px', padding: '10px 13px' }}>
                        <div style={{ color: '#1C2D4F', fontSize: 12.5, lineHeight: 1.65 }}>{msg.text}</div>
                      </div>
                      <div style={{ color: '#C4C9D4', fontSize: 10, marginTop: 5, textAlign: 'left' }}>{senderLabel} · {msg.time}</div>
                    </div>
                  </div>
                ) : (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div style={{ maxWidth: '80%' }}>
                      <div style={{ background: '#1C2D4F', borderRadius: '14px 14px 4px 14px', padding: '10px 13px' }}>
                        <div style={{ color: '#fff', fontSize: 12.5, lineHeight: 1.65 }}>{msg.text}</div>
                      </div>
                      <div style={{ color: '#C4C9D4', fontSize: 10, marginTop: 5, textAlign: 'right' }}>{senderLabel} · {msg.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ borderTop: '1px solid #F0ECE5' }} />
            {archived ? (
              <div style={{ padding: '13px 15px', textAlign: 'center', color: '#B2B8C2', fontSize: 12.5 }}>
                القضية مؤرشفة — لا يمكن إرسال رسائل جديدة
              </div>
            ) : (
              <div style={{ padding: '11px 14px', display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="اكتب ردك على الموكّل..."
                  rows={2}
                  aria-label="ردك على الموكّل"
                  style={{ flex: 1, background: '#F6F4F0', border: 'none', borderRadius: 10, padding: '9px 12px', fontFamily: "'Almarai',sans-serif", fontSize: 13, color: '#1C2D4F', resize: 'none', outline: 'none', lineHeight: 1.55 }}
                />
                <button
                  type="button"
                  onClick={onSendReply}
                  aria-label="إرسال الرد"
                  style={{ width: 36, height: 36, borderRadius: 18, background: '#1C2D4F', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginBottom: 1 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="#C9A870" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ height: 48 }} />
      </div>
    </div>
  );
}
