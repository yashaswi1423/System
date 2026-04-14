import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemStore } from '../store/useSystemStore';

const TYPE_CONFIG = {
  xp:          { color: '#00f5ff', glow: 'rgba(0,245,255,0.25)', icon: '◆', bg: 'rgba(0,245,255,0.07)' },
  levelup:     { color: '#ffd700', glow: 'rgba(255,215,0,0.35)',  icon: '⚡', bg: 'rgba(255,215,0,0.1)'  },
  rankup:      { color: '#ffffff', glow: 'rgba(255,255,255,0.5)', icon: '👑', bg: 'rgba(255,255,255,0.08)' },
  achievement: { color: '#ff8800', glow: 'rgba(255,136,0,0.35)',  icon: '🏆', bg: 'rgba(255,136,0,0.08)' },
};

export default function NotificationToast() {
  const { notifications, dismissNotification } = useSystemStore();
  const bodyRef = useRef(document.body);

  useEffect(() => {
    if (notifications.length === 0) return;
    const latest = notifications[0];
    const delay = latest?.type === 'rankup' ? 6000 : latest?.type === 'achievement' ? 5000 : 3500;
    const timer = setTimeout(() => dismissNotification(latest?.id), delay);

    // Screen shake on level up
    if (latest?.type === 'levelup' || latest?.type === 'rankup') {
      bodyRef.current.classList.add('screen-shake');
      setTimeout(() => bodyRef.current.classList.remove('screen-shake'), 500);
    }

    return () => clearTimeout(timer);
  }, [notifications]);

  return (
    <div style={{
      position: 'fixed', top: 60, right: 12,
      zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8,
      maxWidth: 'min(300px, calc(100vw - 24px))',
    }}>
      <AnimatePresence>
        {notifications.map((n) => {
          const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.xp;
          const isRankUp = n.type === 'rankup';
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 60, scale: 0.85 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              onClick={() => dismissNotification(n.id)}
              style={{
                padding: isRankUp ? '14px 18px' : '10px 16px',
                background: cfg.bg,
                border: `1px solid ${cfg.color}88`,
                backdropFilter: 'blur(16px)',
                cursor: 'pointer',
                boxShadow: `0 0 ${isRankUp ? 30 : 15}px ${cfg.glow}`,
                position: 'relative', overflow: 'hidden',
              }}
            >
              {isRankUp && (
                <motion.div
                  initial={{ top: '-100%' }}
                  animate={{ top: '200%' }}
                  transition={{ duration: 1.2, ease: 'linear' }}
                  style={{
                    position: 'absolute', left: 0, right: 0, height: 2,
                    background: `linear-gradient(transparent, ${cfg.color}, transparent)`,
                    pointerEvents: 'none',
                  }}
                />
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: isRankUp ? 20 : 14, flexShrink: 0 }}>{cfg.icon}</span>
                <div>
                  {isRankUp && (
                    <div style={{ fontSize: 9, color: cfg.color, fontFamily: 'Orbitron',
                      letterSpacing: 3, marginBottom: 3, opacity: 0.8 }}>
                      RANK ADVANCEMENT
                    </div>
                  )}
                  <div style={{
                    fontFamily: 'Orbitron, monospace',
                    fontSize: isRankUp ? 13 : 11,
                    color: cfg.color, letterSpacing: 0.5,
                    textShadow: `0 0 8px ${cfg.glow}`, lineHeight: 1.4,
                  }}>
                    {n.text}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
