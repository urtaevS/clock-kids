import { useRef, useState } from 'react';
import { ArrowLeft, Download, Upload, Star, Target, Flame, BookOpen, Zap, RefreshCw } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import BigButton from '../components/BigButton';
import SoundButton from '../components/SoundButton';
import { Icon } from '../lib/icons';
import type { Progress, Screen } from '../types';
import { ACHIEVEMENTS } from '../lib/achievements';

function pluralStar(n: number): string {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} Звезда`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} Звезды`;
  return `${n} Звёзд`;
}

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
  const fileRef = useRef<HTMLInputElement>(null);
  const acc = progress.answersTotal ? Math.round((progress.answersCorrect / progress.answersTotal) * 100) : 0;
  const [checking, setChecking] = useState(false);

  const checkUpdate = async () => {
    setChecking(true);
    try {
      const r = await fetch('https://api.github.com/repos/urtaevS/clock-kids/releases/latest', { headers: { Accept: 'application/vnd.github+json' } });
      if (!r.ok) throw new Error();
      const j = (await r.json()) as { tag_name: string; html_url: string };
      const cur = `v${__APP_VERSION__}`;
      if (j.tag_name && j.tag_name !== cur) {
        if (Capacitor.isNativePlatform()) window.open(j.html_url, '_blank');
        else window.location.href = j.html_url;
        setMsg(`Доступна ${j.tag_name}`);
      } else setMsg('У тебя последняя версия');
    } catch {
      setMsg('Не удалось проверить');
    } finally {
      setChecking(false);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const exportData = () => {
    try {
      const raw = JSON.stringify(progress, null, 2);
      const blob = new Blob([raw], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'chasy-progress.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMsg('Файл сохранён');
      setTimeout(() => setMsg(null), 2500);
    } catch {
      setMsg('Не удалось сохранить');
      setTimeout(() => setMsg(null), 2500);
    }
  };

  const onImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result ?? '');
      const ok = importProgress(raw);
      setMsg(ok ? 'Прогресс загружен' : 'Не удалось загрузить');
      setTimeout(() => setMsg(null), 2500);
    };
    reader.onerror = () => {
      setMsg('Не удалось прочитать файл');
      setTimeout(() => setMsg(null), 2500);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-3">
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
          <Star size={16} fill="#f5b73d" className="animate-star-twinkle" /> {progress.stars}
        </span>
      </div>

      {msg && <div className="mt-3 rounded-2xl bg-ink px-4 py-2 text-center text-sm font-extrabold text-white">{msg}</div>}

      <div className="mt-3 flex justify-center">
        <SoundButton />
      </div>

      <section className="mt-4 rounded-blob bg-white p-5 shadow-[0_6px_0_#f0e7d6]">
        <h2 className="font-display text-base font-bold">Статистика</h2>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <div className="relative col-span-2 flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#FFF7CC] via-[#FFD84D] to-[#FFC21A] p-3.5 shadow-[0_4px_0_#F5C518]">
            <div className="absolute inset-0 animate-star-shimmer bg-gradient-to-r from-transparent via-white/35 to-transparent bg-[length:220%_100%]" aria-hidden />
            <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white shadow-[0_3px_0_rgba(0,0,0,0.12)]">
              <Star size={26} className="animate-star-twinkle text-[#e0992b]" fill="#f5b73d" />
            </div>
            <div className="relative flex flex-1 items-center justify-end gap-2">
              <p className="font-display text-3xl font-bold leading-none text-[#7a4d00]">{progress.stars}</p>
              <p className="text-base font-extrabold text-[#7a4d00]">{pluralStar(progress.stars).split(' ').slice(1).join(' ')}</p>
            </div>
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

        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-sky-soft p-3 text-center">
            <p className="text-xs font-bold text-[#2e8fdb]">Определи</p>
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
          <div className="rounded-2xl bg-sun-soft p-3 text-center">
            <p className="text-xs font-bold text-[#e0992b]">Утро/Вечер</p>
            <p className="font-display text-lg font-bold">{(progress.skillStats.daypart?.correct ?? 0)} / {(progress.skillStats.daypart?.total ?? 0)}</p>
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
          <BigButton color="white" className="flex h-12 items-center justify-center gap-2 text-sm" onClick={() => fileRef.current?.click()}>
            <Upload size={16} /> Восстановить
          </BigButton>
          <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={onImportFile} />
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
        <div className="flex items-center justify-center gap-2">
          <p className="text-center text-xs font-bold text-[#b8a9c8]">v{__APP_VERSION__}</p>
          <button type="button" onClick={checkUpdate} disabled={checking} className="inline-flex items-center gap-1 rounded-full border border-[#ece3d2] bg-white px-2.5 py-1 text-[11px] font-extrabold text-[#8d84a3] shadow-sm disabled:opacity-60">
            <RefreshCw size={11} className={checking ? 'animate-spin' : ''} /> Проверить
          </button>
        </div>
      </div>
    </main>
  );
}
