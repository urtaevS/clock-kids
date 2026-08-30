import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import type { DotLottie } from '@lottiefiles/dotlottie-react';
import { useEffect, useState } from 'react';

export default function Mascot({ message, className = '' }: { message?: string; className?: string }) {
  const [dotLottie, setDotLottie] = useState<DotLottie | null>(null);

  useEffect(() => {
    if (!dotLottie) return;
    const onComplete = () => {
      dotLottie.pause();
      setTimeout(() => dotLottie.play(), 3000);
    };
    dotLottie.addEventListener('complete', onComplete);
    return () => dotLottie.removeEventListener('complete', onComplete);
  }, [dotLottie]);

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div aria-hidden className="h-[68px] w-[68px] shrink-0">
        <DotLottieReact
          src={`${import.meta.env.BASE_URL}mascot.json`}
          autoplay
          dotLottieRefCallback={setDotLottie}
          className="h-[68px] w-[68px]"
        />
      </div>
      {message && (
        <div className="animate-pop-in relative rounded-2xl rounded-bl-md bg-white px-4 py-2.5 font-extrabold shadow-[0_4px_0_#ece3d2]">
          {message}
        </div>
      )}
    </div>
  );
}