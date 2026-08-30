import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import AnalogClock from '../components/AnalogClock';
import OwlMascot from '../components/OwlMascot';
import BigButton from '../components/BigButton';
import Confetti from '../components/Confetti';
import { formatDigital, makeElapsedQuestion, makeReadQuestion } from '../lib/clock';
import { OPT_STYLES } from '../lib/styles';
import { playCorrect, playTick, playWrong } from '../lib/sounds';
import type { Screen, TimeDifficulty, ClockSkill } from '../types';

const DIFFS: { id: TimeDifficulty; label: string; desc: string; secs: number }[] = [
  { id: 'easy', label: 'Легко', desc: 'только 00/15/30/45 - 60 сек', secs: 60 },
  { id: 'medium', label: 'Средне', desc: 'шаг 5 мин - 60 сек', secs: 60 },
  { id: 'hard', label: 'Сложно', desc: 'любая минута - 45 сек', secs: 45 },
];

type QARead = { time: { h: number; m: number }; answer: string; options: string[]; isElapsed?: false };
type QAElapsed = { start: { h: number; m: number }; end: { h: number; m: number }; answer: string; options: string[]; isElapsed: true };
type QAType = QARead | QAElapsed;

function genQA(d: TimeDifficulty): QAType {
  if (Math.random() < 0.3) {
    const e = makeElapsedQuestion();
    return { start: e.start, end: e.end, answer: e.answer, options: e.options, isElapsed: true };
  }
  const r = makeReadQuestion(d);
  return { time: r.time, answer: r.answer, options: r.options, isElapsed: false as const };
}

export default function TimeAttackScreen({
  difficulty,
  recordSkill,
  finishTimeAttack,
  go,
}: {
  difficulty?: TimeDifficulty;
  recordSkill: (s: ClockSkill, ok: boolean) => void;
  finishTimeAttack: (d: TimeDifficulty, score: number) => void;
  go: (s: Screen) => void;
}) {
  const [diff, setDiff] = useState<TimeDifficulty | null>(difficulty ?? null);
  const [phase, setPhase] = useState<'pick' | 'play' | 'done'>('pick');
  const [q, setQ] = useState<QAType | null>(null);
  const [score, setScore] = useState(0);
  const [secs, setSecs] = useState(60);
  const [fb, setFb] = useState<'ask' | 'ok' | 'bad'>('ask');
  const [picked, setPicked] = useState<string | null>(null);
  const [burst, setBurst] = useState(0);
  const timerRef = useRef<number | undefined>(undefined);
  const tickRef = useRef<number | undefined>(undefined);

  const start = (d: TimeDifficulty) => {
    setDiff(d);
    const s = DIFFS.find(x => x.id === d)!.secs;
    setScore(0);
    setSecs(s);
    setPhase('play');
    setQ(genQA(d));
    setFb('ask');
    setPicked(null);
    tickRef.current = window.setInterval(() => setSecs(v => (v <= 1 ? 0 : v - 1)), 1000);
  };

  useEffect(() => {
    if (phase !== 'play') return;
    if (secs > 0 && secs <= 10) playTick();
    if (secs === 0) {
      window.clearInterval(tickRef.current);
      window.clearTimeout(timerRef.current);
      if (diff) finishTimeAttack(diff, score);
      setPhase('done');
    }
  }, [secs, phase, diff, score, finishTimeAttack]);

  useEffect(
    () => () => {
      window.clearInterval(tickRef.current);
      window.clearTimeout(timerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (phase === 'pick' && diff) {
      const t = window.setTimeout(() => start(diff), 0);
      return () => window.clearTimeout(t);
    }
  }, [phase, diff]);

  const answer = (opt: string) => {
    if (fb !== 'ask' || !q) return;
    const ok = opt === q.answer;
    const isElapsed = (q as QAElapsed).isElapsed === true;
    recordSkill(isElapsed ? 'elapsed' : 'read', ok);
    if (ok) {
      playCorrect();
      setBurst(b => b + 1);
      setScore(s => s + 1);
    } else playWrong();
    setPicked(opt);
    setFb(ok ? 'ok' : 'bad');
    timerRef.current = window.setTimeout(
      () => {
        if (!diff) return;
        setQ(genQA(diff));
        setFb('ask');
        setPicked(null);
      },
      ok ? 3000 : 900,
    );
  };

  if (phase === 'pick') {
    return (
      <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-8">
        <button
          type="button"
          onClick={() => go({ name: 'home' })}
          className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-[0_4px_0_#ece3d2] active:translate-y-0.5"
        >
          <ArrowLeft size={24} strokeWidth={2.8} />
        </button>
        <h1 className="mt-4 font-display text-2xl font-bold">На время</h1>
        <p className="mt-1.5 text-[15px] font-extrabold text-[#8d84a3]">Читай часы как можно быстрее!</p>
        <div className="mt-6 space-y-3">
          {DIFFS.map(d => (
            <button
              key={d.id}
              type="button"
              onClick={() => start(d.id)}
              className={
                'flex w-full items-center gap-3 rounded-3xl px-4 py-4 text-left font-extrabold shadow-[0_6px_0_#f0e7d6] transition active:translate-y-1 ' +
                (d.id === 'easy' ? 'bg-mint-soft text-[#0d7a4e]' : d.id === 'medium' ? 'bg-sun-soft text-[#7a5a00]' : 'bg-coral-soft text-[#8e2b1f]')
              }
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/60 text-xl">{d.id === 'easy' ? 'E' : d.id === 'medium' ? 'M' : 'H'}</span>
              <span className="flex-1">
                <span className="block text-lg leading-none">{d.label}</span>
                <span className="block text-xs opacity-70">{d.desc}</span>
              </span>
              <span className="rounded-full bg-white px-3 py-1.5 text-sm">Играть</span>
            </button>
          ))}
        </div>
      </main>
    );
  }

  if (phase === 'done') {
    return (
      <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-8 text-center">
        <h1 className="font-display text-2xl font-bold">Время вышло!</h1>
        <div className="mt-4 rounded-blob bg-white p-6 shadow-[0_6px_0_#f0e7d6]">
          <p className="font-display text-5xl font-bold text-coral">{score}</p>
          <p className="mt-1 text-sm font-extrabold text-[#8d84a3]">правильных ответов</p>
        </div>
        <div className="mt-6 space-y-3">
          <BigButton color="mint" className="h-14 w-full text-lg" onClick={() => { setPhase('pick'); setDiff(null); }}>
            Еще раз
          </BigButton>
          <BigButton color="white" className="h-14 w-full text-lg" onClick={() => go({ name: 'home' })}>
            На главную
          </BigButton>
        </div>
      </main>
    );
  }

  const isElapsed = (q as QAElapsed | null)?.isElapsed === true;

  return (
    <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            window.clearInterval(tickRef.current);
            go({ name: 'home' });
          }}
          className="grid h-11 w-11 place-items-center rounded-2xl bg-white shadow-[0_4px_0_#ece3d2]"
        >
          <ArrowLeft size={20} strokeWidth={2.8} />
        </button>
        <div className="flex flex-1 items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#efe6d4]">
            <div className="h-full rounded-full bg-gradient-to-r from-mint to-coral transition-all" style={{ width: (score / 12) * 100 + '%' }} />
          </div>
          <span className="rounded-full bg-white px-3 py-1.5 text-sm font-extrabold shadow-[0_3px_0_#ece3d2]">{score}</span>
        </div>
        <span className={'rounded-full px-3 py-1.5 text-sm font-extrabold ' + (secs <= 10 ? 'bg-coral text-white animate-wiggle' : 'bg-white shadow-[0_3px_0_#ece3d2]')}>{secs}c</span>
      </div>

      <div className="mt-4 rounded-blob bg-white p-4 text-center shadow-[0_6px_0_#f0e7d6]">
        {isElapsed ? (
          <>
            <p className="text-xs font-extrabold text-[#8d84a3]">Сколько прошло?</p>
            <div className="mt-2 flex justify-center gap-3">
              <div className="rounded-2xl bg-paper px-3 py-2 text-center">
                <p className="font-display text-xs font-bold text-[#8d84a3]">{formatDigital((q as QAElapsed).start)}</p>
                <div className="mt-1 flex justify-center"><AnalogClock time={(q as QAElapsed).start} size={130} /></div>
              </div>
              <div className="rounded-2xl bg-paper px-3 py-2 text-center">
                <p className="font-display text-xs font-bold text-[#8d84a3]">{formatDigital((q as QAElapsed).end)}</p>
                <div className="mt-1 flex justify-center"><AnalogClock time={(q as QAElapsed).end} size={130} /></div>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs font-extrabold text-[#8d84a3]">Который час?</p>
            <div className="mt-2 flex justify-center">
              <AnalogClock time={(q as QARead).time} size={170} />
            </div>
          </>
        )}
      </div>
      <Confetti burst={burst} />
      <div className="mt-4 flex justify-center">
        <OwlMascot play={fb === 'ok'} message={fb === 'ok' ? 'Верно! ✅' : fb === 'bad' ? 'Подумай ещё' : 'Поехали!'} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {q?.options.map((opt, i) => {
          let cls = OPT_STYLES[i];
          if (fb === 'ok') cls = opt === q.answer ? 'bg-mint text-white shadow-[0_6px_0_#22a76b]' : OPT_STYLES[i] + ' opacity-40';
          else if (fb === 'bad') {
            if (opt === q.answer) cls = 'bg-mint text-white shadow-[0_6px_0_#22a76b]';
            else if (opt === picked) cls = 'animate-shake bg-[#ffe8d1] text-[#c07a2a] shadow-[0_6px_0_#f2d5b2]';
            else cls = OPT_STYLES[i] + ' opacity-40';
          }
          return (
            <button
              key={opt}
              type="button"
              onClick={() => answer(opt)}
              className={'min-h-[56px] rounded-3xl px-2 py-3 text-base font-extrabold transition active:translate-y-1 ' + cls}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </main>
  );
}
