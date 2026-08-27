import { useState } from 'react';
import { ArrowLeft, Download, Upload, Star, Target, Flame, BookOpen, Zap, Timer } from 'lucide-react';
import BigButton from '../components/BigButton';
import { Icon } from '../lib/icons';
import type { Progress, Screen } from '../types';
import { ACHIEVEMENTS } from '../lib/achievements';

export default function ResultsScreen({
  progress,
  go,
  resetProgress,
  importProgress,
}: {
  progress: Progress;
  go: (s: Screen) => void;
  resetProgress: () => void;
  importProgress: (raw: string) => boolean;
}) {
  const [msg, setMsg] = useState<string | null>(null);
  const acc = progress.answersTotal ? Math.round((progress.answersCorrect / progress.answersTotal) * 100) : 0;

  const exportData = () => {
    const raw = JSON.stringify(progress, null, 2);
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chasy-progress.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = () => {
    const raw = window.prompt('Вставь JSON прогресса:');
    if (!raw) return;
    const ok = importProgress(raw);
    setMsg(ok ? 'Прогресс загружен' : 'Не удалось загрузить');
    setTimeout(() => setMsg(null), 2500);
  };

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
        <h1 className="flex-1 text-center font-display text-base font-bold">Мои результаты</h1>
        <span className="flex items-center gap-1 rounded-full bg-sun-soft px-3 py-1.5 text-sm font-extrabold text-[#e0992b] shadow-[0_3px_0_#f0e7d6]">
          <Star size={16} fill="#f5b73d" /> {progress.stars}
        </span>
      </div>

      {msg && <div className="mt-3 rounded-2xl bg-ink px-4 py-2 text-center text-sm font-extrabold text-white">{msg}</div>}

      <section className="mt-4 rounded-blob bg-white p-5 shadow-[0_6px_0_#f0e7d6]">
        <h2 className="font-display text-base font-bold">Статистика</h2>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <div className="flex flex-col items-center rounded-2xl bg-sun-soft p-3">
            <Star size={20} className="text-[#e0992b]" fill="#f5b73d" />
            <p className="mt-1 font-display text-2xl font-bold text-[#e0992b]">{progress.stars}</p>
            <p className="text-xs font-extrabold text-[#e0992b]/80">Звёзды</p>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-mint-soft p-3">
            <Target size={20} className="text-[#22a76b]" />
            <p className="mt-1 font-display text-2xl font-bold text-[#22a76b]">{acc}%</p>
            <p className="text-xs font-extrabold text-[#22a76b]/80">Правильно {progress.answersCorrect}/{progress.answersTotal}</p>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-coral-soft p-3">
            <Flame size={20} className="text-[#de5646]" />
            <p className="mt-1 font-display text-2xl font-bold text-[#de5646]">{progress.bestStreak}</p>
            <p className="text-xs font-extrabold text-[#de5646]/80">Лучшая серия</p>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-sky-soft p-3">
            <BookOpen size={20} className="text-[#2e8fdb]" />
            <p className="mt-1 font-display text-2xl font-bold text-[#2e8fdb]">{progress.studied.length}/4</p>
            <p className="text-xs font-extrabold text-[#2e8fdb]/80">Уроки</p>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-grape-soft p-3">
            <Zap size={20} className="text-[#7a55e0]" />
            <p className="mt-1 font-display text-2xl font-bold text-[#7a55e0]">{progress.bestTest}/10</p>
            <p className="text-xs font-extrabold text-[#7a55e0]/80">Лучший тест</p>
          </div>
          <div className="col-span-2 flex items-center justify-around rounded-2xl bg-candy-soft p-3">
            <Timer size={20} className="text-[#e06693]" />
            <div className="flex gap-4 text-center">
              <div>
                <p className="font-display text-xl font-bold text-[#e06693]">{progress.bestTimeAttack.easy ?? 0}</p>
                <p className="text-[11px] font-extrabold text-[#e06693]/80">лёгкий</p>
              </div>
              <div>
                <p className="font-display text-xl font-bold text-[#e06693]">{progress.bestTimeAttack.medium ?? 0}</p>
                <p className="text-[11px] font-extrabold text-[#e06693]/80">средний</p>
              </div>
              <div>
                <p className="font-display text-xl font-bold text-[#e06693]">{progress.bestTimeAttack.hard ?? 0}</p>
                <p className="text-[11px] font-extrabold text-[#e06693]/80">сложный</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-sky-soft p-3 text-center">
            <p className="text-xs font-bold text-[#2e8fdb]">Прочитай</p>
            <p className="font-display text-lg font-bold">{progress.skillStats.read.correct} / {progress.skillStats.read.total}</p>
          </div>
          <div className="rounded-2xl bg-grape-soft p-3 text-center">
            <p className="text-xs font-bold text-[#7a55e0]">Выставь</p>
            <p className="font-display text-lg font-bold">{progress.skillStats.set.correct} / {progress.skillStats.set.total}</p>
          </div>
          <div className="rounded-2xl bg-coral-soft p-3 text-center">
            <p className="text-xs font-bold text-[#de5646]">Интервалы</p>
            <p className="font-display text-lg font-bold">{progress.skillStats.elapsed.correct} / {progress.skillStats.elapsed.total}</p>
          </div>
          <div className="rounded-2xl bg-candy-soft p-3 text-center">
            <p className="text-xs font-bold text-[#e06693]">Переведи</p>
            <p className="font-display text-lg font-bold">{progress.skillStats.convert.correct} / {progress.skillStats.convert.total}</p>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-blob bg-white p-5 shadow-[0_6px_0_#f0e7d6]">
        <h2 className="font-display text-base font-bold">Достижения</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {ACHIEVEMENTS.map(a => {
            const unlocked = progress.achievements.includes(a.id);
            return (
              <div key={a.id} className={'rounded-2xl p-3 text-center ' + (unlocked ? 'bg-sun-soft' : 'bg-[#f5f0e6] opacity-60')}>
                <div className="flex justify-center">
                  <Icon name={a.icon} size={20} />
                </div>
                <p className="mt-1 text-xs font-extrabold leading-tight">{a.title}</p>
                <p className="text-[11px] font-bold opacity-60">{a.desc}</p>
                {unlocked && <p className="mt-1 text-[11px] font-extrabold text-mint-dark">получено</p>}
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <BigButton color="white" className="flex h-12 items-center justify-center gap-2 text-sm" onClick={exportData}>
            <Download size={16} /> Сохранить
          </BigButton>
          <BigButton color="white" className="flex h-12 items-center justify-center gap-2 text-sm" onClick={onImport}>
            <Upload size={16} /> Восстановить
          </BigButton>
        </div>
        <BigButton
          color="coral"
          className="h-12 w-full text-sm"
          onClick={() => {
            if (window.confirm('Сбросить весь прогресс?')) resetProgress();
          }}
        >
          Сбросить прогресс
        </BigButton>
      </div>
    </main>
  );
}
