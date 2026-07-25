import { useMemo, useState } from 'react';
import { team } from '../data/clients';
import { toArNum } from '../utils/arabicDate';

function getLoadState(count) {
  if (count <= 1) return { label: 'متاح', color: '#15803D', bg: 'rgba(22,163,74,0.09)', width: '28%' };
  if (count <= 3) return { label: 'متوازن', color: '#B7791F', bg: 'rgba(201,168,112,0.14)', width: '58%' };
  return { label: 'ضغط مرتفع', color: '#C2413B', bg: 'rgba(239,68,68,0.09)', width: '88%' };
}

export default function TeamView({ allClients = [], onOpenCase }) {
  const activeClients = useMemo(
    () => allClients.filter((client) => !client.archived && client.status !== 'منتهية'),
    [allClients]
  );
  const [selectedMemberId, setSelectedMemberId] = useState(team[0]?.id);

  const memberCases = useMemo(
    () =>
      team.reduce((acc, member) => {
        acc[member.id] = activeClients.filter((client) => client.assignedTo === member.id);
        return acc;
      }, {}),
    [activeClients]
  );

  const selectedMember = team.find((member) => member.id === selectedMemberId) || team[0];
  const selectedCases = memberCases[selectedMember?.id] || [];
  const unassignedCases = activeClients.filter((client) => !team.some((member) => member.id === client.assignedTo));
  const availableMember = [...team].sort((a, b) => memberCases[a.id].length - memberCases[b.id].length)[0];
  const upcomingCount = activeClients.filter((client) => client.nextHearing).length;

  return (
    <div dir="rtl" style={{ fontFamily: "'Almarai',sans-serif", padding: '20px 16px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ color: '#1C2D4F', fontSize: 18, fontWeight: 800 }}>فريق المكتب</span>
          <span style={{ color: '#9BA3AF', fontSize: 12.5 }}>{toArNum(team.length)} أعضاء</span>
        </div>
        <div style={{ color: '#7B8494', fontSize: 11.5, marginTop: 6, lineHeight: 1.6 }}>
          صورة سريعة لتوزيع القضايا والضغط على الفريق — تتحدث تلقائيًا عند إسناد أي قضية.
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'القضايا النشطة', value: activeClients.length, note: 'موزعة على الفريق', color: '#1C2D4F' },
          { label: 'مواعيد مسجلة', value: upcomingCount, note: 'داخل ملفات القضايا', color: '#B5924A' },
          { label: 'بدون مسؤول', value: unassignedCases.length, note: unassignedCases.length ? 'تحتاج إسنادًا' : 'كل القضايا مُسندة', color: unassignedCases.length ? '#C2413B' : '#15803D' },
        ].map((stat) => (
          <div key={stat.label} style={{ background: '#fff', borderRadius: 13, padding: '14px 15px', boxShadow: '0 2px 14px rgba(0,0,0,0.045)', border: '1px solid rgba(231,226,217,0.8)' }}>
            <div style={{ color: '#8B93A0', fontSize: 10.5, fontWeight: 700, marginBottom: 6 }}>{stat.label}</div>
            <div style={{ color: stat.color, fontSize: 23, fontWeight: 800, lineHeight: 1 }}>{toArNum(stat.value)}</div>
            <div style={{ color: '#B0B6C0', fontSize: 9.5, marginTop: 7 }}>{stat.note}</div>
          </div>
        ))}
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11, padding: '0 2px' }}>
          <span style={{ color: '#1C2D4F', fontSize: 14.5, fontWeight: 800 }}>توزيع عبء العمل</span>
          <span style={{ color: '#9BA3AF', fontSize: 10 }}>اضغط على عضو لعرض قضاياه</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {team.map((member) => {
            const count = memberCases[member.id].length;
            const load = getLoadState(count);
            const selected = selectedMemberId === member.id;
            return (
              <button
                type="button"
                key={member.id}
                onClick={() => setSelectedMemberId(member.id)}
                aria-pressed={selected}
                aria-label={`عرض قضايا ${member.name}`}
                style={{
                  textAlign: 'right',
                  background: selected ? '#1C2D4F' : '#fff',
                  borderRadius: 14,
                  border: selected ? '1px solid #1C2D4F' : '1px solid #E9E4DB',
                  boxShadow: selected ? '0 9px 24px rgba(28,45,79,0.14)' : '0 2px 14px rgba(0,0,0,0.04)',
                  padding: 15,
                  cursor: 'pointer',
                  fontFamily: "'Almarai',sans-serif",
                }}
              >
                <div style={{ display: 'flex', gap: 11, alignItems: 'center', marginBottom: 13 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: selected ? 'rgba(255,255,255,0.1)' : member.avatarBg, color: selected ? '#C9A870' : member.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, flexShrink: 0 }}>
                    {member.initial}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ color: selected ? '#fff' : '#1C2D4F', fontSize: 13.5, fontWeight: 800, marginBottom: 4 }}>{member.name}</div>
                    <div style={{ color: selected ? 'rgba(255,255,255,0.52)' : '#9BA3AF', fontSize: 10.5 }}>{member.role}</div>
                  </div>
                  <span style={{ color: load.color, background: load.bg, borderRadius: 20, padding: '4px 8px', fontSize: 9, fontWeight: 800, whiteSpace: 'nowrap' }}>{load.label}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                  <span style={{ color: selected ? 'rgba(255,255,255,0.58)' : '#7B8494', fontSize: 10.5 }}>قضايا نشطة</span>
                  <span style={{ color: selected ? '#fff' : '#1C2D4F', fontSize: 11.5, fontWeight: 800 }}>{toArNum(count)}</span>
                </div>
                <div style={{ height: 5, borderRadius: 8, background: selected ? 'rgba(255,255,255,0.1)' : '#EEEAE3', overflow: 'hidden' }}>
                  <div style={{ width: count === 0 ? '4%' : load.width, height: '100%', background: selected ? '#C9A870' : load.color, borderRadius: 8 }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_0.75fr] gap-3">
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 15px', borderBottom: '1px solid #F0ECE5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <div style={{ color: '#1C2D4F', fontSize: 13.5, fontWeight: 800 }}>قضايا {selectedMember?.name}</div>
              <div style={{ color: '#9BA3AF', fontSize: 9.5, marginTop: 4 }}>اضغط على القضية للانتقال إلى ملفها</div>
            </div>
            <span style={{ color: '#B5924A', background: 'rgba(201,168,112,0.12)', borderRadius: 20, padding: '4px 9px', fontSize: 10, fontWeight: 800 }}>{toArNum(selectedCases.length)} ملفات</span>
          </div>
          {selectedCases.length ? selectedCases.map((client, index) => (
            <button
              type="button"
              key={client.id}
              onClick={() => onOpenCase?.(client.id)}
              style={{ width: '100%', background: '#fff', border: 'none', borderBottom: index < selectedCases.length - 1 ? '1px solid #F3F0EA' : 'none', padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 11, textAlign: 'right', cursor: 'pointer', fontFamily: "'Almarai',sans-serif" }}
            >
              <div style={{ width: 37, height: 37, borderRadius: 10, background: client.avatarBg, color: client.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, flexShrink: 0 }}>{client.initial}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#1C2D4F', fontSize: 12.5, fontWeight: 800, marginBottom: 4 }}>{client.caseTitle}</div>
                <div style={{ color: '#929AA8', fontSize: 10.5 }}>{client.name} · {client.courtShort}</div>
              </div>
              <div style={{ textAlign: 'left', flexShrink: 0 }}>
                <div style={{ color: '#B5924A', fontSize: 9.5, fontWeight: 800 }}>{client.nextHearing?.full || 'لا توجد جلسة'}</div>
                <div style={{ color: '#B5BBC4', fontSize: 9, marginTop: 4 }}>فتح الملف ←</div>
              </div>
            </button>
          )) : (
            <div style={{ color: '#9BA3AF', fontSize: 12, textAlign: 'center', padding: 28 }}>لا توجد قضايا نشطة مسندة لهذا العضو</div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ background: '#EEF2F6', border: '1px solid #DCE3EB', borderRadius: 14, padding: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1C2D4F', fontSize: 12.5, fontWeight: 800, marginBottom: 7 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A' }} />
              اقتراح توزيع
            </div>
            <div style={{ color: '#667184', fontSize: 11, lineHeight: 1.7 }}>
              {availableMember?.name} هو الأقل ضغطًا حاليًا بـ {toArNum(memberCases[availableMember?.id]?.length || 0)} قضايا نشطة، ويمكن اختياره عند إسناد ملف جديد.
            </div>
          </div>

          <div style={{ background: unassignedCases.length ? 'rgba(239,68,68,0.06)' : 'rgba(22,163,74,0.06)', border: `1px solid ${unassignedCases.length ? 'rgba(239,68,68,0.17)' : 'rgba(22,163,74,0.16)'}`, borderRadius: 14, padding: '15px' }}>
            <div style={{ color: unassignedCases.length ? '#B33D38' : '#15803D', fontSize: 12.5, fontWeight: 800, marginBottom: 6 }}>
              {unassignedCases.length ? `${toArNum(unassignedCases.length)} قضايا تحتاج مسؤولًا` : 'لا توجد قضايا منسية'}
            </div>
            <div style={{ color: '#7B8494', fontSize: 10.5, lineHeight: 1.65 }}>
              {unassignedCases.length ? 'راجع الملفات غير المسندة قبل نهاية اليوم.' : 'كل القضايا النشطة مرتبطة بمحامٍ مسؤول.'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px rgba(0,0,0,0.05)', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ color: '#1C2D4F', fontSize: 13.5, fontWeight: 800, marginBottom: 4 }}>دعوة محامٍ جديد للمكتب</div>
          <div style={{ color: '#B2B8C2', fontSize: 11.5 }}>متاح في المنتج الفعلي بعد تفعيل الحسابات والصلاحيات</div>
        </div>
        <button type="button" disabled style={{ background: '#EDEBE6', border: 'none', borderRadius: 20, padding: '8px 15px', color: '#B3B8C0', fontSize: 11.5, fontWeight: 700, fontFamily: "'Almarai',sans-serif", cursor: 'not-allowed', flexShrink: 0 }}>
          قريبًا
        </button>
      </div>
    </div>
  );
}
