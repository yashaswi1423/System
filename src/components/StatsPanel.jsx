import { motion } from 'framer-motion';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { useSystemStore } from '../store/useSystemStore';
import ActivityHeatmap from './ActivityHeatmap';

const STAT_CONFIG = [
  { key: 'strength', label: 'STR', color: '#ff4466', icon: '⚔' },
  { key: 'discipline', label: 'DIS', color: '#00f5ff', icon: '🛡' },
  { key: 'consistency', label: 'CON', color: '#00ff88', icon: '🔄' },
  { key: 'intelligence', label: 'INT', color: '#aa88ff', icon: '🧠' },
  { key: 'innerPeace', label: 'ZEN', color: '#ffaa00', icon: '☯' },
];

export default function StatsPanel() {
  const { stats: rawStats, habits: rawHabits } = useSystemStore();
  const stats = rawStats || { strength: 10, discipline: 10, consistency: 10, intelligence: 10, innerPeace: 10 };
  const habits = rawHabits || [];

  const radarData = STAT_CONFIG.map(({ key, label }) => ({
    stat: label,
    value: stats[key],
    fullMark: 100,
  }));

  return (
    <motion.div
      className="glass-bright"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        padding: 24, display: 'flex',
        flexDirection: 'column', gap: 20, position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', top: 0, right: 0, width: 16, height: 16,
        borderTop: '2px solid #00f5ff', borderRight: '2px solid #00f5ff' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: 16, height: 16,
        borderBottom: '2px solid #00f5ff', borderLeft: '2px solid #00f5ff' }} />

      <span className="orbitron neon-text" style={{ fontSize: 11, letterSpacing: 3 }}>
        STAT OVERVIEW
      </span>

      {/* Radar Chart */}
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(0,245,255,0.15)" />
            <PolarAngleAxis
              dataKey="stat"
              tick={{ fill: '#7ab8d4', fontSize: 11, fontFamily: 'Orbitron' }}
            />
            <Radar
              name="Stats"
              dataKey="value"
              stroke="#00f5ff"
              fill="rgba(0,245,255,0.15)"
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Stat Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {STAT_CONFIG.map(({ key, label, color, icon }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13 }}>{icon}</span>
                <span className="orbitron" style={{ fontSize: 11, color, letterSpacing: 1 }}>
                  {label}
                </span>
              </div>
              <span className="orbitron" style={{ fontSize: 12, color }}>
                {stats[key]}
              </span>
            </div>
            <div className="stat-bar">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats[key]}%` }}
                transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  background: `linear-gradient(90deg, ${color}88, ${color})`,
                  borderRadius: 2,
                  boxShadow: `0 0 6px ${color}`,
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Habits / Streaks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 11, color: '#7ab8d4', letterSpacing: 2, textTransform: 'uppercase' }}>
          Active Streaks
        </div>
        {habits.map((h) => (
          <div key={h.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 10px',
            background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.1)',
          }}>
            <span style={{ fontSize: 13, color: '#e0f4ff' }}>{h.name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16 }}>🔥</span>
              <span className="orbitron" style={{ fontSize: 13, color: '#ffd700' }}>
                {h.streak}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Total stats summary */}
      <div style={{
        padding: '12px 14px',
        background: 'rgba(0,245,255,0.03)',
        border: '1px solid rgba(0,245,255,0.1)',
      }}>
        <div style={{ fontSize: 11, color: '#7ab8d4', letterSpacing: 2, marginBottom: 10 }}>
          POWER LEVEL
        </div>
        <div className="orbitron" style={{
          fontSize: 28, fontWeight: 900, textAlign: 'center',
          background: 'linear-gradient(90deg, #0066ff, #00f5ff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          textShadow: 'none',
          filter: 'drop-shadow(0 0 8px rgba(0,245,255,0.4))',
        }}>
          {Object.values(stats).reduce((a, b) => a + b, 0)}
        </div>
        <div style={{ fontSize: 11, color: '#7ab8d4', textAlign: 'center', marginTop: 4 }}>
          Total Stat Points
        </div>
      </div>
    </motion.div>
  );
}
