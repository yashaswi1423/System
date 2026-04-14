import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemStore } from '../store/useSystemStore';

const QUEST_ICONS = {
  routine: '🌅',
  gym: '⚔️',
  study: '📚',
  tasks: '✅',
  habits: '🔥',
};

export default function DailyQuestBoard() {
  const { dailyQuests, completeQuest, refreshDailyQuests } = useSystemStore();

  useEffect(() => {
    refreshDailyQuests();
  }, []);

  const completed = dailyQuests.filter((q) => q.completed).length;
  const total = dailyQuests.length;
  const allDone = completed === total;

  return (
    <div style={{
      padding: '20px 24px',
      background: 'rgba(4,18,37,0.6)',
      border: '1px solid rgba(0,245,255,0.12)',
      backdropFilter: 'blur(16px)',
      position: 'relative',
    }}>
      {/* corner accents */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 12, height: 12,
        borderTop: '2px solid #00f5ff', borderLeft: '2px solid #00f5ff' }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12,
        borderBottom: '2px solid #00f5ff', borderRight: '2px solid #00f5ff' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="orbitron neon-text" style={{ fontSize: 11, letterSpacing: 3 }}>
            DAILY QUESTS
          </span>
          {allDone && (
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="tag tag-gold" style={{ fontSize: 10 }}
            >
              ALL CLEAR
            </motion.span>
          )}
        </div>
        <span className="orbitron" style={{ fontSize: 11, color: '#7ab8d4' }}>
          {completed}/{total}
        </span>
      </div>

      {/* Progress bar */}
      <div className="xp-bar" style={{ marginBottom: 16 }}>
        <motion.div
          className="xp-bar-fill"
          animate={{ width: `${(completed / total) * 100}%` }}
          transition={{ duration: 0.6 }}
          style={{
            background: allDone
              ? 'linear-gradient(90deg, #ffd700, #ffaa00)'
              : 'linear-gradient(90deg, #0066ff, #00f5ff)',
            boxShadow: allDone ? '0 0 8px #ffd700' : '0 0 8px #00f5ff',
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
        <AnimatePresence>
          {dailyQuests.map((quest, i) => (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => !quest.completed && completeQuest(quest.id)}
              style={{
                padding: '12px 14px',
                background: quest.completed
                  ? 'rgba(0,255,136,0.06)'
                  : 'rgba(0,245,255,0.03)',
                border: `1px solid ${quest.completed ? 'rgba(0,255,136,0.25)' : 'rgba(0,245,255,0.12)'}`,
                cursor: quest.completed ? 'default' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
              whileHover={!quest.completed ? { scale: 1.02, borderColor: 'rgba(0,245,255,0.35)' } : {}}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{QUEST_ICONS[quest.type]}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 600,
                  color: quest.completed ? '#00ff88' : '#e0f4ff',
                  textDecoration: quest.completed ? 'line-through' : 'none',
                  opacity: quest.completed ? 0.7 : 1,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {quest.title}
                </div>
                <div style={{ fontSize: 11, color: quest.completed ? '#00ff8888' : '#ffd700',
                  fontFamily: 'Orbitron', marginTop: 2 }}>
                  +{quest.xp} XP
                </div>
              </div>
              {quest.completed && (
                <motion.span
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  style={{ fontSize: 16, flexShrink: 0 }}
                >✓</motion.span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
