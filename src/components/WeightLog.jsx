import { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import { Plus } from 'lucide-react';
import { useSystemStore } from '../store/useSystemStore';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(4,18,37,0.95)', border: '1px solid rgba(0,245,255,0.3)',
      padding: '6px 10px', fontSize: 12,
    }}>
      <div style={{ color: '#00f5ff', fontFamily: 'Orbitron' }}>{payload[0].value} kg</div>
      <div style={{ color: '#7ab8d4', fontSize: 10 }}>{payload[0].payload.date}</div>
    </div>
  );
};

export default function WeightLog() {
  const { weightLog, logWeight, profile } = useSystemStore();
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);

  const chartData = [...weightLog].reverse().slice(-14);

  const handleLog = () => {
    if (!input || isNaN(input)) return;
    logWeight(input);
    setInput('');
    setOpen(false);
  };

  const delta = weightLog.length >= 2
    ? (weightLog[0].weight - weightLog[1].weight).toFixed(1)
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#7ab8d4', letterSpacing: 2, textTransform: 'uppercase' }}>
          Weight Log
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {delta !== null && (
            <span className="orbitron" style={{
              fontSize: 11,
              color: Number(delta) < 0 ? '#00ff88' : Number(delta) > 0 ? '#ff4466' : '#7ab8d4',
            }}>
              {Number(delta) > 0 ? '+' : ''}{delta} kg
            </span>
          )}
          <button className="btn-neon" style={{ padding: '3px 8px', fontSize: 11 }}
            onClick={() => setOpen((o) => !o)}>
            <Plus size={11} />
          </button>
        </div>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{ display: 'flex', gap: 8 }}
        >
          <input
            type="number" placeholder={`${profile.weight} kg`}
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLog()}
            style={{ flex: 1 }}
          />
          <button className="btn-neon" onClick={handleLog} style={{ padding: '6px 12px' }}>LOG</button>
        </motion.div>
      )}

      {chartData.length >= 2 ? (
        <div style={{ height: 60 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone" dataKey="weight"
                stroke="#00f5ff" strokeWidth={2} dot={false}
                style={{ filter: 'drop-shadow(0 0 4px #00f5ff)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{ fontSize: 12, color: '#7ab8d4', textAlign: 'center', padding: '8px 0' }}>
          Log weight to see trend
        </div>
      )}
    </div>
  );
}
