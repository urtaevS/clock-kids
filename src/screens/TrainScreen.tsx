import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import AnalogClock from '../components/AnalogClock';
import BigButton from '../components/BigButton';
import Confetti from '../components/Confetti';
import OwlMascot from '../components/OwlMascot';
import { formatDigital, makeReadQuestion, makeSetQuestion, sameTime } from '../lib/clock';
import { makeElapsedQuestion, makeConvertQuestion } from '../lib/clock';
import { OPT_STYLES } from '../lib/styles';
import { playCorrect, playWrong } from '../lib/sounds';
import { rnd } from '../lib/utils';
import type { Screen, ClockSkill } from '../types';

type Mode = 'read' | 'set' | 'elapsed' | 'convert' | 'daypart';

function dayPart(h: number): { label: string; emoji: string } {
  if (h >= 5 && h <= 11) return { label: 'Утро', emoji: '🌅' };
  if (h >= 12 && h <= 17) return { label: 'День', emoji: '☀️' };
  if (h >= 18 && h <= 22) return { label: 'Вечер', emoji: '🌇' };
  return { label: 'Ночь', emoji: '🌙' };
}

const MODE_TITLES: Record<Mode, string> = {
  read: 'Определи время',
  set: 'Выставь стрелки',
  elapsed: 'Сколько прошло?',
  convert: 'Переведи время',
  daypart: 'Утро и вечер',
};

function pickMode(): Mode {
  const r = Math.random();
  if (r < 0.22) return 'read';
  if (r < 0.44) return 'set';
  if (r < 0.64) return 'daypart';
  if (r < 0.82) return 'elapsed';
  return 'convert';
}

type Q =
  | { mode: 'read'; time: { h: number; m: number }; answer: string; options: string[] }
  | { mode: 'set'; target: { h: number; m: number }; answer: { h: number; m: number }; options: { h: number; m: number }[] }
  | { mode: 'elapsed'; start: { h: number; m: number }; end: { h: number; m: number }; answer: string; options: string[] }
  | { mode: 'convert'; prompt: string; answer: string; options: string[] }
  | { mode: 'daypart'; time: { h: number; m: number }; answer: string; options: string[]; part: { label: string; emoji: string } };

function makeQ(mode: Mode): Q {
  if (mode === 'read') {
    const d = (['easy', 'medium', 'hard'] as const)[rnd(0, 2)];
    // pickMixed inside makeReadQuestion already, но используем напрямую
    const r = Math.random();
    const diff = r < 0.3 ? 'easy' : r < 0.65 ? 'medium' : 'hard';
    void d;
    const rq = makeReadQuestion(diff);
    return { mode: 'read', time: rq.time, answer: rq.answer, options: rq.options };
  }
  if (mode === 'set') {
    const r = Math.random();
    const diff = r < 0.3 ? 'easy' : r < 0.65 ? 'medium' : 'hard';
    const sq = makeSetQuestion(diff);
    return { mode: 'set', target: sq.target, answer: sq.answer, options: sq.options };
  }
  if (mode === 'elapsed') {
    const e = makeElapsedQuestion();
    return { mode: 'elapsed', start: e.start, end: e.end, answer: e.answer, options: e.options };
  }
  if (mode === 'convert') {
    const c = makeConvertQuestion();
    return { mode: 'convert', prompt: c.prompt, answer: c.answer, options: c.options };
  }
  // daypart
  const mChoices = [0, 15, 30, 45] as const;
  const m = mChoices[rnd(0, mChoices.length - 1)];
  const h = rnd(0, 23);
  const time = { h, m };
  const part = dayPart(h);
  const answer = formatDigital(time);
  const seen = new Set([answer]);
  while (seen.size < 4) seen.add(formatDigital({ h: rnd(0, 23), m }));
  return { mode: 'daypart', time, answer, options: [...seen].sort(() => Math.random() - 0.5), part };
}

export default function TrainScreen({ recordSkill, go }: { recordSkill: (s: ClockSkill, ok: boolean) => void; go: (s: Screen) => void }) {
  const [q, setQ] = useState<Q>(() => makeQ(pickMode()));
  const [phase, setPhase] = useState<'ask' | 'correct' | 'wrong'>('ask');
  const [picked, setPicked] = useState<string | number | null>(null);
  const [burst, setBurst] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const next = () => {
    setQ(makeQ(pickMode()));
    setPhase('ask');
    setPicked(null);
  };

  const onAnswer = (key: string | number, ok: boolean, skill: ClockSkill) => {
    if (phase !== 'ask') return;
    recordSkill(skill, ok);
    if (ok) {
      playCorrect();
      setPhase('correct');
      setBurst(b => b + 1);
      timer.current = window.setTimeout(next, 3000);
    } else {
      playWrong();
      setPhase('wrong');
      setPicked(key);
    }
  };

  const title = MODE_TITLES[q.mode];

  return (
    <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-5">
      <div className="grid grid-cols-[48px_1fr_48px] items-center gap-2">
        <button type="button" onClick={() => go({ name: 'home' })} className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-[0_4px_0_#ece3d2] active:translate-y-0.5">
          <ArrowLeft size={24} strokeWidth={2.8} />
        </button>
        <h1 className="text-center font-display text-base font-bold">{title}</h1>
        <span aria-hidden className="h-12 w-12" />
      </div>

      <Confetti burst={burst} />

      {q.mode === 'read' && (
        <>
          <div className="mt-4 flex justify-center">
            <div className="rounded-blob bg-white p-4 shadow-[0_6px_0_#f0e7d6]">
              <AnalogClock time={q.time} size={180} />
            </div>
          </div>
          {phase === 'wrong' ? (
            <div className="animate-pop-in mt-5 rounded-blob bg-white p-5 text-center shadow-[0_6px_0_#f0e7d6]">
              <p className="font-extrabold text-[#8d84a3]">Правильно:</p>
              <p className="mt-1 font-display text-2xl font-bold text-mint-dark">{q.answer}</p>
              <BigButton color="sun" className="mt-4 h-11 w-full text-base" onClick={next}>Попробовать ещё раз</BigButton>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-3">
              {q.options.map((opt, i) => {
                const cls = phase === 'correct' && opt === q.answer ? 'bg-mint text-white shadow-[0_6px_0_#22a76b] scale-[1.04]' : phase === 'correct' ? `${OPT_STYLES[i]} opacity-40` : OPT_STYLES[i];
                return <button key={opt} type="button" onClick={() => onAnswer(opt, opt === q.answer, 'read')} disabled={phase === 'correct'} className={`h-[52px] rounded-3xl text-lg font-extrabold transition active:translate-y-1 ${cls}`}>{opt}</button>;
              })}
            </div>
          )}
        </>
      )}

      {q.mode === 'set' && (
        <>
          <div className="mt-4 rounded-blob bg-white p-4 text-center shadow-[0_6px_0_#f0e7d6]">
            <p className="font-display text-4xl font-bold">{formatDigital(q.target)}</p>
          </div>
          {phase === 'wrong' ? (
            <div className="animate-pop-in mt-4 rounded-blob bg-white p-5 text-center shadow-[0_6px_0_#f0e7d6]">
              <p className="font-extrabold text-[#8d84a3]">Правильный ответ:</p>
              <div className="mt-3 flex justify-center">
                <div className="rounded-3xl bg-white p-3 shadow ring-4 ring-mint shadow-[0_6px_0_#22a76b]">
                  <AnalogClock time={q.answer} size={120} />
                </div>
              </div>
              <BigButton color="sun" className="mt-4 h-11 w-full text-base" onClick={next}>Попробовать ещё раз</BigButton>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {q.options.map((t, i) => {
                const isCorrect = sameTime(t, q.answer);
                const ring = phase === 'correct' && isCorrect ? 'ring-4 ring-mint shadow-[0_6px_0_#22a76b]' : phase === 'correct' ? 'opacity-40' : 'shadow-[0_6px_0_#f0e7d6]';
                return (
                  <button key={formatDigital(t) + i} type="button" onClick={() => onAnswer(i, isCorrect, 'set')} disabled={phase === 'correct'} className={`rounded-3xl bg-white p-3 shadow ${ring} transition active:translate-y-1`}>
                    <div className="flex justify-center"><AnalogClock time={t} size={120} /></div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {q.mode === 'daypart' && (
        <>
          <div className="mt-4 flex justify-center">
            <div className="rounded-blob bg-white p-4 shadow-[0_6px_0_#f0e7d6]">
              <AnalogClock time={q.time} size={180} />
            </div>
          </div>
          <div className="mt-3 flex justify-center">
            <span className="rounded-full bg-ink px-4 py-1.5 text-sm font-extrabold text-white">{q.part.emoji} {q.part.label}</span>
          </div>
          {phase === 'wrong' ? (
            <div className="animate-pop-in mt-5 rounded-blob bg-white p-5 text-center shadow-[0_6px_0_#f0e7d6]">
              <p className="font-extrabold text-[#8d84a3]">Правильно:</p>
              <p className="mt-1 font-display text-2xl font-bold text-mint-dark">{q.answer} — {q.part.label}</p>
              <BigButton color="sun" className="mt-4 h-11 w-full text-base" onClick={next}>Попробовать ещё раз</BigButton>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-3">
              {q.options.map((opt, i) => {
                const cls = phase === 'correct' && opt === q.answer ? 'bg-mint text-white shadow-[0_6px_0_#22a76b] scale-[1.04]' : phase === 'correct' ? `${OPT_STYLES[i]} opacity-40` : OPT_STYLES[i];
                return <button key={opt} type="button" onClick={() => onAnswer(opt, opt === q.answer, 'daypart')} disabled={phase === 'correct'} className={`h-[52px] rounded-3xl text-lg font-extrabold transition active:translate-y-1 ${cls}`}>{opt}</button>;
              })}
            </div>
          )}
        </>
      )}

      {q.mode === 'elapsed' && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-blob bg-white p-3 text-center shadow-[0_6px_0_#f0e7d6]">
              <p className="font-display text-lg font-bold text-[#8d84a3]">{formatDigital(q.start)}</p>
              <div className="mt-2 flex justify-center"><AnalogClock time={q.start} size={130} /></div>
            </div>
            <div className="rounded-blob bg-white p-3 text-center shadow-[0_6px_0_#f0e7d6]">
              <p className="font-display text-lg font-bold text-[#8d84a3]">{formatDigital(q.end)}</p>
              <div className="mt-2 flex justify-center"><AnalogClock time={q.end} size={130} /></div>
            </div>
          </div>
          {phase === 'wrong' ? (
            <div className="animate-pop-in mt-5 rounded-blob bg-white p-4 text-center shadow-[0_6px_0_#f0e7d6]">
              <p className="font-extrabold text-[#8d84a3]">Правильно:</p>
              <p className="mt-1 font-display text-2xl font-bold text-mint-dark">{q.answer}</p>
              <BigButton color="sun" className="mt-3 h-11 w-full text-base" onClick={next}>Попробовать ещё раз</BigButton>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-3">
              {q.options.map((opt, i) => {
                const cls = phase === 'correct' && opt === q.answer ? 'bg-mint text-white shadow-[0_6px_0_#22a76b] scale-[1.04]' : phase === 'correct' ? `${OPT_STYLES[i]} opacity-40` : OPT_STYLES[i];
                return <button key={opt} type="button" onClick={() => onAnswer(opt, opt === q.answer, 'elapsed')} disabled={phase === 'correct'} className={`h-[52px] rounded-3xl text-base font-extrabold transition active:translate-y-1 ${cls}`}>{opt}</button>;
              })}
            </div>
          )}
        </>
      )}

      {q.mode === 'convert' && (
        <>
          <div className="mt-4 rounded-blob bg-white p-6 text-center shadow-[0_6px_0_#f0e7d6]">
            <p className="font-display text-2xl font-bold leading-tight">{q.prompt}</p>
          </div>
          {phase === 'wrong' ? (
            <div className="animate-pop-in mt-5 rounded-blob bg-white p-5 text-center shadow-[0_6px_0_#f0e7d6]">
              <p className="font-extrabold text-[#8d84a3]">Правильно:</p>
              <p className="mt-1 font-display text-2xl font-bold text-mint-dark">{q.answer}</p>
              <BigButton color="sun" className="mt-4 h-14 w-full text-lg" onClick={next}>Попробовать ещё раз</BigButton>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-3">
              {q.options.map((opt, i) => {
                const cls = phase === 'correct' && opt === q.answer ? 'bg-mint text-white shadow-[0_6px_0_#22a76b] scale-[1.04]' : phase === 'correct' ? `${OPT_STYLES[i]} opacity-40` : OPT_STYLES[i];
                return <button key={opt} type="button" onClick={() => onAnswer(opt, opt === q.answer, 'convert')} disabled={phase === 'correct'} className={`h-[64px] rounded-3xl text-lg font-extrabold transition active:translate-y-1 ${cls}`}>{opt}</button>;
              })}
            </div>
          )}
        </>
      )}

      <div className="mt-6 flex justify-center">
        <OwlMascot play={phase === 'correct'} message={phase === 'correct' ? 'Супер!' : phase === 'wrong' ? 'Попробуй ещё!' : 'Выбери ответ'} />
      </div>
    </main>
  );
}
