import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { useSystemStore } from '../store/useSystemStore';

const TYPE_COLORS = {
  warning: '#ff4466',
  boost:   '#00ff88',
  info:    '#00f5ff',
  insight: '#ffaa00',
};

function SuggestionCard({ s, i }) {
  const color = TYPE_COLORS[s.type] || '#00f5ff';
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.08 }}
      style={{
        display: 'flex', gap: 10, alignItems: 'flex-start',
        padding: '10px 12px',
        background: `${color}08`,
        border: `1px solid ${color}30`,
      }}
    >
      <span style={{ fontSize: 18, flexShrink: 0 }}>{s.icon}</span>
      <span style={{ fontSize: 12, color: '#e0f4ff', lineHeight: 1.5 }}>{s.text}</span>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(4,18,37,0.95)', border: '1px solid rgba(0,245,255,0.3)',
      padding: '6px 10px', fontSize: 11 }}>
      <div style={{ color: '#7ab8d4', marginBottom: 2 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

export default function InsightsDashboard() {
  const { activityLog, todayXP, todayTasks, todayStudyMins,
    habits, xpMultiplier, getSmartSuggestions, weightLog, sleepLog,
    stats, gymSchedule } = useSystemStore();

  const suggestions = useMemo(
    () => getSmartSuggestions(),
    [activityLog, sleepLog, habits, todayStudyMins, stats, gymSchedule]
  );

  // Last 7 days data
  const last7 = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toLocaleDateString();
      const isToday = i === 6;
      const log = activityLog.find((a) => a.date === dateStr);
      return {
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        xp: isToday ? todayXP : (log?.xpGained || 0),
        tasks: isToday ? todayTasks : (log?.tasksCompleted || 0),
        study: isToday ? todayStudyMins : (log?.studyMins || 0),
      };
    });
  }, [activityLog, todayXP, todayTasks, todayStudyMins]);

  const totalWeekXP = last7.reduce((a, d) => a + d.xp, 0);
  const totalWeekTasks = last7.reduce((a, d) => a + d.tasks, 0);
  const bestDay = last7.reduce((best, d) => d.xp > best.xp ? d : best, last7[0]);
  const avgXP = Math.round(totalWeekXP / 7);

  // Streak stats
  const topStreak = Math.max(...(habits || []).map((h) => h.streak || 0), 0);
  const topHabit = (habits || []).find((h) => h.streak === topStreak);

  // Weight trend
  const weightTrend = weightLog.slice(0, 7).reverse();

  // Sleep trend
  const sleepTrend = sleepLog.slice(0, 7).reverse().map((s, i) => ({
    day: new Date(s.date).toLocaleDateString('en-US', { weekday: 'short' }),
    hours: s.hours,
  }));

  return (
    <div style={{
      background: 'rgba(4,18,37,0.85)',
      border: '1px solid rgba(0,245,255,0.18)',
      backdropFilter: 'blur(20px)',
      padding: '20px 16px',
      display: 'flex', flexDirection: 'column', gap: 20,
      position: 'relative',
    }}>
      {/* Corner accents */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 14, height: 14,
        borderTop: '2px solid #00f5ff', borderLeft: '2px solid #00f5ff' }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14,
        borderBottom: '2px solid #00f5ff', borderRight: '2px solid #00f5ff' }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="orbitron neon-text" style={{ fontSize: 12, letterSpacing: 3 }}>
            PERFORMANCE INSIGHTS
          </div>
          <div style={{ fontSize: 11, color: '#7ab8d4', marginTop: 2 }}>
            Weekly analysis · Smart suggestions
          </div>
        </div>
        {/* XP Multiplier badge */}
        <div style={{
          padding: '4px 10px',
          background: xpMultiplier > 1 ? 'rgba(0,255,136,0.1)' : xpMultiplier < 1 ? 'rgba(255,68,102,0.1)' : 'rgba(0,245,255,0.08)',
          border: `1px solid ${xpMultiplier > 1 ? '#00ff88' : xpMultiplier < 1 ? '#ff4466' : '#00f5ff'}55`,
        }}>
          <div style={{ fontSize: 9, color: '#7ab8d4', fontFamily: 'Orbitron', letterSpacing: 1 }}>XP RATE</div>
          <div className="orbitron" style={{
            fontSize: 16, fontWeight: 700,
            color: xpMultiplier > 1 ? '#00ff88' : xpMultiplier < 1 ? '#ff4466' : '#00f5ff',
            textShadow: `0 0 8px ${xpMultiplier > 1 ? '#00ff88' : '#00f5ff'}`,
          }}>
            {xpMultiplier}x
          </div>
          <div style={{ fontSize: 9, color: '#7ab8d4' }}>
            {xpMultiplier > 1 ? 'STREAK BONUS' : xpMultiplier < 1 ? 'COMEBACK MODE' : 'NORMAL'}
          </div>
        </div>
      </div>

      {/* Weekly stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {[
          { label: 'WEEK XP',    value: totalWeekXP,  color: '#00f5ff', icon: '⚡' },
          { label: 'TASKS DONE', value: totalWeekTasks, color: '#00ff88', icon: '✅' },
          { label: 'BEST DAY',   value: bestDay?.day || '—', color: '#ffd700', icon: '🏆' },
          { label: 'TOP STREAK', value: `${topStreak}🔥 ${topHabit?.name?.split(' ')[0] || ''}`, color: '#ffaa00', icon: '🔥' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} style={{
            padding: '10px 12px',
            background: `${color}08`, border: `1px solid ${color}22`,
          }}>
            <div style={{ fontSize: 10, color: '#7ab8d4', letterSpacing: 1, marginBottom: 4 }}>{icon} {label}</div>
            <div className="orbitron" style={{ fontSize: 15, color, textShadow: `0 0 6px ${color}` }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* XP Trend chart */}
      <div>
        <div style={{ fontSize: 10, color: '#7ab8d4', letterSpacing: 2, marginBottom: 8 }}>
          7-DAY XP TREND
        </div>
        <div style={{ height: 80 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={last7}>
              <XAxis dataKey="day" tick={{ fill: '#7ab8d4', fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="xp" stroke="#00f5ff" strokeWidth={2} dot={{ fill: '#00f5ff', r: 3 }}
                style={{ filter: 'drop-shadow(0 0 4px #00f5ff)' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sleep trend */}
      {sleepTrend.length >= 2 && (
        <div>
          <div style={{ fontSize: 10, color: '#7ab8d4', letterSpacing: 2, marginBottom: 8 }}>
            SLEEP TREND (hours)
          </div>
          <div style={{ height: 70 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sleepTrend}>
                <XAxis dataKey="day" tick={{ fill: '#7ab8d4', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="hours" stroke="#aa88ff" strokeWidth={2}
                  dot={{ fill: '#aa88ff', r: 3 }}
                  style={{ filter: 'drop-shadow(0 0 4px #aa88ff)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Weight trend */}
      {weightTrend.length >= 2 && (
        <div>
          <div style={{ fontSize: 10, color: '#7ab8d4', letterSpacing: 2, marginBottom: 8 }}>
            WEIGHT TREND (kg)
          </div>
          <div style={{ height: 70 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightTrend}>
                <XAxis dataKey="date" tick={{ fill: '#7ab8d4', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="weight" stroke="#ff4466" strokeWidth={2}
                  dot={{ fill: '#ff4466', r: 3 }}
                  style={{ filter: 'drop-shadow(0 0 4px #ff4466)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Smart suggestions */}
      {suggestions.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: '#7ab8d4', letterSpacing: 2, marginBottom: 8 }}>
            🧠 SYSTEM ANALYSIS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {suggestions.map((s, i) => <SuggestionCard key={i} s={s} i={i} />)}
          </div>
        </div>
      )}

      {/* Avg XP per day */}
      <div style={{ padding: '10px 14px', background: 'rgba(0,245,255,0.04)',
        border: '1px solid rgba(0,245,255,0.1)', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: '#7ab8d4' }}>Daily avg XP this week</span>
        <span className="orbitron" style={{ fontSize: 13, color: '#00f5ff' }}>{avgXP} XP/day</span>
      </div>
    </div>
  );
}
