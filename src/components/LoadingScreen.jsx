import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_LINES = [
  { text: 'INITIALIZING SYSTEM...', delay: 0 },
  { text: 'LOADING HUNTER DATABASE...', delay: 300 },
  { text: 'SYNCING QUEST LOG...', delay: 600 },
  { text: 'CALIBRATING STAT ENGINE...', delay: 900 },
  { text: 'ESTABLISHING NEURAL LINK...', delay: 1200 },
  { text: 'SYSTEM ONLINE.', delay: 1500, highlight: true },
];

export default function LoadingScreen({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [visibleLines, setVisibleLines] = useState([]);
  const [phase, setPhase] = useState('boot'); // boot | arise | exit

  // Progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 2;
      });
    }, 36);
    return () => clearInterval(interval);
  }, []);

  // Boot lines
  useEffect(() => {
    BOOT_LINES.forEach(({ text, delay, highlight }) => {
      setTimeout(() => {
        setVisibleLines((prev) => [...prev, { text, highlight }]);
      }, delay);
    });
  }, []);

  // Phase transitions
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('arise'), 2000);
    const t2 = setTimeout(() => setPhase('exit'), 3200);
    const t3 = setTimeout(() => onDone(), 3700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <AnimatePresence>
      {phase !== 'exit' && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.5, ease: 'easeIn' }}
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: '#020b18',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Radial glow bg */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at 50% 60%, rgba(0,102,255,0.12) 0%, transparent 70%)',
          }} />

          {/* Animated grid lines */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={`${(i / 12) * 100}%`} x2="100%" y2={`${(i / 12) * 100}%`}
                stroke="#00f5ff" strokeWidth="1" />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={`v${i}`} x1={`${(i / 8) * 100}%`} y1="0" x2={`${(i / 8) * 100}%`} y2="100%"
                stroke="#00f5ff" strokeWidth="1" />
            ))}
          </svg>

          {/* Scan line sweep */}
          <motion.div
            animate={{ top: ['-5%', '105%'] }}
            transition={{ duration: 2.5, ease: 'linear', repeat: Infinity }}
            style={{
              position: 'absolute', left: 0, right: 0, height: 2, pointerEvents: 'none',
              background: 'linear-gradient(transparent, rgba(0,245,255,0.5), transparent)',
            }}
          />

          <AnimatePresence mode="wait">
            {phase === 'boot' && (
              <motion.div
                key="boot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 32, width: '100%', maxWidth: 360, padding: '0 24px',
                }}
              >
                {/* Logo */}
                <div style={{ textAlign: 'center' }}>
                  <motion.div
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      width: 72, height: 72, borderRadius: '50%', margin: '0 auto 16px',
                      border: '2px solid rgba(0,245,255,0.6)',
                      boxShadow: '0 0 30px rgba(0,245,255,0.3), inset 0 0 30px rgba(0,102,255,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(0,245,255,0.05)',
                    }}
                  >
                    <span style={{ fontSize: 32 }}>⚡</span>
                  </motion.div>
                  <div className="orbitron" style={{
                    fontSize: 20, fontWeight: 900, letterSpacing: 5,
                    background: 'linear-gradient(90deg, #0066ff, #00f5ff)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    marginBottom: 4,
                  }}>
                    SOLO LEVELING
                  </div>
                  <div style={{ fontSize: 10, color: '#7ab8d4', letterSpacing: 4 }}>
                    PERSONAL SYSTEM v1.0
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%' }}>
                  <div style={{
                    height: 3, background: 'rgba(0,245,255,0.1)',
                    borderRadius: 2, overflow: 'hidden', marginBottom: 8,
                  }}>
                    <motion.div
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.1 }}
                      style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #0066ff, #00f5ff)',
                        boxShadow: '0 0 8px #00f5ff',
                        borderRadius: 2,
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 9, color: '#7ab8d4', fontFamily: 'Orbitron' }}>
                      LOADING
                    </span>
                    <span className="orbitron" style={{ fontSize: 9, color: '#00f5ff' }}>
                      {progress}%
                    </span>
                  </div>
                </div>

                {/* Boot log */}
                <div style={{
                  width: '100%', fontFamily: 'Orbitron', fontSize: 10,
                  display: 'flex', flexDirection: 'column', gap: 6,
                  minHeight: 120,
                }}>
                  {visibleLines.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        color: line.highlight ? '#00f5ff' : '#7ab8d4',
                        letterSpacing: 1,
                        textShadow: line.highlight ? '0 0 8px #00f5ff' : 'none',
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}
                    >
                      <span style={{ color: line.highlight ? '#00f5ff' : '#0066ff' }}>
                        {line.highlight ? '◆' : '›'}
                      </span>
                      {line.text}
                      {i === visibleLines.length - 1 && (
                        <motion.span
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          style={{ color: '#00f5ff' }}
                        >▋</motion.span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {phase === 'arise' && (
              <motion.div
                key="arise"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                style={{ textAlign: 'center', position: 'relative' }}
              >
                {/* Burst rings */}
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.5, opacity: 0.8 }}
                    animate={{ scale: 2.5 + i * 0.5, opacity: 0 }}
                    transition={{ duration: 1.2, delay: i * 0.15, ease: 'easeOut' }}
                    style={{
                      position: 'absolute', top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 80, height: 80, borderRadius: '50%',
                      border: '2px solid rgba(0,245,255,0.6)',
                      pointerEvents: 'none',
                    }}
                  />
                ))}

                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 0.6, repeat: 2 }}
                  style={{ fontSize: 64, marginBottom: 20, display: 'block',
                    filter: 'drop-shadow(0 0 20px rgba(0,245,255,0.8))' }}
                >
                  ⚡
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="orbitron"
                  style={{
                    fontSize: 42, fontWeight: 900, letterSpacing: 8,
                    background: 'linear-gradient(180deg, #ffffff 0%, #00f5ff 50%, #0066ff 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    textShadow: 'none',
                    filter: 'drop-shadow(0 0 20px rgba(0,245,255,0.6))',
                  }}
                >
                  ARISE
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  style={{ fontSize: 11, color: '#7ab8d4', letterSpacing: 4, marginTop: 10,
                    fontFamily: 'Orbitron' }}
                >
                  YOUR JOURNEY BEGINS
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
