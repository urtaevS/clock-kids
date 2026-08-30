import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import AnalogClock from '../components/AnalogClock';
import BigButton from '../components/BigButton';
import Confetti from '../components/Confetti';
import OwlMascot from '../components/OwlMascot';
import StarsPill from '../components/StarsPill';
import { formatDigital, makeElapsedQuestion } from '../lib/clock';
import { OPT_STYLES } from '../lib/styles';
import { playCorrect, playWrong } from '../lib/sounds';
import type { Screen, ClockSkill } from '../types';

export default function ElapsedScreen({ recordSkill, go, stars }: { recordSkill: (s: ClockSkill, ok: boolean) => void; go: (s: Screen) => void; stars: number }) {
  const [q, setQ] = useState(() => makeElapsedQuestion());
  const [phase, setPhase] = useState<'ask' | 'correct' | 'wrong'>('ask');
  const [picked, setPicked] = useState<string | null>(null);
  const [burst, setBurst] = useState(0);
  const [msg, setMsg] = useState('Сколько времени прошло?');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const next = () => {
    setQ(makeElapsedQuestion());
    setPhase('ask');
    setPicked(null);
    setMsg('Сколько времени прошло?');
  };

  const answer = (opt: string) => {
    if (phase !== 'ask') return;
    const ok = opt === q.answer;
    recordSkill('elapsed', ok);
    if (ok) playCorrect();
    else playWrong();
    if (ok) {
      setPhase('correct');
      setBurst(b => b + 1);
      setMsg('Верно!');
      timer.current = window.setTimeout(next, 3000);
    } else {
      setPhase('wrong');
      setPicked(opt);
      setMsg('Смотри правильный ответ');
    }
  };

  return (
    <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-3">
      <div className="grid grid-cols-[48px_1fr_48px] items-center gap-2">
        <button type="button" onClick={() => go({ name: 'home' })} className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-[0_4px_0_#ece3d2] active:translate-y-0.5">
          <ArrowLeft size={24} strokeWidth={2.8} />
        </button>
        <h1 className="text-center font-display text-base font-bold">Сколько прошло?</h1>
        <span className="flex justify-end"><StarsPill stars={stars} /></span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-blob bg-white p-3 text-center shadow-[0_6px_0_#f0e7d6]">
          <p className="font-display text-lg font-bold text-[#8d84a3]">{formatDigital(q.start)}</p>
          <div className="mt-2 flex justify-center">
            <AnalogClock time={q.start} size={130} />
          </div>
        </div>
        <div className="rounded-blob bg-white p-3 text-center shadow-[0_6px_0_#f0e7d6]">
          <p className="font-display text-lg font-bold text-[#8d84a3]">{formatDigital(q.end)}</p>
          <div className="mt-2 flex justify-center">
            <AnalogClock time={q.end} size={130} />
          </div>
        </div>
      </div>
      <Confetti burst={burst} />

      {phase === 'wrong' ? (
        <div className="animate-pop-in mt-5 rounded-blob bg-white p-4 text-center shadow-[0_6px_0_#f0e7d6]">
          <p className="font-extrabold text-[#8d84a3]">Правильно:</p>
          <p className="mt-1 font-display text-2xl font-bold text-mint-dark">{q.answer}</p>
          <BigButton color="sun" className="mt-3 h-11 w-full text-base" onClick={next}>
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
                className={`h-[52px] rounded-3xl text-base font-extrabold transition active:translate-y-1 ${cls}`}
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
