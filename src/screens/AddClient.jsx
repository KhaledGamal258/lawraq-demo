import { useState } from 'react';
import { caseTypes, courts, governorates } from '../data/clients';
import { buildDateObj } from '../utils/arabicDate';

const fieldLabelStyle = { color: '#1C2D4F', fontSize: 12.5, fontWeight: 700, marginBottom: 7 };
const fieldBoxStyle = { width: '100%', background: '#fff', border: '1.5px solid #E8E4DC', borderRadius: 10, padding: '12px 14px', fontFamily: "'Almarai',sans-serif", fontSize: 13.5, color: '#1C2D4F', boxSizing: 'border-box', outline: 'none' };

function isoDaysFromToday(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function SelectField({ id, label, value, onChange, options, placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label htmlFor={id} style={{ ...fieldLabelStyle, display: 'block' }}>{label}</label>
      <select id={id} value={value} onChange={onChange} style={{ ...fieldBoxStyle, cursor: 'pointer', appearance: 'auto' }}>
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

export default function AddClient({ onBack, onSubmit }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [caseTitle, setCaseTitle] = useState('');
  const [caseType, setCaseType] = useState('');
  const [court, setCourt] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [hearingDate, setHearingDate] = useState(() => isoDaysFromToday(7));

  const canSubmit = name.trim() && phone.trim() && caseTitle.trim() && caseType && court && governorate && hearingDate;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ name: name.trim(), phone: phone.trim(), email: email.trim(), caseTitle: caseTitle.trim(), caseType, court, governorate, hearingDate });
  };

  return (
    <div dir="rtl" style={{ fontFamily: "'Almarai',sans-serif", background: '#F6F4F0', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navy nav bar */}
      <div style={{ background: '#1C2D4F', padding: '20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexShrink: 0 }}>
        <button
          type="button"
          onClick={onBack}
          aria-label="رجوع"
          style={{ width: 34, height: 34, borderRadius: 17, background: 'rgba(255,255,255,0.09)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 10.5, marginBottom: 2 }}>الموكّلون</div>
          <div style={{ color: '#fff', fontSize: 15, fontWeight: 800 }}>إضافة موكّل وقضية</div>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{ width: 34, textAlign: 'center', cursor: canSubmit ? 'pointer' : 'not-allowed', flexShrink: 0, background: 'none', border: 'none' }}
        >
          <span style={{ color: canSubmit ? '#C9A870' : 'rgba(201,168,112,0.4)', fontSize: 13, fontWeight: 700 }}>حفظ</span>
        </button>
      </div>

      {/* Scrollable form */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 15px 0', maxWidth: 640, width: '100%', marginInline: 'auto' }}>
        {/* Card 1: Client Info */}
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px rgba(0,0,0,0.05)', padding: '18px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #F4F0EA' }}>
            <div style={{ width: 3.5, height: 18, background: '#C9A870', borderRadius: 2, flexShrink: 0 }} />
            <span style={{ color: '#1C2D4F', fontSize: 14, fontWeight: 800 }}>بيانات الموكّل</span>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label htmlFor="client-name" style={{ ...fieldLabelStyle, display: 'block' }}>الاسم الكامل</label>
            <input
              id="client-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={fieldBoxStyle}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label htmlFor="client-phone" style={{ ...fieldLabelStyle, display: 'block' }}>رقم الهاتف</label>
            <div style={{ display: 'flex', border: '1.5px solid #E8E4DC', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '12px 14px', background: '#F6F4F0', borderLeft: '1.5px solid #E8E4DC', color: '#5D6579', fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>+٢٠</div>
              <input
                id="client-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ flex: 1, minWidth: 0, background: '#fff', border: 'none', padding: '12px 12px', fontFamily: "'Almarai',sans-serif", fontSize: 13.5, color: '#1C2D4F', outline: 'none', direction: 'ltr', textAlign: 'left' }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
              <label htmlFor="client-email" style={{ color: '#1C2D4F', fontSize: 12.5, fontWeight: 700 }}>البريد الإلكتروني</label>
              <span style={{ background: 'rgba(28,45,79,0.07)', color: '#9BA3AF', fontSize: 10, fontWeight: 700, borderRadius: 5, padding: '2px 7px', lineHeight: 1.5 }}>اختياري</span>
            </div>
            <input
              id="client-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              style={{ ...fieldBoxStyle, color: email ? '#1C2D4F' : '#9BA3AF', direction: 'ltr', textAlign: 'right' }}
            />
          </div>
        </div>

        {/* Card 2: Case Info */}
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px rgba(0,0,0,0.05)', padding: '18px 16px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #F4F0EA' }}>
            <div style={{ width: 3.5, height: 18, background: '#C9A870', borderRadius: 2, flexShrink: 0 }} />
            <span style={{ color: '#1C2D4F', fontSize: 14, fontWeight: 800 }}>بيانات القضية</span>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label htmlFor="case-title" style={{ ...fieldLabelStyle, display: 'block' }}>عنوان القضية</label>
            <input
              id="case-title"
              type="text"
              value={caseTitle}
              onChange={(e) => setCaseTitle(e.target.value)}
              style={{ ...fieldBoxStyle, border: '1.5px solid #1C2D4F', boxShadow: '0 0 0 3px rgba(28,45,79,0.08)' }}
            />
          </div>

          <SelectField id="case-type" label="نوع القضية" value={caseType} onChange={(e) => setCaseType(e.target.value)} options={caseTypes} placeholder="اختر نوع القضية" />
          <SelectField id="case-court" label="المحكمة" value={court} onChange={(e) => setCourt(e.target.value)} options={courts} placeholder="اختر المحكمة" />
          <SelectField id="case-governorate" label="المحافظة" value={governorate} onChange={(e) => setGovernorate(e.target.value)} options={governorates} placeholder="اختر المحافظة" />

          <div>
            <label htmlFor="next-hearing-date" style={{ ...fieldLabelStyle, display: 'block' }}>موعد الجلسة القادمة</label>
            <div style={{ position: 'relative' }}>
              <input
                id="next-hearing-date"
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={hearingDate}
                onChange={(e) => setHearingDate(e.target.value)}
                style={{ ...fieldBoxStyle, cursor: 'pointer' }}
              />
            </div>
            {hearingDate && (
              <div style={{ color: '#9BA3AF', fontSize: 11.5, marginTop: 6 }}>{buildDateObj(hearingDate).full}</div>
            )}
          </div>
        </div>

        {/* Submit button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{ width: '100%', background: canSubmit ? '#1C2D4F' : '#E8E4DC', border: 'none', borderRadius: 14, padding: '17px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: canSubmit ? 'pointer' : 'not-allowed', boxShadow: canSubmit ? '0 6px 24px rgba(28,45,79,0.26)' : 'none', marginBottom: 20 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke={canSubmit ? '#C9A870' : '#B2B8C2'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ color: canSubmit ? '#C9A870' : '#B2B8C2', fontSize: 16, fontWeight: 800, lineHeight: 1 }}>إضافة القضية والموكّل</span>
        </button>

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}
