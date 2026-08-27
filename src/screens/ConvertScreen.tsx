import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import BigButton from '../components/BigButton';
import Confetti from '../components/Confetti';
import Mascot from '../components/Mascot';
import { makeConvertQuestion } from '../lib/clock';
import { OPT_STYLES } from '../lib/styles';
import { playCorrect, playWrong } from '../lib/sounds';
import type { Screen, ClockSkill } from '../types';

export default function ConvertScreen({ recordSkill, go }: { recordSkill: (s: ClockSkill, ok: boolean) => void; go: (s: Screen) => void }) {
  const [q, setQ] = useState(() => makeConvertQuestion());
  const [phase, setPhase] = useState<'ask' | 'correct' | 'wrong'>('ask');
  const [picked, setPicked] = useState<string | null>(null);
  const [burst, setBurst] = useState(0);
  const [msg, setMsg] = useState('Переведи время');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const next = () => {
    setQ(makeConvertQuestion());
    setPhase('ask');
    setPicked(null);
    setMsg('Переведи время');
  };

  const answer = (opt: string) => {
    if (phase !== 'ask') return;
    const ok = opt === q.answer;
    recordSkill('convert', ok);
    if (ok) playCorrect();
    else playWrong();
    if (ok) {
      setPhase('correct');
      setBurst(b => b + 1);
      setMsg('Точно!');
      timer.current = window.setTimeout(next, 1100);
    } else {
      setPhase('wrong');
      setPicked(opt);
      setMsg('Запомни и попробуй еще');
    }
  };

  return (
    <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-5">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => go({ name: 'home' })} className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-[0_4px_0_#ece3d2] active:translate-y-0.5">
          <ArrowLeft size={24} strokeWidth={2.8} />
        </button>
        <h1 className="flex-1 text-center font-display text-base font-bold">Переведи время</h1>
      </div>

      <div className="mt-4 rounded-blob bg-white p-6 text-center shadow-[0_6px_0_#f0e7d6]">
        <p className="font-display text-2xl font-bold leading-tight">{q.prompt}</p>
      </div>
      <Confetti burst={burst} />

      {phase === 'wrong' ? (
        <div className="animate-pop-in mt-5 rounded-blob bg-white p-5 text-center shadow-[0_6px_0_#f0e7d6]">
          <p className="font-extrabold text-[#8d84a3]">Правильно:</p>
          <p className="mt-1 font-display text-2xl font-bold text-mint-dark">{q.answer}</p>
          <BigButton color="sun" className="mt-4 h-14 w-full text-lg" onClick={next}>
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
                className={`h-[64px] rounded-3xl text-lg font-extrabold transition active:translate-y-1 ${cls}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <Mascot emoji={phase === 'correct' ? '😄' : phase === 'wrong' ? '😢' : '⏰'} message={msg} />
      </div>
    </main>
  );
}
