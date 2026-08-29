import type { CSSProperties, ReactNode } from 'react';

export type ChunkyColor = 'sun' | 'coral' | 'mint' | 'sky' | 'grape' | 'candy' | 'white';

const STYLES: Record<ChunkyColor, string> = {
  sun:   'lego-surface text-[#5c4300]',
  coral: 'lego-surface text-white',
  mint:  'lego-surface text-white',
  sky:   'lego-surface text-white',
  grape: 'lego-surface text-white',
  candy: 'lego-surface text-white',
  white: 'lego-surface text-ink',
};

interface Props {
  color?: ChunkyColor;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
}

const LEGO_BG: Record<ChunkyColor, string> = {
  sun: '#FFC53D', coral: '#FF7B6B', mint: '#3ECF8E', sky: '#4FB3FF', grape: '#9D7BFF', candy: '#FF8FB8', white: '#FFFFFF',
};

export default function BigButton({ color = 'sun', className = '', style, onClick, disabled, children }: Props) {
  const bg = LEGO_BG[color];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{ ...style, ['--lego-bg' as string]: bg } as CSSProperties}
      className={`lego-surface select-none rounded-3xl font-extrabold transition-all duration-100 active:translate-y-1 disabled:pointer-events-none disabled:opacity-50 ${STYLES[color]} ${className}`}
    >
      {children}
    </button>
  );
}