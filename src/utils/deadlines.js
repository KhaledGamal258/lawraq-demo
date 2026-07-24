import { toArNum } from './arabicDate';

export const APPEAL_DEADLINE_THRESHOLD_DAYS = 10;

// Days remaining, computed live against the real current date — never
// hardcoded, so the demo genuinely counts down when opened on any day.
export function getDaysRemaining(isoDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(isoDate);
  deadline.setHours(0, 0, 0, 0);
  return Math.round((deadline - today) / 86400000);
}

// Urgency tiers: >7 days amber/soft, 4-7 amber/strong, <=3 red/strong,
// negative (past due) red/strongest.
export function getAppealUrgency(daysLeft) {
  if (daysLeft < 0) return 'overdue';
  if (daysLeft <= 3) return 'critical';
  if (daysLeft <= 7) return 'warning';
  return 'soft';
}

const URGENCY_STYLES = {
  overdue: { bg: 'rgba(239,68,68,0.14)', border: '#EF4444', text: '#B91C1C', icon: '#DC2626' },
  critical: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.5)', text: '#B91C1C', icon: '#EF4444' },
  warning: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.5)', text: '#92400E', icon: '#F59E0B' },
  soft: { bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.28)', text: '#92620A', icon: '#D9A441' },
};

export function getUrgencyStyle(urgency) {
  return URGENCY_STYLES[urgency] || URGENCY_STYLES.soft;
}

export function formatDeadlineMessage(daysLeft, label) {
  if (daysLeft < 0) return `فات ميعاد ${label} منذ ${toArNum(Math.abs(daysLeft))} ${arDayWord(Math.abs(daysLeft))}`;
  if (daysLeft === 0) return `ميعاد ${label} ينتهي اليوم`;
  if (daysLeft === 1) return `باقي يوم واحد على انتهاء ميعاد ${label}`;
  if (daysLeft === 2) return `باقي يومين على انتهاء ميعاد ${label}`;
  return `باقي ${toArNum(daysLeft)} ${arDayWord(daysLeft)} على انتهاء ميعاد ${label}`;
}

function arDayWord(n) {
  if (n === 1) return 'يوم';
  if (n === 2) return 'يومين';
  if (n >= 3 && n <= 10) return 'أيام';
  return 'يوماً';
}

// Clients with an appeal_deadline within the alert threshold, sorted by
// urgency (soonest first). Used by both CasePage and the Dashboard.
export function getUrgentDeadlines(clients, thresholdDays = APPEAL_DEADLINE_THRESHOLD_DAYS) {
  return clients
    .filter((c) => c.appealDeadline && !c.archived)
    .map((c) => ({ client: c, daysLeft: getDaysRemaining(c.appealDeadline) }))
    .filter(({ daysLeft }) => daysLeft <= thresholdDays)
    .sort((a, b) => a.daysLeft - b.daysLeft);
}
