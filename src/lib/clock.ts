import { rnd, shuffle } from './utils';

export type ClockTime = { h: number; m: number };

export function toMinutes(t: ClockTime): number {
  return t.h * 60 + t.m;
}

export function fromMinutes(min: number): ClockTime {
  const m = ((min % 1440) + 1440) % 1440;
  return { h: Math.floor(m / 60), m: m % 60 };
}

export function formatDigital(t: ClockTime): string {
  return `${t.h}:${String(t.m).padStart(2, '0')}`;
}

export function sameTime(a: ClockTime, b: ClockTime): boolean {
  return a.h === b.h && a.m === b.m;
}

export function randomTime(difficulty: 'easy' | 'medium' | 'hard'): ClockTime {
  const h = rnd(0, 23);
  const m = rnd(0, 11) * 5;
  return { h, m };
}

export function randomElapsedPair(): { start: ClockTime; end: ClockTime } {
  const startMin = rnd(7 * 60, 20 * 60);
  const dur = rnd(1, 12) * 15;
  const endMin = (startMin + dur) % 1440;
  return { start: fromMinutes(startMin), end: fromMinutes(endMin) };
}

export function durationMinutes(a: ClockTime, b: ClockTime): number {
  let d = toMinutes(b) - toMinutes(a);
  if (d < 0) d += 1440;
  return d;
}

export function formatDuration(min: number): string {
  if (min < 60) return `${min} мин`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (m === 0) return `${h} ч`;
  return `${h} ч ${m} мин`;
}

export interface ReadQuestion {
  time: ClockTime;
  options: string[];
  answer: string;
}

export function makeReadQuestion(difficulty: 'easy' | 'medium' | 'hard'): ReadQuestion {
  // Difficulty maps to a clear minute pattern so kids learn progressively:
  //  easy   -> ровное время (m = 0)
  //  medium -> половина (m = 30)
  //  hard   -> любые минуты, кроме ровно (0) и половина (30)
  const randReadTime = (base?: ClockTime): ClockTime => {
    if (difficulty === 'easy') {
      const h = base ? (base.h + rnd(1, 4) * (Math.random() < 0.5 ? -1 : 1) + 24) % 24 : rnd(0, 23);
      return { h, m: 0 };
    }
    if (difficulty === 'medium') {
      const h = base ? (base.h + rnd(1, 4) * (Math.random() < 0.5 ? -1 : 1) + 24) % 24 : rnd(0, 23);
      return { h, m: 30 };
    }
    if (!base) {
      const ms = [5, 10, 15, 20, 25, 35, 40, 45, 50, 55] as const;
      return { h: rnd(0, 23), m: ms[rnd(0, ms.length - 1)] };
    }
    const dm = rnd(1, 11) * 5 * (Math.random() < 0.5 ? -1 : 1);
    let m = (base.m + dm + 60) % 60;
    if (m === 0) m = 5;
    if (m === 30) m = 35;
    return { h: base.h, m };
  };
  const time = randReadTime();
  const answer = formatDigital(time);
  const set = new Set<string>([answer]);
  let attempts = 0;
  while (set.size < 4 && attempts < 40) {
    attempts++;
    const s = formatDigital(randReadTime(time));
    if (s !== answer) set.add(s);
  }
  return { time, answer, options: shuffle([...set]) };
}

export interface SetQuestion {
  target: ClockTime;
  options: ClockTime[];
  answer: ClockTime;
}

export function makeSetQuestion(difficulty: 'easy' | 'medium' | 'hard'): SetQuestion {
  const target = randomTime(difficulty);
  const answer = target;
  const opts: ClockTime[] = [target];
  const seen = new Set([formatDigital(target)]);
  let attempts = 0;
  while (opts.length < 4 && attempts < 40) {
    attempts++;
    const delta = rnd(1, 12) * 5;
    const cand = fromMinutes(toMinutes(target) + (Math.random() < 0.5 ? -1 : 1) * delta);
    const key = formatDigital(cand);
    if (!seen.has(key)) {
      seen.add(key);
      opts.push(cand);
    }
  }
  while (opts.length < 4) {
    const r = randomTime(difficulty);
    const k = formatDigital(r);
    if (!seen.has(k)) {
      seen.add(k);
      opts.push(r);
    }
  }
  return { target, answer, options: shuffle(opts) };
}

export interface ElapsedQuestion {
  start: ClockTime;
  end: ClockTime;
  duration: number;
  options: string[];
  answer: string;
}

export function makeElapsedQuestion(): ElapsedQuestion {
  const { start, end } = randomElapsedPair();
  const duration = durationMinutes(start, end);
  const answer = formatDuration(duration);
  const distractors = new Set<string>([answer]);
  const candidates = [duration - 15, duration + 15, duration - 30, duration + 30, duration + 60, Math.max(5, duration - 60)];
  for (const c of candidates) {
    if (distractors.size >= 4) break;
    if (c > 0 && c < 1440) distractors.add(formatDuration(c));
  }
  while (distractors.size < 4) distractors.add(formatDuration(rnd(1, 18) * 15));
  return { start, end, duration, answer, options: shuffle([...distractors]) };
}

export interface ConvertQuestion {
  prompt: string;
  options: string[];
  answer: string;
}

export function makeConvertQuestion(): ConvertQuestion {
  const kind = rnd(0, 2);
  if (kind === 0) {
    const h = rnd(1, 5);
    const answer = String(h * 60);
    const opts = new Set([answer]);
    while (opts.size < 4) opts.add(String(rnd(1, 5) * 60 + rnd(-2, 2) * 15));
    const arr = shuffle([...opts].filter(v => parseInt(v, 10) > 0).slice(0, 4));
    if (!arr.includes(answer)) arr[0] = answer;
    return {
      prompt: `${h} ${h === 1 ? 'час' : h < 5 ? 'часа' : 'часов'} = ? минут`,
      options: shuffle(arr).map(v => `${v} мин`),
      answer: `${answer} мин`,
    };
  } else if (kind === 1) {
    const mins = rnd(2, 9) * 30;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const answer = m === 0 ? `${h} ч` : `${h} ч ${m} мин`;
    const opts = new Set([answer]);
    while (opts.size < 4) {
      const cand = rnd(1, 5) * 30;
      const ch = Math.floor(cand / 60);
      const cm = cand % 60;
      const s = cm === 0 ? `${ch} ч` : `${ch} ч ${cm} мин`;
      opts.add(s);
    }
    return { prompt: `${mins} минут = ?`, options: shuffle([...opts]), answer };
  } else {
    const t = randomTime('medium');
    const remain = (60 - t.m) % 60 || 60;
    const nextH = (t.h + 1) % 24;
    const answer = `${remain} мин`;
    const opts = new Set([answer]);
    while (opts.size < 4) opts.add(`${rnd(1, 11) * 5} мин`);
    return {
      prompt: `От ${formatDigital(t)} до ${nextH}:00 — сколько минут?`,
      options: shuffle([...opts]),
      answer,
    };
  }
}
