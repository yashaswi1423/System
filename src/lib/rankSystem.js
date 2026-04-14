// ─── RANK SYSTEM ────────────────────────────────────────────────────────────
// Level 1–24    → E-Rank
// Level 25–49   → D-Rank
// Level 50–74   → C-Rank
// Level 75–99   → B-Rank
// Level 100–124 → A-Rank
// Level 125–149 → S-Rank
// Level 150–199 → SS-Rank
// Level 200+    → National Level Hunter

export const RANKS = [
  {
    id: 'E',
    label: 'E-Rank',
    minLevel: 1,
    maxLevel: 24,
    color: '#888888',
    glowColor: 'rgba(136,136,136,0.4)',
    bgColor: 'rgba(136,136,136,0.08)',
    icon: '◇',
    title: 'Awakened',
    description: 'You have just awakened. The journey begins.',
    xpPerLevel: 100,
  },
  {
    id: 'D',
    label: 'D-Rank',
    minLevel: 25,
    maxLevel: 49,
    color: '#4488ff',
    glowColor: 'rgba(68,136,255,0.4)',
    bgColor: 'rgba(68,136,255,0.08)',
    icon: '◈',
    title: 'Novice Hunter',
    description: 'Your potential is beginning to show.',
    xpPerLevel: 150,
  },
  {
    id: 'C',
    label: 'C-Rank',
    minLevel: 50,
    maxLevel: 74,
    color: '#00ff88',
    glowColor: 'rgba(0,255,136,0.4)',
    bgColor: 'rgba(0,255,136,0.08)',
    icon: '◆',
    title: 'Rising Hunter',
    description: 'Discipline and consistency are forging you.',
    xpPerLevel: 200,
  },
  {
    id: 'B',
    label: 'B-Rank',
    minLevel: 75,
    maxLevel: 99,
    color: '#aa44ff',
    glowColor: 'rgba(170,68,255,0.4)',
    bgColor: 'rgba(170,68,255,0.08)',
    icon: '❖',
    title: 'Elite Hunter',
    description: 'Few reach this level. You are among the elite.',
    xpPerLevel: 300,
  },
  {
    id: 'A',
    label: 'A-Rank',
    minLevel: 100,
    maxLevel: 124,
    color: '#ff8800',
    glowColor: 'rgba(255,136,0,0.4)',
    bgColor: 'rgba(255,136,0,0.08)',
    icon: '★',
    title: 'High Hunter',
    description: 'You stand above the masses. Power flows through you.',
    xpPerLevel: 500,
  },
  {
    id: 'S',
    label: 'S-Rank',
    minLevel: 125,
    maxLevel: 149,
    color: '#ffd700',
    glowColor: 'rgba(255,215,0,0.5)',
    bgColor: 'rgba(255,215,0,0.1)',
    icon: '⚡',
    title: 'Shadow Monarch',
    description: 'Legendary. Your name is known across the system.',
    xpPerLevel: 800,
  },
  {
    id: 'SS',
    label: 'SS-Rank',
    minLevel: 150,
    maxLevel: 199,
    color: '#ff4466',
    glowColor: 'rgba(255,68,102,0.5)',
    bgColor: 'rgba(255,68,102,0.1)',
    icon: '👁',
    title: 'Monarch',
    description: 'You have transcended ordinary limits.',
    xpPerLevel: 1200,
  },
  {
    id: 'NLH',
    label: 'National Level',
    minLevel: 200,
    maxLevel: Infinity,
    color: '#ffffff',
    glowColor: 'rgba(255,255,255,0.6)',
    bgColor: 'rgba(255,255,255,0.08)',
    icon: '♾',
    title: 'National Level Hunter',
    description: 'You are a force of nature. The system bows to you.',
    xpPerLevel: 2000,
  },
];

export const getRank = (level) => {
  return RANKS.find((r) => level >= r.minLevel && level <= r.maxLevel) || RANKS[RANKS.length - 1];
};

export const getXPForLevel = (level) => {
  const rank = getRank(level);
  return rank.xpPerLevel;
};

export const getNextRank = (level) => {
  const currentRank = getRank(level);
  const idx = RANKS.findIndex((r) => r.id === currentRank.id);
  return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
};

export const getLevelsToNextRank = (level) => {
  const rank = getRank(level);
  if (rank.maxLevel === Infinity) return null;
  return rank.maxLevel - level + 1;
};

// ─── TITLES ─────────────────────────────────────────────────────────────────
export const TITLES = [
  { id: 't1',  level: 1,   label: 'The Awakened',         color: '#888' },
  { id: 't2',  level: 5,   label: 'First Steps',          color: '#4488ff' },
  { id: 't3',  level: 10,  label: 'Persistent One',       color: '#4488ff' },
  { id: 't4',  level: 25,  label: 'D-Rank Ascendant',     color: '#4488ff' },
  { id: 't5',  level: 30,  label: 'Iron Will',            color: '#00ff88' },
  { id: 't6',  level: 50,  label: 'C-Rank Ascendant',     color: '#00ff88' },
  { id: 't7',  level: 60,  label: 'Unbreakable',          color: '#00ff88' },
  { id: 't8',  level: 75,  label: 'B-Rank Ascendant',     color: '#aa44ff' },
  { id: 't9',  level: 90,  label: 'Shadow Walker',        color: '#aa44ff' },
  { id: 't10', level: 100, label: 'A-Rank Ascendant',     color: '#ff8800' },
  { id: 't11', level: 110, label: 'Apex Predator',        color: '#ff8800' },
  { id: 't12', level: 125, label: 'S-Rank Ascendant',     color: '#ffd700' },
  { id: 't13', level: 140, label: 'Sovereign',            color: '#ffd700' },
  { id: 't14', level: 150, label: 'SS-Rank Ascendant',    color: '#ff4466' },
  { id: 't15', level: 175, label: 'Monarch of Shadows',   color: '#ff4466' },
  { id: 't16', level: 200, label: 'National Level Hunter', color: '#ffffff' },
];

export const getUnlockedTitles = (level) => TITLES.filter((t) => level >= t.level);
export const getLatestTitle = (level) => {
  const unlocked = getUnlockedTitles(level);
  return unlocked[unlocked.length - 1] || TITLES[0];
};

// ─── ACHIEVEMENTS ────────────────────────────────────────────────────────────
export const ACHIEVEMENTS = [
  { id: 'a1',  label: 'First Blood',       desc: 'Complete your first task',          icon: '⚔', condition: (s) => s.todayTasks >= 1 },
  { id: 'a2',  label: 'Early Riser',       desc: 'Complete morning routine',          icon: '🌅', condition: (s) => s.tasks.morning?.every((t) => t.completed) },
  { id: 'a3',  label: 'Iron Body',         desc: 'Complete 7 gym sessions',           icon: '💪', condition: (s) => s.stats.strength >= 24 },
  { id: 'a4',  label: 'Scholar',           desc: 'Study for 10+ hours total',         icon: '📚', condition: (s) => s.todayStudyMins >= 60 },
  { id: 'a5',  label: 'Streak Master',     desc: 'Reach a 7-day streak on any habit', icon: '🔥', condition: (s) => s.habits.some((h) => h.streak >= 7) },
  { id: 'a6',  label: 'Centurion',         desc: 'Reach Level 10',                    icon: '🏆', condition: (s) => s.profile.level >= 10 },
  { id: 'a7',  label: 'D-Rank Hunter',     desc: 'Reach Level 25',                    icon: '◈', condition: (s) => s.profile.level >= 25 },
  { id: 'a8',  label: 'C-Rank Hunter',     desc: 'Reach Level 50',                    icon: '◆', condition: (s) => s.profile.level >= 50 },
  { id: 'a9',  label: 'Disciplined Mind',  desc: 'Discipline stat reaches 50',        icon: '🛡', condition: (s) => s.stats.discipline >= 50 },
  { id: 'a10', label: 'Zen Master',        desc: 'Inner Peace reaches 50',            icon: '☯', condition: (s) => s.stats.innerPeace >= 50 },
  { id: 'a11', label: 'Quest Slayer',      desc: 'Complete all daily quests',         icon: '📜', condition: (s) => s.dailyQuests?.every((q) => q.completed) },
  { id: 'a12', label: 'S-Rank Hunter',     desc: 'Reach Level 125',                   icon: '⚡', condition: (s) => s.profile.level >= 125 },
];
