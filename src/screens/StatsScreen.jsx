import { useState, useEffect, useRef } from 'react';
import { getLogs, getPhrases, exportData, importData, ACTIVITY_TYPES } from '../store.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ACT_COLORS = {
  podcast: '#ff6584',
  video: '#6c63ff',
  conversation: '#43e97b',
  reading: '#fbbf24',
  other: '#94a3b8',
};

export default function StatsScreen() {
  const [logs, setLogs] = useState([]);
  const [phrases, setPhrases] = useState([]);
  const [range, setRange] = useState('week');
  const [importMsg, setImportMsg] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    setLogs(getLogs());
    setPhrases(getPhrases());
  }, []);

  // Range filter
  const now = new Date();
  const rangeStart = range === 'week'
    ? new Date(now - 6 * 86400000).toISOString().slice(0, 10)
    : new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const rangeLogs = logs.filter(l => l.date >= rangeStart);

  // Bar chart: daily minutes
  const barData = (() => {
    const days = range === 'week' ? 7 : new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => {
      const d = range === 'week'
        ? new Date(now - (6 - i) * 86400000)
        : new Date(now.getFullYear(), now.getMonth(), i + 1);
      const dateStr = d.toISOString().slice(0, 10);
      const mins = logs.filter(l => l.date === dateStr).reduce((s, l) => s + (l.duration || 0), 0);
      return {
        label: range === 'week' ? d.toLocaleDateString('ja-JP', { weekday: 'short' }) : `${i + 1}`,
        mins,
      };
    });
  })();

  // Pie chart: activity breakdown
  const pieData = ACTIVITY_TYPES.map(a => ({
    name: a.label,
    value: rangeLogs.filter(l => l.activity === a.value).reduce((s, l) => s + (l.duration || 0), 0),
    color: ACT_COLORS[a.value],
    emoji: a.emoji,
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
        setLogs(getLogs());
        setPhrases(getPhrases());
        setTimeout(() => setImportMsg(''), 3000);
      } catch {
        setImportMsg('❌ ファイルの形式が正しくありません');
        setTimeout(() => setImportMsg(''), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
          {payload[0].value}分
        </div>
      );
    }
    return null;
  };

  return (
    <div className="scroll-area" style={{ paddingBottom: '100px' }}>
      <div style={{ padding: '52px 20px 0' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>統計 📊</h1>
      </div>

      <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Range selector */}
        <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: 10, padding: 4 }}>
          {[['week', '今週'], ['month', '今月']].map(([v, l]) => (
            <button key={v} onClick={() => setRange(v)} style={{
              flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13,
              fontFamily: 'Syne', fontWeight: 600,
              background: range === v ? 'var(--accent)' : 'transparent',
              color: range === v ? 'white' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}>
              {l}
            </button>
          ))}
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { label: '総時間', value: totalMins >= 60 ? `${Math.floor(totalMins/60)}h${totalMins%60}m` : `${totalMins}m` },
            { label: '学習日数', value: `${totalDays}日` },
            { label: 'フレーズ', value: `${phrases.length}個` },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center', padding: '12px 8px' }}>
              <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div className="card fade-up">
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
            学習時間（分）
          </div>
          {totalMins === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '20px 0' }}>データがありません</div>
          ) : (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={barData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="mins" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        {pieData.length > 0 && (
          <div className="card fade-up fade-up-1">
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, marginBottom: 14 }}>アクティビティ別</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={0}>
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

        {/* Export / Import */}
        <div className="card fade-up fade-up-2">
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>データ管理</div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
            JSONファイルにエクスポートしてバックアップ。別のブラウザや端末への移行にも使えます。
          </p>
          {importMsg && (
            <div style={{ background: 'rgba(67,233,123,0.1)', border: '1px solid rgba(67,233,123,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 12 }}>
              {importMsg}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-primary" onClick={exportData} style={{ flex: 1, fontSize: 13 }}>
              ⬇️ エクスポート
            </button>
            <button className="btn-ghost" onClick={() => fileRef.current?.click()} style={{ flex: 1, fontSize: 13 }}>
              ⬆️ インポート
            </button>
          </div>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
        </div>
      </div>
    </div>
  );
}
