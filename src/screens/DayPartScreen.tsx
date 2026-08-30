import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import AnalogClock from '../components/AnalogClock';
import BigButton from '../components/BigButton';
import Confetti from '../components/Confetti';
import OwlMascot from '../components/OwlMascot';
import { formatDigital } from '../lib/clock';
import { OPT_STYLES } from '../lib/styles';
import { playCorrect, playWrong } from '../lib/sounds';
import { rnd, shuffle } from '../lib/utils';
import type { Screen, ClockSkill } from '../types';

function dayPart(h: number): { label: string; emoji: string } {
  if (h >= 5 && h <= 11) return { label: 'Утро', emoji: '🌅' };
  if (h >= 12 && h <= 17) return { label: 'День', emoji: '☀️' };
  if (h >= 18 && h <= 22) return { label: 'Вечер', emoji: '🌇' };
  return { label: 'Ночь', emoji: '🌙' };
}

type Q = { time: { h: number; m: number }; answer: string; options: string[]; part: { label: string; emoji: string } };

function makeQuestion(): Q {
  const mChoices = [0, 15, 30, 45] as const;
  const m = mChoices[rnd(0, mChoices.length - 1)];
  const h = rnd(0, 23);
  const time = { h, m };
  const part = dayPart(h);
  const answer = formatDigital(time);
  const seen = new Set([answer]);
  const opts: string[] = [];
  // distractors: same minutes, different hour with different day part when possible
  let attempts = 0;
  while (seen.size < 4 && attempts < 40) {
    attempts++;
    // try +12, or random hour with same minutes
    const candH = rnd(0, 23);
    const cand = formatDigital({ h: candH, m });
    if (!seen.has(cand)) seen.add(cand);
  }
  return { time, answer, options: shuffle([...seen]), part };
}

const PRAISE = ['Молодец!', 'Супер!', 'Точно!', 'Отлично!'];
const SUPPORT = ['Почти! Смотри подсказку', 'Бывает! Запомни', 'Ничего, ещё раз!'];

export default function DayPartScreen({ recordSkill, go }: { recordSkill: (s: ClockSkill, ok: boolean) => void; go: (s: Screen) => void }) {
  const [q, setQ] = useState<Q>(() => makeQuestion());
  const [phase, setPhase] = useState<'ask' | 'correct' | 'wrong'>('ask');
  const [picked, setPicked] = useState<string | null>(null);
  const [burst, setBurst] = useState(0);
  const [msg, setMsg] = useState('Который час?');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const next = () => {
    setQ(makeQuestion());
    setPhase('ask');
    setPicked(null);
    setMsg('Который час?');
  };

  const answer = (opt: string) => {
    if (phase !== 'ask') return;
    const ok = opt === q.answer;
    recordSkill('daypart', ok);
    if (ok) playCorrect(); else playWrong();
    if (ok) {
      setPhase('correct');
      setBurst(b => b + 1);
      setMsg(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
      timer.current = window.setTimeout(next, 3000);
    } else {
      setPhase('wrong');
      setPicked(opt);
      setMsg(SUPPORT[Math.floor(Math.random() * SUPPORT.length)]);
    }
  };

  return (
    <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-5">
      <div className="grid grid-cols-[48px_1fr_48px] items-center gap-2">
        <button type="button" onClick={() => go({ name: 'learn' })} className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-[0_4px_0_#ece3d2] active:translate-y-0.5">
          <ArrowLeft size={24} strokeWidth={2.8} />
        </button>
        <h1 className="text-center font-display text-base font-bold">Утро и вечер</h1>
        <span aria-hidden className="h-12 w-12" />
      </div>

      <div className="mt-4 flex justify-center">
        <div className="rounded-blob bg-white p-4 shadow-[0_6px_0_#f0e7d6]">
          <AnalogClock time={q.time} size={180} />
        </div>
      </div>

      <div className="mt-3 flex justify-center">
        <span className="rounded-full bg-ink px-4 py-1.5 text-sm font-extrabold text-white">
          {q.part.emoji} {q.part.label}
        </span>
      </div>

      <Confetti burst={burst} />

      {phase === 'wrong' ? (
        <div className="animate-pop-in mt-5 rounded-blob bg-white p-5 text-center shadow-[0_6px_0_#f0e7d6]">
          <p className="font-extrabold text-[#8d84a3]">Правильно:</p>
          <p className="mt-1 font-display text-2xl font-bold text-mint-dark">{q.answer} — {q.part.label}</p>
          <BigButton color="sun" className="mt-4 h-11 w-full text-base" onClick={next}>
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
