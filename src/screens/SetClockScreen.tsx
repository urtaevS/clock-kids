import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import AnalogClock from '../components/AnalogClock';
import BigButton from '../components/BigButton';
import Confetti from '../components/Confetti';
import OwlMascot from '../components/OwlMascot';
import StarsPill from '../components/StarsPill';
import { formatDigital, makeSetQuestion, sameTime } from '../lib/clock';
import { playCorrect, playWrong } from '../lib/sounds';
import type { Screen, TimeDifficulty, ClockSkill } from '../types';

export default function SetClockScreen({
  difficulty,
  recordSkill,
  go,
  stars,
}: {
  difficulty?: TimeDifficulty;
  recordSkill: (s: ClockSkill, ok: boolean) => void;
  go: (s: Screen) => void;
  stars: number;
}) {
  const pickMixed = (base: TimeDifficulty): TimeDifficulty => {
    const r = Math.random();
    if (base === 'easy') return r < 0.6 ? 'easy' : r < 0.85 ? 'medium' : 'hard';
    if (base === 'medium') return r < 0.2 ? 'easy' : r < 0.75 ? 'medium' : 'hard';
    return r < 0.15 ? 'easy' : r < 0.4 ? 'medium' : 'hard';
  };
  const [adaptive, setAdaptive] = useState<TimeDifficulty>(difficulty ?? 'medium');
  const [q, setQ] = useState(() => makeSetQuestion(pickMixed(difficulty ?? 'medium')));
  const [phase, setPhase] = useState<'ask' | 'correct' | 'wrong'>('ask');
  const [picked, setPicked] = useState<number | null>(null);
  const [burst, setBurst] = useState(0);
  const [msg, setMsg] = useState('Выбери часы с этим временем');
  const statsRef = useRef({ c: 0, t: 0 });
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const next = () => {
    const d = pickMixed(adaptive);
    setQ(makeSetQuestion(d));
    setPhase('ask');
    setPicked(null);
    setMsg('Выбери часы с этим временем');
  };

  const maybeAdapt = (ok: boolean) => {
    const s = statsRef.current;
    s.t += 1;
    if (ok) s.c += 1;
    if (s.t >= 5) {
      const rate = s.c / s.t;
      if (rate < 0.4 && adaptive !== 'easy') {
        setAdaptive(adaptive === 'hard' ? 'medium' : 'easy');
        s.c = 0; s.t = 0;
      } else if (rate >= 0.75 && adaptive !== 'hard') {
        setAdaptive(adaptive === 'easy' ? 'medium' : 'hard');
        s.c = 0; s.t = 0;
      } else if (s.t >= 12) { s.c = 0; s.t = 0; }
    }
  };

  const choose = (idx: number) => {
    if (phase !== 'ask') return;
    const ok = sameTime(q.options[idx], q.answer);
    recordSkill('set', ok);
    maybeAdapt(ok);
    if (ok) playCorrect();
    else playWrong();
    if (ok) {
      setPhase('correct');
      setBurst(b => b + 1);
      setMsg('Верно!');
      timer.current = window.setTimeout(() => next(), 3000);
    } else {
      setPhase('wrong');
      setPicked(idx);
      setMsg('Смотри правильный вариант');
    }
  };

  return (
    <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-3">
      <div className="grid grid-cols-[48px_1fr_48px] items-center gap-2">
        <button type="button" onClick={() => go({ name: 'home' })} className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-[0_4px_0_#ece3d2] active:translate-y-0.5">
          <ArrowLeft size={24} strokeWidth={2.8} />
        </button>
        <h1 className="text-center font-display text-sm font-bold">Выставь стрелки</h1>
        <span className="flex justify-end"><StarsPill stars={stars} /></span>
      </div>
      <div className="mt-4 rounded-blob bg-white p-4 text-center shadow-[0_6px_0_#f0e7d6]">
        <p className="font-display text-4xl font-bold">{formatDigital(q.target)}</p>
      </div>
      <Confetti burst={burst} />

      {phase === 'wrong' ? (
        <div className="animate-pop-in mt-4 rounded-blob bg-white p-5 text-center shadow-[0_6px_0_#f0e7d6]">
          <p className="font-extrabold text-[#8d84a3]">Правильный ответ:</p>
          <div className="mt-3 flex justify-center">
            <div className="rounded-3xl bg-white p-3 shadow ring-4 ring-mint shadow-[0_6px_0_#22a76b]">
              <AnalogClock time={q.answer} size={120} />
            </div>
          </div>
          <BigButton color="sun" className="mt-4 h-11 w-full text-base" onClick={() => next()}>
            Попробовать ещё раз
          </BigButton>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {q.options.map((t, i) => {
            const isCorrect = sameTime(t, q.answer);
            const ring = phase === 'correct' && isCorrect ? 'ring-4 ring-mint shadow-[0_6px_0_#22a76b]' : phase === 'correct' ? 'opacity-40' : 'shadow-[0_6px_0_#f0e7d6]';
            return (
              <button
                key={formatDigital(t) + i}
                type="button"
                onClick={() => choose(i)}
                disabled={phase === 'correct'}
                className={`rounded-3xl bg-white p-3 shadow ${ring} transition active:translate-y-1`}
              >
                <div className="flex justify-center">
                  <AnalogClock time={t} size={120} />
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <OwlMascot play={phase === 'correct'} message={msg} />
      </div>
    </main>
  );
}
