import { useState, useEffect } from 'react';
import { getPhrases, savePhrase, deletePhrase, getLogs, ACTIVITY_TYPES } from '../store.js';

function PhraseForm({ onClose, onSaved }) {
  const [form, setForm] = useState({ phrase: '', meaning: '', tags: '', logId: '' });
  const [logs, setLogs] = useState([]);

  useEffect(() => { setLogs(getLogs().slice(0, 30)); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.phrase.trim()) return;
    const selectedLog = logs.find(l => l.id === form.logId);
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    savePhrase({
      phrase: form.phrase.trim(),
      meaning: form.meaning.trim(),
      tags,
      logId: form.logId || null,
      logTitle: selectedLog ? (selectedLog.title || ACTIVITY_TYPES.find(a => a.value === selectedLog.activity)?.label) : null,
    });
    onSaved?.();
    onClose();
  };

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-handle" />
        <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>フレーズを追加</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label>英語フレーズ</label>
            <input placeholder="例: It's on the tip of my tongue" value={form.phrase} onChange={e => set('phrase', e.target.value)} />
          </div>
          <div>
            <label>意味・使い方</label>
            <textarea placeholder="例: 言葉が喉まで出かかっている状態" value={form.meaning} onChange={e => set('meaning', e.target.value)} rows={3} style={{ resize: 'none' }} />
          </div>
          <div>
            <label>タグ（カンマ区切り）</label>
            <input placeholder="例: 慣用句, 会話, ビジネス" value={form.tags} onChange={e => set('tags', e.target.value)} />
          </div>
          {logs.length > 0 && (
            <div>
              <label>学習ログと紐付け</label>
              <select value={form.logId} onChange={e => set('logId', e.target.value)}>
                <option value="">紐付けなし</option>
                {logs.map(l => {
                  const act = ACTIVITY_TYPES.find(a => a.value === l.activity) || ACTIVITY_TYPES[4];
                  return (
                    <option key={l.id} value={l.id}>
                      {act.emoji} {l.title || act.label} ({l.date})
                    </option>
                  );
                })}
              </select>
            </div>
          )}
          <button className="btn-primary" onClick={handleSave} disabled={!form.phrase.trim()} style={{ opacity: form.phrase.trim() ? 1 : 0.4 }}>
            保存
          </button>
        </div>
      </div>
    </>
  );
}

export default function PhrasesScreen() {
  const [phrases, setPhrases] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const refresh = () => setPhrases(getPhrases());
  useEffect(() => { refresh(); }, []);

  const allTags = [...new Set(phrases.flatMap(p => p.tags || []))];

  const filtered = phrases.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.phrase.toLowerCase().includes(q) || p.meaning?.toLowerCase().includes(q);
    const matchTag = !activeTag || (p.tags || []).includes(activeTag);
    return matchSearch && matchTag;
  });

  const handleDelete = (id) => {
    deletePhrase(id);
    setConfirmDelete(null);
    if (expanded === id) setExpanded(null);
    refresh();
  };

  return (
    <div className="scroll-area" style={{ paddingBottom: '100px' }}>
      <div style={{ padding: '52px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>フレーズ帳 💬</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)} style={{ width: 'auto', padding: '10px 18px', fontSize: 13 }}>
          + 追加
        </button>
      </div>

      <div style={{ padding: '16px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input placeholder="🔍 フレーズ・意味を検索..." value={search} onChange={e => setSearch(e.target.value)} />

        {allTags.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => setActiveTag('')} className="tag" style={{
              cursor: 'pointer',
              background: !activeTag ? 'rgba(108,99,255,0.2)' : 'var(--surface2)',
              borderColor: !activeTag ? 'var(--accent)' : 'var(--border)',
              color: !activeTag ? 'var(--accent)' : 'var(--text-muted)',
            }}>
              すべて
            </button>
            {allTags.map(tag => (
              <button key={tag} onClick={() => setActiveTag(tag === activeTag ? '' : tag)} className="tag" style={{
                cursor: 'pointer',
                background: activeTag === tag ? 'rgba(108,99,255,0.2)' : 'var(--surface2)',
                borderColor: activeTag === tag ? 'var(--accent)' : 'var(--border)',
                color: activeTag === tag ? 'var(--accent)' : 'var(--text-muted)',
              }}>
                {tag}
              </button>
            ))}
          </div>
        )}

        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {filtered.length}件 / 計{phrases.length}件
        </div>

        {filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>💭</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              {phrases.length === 0 ? 'フレーズを追加しましょう' : '一致するフレーズがありません'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(p => (
              <div key={p.id} className="card" onClick={() => setExpanded(expanded === p.id ? null : p.id)} style={{ cursor: 'pointer', transition: 'background 0.15s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--accent)', lineHeight: 1.3 }}>{p.phrase}</div>
                    {p.meaning && (
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5,
                        overflow: expanded === p.id ? 'visible' : 'hidden',
                        display: expanded === p.id ? 'block' : '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {p.meaning}
                      </div>
                    )}
                    {expanded === p.id && (
                      <div style={{ marginTop: 10 }}>
                        {p.logTitle && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
                            📝 {p.logTitle}
                          </div>
                        )}
                        {(p.tags || []).length > 0 && (
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {p.tags.map(t => <span key={t} className="tag">{t}</span>)}
                          </div>
                        )}
                        <div style={{ marginTop: 12 }}>
                          <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(p.id); }} style={{
                            background: 'rgba(255,101,132,0.1)', color: 'var(--podcast)',
                            border: '1px solid rgba(255,101,132,0.25)', borderRadius: 8,
                            padding: '6px 14px', fontSize: 12, cursor: 'pointer',
                          }}>
                            削除
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 16, flexShrink: 0, marginTop: 2 }}>
                    {expanded === p.id ? '▲' : '▼'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && <PhraseForm onClose={() => setShowForm(false)} onSaved={refresh} />}

      {confirmDelete && (
        <>
          <div className="sheet-overlay" onClick={() => setConfirmDelete(null)} />
          <div className="sheet" style={{ padding: '24px 20px 40px' }}>
            <div className="sheet-handle" />
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 17, marginBottom: 8 }}>削除しますか？</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>このフレーズを削除します。</p>
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
