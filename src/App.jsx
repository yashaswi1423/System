import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemStore } from './store/useSystemStore';
import { getRank } from './lib/rankSystem';
import ParticleBackground from './components/ParticleBackground';
import ProfilePanel from './components/ProfilePanel';
import CenterPanel from './components/CenterPanel';
import StatsPanel from './components/StatsPanel';
import NotificationToast from './components/NotificationToast';
import DailyQuestBoard from './components/DailyQuestBoard';
import SystemMessage from './components/SystemMessage';
import ActivityHeatmap from './components/ActivityHeatmap';
import RankUpOverlay from './components/RankUpOverlay';
import AchievementsPanel from './components/AchievementsPanel';
import HabitGridTracker from './components/HabitGridTracker';
import DailyQuestPopup from './components/DailyQuestPopup';
import LoadingScreen from './components/LoadingScreen';
import InsightsDashboard from './components/InsightsDashboard';
import FloatingXP from './components/FloatingXP';
import './App.css';

const DEADLINE = '2026-12-31';
const TOTAL_DAYS = 620;

function daysLeft() {
  return Math.ceil((new Date(DEADLINE) - new Date()) / 86400000);
}

// ── Transformation Banner ──────────────────────────────────────────────────
function TransformationBanner({ compact = false }) {
  const days = daysLeft();
  const color = days <= 30 ? '#ff4466' : days <= 60 ? '#ffaa00' : '#00f5ff';
  const glow  = days <= 30 ? 'rgba(255,68,102,0.35)' : days <= 60 ? 'rgba(255,170,0,0.3)' : 'rgba(0,245,255,0.25)';
  const pct   = Math.max(0, Math.min(100, Math.round(((TOTAL_DAYS - days) / TOTAL_DAYS) * 100)));

  if (compact) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '4px 10px',
        border: `1px solid ${color}55`,
        background: `${color}0d`,
        borderRadius: 2,
      }}>
        <span style={{ fontSize: 11 }}>🎯</span>
        <span className="orbitron" style={{ fontSize: 12, color, textShadow: `0 0 6px ${color}` }}>
          {days}d
        </span>
        <span style={{ fontSize: 9, color: '#7ab8d4', letterSpacing: 1 }}>DEC 31</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: '16px',
        background: `linear-gradient(135deg, rgba(2,11,24,0.97), ${color}0c)`,
        border: `1px solid ${color}44`,
        boxShadow: `0 0 24px ${glow}`,
        display: 'flex', alignItems: 'center', gap: 14,
        position: 'relative', overflow: 'hidden',
      }}
    >
      <motion.div
        animate={{ x: ['-100%', '250%'] }}
        transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 5, ease: 'linear' }}
        style={{
          position: 'absolute', top: 0, bottom: 0, width: '25%',
          background: `linear-gradient(90deg, transparent, ${color}18, transparent)`,
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'absolute', top: 0, left: 0, width: 10, height: 10,
        borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10,
        borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}` }} />

      <div style={{ fontSize: 26, flexShrink: 0 }}>🎯</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 9, color, fontFamily: 'Orbitron', letterSpacing: 3, marginBottom: 3 }}>
          TRANSFORMATION DEADLINE
        </div>
        <div style={{ fontSize: 13, color: '#e0f4ff', fontWeight: 600, marginBottom: 7 }}>
          Lean Aesthetic Body — Dec 31, 2026
        </div>
        <div className="xp-bar">
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ height: '100%', borderRadius: 3,
              background: `linear-gradient(90deg, ${color}88, ${color})`,
              boxShadow: `0 0 8px ${color}` }}
          />
        </div>
        <div style={{ fontSize: 10, color: '#7ab8d4', marginTop: 4 }}>{pct}% of journey complete</div>
      </div>
      <div style={{ textAlign: 'center', flexShrink: 0 }}>
        <div className="orbitron" style={{ fontSize: 34, fontWeight: 900, lineHeight: 1,
          color, textShadow: `0 0 16px ${glow}` }}>{days}</div>
        <div style={{ fontSize: 8, color: '#7ab8d4', letterSpacing: 2, marginTop: 2 }}>DAYS LEFT</div>
      </div>
    </motion.div>
  );
}

// ── Mobile Top Bar ─────────────────────────────────────────────────────────
function MobileTopBar({ activePage }) {
  const { profile } = useSystemStore();
  const rank = getRank(profile?.level || 1);

  const PAGE_TITLES = {
    home:    'SYSTEM',
    profile: 'PROFILE',
    system:  'MODULES',
    stats:   'STATS',
    goals:   'QUESTS',
  };

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(2,11,24,0.96)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(0,245,255,0.12)',
      padding: '0 16px',
      paddingTop: 'env(safe-area-inset-top)',
    }}>
      <div style={{
        height: 52, display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Left: logo + page title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ width: 6, height: 6, borderRadius: '50%',
              background: '#00f5ff', boxShadow: '0 0 8px #00f5ff' }}
          />
          <div>
            <div className="orbitron" style={{
              fontSize: 14, fontWeight: 900, letterSpacing: 3,
              background: 'linear-gradient(90deg, #0066ff, #00f5ff)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              lineHeight: 1,
            }}>
              SOLO LEVELING
            </div>
            <div style={{ fontSize: 9, color: '#7ab8d4', letterSpacing: 2, marginTop: 1 }}>
              {PAGE_TITLES[activePage] || 'SYSTEM'}
            </div>
          </div>
        </div>

        {/* Right: rank + countdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            padding: '3px 8px',
            border: `1px solid ${rank.color}55`,
            background: rank.bgColor,
          }}>
            <span className="orbitron" style={{ fontSize: 10, color: rank.color }}>
              {rank.icon} LVL {profile?.level || 1}
            </span>
          </div>
          <TransformationBanner compact />
        </div>
      </div>
    </div>
  );
}

// ── Mobile Bottom Nav ──────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'home',    label: 'HOME',    icon: '⚡', activeColor: '#00f5ff' },
  { id: 'profile', label: 'HUNTER',  icon: '👤', activeColor: '#ffd700' },
  { id: 'system',  label: 'SYSTEM',  icon: '🎮', activeColor: '#ff4466' },
  { id: 'stats',   label: 'STATS',   icon: '📊', activeColor: '#aa88ff' },
  { id: 'goals',   label: 'QUESTS',  icon: '🎯', activeColor: '#00ff88' },
];

function MobileBottomNav({ activePage, setActivePage }) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
      background: 'rgba(2,8,20,0.98)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(0,245,255,0.12)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <div style={{ display: 'flex', height: 60 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.id;
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.88 }}
              onClick={() => setActivePage(item.id)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 3,
                background: 'transparent', border: 'none', cursor: 'pointer',
                position: 'relative', padding: '6px 2px',
              }}
            >
              {/* Active indicator top line */}
              {isActive && (
                <motion.div
                  layoutId="nav-line"
                  style={{
                    position: 'absolute', top: 0, left: '15%', right: '15%',
                    height: 2, background: item.activeColor,
                    boxShadow: `0 0 8px ${item.activeColor}`,
                    borderRadius: '0 0 2px 2px',
                  }}
                />
              )}

              {/* Icon with glow when active */}
              <motion.span
                animate={isActive ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                style={{
                  fontSize: 18, lineHeight: 1,
                  filter: isActive ? `drop-shadow(0 0 6px ${item.activeColor})` : 'none',
                  opacity: isActive ? 1 : 0.45,
                }}
              >
                {item.icon}
              </motion.span>

              <span style={{
                fontSize: 8, fontFamily: 'Orbitron', letterSpacing: 0.5,
                color: isActive ? item.activeColor : '#7ab8d4',
                opacity: isActive ? 1 : 0.6,
                textShadow: isActive ? `0 0 6px ${item.activeColor}` : 'none',
              }}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── Mobile Pages ───────────────────────────────────────────────────────────
function MobileHome() {
  const { profile, dailyQuests, tasks: rawTasks } = useSystemStore();
  const rank = getRank(profile?.level || 1);
  const tasks = rawTasks || {};
  const morning = tasks.morning || [];
  const doneMorning = morning.filter((t) => t.completed).length;
  const questsDone = (dailyQuests || []).filter((q) => q.completed).length;
  const questsTotal = (dailyQuests || []).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <TransformationBanner />

      {/* Quick stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {[
          { label: 'LEVEL',   value: profile?.level || 1,          color: rank.color,  icon: rank.icon },
          { label: 'MORNING', value: `${doneMorning}/${morning.length}`, color: '#ffaa00', icon: '🌅' },
          { label: 'QUESTS',  value: `${questsDone}/${questsTotal}`, color: '#ffd700',  icon: '📜' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} style={{
            padding: '12px 8px', textAlign: 'center',
            background: `${color}08`,
            border: `1px solid ${color}25`,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
            <div className="orbitron" style={{ fontSize: 15, color, fontWeight: 700,
              textShadow: `0 0 8px ${color}` }}>{value}</div>
            <div style={{ fontSize: 8, color: '#7ab8d4', letterSpacing: 1, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <SystemMessage />
      <CenterPanel />
    </div>
  );
}

function MobileStats() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <StatsPanel />
      <InsightsDashboard />
      <div style={{ padding: '16px', background: 'rgba(4,18,37,0.7)',
        border: '1px solid rgba(0,245,255,0.12)', backdropFilter: 'blur(16px)' }}>
        <ActivityHeatmap />
      </div>
    </div>
  );
}

function MobileGoals() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <HabitGridTracker />
      <DailyQuestBoard />
      <AchievementsPanel />
    </div>
  );
}

function MobilePage({ activePage }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activePage}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        {activePage === 'home'    && <MobileHome />}
        {activePage === 'profile' && <ProfilePanel />}
        {activePage === 'system'  && <CenterPanel />}
        {activePage === 'stats'   && <MobileStats />}
        {activePage === 'goals'   && <MobileGoals />}
      </motion.div>
    </AnimatePresence>
  );
}

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [mobilePage, setMobilePage] = useState('home');
  const [loaded, setLoaded] = useState(false);

  if (!loaded) return <LoadingScreen onDone={() => setLoaded(true)} />;

  return (
    <div style={{ minHeight: '100vh', position: 'relative', background: '#020b18' }}>
      <ParticleBackground />

      {/* Ambient glows */}
      <div style={{ position: 'fixed', top: '-15%', left: '-10%', width: 400, height: 400,
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(circle, rgba(0,102,255,0.07), transparent 70%)' }} />
      <div style={{ position: 'fixed', bottom: '-15%', right: '-10%', width: 500, height: 500,
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(circle, rgba(0,245,255,0.05), transparent 70%)' }} />

      {/* ── DESKTOP top bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="desktop-layout"
        style={{
          position: 'sticky', top: 0, zIndex: 100,
          padding: '10px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid rgba(0,245,255,0.1)',
          background: 'rgba(2,11,24,0.92)', backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
            style={{ width: 7, height: 7, borderRadius: '50%', background: '#00f5ff', boxShadow: '0 0 8px #00f5ff' }} />
          <span className="orbitron" style={{ fontSize: 14, fontWeight: 900, letterSpacing: 4,
            background: 'linear-gradient(90deg, #0066ff, #00f5ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SOLO LEVELING SYSTEM
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#7ab8d4' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          <TransformationBanner compact />
          <span className="tag tag-cyan" style={{ fontSize: 9 }}>v1.0</span>
        </div>
      </motion.div>

      {/* ── DESKTOP layout ── */}
      <div className="desktop-layout" style={{
        position: 'relative', zIndex: 10,
        maxWidth: 1400, margin: '0 auto',
        padding: '16px 20px',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <TransformationBanner />
        <SystemMessage />
        <div className="desktop-3col" style={{
          display: 'grid', gridTemplateColumns: '280px 1fr 280px',
          gap: 16, alignItems: 'start',
        }}>
          <ProfilePanel />
          <CenterPanel />
          <StatsPanel />
        </div>
        <DailyQuestBoard />
        <InsightsDashboard />
        <HabitGridTracker />
        <div style={{ padding: '20px 24px', background: 'rgba(4,18,37,0.6)',
          border: '1px solid rgba(0,245,255,0.12)', backdropFilter: 'blur(16px)' }}>
          <ActivityHeatmap />
        </div>
        <AchievementsPanel />
      </div>

      {/* ── MOBILE layout ── */}
      <div className="mobile-layout" style={{ position: 'relative', zIndex: 10 }}>
        <MobileTopBar activePage={mobilePage} />
        <div style={{
          padding: '12px 12px',
          paddingBottom: 'calc(60px + env(safe-area-inset-bottom) + 12px)',
        }}>
          <MobilePage activePage={mobilePage} />
        </div>
        <MobileBottomNav activePage={mobilePage} setActivePage={setMobilePage} />
      </div>

      <NotificationToast />
      <RankUpOverlay />
      <DailyQuestPopup />
      <FloatingXP />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        .desktop-layout { display: flex; flex-direction: column; }
        .mobile-layout  { display: none; }
        @media (max-width: 768px) {
          .desktop-layout { display: none !important; }
          .mobile-layout  { display: block !important; }
        }
      `}</style>
    </div>
  );
}
