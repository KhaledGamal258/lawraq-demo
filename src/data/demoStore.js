const DOCUMENTS_BY_CASE_TYPE = {
  عمالية: [
    ['عقد العمل الأصلي', 'PDF'],
    ['قرار إنهاء الخدمة', 'DOCX'],
    ['محضر الجلسة السابقة', 'JPG'],
  ],
  عقارية: [
    ['عقد الملكية', 'PDF'],
    ['مستخرج التسجيل العقاري', 'PDF'],
    ['محضر المعاينة', 'JPG'],
  ],
  'أحوال شخصية': [
    ['وثيقة الزواج', 'PDF'],
    ['شهادات الميلاد', 'PDF'],
    ['محضر جلسة الأسرة', 'JPG'],
  ],
  'إرث وتركات': [
    ['إعلام الوراثة', 'PDF'],
    ['شهادة الوفاة', 'PDF'],
    ['بيان حصر التركة', 'DOCX'],
  ],
  تجارية: [
    ['عقد تأسيس الشركة', 'PDF'],
    ['محضر اجتماع الشركاء', 'DOCX'],
    ['حافظة المستندات التجارية', 'PDF'],
  ],
  جنائية: [
    ['صورة المحضر الرسمي', 'PDF'],
    ['مذكرة الدفاع', 'DOCX'],
    ['حافظة مستندات القضية', 'PDF'],
  ],
  إدارية: [
    ['صورة القرار الإداري', 'PDF'],
    ['التظلّم المقدم', 'DOCX'],
    ['حافظة المستندات', 'PDF'],
  ],
  مدنية: [
    ['العقد محل النزاع', 'PDF'],
    ['الإنذار الرسمي', 'PDF'],
    ['مذكرة الدفاع', 'DOCX'],
  ],
};

const TYPE_MAP = { PDF: 'pdf', DOCX: 'word', JPG: 'image' };

function createDocuments(client) {
  const seeds = DOCUMENTS_BY_CASE_TYPE[client?.caseType] || [
    ['المستند الرئيسي للقضية', 'PDF'],
    ['مذكرة المكتب', 'DOCX'],
    ['محضر الجلسة السابقة', 'JPG'],
  ];
  return seeds.map(([name, label], index) => ({
    id: `doc-${index + 1}`,
    name,
    date: index === 0 ? '١٥ مايو ٢٠٢٦' : index === 1 ? '٢ مارس ٢٠٢٦' : '١٨ أبريل ٢٠٢٦',
    size: index === 0 ? '2.4 MB' : index === 1 ? '1.1 MB' : '0.8 MB',
    visible: index !== 1,
    type: TYPE_MAP[label],
  }));
}

function createUpdates(client) {
  if (client?.archived) {
    return [
      {
        id: 'update-1',
        title: 'تم إغلاق ملف القضية',
        desc: `اكتملت إجراءات «${client.caseTitle}» وتم نقل الملف إلى الأرشيف.`,
        date: '٢٠ أكتوبر ٢٠٢٥',
        dotColor: '#16A34A',
        visible: true,
        source: 'system',
      },
      {
        id: 'update-2',
        title: 'تم حفظ المستندات النهائية',
        desc: 'احتفظ المكتب بالحكم والمستندات النهائية داخل ملف القضية.',
        date: '٢٠ أكتوبر ٢٠٢٥',
        dotColor: '#1C2D4F',
        visible: true,
        source: 'system',
      },
    ];
  }

  const latestSession = client?.sessions?.[0];
  return [
    ...(latestSession ? [{
      id: 'update-session',
      title: 'قرار الجلسة الأخيرة',
      desc: latestSession.decision,
      date: latestSession.date.full,
      dotColor: '#C9A870',
      visible: true,
      source: 'system',
    }] : []),
    {
      id: 'update-1',
      title: 'تم إيداع مذكرة بالقضية',
      desc: `أودع المكتب المذكرة المطلوبة في ${client?.court || 'المحكمة المختصة'}.`,
      date: '١٢ يونيو ٢٠٢٦',
      dotColor: '#1C2D4F',
      visible: true,
      source: 'system',
    },
    {
      id: 'update-2',
      title: 'تم تأكيد موعد الجلسة',
      desc: client?.nextHearing?.full
        ? `تم تثبيت الموعد القادم بتاريخ ${client.nextHearing.full} وإبلاغ فريق المكتب.`
        : 'تم تحديث جدول القضية وإبلاغ فريق المكتب.',
      date: '٥ يونيو ٢٠٢٦',
      dotColor: '#C9A870',
      visible: true,
      source: 'system',
    },
    {
      id: 'update-3',
      title: 'ملاحظات استراتيجية (سرية)',
      desc: 'ملاحظات داخلية خاصة بخطة التعامل مع القضية — للاطلاع داخل المكتب فقط.',
      date: '٢٠ مايو ٢٠٢٦',
      dotColor: '#B2B8C2',
      visible: false,
      source: 'manual',
    },
  ];
}

function createMessages(client) {
  return [
    {
      id: 'msg-1',
      from: 'client',
      text: `مساء الخير، هل فيه أي مستجدات في ${client?.caseTitle || 'القضية'}؟`,
      time: '٩:١٥ ص · ١٢ يونيو',
    },
    {
      id: 'msg-2',
      from: 'lawyer',
      text: 'أهلًا بحضرتك، تم تحديث الملف وكل المستجدات المسموح بمشاركتها هتظهر هنا أولًا بأول.',
      time: '١٠:٣٢ ص · ١٢ يونيو',
    },
    {
      id: 'msg-3',
      from: 'client',
      text: 'شكرًا، هل مطلوب مني أي مستندات إضافية في الوقت الحالي؟',
      time: '٢:٠٠ م · ١٤ يونيو',
    },
  ];
}

export const DEMO_STORAGE_KEY = 'lawraq-demo-v3-store';
export const DEMO_STORE_VERSION = 3;

export function createDefaultCaseContent(client) {
  return {
    docs: createDocuments(client),
    updates: createUpdates(client),
    messages: createMessages(client),
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
