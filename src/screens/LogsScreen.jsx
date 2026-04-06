import { useState, useEffect } from 'react';
import { getLogs, saveLog, deleteLog, savePhrase, ACTIVITY_TYPES } from '../store.js';

const QUICK_DURATIONS = [10, 20, 30, 45, 60];

export function LogForm({ onClose, onSaved }) {
  const [form, setForm] = useState({
    activity: 'podcast',
    title: '',
    url: '',
    duration: '',
    customDuration: '',
    date: new Date().toISOString().slice(0, 10),
    memo: '',
  });
  const [phraseText, setPhraseText] = useState('');
  const [phraseMeaning, setPhraseMeaning] = useState('');
  const [isCustomDur, setIsCustomDur] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const selectDuration = (mins) => {
    setIsCustomDur(false);
    set('duration', mins);
    set('customDuration', '');
  };

  const selectCustom = () => {
    setIsCustomDur(true);
    set('duration', '');
  };

  const effectiveDuration = isCustomDur ? parseInt(form.customDuration) : form.duration;

  const handleSave = () => {
    if (!effectiveDuration || effectiveDuration <= 0) return;
    const log = saveLog({ ...form, duration: effectiveDuration, url: form.url.trim() || null });
    if (phraseText.trim()) {
      savePhrase({
        phrase: phraseText.trim(),
        meaning: phraseMeaning.trim(),
        logId: log.id,
        logTitle: form.title || ACTIVITY_TYPES.find(a => a.value === form.activity)?.label,
        tags: [],
      });
    }
    onSaved?.();
    onClose();
  };

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-handle" />
        <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, marginBottom: 20, color: 'var(--text)' }}>学習を記録</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Activity type */}
          <div>
            <label>アクティビティ</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ACTIVITY_TYPES.map(a => (
                <button key={a.value} onClick={() => set('activity', a.value)} style={{
                  padding: '8px 12px', borderRadius: 10,
                  border: `1.5px solid ${form.activity === a.value ? 'var(--accent)' : 'var(--border)'}`,
                  background: form.activity === a.value ? 'var(--accent-light)' : 'var(--surface2)',
                  color: form.activity === a.value ? 'var(--accent)' : 'var(--text-muted)',
                  fontSize: 13, fontFamily: 'Syne', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  {a.emoji} {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label>タイトル（任意）</label>
            <input placeholder="例: BBC Learning English Ep.123" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>

          {/* URL */}
          <div>
            <label>URL（任意）</label>
            <input type="url" placeholder="https://..." value={form.url} onChange={e => set('url', e.target.value)} />
          </div>

          {/* Duration quick select */}
          <div>
            <label>学習時間</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {QUICK_DURATIONS.map(m => (
                <button key={m} className={`dur-btn${!isCustomDur && form.duration === m ? ' active' : ''}`} onClick={() => selectDuration(m)}>
                  {m >= 60 ? `${m/60}h` : `${m}m`}
                </button>
              ))}
              <button className={`dur-btn${isCustomDur ? ' active' : ''}`} onClick={selectCustom}>
                任意
              </button>
            </div>
            {isCustomDur && (
              <input
                type="number"
                placeholder="分で入力（例: 25）"
                value={form.customDuration}
                onChange={e => set('customDuration', e.target.value)}
                min="1"
                style={{ marginTop: 8 }}
                autoFocus
              />
            )}
          </div>

          {/* Date */}
          <div>
            <label>日付</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </div>

          {/* Memo */}
          <div>
            <label>メモ（任意）</label>
            <textarea placeholder="気づいたことなど..." value={form.memo} onChange={e => set('memo', e.target.value)} rows={2} style={{ resize: 'none' }} />
          </div>

          {/* Phrase link */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <label style={{ color: 'var(--accent)' }}>💬 フレーズを一緒に記録（任意）</label>
            <input placeholder="英語フレーズ" value={phraseText} onChange={e => setPhraseText(e.target.value)} style={{ marginBottom: 8 }} />
            <input placeholder="意味・使い方" value={phraseMeaning} onChange={e => setPhraseMeaning(e.target.value)} />
          </div>

          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={!effectiveDuration || effectiveDuration <= 0}
            style={{ opacity: (effectiveDuration && effectiveDuration > 0) ? 1 : 0.4 }}
          >
            記録する
          </button>
        </div>
      </div>
    </>
  );
}

export default function LogsScreen({ showAddForm, onFormClose }) {
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const refresh = () => setLogs(getLogs());
  useEffect(() => { refresh(); }, []);
  useEffect(() => { if (showAddForm) setShowForm(true); }, [showAddForm]);

  const actType = (v) => ACTIVITY_TYPES.find(a => a.value === v) || ACTIVITY_TYPES[4];

  const grouped = logs.reduce((acc, log) => {
    if (!acc[log.date]) acc[log.date] = [];
    acc[log.date].push(log);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort().reverse();

  const formatDate = (d) => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (d === today) return '今日';
    if (d === yesterday) return '昨日';
    return new Date(d).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' });
  };

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>学習ログ 📝</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)} style={{ width: 'auto', padding: '9px 16px', fontSize: 13, marginBottom: 2 }}>
          + 追加
        </button>
      </div>

      <div className="page-body" style={{ paddingBottom: '100px' }}>
        {sortedDates.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px', marginTop: 8 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>まだ記録がありません</p>
            <button className="btn-primary" style={{ marginTop: 16, width: 'auto', padding: '10px 24px' }} onClick={() => setShowForm(true)}>
              最初の記録を追加
            </button>
          </div>
        ) : (
          sortedDates.map(date => (
            <div key={date} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingTop: 4 }}>
                <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, color: 'var(--text-muted)' }}>
                  {formatDate(date)}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {grouped[date].reduce((s, l) => s + (l.duration || 0), 0)}分
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {grouped[date].map(log => {
                  const act = actType(log.activity);
                  return (
                    <div key={log.id} className="card" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div className={`act-bg-${log.activity}`} style={{ width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                        {act.emoji}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{log.title || act.label}</div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span className={`act-${log.activity}`} style={{ fontSize: 11, fontFamily: 'Syne', fontWeight: 700 }}>{act.label}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· {log.duration}分</span>
                        </div>
                        {log.url && (
                          <a href={log.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            🔗 {log.url.replace(/^https?:\/\//, '').slice(0, 40)}
                          </a>
                        )}
                        {log.memo && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.5 }}>{log.memo}</div>}
                      </div>
                      <button onClick={() => setConfirmDelete(log.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, padding: '0 4px', flexShrink: 0, lineHeight: 1 }}>
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {(showForm || showAddForm) && (
        <LogForm onClose={() => { setShowForm(false); onFormClose?.(); }} onSaved={refresh} />
      )}

      {confirmDelete && (
        <>
          <div className="sheet-overlay" onClick={() => setConfirmDelete(null)} />
          <div className="sheet" style={{ padding: '24px 20px 40px' }}>
            <div className="sheet-handle" />
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 17, marginBottom: 8 }}>削除しますか？</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>この記録を削除します。紐付けされたフレーズの参照も外れます。</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-ghost" onClick={() => setConfirmDelete(null)} style={{ flex: 1 }}>キャンセル</button>
              <button onClick={() => { deleteLog(confirmDelete); setConfirmDelete(null); refresh(); }} style={{ flex: 1, background: 'rgba(240,82,107,0.1)', color: 'var(--podcast)', border: '1px solid rgba(240,82,107,0.3)', borderRadius: 12, padding: '10px 16px', fontFamily: 'Syne', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                削除
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
