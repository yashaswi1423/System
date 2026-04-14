import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckSquare, Square, AlertTriangle } from 'lucide-react';
import { useSystemStore } from '../store/useSystemStore';

// Motivational caution messages — rotates daily
const CAUTIONS = [
  'IF THE DAILY QUEST REMAINS INCOMPLETE, YOU WILL REGRET IT TOMORROW.',
  'THE WEAK REST. THE STRONG EXECUTE. WHICH ONE ARE YOU?',
  'EVERY SKIPPED DAY IS A GIFT TO YOUR COMPETITION.',
  'DISCIPLINE TODAY. RESULTS IN OCTOBER. NO EXCUSES.',
  'YOUR FUTURE SELF IS WATCHING. DON\'T DISAPPOINT HIM.',
];

export default function DailyQuestPopup() {
  const { tasks: rawTasks, toggleTask, dailyQuests } = useSystemStore();
  const tasks = {
    morning: rawTasks?.morning || [],
    evening: rawTasks?.evening || [],
    daily:   rawTasks?.daily   || [],
  };

  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('morning');

  // Show on every page load, no session check
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(t);
  }, []);

  const caution = CAUTIONS[new Date().getDay() % CAUTIONS.length];

  const tabs = [
    { key: 'morning', label: 'MORNING', icon: '🌅', color: '#ffaa00' },
    { key: 'evening', label: 'EVENING', icon: '🌙', color: '#aa88ff' },
    { key: 'daily',   label: 'DAILY',   icon: '📋', color: '#00f5ff' },
  ];

  const list = tasks[activeTab] || [];
  const completedCount = list.filter((t) => t.completed).length;
  const totalCount = list.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const tabColor = tabs.find((t) => t.key === activeTab)?.color || '#00f5ff';

  // Quests summary
  const questsDone = dailyQuests?.filter((q) => q.completed).length || 0;
  const questsTotal = dailyQuests?.length || 0;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 99998,
            background: 'rgba(0,0,0,0.88)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
          }}
          onClick={(e) => e.target === e.currentTarget && setVisible(false)}
        >
          <motion.div
            initial={{ scale: 0.85, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            style={{
              width: '100%', maxWidth: 420,
              background: 'linear-gradient(160deg, #020f1e 0%, #041830 100%)',
              border: '1px solid rgba(0,245,255,0.35)',
              boxShadow: '0 0 60px rgba(0,245,255,0.15), 0 0 120px rgba(0,102,255,0.1)',
              position: 'relative', overflow: 'hidden',
              maxHeight: '90vh', display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Scan line animation */}
            <motion.div
              initial={{ top: '-5%' }}
              animate={{ top: '105%' }}
              transition={{ duration: 3, ease: 'linear', repeat: Infinity, repeatDelay: 2 }}
              style={{
                position: 'absolute', left: 0, right: 0, height: 2, pointerEvents: 'none',
                background: 'linear-gradient(transparent, rgba(0,245,255,0.4), transparent)',
                zIndex: 1,
              }}
            />

            {/* Corner accents */}
            {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
              <div key={v+h} style={{
                position: 'absolute', [v]: 0, [h]: 0, width: 18, height: 18,
                borderTop: v === 'top' ? '2px solid #00f5ff' : 'none',
                borderBottom: v === 'bottom' ? '2px solid #00f5ff' : 'none',
                borderLeft: h === 'left' ? '2px solid #00f5ff' : 'none',
                borderRight: h === 'right' ? '2px solid #00f5ff' : 'none',
              }} />
            ))}

            {/* Header */}
            <div style={{
              padding: '18px 20px 14px',
              borderBottom: '1px solid rgba(0,245,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  border: '1px solid rgba(0,245,255,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,245,255,0.08)',
                }}>
                  <span style={{ fontSize: 16 }}>⚠</span>
                </div>
                <div>
                  <div className="orbitron" style={{
                    fontSize: 14, fontWeight: 900, letterSpacing: 3,
                    background: 'linear-gradient(90deg, #0066ff, #00f5ff)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>
                    QUEST INFO
                  </div>
                  <div style={{ fontSize: 10, color: '#7ab8d4', letterSpacing: 1, marginTop: 1 }}>
                    DAILY QUEST — ARISE AND CONQUER
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setVisible(false)}
                style={{
                  width: 32, height: 32, border: '1px solid rgba(0,245,255,0.3)',
                  background: 'rgba(0,245,255,0.06)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#00f5ff', transition: 'all 0.2s', flexShrink: 0,
                }}
              >
                <X size={16} />
              </motion.button>
            </div>

            {/* Quest progress summary */}
            <div style={{
              padding: '12px 20px',
              background: 'rgba(0,245,255,0.04)',
              borderBottom: '1px solid rgba(0,245,255,0.08)',
              display: 'flex', gap: 16, flexShrink: 0,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: '#7ab8d4', letterSpacing: 2, marginBottom: 4 }}>
                  TODAY'S TASKS
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="xp-bar" style={{ flex: 1 }}>
                    <motion.div
                      className="xp-bar-fill"
                      animate={{ width: `${pct}%` }}
                      style={{
                        background: `linear-gradient(90deg, ${tabColor}88, ${tabColor})`,
                        boxShadow: `0 0 6px ${tabColor}`,
                      }}
                    />
                  </div>
                  <span className="orbitron" style={{ fontSize: 11, color: tabColor }}>
                    {completedCount}/{totalCount}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 9, color: '#7ab8d4', letterSpacing: 1, marginBottom: 2 }}>QUESTS</div>
                <span className="orbitron" style={{ fontSize: 14, color: '#ffd700',
                  textShadow: '0 0 8px #ffd700' }}>
                  {questsDone}/{questsTotal}
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex', borderBottom: '1px solid rgba(0,245,255,0.1)',
              flexShrink: 0,
            }}>
              {tabs.map((tab) => {
                const tabList = tasks[tab.key] || [];
                const done = tabList.filter((t) => t.completed).length;
                return (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                    flex: 1, padding: '10px 6px',
                    background: activeTab === tab.key ? `${tab.color}12` : 'transparent',
                    border: 'none',
                    borderBottom: activeTab === tab.key ? `2px solid ${tab.color}` : '2px solid transparent',
                    color: activeTab === tab.key ? tab.color : '#7ab8d4',
                    cursor: 'pointer', fontFamily: 'Orbitron', fontSize: 9,
                    letterSpacing: 1, transition: 'all 0.2s',
                  }}>
                    <div>{tab.icon}</div>
                    <div style={{ marginTop: 2 }}>{tab.label}</div>
                    {tabList.length > 0 && (
                      <div style={{ fontSize: 8, marginTop: 1, opacity: 0.7 }}>
                        {done}/{tabList.length}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Task list — scrollable */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
              {list.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#7ab8d4', fontSize: 13 }}>
                  No tasks in this category
                </div>
              ) : (
                list.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => toggleTask(activeTab, task.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '11px 12px', marginBottom: 6, cursor: 'pointer',
                      background: task.completed
                        ? `${tabColor}0a`
                        : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${task.completed
                        ? tabColor + '33'
                        : 'rgba(255,255,255,0.06)'}`,
                      transition: 'all 0.2s',
                    }}
                  >
                    <motion.div whileTap={{ scale: 0.7 }} style={{ flexShrink: 0 }}>
                      {task.completed
                        ? <CheckSquare size={18} color={tabColor} />
                        : <Square size={18} color="#7ab8d4" />}
                    </motion.div>
                    <span style={{
                      flex: 1, fontSize: 14, fontWeight: 500,
                      color: task.completed ? tabColor : '#e0f4ff',
                      textDecoration: task.completed ? 'line-through' : 'none',
                      opacity: task.completed ? 0.65 : 1,
                    }}>
                      {task.title}
                    </span>
                    {task.completed && (
                      <span style={{ fontSize: 10, color: tabColor, fontFamily: 'Orbitron',
                        flexShrink: 0 }}>+5 XP</span>
                    )}
                  </motion.div>
                ))
              )}
            </div>

            {/* Caution footer */}
            <div style={{
              padding: '14px 20px',
              borderTop: '1px solid rgba(255,68,68,0.2)',
              background: 'rgba(255,68,68,0.04)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <AlertTriangle size={14} color="#ff4444" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 11, lineHeight: 1.6, color: '#e0f4ff' }}>
                  <span style={{ color: '#ff4444', fontFamily: 'Orbitron', fontSize: 10 }}>
                    CAUTION!{' '}
                  </span>
                  {caution}
                </p>
              </div>
            </div>

            {/* Dismiss button */}
            <div style={{ padding: '12px 16px', flexShrink: 0 }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setVisible(false)}
                className="btn-neon"
                style={{
                  width: '100%', padding: '12px',
                  fontSize: 13, letterSpacing: 2,
                  background: 'rgba(0,245,255,0.06)',
                }}
              >
                ⚡ ARISE — BEGIN YOUR QUEST
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
