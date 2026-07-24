import { useState } from 'react';
import { calculateInheritance } from '../utils/inheritance';
import { toArNum } from '../utils/arabicDate';

function formatEGP(amount) {
  return `${toArNum(Math.round(amount).toLocaleString('en-US'))} ج.م`;
}

function SegToggle({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', background: '#F6F4F0', borderRadius: 20, padding: 3, width: 'fit-content' }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          style={{
            background: value === opt.value ? '#1C2D4F' : 'transparent',
            border: 'none',
            borderRadius: 17,
            padding: '8px 20px',
            color: value === opt.value ? '#C9A870' : '#9BA3AF',
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "'Almarai',sans-serif",
            cursor: 'pointer',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function HeirSwitch({ label, checked, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F4F0EA' }}>
      <span style={{ color: '#1C2D4F', fontSize: 13.5, fontWeight: 700 }}>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        aria-label={label}
        style={{
          width: 44,
          height: 26,
          borderRadius: 13,
          background: checked ? '#1C2D4F' : '#E8E4DC',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          flexShrink: 0,
          transition: 'background 0.15s',
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: checked ? '#C9A870' : '#fff',
            position: 'absolute',
            top: 3,
            insetInlineStart: checked ? 3 : 21,
            transition: 'inset-inline-start 0.15s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        />
      </button>
    </div>
  );
}

function NumberField({ label, value, onChange }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ color: '#9BA3AF', fontSize: 11.5, fontWeight: 700, marginBottom: 6 }}>{label}</div>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
        style={{ width: '100%', background: '#fff', border: '1.5px solid #E8E4DC', borderRadius: 10, padding: '10px 12px', fontFamily: "'Almarai',sans-serif", fontSize: 14, color: '#1C2D4F', boxSizing: 'border-box', outline: 'none', textAlign: 'center' }}
      />
    </div>
  );
}

function DisclaimerBanner() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(201,168,112,0.1)', border: '1.5px solid rgba(201,168,112,0.3)', borderRadius: 12, padding: '13px 15px' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
        <circle cx="12" cy="12" r="10" stroke="#B5924A" strokeWidth="1.7" />
        <path d="M12 8v5M12 16h.01" stroke="#B5924A" strokeWidth="1.9" strokeLinecap="round" />
      </svg>
      <div style={{ color: '#8A6D2F', fontSize: 12, lineHeight: 1.8 }}>
        هذه الحسابات مبنية على القواعد العامة لقانون المواريث المصري والشريعة الإسلامية لأبسط الحالات الشائعة.
        قد توجد حالات خاصة (مثل الحجب، العول، الرد، أو وجود إخوة أو أجداد) تتطلب استشارة قاض شرعي أو محامٍ مختص.
        هذه أداة استرشادية للعرض التوضيحي ولا تغني عن المراجعة القانونية.
      </div>
    </div>
  );
}

export default function InheritanceCalculator() {
  const [deceasedGender, setDeceasedGender] = useState('male');
  const [estateAmount, setEstateAmount] = useState('1000000');
  const [hasFather, setHasFather] = useState(true);
  const [hasMother, setHasMother] = useState(true);
  const [hasSpouse, setHasSpouse] = useState(true);
  const [numSons, setNumSons] = useState(2);
  const [numDaughters, setNumDaughters] = useState(1);
  const [result, setResult] = useState(null);

  const spouseLabel = deceasedGender === 'male' ? 'الزوجة (الأرملة)' : 'الزوج (الأرمل)';

  const onCalculate = () => {
    setResult(
      calculateInheritance({
        deceasedGender,
        estateAmount,
        hasFather,
        hasMother,
        hasSpouse,
        numSons,
        numDaughters,
      })
    );
  };

  return (
    <div dir="rtl" style={{ fontFamily: "'Almarai',sans-serif", padding: '20px 16px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <span style={{ color: '#1C2D4F', fontSize: 18, fontWeight: 800 }}>حاسبة المواريث</span>
        <div style={{ color: '#9BA3AF', fontSize: 12.5, marginTop: 3 }}>حساب استرشادي لأنصبة الورثة في الحالات البسيطة الشائعة</div>
      </div>

      <DisclaimerBanner />

      {/* FORM */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px rgba(0,0,0,0.05)', padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ color: '#9BA3AF', fontSize: 11.5, fontWeight: 700, marginBottom: 8 }}>جنس المتوفى</div>
          <SegToggle
            value={deceasedGender}
            onChange={setDeceasedGender}
            options={[
              { value: 'male', label: 'ذكر' },
              { value: 'female', label: 'أنثى' },
            ]}
          />
        </div>

        <div>
          <div style={{ color: '#9BA3AF', fontSize: 11.5, fontWeight: 700, marginBottom: 8 }}>مبلغ التركة الصافي (جنيه مصري)</div>
          <input
            type="number"
            min="0"
            value={estateAmount}
            onChange={(e) => setEstateAmount(e.target.value)}
            style={{ width: '100%', background: '#fff', border: '1.5px solid #1C2D4F', borderRadius: 10, padding: '11px 14px', fontFamily: "'Almarai',sans-serif", fontSize: 14, color: '#1C2D4F', boxSizing: 'border-box', outline: 'none', boxShadow: '0 0 0 3px rgba(28,45,79,0.08)' }}
          />
        </div>

        <div>
          <div style={{ color: '#9BA3AF', fontSize: 11.5, fontWeight: 700, marginBottom: 4 }}>الورثة الأساسيون</div>
          <HeirSwitch label="الأب" checked={hasFather} onChange={setHasFather} />
          <HeirSwitch label="الأم" checked={hasMother} onChange={setHasMother} />
          <HeirSwitch label={spouseLabel} checked={hasSpouse} onChange={setHasSpouse} />
        </div>

        <div>
          <div style={{ color: '#9BA3AF', fontSize: 11.5, fontWeight: 700, marginBottom: 8 }}>الأبناء</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <NumberField label="عدد الأبناء (ذكور)" value={numSons} onChange={setNumSons} />
            <NumberField label="عدد البنات (إناث)" value={numDaughters} onChange={setNumDaughters} />
          </div>
        </div>

        <button
          type="button"
          onClick={onCalculate}
          style={{ background: '#1C2D4F', border: 'none', borderRadius: 14, padding: '15px 24px', color: '#C9A870', fontSize: 15, fontWeight: 800, fontFamily: "'Almarai',sans-serif", cursor: 'pointer', boxShadow: '0 6px 24px rgba(28,45,79,0.22)' }}
        >
          احسب الميراث
        </button>
      </div>

      {/* RESULTS */}
      {result && (
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ height: 2.5, background: 'linear-gradient(to left, transparent 0%, #C9A870 20%, #C9A870 80%, transparent 100%)' }} />
          <div style={{ padding: '16px 16px 4px' }}>
            <span style={{ color: '#1C2D4F', fontSize: 16, fontWeight: 800 }}>توزيع التركة</span>
          </div>

          {!result.hasAnyHeir ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#B2B8C2', fontSize: 13 }}>
              الرجاء تحديد وريث واحد على الأقل لحساب التوزيع
            </div>
          ) : (
            <div style={{ padding: '4px 16px 16px' }}>
              {result.rows.map((row, idx) => (
                <div
                  key={row.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    padding: '13px 4px',
                    borderBottom: idx < result.rows.length - 1 ? '1px solid #F4F0EA' : 'none',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <div style={{ color: row.isWarning ? '#B45309' : '#1C2D4F', fontSize: 13.5, fontWeight: 800, marginBottom: 3 }}>
                      {row.label}
                      {row.count > 1 && <span style={{ color: '#9BA3AF', fontWeight: 700 }}> (العدد: {toArNum(row.count)})</span>}
                    </div>
                    <div style={{ color: '#9BA3AF', fontSize: 11.5 }}>
                      النصيب: {row.fractionText} · {toArNum(row.pct.toFixed(1))}٪
                    </div>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    {row.count > 1 && (
                      <div style={{ color: '#9BA3AF', fontSize: 11, marginBottom: 2 }}>{formatEGP(row.perUnitAmount)} / للفرد</div>
                    )}
                    <div style={{ color: row.isWarning ? '#B45309' : '#1C2D4F', fontSize: 14, fontWeight: 800 }}>{formatEGP(row.totalAmount)}</div>
                  </div>
                </div>
              ))}

              {result.warnings.length > 0 && (
                <div style={{ marginTop: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 10, padding: '11px 13px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {result.warnings.map((w, i) => (
                    <div key={i} style={{ color: '#92620A', fontSize: 12, lineHeight: 1.7 }}>⚠ {w}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{ height: 24 }} />
    </div>
  );
}
