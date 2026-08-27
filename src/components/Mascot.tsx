import { useEffect, useState } from 'react';

const CLOCK_CYCLE = ['⏰', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛'];

export default function Mascot({ message, emoji = '🤖', className = '' }: { message?: string; emoji?: string; className?: string }) {
  const [tick, setTick] = useState(0);
  const cycling = emoji === '⏰';
  useEffect(() => {
    if (!cycling) return;
    const id = window.setInterval(() => setTick(t => (t + 1) % CLOCK_CYCLE.length), 1000);
    return () => window.clearInterval(id);
  }, [cycling]);

  const shown = cycling ? CLOCK_CYCLE[tick] : emoji;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div aria-hidden className="animate-float text-5xl">
        <span className="inline-block origin-center">{shown}</span>
      </div>
      {message && (
        <div className="animate-pop-in relative rounded-2xl rounded-bl-md bg-white px-4 py-2.5 font-extrabold shadow-[0_4px_0_#ece3d2]">
          {message}
        </div>
      )}
    </div>
  );
}