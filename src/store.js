// ─── Storage Keys ───────────────────────────────────────────────────
const LOGS_KEY = 'eng_logs';
const PHRASES_KEY = 'eng_phrases';

// ─── Logs ────────────────────────────────────────────────────────────
export function getLogs() {
  try { return JSON.parse(localStorage.getItem(LOGS_KEY) || '[]'); }
  catch { return []; }
}

export function saveLog(log) {
  const logs = getLogs();
  const entry = { ...log, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  logs.unshift(entry);
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  return entry;
}

export function deleteLog(id) {
  const logs = getLogs().filter(l => l.id !== id);
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  // Also remove logId from phrases
  const phrases = getPhrases().map(p => p.logId === id ? { ...p, logId: null, logTitle: null } : p);
  localStorage.setItem(PHRASES_KEY, JSON.stringify(phrases));
}

// ─── Phrases ─────────────────────────────────────────────────────────
export function getPhrases() {
  try { return JSON.parse(localStorage.getItem(PHRASES_KEY) || '[]'); }
  catch { return []; }
}

export function savePhrase(phrase) {
  const phrases = getPhrases();
  const entry = { ...phrase, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  phrases.unshift(entry);
  localStorage.setItem(PHRASES_KEY, JSON.stringify(phrases));
  return entry;
}

export function deletePhrase(id) {
  const phrases = getPhrases().filter(p => p.id !== id);
  localStorage.setItem(PHRASES_KEY, JSON.stringify(phrases));
}

// ─── Export / Import ─────────────────────────────────────────────────
export function exportData() {
  const data = { logs: getLogs(), phrases: getPhrases(), exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `english-log-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(json) {
  const data = JSON.parse(json);
  if (!data.logs || !data.phrases) throw new Error('Invalid format');
  localStorage.setItem(LOGS_KEY, JSON.stringify(data.logs));
  localStorage.setItem(PHRASES_KEY, JSON.stringify(data.phrases));
  return { logs: data.logs.length, phrases: data.phrases.length };
}

// ─── Stats helpers ────────────────────────────────────────────────────
export function getStreak() {
  const logs = getLogs();
  if (!logs.length) return 0;
  const days = [...new Set(logs.map(l => l.date))].sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (days[0] !== today && days[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 0; i < days.length - 1; i++) {
    const d1 = new Date(days[i]);
    const d2 = new Date(days[i + 1]);
    const diff = (d1 - d2) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

export const ACTIVITY_TYPES = [
  { value: 'podcast', label: 'Podcast', emoji: '🎧' },
  { value: 'video', label: '動画', emoji: '📹' },
  { value: 'conversation', label: 'オンライン英会話', emoji: '💬' },
  { value: 'reading', label: '読書', emoji: '📚' },
  { value: 'other', label: 'その他', emoji: '✏️' },
];
