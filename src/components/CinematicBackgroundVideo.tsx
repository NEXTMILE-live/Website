import { useRef, useEffect, useState } from 'react';

export default function CinematicBackgroundVideo({
  poster = '/about-video-poster.webp',
  mp4Src = '/about-bg.mp4',
  webmSrc = '/about-bg.webm',
  className = '',
}: {
  poster?: string;
  mp4Src?: string;
  webmSrc?: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <img
        src={poster}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {!reducedMotion && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={poster}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0, transition: 'opacity 1.5s ease' }}
          onCanPlay={(e) => {
            (e.currentTarget as HTMLVideoElement).style.opacity = '1';
          }}
        >
          {webmSrc && <source src={webmSrc} type="video/webm" />}
          <source src={mp4Src} type="video/mp4" />
        </video>
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 via-charcoal/20 to-charcoal/40" />
    </div>
  );
}
