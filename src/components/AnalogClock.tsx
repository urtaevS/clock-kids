import type { ClockTime } from '../lib/clock';

export default function AnalogClock({
  time,
  size = 200,
  highlight = false,
}: {
  time: ClockTime;
  size?: number;
  highlight?: boolean;
}) {
  const r = size / 2;
  const cx = r;
  const cy = r;
  const hourAngle = (time.h % 12) * 30 + time.m * 0.5 - 90;
  const minAngle = time.m * 6 - 90;
  const hourLen = size * 0.28;
  const minLen = size * 0.38;
  const hx = cx + Math.cos((hourAngle * Math.PI) / 180) * hourLen;
  const hy = cy + Math.sin((hourAngle * Math.PI) / 180) * hourLen;
  const mx = cx + Math.cos((minAngle * Math.PI) / 180) * minLen;
  const my = cy + Math.sin((minAngle * Math.PI) / 180) * minLen;

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative select-none rounded-full bg-white shadow-[0_6px_0_#f0e7d6] ${highlight ? 'ring-4 ring-sun' : ''}`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0">
        <circle cx={cx} cy={cy} r={r - 2} fill="white" stroke="#f0e7d6" strokeWidth={3} />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = i * 30 - 90;
          const rad = (a * Math.PI) / 180;
          const x1 = cx + Math.cos(rad) * (r - 3);
          const y1 = cy + Math.sin(rad) * (r - 3);
          const x2 = cx + Math.cos(rad) * (r - 9);
          const y2 = cy + Math.sin(rad) * (r - 9);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i % 3 === 0 ? '#c9b9e8' : '#e8e0f0'} strokeWidth={i % 3 === 0 ? 3 : 2} strokeLinecap="round" />;
        })}
        {Array.from({ length: 12 }).map((_, i) => {
          const n = i === 0 ? 12 : i;
          const a = i * 30 - 90;
          const rad = (a * Math.PI) / 180;
          const dist = r * 0.7;
          const x = cx + Math.cos(rad) * dist;
          const y = cy + Math.sin(rad) * dist;
          return (
            <text key={n} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={size * 0.11} fontWeight={900} fill="#3B3660" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {n}
            </text>
          );
        })}
        <line x1={cx} y1={cy} x2={hx} y2={hy} stroke="#3B3660" strokeWidth={size * 0.022} strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={mx} y2={my} stroke="#FF7B6B" strokeWidth={size * 0.016} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={size * 0.045} fill="#FFC53D" stroke="#3B3660" strokeWidth={2} />
        <circle cx={cx} cy={cy} r={size * 0.02} fill="#3B3660" />
      </svg>
    </div>
  );
}
