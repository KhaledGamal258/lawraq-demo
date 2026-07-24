import { team } from '../data/clients';

export default function TeamView({ allClients = [] }) {
  const caseCounts = team.reduce((acc, m) => {
    acc[m.id] = allClients.filter((c) => c.assignedTo === m.id).length;
    return acc;
  }, {});

  return (
    <div dir="rtl" style={{ fontFamily: "'Almarai',sans-serif", padding: '20px 16px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#1C2D4F', fontSize: 18, fontWeight: 800 }}>فريق المكتب</span>
        <span style={{ color: '#9BA3AF', fontSize: 12.5 }}>{team.length} أعضاء</span>
      </div>

      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {team.map((member, idx) => (
          <div
            key={member.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '16px 16px',
              borderBottom: idx < team.length - 1 ? '1px solid #F0ECE5' : 'none',
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 13,
                background: member.avatarBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: 18,
                fontWeight: 800,
                color: member.avatarColor,
              }}
            >
              {member.initial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                <span style={{ color: '#1C2D4F', fontSize: 14.5, fontWeight: 800 }}>{member.name}</span>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: member.role === 'صاحب المكتب' ? 'rgba(201,168,112,0.12)' : 'rgba(28,45,79,0.07)',
                    border: `1px solid ${member.role === 'صاحب المكتب' ? 'rgba(201,168,112,0.3)' : 'rgba(28,45,79,0.13)'}`,
                    borderRadius: 20,
                    padding: '2px 9px',
                  }}
                >
                  <span
                    style={{
                      color: member.role === 'صاحب المكتب' ? '#B5924A' : '#5D6579',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {member.role}
                  </span>
                </div>
              </div>
              <div style={{ color: '#9BA3AF', fontSize: 12 }}>
                {caseCounts[member.id]} {caseCounts[member.id] === 1 ? 'قضية نشطة' : 'قضايا نشطة'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: '#fff',
          borderRadius: 14,
          boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
          padding: '18px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div>
          <div style={{ color: '#1C2D4F', fontSize: 14, fontWeight: 800, marginBottom: 4 }}>دعوة محامٍ جديد للمكتب</div>
          <div style={{ color: '#B2B8C2', fontSize: 12 }}>متاح عند التفعيل</div>
        </div>
        <button
          type="button"
          disabled
          style={{
            background: '#EDEBE6',
            border: 'none',
            borderRadius: 20,
            padding: '9px 18px',
            color: '#C4C9D4',
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "'Almarai',sans-serif",
            cursor: 'not-allowed',
            flexShrink: 0,
          }}
        >
          دعوة محامي
        </button>
      </div>
    </div>
  );
}
