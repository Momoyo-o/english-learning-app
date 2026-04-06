import { useState } from 'react';
import HomeScreen from './screens/HomeScreen.jsx';
import LogsScreen from './screens/LogsScreen.jsx';
import PhrasesScreen from './screens/PhrasesScreen.jsx';
import StatsScreen from './screens/StatsScreen.jsx';

const tabs = [
  { id: 'home', label: 'ホーム', icon: HomeIcon },
  { id: 'logs', label: 'ログ', icon: LogIcon },
  { id: 'phrases', label: 'フレーズ', icon: PhraseIcon },
  { id: 'stats', label: '統計', icon: StatsIcon },
];

export default function App() {
  const [tab, setTab] = useState('home');
  const [showAddLog, setShowAddLog] = useState(false);

  const openAddLog = () => {
    setTab('logs');
    setShowAddLog(true);
  };

  return (
    <div className="app-container">
      {tab === 'home' && <HomeScreen onAddLog={openAddLog} />}
      {tab === 'logs' && <LogsScreen showAddForm={showAddLog} onFormClose={() => setShowAddLog(false)} />}
      {tab === 'phrases' && <PhrasesScreen />}
      {tab === 'stats' && <StatsScreen />}

      <nav className="bottom-nav">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 8px' }}>
          {/* Home */}
          <NavBtn id="home" active={tab === 'home'} label="ホーム" onClick={() => { setTab('home'); setShowAddLog(false); }}>
            <HomeIcon color={tab === 'home' ? 'var(--accent)' : 'var(--text-muted)'} size={22} />
          </NavBtn>

          {/* Logs */}
          <NavBtn id="logs" active={tab === 'logs' && !showAddLog} label="ログ" onClick={() => { setTab('logs'); setShowAddLog(false); }}>
            <LogIcon color={tab === 'logs' && !showAddLog ? 'var(--accent)' : 'var(--text-muted)'} size={22} />
          </NavBtn>

          {/* FAB: Record */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <button className="fab" onClick={openAddLog} aria-label="記録を追加">
              <span style={{ fontSize: 26, lineHeight: 1 }}>+</span>
            </button>
            <span style={{ fontSize: 10, fontFamily: 'Syne', fontWeight: 600, color: 'var(--text-muted)' }}>記録</span>
          </div>

          {/* Phrases */}
          <NavBtn id="phrases" active={tab === 'phrases'} label="フレーズ" onClick={() => { setTab('phrases'); setShowAddLog(false); }}>
            <PhraseIcon color={tab === 'phrases' ? 'var(--accent)' : 'var(--text-muted)'} size={22} />
          </NavBtn>

          {/* Stats */}
          <NavBtn id="stats" active={tab === 'stats'} label="統計" onClick={() => { setTab('stats'); setShowAddLog(false); }}>
            <StatsIcon color={tab === 'stats' ? 'var(--accent)' : 'var(--text-muted)'} size={22} />
          </NavBtn>
        </div>
      </nav>
    </div>
  );
}

function NavBtn({ active, label, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: 'none', border: 'none',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
      cursor: 'pointer', padding: '2px 12px', minWidth: 52,
    }}>
      <div style={{
        width: 36, height: 28, borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? 'var(--accent-light)' : 'transparent',
        transition: 'background 0.2s',
      }}>
        {children}
      </div>
      <span style={{ fontSize: 10, fontFamily: 'Syne', fontWeight: 600, color: active ? 'var(--accent)' : 'var(--text-muted)', transition: 'color 0.15s' }}>
        {label}
      </span>
    </button>
  );
}

function HomeIcon({ color, size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/><path d="M9 21V12h6v9" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/></svg>;
}
function LogIcon({ color, size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="2" stroke={color} strokeWidth="1.8"/><path d="M8 8h8M8 12h8M8 16h5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>;
}
function PhraseIcon({ color, size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/></svg>;
}
function StatsIcon({ color, size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M18 20V10M12 20V4M6 20v-6" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>;
}
