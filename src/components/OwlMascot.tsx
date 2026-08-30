import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import type { DotLottie } from '@lottiefiles/dotlottie-react';
import { useEffect, useState } from 'react';

export default function OwlMascot({
  play,
  message,
  className = '',
}: {
  play: boolean;
  message?: string;
  className?: string;
}) {
  const [dotLottie, setDotLottie] = useState<DotLottie | null>(null);

  // Idle — frozen at frame 0 (no animation)
  useEffect(() => {
    if (!dotLottie) return;
    if (!play) {
      dotLottie.pause();
      dotLottie.setFrame(0);
    }
  }, [dotLottie, play]);

  // When play becomes true — play to 45 then freeze; do not loop further
  useEffect(() => {
    if (!dotLottie || !play) return;
    dotLottie.setFrame(0);
    dotLottie.play();

    const onFrame = () => {
      const f = dotLottie.currentFrame;
      if (f >= 45) {
        dotLottie.pause();
        dotLottie.setFrame(45);
      }
    };
    (dotLottie as unknown as { addEventListener: (e: string, cb: () => void) => void; removeEventListener: (e: string, cb: () => void) => void }).addEventListener('frame', onFrame);
    return () => (dotLottie as unknown as { removeEventListener: (e: string, cb: () => void) => void }).removeEventListener('frame', onFrame);
  }, [dotLottie, play]);

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div aria-hidden className="h-[96px] w-[96px] shrink-0">
        <DotLottieReact src={`${import.meta.env.BASE_URL}owl.json`} autoplay={false} loop={false} dotLottieRefCallback={setDotLottie} className="h-[96px] w-[96px]" />
      </div>
      {message && (
        <div className="animate-pop-in relative rounded-2xl rounded-bl-md bg-white px-4 py-2.5 font-extrabold shadow-[0_4px_0_#ece3d2]">
          {message}
        </div>
      )}
    </div>
  );
}
