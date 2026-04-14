import { AnimatePresence, motion } from 'framer-motion';
import { useSystemStore } from '../store/useSystemStore';

export default function FloatingXP() {
  const { floatingXP } = useSystemStore();

  return (
    <div style={{
      position: 'fixed', bottom: 80, right: 16,
      zIndex: 9998, pointerEvents: 'none',
      display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end',
    }}>
      <AnimatePresence>
        {(floatingXP || []).map((f) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 1, y: 0, scale: 0.8, x: 0 }}
            animate={{ opacity: 0, y: -60, scale: 1.2, x: -10 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
            style={{
              fontFamily: 'Orbitron',
              fontSize: 16,
              fontWeight: 900,
              color: '#ffd700',
              textShadow: '0 0 12px rgba(255,215,0,0.8), 0 0 24px rgba(255,215,0,0.4)',
              letterSpacing: 1,
              whiteSpace: 'nowrap',
            }}
          >
            +{f.amount} XP
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
