import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import AnalogClock from '../components/AnalogClock';
import BigButton from '../components/BigButton';
import type { Screen, Progress } from '../types';

const LESSONS = [
  { id: 1, icon: '1', title: 'Две стрелки-друга 🤝', color: 'bg-sky-soft', text: 'На часах 12 цифр по кругу.\n\n🟠 Короткая толстая — показывает ЧАСЫ (двигается медленно).\n🔵 Длинная тонкая — показывает МИНУТЫ (двигается быстрее).' },
  { id: 2, icon: '2', title: 'Четверть и половина 🍕', color: 'bg-mint-soft', text: 'Если:\n• Длинная на 12 → ровно (2:00)\n• На 3 → пятнадцать минут = 15 мин (2:15)\n• На 6 → половина = 30 мин (2:30)\n• На 9 → без пятнадцати = 45 мин (2:45)' },
  { id: 3, icon: '3', title: 'Утро и вечер 🌞🌙', color: 'bg-candy-soft', text: '🌞 Утром: 7:00 — идём в школу\n🌙 Вечером: 19:00 — те же 7 часов, только вечера.\n⏰ 13:00 = 1 час дня, 20:00 = 8 вечера.\nПросто отними 12!' },
  { id: 4, icon: '4', title: 'Сколько прошло? ⏳', color: 'bg-grape-soft', text: 'Смотри на часы и считай.\n\nБыло 9:15 — стало 10:45.\nСначала часы: 9 → 10 = 1 час.\nПотом минуты: 15 → 45 = 30 мин.\n\nИтого: 1 ч 30 мин — целый мультик!' },
];

export default function LearnScreen({ progress, go, markStudied, tryMarkStudiedFromStats }: { progress: Progress; go: (s: Screen) => void; markStudied: (id: number) => void; tryMarkStudiedFromStats: () => void }) {
  const [open, setOpen] = useState<number | null>(null);
  const scrollRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open !== null) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [open]);

  // Урок засчитывается только по факту >=10 ответов, а не по раскрытию — для UX показываем прогресс
  useEffect(() => { tryMarkStudiedFromStats(); }, [progress, tryMarkStudiedFromStats, open]);

  const LESSON_EXAMPLES: Record<number, { h: number; m: number }[]> = {
    1: [{ h: 3, m: 0 }, { h: 6, m: 0 }, { h: 9, m: 0 }, { h: 12, m: 0 }],
    2: [{ h: 2, m: 0 }, { h: 2, m: 15 }, { h: 2, m: 30 }, { h: 2, m: 45 }],
    3: [{ h: 7, m: 0 }, { h: 13, m: 0 }, { h: 20, m: 0 }, { h: 2, m: 0 }],
    4: [{ h: 9, m: 15 }, { h: 10, m: 45 }],
  };

  return (
    <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-5">
      <div className="grid grid-cols-[48px_1fr_48px] items-center gap-2">
        <button
          type="button"
          onClick={() => go({ name: 'home' })}
          className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-[0_4px_0_#ece3d2] active:translate-y-0.5"
        >
          <ArrowLeft size={24} strokeWidth={2.8} />
        </button>
        <h1 className="text-center font-display text-2xl font-bold">Изучаем время</h1>
        <span aria-hidden className="h-12 w-12" />
      </div>
      <p className="mt-2 text-center text-[15px] font-extrabold text-[#8d84a3]">Нажми на карточку👇 — там живой пример!</p>

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
              className={`group w-full rounded-blob p-4 text-left shadow-[0_6px_0_#f0e7d6] ${l.color} transition active:scale-[0.98]`}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-xl font-bold">{l.icon}</span>
                <span className="flex-1">
                  <span className="block font-display text-base font-bold leading-none">{l.title}</span>
                  <span className="block text-xs font-bold opacity-60">урок {l.id} {studied ? '· изучен' : ''}</span>
                </span>
                <ChevronRight size={20} className={`opacity-60 transition ${isOpen ? 'rotate-90' : ''}`} />
              </div>
              <p className="mt-2 whitespace-pre-line text-sm font-bold leading-snug">{l.text}</p>
              {isOpen && (
                <div className="mt-3 rounded-3xl bg-white p-4">
                  {l.id === 4 ? (
                    <div className="flex items-center justify-center gap-2">
                      {LESSON_EXAMPLES[4].map((t, idx) => (
                        <div key={`${t.h}:${t.m}`} className="flex flex-1 flex-col items-center gap-1.5 rounded-2xl bg-[#FFF8EC] p-2.5">
                          <AnalogClock time={t} size={100} />
                          <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-extrabold text-white">
                            {t.h}:{String(t.m).padStart(2, '0')}
                          </span>
                        </div>
                      ))}

                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {LESSON_EXAMPLES[l.id].map((t) => (
                        <div key={`${t.h}:${t.m}`} className="flex flex-col items-center gap-1.5 rounded-2xl bg-[#FFF8EC] p-2.5">
                          <AnalogClock time={t} size={100} />
                          <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-extrabold text-white">
                            {t.h}:{String(t.m).padStart(2, '0')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {l.id === 4 && (() => {
                    const a = LESSON_EXAMPLES[4][0], b = LESSON_EXAMPLES[4][1];
                    const dh = b.h - a.h + (b.m < a.m ? -1 : 0);
                    const dm = (b.m - a.m + 60) % 60;
                    const ans = dm === 0 ? `${dh} ч` : dh === 0 ? `${dm} мин` : `${dh} ч ${dm} мин`;
                    return (
                      <div className="mt-3 flex items-center justify-center gap-2">
                        <span className="rounded-full bg-mint px-2.5 py-1 text-xs font-extrabold text-white">{ans}</span>
                      </div>
                    );
                  })()}
                  <div className="mt-3 flex items-center justify-center gap-2" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <BigButton
                      color="sun"
                      className="h-11 w-full text-sm"
                      onClick={() => {
                        if (l.id === 1) go({ name: 'read' });
                        else if (l.id === 2) go({ name: 'set' });
                        else if (l.id === 3) go({ name: 'daypart' });
                        else go({ name: 'elapsed' });
                      }}
                    >
                      Потренироваться
                    </BigButton>
                  </div>
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
