export type TimeDifficulty = 'easy' | 'medium' | 'hard';
export type ClockSkill = 'read' | 'set' | 'elapsed' | 'convert';
export type Screen =
  | { name: 'home' }
  | { name: 'learn' }
  | { name: 'read'; difficulty?: TimeDifficulty }
  | { name: 'set'; difficulty?: TimeDifficulty }
  | { name: 'elapsed' }
  | { name: 'convert' }
  | { name: 'test' }
  | { name: 'time-attack'; difficulty?: TimeDifficulty }
  | { name: 'results' };
export interface TableStat { correct: number; total: number }
export interface Progress {
  stars: number;
  streak: number;
  bestStreak: number;
  answersCorrect: number;
  answersTotal: number;
  studied: number[];
  skillStats: Record<ClockSkill, TableStat>;
  bestTest: number;
  lastTest: number | null;
  achievements: string[];
  bestTimeAttack: Partial<Record<TimeDifficulty, number>>;
}
