import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemStore } from '../store/useSystemStore';

const MESSAGES = [
  "The weak have no right to dictate the terms of their own growth.",
  "Every rep, every page, every task — the system is watching.",
  "You did not come this far to only come this far.",
  "Arise. The dungeon of today awaits your conquest.",
  "Consistency is the only cheat code that actually works.",
  "The gap between who you are and who you want to be is called discipline.",
  "S-Rank hunters were once E-Rank. The only difference is they didn't stop.",
  "Your future self is watching you right now. Don't disappoint them.",
  "Pain is temporary. Stats are permanent.",
  "The system rewards those who show up every single day.",
];

export default function SystemMessage() {
  const { profile, todayXP, todayTasks } = useSystemStore();
  const [msgIndex, setMsgIndex] = useState(() => Math.floor(Math.random() * MESSAGES.length));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMsgIndex((i) => (i + 1) % MESSAGES.length);
        setVisible(true);
      }, 500);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'MORNING BRIEFING' : hour < 17 ? 'AFTERNOON STATUS' : 'EVENING REPORT';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: '14px 16px',
        background: 'rgba(0,102,255,0.06)',
        border: '1px solid rgba(0,102,255,0.2)',
        backdropFilter: 'blur(12px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Scan line effect */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,255,0.01) 2px, rgba(0,245,255,0.01) 4px)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: '#0066ff', letterSpacing: 3,
            fontFamily: 'Orbitron', marginBottom: 8 }}>
            ◈ SYSTEM MESSAGE — {greeting}
          </div>
          <AnimatePresence mode="wait">
            {visible && (
              <motion.div
                key={msgIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.4 }}
                style={{
                  fontSize: 13, color: '#c0d8f0', fontStyle: 'italic',
                  lineHeight: 1.5, letterSpacing: 0.3,
                }}
              >
                "{MESSAGES[msgIndex]}"
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Today's quick stats */}
        <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
          {[
            { label: 'XP TODAY', value: todayXP, color: '#00f5ff' },
            { label: 'TASKS', value: todayTasks, color: '#00ff88' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div className="orbitron" style={{ fontSize: 20, fontWeight: 700, color,
                textShadow: `0 0 10px ${color}` }}>
                {value}
              </div>
              <div style={{ fontSize: 9, color: '#7ab8d4', letterSpacing: 1 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
