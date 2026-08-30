import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import AnalogClock from '../components/AnalogClock';
import BigButton from '../components/BigButton';
import Confetti from '../components/Confetti';
import OwlMascot from '../components/OwlMascot';
import StarsPill from '../components/StarsPill';
import { makeReadQuestion } from '../lib/clock';
import { OPT_STYLES } from '../lib/styles';
import { playCorrect, playWrong } from '../lib/sounds';
import type { Screen, TimeDifficulty, ClockSkill } from '../types';

const PRAISE = ['Молодец!', 'Супер!', 'Точно!', 'Класс!', 'Так держать!'];
const SUPPORT = ['Ничего! Запомни и попробуй еще', 'Почти! Смотри как правильно', 'Бывает! Повторим'];

export default function ReadClockScreen({
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
  const [q, setQ] = useState(() => makeReadQuestion(pickMixed(difficulty ?? 'medium')));
  const [phase, setPhase] = useState<'ask' | 'correct' | 'wrong'>('ask');
  const [picked, setPicked] = useState<string | null>(null);
  const [burst, setBurst] = useState(0);
  const [msg, setMsg] = useState('Который час?');
  const statsRef = useRef({ c: 0, t: 0 });
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const next = () => {
    const d = pickMixed(adaptive);
    setQ(makeReadQuestion(d));
    setPhase('ask');
    setPicked(null);
    setMsg('Который час?');
  };

  const maybeAdapt = (ok: boolean) => {
    const s = statsRef.current;
    s.t += 1;
    if (ok) s.c += 1;
    if (s.t >= 5) {
      const rate = s.c / s.t;
      if (rate < 0.4 && adaptive !== 'easy') {
        setAdaptive(adaptive === 'hard' ? 'medium' : 'easy');
        s.c = 0;
        s.t = 0;
      } else if (rate >= 0.75 && adaptive !== 'hard') {
        setAdaptive(adaptive === 'easy' ? 'medium' : 'hard');
        s.c = 0;
        s.t = 0;
      } else if (s.t >= 12) {
        s.c = 0;
        s.t = 0;
      }
    }
  };

  const answer = (opt: string) => {
    if (phase !== 'ask') return;
    const ok = opt === q.answer;
    recordSkill('read', ok);
    maybeAdapt(ok);
    if (ok) playCorrect();
    else playWrong();
    if (ok) {
      setPhase('correct');
      setBurst(b => b + 1);
      setMsg(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
      timer.current = window.setTimeout(() => next(), 3000);
    } else {
      setPhase('wrong');
      setPicked(opt);
      setMsg(SUPPORT[Math.floor(Math.random() * SUPPORT.length)]);
    }
  };

  return (
    <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-3">
      <div className="grid grid-cols-[48px_1fr_48px] items-center gap-2">
        <button
          type="button"
          onClick={() => go({ name: 'home' })}
          className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-[0_4px_0_#ece3d2] active:translate-y-0.5"
        >
          <ArrowLeft size={24} strokeWidth={2.8} />
        </button>
        <h1 className="text-center font-display text-base font-bold">Определи время</h1>
        <span className="flex justify-end"><StarsPill stars={stars} /></span>
      </div>

      <div className="mt-4 flex justify-center">
        <div className="rounded-blob bg-white p-4 shadow-[0_6px_0_#f0e7d6]">
          <AnalogClock time={q.time} size={180} />
        </div>
      </div>
      <Confetti burst={burst} />

      {phase === 'wrong' ? (
        <div className="animate-pop-in mt-5 rounded-blob bg-white p-5 text-center shadow-[0_6px_0_#f0e7d6]">
          <p className="font-extrabold text-[#8d84a3]">Правильно:</p>
          <p className="mt-1 font-display text-2xl font-bold text-mint-dark">{q.answer}</p>
          <BigButton color="sun" className="mt-4 h-14 w-full text-lg" onClick={() => next()}>
            Попробовать ещё раз
          </BigButton>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3">
          {q.options.map((opt, i) => {
            const cls = phase === 'correct' && opt === q.answer ? 'bg-mint text-white shadow-[0_6px_0_#22a76b] scale-[1.04]' : phase === 'correct' ? `${OPT_STYLES[i]} opacity-40` : OPT_STYLES[i];
            return (
              <button
                key={opt}
                type="button"
                onClick={() => answer(opt)}
                disabled={phase === 'correct'}
                className={`h-[52px] rounded-3xl text-lg font-extrabold transition active:translate-y-1 ${cls}`}
              >
                {opt}
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
