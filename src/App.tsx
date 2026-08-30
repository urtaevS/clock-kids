import { useEffect, useState, type ReactNode } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Award } from 'lucide-react';
import BottomNav, { type NavKey } from './components/BottomNav';
import { initSounds, playBg } from './lib/sounds';
import Decor from './components/Decor';
import { useProgress } from './lib/progress';
import HomeScreen from './screens/HomeScreen';
import LearnScreen from './screens/LearnScreen';
import TrainScreen from './screens/TrainScreen';
import ReadClockScreen from './screens/ReadClockScreen';
import SetClockScreen from './screens/SetClockScreen';
import ElapsedScreen from './screens/ElapsedScreen';
import ConvertScreen from './screens/ConvertScreen';
import DayPartScreen from './screens/DayPartScreen';
import TestScreen from './screens/TestScreen';
import TimeAttackScreen from './screens/TimeAttackScreen';
import ResultsScreen from './screens/ResultsScreen';
import UpdateBanner from './components/UpdateBanner';
import type { Screen } from './types';

export default function App() {
  const { progress, recordSkill, tryMarkStudiedFromStats, markStudied, finishTest, finishTimeAttack, resetProgress, importProgress, toast } = useProgress();
  const [screen, setScreen] = useState<Screen>({ name: 'home' });

  useEffect(() => {
    let started = false;
    const kick = () => {
      if (started) return;
      started = true;
      void initSounds().then(on => { if (on) playBg(); });
      window.removeEventListener('pointerdown', kick);
      window.removeEventListener('keydown', kick);
    };
    window.addEventListener('pointerdown', kick, { once: true });
    window.addEventListener('keydown', kick, { once: true });
    return () => {
      window.removeEventListener('pointerdown', kick);
      window.removeEventListener('keydown', kick);
    };
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    void (async () => {
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: '#FFF8EC' });
      } catch { /* not on native */ }
    })();
  }, []);

  const go = (s: Screen) => {
    setScreen(s);
    window.scrollTo({ top: 0 });
  };

  const onNavigate = (k: NavKey) => {
    if (k === 'home') go({ name: 'home' });
    else if (k === 'learn') go({ name: 'learn' });
    else if (k === 'train') go({ name: 'train' });
    else go({ name: 'results' });
  };

  const active: NavKey | null =
    screen.name === 'home' ? 'home'
      : screen.name === 'learn' ? 'learn'
      : screen.name === 'train' || screen.name === 'read' || screen.name === 'set' || screen.name === 'elapsed' || screen.name === 'convert' || screen.name === 'daypart' || screen.name === 'time-attack' || screen.name === 'test'
        ? 'train'
        : screen.name === 'results' ? 'results'
        : null;

  const screenKey =
    screen.name === 'read' ? `read-${screen.difficulty ?? 'easy'}`
      : screen.name === 'set' ? `set-${screen.difficulty ?? 'easy'}`
      : screen.name === 'time-attack' ? `ta-${screen.difficulty ?? 'pick'}`
      : screen.name;

  let view: ReactNode = null;
  switch (screen.name) {
    case 'home':
      view = <HomeScreen progress={progress} go={go} />;
      break;
    case 'learn':
      view = <LearnScreen progress={progress} go={go} markStudied={markStudied} tryMarkStudiedFromStats={tryMarkStudiedFromStats} />;
      break;
    case 'train':
      view = <TrainScreen recordSkill={recordSkill} go={go} stars={progress.stars} />;
      break;
    case 'read':
      view = <ReadClockScreen difficulty={screen.difficulty} recordSkill={recordSkill} go={go} stars={progress.stars} />;
      break;
    case 'set':
      view = <SetClockScreen difficulty={screen.difficulty} recordSkill={recordSkill} go={go} stars={progress.stars} />;
      break;
    case 'elapsed':
      view = <ElapsedScreen recordSkill={recordSkill} go={go} stars={progress.stars} />;
      break;
    case 'convert':
      view = <ConvertScreen recordSkill={recordSkill} go={go} stars={progress.stars} />;
      break;
    case 'daypart':
      view = <DayPartScreen recordSkill={recordSkill} go={go} stars={progress.stars} />;
      break;
    case 'test':
      view = <TestScreen recordSkill={recordSkill} finishTest={finishTest} go={go} />;
      break;
    case 'time-attack':
      view = <TimeAttackScreen difficulty={screen.difficulty} recordSkill={recordSkill} finishTimeAttack={finishTimeAttack} go={go} />;
      break;
    case 'results':
      view = <ResultsScreen progress={progress} go={go} resetProgress={resetProgress} importProgress={importProgress} />;
      break;
  }

  return (
    <div className="min-h-screen font-body text-ink">
      <Decor />
      <div key={screenKey} className="animate-screen-in">{view}</div>
      <BottomNav active={active} onNavigate={onNavigate} />
      <UpdateBanner current={`v${__APP_VERSION__}`} />
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
          <div className="inline-flex items-center gap-2 animate-toast rounded-full bg-ink px-5 py-2.5 font-extrabold text-white shadow-xl">
            <Award size={18} /> Новое достижение: {toast}
          </div>
        </div>
      )}
    </div>
  );
}
