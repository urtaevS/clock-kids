import {
  Ban, BookOpen, Calculator, Crown, Download, Flame, HelpCircle, ListOrdered, Lock, Minus, Plus, Puzzle,
  Search, Shuffle, Sparkles, Sprout, Star, Target, Timer, Trophy, Mountain, Upload, Volume2, VolumeX, X, Zap, Leaf,
  Bot, Clock3, Clock8, RefreshCw, Hourglass, AlarmClock, Clock,
} from 'lucide-react';

const MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Sprout, BookOpen, Flame, Mountain, Star, Sparkles, Target, Trophy, Crown,
  Timer, Zap, Leaf, Plus, Minus, Calculator, Search, Shuffle, X, ListOrdered, Ban, Puzzle,
  Bot, Lock, HelpCircle, Volume2, VolumeX, Download, Upload,
  Clock3, Clock8, RefreshCw, Hourglass, AlarmClock, Clock,
} as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>;

export function Icon({ name, size = 22, className = '' }: { name: string; size?: number; className?: string }) {
  const C = MAP[name] ?? HelpCircle;
  return <C size={size} className={className} />;
}
