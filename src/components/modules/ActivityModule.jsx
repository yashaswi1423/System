import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, MapPin, Zap, Dumbbell, BookOpen, CheckSquare, Timer, Activity, RotateCcw, Plus, Trash2, ChevronRight } from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';

// ─── Constants ────────────────────────────────────────────────────────────────
const ACTIVITY_TYPES = [
  { id: 'walk',    label: 'Walk',         icon: '🚶', color: '#00f5ff',  met: 3.5,  hasGPS: true  },
  { id: 'run',     label: 'Run',          icon: '🏃', color: '#ff4466',  met: 9.8,  hasGPS: true  },
  { id: 'cycle',   label: 'Cycling',      icon: '🚴', color: '#ffaa00',  met: 7.5,  hasGPS: true  },
  { id: 'gym',     label: 'Gym Session',  icon: '🏋️', color: '#ff4466',  met: 6.0,  hasGPS: false },
  { id: 'study',   label: 'Study Focus',  icon: '📚', color: '#aa88ff',  met: 1.5,  hasGPS: false },
  { id: 'task',    label: 'Task Sprint',  icon: '✅', color: '#00f5ff',  met: 2.0,  hasGPS: false },
  { id: 'yoga',    label: 'Yoga',         icon: '🧘', color: '#ffaa00',  met: 3.0,  hasGPS: false },
  { id: 'swim',    label: 'Swimming',     icon: '🏊', color: '#4488ff',  met: 8.0,  hasGPS: false },
  { id: 'hiit',    label: 'HIIT',         icon: '⚡', color: '#ff8800',  met: 12.0, hasGPS: false },
  { id: 'custom',  label: 'Custom',       icon: '🎯', color: '#00ff88',  met: 4.0,  hasGPS: false },
];

// Calorie formula: MET × weight(kg) × time(hours)
const calcCalories = (met, weightKg, seconds) => Math.round(met * weightKg * (seconds / 3600));

// Steps from distance (avg stride ~0.75m)
const distanceToSteps = (meters) => Math.round(meters / 0.75);

// Haversine distance between two GPS coords (returns meters)
const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const fmt = (s) => `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
const fmtShort = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

// ─── Live Stat Card ───────────────────────────────────────────────────────────
function StatCard({ label, value, unit, color, icon }) {
  return (
    <div style={{
      flex: 1, minWidth: 70, padding: '10px 8px', textAlign: 'center',
      background: `${color}0d`, border: `1px solid ${color}33`,
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ fontSize: 18 }}>{icon}</div>
      <div className="orbitron" style={{ fontSize: 16, fontWeight: 700, color, textShadow: `0 0 8px ${color}` }}>
        {value}
      </div>
      <div style={{ fontSize: 9, color: '#7ab8d4', letterSpacing: 1 }}>{unit}</div>
      <div style={{ fontSize: 9, color: '#4a7a8a', letterSpacing: 1 }}>{label}</div>
    </div>
  );
}

// ─── Gym Live Session ─────────────────────────────────────────────────────────
function GymLiveSession({ weightKg, elapsed, onAddSet, sets }) {
  const [exercise, setExercise] = useState('');
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(0);
  const calories = calcCalories(6.0, weightKg, elapsed);
  const totalVolume = sets.reduce((a, s) => a + s.reps * s.weight, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <StatCard label="TIME" value={fmt(elapsed)} unit="hh:mm:ss" color="#ff4466" icon="⏱️" />
        <StatCard label="CALORIES" value={calories} unit="kcal" color="#ffaa00" icon="🔥" />
        <StatCard label="SETS" value={sets.length} unit="sets" color="#ff4466" icon="💪" />
        <StatCard label="VOLUME" value={totalVolume} unit="kg·reps" color="#aa88ff" icon="📊" />
      </div>

      <div style={{ padding: 12, background: 'rgba(255,68,102,0.05)', border: '1px solid rgba(255,68,102,0.2)' }}>
        <div style={{ fontSize: 10, color: '#7ab8d4', letterSpacing: 2, marginBottom: 8 }}>LOG SET</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 2, minWidth: 100 }}>
            <div style={{ fontSize: 9, color: '#4a7a8a', marginBottom: 4 }}>EXERCISE</div>
            <input
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
              placeholder="e.g. Bench Press"
              style={{ width: '100%', padding: '6px 8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,68,102,0.3)', color: '#e0f0ff', fontSize: 12, fontFamily: 'Rajdhani', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 60 }}>
            <div style={{ fontSize: 9, color: '#4a7a8a', marginBottom: 4 }}>REPS</div>
            <input type="number" value={reps} onChange={(e) => setReps(Number(e.target.value))} min={1}
              style={{ width: '100%', padding: '6px 8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,68,102,0.3)', color: '#e0f0ff', fontSize: 12, fontFamily: 'Rajdhani', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1, minWidth: 60 }}>
            <div style={{ fontSize: 9, color: '#4a7a8a', marginBottom: 4 }}>KG</div>
            <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} min={0}
              style={{ width: '100%', padding: '6px 8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,68,102,0.3)', color: '#e0f0ff', fontSize: 12, fontFamily: 'Rajdhani', boxSizing: 'border-box' }} />
          </div>
          <button className="btn-neon" style={{ borderColor: '#ff4466', color: '#ff4466', padding: '6px 12px', flexShrink: 0 }}
            onClick={() => { if (exercise.trim()) { onAddSet({ exercise: exercise.trim(), reps, weight }); } }}>
            <Plus size={14} />
          </button>
        </div>
      </div>

      {sets.length > 0 && (
        <div style={{ maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sets.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'rgba(255,68,102,0.05)', border: '1px solid rgba(255,68,102,0.15)', fontSize: 12 }}>
              <span style={{ color: '#e0f0ff' }}>{s.exercise}</span>
              <span style={{ color: '#ff4466', fontFamily: 'Orbitron', fontSize: 11 }}>{s.reps} × {s.weight}kg</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── GPS Tracker ──────────────────────────────────────────────────────────────
function GPSTracker({ actType, weightKg, elapsed, distance, speed, steps, calories, gpsStatus }) {
  const pace = speed > 0 ? (1000 / speed / 60) : 0; // min/km
  const paceStr = pace > 0 ? `${Math.floor(pace)}:${String(Math.round((pace % 1) * 60)).padStart(2, '0')}` : '--:--';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* GPS status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: gpsStatus === 'active' ? 'rgba(0,255,136,0.08)' : 'rgba(255,170,0,0.08)', border: `1px solid ${gpsStatus === 'active' ? 'rgba(0,255,136,0.3)' : 'rgba(255,170,0,0.3)'}` }}>
        <MapPin size={12} color={gpsStatus === 'active' ? '#00ff88' : '#ffaa00'} />
        <span style={{ fontSize: 10, color: gpsStatus === 'active' ? '#00ff88' : '#ffaa00', letterSpacing: 1 }}>
          {gpsStatus === 'active' ? 'GPS TRACKING ACTIVE' : gpsStatus === 'requesting' ? 'REQUESTING GPS...' : gpsStatus === 'denied' ? 'GPS DENIED — MANUAL MODE' : 'GPS INITIALIZING...'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <StatCard label="TIME" value={fmt(elapsed)} unit="hh:mm:ss" color={actType.color} icon="⏱️" />
        <StatCard label="DISTANCE" value={(distance / 1000).toFixed(2)} unit="km" color={actType.color} icon="📍" />
        <StatCard label="STEPS" value={steps.toLocaleString()} unit="steps" color="#00ff88" icon="👟" />
        <StatCard label="CALORIES" value={calories} unit="kcal" color="#ffaa00" icon="🔥" />
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <StatCard label="SPEED" value={(speed * 3.6).toFixed(1)} unit="km/h" color="#4488ff" icon="⚡" />
        <StatCard label="PACE" value={paceStr} unit="min/km" color="#aa88ff" icon="🏃" />
        <StatCard label="AVG SPEED" value={elapsed > 0 ? ((distance / elapsed) * 3.6).toFixed(1) : '0.0'} unit="km/h avg" color="#00f5ff" icon="📈" />
      </div>
    </div>
  );
}

// ─── Study / Task Focus Tracker ───────────────────────────────────────────────
function FocusTracker({ actType, elapsed, calories, label }) {
  const sessions = Math.floor(elapsed / 1500); // 25-min pomodoros
  const focusPct = Math.min(100, Math.round((elapsed / (25 * 60)) * 100) % 101);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <StatCard label="FOCUS TIME" value={fmt(elapsed)} unit="hh:mm:ss" color={actType.color} icon="⏱️" />
        <StatCard label="POMODOROS" value={sessions} unit="sessions" color={actType.color} icon="🍅" />
        <StatCard label="CALORIES" value={calories} unit="kcal" color="#ffaa00" icon="🔥" />
        <StatCard label="FOCUS %" value={`${focusPct}%`} unit="of 25min" color="#00ff88" icon="🎯" />
      </div>
      <div style={{ padding: 12, background: `${actType.color}08`, border: `1px solid ${actType.color}22`, textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: '#7ab8d4', letterSpacing: 2, marginBottom: 6 }}>CURRENT SESSION</div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${focusPct}%`, background: actType.color, boxShadow: `0 0 8px ${actType.color}`, transition: 'width 1s linear' }} />
        </div>
        <div style={{ fontSize: 10, color: '#4a7a8a', marginTop: 6 }}>
          {fmtShort(elapsed % (25 * 60))} / 25:00 into current pomodoro
        </div>
      </div>
    </div>
  );
}

// ─── Generic Timer Tracker ────────────────────────────────────────────────────
function GenericTracker({ actType, weightKg, elapsed, calories }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <StatCard label="TIME" value={fmt(elapsed)} unit="hh:mm:ss" color={actType.color} icon="⏱️" />
      <StatCard label="CALORIES" value={calories} unit="kcal" color="#ffaa00" icon="🔥" />
      <StatCard label="INTENSITY" value={actType.met.toFixed(1)} unit="MET" color={actType.color} icon="⚡" />
    </div>
  );
}

// ─── Session Summary ──────────────────────────────────────────────────────────
function SessionSummary({ session, onDismiss }) {
  const act = ACTIVITY_TYPES.find((a) => a.id === session.type) || ACTIVITY_TYPES[0];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ padding: 20, background: `${act.color}0d`, border: `2px solid ${act.color}55`, display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 4 }}>{act.icon}</div>
        <div className="orbitron" style={{ fontSize: 14, color: act.color, letterSpacing: 2, textShadow: `0 0 10px ${act.color}` }}>
          SESSION COMPLETE
        </div>
        <div style={{ fontSize: 11, color: '#7ab8d4', marginTop: 4 }}>{act.label} · {new Date(session.date).toLocaleTimeString()}</div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <StatCard label="DURATION" value={fmt(session.duration)} unit="hh:mm:ss" color={act.color} icon="⏱️" />
        <StatCard label="CALORIES" value={session.calories} unit="kcal" color="#ffaa00" icon="🔥" />
        {session.distance > 0 && <StatCard label="DISTANCE" value={(session.distance / 1000).toFixed(2)} unit="km" color="#4488ff" icon="📍" />}
        {session.steps > 0 && <StatCard label="STEPS" value={session.steps.toLocaleString()} unit="steps" color="#00ff88" icon="👟" />}
        {session.sets?.length > 0 && <StatCard label="SETS" value={session.sets.length} unit="sets" color="#ff4466" icon="💪" />}
        {session.sets?.length > 0 && <StatCard label="VOLUME" value={session.sets.reduce((a, s) => a + s.reps * s.weight, 0)} unit="kg·reps" color="#aa88ff" icon="📊" />}
      </div>

      <div style={{ padding: '10px 14px', background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.25)', textAlign: 'center' }}>
        <span className="orbitron" style={{ fontSize: 18, color: '#00ff88', textShadow: '0 0 10px #00ff88' }}>
          +{session.xpEarned} XP
        </span>
        <span style={{ fontSize: 11, color: '#7ab8d4', marginLeft: 8 }}>earned</span>
      </div>

      <button className="btn-neon" style={{ borderColor: act.color, color: act.color }} onClick={onDismiss}>
        CONTINUE
      </button>
    </motion.div>
  );
}

// ─── History List ─────────────────────────────────────────────────────────────
function ActivityHistory({ log }) {
  if (!log || log.length === 0) {
    return <div style={{ textAlign: 'center', color: '#4a7a8a', fontSize: 12, padding: 20 }}>No sessions logged yet. Start your first activity!</div>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {log.slice(0, 20).map((s) => {
        const act = ACTIVITY_TYPES.find((a) => a.id === s.type) || ACTIVITY_TYPES[0];
        return (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: `${act.color}08`, border: `1px solid ${act.color}22` }}>
            <span style={{ fontSize: 20 }}>{act.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: '#e0f0ff', fontFamily: 'Rajdhani', fontWeight: 600 }}>{act.label}</div>
              <div style={{ fontSize: 10, color: '#4a7a8a' }}>{new Date(s.date).toLocaleDateString()} · {fmt(s.duration)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#ffaa00', fontFamily: 'Orbitron' }}>{s.calories} kcal</div>
              {s.distance > 0 && <div style={{ fontSize: 10, color: '#4488ff' }}>{(s.distance / 1000).toFixed(2)} km</div>}
              {s.steps > 0 && <div style={{ fontSize: 10, color: '#00ff88' }}>{s.steps.toLocaleString()} steps</div>}
              <div style={{ fontSize: 10, color: '#00ff88' }}>+{s.xpEarned} XP</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main ActivityModule ──────────────────────────────────────────────────────
export default function ActivityModule() {
  const { profile, liveSessionLog, logLiveSession } = useSystemStore();
  const weightKg = profile?.weight || 70;

  const [view, setView] = useState('select'); // select | active | summary | history
  const [selectedType, setSelectedType] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [gpsStatus, setGpsStatus] = useState('idle'); // idle | requesting | active | denied
  const [sets, setSets] = useState([]);
  const [lastSession, setLastSession] = useState(null);
  const [customLabel, setCustomLabel] = useState('');

  const timerRef = useRef(null);
  const gpsWatchRef = useRef(null);
  const lastPosRef = useRef(null);
  const startTimeRef = useRef(null);

  // ── Timer ──
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, isPaused]);

  // ── GPS ──
  const startGPS = useCallback(() => {
    if (!navigator.geolocation) { setGpsStatus('denied'); return; }
    setGpsStatus('requesting');
    gpsWatchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsStatus('active');
        const { latitude, longitude, speed: gpsSpeed } = pos.coords;
        setSpeed(gpsSpeed || 0);
        if (lastPosRef.current) {
          const d = haversine(lastPosRef.current.lat, lastPosRef.current.lon, latitude, longitude);
          if (d > 2 && d < 500) setDistance((prev) => prev + d); // filter GPS noise
        }
        lastPosRef.current = { lat: latitude, lon: longitude };
      },
      (err) => { setGpsStatus('denied'); },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
  }, []);

  const stopGPS = useCallback(() => {
    if (gpsWatchRef.current) navigator.geolocation.clearWatch(gpsWatchRef.current);
    gpsWatchRef.current = null;
    lastPosRef.current = null;
    setGpsStatus('idle');
  }, []);

  // ── Start Session ──
  const handleStart = (type) => {
    setSelectedType(type);
    setElapsed(0);
    setDistance(0);
    setSpeed(0);
    setSets([]);
    setIsRunning(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();
    setView('active');
    if (type.hasGPS) startGPS();
  };

  // ── Finish Session ──
  const handleFinish = () => {
    setIsRunning(false);
    setIsPaused(false);
    clearInterval(timerRef.current);
    if (selectedType?.hasGPS) stopGPS();

    const calories = calcCalories(selectedType.met, weightKg, elapsed);
    const steps = selectedType.hasGPS ? distanceToSteps(distance) : 0;

    // XP calculation: base + bonus for duration/distance
    let xp = 10;
    if (elapsed >= 1800) xp += 15; // 30+ min
    if (elapsed >= 3600) xp += 10; // 60+ min
    if (distance >= 1000) xp += 5; // 1+ km
    if (distance >= 5000) xp += 10; // 5+ km
    if (sets.length >= 5) xp += 10; // 5+ sets
    if (selectedType.id === 'study' && elapsed >= 3600) xp += 15; // 1hr study
    if (selectedType.id === 'hiit') xp += 5; // HIIT bonus

    const session = {
      id: Date.now(),
      type: selectedType.id,
      label: selectedType.id === 'custom' ? customLabel || 'Custom Activity' : selectedType.label,
      date: new Date().toISOString(),
      duration: elapsed,
      calories,
      distance: Math.round(distance),
      steps,
      sets: sets,
      xpEarned: xp,
    };

    logLiveSession(session, xp, selectedType.id);
    setLastSession(session);
    setView('summary');
  };

  // ── Discard ──
  const handleDiscard = () => {
    setIsRunning(false);
    setIsPaused(false);
    clearInterval(timerRef.current);
    if (selectedType?.hasGPS) stopGPS();
    setView('select');
    setSelectedType(null);
    setElapsed(0);
    setDistance(0);
    setSets([]);
  };

  const calories = selectedType ? calcCalories(selectedType.met, weightKg, elapsed) : 0;
  const steps = selectedType?.hasGPS ? distanceToSteps(distance) : 0;

  // ── RENDER: Select ──
  if (view === 'select') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 10, color: '#7ab8d4', letterSpacing: 3 }}>SELECT ACTIVITY</div>
          <button className="btn-neon" style={{ fontSize: 10, padding: '4px 10px' }} onClick={() => setView('history')}>
            HISTORY
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {ACTIVITY_TYPES.map((type) => (
            <motion.button
              key={type.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                if (type.id === 'custom') {
                  const label = window.prompt('Activity name:', 'Custom Activity');
                  if (label) { setCustomLabel(label); handleStart(type); }
                } else {
                  handleStart(type);
                }
              }}
              style={{
                padding: '14px 10px', cursor: 'pointer', textAlign: 'center',
                background: `${type.color}0d`, border: `1px solid ${type.color}33`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, width: 8, height: 8, borderTop: `2px solid ${type.color}`, borderLeft: `2px solid ${type.color}` }} />
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderBottom: `2px solid ${type.color}`, borderRight: `2px solid ${type.color}` }} />
              <span style={{ fontSize: 24 }}>{type.icon}</span>
              <span className="orbitron" style={{ fontSize: 10, color: type.color, letterSpacing: 1 }}>{type.label.toUpperCase()}</span>
              {type.hasGPS && <span style={{ fontSize: 8, color: '#4a7a8a', letterSpacing: 1 }}>📍 GPS</span>}
            </motion.button>
          ))}
        </div>

        <div style={{ padding: '8px 12px', background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.1)', fontSize: 10, color: '#4a7a8a', lineHeight: 1.6 }}>
          💡 GPS activities track real distance, steps & speed. Keep screen on for accurate tracking.
        </div>
      </div>
    );
  }

  // ── RENDER: Active Session ──
  if (view === 'active' && selectedType) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: `${selectedType.color}0d`, border: `1px solid ${selectedType.color}33` }}>
          <span style={{ fontSize: 24 }}>{selectedType.icon}</span>
          <div style={{ flex: 1 }}>
            <div className="orbitron" style={{ fontSize: 12, color: selectedType.color, letterSpacing: 2 }}>
              {selectedType.id === 'custom' ? customLabel.toUpperCase() : selectedType.label.toUpperCase()}
            </div>
            <div style={{ fontSize: 10, color: '#4a7a8a' }}>
              {isPaused ? '⏸ PAUSED' : isRunning ? '🔴 LIVE' : 'READY'}
            </div>
          </div>
          <div className="orbitron" style={{ fontSize: 20, color: selectedType.color, textShadow: `0 0 10px ${selectedType.color}` }}>
            {fmt(elapsed)}
          </div>
        </div>

        {/* Live tracker content */}
        {selectedType.hasGPS && (
          <GPSTracker actType={selectedType} weightKg={weightKg} elapsed={elapsed}
            distance={distance} speed={speed} steps={steps} calories={calories} gpsStatus={gpsStatus} />
        )}
        {selectedType.id === 'gym' && (
          <GymLiveSession weightKg={weightKg} elapsed={elapsed} sets={sets}
            onAddSet={(s) => setSets((prev) => [...prev, s])} />
        )}
        {(selectedType.id === 'study' || selectedType.id === 'task') && (
          <FocusTracker actType={selectedType} elapsed={elapsed} calories={calories} label={selectedType.label} />
        )}
        {!selectedType.hasGPS && selectedType.id !== 'gym' && selectedType.id !== 'study' && selectedType.id !== 'task' && (
          <GenericTracker actType={selectedType} weightKg={weightKg} elapsed={elapsed} calories={calories} />
        )}

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn-neon"
            style={{ flex: 1, borderColor: isPaused ? '#00ff88' : '#ffaa00', color: isPaused ? '#00ff88' : '#ffaa00', padding: '10px 0', fontSize: 12 }}
            onClick={() => setIsPaused((p) => !p)}
          >
            {isPaused ? <><Play size={14} style={{ display: 'inline', marginRight: 6 }} />RESUME</> : <><Pause size={14} style={{ display: 'inline', marginRight: 6 }} />PAUSE</>}
          </button>
          <button
            className="btn-neon"
            style={{ flex: 1, borderColor: '#00ff88', color: '#00ff88', padding: '10px 0', fontSize: 12 }}
            onClick={handleFinish}
          >
            <Square size={14} style={{ display: 'inline', marginRight: 6 }} />FINISH
          </button>
          <button
            className="btn-neon"
            style={{ borderColor: '#ff4466', color: '#ff4466', padding: '10px 14px', fontSize: 12 }}
            onClick={handleDiscard}
            title="Discard session"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  }

  // ── RENDER: Summary ──
  if (view === 'summary' && lastSession) {
    return (
      <SessionSummary
        session={lastSession}
        onDismiss={() => { setView('select'); setSelectedType(null); setLastSession(null); }}
      />
    );
  }

  // ── RENDER: History ──
  if (view === 'history') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 10, color: '#7ab8d4', letterSpacing: 3 }}>ACTIVITY HISTORY</div>
          <button className="btn-neon" style={{ fontSize: 10, padding: '4px 10px' }} onClick={() => setView('select')}>
            ← BACK
          </button>
        </div>
        <ActivityHistory log={liveSessionLog || []} />
      </div>
    );
  }

  return null;
}
