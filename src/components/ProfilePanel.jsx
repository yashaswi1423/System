import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Edit3, Check, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useSystemStore } from '../store/useSystemStore';
import { getRank, getNextRank, getXPForLevel, getLatestTitle, getLevelsToNextRank, RANKS } from '../lib/rankSystem';
import WeightLog from './WeightLog';
import DataBackup from './DataBackup';

export default function ProfilePanel() {
  const { profile, updateProfile, resetDailyTasks } = useSystemStore();
  const [editing, setEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [form, setForm] = useState({ name: profile.name, height: profile.height, weight: profile.weight });

  const xpNeeded = getXPForLevel(profile.level);
  const xpPercent = Math.min((profile.xp / xpNeeded) * 100, 100);
  const bmi = (profile.weight / ((profile.height / 100) ** 2)).toFixed(1);
  const rank = getRank(profile.level);
  const nextRank = getNextRank(profile.level);
  const title = getLatestTitle(profile.level);
  const levelsToNext = getLevelsToNextRank(profile.level);
  const rankProgress = nextRank
    ? ((profile.level - rank.minLevel) / (rank.maxLevel - rank.minLevel + 1)) * 100
    : 100;

  const save = () => {
    updateProfile({ name: form.name, height: Number(form.height), weight: Number(form.weight) });
    setEditing(false);
  };

  return (
    <motion.div
      className="glass-bright"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18, position: 'relative' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, width: 16, height: 16,
        borderTop: `2px solid ${rank.color}`, borderLeft: `2px solid ${rank.color}` }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16,
        borderBottom: `2px solid ${rank.color}`, borderRight: `2px solid ${rank.color}` }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="orbitron" style={{ fontSize: 11, letterSpacing: 3,
          color: rank.color, textShadow: `0 0 8px ${rank.glowColor}` }}>
          SYSTEM PROFILE
        </span>
        <button className="btn-neon" style={{ padding: '4px 10px', fontSize: 11,
          borderColor: rank.color, color: rank.color }}
          onClick={() => editing ? save() : setEditing(true)}>
          {editing ? <Check size={12} /> : <Edit3 size={12} />}
        </button>
      </div>

      {/* Avatar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <motion.div whileHover={{ scale: 1.05 }} style={{
          width: 90, height: 90, borderRadius: '50%',
          border: `2px solid ${rank.color}`,
          boxShadow: `0 0 24px ${rank.glowColor}, inset 0 0 20px ${rank.bgColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: rank.bgColor, position: 'relative', overflow: 'hidden',
        }}>
          <User size={40} color={rank.color} />
          <div style={{ position: 'absolute', bottom: 4, right: 4, fontSize: 14,
            filter: `drop-shadow(0 0 4px ${rank.color})` }}>
            {rank.icon}
          </div>
        </motion.div>

        {editing
          ? <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{ textAlign: 'center', fontSize: 16, fontWeight: 700, maxWidth: 160 }} />
          : <div className="orbitron" style={{ fontSize: 17, fontWeight: 700, color: '#e0f4ff',
              textShadow: '0 0 10px rgba(0,245,255,0.3)', textAlign: 'center' }}>
              {profile.name}
            </div>
        }

        <div style={{ fontSize: 11, color: title.color, fontStyle: 'italic',
          textShadow: `0 0 6px ${title.color}88`, letterSpacing: 1 }}>
          "{title.label}"
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <span className="orbitron" style={{ padding: '3px 10px', fontSize: 12, fontWeight: 700,
            border: `1px solid ${rank.color}`, color: rank.color, background: rank.bgColor,
            boxShadow: `0 0 8px ${rank.glowColor}` }}>
            LVL {profile.level}
          </span>
          <span className="orbitron" style={{ padding: '3px 10px', fontSize: 12, fontWeight: 700,
            border: `1px solid ${rank.color}`, color: rank.color, background: rank.bgColor,
            boxShadow: `0 0 8px ${rank.glowColor}` }}>
            {rank.icon} {rank.label}
          </span>
        </div>
      </div>

      {/* XP Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
          <span style={{ color: '#7ab8d4', letterSpacing: 1 }}>LEVEL XP</span>
          <span className="orbitron" style={{ color: rank.color, fontSize: 10 }}>
            {profile.xp} / {xpNeeded}
          </span>
        </div>
        <div className="xp-bar">
          <motion.div className="xp-bar-fill"
            initial={{ width: 0 }} animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ background: `linear-gradient(90deg, ${rank.color}88, ${rank.color})`,
              boxShadow: `0 0 8px ${rank.glowColor}` }} />
        </div>
        <div style={{ fontSize: 10, color: '#7ab8d4', textAlign: 'right' }}>
          {xpNeeded - profile.xp} XP to Level {profile.level + 1}
        </div>
      </div>

      {/* Rank Progress */}
      {nextRank && (
        <div style={{ padding: '10px 12px', background: rank.bgColor,
          border: `1px solid ${rank.color}22`, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span className="orbitron" style={{ color: rank.color }}>{rank.label}</span>
            <span className="orbitron" style={{ color: nextRank.color }}>{nextRank.label}</span>
          </div>
          <div className="xp-bar">
            <motion.div initial={{ width: 0 }} animate={{ width: `${rankProgress}%` }}
              transition={{ duration: 1 }}
              style={{ height: '100%', borderRadius: 3,
                background: `linear-gradient(90deg, ${rank.color}, ${nextRank.color})`,
                boxShadow: `0 0 8px ${rank.glowColor}` }} />
          </div>
          <div style={{ fontSize: 10, color: '#7ab8d4', textAlign: 'center' }}>
            {levelsToNext} level{levelsToNext !== 1 ? 's' : ''} until {nextRank.label}
          </div>
        </div>
      )}

      {/* Rank Ladder */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ fontSize: 10, color: '#7ab8d4', letterSpacing: 2, marginBottom: 4 }}>RANK LADDER</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: 280, overflowY: 'auto' }}>
        {RANKS.map((r) => {
          const isCurrent = r.id === rank.id;
          const isPast = profile.level > r.maxLevel;
          return (
            <div key={r.id} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px',
              background: isCurrent ? r.bgColor : 'transparent',
              border: `1px solid ${isCurrent ? r.color : 'rgba(255,255,255,0.05)'}`,
              opacity: isPast ? 0.55 : isCurrent ? 1 : 0.35,
              transition: 'all 0.2s',
            }}>
              <span style={{ fontSize: 12, filter: isCurrent ? `drop-shadow(0 0 4px ${r.color})` : 'none' }}>
                {r.icon}
              </span>
              <span className="orbitron" style={{ fontSize: 10, flex: 1,
                color: isCurrent ? r.color : isPast ? '#7ab8d4' : '#555',
                textShadow: isCurrent ? `0 0 6px ${r.glowColor}` : 'none' }}>
                {r.label}
              </span>
              <span style={{ fontSize: 9, color: '#7ab8d4' }}>
                {r.maxLevel === Infinity ? `${r.minLevel}+` : `${r.minLevel}–${r.maxLevel}`}
              </span>
              {isPast && <span style={{ fontSize: 10, color: '#00ff88' }}>✓</span>}
              {isCurrent && (
                <motion.span animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ fontSize: 8, color: r.color, fontFamily: 'Orbitron' }}>◉</motion.span>
              )}
            </div>
          );
        })}
        </div>
      </div>

      {/* Body Stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 10, color: '#7ab8d4', letterSpacing: 2 }}>BODY STATS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'HEIGHT', value: editing
              ? <input type="number" value={form.height}
                  onChange={(e) => setForm({ ...form, height: e.target.value })}
                  style={{ width: 70, padding: '4px 8px' }} />
              : `${profile.height} cm` },
            { label: 'WEIGHT', value: editing
              ? <input type="number" value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  style={{ width: 70, padding: '4px 8px' }} />
              : `${profile.weight} kg` },
            { label: 'BMI', value: bmi },
            { label: 'TOTAL XP', value: (profile.totalXPEarned || 0).toLocaleString() },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'rgba(0,245,255,0.04)',
              border: '1px solid rgba(0,245,255,0.1)', padding: '8px 10px' }}>
              <div style={{ fontSize: 9, color: '#7ab8d4', letterSpacing: 1, marginBottom: 3 }}>{label}</div>
              <div className="orbitron" style={{ fontSize: 12, color: '#e0f4ff' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Level History */}
      {(profile.levelHistory?.length > 0) && (
        <div>
          <button onClick={() => setShowHistory((h) => !h)} style={{
            width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'transparent', border: '1px solid rgba(0,245,255,0.1)',
            padding: '7px 10px', color: '#7ab8d4', cursor: 'pointer',
            fontSize: 10, letterSpacing: 2, fontFamily: 'Orbitron',
          }}>
            LEVEL HISTORY {showHistory ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <AnimatePresence>
            {showHistory && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                <div style={{ maxHeight: 160, overflowY: 'auto',
                  border: '1px solid rgba(0,245,255,0.08)', borderTop: 'none' }}>
                  {profile.levelHistory.map((entry, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between',
                      padding: '5px 10px', fontSize: 11,
                      borderBottom: '1px solid rgba(0,245,255,0.05)',
                      background: i % 2 === 0 ? 'rgba(0,245,255,0.02)' : 'transparent' }}>
                      <span className="orbitron" style={{ color: '#00f5ff', fontSize: 10 }}>LVL {entry.level}</span>
                      <span style={{ color: '#7ab8d4', fontSize: 10 }}>{entry.rank}</span>
                      <span style={{ color: '#7ab8d4', fontSize: 10 }}>{entry.date}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <WeightLog />

      <DataBackup />

      <button className="btn-neon" onClick={resetDailyTasks}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 6, width: '100%', fontSize: 12 }}>
        <RotateCcw size={12} /> RESET DAY
      </button>
    </motion.div>
  );
}
