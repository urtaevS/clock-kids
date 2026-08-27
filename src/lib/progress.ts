import { Preferences } from '@capacitor/preferences';
import { useCallback, useEffect, useRef, useState } from 'react';
import { playAchievement } from './sounds';
import type { Progress, ClockSkill } from '../types';
import { ACHIEVEMENTS } from './achievements';

const KEY = 'clock-kids-progress-v1';

const DEFAULT: Progress = {
  stars: 0, streak: 0, bestStreak: 0,
  answersCorrect: 0, answersTotal: 0,
  studied: [],
  skillStats: { read: { correct: 0, total: 0 }, set: { correct: 0, total: 0 }, elapsed: { correct: 0, total: 0 }, convert: { correct: 0, total: 0 }, daypart: { correct: 0, total: 0 } },
  bestTest: 0, lastTest: null, achievements: [],
  bestTimeAttack: {},
};

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT, ...(JSON.parse(raw) as Partial<Progress>) };
  } catch {}
  return DEFAULT;
}

async function loadStoredProgress(): Promise<Progress> {
  const merge = (raw: string | null): Progress | null => {
    if (!raw) return null;
    try {
      const par = JSON.parse(raw) as Partial<Progress>;
      return { ...DEFAULT, ...par, skillStats: { ...DEFAULT.skillStats, ...par.skillStats } } as Progress;
    } catch { return null; }
  };
  try {
    const { value } = await Preferences.get({ key: KEY });
    const p = merge(value);
    if (p) return p;
  } catch {}
  try {
    const raw = localStorage.getItem(KEY);
    const p = merge(raw);
    if (p) {
      try { await Preferences.set({ key: KEY, value: JSON.stringify(p) }); } catch {}
      return p;
    }
  } catch {}
  return DEFAULT;
}

async function persistProgress(p: Progress): Promise<void> {
  const raw = JSON.stringify(p);
  try { await Preferences.set({ key: KEY, value: raw }); } catch {}
  try { localStorage.setItem(KEY, raw); } catch {}
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(DEFAULT);
  const loaded = useRef(false);
  const [toast, setToast] = useState<string | null>(null);
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    loadStoredProgress().then(p => {
      if (cancelled) return;
      setProgress(p);
      seen.current = new Set(p.achievements);
      loaded.current = true;
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    void persistProgress(progress);
  }, [progress]);

  useEffect(() => {
    const fresh = ACHIEVEMENTS.filter(a => !seen.current.has(a.id) && a.check(progress));
    if (fresh.length === 0) return;
    fresh.forEach(a => seen.current.add(a.id));
    setToast(fresh[0].title);
    playAchievement();
    setProgress(prev =>
      prev.achievements.includes(fresh[0].id)
        ? prev
        : { ...prev, achievements: [...prev.achievements, ...fresh.map(a => a.id)] },
    );
  }, [progress]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  const recordSkill = useCallback((skill: ClockSkill, correct: boolean) => {
    setProgress(prev => {
      const s = prev.skillStats[skill] ?? { correct: 0, total: 0 };
      const streak = correct ? prev.streak + 1 : 0;
      const next = {
        ...prev,
        stars: prev.stars + (correct ? 1 : 0),
        streak,
        bestStreak: Math.max(prev.bestStreak, streak),
        answersCorrect: prev.answersCorrect + (correct ? 1 : 0),
        answersTotal: prev.answersTotal + 1,
        skillStats: { ...prev.skillStats, [skill]: { correct: s.correct + (correct ? 1 : 0), total: s.total + 1 } },
      };
      // автозачёт уроков от 10 ответов
      const needByLesson: Record<number, ClockSkill[]> = { 1: ['read'], 2: ['set'], 3: ['daypart'], 4: ['elapsed'] };
      const toAdd: number[] = [];
      for (const [k, skills] of Object.entries(needByLesson)) {
        const id = Number(k);
        if (next.studied.includes(id)) continue;
        if (skills.every(ss => (next.skillStats[ss]?.total ?? 0) >= 10)) toAdd.push(id);
      }
      if (toAdd.length) next.studied = [...next.studied, ...toAdd].sort((a, b) => a - b);
      return next;
    });
  }, []);

  const tryMarkStudiedFromStats = useCallback(() => {
    setProgress(prev => {
      const stats = prev.skillStats;
      const needByLesson: Record<number, ClockSkill[]> = {
        1: ['read'],
        2: ['set'],
        3: ['daypart'],
        4: ['elapsed'],
      };
      const toAdd: number[] = [];
      for (const [lessonIdStr, skills] of Object.entries(needByLesson)) {
        const lessonId = Number(lessonIdStr);
        if (prev.studied.includes(lessonId)) continue;
        const ok = skills.every(s => (stats[s]?.total ?? 0) >= 10);
        if (ok) toAdd.push(lessonId);
      }
      if (toAdd.length === 0) return prev;
      return { ...prev, studied: [...prev.studied, ...toAdd].sort((a, b) => a - b) };
    });
  }, []);

  const markStudied = useCallback((_id: number) => {}, []);

  const finishTest = useCallback((score: number) => {
    setProgress(prev => ({ ...prev, stars: prev.stars + score, lastTest: score, bestTest: Math.max(prev.bestTest, score) }));
  }, []);

  const finishTimeAttack = useCallback((diff: import('../types').TimeDifficulty, score: number) => {
    setProgress(prev => {
      const best = prev.bestTimeAttack[diff] ?? 0;
      return { ...prev, stars: prev.stars + score, bestTimeAttack: { ...prev.bestTimeAttack, [diff]: Math.max(best, score) } };
    });
  }, []);

  const resetProgress = useCallback(() => {
    seen.current = new Set();
    setProgress({ ...DEFAULT });
  }, []);

  const importProgress = useCallback((raw: string): boolean => {
    try {
      const data = JSON.parse(raw) as Partial<Progress>;
      if (typeof data.stars !== 'number' || typeof data.answersTotal !== 'number') return false;
      const p = { ...DEFAULT, ...data, skillStats: { ...DEFAULT.skillStats, ...data.skillStats } } as Progress;
      seen.current = new Set(p.achievements);
      setProgress(p);
      return true;
    } catch { return false; }
  }, []);

  return { progress, recordSkill, markStudied, tryMarkStudiedFromStats, finishTest, finishTimeAttack, resetProgress, importProgress, toast };
}
