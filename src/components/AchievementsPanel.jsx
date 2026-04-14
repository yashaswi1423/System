import { motion } from 'framer-motion';
import { useSystemStore } from '../store/useSystemStore';
import { ACHIEVEMENTS } from '../lib/rankSystem';

export default function AchievementsPanel() {
  const { unlockedAchievements } = useSystemStore();
  const unlocked = unlockedAchievements || [];

  return (
    <div style={{
      padding: '20px 24px',
      background: 'rgba(4,18,37,0.6)',
      border: '1px solid rgba(0,245,255,0.12)',
      backdropFilter: 'blur(16px)',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 12, height: 12,
        borderTop: '2px solid #ff8800', borderLeft: '2px solid #ff8800' }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12,
        borderBottom: '2px solid #ff8800', borderRight: '2px solid #ff8800' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span className="orbitron" style={{ fontSize: 11, letterSpacing: 3, color: '#ff8800',
          textShadow: '0 0 8px rgba(255,136,0,0.5)' }}>
          ACHIEVEMENTS
        </span>
        <span className="orbitron" style={{ fontSize: 11, color: '#7ab8d4' }}>
          {unlocked.length} / {ACHIEVEMENTS.length}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
        {ACHIEVEMENTS.map((a, i) => {
          const isUnlocked = unlocked.includes(a.id);
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              style={{
                padding: '12px 14px',
                background: isUnlocked ? 'rgba(255,136,0,0.08)' : 'rgba(0,0,0,0.3)',
                border: `1px solid ${isUnlocked ? 'rgba(255,136,0,0.35)' : 'rgba(255,255,255,0.06)'}`,
                display: 'flex', alignItems: 'center', gap: 10,
                filter: isUnlocked ? 'none' : 'grayscale(1)',
                opacity: isUnlocked ? 1 : 0.45,
                transition: 'all 0.3s',
                boxShadow: isUnlocked ? '0 0 12px rgba(255,136,0,0.15)' : 'none',
              }}
            >
              <span style={{ fontSize: 22, flexShrink: 0 }}>{a.icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700,
                  color: isUnlocked ? '#ff8800' : '#7ab8d4' }}>
                  {a.label}
                </div>
                <div style={{ fontSize: 11, color: '#7ab8d4', marginTop: 2, lineHeight: 1.3 }}>
                  {a.desc}
                </div>
              </div>
              {isUnlocked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{ marginLeft: 'auto', flexShrink: 0, fontSize: 14, color: '#ff8800' }}
                >
                  ✓
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
