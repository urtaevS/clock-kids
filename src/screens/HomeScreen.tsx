import { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { Icon } from '../lib/icons';
import { iconBg } from '../lib/theme';
import LegoButton from '../components/LegoButton';
import type { ChunkyColor } from '../components/BigButton';
import Mascot from '../components/Mascot';
import ProgressBar from '../components/ProgressBar';
import type { Progress, Screen } from '../types';

const GREETINGS = [
  'Привет! Учим время?',
  'Пора разобраться с часами!',
  'Время — твой суперскилл!',
  'Готов стать мастером времени?',
];

const ACTIONS: { icon: string; label: string; sub?: string; color: ChunkyColor; to: Screen }[] = [
  { icon: 'BookOpen', label: 'Учить', sub: 'как устроены часы', color: 'sky', to: { name: 'learn' } },
  { icon: 'Clock3', label: 'Определи время', sub: 'по часам со стрелками', color: 'mint', to: { name: 'read' } },
  { icon: 'Clock8', label: 'Выставь стрелки', sub: 'по цифровому времени', color: 'grape', to: { name: 'set' } },
  { icon: 'Hourglass', label: 'Сколько прошло?', sub: 'интервалы', color: 'coral', to: { name: 'elapsed' } },
  { icon: 'RefreshCw', label: 'Переведи время', sub: 'часы — минуты', color: 'candy', to: { name: 'convert' } },
  { icon: 'Timer', label: 'На время', sub: 'за 60 секунд', color: 'coral', to: { name: 'time-attack' } },
  { icon: 'Zap', label: 'Быстрый тест', sub: '10 вопросов', color: 'sun', to: { name: 'test' } },
  { icon: 'Trophy', label: 'Мои результаты', sub: 'прогресс и звезды', color: 'grape', to: { name: 'results' } },
];

export default function HomeScreen({ progress, go }: { progress: Progress; go: (s: Screen) => void }) {
  const greeting = useMemo(() => GREETINGS[Math.floor(Math.random() * GREETINGS.length)], []);
  const studied = progress.studied.length;
  const pct = Math.round((studied / 4) * 100);
  const acc = progress.answersTotal ? Math.round((progress.answersCorrect / progress.answersTotal) * 100) : null;

  return (
    <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-6">
      <div className="flex justify-center">
        <Mascot emoji="⏰" message={greeting} />
      </div>

      <header className="mt-4 text-center">
        <h1 className="font-display text-[26px] font-bold leading-tight">
          Учим <span className="text-coral">время</span> играя
        </h1>
      </header>

      <div className="mt-2 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#ece3d2]" />
        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-extrabold tracking-widest text-[#b8a9c8]">ТРЕНИРОВКИ</span>
        <div className="h-px flex-1 bg-[#ece3d2]" />
      </div>

      <div className="mt-3 space-y-3">
        {ACTIONS.slice(0, 5).map((a, i) => (
          <LegoButton
            key={a.label}
            color={a.color}
            onClick={() => go(a.to)}
            className="animate-pop-in h-[74px] w-full px-4 text-left"
            style={{ animationDelay: `${i * 60}ms` } as React.CSSProperties}
          >
            <span className={`grid h-11 w-11 place-items-center rounded-2xl ${iconBg(a.icon)}`}>
              <Icon name={a.icon} size={20} />
            </span>
            <span className="flex-1 text-left">
              <span className="block text-[17px] font-extrabold leading-none">{a.label}</span>
              {a.sub && <span className="block text-xs font-bold opacity-80">{a.sub}</span>}
            </span>
            <ChevronRight className="ml-auto opacity-70" size={24} strokeWidth={3} />
          </LegoButton>
        ))}
      </div>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#ece3d2]" />
        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-extrabold tracking-widest text-[#b8a9c8]">ИГРЫ</span>
        <div className="h-px flex-1 bg-[#ece3d2]" />
      </div>

      <div className="space-y-3">
        {ACTIONS.slice(5).map((a, i) => (
          <LegoButton
            key={a.label}
            color={a.color}
            onClick={() => go(a.to)}
            className="animate-pop-in h-[74px] w-full px-4 text-left"
            style={{ animationDelay: `${(i + 5) * 60}ms` } as React.CSSProperties}
          >
            <span className={`grid h-11 w-11 place-items-center rounded-2xl ${iconBg(a.icon)}`}>
              <Icon name={a.icon} size={20} />
            </span>
            <span className="flex-1 text-left">
              <span className="block text-[17px] font-extrabold leading-none">{a.label}</span>
              {a.sub && <span className="block text-xs font-bold opacity-80">{a.sub}</span>}
            </span>
            <ChevronRight className="ml-auto opacity-70" size={24} strokeWidth={3} />
          </LegoButton>
        ))}
      </div>

      <section className="mt-6 rounded-blob bg-white p-5 shadow-[0_6px_0_#f0e7d6]">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-base font-bold">Мой прогресс</h2>
          <span className="font-display text-xl font-bold text-coral">{pct}%</span>
        </div>
        <ProgressBar value={pct} className="mt-2.5" />
        <ul className="mt-4 space-y-1.5 text-[15px] font-extrabold">
          <li>Уроков пройдено: {studied} из 4</li>
          <li>Правильных ответов: {acc === null ? '--' : `${acc}%`}</li>
          {progress.streak > 0 && <li className="text-coral">Серия: {progress.streak} подряд!</li>}
          <li className="text-sm font-bold text-[#8d84a3]">Всего звезд: {progress.stars}</li>
        </ul>
      </section>
    </main>
  );
}
