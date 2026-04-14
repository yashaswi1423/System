import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSystemStore } from '../store/useSystemStore';

export default function ActivityHeatmap() {
  const { activityLog, todayXP } = useSystemStore();
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const dayCount = isMobile ? 14 : 28;
  const weeksOf = isMobile ? 7 : 7; // days per column

  const days = Array.from({ length: dayCount }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (dayCount - 1 - i));
    const dateStr = d.toLocaleDateString();
    const isToday = i === dayCount - 1;
    const log = activityLog.find((a) => a.date === dateStr);
    const xp = isToday ? todayXP : (log?.xpGained || 0);
    return { date: dateStr, xp, isToday };
  });

  const maxXP = Math.max(...days.map((d) => d.xp), 1);

  const getColor = (xp, isToday) => {
    if (xp === 0) return 'rgba(0,245,255,0.06)';
    const intensity = xp / maxXP;
    if (isToday) return `rgba(255,215,0,${0.2 + intensity * 0.7})`;
    if (intensity > 0.7) return `rgba(0,245,255,${0.7 + intensity * 0.3})`;
    if (intensity > 0.4) return `rgba(0,245,255,${0.35 + intensity * 0.3})`;
    return `rgba(0,245,255,${0.12 + intensity * 0.2})`;
  };

  const weeks = [];
  for (let i = 0; i < dayCount; i += weeksOf) weeks.push(days.slice(i, i + weeksOf));

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#7ab8d4', letterSpacing: 2, textTransform: 'uppercase' }}>
          {dayCount}-Day Activity
        </span>
        <span style={{ fontSize: 11, color: '#7ab8d4' }}>
          Today: <span className="orbitron" style={{ color: '#ffd700' }}>{todayXP} XP</span>
        </span>
      </div>

      <div style={{ display: 'flex', gap: isMobile ? 3 : 4 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 3 : 4, flex: 1 }}>
            {week.map((day, di) => (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (wi * weeksOf + di) * 0.01 }}
                title={`${day.date}: ${day.xp} XP`}
                style={{
                  height: isMobile ? 18 : 14,
                  background: getColor(day.xp, day.isToday),
                  border: day.isToday ? '1px solid rgba(255,215,0,0.5)' : '1px solid rgba(0,245,255,0.08)',
                  borderRadius: 3,
                  boxShadow: day.xp > 0 ? `0 0 4px ${day.isToday ? 'rgba(255,215,0,0.3)' : 'rgba(0,245,255,0.2)'}` : 'none',
                }}
              />
            ))}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 5, alignItems: 'center', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 10, color: '#7ab8d4' }}>Less</span>
        {[0.06, 0.2, 0.4, 0.65, 0.9].map((op, i) => (
          <div key={i} style={{
            width: isMobile ? 12 : 10, height: isMobile ? 12 : 10, borderRadius: 2,
            background: `rgba(0,245,255,${op})`,
            border: '1px solid rgba(0,245,255,0.15)',
          }} />
        ))}
        <span style={{ fontSize: 10, color: '#7ab8d4' }}>More</span>
      </div>
    </div>
  );
}
