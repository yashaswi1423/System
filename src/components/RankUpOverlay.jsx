import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemStore } from '../store/useSystemStore';

export default function RankUpOverlay() {
  const { rankUpPending, clearRankUp } = useSystemStore();

  useEffect(() => {
    if (!rankUpPending) return;
    const t = setTimeout(clearRankUp, 5000);
    return () => clearTimeout(t);
  }, [rankUpPending]);

  return (
    <AnimatePresence>
      {rankUpPending && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={clearRankUp}
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            cursor: 'pointer',
          }}
        >
          {/* Radial burst */}
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 6, opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: 200, height: 200, borderRadius: '50%',
              background: `radial-gradient(circle, ${rankUpPending.color}44, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />

          {/* Main card */}
          <motion.div
            initial={{ scale: 0.5, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: -20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
            style={{
              padding: '48px 60px',
              background: `linear-gradient(135deg, rgba(2,11,24,0.98), ${rankUpPending.bgColor})`,
              border: `2px solid ${rankUpPending.color}`,
              boxShadow: `0 0 60px ${rankUpPending.glowColor}, 0 0 120px ${rankUpPending.glowColor}`,
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              maxWidth: 480,
              width: '90%',
            }}
          >
            {/* Corner accents */}
            {['tl','tr','bl','br'].map((pos) => (
              <div key={pos} style={{
                position: 'absolute',
                top: pos.startsWith('t') ? 0 : 'auto',
                bottom: pos.startsWith('b') ? 0 : 'auto',
                left: pos.endsWith('l') ? 0 : 'auto',
                right: pos.endsWith('r') ? 0 : 'auto',
                width: 20, height: 20,
                borderTop: pos.startsWith('t') ? `3px solid ${rankUpPending.color}` : 'none',
                borderBottom: pos.startsWith('b') ? `3px solid ${rankUpPending.color}` : 'none',
                borderLeft: pos.endsWith('l') ? `3px solid ${rankUpPending.color}` : 'none',
                borderRight: pos.endsWith('r') ? `3px solid ${rankUpPending.color}` : 'none',
              }} />
            ))}

            {/* Scan line */}
            <motion.div
              initial={{ top: '-10%' }}
              animate={{ top: '110%' }}
              transition={{ duration: 1.8, ease: 'linear', repeat: Infinity, repeatDelay: 1 }}
              style={{
                position: 'absolute', left: 0, right: 0, height: 2,
                background: `linear-gradient(transparent, ${rankUpPending.color}88, transparent)`,
                pointerEvents: 'none',
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ fontSize: 11, color: rankUpPending.color, fontFamily: 'Orbitron',
                letterSpacing: 5, marginBottom: 20, opacity: 0.7 }}
            >
              SYSTEM ANNOUNCEMENT
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.4, stiffness: 200 }}
              style={{
                fontSize: 64, marginBottom: 16,
                filter: `drop-shadow(0 0 20px ${rankUpPending.color})`,
              }}
            >
              {rankUpPending.icon}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div style={{ fontSize: 13, color: rankUpPending.color, fontFamily: 'Orbitron',
                letterSpacing: 4, marginBottom: 8 }}>
                RANK ADVANCEMENT
              </div>
              <div style={{
                fontSize: 36, fontWeight: 900, fontFamily: 'Orbitron',
                color: rankUpPending.color,
                textShadow: `0 0 20px ${rankUpPending.glowColor}, 0 0 40px ${rankUpPending.glowColor}`,
                letterSpacing: 3, marginBottom: 12,
              }}>
                {rankUpPending.label}
              </div>
              <div style={{ fontSize: 16, color: '#e0f4ff', fontStyle: 'italic',
                marginBottom: 8, letterSpacing: 1 }}>
                "{rankUpPending.title}"
              </div>
              <div style={{ fontSize: 13, color: '#7ab8d4', lineHeight: 1.6 }}>
                {rankUpPending.description}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              style={{ marginTop: 28, fontSize: 11, color: '#7ab8d4', letterSpacing: 2 }}
            >
              TAP TO CONTINUE
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
