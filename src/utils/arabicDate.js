export const AR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
export const AR_WEEKDAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export function toArNum(n) {
  return String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
}

export function buildDateObj(iso) {
  const d = new Date(iso);
  const day = d.getUTCDate();
  const month = AR_MONTHS[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  return { day: toArNum(day), month, full: `${toArNum(day)} ${month} ${toArNum(year)}` };
}

export function buildHearingObj(iso, time = '١٠:٠٠ صباحاً', timeShort = '١٠:٠٠ ص') {
  const d = new Date(iso);
  const dateObj = buildDateObj(iso);
  return { ...dateObj, dayOfWeek: AR_WEEKDAYS[d.getUTCDay()], time, timeShort };
}
