import { useMemo, useState } from 'react';
import { toArNum } from '../utils/arabicDate';

const PERMISSIONS = [
  { key: 'viewAllCases', label: 'عرض كل القضايا', note: 'بدل الاقتصار على القضايا المسندة للحساب' },
  { key: 'editCases', label: 'تعديل ملفات القضايا', note: 'الجلسات والحالة والمستندات والرسائل' },
  { key: 'shareWithClient', label: 'المشاركة مع الموكّل', note: 'التحكم فيما يظهر في بوابة الموكّل' },
  { key: 'viewInternal', label: 'المحتوى الداخلي', note: 'نقاش الفريق والملاحظات الداخلية' },
];

const ROLE_DEFAULTS = {
  محامي: { viewAllCases: false, editCases: true, shareWithClient: true, viewInternal: true },
  محامية: { viewAllCases: false, editCases: true, shareWithClient: true, viewInternal: true },
  سكرتارية: { viewAllCases: true, editCases: false, shareWithClient: false, viewInternal: false },
};

function getLoadState(count) {
  if (count <= 1) return { label: 'متاح', color: '#15803D', bg: 'rgba(22,163,74,0.09)', width: '28%' };
  if (count <= 3) return { label: 'متوازن', color: '#B7791F', bg: 'rgba(201,168,112,0.14)', width: '58%' };
  return { label: 'ضغط مرتفع', color: '#C2413B', bg: 'rgba(239,68,68,0.09)', width: '88%' };
}

export default function TeamView({
  allClients = [],
  onOpenCase,
  teamMembers = [],
  currentMember,
  onAddMember,
  onUpdatePermissions,
}) {
  const activeClients = useMemo(
    () => allClients.filter((client) => !client.archived && client.status !== 'منتهية'),
    [allClients]
  );
  const [selectedMemberId, setSelectedMemberId] = useState(currentMember?.id || teamMembers[0]?.id);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('سكرتارية');
  const canManage = !!currentMember?.permissions?.manageTeam;

  const memberCases = useMemo(
    () =>
      teamMembers.reduce((acc, member) => {
        acc[member.id] = activeClients.filter((client) => client.assignedTo === member.id);
        return acc;
      }, {}),
    [activeClients, teamMembers]
  );

  const selectedMember = teamMembers.find((member) => member.id === selectedMemberId) || teamMembers[0];
  const selectedCases = memberCases[selectedMember?.id] || [];
  const unassignedCases = activeClients.filter((client) => !teamMembers.some((member) => member.id === client.assignedTo));
  const caseAssignableMembers = teamMembers.filter((member) => member.role !== 'سكرتارية');
  const availableMember = [...caseAssignableMembers].sort((a, b) => memberCases[a.id].length - memberCases[b.id].length)[0];
  const upcomingCount = activeClients.filter((client) => client.nextHearing).length;

  const addMember = () => {
    const cleanName = memberName.trim();
    if (!cleanName) return;
    onAddMember?.({
      name: cleanName,
      role: memberRole,
      permissions: ROLE_DEFAULTS[memberRole] || ROLE_DEFAULTS.سكرتارية,
    });
    setMemberName('');
    setMemberRole('سكرتارية');
    setShowAddMember(false);
  };

  const togglePermission = (key) => {
    if (!canManage || !selectedMember || selectedMember.id === 'nadine') return;
    onUpdatePermissions?.(selectedMember.id, {
      [key]: !selectedMember.permissions?.[key],
    });
  };

  return (
    <div dir="rtl" style={{ fontFamily: "'Almarai',sans-serif", padding: '20px 16px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ color: '#1C2D4F', fontSize: 18, fontWeight: 800 }}>فريق المكتب</span>
          <span style={{ color: '#9BA3AF', fontSize: 12.5 }}>{toArNum(teamMembers.length)} أعضاء</span>
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
          {teamMembers.map((member) => {
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px rgba(0,0,0,0.05)', padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 13 }}>
            <div>
              <div style={{ color: '#1C2D4F', fontSize: 13.5, fontWeight: 800 }}>صلاحيات {selectedMember?.name}</div>
              <div style={{ color: '#9BA3AF', fontSize: 10.5, marginTop: 4 }}>
                {selectedMember?.id === 'nadine' ? 'صلاحيات مديرة المكتب كاملة وثابتة' : canManage ? 'التغييرات تطبق فورًا على حساب العضو' : 'للعرض فقط — التعديل متاح لمديرة المكتب'}
              </div>
            </div>
            <span style={{ background: selectedMember?.permissions?.manageTeam ? 'rgba(201,168,112,0.15)' : '#F2F0EC', color: selectedMember?.permissions?.manageTeam ? '#98783E' : '#7B8494', borderRadius: 20, padding: '4px 9px', fontSize: 9.5, fontWeight: 800 }}>
              {selectedMember?.role}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PERMISSIONS.map((permission) => {
              const enabled = !!selectedMember?.permissions?.[permission.key];
              const editable = canManage && selectedMember?.id !== 'nadine';
              return (
                <button
                  type="button"
                  key={permission.key}
                  onClick={() => togglePermission(permission.key)}
                  disabled={!editable}
                  aria-pressed={enabled}
                  style={{ width: '100%', background: enabled ? 'rgba(22,163,74,0.055)' : '#FAF9F7', border: `1px solid ${enabled ? 'rgba(22,163,74,0.18)' : '#ECE8E1'}`, borderRadius: 11, padding: '10px 11px', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'right', fontFamily: "'Almarai',sans-serif", cursor: editable ? 'pointer' : 'default' }}
                >
                  <span style={{ width: 30, height: 18, borderRadius: 12, background: enabled ? '#16A34A' : '#D8D5CF', padding: 2, display: 'flex', justifyContent: enabled ? 'flex-end' : 'flex-start', flexShrink: 0, transition: '0.2s' }}>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.18)' }} />
                  </span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: 'block', color: '#1C2D4F', fontSize: 11.5, fontWeight: 800 }}>{permission.label}</span>
                    <span style={{ display: 'block', color: '#9BA3AF', fontSize: 9.5, marginTop: 3, lineHeight: 1.5 }}>{permission.note}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px rgba(0,0,0,0.05)', padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: showAddMember ? 13 : 0 }}>
            <div>
              <div style={{ color: '#1C2D4F', fontSize: 13.5, fontWeight: 800, marginBottom: 4 }}>إضافة حساب لفريق المكتب</div>
              <div style={{ color: '#9BA3AF', fontSize: 10.5, lineHeight: 1.6 }}>
                {canManage ? 'أضف محاميًا أو موظف سكرتارية وحدد صلاحياته.' : 'متاحة داخل حساب مديرة المكتب فقط.'}
              </div>
            </div>
            {canManage && (
              <button
                type="button"
                onClick={() => setShowAddMember((current) => !current)}
                style={{ background: showAddMember ? '#1C2D4F' : 'rgba(28,45,79,0.07)', color: showAddMember ? '#fff' : '#1C2D4F', border: 'none', borderRadius: 20, padding: '7px 13px', fontFamily: "'Almarai',sans-serif", fontSize: 10.5, fontWeight: 800, cursor: 'pointer' }}
              >
                {showAddMember ? 'إغلاق' : '+ عضو جديد'}
              </button>
            )}
          </div>

          {showAddMember && canManage && (
            <div style={{ background: '#F8F6F2', border: '1px solid #E8E4DC', borderRadius: 12, padding: 13 }}>
              <label htmlFor="team-member-name" style={{ display: 'block', color: '#697386', fontSize: 10.5, fontWeight: 700, marginBottom: 6 }}>اسم العضو</label>
              <input
                id="team-member-name"
                value={memberName}
                onChange={(event) => setMemberName(event.target.value)}
                placeholder="مثال: هند محمد"
                style={{ width: '100%', boxSizing: 'border-box', background: '#fff', border: '1px solid #DED9D0', borderRadius: 10, padding: '10px 11px', fontFamily: "'Almarai',sans-serif", color: '#1C2D4F', outline: 'none', marginBottom: 10 }}
              />
              <label htmlFor="team-member-role" style={{ display: 'block', color: '#697386', fontSize: 10.5, fontWeight: 700, marginBottom: 6 }}>الدور</label>
              <select
                id="team-member-role"
                value={memberRole}
                onChange={(event) => setMemberRole(event.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', background: '#fff', border: '1px solid #DED9D0', borderRadius: 10, padding: '10px 11px', fontFamily: "'Almarai',sans-serif", color: '#1C2D4F', outline: 'none', marginBottom: 11 }}
              >
                <option value="سكرتارية">سكرتارية</option>
                <option value="محامي">محامي</option>
                <option value="محامية">محامية</option>
              </select>
              <div style={{ color: '#7B8494', fontSize: 9.5, lineHeight: 1.6, marginBottom: 11 }}>
                سنطبّق صلاحيات مبدئية مناسبة للدور، ويمكن تعديلها من بطاقة الصلاحيات بعد الإضافة.
              </div>
              <button
                type="button"
                onClick={addMember}
                disabled={!memberName.trim()}
                style={{ width: '100%', background: memberName.trim() ? '#1C2D4F' : '#E4E1DB', color: memberName.trim() ? '#C9A870' : '#AAAEB6', border: 'none', borderRadius: 20, padding: '9px 14px', fontFamily: "'Almarai',sans-serif", fontSize: 11.5, fontWeight: 800, cursor: memberName.trim() ? 'pointer' : 'not-allowed' }}
              >
                إضافة الحساب
              </button>
            </div>
          )}

          {!showAddMember && (
            <div style={{ marginTop: 14, background: '#EEF2F6', border: '1px solid #DCE3EB', borderRadius: 11, padding: '11px 12px', color: '#667184', fontSize: 10.5, lineHeight: 1.7 }}>
              من قائمة الحساب أسفل الشريط الجانبي تقدر تدخل كأي عضو وتشوف المنصة من منظوره.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
