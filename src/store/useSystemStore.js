import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getRank, getNextRank, getXPForLevel, getLatestTitle, ACHIEVEMENTS } from '../lib/rankSystem';

const defaultProfile = {
  name: 'Hunter',
  level: 1,
  xp: 0,
  height: 175,
  weight: 70,
  avatar: null,
  totalXPEarned: 0,
  levelHistory: [], // [{ level, date, rank }]
};

const defaultStats = {
  strength: 10,
  discipline: 10,
  consistency: 10,
  intelligence: 10,
  innerPeace: 10,
};

const TRANSFORMATION_DEADLINE = '2026-12-31';

const defaultGymSchedule = {
  Mon: {
    type: 'Push', notes: 'Chest · Shoulders · Triceps — Focus on mind-muscle connection', completed: false,
    exercises: [
      { id: 'g1', name: 'Bench Press',          sets: 4, reps: 8,  weight: 0 },
      { id: 'g2', name: 'Incline Dumbbell Press',sets: 3, reps: 10, weight: 0 },
      { id: 'g3', name: 'Cable Fly',             sets: 3, reps: 12, weight: 0 },
      { id: 'g4', name: 'Overhead Press',        sets: 4, reps: 8,  weight: 0 },
      { id: 'g5', name: 'Lateral Raises',        sets: 3, reps: 15, weight: 0 },
      { id: 'g6', name: 'Tricep Pushdown',       sets: 3, reps: 12, weight: 0 },
      { id: 'g7', name: 'Overhead Tricep Ext',   sets: 3, reps: 12, weight: 0 },
    ],
  },
  Tue: {
    type: 'Pull', notes: 'Back · Biceps · Rear Delts — Pull with your elbows, not hands', completed: false,
    exercises: [
      { id: 'g8',  name: 'Deadlift',             sets: 4, reps: 6,  weight: 0 },
      { id: 'g9',  name: 'Pull-ups / Lat Pulldown', sets: 4, reps: 8, weight: 0 },
      { id: 'g10', name: 'Seated Cable Row',     sets: 3, reps: 10, weight: 0 },
      { id: 'g11', name: 'Face Pulls',           sets: 3, reps: 15, weight: 0 },
      { id: 'g12', name: 'Barbell Curl',         sets: 3, reps: 10, weight: 0 },
      { id: 'g13', name: 'Hammer Curl',          sets: 3, reps: 12, weight: 0 },
    ],
  },
  Wed: {
    type: 'Legs', notes: 'Quads · Hamstrings · Glutes · Calves — No skipping!', completed: false,
    exercises: [
      { id: 'g14', name: 'Squat',                sets: 4, reps: 8,  weight: 0 },
      { id: 'g15', name: 'Romanian Deadlift',    sets: 3, reps: 10, weight: 0 },
      { id: 'g16', name: 'Leg Press',            sets: 3, reps: 12, weight: 0 },
      { id: 'g17', name: 'Leg Curl',             sets: 3, reps: 12, weight: 0 },
      { id: 'g18', name: 'Leg Extension',        sets: 3, reps: 15, weight: 0 },
      { id: 'g19', name: 'Standing Calf Raise',  sets: 4, reps: 20, weight: 0 },
    ],
  },
  Thu: {
    type: 'Push', notes: 'Push Day 2 — Slightly higher reps, focus on pump', completed: false,
    exercises: [
      { id: 'g20', name: 'Incline Bench Press',  sets: 4, reps: 10, weight: 0 },
      { id: 'g21', name: 'Dumbbell Shoulder Press', sets: 3, reps: 10, weight: 0 },
      { id: 'g22', name: 'Pec Deck / Machine Fly', sets: 3, reps: 15, weight: 0 },
      { id: 'g23', name: 'Arnold Press',         sets: 3, reps: 12, weight: 0 },
      { id: 'g24', name: 'Lateral Raises',       sets: 4, reps: 15, weight: 0 },
      { id: 'g25', name: 'Skull Crushers',       sets: 3, reps: 12, weight: 0 },
    ],
  },
  Fri: {
    type: 'Pull', notes: 'Pull Day 2 — Focus on width and thickness', completed: false,
    exercises: [
      { id: 'g26', name: 'Weighted Pull-ups',    sets: 4, reps: 6,  weight: 0 },
      { id: 'g27', name: 'T-Bar Row',            sets: 4, reps: 8,  weight: 0 },
      { id: 'g28', name: 'Single Arm DB Row',    sets: 3, reps: 10, weight: 0 },
      { id: 'g29', name: 'Reverse Fly',          sets: 3, reps: 15, weight: 0 },
      { id: 'g30', name: 'Incline Curl',         sets: 3, reps: 12, weight: 0 },
      { id: 'g31', name: 'Concentration Curl',   sets: 3, reps: 12, weight: 0 },
    ],
  },
  Sat: {
    type: 'Cardio', notes: '20-30 min LISS cardio + Core work. Keep heart rate 120-140 bpm', completed: false,
    exercises: [
      { id: 'g32', name: 'Treadmill / Cycling',  sets: 1, reps: 1,  weight: 0 },
      { id: 'g33', name: 'Plank',                sets: 3, reps: 60, weight: 0 },
      { id: 'g34', name: 'Hanging Leg Raise',    sets: 3, reps: 15, weight: 0 },
      { id: 'g35', name: 'Cable Crunch',         sets: 3, reps: 15, weight: 0 },
      { id: 'g36', name: 'Russian Twist',        sets: 3, reps: 20, weight: 0 },
    ],
  },
  Sun: {
    type: 'Rest', notes: 'Full rest. Walk 20 min, stretch, foam roll. Eat clean, sleep 8h.', completed: false,
    exercises: [],
  },
};

const defaultStudyPlan = [
  { id: 's1', subject: 'KodTantra',    duration: 60,  timeSlot: '07:00', goal: '1 hour daily — non-negotiable', priority: 'High',   completed: false, progress: 0 },
  { id: 's2', subject: 'DSA Practice', duration: 45,  timeSlot: '08:00', goal: 'Solve 1-2 problems',            priority: 'High',   completed: false, progress: 0 },
  { id: 's3', subject: 'Project Work', duration: 60,  timeSlot: '20:00', goal: 'Build something real',          priority: 'Medium', completed: false, progress: 0 },
];

const defaultGoals = [
  {
    id: 'goal1', category: 'Physical', icon: '💪',
    title: 'Lean Aesthetic Transformation',
    description: 'Build visible muscle, reduce body fat, look aesthetic. PPL 5x/week + cardio Sat.',
    deadline: TRANSFORMATION_DEADLINE,
    milestones: [
      { id: 'm1', text: 'Complete first full week of PPL',         done: false },
      { id: 'm2', text: 'Hit 30-day gym streak',                   done: false },
      { id: 'm3', text: 'Visible shoulder definition',             done: false },
      { id: 'm4', text: 'Visible chest separation',                done: false },
      { id: 'm5', text: 'V-taper visible in mirror',               done: false },
      { id: 'm6', text: 'Arms 14+ inches',                         done: false },
      { id: 'm7', text: 'Complete 60-day transformation',          done: false },
      { id: 'm8', text: 'Full aesthetic physique by Dec 31 2026',  done: false },
    ],
    color: '#ff4466', progress: 0, pinned: true,
  },
  {
    id: 'goal2', category: 'Coding', icon: '💻',
    title: 'KodTantra — 1 Hour Daily',
    description: 'Complete KodTantra curriculum. 1 hour every single day without exception.',
    deadline: TRANSFORMATION_DEADLINE,
    milestones: [
      { id: 'm9',  text: '7-day KodTantra streak',                 done: false },
      { id: 'm10', text: '30-day KodTantra streak',                done: false },
      { id: 'm11', text: 'Complete Module 1',                      done: false },
      { id: 'm12', text: 'Complete Module 2',                      done: false },
      { id: 'm13', text: 'Build first project from learning',      done: false },
      { id: 'm14', text: 'Complete full curriculum',               done: false },
    ],
    color: '#aa88ff', progress: 0, pinned: true,
  },
  {
    id: 'goal3', category: 'Career', icon: '🚀',
    title: 'Land First Dev Role / Freelance Client',
    description: 'Build portfolio, apply consistently, land first paid opportunity.',
    deadline: TRANSFORMATION_DEADLINE,
    milestones: [
      { id: 'm15', text: 'Build 2 portfolio projects',             done: false },
      { id: 'm16', text: 'Deploy projects online',                 done: false },
      { id: 'm17', text: 'Create LinkedIn + GitHub profile',       done: false },
      { id: 'm18', text: 'Apply to 10 jobs / reach 5 clients',     done: false },
      { id: 'm19', text: 'Get first interview / response',         done: false },
      { id: 'm20', text: 'Land first opportunity',                 done: false },
    ],
    color: '#00f5ff', progress: 0, pinned: false,
  },
  {
    id: 'goal4', category: 'Mindset', icon: '🧠',
    title: 'Unshakeable Discipline & Mental Clarity',
    description: 'Meditate daily, journal, no distractions. Build the mind of a champion.',
    deadline: TRANSFORMATION_DEADLINE,
    milestones: [
      { id: 'm21', text: '21-day meditation streak',               done: false },
      { id: 'm22', text: 'Read 5 books',                           done: false },
      { id: 'm23', text: 'Zero social media for 7 days',           done: false },
      { id: 'm24', text: 'Morning routine perfect for 30 days',    done: false },
    ],
    color: '#ffaa00', progress: 0, pinned: false,
  },
  {
    id: 'goal5', category: 'Finance', icon: '💰',
    title: 'First Income from Skills',
    description: 'Monetize coding skills. Freelance, internship, or part-time.',
    deadline: TRANSFORMATION_DEADLINE,
    milestones: [
      { id: 'm25', text: 'Complete a paid project / internship',   done: false },
      { id: 'm26', text: 'Earn first ₹ from coding',               done: false },
    ],
    color: '#00ff88', progress: 0, pinned: false,
  },
];

const defaultTasks = {
  morning: [
    { id: 'wake',     title: 'Wake Up on Time',       completed: false },
    { id: 'hydrate',  title: 'Drink Water (500ml)',    completed: false },
    { id: 'brush',    title: 'Brush Teeth',            completed: false },
    { id: 'bath',     title: 'Bath / Shower',          completed: false },
    { id: 'stretch',  title: 'Morning Stretch (5 min)',completed: false },
    { id: 'meditate', title: 'Meditate (10 min)',       completed: false },
    { id: 'journal',  title: 'Morning Journal',        completed: false },
    { id: 'plan',     title: 'Plan the Day',           completed: false },
  ],
  evening: [
    { id: 'review',   title: 'Review the Day',         completed: false },
    { id: 'gratitude',title: 'Write 3 Gratitudes',     completed: false },
    { id: 'reading',  title: 'Read 20 Pages',          completed: false },
    { id: 'noscreen', title: 'No Screen 30 min before bed', completed: false },
    { id: 'sleep',    title: 'Sleep by 11 PM',         completed: false },
  ],
  daily: [],
  weekly: [],
};

const defaultSpirituality = {
  meditationLog: [],       // [{ date, duration, type, notes }]
  gratitudeLog: [],        // [{ date, entries: [string] }]
  affirmations: [
    'I am disciplined and consistent.',
    'Every day I grow stronger in mind, body, and spirit.',
    'I am in control of my thoughts and actions.',
  ],
  moodLog: [],             // [{ date, mood: 1-5, note }]
  reflectionLog: [],       // [{ date, text }]
  breathworkLog: [],       // [{ date, technique, duration }]
  meditationStreak: 0,
  lastMeditationDate: null,
};

const defaultHabits = [
  { id: 'gym',      name: 'Gym Session',       streak: 0, lastCompleted: null },
  { id: 'study',    name: 'Study Session',      streak: 0, lastCompleted: null },
  { id: 'reading',  name: 'Reading',            streak: 0, lastCompleted: null },
  { id: 'sleep',    name: 'Sleep by 11PM',      streak: 0, lastCompleted: null },
  { id: 'meditate', name: 'Meditation',         streak: 0, lastCompleted: null },
  { id: 'water',    name: 'Drink 3L Water',     streak: 0, lastCompleted: null },
  { id: 'nosugar',  name: 'No Junk Food',       streak: 0, lastCompleted: null },
  { id: 'gratitude',name: 'Gratitude Journal',  streak: 0, lastCompleted: null },
];

const generateDailyQuests = () => [
  { id: 'q1', title: 'Complete Morning Routine',    xp: 15, type: 'routine',      completed: false },
  { id: 'q2', title: 'Finish a Gym Session',        xp: 25, type: 'gym',          completed: false },
  { id: 'q3', title: 'Study for 1+ Hour',           xp: 20, type: 'study',        completed: false },
  { id: 'q4', title: 'Complete 3 Daily Tasks',      xp: 10, type: 'tasks',        completed: false },
  { id: 'q5', title: 'Maintain All Habits Today',   xp: 30, type: 'habits',       completed: false },
  { id: 'q6', title: 'Meditate Today',              xp: 15, type: 'spirituality', completed: false },
  { id: 'q7', title: 'Write Gratitude Journal',     xp: 10, type: 'spirituality', completed: false },
  { id: 'q8', title: 'Complete Evening Routine',    xp: 15, type: 'routine',      completed: false },
];

export const useSystemStore = create(
  persist(
    (set, get) => ({
      profile: defaultProfile,
      stats: defaultStats,
      gymSchedule: defaultGymSchedule,
      studyPlan: defaultStudyPlan,
      tasks: defaultTasks,
      habits: defaultHabits,
      spirituality: defaultSpirituality,
      notifications: [],
      activeModule: null,
      pomodoroActive: false,
      dailyQuests: generateDailyQuests(),
      questDate: new Date().toDateString(),
      weightLog: [],
      personalRecords: [],   // [{ exercise, weight, reps, date }]
      cardioLog: [],         // [{ date, type, duration, distance, calories }]
      liveSessionLog: [],    // [{ id, type, label, date, duration, calories, distance, steps, sets, xpEarned }]
      waterLog: [],          // [{ date, glasses }]
      sleepLog: [],          // [{ date, hours, quality: 1-5 }]
      studyResources: [],    // [{ subject, url, title, notes }]
      activityLog: [],
      habitGridLog: {},  // { 'YYYY-MM': { [habitId]: { [day]: true } } }
      goals: defaultGoals,
      todayXP: 0,
      todayTasks: 0,
      todayStudyMins: 0,
      unlockedAchievements: [],
      rankUpPending: null,
      xpMultiplier: 1.0,
      floatingXP: [],
      weeklyReportSeen: null,

      setActiveModule: (module) => set({ activeModule: module }),

      updateProfile: (data) =>
        set((s) => ({ profile: { ...s.profile, ...data } })),

      gainXP: (amount, reason) => {
        const { profile, xpMultiplier } = get();
        const finalAmount = Math.round(amount * (xpMultiplier || 1));
        let newXP = profile.xp + finalAmount;
        let newLevel = profile.level;
        let leveledUp = false;
        let rankedUp = false;
        const prevRank = getRank(newLevel);
        const levelHistory = [...(profile.levelHistory || [])];

        while (newXP >= getXPForLevel(newLevel)) {
          newXP -= getXPForLevel(newLevel);
          newLevel++;
          leveledUp = true;
          levelHistory.unshift({ level: newLevel, date: new Date().toLocaleDateString(), rank: getRank(newLevel).label });
        }

        const newRank = getRank(newLevel);
        if (leveledUp && newRank.id !== prevRank.id) rankedUp = true;

        const newNotifications = [
          { id: Date.now(), text: `+${finalAmount} XP — ${reason}${xpMultiplier > 1 ? ` (${xpMultiplier}x BONUS!)` : ''}`, type: 'xp' },
        ];
        if (leveledUp) newNotifications.push({ id: Date.now() + 1, text: `LEVEL UP! Now Level ${newLevel} · ${newRank.label}`, type: 'levelup' });
        if (rankedUp)  newNotifications.push({ id: Date.now() + 2, text: `RANK UP! You are now ${newRank.label} — "${newRank.title}"`, type: 'rankup' });

        // Spawn floating XP number
        const floatId = Date.now();
        set((s) => ({
          profile: {
            ...s.profile, xp: newXP, level: newLevel,
            totalXPEarned: (s.profile.totalXPEarned || 0) + finalAmount,
            levelHistory: levelHistory.slice(0, 50),
          },
          todayXP: s.todayXP + finalAmount,
          rankUpPending: rankedUp ? newRank : s.rankUpPending,
          notifications: [...newNotifications, ...s.notifications.slice(0, 3)],
          floatingXP: [...(s.floatingXP || []), { id: floatId, amount: finalAmount }].slice(-5),
        }));

        // Auto-remove floating XP after 2s
        setTimeout(() => {
          set((s) => ({ floatingXP: (s.floatingXP || []).filter((f) => f.id !== floatId) }));
        }, 2000);

        get().checkAchievements();
        get().updateAdaptiveDifficulty();
      },

      clearRankUp: () => set({ rankUpPending: null }),

      // ── Adaptive Difficulty ───────────────────────────────────────────────
      updateAdaptiveDifficulty: () => {
        const { activityLog, habits, sleepLog } = get();
        const last7 = activityLog.slice(0, 7);
        if (last7.length < 3) return;

        const avgXP = last7.reduce((a, d) => a + (d.xpGained || 0), 0) / last7.length;
        const avgTasks = last7.reduce((a, d) => a + (d.tasksCompleted || 0), 0) / last7.length;
        const topStreak = Math.max(...habits.map((h) => h.streak || 0), 0);

        let multiplier = 1.0;
        if (topStreak >= 14 && avgXP > 80) multiplier = 1.5;
        else if (topStreak >= 7 && avgXP > 50) multiplier = 1.25;
        else if (avgXP < 20 || avgTasks < 2) multiplier = 0.8; // comeback mode

        set({ xpMultiplier: multiplier });
      },

      // ── Smart AI Suggestions ──────────────────────────────────────────────
      getSmartSuggestions: () => {
        const { sleepLog, habits, activityLog, stats, todayStudyMins, gymSchedule } = get();
        const suggestions = [];
        const today = new Date();
        const dayName = today.toLocaleDateString('en-US', { weekday: 'short' });

        // Sleep-based suggestion
        const lastSleep = sleepLog?.[0];
        if (lastSleep) {
          if (lastSleep.hours < 6) {
            suggestions.push({ icon: '😴', text: 'You slept under 6h — reduce workout intensity today. Focus on recovery.', type: 'warning' });
          } else if (lastSleep.hours >= 8) {
            suggestions.push({ icon: '⚡', text: 'Great sleep! Your body is primed — push harder in the gym today.', type: 'boost' });
          }
        }

        // Streak-based
        const gymHabit = habits?.find((h) => h.id === 'gym');
        if (gymHabit?.streak >= 5) {
          suggestions.push({ icon: '🔥', text: `${gymHabit.streak}-day gym streak! Consider a deload this week to avoid burnout.`, type: 'info' });
        }
        if (gymHabit?.streak === 0 && gymHabit?.lastCompleted) {
          suggestions.push({ icon: '💪', text: 'Streak broken — but today is a new start. Get back in the gym.', type: 'warning' });
        }

        // Study suggestion
        if (todayStudyMins === 0 && today.getHours() >= 10) {
          suggestions.push({ icon: '📚', text: 'KodTantra not done yet — 1 hour minimum. Open it now.', type: 'warning' });
        }

        // Weekend pattern
        const last7 = activityLog?.slice(0, 7) || [];
        const weekendDays = last7.filter((d) => {
          const day = new Date(d.date).getDay();
          return day === 0 || day === 6;
        });
        const weekdayDays = last7.filter((d) => {
          const day = new Date(d.date).getDay();
          return day > 0 && day < 6;
        });
        const weekendAvg = weekendDays.length ? weekendDays.reduce((a, d) => a + (d.xpGained || 0), 0) / weekendDays.length : null;
        const weekdayAvg = weekdayDays.length ? weekdayDays.reduce((a, d) => a + (d.xpGained || 0), 0) / weekdayDays.length : null;
        if (weekendAvg !== null && weekdayAvg !== null && weekendAvg < weekdayAvg * 0.5) {
          suggestions.push({ icon: '📉', text: 'Your consistency drops on weekends. Plan weekend tasks in advance.', type: 'insight' });
        }

        // Stat weakness
        const minStat = Object.entries(stats || {}).sort((a, b) => a[1] - b[1])[0];
        if (minStat && minStat[1] < 20) {
          const statNames = { strength: 'Gym', discipline: 'Daily Tasks', consistency: 'Quests', intelligence: 'Study', innerPeace: 'Meditation' };
          suggestions.push({ icon: '⚠️', text: `${minStat[0]} is your weakest stat (${minStat[1]}). Focus on ${statNames[minStat[0]]} today.`, type: 'insight' });
        }

        // Today's gym day
        const todayGym = gymSchedule?.[dayName];
        if (todayGym && todayGym.type !== 'Rest' && !todayGym.completed) {
          suggestions.push({ icon: '🏋️', text: `Today is ${todayGym.type} day — ${todayGym.exercises?.length || 0} exercises planned.`, type: 'info' });
        }

        return suggestions.slice(0, 4);
      },

      updateStat: (stat, delta) =>
        set((s) => ({
          stats: { ...s.stats, [stat]: Math.min(100, Math.max(0, s.stats[stat] + delta)) },
        })),

      // Gym
      updateGymDay: (day, data) =>
        set((s) => ({
          gymSchedule: { ...s.gymSchedule, [day]: { ...s.gymSchedule[day], ...data } },
        })),

      addExercise: (day, exercise) =>
        set((s) => ({
          gymSchedule: {
            ...s.gymSchedule,
            [day]: {
              ...s.gymSchedule[day],
              exercises: [...s.gymSchedule[day].exercises, { id: Date.now(), ...exercise }],
            },
          },
        })),

      removeExercise: (day, id) =>
        set((s) => ({
          gymSchedule: {
            ...s.gymSchedule,
            [day]: {
              ...s.gymSchedule[day],
              exercises: s.gymSchedule[day].exercises.filter((e) => e.id !== id),
            },
          },
        })),

      completeGymDay: (day) => {
        get().gainXP(20, 'Gym Session Completed');
        get().updateStat('strength', 2);
        get().updateStat('discipline', 1);
        get().updateHabitStreak('gym');
        get().completeQuest('q2');
        set((s) => ({
          gymSchedule: { ...s.gymSchedule, [day]: { ...s.gymSchedule[day], completed: true } },
        }));
      },

      updateGymNotes: (day, notes) =>
        set((s) => ({
          gymSchedule: { ...s.gymSchedule, [day]: { ...s.gymSchedule[day], notes } },
        })),

      addPersonalRecord: (record) =>
        set((s) => ({
          personalRecords: [{ id: Date.now(), date: new Date().toLocaleDateString(), ...record }, ...s.personalRecords.slice(0, 49)],
        })),

      logCardio: (entry) =>
        set((s) => ({
          cardioLog: [{ id: Date.now(), date: new Date().toLocaleDateString(), ...entry }, ...s.cardioLog.slice(0, 49)],
        })),

      // Live Activity Session
      logLiveSession: (session, xpAmount, activityType) => {
        // Save session to log
        set((s) => ({
          liveSessionLog: [session, ...(s.liveSessionLog || []).slice(0, 99)],
        }));
        // Award XP
        get().gainXP(xpAmount, `${session.label} Session`);
        // Stat boosts based on activity type
        if (activityType === 'gym' || activityType === 'hiit') {
          get().updateStat('strength', 2);
          get().updateStat('discipline', 1);
          get().updateHabitStreak('gym');
          get().completeQuest('q2');
        } else if (activityType === 'walk' || activityType === 'run' || activityType === 'cycle' || activityType === 'swim') {
          get().updateStat('strength', 1);
          get().updateStat('discipline', 1);
          // Also log to cardioLog for existing cardio history
          set((s) => ({
            cardioLog: [
              { id: Date.now(), date: new Date().toLocaleDateString(), type: session.label, duration: Math.round(session.duration / 60), distance: (session.distance / 1000).toFixed(2), calories: session.calories },
              ...s.cardioLog.slice(0, 49),
            ],
          }));
        } else if (activityType === 'study') {
          get().updateStat('intelligence', 2);
          get().updateStat('discipline', 1);
          get().updateHabitStreak('study');
          set((s) => ({ todayStudyMins: s.todayStudyMins + Math.round(session.duration / 60) }));
          if (session.duration >= 3600) get().completeQuest('q3');
        } else if (activityType === 'yoga') {
          get().updateStat('innerPeace', 2);
          get().updateStat('discipline', 1);
        } else if (activityType === 'task') {
          get().updateStat('discipline', 2);
        } else {
          get().updateStat('discipline', 1);
        }
      },

      // Study
      addStudyBlock: (block) =>
        set((s) => ({ studyPlan: [...s.studyPlan, { id: Date.now(), ...block }] })),

      removeStudyBlock: (id) =>
        set((s) => ({ studyPlan: s.studyPlan.filter((b) => b.id !== id) })),

      updateStudyBlockProgress: (id, progress) =>
        set((s) => ({
          studyPlan: s.studyPlan.map((b) => b.id === id ? { ...b, progress } : b),
        })),

      addStudyResource: (resource) =>
        set((s) => ({
          studyResources: [{ id: Date.now(), ...resource }, ...s.studyResources],
        })),

      removeStudyResource: (id) =>
        set((s) => ({ studyResources: s.studyResources.filter((r) => r.id !== id) })),

      completeStudyBlock: (id) => {
        const existing = get().studyPlan.find((b) => b.id === id);
        if (!existing || existing.completed) return; // guard against double-complete
        get().gainXP(15, 'Study Session Completed');
        get().updateStat('intelligence', 2);
        get().updateStat('discipline', 1);
        get().updateHabitStreak('study');
        set((s) => ({
          studyPlan: s.studyPlan.map((b) => (b.id === id ? { ...b, completed: true } : b)),
          todayStudyMins: s.todayStudyMins + (s.studyPlan.find((b) => b.id === id)?.duration || 0),
        }));
        // check study quest
        const plan = get().studyPlan;
        const block = plan.find((b) => b.id === id);
        if (block && block.duration >= 60) get().completeQuest('q3');
      },

      // Tasks
      toggleTask: (category, id) => {
        const task = get().tasks[category]?.find((t) => t.id === id);
        const wasCompleted = task?.completed;
        set((s) => ({
          tasks: {
            ...s.tasks,
            [category]: s.tasks[category].map((t) =>
              t.id === id ? { ...t, completed: !t.completed } : t
            ),
          },
        }));
        if (!wasCompleted) {
          get().gainXP(5, 'Task Completed');
          get().updateStat('discipline', 1);
          set((s) => ({ todayTasks: s.todayTasks + 1 }));
          // check tasks quest (morning + daily combined)
          const allTasks = [...(get().tasks.morning || []), ...(get().tasks.daily || [])];
          const doneCount = allTasks.filter((t) => t.completed).length;
          if (doneCount >= 3) get().completeQuest('q4');
          // morning routine quest — only check when toggling a morning task
          if (category === 'morning') {
            const morningAll = get().tasks.morning || [];
            if (morningAll.length > 0 && morningAll.every((t) => t.completed)) {
              get().completeQuest('q1');
            }
          }
          // evening routine quest
          if (category === 'evening') {
            const eveningAll = get().tasks.evening || [];
            if (eveningAll.length > 0 && eveningAll.every((t) => t.completed)) {
              get().completeQuest('q8');
            }
          }
        }
      },

      addTask: (category, title) =>
        set((s) => ({
          tasks: {
            ...s.tasks,
            [category]: [...(s.tasks[category] || []), { id: Date.now(), title, completed: false }],
          },
        })),

      removeTask: (category, id) =>
        set((s) => ({
          tasks: {
            ...s.tasks,
            [category]: s.tasks[category].filter((t) => t.id !== id),
          },
        })),

      logWater: (glasses) =>
        set((s) => ({
          waterLog: [{ date: new Date().toLocaleDateString(), glasses }, ...s.waterLog.slice(0, 29)],
        })),

      logSleep: (entry) =>
        set((s) => ({
          sleepLog: [{ date: new Date().toLocaleDateString(), ...entry }, ...s.sleepLog.slice(0, 29)],
        })),

      // Habits
      updateHabitStreak: (habitId) => {
        const today = new Date().toDateString();
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id !== habitId) return h;
            const lastDate = h.lastCompleted ? new Date(h.lastCompleted).toDateString() : null;
            if (lastDate === today) return h;
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            const newStreak = lastDate === yesterday ? h.streak + 1 : 1;
            return { ...h, streak: newStreak, lastCompleted: new Date().toISOString() };
          }),
        }));
      },

      addHabit: (name) =>
        set((s) => ({
          habits: [...s.habits, { id: Date.now().toString(), name, streak: 0, lastCompleted: null }],
        })),

      removeHabit: (id) =>
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),

      // Monthly habit grid: toggle a specific day for a habit
      toggleHabitGrid: (habitId, monthKey, day) => {
        // Read BEFORE toggling to know if we're checking or unchecking
        const gridBefore = (get().habitGridLog || {});
        const wasChecked = !!(gridBefore[monthKey]?.[habitId]?.[day]);

        set((s) => {
          const grid = s.habitGridLog || {};
          const month = grid[monthKey] || {};
          const habit = month[habitId] || {};
          const newHabit = { ...habit, [day]: !wasChecked };
          const newMonth = { ...month, [habitId]: newHabit };
          return { habitGridLog: { ...grid, [monthKey]: newMonth } };
        });

        // Only award XP when checking (not unchecking)
        if (!wasChecked) {
          get().gainXP(3, 'Habit Tracked');
          get().updateStat('consistency', 1);
        }
      },

      // ── Spirituality ──────────────────────────────────────────────────────
      logMeditation: (entry) => {
        const today = new Date().toDateString();
        get().gainXP(15, 'Meditation Completed');
        get().updateStat('innerPeace', 3);
        get().updateStat('discipline', 1);
        get().updateHabitStreak('meditate');
        get().completeQuest('q6');
        set((s) => {
          const lastDate = s.spirituality.lastMeditationDate;
          const yesterday = new Date(Date.now() - 86400000).toDateString();
          const newStreak = lastDate === yesterday || lastDate === today
            ? s.spirituality.meditationStreak + (lastDate === today ? 0 : 1)
            : 1;
          return {
            spirituality: {
              ...s.spirituality,
              meditationLog: [{ id: Date.now(), date: today, ...entry }, ...s.spirituality.meditationLog.slice(0, 49)],
              meditationStreak: newStreak,
              lastMeditationDate: today,
            },
          };
        });
      },

      logGratitude: (entries) => {
        const today = new Date().toDateString();
        get().gainXP(10, 'Gratitude Journal Written');
        get().updateStat('innerPeace', 2);
        get().updateHabitStreak('gratitude');
        get().completeQuest('q7');
        set((s) => ({
          spirituality: {
            ...s.spirituality,
            gratitudeLog: [{ id: Date.now(), date: today, entries }, ...s.spirituality.gratitudeLog.slice(0, 49)],
          },
        }));
      },

      logMood: (mood, note = '') =>
        set((s) => ({
          spirituality: {
            ...s.spirituality,
            moodLog: [{ id: Date.now(), date: new Date().toDateString(), mood, note }, ...s.spirituality.moodLog.slice(0, 49)],
          },
        })),

      logReflection: (text) => {
        get().gainXP(8, 'Daily Reflection Written');
        get().updateStat('innerPeace', 1);
        set((s) => ({
          spirituality: {
            ...s.spirituality,
            reflectionLog: [{ id: Date.now(), date: new Date().toDateString(), text }, ...s.spirituality.reflectionLog.slice(0, 49)],
          },
        }));
      },

      logBreathwork: (entry) => {
        get().gainXP(10, 'Breathwork Session');
        get().updateStat('innerPeace', 2);
        set((s) => ({
          spirituality: {
            ...s.spirituality,
            breathworkLog: [{ id: Date.now(), date: new Date().toDateString(), ...entry }, ...s.spirituality.breathworkLog.slice(0, 49)],
          },
        }));
      },

      addAffirmation: (text) =>
        set((s) => ({
          spirituality: {
            ...s.spirituality,
            affirmations: [...s.spirituality.affirmations, text],
          },
        })),

      removeAffirmation: (index) =>
        set((s) => ({
          spirituality: {
            ...s.spirituality,
            affirmations: s.spirituality.affirmations.filter((_, i) => i !== index),
          },
        })),

      // ── Goals ────────────────────────────────────────────────────────────
      addGoal: (goal) =>
        set((s) => ({ goals: [...s.goals, { id: Date.now().toString(), milestones: [], progress: 0, pinned: false, ...goal }] })),

      updateGoal: (id, data) =>
        set((s) => ({ goals: s.goals.map((g) => g.id === id ? { ...g, ...data } : g) })),

      removeGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      toggleMilestone: (goalId, milestoneId) => {
        set((s) => {
          const goals = s.goals.map((g) => {
            if (g.id !== goalId) return g;
            const milestones = g.milestones.map((m) =>
              m.id === milestoneId ? { ...m, done: !m.done } : m
            );
            const progress = Math.round((milestones.filter((m) => m.done).length / milestones.length) * 100);
            return { ...g, milestones, progress };
          });
          return { goals };
        });
        const goal = get().goals.find((g) => g.id === goalId);
        const ms = goal?.milestones.find((m) => m.id === milestoneId);
        if (ms && !ms.done) {
          get().gainXP(20, `Milestone: ${ms.text.slice(0, 30)}`);
          get().updateStat('consistency', 2);
        }
      },

      addMilestone: (goalId, text) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId
              ? { ...g, milestones: [...g.milestones, { id: Date.now().toString(), text, done: false }] }
              : g
          ),
        })),

      pinGoal: (id) =>
        set((s) => ({ goals: s.goals.map((g) => g.id === id ? { ...g, pinned: !g.pinned } : g) })),

      checkAchievements: () => {
        const state = get();
        const newlyUnlocked = ACHIEVEMENTS.filter(
          (a) => !state.unlockedAchievements.includes(a.id) && a.condition(state)
        );
        if (newlyUnlocked.length === 0) return;
        set((s) => ({
          unlockedAchievements: [...s.unlockedAchievements, ...newlyUnlocked.map((a) => a.id)],
          notifications: [
            ...newlyUnlocked.map((a, i) => ({
              id: Date.now() + 100 + i,
              text: `Achievement Unlocked: ${a.label}`,
              type: 'achievement',
            })),
            ...s.notifications.slice(0, 2),
          ],
        }));
      },

      // Daily Quests
      completeQuest: (questId) => {
        const quest = get().dailyQuests.find((q) => q.id === questId);
        if (!quest || quest.completed) return;
        get().gainXP(quest.xp, `Quest: ${quest.title}`);
        get().updateStat('consistency', 2);
        set((s) => ({
          dailyQuests: s.dailyQuests.map((q) => q.id === questId ? { ...q, completed: true } : q),
        }));
      },

      refreshDailyQuests: () => {
        const today = new Date().toDateString();
        const { questDate } = get();
        if (questDate !== today) {
          // save yesterday's activity
          set((s) => ({
            dailyQuests: generateDailyQuests(),
            questDate: today,
            activityLog: [
              { date: s.questDate, xpGained: s.todayXP, tasksCompleted: s.todayTasks, studyMins: s.todayStudyMins },
              ...s.activityLog.slice(0, 29),
            ],
            todayXP: 0,
            todayTasks: 0,
            todayStudyMins: 0,
          }));
        }
      },

      // Weight log
      logWeight: (weight) =>
        set((s) => ({
          weightLog: [
            { date: new Date().toLocaleDateString(), weight: Number(weight) },
            ...s.weightLog.slice(0, 29),
          ],
          profile: { ...s.profile, weight: Number(weight) },
        })),

      dismissNotification: (id) =>
        set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

      resetDailyTasks: () =>
        set((s) => ({
          tasks: {
            ...s.tasks,
            morning: s.tasks.morning.map((t) => ({ ...t, completed: false })),
            evening: (s.tasks.evening || []).map((t) => ({ ...t, completed: false })),
            daily: s.tasks.daily.map((t) => ({ ...t, completed: false })),
          },
          gymSchedule: Object.fromEntries(
            Object.entries(s.gymSchedule).map(([d, v]) => [d, { ...v, completed: false }])
          ),
        })),
    }),
    { 
      name: 'solo-leveling-system',
      version: 6,
      migrate: (persistedState, version) => {
        // Always return fresh defaults merged with persisted profile/stats/logs
        // so new fields never come up undefined
        const s = persistedState || {};
        return {
          ...s,
          // preserve user data
          profile: { ...defaultProfile, ...(s.profile || {}) },
          stats: { ...defaultStats, ...(s.stats || {}) },
          weightLog: s.weightLog || [],
          personalRecords: s.personalRecords || [],
          cardioLog: s.cardioLog || [],
          liveSessionLog: s.liveSessionLog || [],
          waterLog: s.waterLog || [],
          sleepLog: s.sleepLog || [],
          activityLog: s.activityLog || [],
          unlockedAchievements: s.unlockedAchievements || [],
          todayXP: s.todayXP || 0,
          todayTasks: s.todayTasks || 0,
          todayStudyMins: s.todayStudyMins || 0,
          // reset structural data to defaults so new shape is always correct
          gymSchedule: defaultGymSchedule,
          studyPlan: s.studyPlan?.length ? s.studyPlan : defaultStudyPlan,
          tasks: {
            morning: defaultTasks.morning,
            evening: defaultTasks.evening,
            daily: s.tasks?.daily || [],
            weekly: s.tasks?.weekly || [],
          },
          habits: s.habits?.length ? s.habits : defaultHabits,
          spirituality: s.spirituality ? {
            ...defaultSpirituality,
            ...s.spirituality,
          } : defaultSpirituality,
          goals: s.goals?.length ? s.goals : defaultGoals,
          dailyQuests: s.questDate === new Date().toDateString()
            ? (s.dailyQuests || generateDailyQuests())
            : generateDailyQuests(),
          questDate: s.questDate || new Date().toDateString(),
          studyResources: s.studyResources || [],
          habitGridLog: s.habitGridLog || {},
          notifications: [],
          rankUpPending: null,
          xpMultiplier: 1.0,
          floatingXP: [],
          weeklyReportSeen: null,
          activeModule: null,
        };
      },
    }
  )
);
