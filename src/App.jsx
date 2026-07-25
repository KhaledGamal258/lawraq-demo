import { useEffect, useMemo, useState } from 'react';
import LawyerLayout from './components/LawyerLayout';
import BrandLogo from './components/BrandLogo';
import ClientPortal from './screens/ClientPortal';
import LawyerDashboard from './screens/LawyerDashboard';
import ClientsView from './screens/ClientsView';
import CasePage from './screens/CasePage';
import AddClient from './screens/AddClient';
import TeamView from './screens/TeamView';
import InheritanceCalculator from './screens/InheritanceCalculator';
import { clients as clientsData, getClientById, upcomingHearings as upcomingHearingsDefault, getCaseStatusOption, team as defaultTeam } from './data/clients';
import { clearDemoStore, createDefaultCaseContent, DEMO_STORE_VERSION, loadDemoStore, saveDemoStore } from './data/demoStore';
import { buildHearingObj, toArNum } from './utils/arabicDate';
import { generateId } from './utils/id';

const NEW_CLIENT_PALETTE = [
  { avatarBg: 'rgba(59,130,246,0.1)', avatarColor: '#3B82F6' },
  { avatarBg: 'rgba(20,184,166,0.1)', avatarColor: '#14B8A6' },
  { avatarBg: 'rgba(139,92,246,0.1)', avatarColor: '#8B5CF6' },
  { avatarBg: 'rgba(236,72,153,0.1)', avatarColor: '#EC4899' },
  { avatarBg: 'rgba(245,158,11,0.1)', avatarColor: '#F59E0B' },
];

function deriveDefaultCaseStatus(base) {
  if (base.archived || ['صدر الحكم', 'تمت التسوية'].includes(base.status)) return 'منتهية';
  if (base.status === 'قيد النظر') return 'قيد النظر';
  return 'جارية';
}

const LAWYER_NAME = 'أ. نادين سامي';

function createAutomaticActivity({ title, desc, actor, visible = false, dotColor = '#C9A870' }) {
  return {
    id: generateId('activity'),
    title,
    desc,
    date: 'الآن · سجّله النظام تلقائيًا',
    dotColor,
    visible,
    source: 'system',
    actorId: actor?.id || 'system',
    actorName: actor?.name || 'النظام',
    actorRole: actor?.role || 'أتمتة',
  };
}

function isoDaysFromToday(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

const DEMO_HEARING_OVERRIDES = {
  ahmed: buildHearingObj(isoDaysFromToday(2), '١٠:٠٠ صباحًا', '١٠:٠٠ ص'),
  mona: buildHearingObj(isoDaysFromToday(4), '١١:٣٠ صباحًا', '١١:٣٠ ص'),
  sara: buildHearingObj(isoDaysFromToday(6), '٩:٠٠ صباحًا', '٩:٠٠ ص'),
  karim: buildHearingObj(isoDaysFromToday(8), '٩:٣٠ صباحًا', '٩:٣٠ ص'),
  mahmoud: buildHearingObj(isoDaysFromToday(10), '١٢:٠٠ ظهرًا', '١٢:٠٠ م'),
  yasmine: buildHearingObj(isoDaysFromToday(12), '١٠:٣٠ صباحًا', '١٠:٣٠ ص'),
  tarek: buildHearingObj(isoDaysFromToday(14), '١:٠٠ ظهرًا', '١:٠٠ م'),
  rania: buildHearingObj(isoDaysFromToday(16), '١١:٠٠ صباحًا', '١١:٠٠ ص'),
  hossam: buildHearingObj(isoDaysFromToday(18), '٩:٠٠ صباحًا', '٩:٠٠ ص'),
  dalia: buildHearingObj(isoDaysFromToday(20), '١٢:٣٠ ظهرًا', '١٢:٣٠ م'),
  omar: buildHearingObj(isoDaysFromToday(22), '١٠:٠٠ صباحًا', '١٠:٠٠ ص'),
};

const DEMO_DEADLINE_OVERRIDES = {
  ahmed: isoDaysFromToday(2),
  mona: isoDaysFromToday(5),
  rania: isoDaysFromToday(8),
};

function EntrySwitcher({ onSelect, onReset }) {
  return (
    <div
      dir="rtl"
      style={{
        minHeight: '100vh',
        width: '100%',
        background: '#D9D4CB',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 28,
        padding: '40px 24px',
        boxSizing: 'border-box',
        fontFamily: "'Almarai',sans-serif",
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <BrandLogo dark={false} markSize={48} />
        <div style={{ color: '#5D6579', fontSize: 12.5, fontWeight: 700, marginTop: 14 }}>
          اختر الواجهة اللي هتبدأ منها الجولة
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 360 }}>
        <button
          type="button"
          onClick={() => onSelect('lawyer')}
          style={{
            background: '#1C2D4F',
            color: '#C9A870',
            border: 'none',
            borderRadius: 14,
            padding: '18px 24px',
            fontFamily: "'Almarai',sans-serif",
            fontSize: 16,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 6px 24px rgba(28,45,79,0.26)',
          }}
        >
          واجهة المحامي
        </button>
        <button
          type="button"
          onClick={() => onSelect('client')}
          style={{
            background: '#fff',
            color: '#1C2D4F',
            border: '1.5px solid #E8E4DC',
            borderRadius: 14,
            padding: '18px 24px',
            fontFamily: "'Almarai',sans-serif",
            fontSize: 16,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
          }}
        >
          بوابة العميل
        </button>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 4, flexWrap: 'wrap' }}>
          <a
            href="../"
            style={{ color: '#1C2D4F', fontSize: 11.5, fontWeight: 700, textDecoration: 'none' }}
          >
            صفحة التعريف
          </a>
          <button
            type="button"
            onClick={onReset}
            style={{ background: 'none', border: 'none', color: '#8A4B43', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: "'Almarai',sans-serif", padding: 0 }}
          >
            إعادة بيانات العرض
          </button>
        </div>
      </div>

      <div style={{ background: 'rgba(28,45,79,0.07)', border: '1px solid rgba(28,45,79,0.12)', color: '#5D6579', borderRadius: 999, padding: '7px 14px', fontSize: 10.5, fontWeight: 700 }}>
        نسخة عرض · جميع الأسماء والبيانات تجريبية
      </div>
    </div>
  );
}

function getScopedClientIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('client');
}

export default function App() {
  const scopedClientId = useMemo(() => getScopedClientIdFromUrl(), []);
  const [mode, setMode] = useState(scopedClientId ? 'client' : null);
  const [lawyerView, setLawyerView] = useState('dashboard');
  const [selectedClientId, setSelectedClientId] = useState(scopedClientId || 'ahmed');
  const [initialDemoStore] = useState(loadDemoStore);
  const restoredDemo = initialDemoStore.version === DEMO_STORE_VERSION ? initialDemoStore : {};

  const [sessionsMap, setSessionsMap] = useState(restoredDemo.sessionsMap || {});
  const [hearingOverrides, setHearingOverrides] = useState(restoredDemo.hearingOverrides || {});
  const [assignmentOverrides, setAssignmentOverrides] = useState(restoredDemo.assignmentOverrides || {});
  const [archiveOverrides, setArchiveOverrides] = useState(restoredDemo.archiveOverrides || {});
  const [statusOverrides, setStatusOverrides] = useState(restoredDemo.statusOverrides || {});
  const [addedClients, setAddedClients] = useState(restoredDemo.addedClients || []);
  const [caseContentMap, setCaseContentMap] = useState(restoredDemo.caseContentMap || {});
  const [teamDiscussionsMap, setTeamDiscussionsMap] = useState(restoredDemo.teamDiscussionsMap || {});
  const [teamMembers, setTeamMembers] = useState(restoredDemo.teamMembers || defaultTeam);
  const [currentMemberId, setCurrentMemberId] = useState(restoredDemo.currentMemberId || 'nadine');
  const [toast, setToast] = useState(null);
  const currentMember = teamMembers.find((member) => member.id === currentMemberId) || teamMembers[0] || defaultTeam[0];
  const currentPermissions = currentMember.permissions || {};
  const getTeamMember = (id) => teamMembers.find((member) => member.id === id);

  useEffect(() => {
    saveDemoStore({
      version: DEMO_STORE_VERSION,
      sessionsMap,
      hearingOverrides,
      assignmentOverrides,
      archiveOverrides,
      statusOverrides,
      addedClients,
      caseContentMap,
      teamDiscussionsMap,
      teamMembers,
      currentMemberId,
    });
  }, [sessionsMap, hearingOverrides, assignmentOverrides, archiveOverrides, statusOverrides, addedClients, caseContentMap, teamDiscussionsMap, teamMembers, currentMemberId]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 2500);
  };

  const findBaseClient = (id) => addedClients.find((c) => c.id === id) || getClientById(id);

  const getMergedClient = (id) => {
    const base = findBaseClient(id);
    if (!base) return base;
    const caseStatus = statusOverrides[id] || deriveDefaultCaseStatus(base);
    const statusOption = getCaseStatusOption(caseStatus);
    return {
      ...base,
      nextHearing: hearingOverrides[id] || DEMO_HEARING_OVERRIDES[id] || base.nextHearing,
      appealDeadline: DEMO_DEADLINE_OVERRIDES[id] || base.appealDeadline,
      assignedTo: assignmentOverrides[id] || base.assignedTo,
      archived: archiveOverrides[id] !== undefined ? archiveOverrides[id] : !!base.archived,
      status: caseStatus,
      statusColor: statusOption.color,
      statusBg: statusOption.bg,
      statusBorder: statusOption.border,
    };
  };

  const handleStatusChange = (clientId, newStatus) => {
    if (!currentPermissions.editCases) {
      showToast('هذا الحساب لا يملك صلاحية تعديل القضايا');
      return;
    }
    setStatusOverrides((prev) => ({ ...prev, [clientId]: newStatus }));
    updateCaseContent(clientId, (content) => ({
      ...content,
      updates: [
        createAutomaticActivity({
          title: 'تم تحديث حالة القضية',
          desc: `غيّر ${currentMember.name} حالة القضية إلى «${newStatus}» وحدّثها النظام في ملف الموكّل.`,
          actor: currentMember,
          visible: true,
          dotColor: '#1C2D4F',
        }),
        ...content.updates,
      ],
    }));
    showToast('تم تحديث الحالة وتسجيل النشاط تلقائيًا');
  };

  const getMergedSessions = (id) => {
    const dynamic = sessionsMap[id] || [];
    const base = findBaseClient(id)?.sessions || [];
    return [...dynamic, ...base];
  };

  const createCaseContentFor = (clientId) => createDefaultCaseContent(findBaseClient(clientId));

  const getCaseContent = (clientId) => caseContentMap[clientId] || createCaseContentFor(clientId);

  const updateCaseContent = (clientId, updater) => {
    setCaseContentMap((prev) => {
      const current = prev[clientId] || createCaseContentFor(clientId);
      return { ...prev, [clientId]: updater(current) };
    });
  };

  const getTeamDiscussion = (clientId) => {
    if (teamDiscussionsMap[clientId]) return teamDiscussionsMap[clientId];
    return (findBaseClient(clientId)?.teamDiscussion || []).map((message, index) => (
      message.id ? message : { ...message, id: `team-${clientId}-${index}` }
    ));
  };

  const handleTeamMessage = (clientId, text) => {
    if (!currentPermissions.viewInternal) {
      showToast('هذا الحساب لا يملك صلاحية الاطلاع على النقاش الداخلي');
      return;
    }
    const cleanText = text.trim();
    if (!cleanText) return;
    setTeamDiscussionsMap((prev) => ({
      ...prev,
      [clientId]: [
        ...(prev[clientId] || getTeamDiscussion(clientId)),
        { id: generateId('team-msg'), from: currentMember.id, text: cleanText, time: 'الآن' },
      ],
    }));
  };

  const handleToggleDocument = (clientId, documentId) => {
    if (!currentPermissions.shareWithClient) {
      showToast('هذا الحساب لا يملك صلاحية المشاركة مع الموكّل');
      return;
    }
    updateCaseContent(clientId, (content) => {
      const targetDocument = content.docs.find((doc) => doc.id === documentId);
      if (!targetDocument) return content;
      const willBeVisible = !targetDocument.visible;
      return {
        ...content,
        docs: content.docs.map((doc) => (doc.id === documentId ? { ...doc, visible: willBeVisible } : doc)),
        updates: [
          createAutomaticActivity({
            title: willBeVisible ? 'تمت مشاركة مستند مع الموكّل' : 'تم إرجاع مستند للاستخدام الداخلي',
            desc: willBeVisible
              ? `أصبح «${targetDocument.name}» متاحًا تلقائيًا في بوابة الموكّل.`
              : `أصبح «${targetDocument.name}» داخليًا ولم يعد ظاهرًا في بوابة الموكّل.`,
            actor: currentMember,
            visible: willBeVisible,
            dotColor: willBeVisible ? '#16A34A' : '#9CA3AF',
          }),
          ...content.updates,
        ],
      };
    });
    showToast('تم تنفيذ الإجراء وتسجيله تلقائيًا');
  };

  const handleAddDocument = (clientId, document) => {
    if (!currentPermissions.manageDocuments) {
      showToast('هذا الحساب لا يملك صلاحية إضافة مستندات');
      return;
    }
    updateCaseContent(clientId, (content) => ({
      ...content,
      docs: [document, ...content.docs],
      updates: [
        createAutomaticActivity({
          title: 'تمت إضافة مستند إلى القضية',
          desc: `أضيف «${document.name}» إلى ملف القضية للاستخدام الداخلي.`,
          actor: currentMember,
          visible: false,
          dotColor: '#1C2D4F',
        }),
        ...content.updates,
      ],
    }));
    showToast('تمت إضافة المستند إلى ملف القضية');
  };

  const handleToggleUpdate = (clientId, updateId) => {
    if (!currentPermissions.shareWithClient) {
      showToast('هذا الحساب لا يملك صلاحية تغيير ما يظهر للموكّل');
      return;
    }
    updateCaseContent(clientId, (content) => ({
      ...content,
      updates: content.updates.map((item) => (
        item.id === updateId
          ? {
            ...item,
            visible: !item.visible,
            visibilityChangedById: currentMember.id,
            visibilityChangedByName: currentMember.name,
          }
          : item
      )),
    }));
    showToast('تم تحديث ظهور النشاط وتسجيل منفّذ الإجراء');
  };

  const handleAddManualUpdate = (clientId, update) => {
    if (!currentPermissions.editCases) {
      showToast('هذا الحساب لا يملك صلاحية إضافة تحديثات');
      return;
    }
    updateCaseContent(clientId, (content) => ({
      ...content,
      updates: [
        {
          id: generateId('activity'),
          title: update.title,
          desc: update.desc,
          date: 'الآن · أضيف يدويًا',
          dotColor: '#C9A870',
          visible: update.visible,
          source: 'manual',
          actorId: currentMember.id,
          actorName: currentMember.name,
          actorRole: currentMember.role,
        },
        ...content.updates,
      ],
    }));
    showToast(update.visible ? 'تمت إضافة التحديث وإظهاره للموكّل' : 'تمت إضافة التحديث داخل المكتب');
  };

  const handleEditUpdate = (clientId, updateId, changes) => {
    if (!currentPermissions.editCases) {
      showToast('هذا الحساب لا يملك صلاحية تعديل التحديثات');
      return;
    }
    updateCaseContent(clientId, (content) => ({
      ...content,
      updates: content.updates.map((item) => {
        if (item.id !== updateId) return item;
        return {
          ...item,
          originalTitle: item.originalTitle || item.title,
          originalDesc: item.originalDesc || item.desc,
          title: changes.title,
          desc: changes.desc,
          customized: true,
          lastEditedById: currentMember.id,
          lastEditedByName: currentMember.name,
        };
      }),
    }));
    showToast('تم حفظ الصياغة الجديدة للتحديث');
  };

  const handleCaseMessage = (clientId, from, text) => {
    if (from !== 'client' && !currentPermissions.replyToClients) {
      showToast('هذا الحساب لا يملك صلاحية الرد على الموكّل');
      return;
    }
    const cleanText = text.trim();
    if (!cleanText) return;
    updateCaseContent(clientId, (content) => ({
      ...content,
      messages: [...content.messages, {
        id: generateId('msg'),
        from,
        text: cleanText,
        time: 'الآن',
        senderId: from === 'client' ? clientId : currentMember.id,
        senderName: from === 'client' ? findBaseClient(clientId)?.name : currentMember.name,
      }],
    }));
  };

  const handleClientUploadDocument = (clientId, document) => {
    const clientActor = {
      id: clientId,
      name: findBaseClient(clientId)?.name || 'الموكّل',
      role: 'موكّل',
    };
    updateCaseContent(clientId, (content) => ({
      ...content,
      docs: [document, ...content.docs],
      updates: [
        createAutomaticActivity({
          title: 'رفع الموكّل مستندًا جديدًا',
          desc: `أرسل الموكّل «${document.name}» إلى المكتب وأصبح محفوظًا داخل ملف القضية.`,
          actor: clientActor,
          visible: true,
          dotColor: '#16A34A',
        }),
        ...content.updates,
      ],
    }));
    showToast('وصل مستند جديد من بوابة الموكّل');
  };

  const resetDemo = () => {
    clearDemoStore();
    setCaseContentMap({});
    setSessionsMap({});
    setHearingOverrides({});
    setAssignmentOverrides({});
    setArchiveOverrides({});
    setStatusOverrides({});
    setAddedClients([]);
    setTeamDiscussionsMap({});
    setTeamMembers(defaultTeam);
    setCurrentMemberId('nadine');
  };

  const handleAddClient = (form) => {
    if (!currentPermissions.manageClients) {
      showToast('هذا الحساب لا يملك صلاحية إضافة قضية');
      return;
    }
    const id = `client-${Date.now()}`;
    const palette = NEW_CLIENT_PALETTE[addedClients.length % NEW_CLIENT_PALETTE.length];
    const filedToday = buildHearingObj(new Date().toISOString().slice(0, 10));
    const newClient = {
      id,
      name: form.name,
      phone: form.phone,
      initial: form.name.trim().charAt(0) || '؟',
      avatarBg: palette.avatarBg,
      avatarColor: palette.avatarColor,
      caseTitle: form.caseTitle,
      caseType: form.caseType,
      caseNumber: `${filedToday.full.split(' ').pop()}/${toArNum(1000 + addedClients.length)}`,
      court: form.court,
      courtShort: form.court.replace(/^محكمة\s+/, ''),
      governorate: form.governorate,
      status: 'قيد النظر',
      statusColor: '#F59E0B',
      statusBg: 'rgba(245,158,11,0.1)',
      statusBorder: 'rgba(245,158,11,0.22)',
      filedDate: filedToday.full,
      stage: 'رفع الدعوى',
      activeCases: 1,
      assignedTo: currentMember.id,
      nextHearing: buildHearingObj(form.hearingDate),
      sessions: [],
      teamDiscussion: [],
    };
    setAddedClients((prev) => [...prev, newClient]);
    showToast('تمت إضافة الموكّل بنجاح');
    setLawyerView('clients');
  };

  const handleAddSession = (clientId, session) => {
    if (!currentPermissions.recordSessions) {
      showToast('هذا الحساب لا يملك صلاحية تسجيل الجلسات');
      return;
    }
    setSessionsMap((prev) => ({
      ...prev,
      [clientId]: [session, ...(prev[clientId] || [])],
    }));
    if (session.nextHearing) {
      setHearingOverrides((prev) => ({ ...prev, [clientId]: session.nextHearing }));
    }
    updateCaseContent(clientId, (content) => {
      const automaticUpdates = [
        createAutomaticActivity({
          title: 'تم تسجيل نتيجة جلسة جديدة',
          desc: session.decision,
          actor: currentMember,
          visible: false,
          dotColor: '#1C2D4F',
        }),
      ];
      if (session.nextHearing) {
        automaticUpdates.unshift(
          createAutomaticActivity({
            title: 'تم تحديث موعد الجلسة القادمة',
            desc: `حدّث النظام الموعد القادم إلى ${session.nextHearing.full} وأظهره في بوابة الموكّل.`,
            actor: currentMember,
            visible: true,
            dotColor: '#C9A870',
          })
        );
      }
      return { ...content, updates: [...automaticUpdates, ...content.updates] };
    });
    showToast('تم حفظ الجلسة وتشغيل التحديثات التلقائية');
  };

  const handleReassign = (clientId, newAssigneeId) => {
    if (!currentPermissions.manageAssignments) {
      showToast('هذا الحساب لا يملك صلاحية إسناد القضايا');
      return;
    }
    setAssignmentOverrides((prev) => ({ ...prev, [clientId]: newAssigneeId }));
    const assignee = getTeamMember(newAssigneeId);
    updateCaseContent(clientId, (content) => ({
      ...content,
      updates: [
        createAutomaticActivity({
          title: 'تم تغيير المحامي المسؤول',
          desc: `أُسندت القضية إلى ${assignee?.name || 'عضو آخر في الفريق'}.`,
          actor: currentMember,
          visible: false,
          dotColor: '#5D6579',
        }),
        ...content.updates,
      ],
    }));
    showToast('تم الإسناد وتسجيله تلقائيًا');
  };

  const handleArchive = (clientId) => {
    if (!currentPermissions.editCases) {
      showToast('هذا الحساب لا يملك صلاحية أرشفة القضايا');
      return;
    }
    setArchiveOverrides((prev) => ({ ...prev, [clientId]: true }));
    updateCaseContent(clientId, (content) => ({
      ...content,
      updates: [
        createAutomaticActivity({
          title: 'تم أرشفة القضية',
          desc: 'نقل النظام القضية من القضايا النشطة إلى الأرشيف مع الاحتفاظ بسجلها.',
          actor: currentMember,
          visible: false,
          dotColor: '#9CA3AF',
        }),
        ...content.updates,
      ],
    }));
    showToast('تم نقل القضية إلى الأرشيف');
    setLawyerView('clients');
  };

  const handleRestore = (clientId) => {
    if (!currentPermissions.editCases) {
      showToast('هذا الحساب لا يملك صلاحية استعادة القضايا');
      return;
    }
    setArchiveOverrides((prev) => ({ ...prev, [clientId]: false }));
    updateCaseContent(clientId, (content) => ({
      ...content,
      updates: [
        createAutomaticActivity({
          title: 'تمت استعادة القضية',
          desc: 'أعاد النظام القضية إلى قائمة القضايا النشطة.',
          actor: currentMember,
          visible: false,
          dotColor: '#16A34A',
        }),
        ...content.updates,
      ],
    }));
    showToast('تمت استعادة القضية إلى النشطين');
  };

  const handleAddTeamMember = ({ name, role, permissions }) => {
    if (!currentPermissions.manageTeam) {
      showToast('إدارة أعضاء المكتب متاحة لمديرة المكتب فقط');
      return;
    }
    const palette = NEW_CLIENT_PALETTE[teamMembers.length % NEW_CLIENT_PALETTE.length];
    const member = {
      id: `member-${Date.now()}`,
      name: name.trim(),
      initial: name.trim().charAt(0) || '؟',
      role,
      avatarBg: palette.avatarBg,
      avatarColor: palette.avatarColor,
      permissions: { ...permissions, manageTeam: false },
    };
    setTeamMembers((prev) => [...prev, member]);
    showToast(`تمت إضافة ${member.name} ويمكن تجربة حسابه الآن`);
  };

  const handleUpdateTeamPermissions = (memberId, permissions) => {
    if (!currentPermissions.manageTeam) {
      showToast('إدارة الصلاحيات متاحة لمديرة المكتب فقط');
      return;
    }
    if (memberId === 'nadine') {
      showToast('صلاحيات مديرة المكتب الأساسية ثابتة في نسخة العرض');
      return;
    }
    setTeamMembers((prev) => prev.map((member) => (
      member.id === memberId
        ? { ...member, permissions: { ...member.permissions, ...permissions, manageTeam: false } }
        : member
    )));
    showToast('تم تحديث صلاحيات الحساب');
  };

  const handleSwitchAccount = (memberId) => {
    const target = getTeamMember(memberId);
    if (!target) return;
    setCurrentMemberId(memberId);
    setLawyerView('dashboard');
    showToast(`أنت الآن داخل حساب ${target.name}`);
  };

  const mergedAllClients = [...clientsData, ...addedClients].map((c) => getMergedClient(c.id));
  const visibleClients = currentPermissions.viewAllCases
    ? mergedAllClients
    : mergedAllClients.filter((client) => client.assignedTo === currentMember.id);
  const mergedUpcomingHearings = upcomingHearingsDefault
    .map((hearing) => getMergedClient(hearing.id))
    .filter((client) => visibleClients.some((visibleClient) => visibleClient.id === client.id));

  const goHome = () => {
    if (scopedClientId) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    setMode(null);
    setLawyerView('dashboard');
  };

  if (mode === null) {
    return <EntrySwitcher onSelect={setMode} onReset={resetDemo} />;
  }

  if (mode === 'client') {
    const portalClient = getMergedClient(selectedClientId);
    if (!portalClient) {
      return (
        <div dir="rtl" style={{ minHeight: '100vh', background: '#F6F4F0', display: 'grid', placeItems: 'center', padding: 24, fontFamily: "'Almarai',sans-serif" }}>
          <div style={{ maxWidth: 440, background: '#fff', border: '1px solid #E8E4DC', borderRadius: 18, padding: '28px 24px', textAlign: 'center', boxShadow: '0 8px 28px rgba(28,45,79,0.08)' }}>
            <BrandLogo />
            <div style={{ color: '#1C2D4F', fontSize: 20, fontWeight: 800, marginTop: 20 }}>رابط الموكّل غير صالح</div>
            <div style={{ color: '#7B8494', fontSize: 13, lineHeight: 1.8, marginTop: 9 }}>راجع الرابط المرسل من المكتب أو اطلب رابطًا جديدًا.</div>
            <button type="button" onClick={goHome} style={{ marginTop: 18, background: '#1C2D4F', color: '#C9A870', border: 'none', borderRadius: 20, padding: '9px 18px', fontFamily: "'Almarai',sans-serif", fontWeight: 800, cursor: 'pointer' }}>
              الرجوع إلى البداية
            </button>
          </div>
        </div>
      );
    }
    const portalLawyer = getTeamMember(portalClient.assignedTo)?.name || LAWYER_NAME;
    return (
      <div style={{ minHeight: '100vh', background: '#D9D4CB' }}>
        {!scopedClientId && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 16px 0', fontFamily: "'Almarai',sans-serif" }}>
            <button
              type="button"
              onClick={goHome}
              style={{ background: 'none', border: 'none', color: 'rgba(28,45,79,0.55)', fontSize: 11, fontWeight: 700, letterSpacing: 0.6, cursor: 'pointer', padding: '6px 10px' }}
            >
              LAWRAQ · بوابة العميل — رجوع لاختيار الواجهة
            </button>
          </div>
        )}
        <ClientPortal
          client={portalClient}
          lawyerName={portalLawyer}
          latestSession={getMergedSessions(selectedClientId)[0]}
          caseContent={getCaseContent(selectedClientId)}
          onSendMessage={(text) => handleCaseMessage(selectedClientId, 'client', text)}
          onUploadDocument={(document) => handleClientUploadDocument(selectedClientId, document)}
        />
      </div>
    );
  }

  const openCase = (id) => {
    if (!visibleClients.some((client) => client.id === id)) {
      showToast('هذه القضية خارج نطاق صلاحيات الحساب الحالي');
      return;
    }
    setSelectedClientId(id);
    setLawyerView('case');
  };

  let content;
  if (lawyerView === 'clients') {
    content = (
      <ClientsView
        onOpenCase={openCase}
        allClients={visibleClients}
        teamMembers={teamMembers}
        onCopied={() => showToast('تم نسخ رابط الموكّل ✓')}
        onWhatsAppClick={() => showToast('التكامل مع واتساب — قريبًا')}
      />
    );
  } else if (lawyerView === 'case') {
    const fullCaseContent = getCaseContent(selectedClientId);
    const scopedCaseContent = currentPermissions.viewInternal
      ? fullCaseContent
      : {
        ...fullCaseContent,
        docs: fullCaseContent.docs.filter((document) => document.visible),
        updates: fullCaseContent.updates.filter((update) => update.visible),
      };
    content = (
      <CasePage
        key={selectedClientId}
        client={getMergedClient(selectedClientId)}
        lawyerName={currentMember.name}
        currentMember={currentMember}
        teamMembers={teamMembers}
        permissions={currentPermissions}
        onBack={() => setLawyerView('clients')}
        sessions={getMergedSessions(selectedClientId)}
        onAddSession={(session) => handleAddSession(selectedClientId, session)}
        onReassign={(newId) => handleReassign(selectedClientId, newId)}
        onArchive={() => handleArchive(selectedClientId)}
        onRestore={() => handleRestore(selectedClientId)}
        onStatusChange={(newStatus) => handleStatusChange(selectedClientId, newStatus)}
        caseContent={scopedCaseContent}
        teamMessages={currentPermissions.viewInternal ? getTeamDiscussion(selectedClientId) : []}
        onSendTeamMessage={(text) => handleTeamMessage(selectedClientId, text)}
        onAddDocument={(document) => handleAddDocument(selectedClientId, document)}
        onToggleDocument={(documentId) => handleToggleDocument(selectedClientId, documentId)}
        onToggleUpdate={(updateId) => handleToggleUpdate(selectedClientId, updateId)}
        onAddManualUpdate={(update) => handleAddManualUpdate(selectedClientId, update)}
        onEditUpdate={(updateId, changes) => handleEditUpdate(selectedClientId, updateId, changes)}
        onSendCaseMessage={(text) => handleCaseMessage(selectedClientId, 'lawyer', text)}
        onWhatsAppClick={() => showToast('التكامل مع واتساب — قريبًا')}
        onTemplatesClick={() => showToast('قريبًا — نماذج قانونية جاهزة للاستخدام المباشر')}
      />
    );
  } else if (lawyerView === 'add') {
    content = (
      <AddClient
        onBack={() => setLawyerView('dashboard')}
        onSubmit={handleAddClient}
      />
    );
  } else if (lawyerView === 'team') {
    content = (
      <TeamView
        allClients={mergedAllClients}
        onOpenCase={openCase}
        teamMembers={teamMembers}
        currentMember={currentMember}
        onAddMember={handleAddTeamMember}
        onUpdatePermissions={handleUpdateTeamPermissions}
        canOpenCase={(clientId) => visibleClients.some((client) => client.id === clientId)}
      />
    );
  } else if (lawyerView === 'inheritance') {
    content = <InheritanceCalculator />;
  } else {
    content = (
      <LawyerDashboard
        lawyerName={currentMember.name}
        currentMember={currentMember}
        onOpenCase={openCase}
        onOpenClients={() => setLawyerView('clients')}
        upcomingHearings={mergedUpcomingHearings}
        allClients={visibleClients}
        teamMembers={teamMembers}
      />
    );
  }

  return (
    <LawyerLayout
      activeView={lawyerView === 'case' || lawyerView === 'add' ? 'clients' : lawyerView}
      onNavigate={setLawyerView}
      onAddClient={() => setLawyerView('add')}
      onHome={goHome}
      lawyerName={currentMember.name}
      currentMember={currentMember}
      teamMembers={teamMembers}
      onSwitchAccount={handleSwitchAccount}
      canAddClient={!!currentPermissions.manageClients}
    >
      {content}
      {toast && (
        <div
          dir="rtl"
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1C2D4F',
            color: '#fff',
            padding: '12px 22px',
            borderRadius: 30,
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "'Almarai',sans-serif",
            boxShadow: '0 10px 30px rgba(0,0,0,0.28)',
            zIndex: 300,
            whiteSpace: 'nowrap',
          }}
        >
          {toast}
        </div>
      )}
    </LawyerLayout>
  );
}
