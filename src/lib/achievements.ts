import type { Progress } from '../types';

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  desc: string;
  check: (p: Progress) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first',    icon: 'Sprout',   title: 'Первый шаг',     desc: 'Первый правильный ответ',   check: p => p.answersCorrect >= 1 },
  { id: 'study1',   icon: 'BookOpen', title: 'Читатель',       desc: 'Открыть первый урок',      check: p => p.studied.length >= 1 },
  { id: 'streak5',  icon: 'Flame',    title: 'Горячая серия',  desc: '5 правильных подряд',     check: p => p.bestStreak >= 5 },
  { id: 'streak10', icon: 'Mountain', title: 'Огненная серия', desc: '10 правильных подряд',    check: p => p.bestStreak >= 10 },
  { id: 'stars50',  icon: 'Sparkles', title: '50 звезд',       desc: 'Собрать 50 звезд',        check: p => p.stars >= 50 },
  { id: 'stars150', icon: 'Crown',    title: '150 звезд',      desc: 'Собрать 150 звезд',       check: p => p.stars >= 150 },
  { id: 'test8',    icon: 'Target',   title: 'Почти идеально', desc: 'Набрать 8+ в тесте',      check: p => p.bestTest >= 8 },
  { id: 'test10',   icon: 'Trophy',   title: 'Идеальный тест', desc: '10 из 10 в тесте',        check: p => p.bestTest >= 10 },
  { id: 'read10',   icon: 'Clock3',   title: 'Читаю часы',     desc: '10 верных — прочитай',    check: p => (p.skillStats.read.correct ?? 0) >= 10 },
  { id: 'set10',    icon: 'Clock8',   title: 'Ставлю стрелки', desc: '10 верных — выставь',     check: p => (p.skillStats.set.correct ?? 0) >= 10 },
  { id: 'elapsed5', icon: 'Timer',    title: 'Считаю время',   desc: '5 верных — сколько прошло', check: p => (p.skillStats.elapsed.correct ?? 0) >= 5 },
  { id: 'convert10',icon: 'RefreshCw',title: 'Перевожу время', desc: '10 верных — переведи',    check: p => (p.skillStats.convert.correct ?? 0) >= 10 },
  { id: 'time5',    icon: 'Zap',      title: 'Быстрый старт',  desc: '5 верных на время',       check: p => (p.bestTimeAttack.easy ?? 0) >= 5 || (p.bestTimeAttack.medium ?? 0) >= 5 || (p.bestTimeAttack.hard ?? 0) >= 5 },
  { id: 'time10',   icon: 'Zap',      title: 'Спринтер',       desc: '10 верных на время',      check: p => (p.bestTimeAttack.easy ?? 0) >= 10 || (p.bestTimeAttack.medium ?? 0) >= 10 || (p.bestTimeAttack.hard ?? 0) >= 10 },
  { id: 'allSkills',icon: 'Star',     title: 'Мастер времени', desc: 'По 5 верных в каждом режиме', check: p => Object.values(p.skillStats).every(s => (s.correct ?? 0) >= 5) },
];
