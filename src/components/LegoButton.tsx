import type { CSSProperties, ReactNode } from 'react';
import type { ChunkyColor } from './BigButton';

const LEGO_COLORS: Record<ChunkyColor, string> = {
  sun: '#FFC53D',
  coral: '#FF7B6B',
  mint: '#3ECF8E',
  sky: '#4FB3FF',
  grape: '#9D7BFF',
  candy: '#FF8FB8',
  white: '#FFFFFF',
};

const STUDS: number[] = [];

interface Props {
  color?: ChunkyColor;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
}

export default function LegoButton({ color = 'sun', className = '', style, onClick, disabled, children }: Props) {
  const bg = LEGO_COLORS[color];
  const text = color === 'white' || color === 'sun' ? '#3B3660' : '#fff';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{ ...style, ['--lego-bg' as string]: bg, ['--lego-text' as string]: text } as CSSProperties}
      className={`lego-brick select-none rounded-[14px] font-extrabold transition-all duration-100 active:translate-y-1 disabled:pointer-events-none disabled:opacity-50 ${className}`}
    >
      <span className="lego-studs" aria-hidden>
        {STUDS.map(i => (
          <span key={i} className="lego-stud" />
        ))}
      </span>
      <span className="lego-content">{children}</span>
    </button>
  );
}
