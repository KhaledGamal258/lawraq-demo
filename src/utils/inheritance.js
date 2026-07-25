import { toArNum } from './arabicDate';

const FRACTION_NAMES = {
  '1/2': 'النصف',
  '1/4': 'الربع',
  '1/8': 'الثمن',
  '1/3': 'الثلث',
  '1/6': 'السدس',
  '2/3': 'الثلثان',
};

function formatFraction(num, den) {
  if (num <= 0) return { text: '—', pct: 0 };
  const value = num / den;
  let n = 0;
  let d = 1;
  let bestError = Number.POSITIVE_INFINITY;
  for (let candidateDen = 1; candidateDen <= 96; candidateDen += 1) {
    const candidateNum = Math.round(value * candidateDen);
    const error = Math.abs(value - candidateNum / candidateDen);
    if (error < bestError) {
      n = candidateNum;
      d = candidateDen;
      bestError = error;
    }
    if (error < 1e-9) break;
  }
  const key = `${n}/${d}`;
  const name = FRACTION_NAMES[key];
  const pct = (num / den) * 100;
  const text = name ? `${name} (${toArNum(n)}/${toArNum(d)})` : `${toArNum(n)}/${toArNum(d)}`;
  return { text, pct };
}

// Simplified fixed-share calculator for common cases only — see disclaimer.
// Does not implement hijab, awl/radd, grandparents, siblings, or multi-wife splitting.
export function calculateInheritance({ deceasedGender, estateAmount, hasFather, hasMother, hasSpouse, numSons, numDaughters }) {
  const estate = Math.max(0, Number(estateAmount) || 0);
  const sons = Math.max(0, Number(numSons) || 0);
  const daughters = Math.max(0, Number(numDaughters) || 0);
  const hasSons = sons > 0;
  const hasDaughters = daughters > 0;
  const hasChildren = hasSons || hasDaughters;

  const rows = [];
  const warnings = [];
  let allocated = 0;

  const addRow = (label, fraction, count = 1) => {
    if (fraction <= 0) return;
    const { text, pct } = formatFraction(fraction, 1);
    const totalAmount = estate * fraction;
    const perUnitAmount = totalAmount / count;
    rows.push({ key: label, label, fractionText: text, pct, count, perUnitAmount, totalAmount });
    allocated += fraction;
  };

  // 1. Spouse
  let spouseFraction = 0;
  if (hasSpouse) {
    if (deceasedGender === 'male') {
      spouseFraction = hasChildren ? 1 / 8 : 1 / 4;
      addRow('الزوجة', spouseFraction);
    } else {
      spouseFraction = hasChildren ? 1 / 4 : 1 / 2;
      addRow('الزوج', spouseFraction);
    }
  }

  // 2. Mother
  let motherFraction = 0;
  if (hasMother) {
    motherFraction = hasChildren ? 1 / 6 : 1 / 3;
    addRow('الأم', motherFraction);
  }

  if (hasSons) {
    // Sons present (with or without daughters): father gets fixed 1/6,
    // sons+daughters split the remainder 2:1.
    let fatherFraction = 0;
    if (hasFather) {
      fatherFraction = 1 / 6;
      addRow('الأب', fatherFraction);
    }
    const remainder = Math.max(0, 1 - spouseFraction - motherFraction - fatherFraction);
    const totalShares = sons * 2 + daughters * 1;
    if (totalShares > 0) {
      const sonFractionEach = (remainder * 2) / totalShares;
      const daughterFractionEach = (remainder * 1) / totalShares;
      addRow(sons === 1 ? 'الابن' : 'الأبناء', sonFractionEach * sons, sons);
      if (hasDaughters) addRow(daughters === 1 ? 'البنت' : 'البنات', daughterFractionEach * daughters, daughters);
    }
  } else if (hasDaughters) {
    // Daughters only, no sons: fixed Quranic share for daughters.
    const daughtersFixedTotal = daughters === 1 ? 1 / 2 : 2 / 3;
    addRow(daughters === 1 ? 'البنت' : 'البنات', daughtersFixedTotal, daughters);

    if (hasFather) {
      const fatherFraction = Math.max(0, 1 - spouseFraction - motherFraction - daughtersFixedTotal);
      addRow('الأب (الباقي كعصبة)', fatherFraction);
    } else {
      warnings.push('لا يوجد أب في هذه الحالة، ولا يمكن لهذه الأداة المبسطة تحديد مستحق الباقي (قد يكون إخوة أو أجداد) — راجع محامٍ مختص.');
    }
  } else {
    // No children at all: father takes the residue.
    if (hasFather) {
      const fatherFraction = Math.max(0, 1 - spouseFraction - motherFraction);
      addRow('الأب (الباقي كعصبة)', fatherFraction);
    }
  }

  const remainderFraction = Math.max(0, 1 - allocated);
  if (remainderFraction > 0.0005) {
    const { text, pct } = formatFraction(remainderFraction, 1);
    rows.push({
      key: 'unallocated',
      label: 'غير موزّع ضمن هذه الحالة المبسطة',
      fractionText: text,
      pct,
      count: 1,
      perUnitAmount: estate * remainderFraction,
      totalAmount: estate * remainderFraction,
      isWarning: true,
    });
    warnings.push('يوجد جزء من التركة غير موزّع — قد يستحقه ورثة آخرون (إخوة، أجداد، عصبة أخرى) خارج نطاق هذه الأداة المبسطة.');
  }

  return { rows, warnings, hasAnyHeir: hasSpouse || hasMother || hasFather || hasChildren };
}
