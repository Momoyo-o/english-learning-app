import { useState, useEffect } from 'react';
import { getLogs, getPhrases, getStreak, ACTIVITY_TYPES } from '../store.js';

export default function HomeScreen({ onAddLog }) {
  const [logs, setLogs] = useState([]);
  const [phrases, setPhrases] = useState([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setLogs(getLogs());
    setPhrases(getPhrases());
    setStreak(getStreak());
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todayLogs = logs.filter(l => l.date === today);
  const todayMinutes = todayLogs.reduce((s, l) => s + (l.duration || 0), 0);
  const recentPhrases = phrases.slice(0, 3);

  const weekAgo = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
  const weekLogs = logs.filter(l => l.date >= weekAgo);
  const weekMinutes = weekLogs.reduce((s, l) => s + (l.duration || 0), 0);

  const actType = (v) => ACTIVITY_TYPES.find(a => a.value === v) || ACTIVITY_TYPES[4];

  return (
    <div className="scroll-area" style={{ paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ padding: '52px 20px 0' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'Syne', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 4, lineHeight: 1.2 }}>
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'} 👋
        </h1>
      </div>

      <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Streak + Today stats */}
        <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(255,101,132,0.15), rgba(255,101,132,0.05))' }}>
            <div style={{ fontSize: 36 }} className="streak-glow">🔥</div>
            <div style={{ fontSize: 28, fontFamily: 'Syne', fontWeight: 800, color: 'var(--podcast)' }}>{streak}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>連続学習日数</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36 }}>⏱</div>
            <div style={{ fontSize: 28, fontFamily: 'Syne', fontWeight: 800 }}>
              {todayMinutes < 60 ? `${todayMinutes}` : `${Math.floor(todayMinutes/60)}h${todayMinutes%60}`}
              <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{todayMinutes < 60 ? 'min' : ''}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>今日の学習時間</div>
          </div>
        </div>

        {/* Weekly progress */}
        <div className="card fade-up fade-up-1">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14 }}>今週の進捗</span>
            <span style={{ color: 'var(--accent)', fontFamily: 'Syne', fontWeight: 700, fontSize: 14 }}>{weekMinutes}分</span>
          </div>
          <WeekBar logs={logs} />
        </div>

        {/* Today's logs */}
        <div className="fade-up fade-up-2">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14 }}>今日の記録</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{todayLogs.length}件</span>
          </div>
          {todayLogs.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📖</div>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>まだ記録がありません</p>
              <button className="btn-primary" style={{ marginTop: 14, width: 'auto', padding: '10px 24px' }} onClick={onAddLog}>
                記録を追加
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {todayLogs.map(log => {
                const act = actType(log.activity);
                return (
                  <div key={log.id} className="card-sm" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 22, flexShrink: 0 }}>{act.emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.title || act.label}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{log.duration}分</div>
                    </div>
                    <div className={`act-${log.activity}`} style={{ fontSize: 11, fontWeight: 600, fontFamily: 'Syne' }}>
                      {act.label}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent phrases */}
        {recentPhrases.length > 0 && (
          <div className="fade-up fade-up-3">
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14 }}>最近のフレーズ 💬</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentPhrases.map(p => (
                <div key={p.id} className="card-sm">
                  <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--accent)' }}>{p.phrase}</div>
                  {p.meaning && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{p.meaning}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function WeekBar({ logs }) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = d.toISOString().slice(0, 10);
    const mins = logs.filter(l => l.date === dateStr).reduce((s, l) => s + (l.duration || 0), 0);
    days.push({ date: dateStr, mins, label: d.toLocaleDateString('ja-JP', { weekday: 'short' }) });
  }
  const max = Math.max(...days.map(d => d.mins), 30);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 52 }}>
      {days.map(d => (
        <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
          <div style={{
            width: '100%',
            borderRadius: 4,
            background: d.date === today ? 'var(--accent)' : d.mins > 0 ? 'rgba(108,99,255,0.4)' : 'var(--surface2)',
            height: `${Math.max(d.mins / max * 36, d.mins > 0 ? 6 : 4)}px`,
            transition: 'height 0.4s ease',
          }} />
          <span style={{ fontSize: 9, color: d.date === today ? 'var(--text)' : 'var(--text-muted)' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}
