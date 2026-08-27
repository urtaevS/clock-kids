import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import AnalogClock from '../components/AnalogClock';
import BigButton from '../components/BigButton';
import { makeReadQuestion, makeElapsedQuestion, makeConvertQuestion, formatDigital } from '../lib/clock';
import { OPT_STYLES } from '../lib/styles';
import { playCorrect, playWrong } from '../lib/sounds';
import type { Screen, ClockSkill } from '../types';

type Q =
  | { kind: 'read'; time: { h: number; m: number }; answer: string; options: string[] }
  | { kind: 'elapsed'; start: { h: number; m: number }; end: { h: number; m: number }; answer: string; options: string[] }
  | { kind: 'convert'; prompt: string; answer: string; options: string[] };

function gen(): Q {
  const r = Math.random();
  if (r < 0.45) {
    const qq = makeReadQuestion(Math.random() < 0.5 ? 'easy' : 'medium');
    return { kind: 'read', time: qq.time, answer: qq.answer, options: qq.options };
  } else if (r < 0.7) {
    const qq = makeElapsedQuestion();
    return { kind: 'elapsed', start: qq.start, end: qq.end, answer: qq.answer, options: qq.options };
  } else {
    const qq = makeConvertQuestion();
    return { kind: 'convert', prompt: qq.prompt, answer: qq.answer, options: qq.options };
  }
}

export default function TestScreen({
  recordSkill,
  finishTest,
  go,
}: {
  recordSkill: (s: ClockSkill, ok: boolean) => void;
  finishTest: (score: number) => void;
  go: (s: Screen) => void;
}) {
  const [qs] = useState<Q[]>(() => Array.from({ length: 10 }, () => gen()));
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<'ask' | 'correct' | 'wrong'>('ask');
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = qs[idx];

  const answer = (opt: string) => {
    if (phase !== 'ask' || done) return;
    const ok = opt === q.answer;
    if (q.kind === 'read') recordSkill('read', ok);
    else if (q.kind === 'elapsed') recordSkill('elapsed', ok);
    else recordSkill('convert', ok);
    if (ok) {
      playCorrect();
      setScore(s => s + 1);
    } else playWrong();
    setPicked(opt);
    setPhase(ok ? 'correct' : 'wrong');
    setTimeout(() => {
      if (idx === 9) {
        const finalScore = ok ? score + 1 : score;
        finishTest(finalScore);
        setDone(true);
      } else {
        setIdx(i => i + 1);
        setPhase('ask');
        setPicked(null);
      }
    }, ok ? 700 : 1200);
  };

  if (done) {
    return (
      <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-8 text-center">
        <h1 className="font-display text-2xl font-bold">Готово!</h1>
        <div className="mt-4 rounded-blob bg-white p-6 shadow-[0_6px_0_#f0e7d6]">
          <p className="font-display text-5xl font-bold text-coral">{score} / 10</p>
          <p className="mt-2 text-sm font-extrabold text-[#8d84a3]">{score >= 8 ? 'Отлично!' : score >= 5 ? 'Неплохо! Продолжай' : 'Потренируйся еще'}</p>
        </div>
        <div className="mt-6 space-y-3">
          <BigButton color="mint" className="h-14 w-full text-lg" onClick={() => go({ name: 'home' })}>
            На главную
          </BigButton>
          <BigButton
            color="white"
            className="h-14 w-full text-lg"
            onClick={() => {
              setIdx(0);
              setScore(0);
              setDone(false);
              setPhase('ask');
              setPicked(null);
            }}
          >
            Еще раз
          </BigButton>
        </div>
      </main>
    );
  }

  return (
    <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => go({ name: 'home' })}
          className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-[0_4px_0_#ece3d2] active:translate-y-0.5"
        >
          <ArrowLeft size={24} strokeWidth={2.8} />
        </button>
        <h1 className="flex-1 text-center font-display text-base font-bold">Быстрый тест</h1>
        <span className="rounded-full bg-white px-3 py-1.5 text-sm font-extrabold shadow-[0_3px_0_#ece3d2]">{idx + 1} / 10</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#efe6d4]">
        <div className="h-full rounded-full bg-gradient-to-r from-sun to-coral transition-all" style={{ width: (idx / 10) * 100 + '%' }} />
      </div>

      <div className="mt-4 rounded-blob bg-white p-5 text-center shadow-[0_6px_0_#f0e7d6]">
        {q.kind === 'read' && (
          <>
            <p className="text-sm font-extrabold text-[#8d84a3]">Который час?</p>
            <div className="mt-3 flex justify-center">
              <AnalogClock time={q.time} size={180} />
            </div>
          </>
        )}
        {q.kind === 'elapsed' && (
          <>
            <p className="text-sm font-extrabold text-[#8d84a3]">Сколько прошло?</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-paper p-2">
                <AnalogClock time={q.start} size={110} />
                <p className="mt-1 font-bold">{formatDigital(q.start)}</p>
              </div>
              <div className="rounded-2xl bg-paper p-2">
                <AnalogClock time={q.end} size={110} />
                <p className="mt-1 font-bold">{formatDigital(q.end)}</p>
              </div>
            </div>
          </>
        )}
        {q.kind === 'convert' && <p className="font-display text-xl font-bold">{q.prompt}</p>}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {q.options.map((opt, i) => {
          let cls = OPT_STYLES[i];
          if (phase === 'correct') cls = opt === q.answer ? 'bg-mint text-white shadow-[0_6px_0_#22a76b]' : OPT_STYLES[i] + ' opacity-40';
          else if (phase === 'wrong') {
            if (opt === q.answer) cls = 'bg-mint text-white shadow-[0_6px_0_#22a76b]';
            else if (opt === picked) cls = 'animate-shake bg-[#ffe8d1] text-[#c07a2a] shadow-[0_6px_0_#f2d5b2]';
            else cls = OPT_STYLES[i] + ' opacity-40';
          }
          return (
            <button
              key={opt}
              type="button"
              onClick={() => answer(opt)}
              className={'min-h-[56px] rounded-3xl px-2 py-3 text-base font-extrabold leading-tight transition active:translate-y-1 ' + cls}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {phase === 'wrong' && <p className="mt-4 text-center text-sm font-extrabold text-mint-dark">Правильно: {q.answer}</p>}
    </main>
  );
}
