import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import AnalogClock from '../components/AnalogClock';
import BigButton from '../components/BigButton';
import type { Screen, Progress } from '../types';

const LESSONS = [
  { id: 1, icon: '1', title: 'Что такое часы', color: 'bg-sky-soft', text: 'Короткая стрелка — часы, длинная — минуты. Полный круг — 60 минут, 12 часов.' },
  { id: 2, icon: '2', title: 'Минуты и часы', color: 'bg-mint-soft', text: 'Каждое деление — 5 минут. Когда минутная на 12 — ровно час. На 3 — четверть, на 6 — половина, на 9 — без четверти.' },
  { id: 3, icon: '3', title: 'До и после полудня', color: 'bg-candy-soft', text: 'Утро 00-11, день/вечер 12-23. 14:30 = 2:30 дня. Учись переводить!' },
  { id: 4, icon: '4', title: 'Интервалы', color: 'bg-grape-soft', text: 'Сколько прошло? Считай по часам: от 09:15 до 10:45 — 1 ч 30 мин.' },
];

export default function LearnScreen({ progress, go }: { progress: Progress; go: (s: Screen) => void }) {
  const [open, setOpen] = useState<number | null>(null);
  const scrollRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open !== null && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [open]);

  const times: Record<number, { h: number; m: number }> = {
    1: { h: 3, m: 0 },
    2: { h: 2, m: 30 },
    3: { h: 14, m: 45 },
    4: { h: 9, m: 15 },
  };

  return (
    <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-5">
      <button
        type="button"
        onClick={() => go({ name: 'home' })}
        className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-[0_4px_0_#ece3d2] active:translate-y-0.5"
      >
        <ArrowLeft size={24} strokeWidth={2.8} />
      </button>

      <header className="mt-4 text-center">
        <h1 className="font-display text-2xl font-bold">Изучаем время</h1>
        <p className="mt-1 text-[15px] font-extrabold text-[#8d84a3]">Нажми на карточку — увидишь пример</p>
      </header>

      <div className="mt-5 space-y-3">
        {LESSONS.map((l) => {
          const isOpen = open === l.id;
          const studied = progress.studied.includes(l.id);
          return (
            <button
              key={l.id}
              ref={isOpen ? scrollRef : null}
              type="button"
              onClick={() => setOpen(isOpen ? null : l.id)}
              className={`w-full rounded-blob p-4 text-left shadow-[0_6px_0_#f0e7d6] ${l.color} transition active:scale-[0.98]`}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-xl font-bold">{l.icon}</span>
                <span className="flex-1">
                  <span className="block font-display text-base font-bold leading-none">{l.title}</span>
                  <span className="block text-xs font-bold opacity-60">урок {l.id} {studied ? '· изучен' : ''}</span>
                </span>
                <ChevronRight size={20} className={`opacity-60 transition ${isOpen ? 'rotate-90' : ''}`} />
              </div>
              <p className="mt-2 text-sm font-bold leading-snug">{l.text}</p>
              {isOpen && (
                <div className="mt-3 flex flex-col items-center gap-3 rounded-3xl bg-white p-4">
                  <AnalogClock time={times[l.id]} size={160} />
                  <span className="rounded-full bg-ink px-3 py-1 text-sm font-extrabold text-white">
                    {times[l.id].h}:{String(times[l.id].m).padStart(2, '0')}
                  </span>
                  <BigButton
                    color="sun"
                    className="h-11 w-full text-sm"
                    onClick={() => {
                      if (l.id === 1) go({ name: 'read' });
                      else if (l.id === 2) go({ name: 'set' });
                      else if (l.id === 3) go({ name: 'convert' });
                      else go({ name: 'elapsed' });
                    }}
                  >
                    Потренироваться
                  </BigButton>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-blob bg-white p-4 shadow-[0_6px_0_#f0e7d6]">
        <p className="text-center text-sm font-extrabold text-[#8d84a3]">💡 Совет! Сначала освой ровно, четверть и половину — дальше пойдёт легко!</p>
      </div>
    </main>
  );
}
