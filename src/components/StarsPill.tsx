import { Star } from 'lucide-react';

export default function StarsPill({ stars }: { stars: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sun-soft px-2.5 py-1.5 text-xs font-extrabold text-[#7a4d00] shadow-[0_3px_0_#f0e7d6]">
      <Star size={18} fill="#f5b73d" className="text-[#e0992b]" /> {stars}
    </span>
  );
}
