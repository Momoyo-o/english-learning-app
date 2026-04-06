import { useState, useEffect } from 'react';
import { getLogs, saveLog, deleteLog, savePhrase, ACTIVITY_TYPES } from '../store.js';

function LogForm({ onClose, onSaved, defaultLogId }) {
  const [form, setForm] = useState({
    activity: 'podcast',
    title: '',
    duration: '',
    date: new Date().toISOString().slice(0, 10),
    memo: '',
  });
  const [phraseText, setPhraseText] = useState('');
  const [phraseMeaning, setPhraseMeaning] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.duration) return;
    const log = saveLog({ ...form, duration: parseInt(form.duration) });
    if (phraseText.trim()) {
      savePhrase({ phrase: phraseText.trim(), meaning: phraseMeaning.trim(), logId: log.id, logTitle: form.title || ACTIVITY_TYPES.find(a=>a.value===form.activity)?.label, tags: [] });
    }
    onSaved?.();
    onClose();
  };

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-handle" />
        <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>学習を記録</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label>アクティビティ</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ACTIVITY_TYPES.map(a => (
                <button key={a.value} onClick={() => set('activity', a.value)} style={{
                  padding: '8px 14px', borderRadius: 10, border: `1px solid ${form.activity === a.value ? 'var(--accent)' : 'var(--border)'}`,
                  background: form.activity === a.value ? 'rgba(108,99,255,0.15)' : 'var(--surface2)',
                  color: form.activity === a.value ? 'var(--text)' : 'var(--text-muted)',
                  fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  {a.emoji} {a.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label>タイトル（任意）</label>
            <input placeholder="例: BBC Learning English Ep.123" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label>時間（分）</label>
              <input type="number" placeholder="30" value={form.duration} onChange={e => set('duration', e.target.value)} min="1" />
            </div>
            <div>
              <label>日付</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
          </div>

          <div>
            <label>メモ（任意）</label>
            <textarea placeholder="気づいたことなど..." value={form.memo} onChange={e => set('memo', e.target.value)} rows={2} style={{ resize: 'none' }} />
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
            <label style={{ color: 'var(--accent)', marginBottom: 8 }}>💬 フレーズを一緒に記録（任意）</label>
            <input placeholder="英語フレーズ" value={phraseText} onChange={e => setPhraseText(e.target.value)} style={{ marginBottom: 8 }} />
            <input placeholder="意味・使い方" value={phraseMeaning} onChange={e => setPhraseMeaning(e.target.value)} />
          </div>

          <button className="btn-primary" onClick={handleSave} disabled={!form.duration} style={{ opacity: form.duration ? 1 : 0.4 }}>
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

  const handleDelete = (id) => {
    deleteLog(id);
    setConfirmDelete(null);
    refresh();
  };

  return (
    <div className="scroll-area" style={{ paddingBottom: '100px' }}>
      <div style={{ padding: '52px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>学習ログ 📝</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)} style={{ width: 'auto', padding: '10px 18px', fontSize: 13 }}>
          + 追加
        </button>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        {sortedDates.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>まだ記録がありません</p>
            <button className="btn-primary" style={{ marginTop: 16, width: 'auto', padding: '10px 24px' }} onClick={() => setShowForm(true)}>
              最初の記録を追加
            </button>
          </div>
        ) : (
          sortedDates.map(date => (
            <div key={date} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
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
                      <div className={`act-bg-${log.activity}`} style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                        {act.emoji}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{log.title || act.label}</div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                          <span className={`act-${log.activity}`} style={{ fontSize: 11, fontFamily: 'Syne', fontWeight: 600 }}>{act.label}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>・{log.duration}分</span>
                        </div>
                        {log.memo && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.5 }}>{log.memo}</div>}
                      </div>
                      <button onClick={() => setConfirmDelete(log.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, padding: '2px 4px', flexShrink: 0 }}>
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
        <LogForm
          onClose={() => { setShowForm(false); onFormClose?.(); }}
          onSaved={refresh}
        />
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
              <button onClick={() => handleDelete(confirmDelete)} style={{ flex: 1, background: 'rgba(255,101,132,0.2)', color: 'var(--podcast)', border: '1px solid rgba(255,101,132,0.3)', borderRadius: 12, padding: '10px 16px', fontFamily: 'Syne', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                削除
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
