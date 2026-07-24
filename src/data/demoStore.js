const DEFAULT_DOCUMENTS = [
  { id: 'doc-1', name: 'عقد العمل الأصلي', date: '١٥ مايو ٢٠٢٦', size: '2.4 MB', visible: true, type: 'pdf' },
  { id: 'doc-2', name: 'قرار الفصل التعسفي', date: '٢ مارس ٢٠٢٦', size: '1.1 MB', visible: false, type: 'word' },
  { id: 'doc-3', name: 'محضر الجلسة السابقة', date: '١٨ أبريل ٢٠٢٦', size: '0.8 MB', visible: true, type: 'image' },
];

const DEFAULT_UPDATES = [
  { id: 'update-1', title: 'تم تقديم مذكرة الدفاع', desc: 'رُفعت مذكرة الدفاع رسميًا إلى محكمة استئناف القاهرة', date: '١٢ يونيو ٢٠٢٦', dotColor: '#1C2D4F', visible: true },
  { id: 'update-2', title: 'تحديد موعد الجلسة القادمة', desc: 'تم تحديد الجلسة القادمة وإبلاغ فريق المكتب', date: '٥ يونيو ٢٠٢٦', dotColor: '#C9A870', visible: true },
  { id: 'update-3', title: 'ملاحظات استراتيجية (سرية)', desc: 'نقاط ضعف في حجج الطرف الآخر — للاطلاع الداخلي فقط', date: '٢٠ مايو ٢٠٢٦', dotColor: '#B2B8C2', visible: false },
];

const DEFAULT_MESSAGES = [
  { id: 'msg-1', from: 'client', text: 'صباح الخير أستاذة نادين، هل تم تقديم المذكرة بالفعل؟ أنا قلقان قليلًا', time: '٩:١٥ ص · ١٢ يونيو' },
  { id: 'msg-2', from: 'lawyer', text: 'صباح النور، نعم تم تقديم المذكرة اليوم بنجاح، وكل شيء ماشي حسب الخطة', time: '١٠:٣٢ ص · ١٢ يونيو' },
  { id: 'msg-3', from: 'client', text: 'شكرًا جدًا، هل في مستندات محتاجة توقيع قبل الجلسة؟', time: '٢:٠٠ م · ١٤ يونيو' },
];

export const DEMO_STORAGE_KEY = 'lawraq-demo-v2-store';

export function createDefaultCaseContent() {
  return {
    docs: DEFAULT_DOCUMENTS.map((item) => ({ ...item })),
    updates: DEFAULT_UPDATES.map((item) => ({ ...item })),
    messages: DEFAULT_MESSAGES.map((item) => ({ ...item })),
  };
}

export function loadDemoStore() {
  try {
    const saved = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveDemoStore(store) {
  try {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // The demo still works in memory when storage is unavailable.
  }
}

export function clearDemoStore() {
  try {
    window.localStorage.removeItem(DEMO_STORAGE_KEY);
  } catch {
    // Nothing else to do.
  }
}
