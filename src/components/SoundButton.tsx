import { useEffect, useState } from 'react';
import { Icon } from '../lib/icons';
import { initSounds, isMuted, playBg, setMuted, stopBg } from '../lib/sounds';

export default function SoundButton({ className = '' }: { className?: string }) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    void initSounds().then(v => setOn(v));
  }, []);
  const toggle = async () => {
    const next = !on;
    setOn(next);
    await setMuted(!next);
    if (next) playBg();
    else stopBg();
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={on ? 'Выключить звук' : 'Включить звук'}
      aria-pressed={on}
      className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-extrabold shadow-[0_4px_0_#ece3d2] transition-all active:translate-y-0.5 active:shadow-none ${on ? 'border-[#e3d6b8] bg-sun-soft text-[#7a5a00]' : 'border-[#ede3cc] bg-white text-[#8d84a3]'} ${className}`}
    >
      <span className={`grid h-7 w-7 place-items-center rounded-full shadow-sm ${on ? 'bg-sun text-white' : 'bg-[#f3ece0] text-[#b8a88a]'}`}>
        <Icon name={on ? 'Volume2' : 'VolumeX'} size={14} />
      </span>
      <span>{on ? 'Звук вкл' : 'Звук выкл'}</span>
      <span className={`ml-1 h-2 w-2 rounded-full ${on ? 'bg-mint' : 'bg-[#d8cbb0]'}`} aria-hidden />
    </button>
  );
}
