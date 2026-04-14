import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, BookOpen, CheckSquare, ChevronLeft, Flame, Target } from 'lucide-react';
import { useSystemStore } from '../store/useSystemStore';
import GymModule from './modules/GymModule';
import StudyModule from './modules/StudyModule';
import TasksModule from './modules/TasksModule';
import SpiritualityModule from './modules/SpiritualityModule';
import GoalsModule from './modules/GoalsModule';

const MODULES = [
  {
    id: 'gym',          label: 'GYM',          icon: Dumbbell,
    color: '#ff4466',   desc: 'PPL Split · Cardio · PRs · Rest Timer',
    tag: 'PHYSICAL',
  },
  {
    id: 'study',        label: 'STUDY',         icon: BookOpen,
    color: '#aa88ff',   desc: 'KodTantra · Pomodoro · Planner',
    tag: 'MENTAL',
  },
  {
    id: 'tasks',        label: 'DAILY TASKS',   icon: CheckSquare,
    color: '#00f5ff',   desc: 'Routines · Habits · Water · Sleep',
    tag: 'DISCIPLINE',
  },
  {
    id: 'spirituality', label: 'SPIRITUALITY',  icon: Flame,
    color: '#ffaa00',   desc: 'Meditate · Breathwork · Gratitude',
    tag: 'SPIRIT',
  },
  {
    id: 'goals',        label: 'MY GOALS',      icon: Target,
    color: '#00ff88',   desc: 'Transformation · Coding · Career',
    tag: 'VISION',
  },
];

function ModuleCard({ mod, onClick }) {
  const Icon = mod.icon;
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        padding: '14px 16px', cursor: 'pointer',
        background: `linear-gradient(135deg, rgba(0,0,0,0.5), ${mod.color}08)`,
        border: `1px solid ${mod.color}44`,
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', gap: 14,
      }}
    >
      {/* Corner accents */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 10, height: 10,
        borderTop: `2px solid ${mod.color}`, borderLeft: `2px solid ${mod.color}` }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10,
        borderBottom: `2px solid ${mod.color}`, borderRight: `2px solid ${mod.color}` }} />

      {/* Icon circle */}
      <div style={{
        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
        background: `${mod.color}15`,
        border: `1px solid ${mod.color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 12px ${mod.color}22`,
      }}>
        <Icon size={22} color={mod.color} style={{ filter: `drop-shadow(0 0 4px ${mod.color})` }} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span className="orbitron" style={{
            fontSize: 13, fontWeight: 700, color: mod.color,
            textShadow: `0 0 8px ${mod.color}`, letterSpacing: 1,
          }}>
            {mod.label}
          </span>
          <span style={{
            fontSize: 8, padding: '1px 6px', fontFamily: 'Orbitron', letterSpacing: 1,
            border: `1px solid ${mod.color}55`, color: mod.color, background: `${mod.color}12`,
            flexShrink: 0,
          }}>
            {mod.tag}
          </span>
        </div>
        <div style={{
          fontSize: 11, color: '#7ab8d4', lineHeight: 1.4,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {mod.desc}
        </div>
      </div>

      {/* Arrow */}
      <div style={{ color: `${mod.color}88`, fontSize: 16, flexShrink: 0 }}>›</div>
    </motion.div>
  );
}

export default function CenterPanel() {
  const { activeModule, setActiveModule } = useSystemStore();

  const active = MODULES.find((m) => m.id === activeModule);

  return (
    <motion.div
      className="glass-bright"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      style={{
        padding: 24, display: 'flex',
        flexDirection: 'column', gap: 20, position: 'relative',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {activeModule && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="btn-neon"
              style={{ padding: '4px 8px' }}
              onClick={() => setActiveModule(null)}
            >
              <ChevronLeft size={14} />
            </motion.button>
          )}
          <span className="orbitron neon-text" style={{ fontSize: 11, letterSpacing: 3 }}>
            {activeModule ? active?.label + ' MODULE' : 'SYSTEM CONTROL'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <span className="tag tag-cyan" style={{ fontSize: 10 }}>ONLINE</span>
        </div>
      </div>

      {/* Content */}
      <div>
        <AnimatePresence mode="wait">
          {!activeModule ? (
            <motion.div
              key="menu"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              {/* System banner */}
              <div style={{
                padding: '16px 20px', textAlign: 'center',
                background: 'rgba(0,245,255,0.04)',
                border: '1px solid rgba(0,245,255,0.12)',
              }}>
                <div className="orbitron" style={{
                  fontSize: 22, fontWeight: 900, letterSpacing: 4,
                  background: 'linear-gradient(90deg, #0066ff, #00f5ff)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  textShadow: 'none',
                }}>
                  ARISE
                </div>
                <div style={{ fontSize: 12, color: '#7ab8d4', marginTop: 4, letterSpacing: 2 }}>
                  SELECT YOUR QUEST
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {MODULES.map((mod) => (
                  <ModuleCard key={mod.id} mod={mod} onClick={() => setActiveModule(mod.id)} />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              style={{ minHeight: 300 }}
            >
              {activeModule === 'gym' && <GymModule />}
              {activeModule === 'study' && <StudyModule />}
              {activeModule === 'tasks' && <TasksModule />}
              {activeModule === 'spirituality' && <SpiritualityModule />}
              {activeModule === 'goals' && <GoalsModule />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
