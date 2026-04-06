import { useState, useEffect, useRef } from 'react';
import { getLogs, getPhrases, exportData, importData, ACTIVITY_TYPES } from '../store.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ACT_COLORS = {
  podcast:      '#f9a8b8', // ピンク
  video:        '#a5b4fc', // ラベンダー
  conversation: '#86efac', // ミントグリーン
  reading:      '#fcd34d', // イエロー
  ai:           '#67e8f9', // 水色（追加した場合）
  other:        '#cbd5e1', // グレー
};

export default function StatsScreen() {
  const [logs, setLogs] = useState([]);
  const [phrases, setPhrases] = useState([]);
  const [range, setRange] = useState('week');
  const [importMsg, setImportMsg] = useState('');
  const fileRef = useRef();

  useEffect(() => { setLogs(getLogs()); setPhrases(getPhrases()); }, []);

  const now = new Date();
  const rangeStart = range === 'week'
    ? new Date(now - 6 * 86400000).toISOString().slice(0, 10)
    : new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const rangeLogs = logs.filter(l => l.date >= rangeStart);

  const barData = (() => {
    const days = range === 'week' ? 7 : new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => {
      const d = range === 'week'
        ? new Date(now - (6 - i) * 86400000)
        : new Date(now.getFullYear(), now.getMonth(), i + 1);
      const dateStr = d.toISOString().slice(0, 10);
      const mins = logs.filter(l => l.date === dateStr).reduce((s, l) => s + (l.duration || 0), 0);
      return { label: range === 'week' ? d.toLocaleDateString('ja-JP', { weekday: 'short' }) : `${i + 1}`, mins };
    });
  })();

  const pieData = ACTIVITY_TYPES.map(a => ({
    name: a.label, emoji: a.emoji, color: ACT_COLORS[a.value],
    value: rangeLogs.filter(l => l.activity === a.value).reduce((s, l) => s + (l.duration || 0), 0),
  })).filter(d => d.value > 0);

  const totalMins = rangeLogs.reduce((s, l) => s + (l.duration || 0), 0);
  const totalDays = new Set(rangeLogs.map(l => l.date)).size;

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const result = importData(ev.target.result);
        setImportMsg(`✅ インポート完了（ログ${result.logs}件・フレーズ${result.phrases}件）`);
        setLogs(getLogs()); setPhrases(getPhrases());
        setTimeout(() => setImportMsg(''), 3000);
      } catch { setImportMsg('❌ ファイルの形式が正しくありません'); setTimeout(() => setImportMsg(''), 3000); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const CustomTooltip = ({ active, payload }) => active && payload?.length ? (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', fontSize: 12, boxShadow: 'var(--shadow)' }}>
      {payload[0].value}分
    </div>
  ) : null;

  return (
    <div className="page">
      <div className="page-header">
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>統計</h1>
      </div>

      <div className="page-body" style={{ paddingBottom: '100px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Range */}
        <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: 12, padding: 4 }}>
          {[['week', '今週'], ['month', '今月']].map(([v, l]) => (
            <button key={v} onClick={() => setRange(v)} style={{
              flex: 1, padding: '9px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13,
              fontFamily: 'Syne', fontWeight: 700,
              background: range === v ? 'var(--surface)' : 'transparent',
              color: range === v ? 'var(--accent)' : 'var(--text-muted)',
              boxShadow: range === v ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s',
            }}>
              {l}
            </button>
          ))}
        </div>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { label: '総時間', value: totalMins >= 60 ? `${Math.floor(totalMins/60)}h${totalMins%60}m` : `${totalMins}m` },
            { label: '学習日数', value: `${totalDays}日` },
            { label: 'フレーズ', value: `${phrases.length}個` },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center', padding: '14px 8px' }}>
              <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, color: 'var(--accent)' }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div className="card">
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, marginBottom: 14 }}>学習時間（分）</div>
          {totalMins === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '20px 0' }}>データがありません</div>
          ) : (
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={barData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="mins" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie */}
        {pieData.length > 0 && (
          <div className="card">
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, marginBottom: 14 }}>アクティビティ別</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <ResponsiveContainer width={110} height={110}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={32} outerRadius={52} dataKey="value" strokeWidth={0}>
                    {pieData.map(entry => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pieData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, flex: 1 }}>{d.emoji} {d.name}</span>
                    <span style={{ fontSize: 12, fontFamily: 'Syne', fontWeight: 700, color: d.color }}>{d.value}分</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Export/Import */}
        <div className="card">
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>データ管理</div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.6 }}>
            JSONファイルでバックアップ。ブラウザ・端末を変えても移行できます。
          </p>
          {importMsg && (
            <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 12 }}>
              {importMsg}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-primary" onClick={exportData} style={{ flex: 1, fontSize: 13 }}>⬇️ エクスポート</button>
            <button className="btn-ghost" onClick={() => fileRef.current?.click()} style={{ flex: 1, fontSize: 13 }}>⬆️ インポート</button>
          </div>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
        </div>
      </div>
    </div>
  );
}
