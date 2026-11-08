import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const MINIMUM_DISPLAY_MS = 1000;
const MAXIMUM_DISPLAY_MS = 3500;
const CURTAIN_DURATION_MS = 850;

export default function SiteIntro() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(!reduceMotion);
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (reduceMotion) {
      setVisible(false);
      return undefined;
    }

    finishedRef.current = false;
    const startedAt = Date.now();
    let progressTimer;
    let fallbackTimer;
    let finishTimer;
    let removeTimer;

    const finishLoading = () => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      window.clearInterval(progressTimer);
      window.clearTimeout(fallbackTimer);
      setProgress(100);

      const minimumRemaining = Math.max(0, MINIMUM_DISPLAY_MS - (Date.now() - startedAt));
      finishTimer = window.setTimeout(() => {
        setLeaving(true);
        removeTimer = window.setTimeout(() => {
          setVisible(false);
          window.dispatchEvent(new Event('site-preloader-complete'));
        }, CURTAIN_DURATION_MS);
      }, minimumRemaining);
    };

    progressTimer = window.setInterval(() => {
      setProgress((current) => Math.min(90, current + (current < 65 ? 2 : 0.8)));
    }, 40);
    fallbackTimer = window.setTimeout(finishLoading, MAXIMUM_DISPLAY_MS);

    if (document.readyState === 'complete') {
      finishLoading();
    } else {
      window.addEventListener('load', finishLoading, { once: true });
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(fallbackTimer);
      window.clearTimeout(finishTimer);
      window.clearTimeout(removeTimer);
      window.removeEventListener('load', finishLoading);
      document.body.style.overflow = previousOverflow;
    };
  }, [reduceMotion]);

  if (!visible || reduceMotion) return null;

  return (
    <div
      aria-label="Loading Akkhorekha website"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden text-white"
      data-site-preloader
      role="status"
    >
      <motion.div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 z-0 w-1/2 bg-[#080808]"
        initial={{ x: '0%' }}
        animate={{ x: leaving ? '-102%' : '0%' }}
        transition={{ duration: CURTAIN_DURATION_MS / 1000, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 z-0 w-1/2 bg-[#080808]"
        initial={{ x: '0%' }}
        animate={{ x: leaving ? '102%' : '0%' }}
        transition={{ duration: CURTAIN_DURATION_MS / 1000, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div
        className="relative z-10 flex w-[min(64vw,18rem)] flex-col items-center"
        animate={leaving ? { opacity: 0, scale: 0.98 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <motion.img
          src="/images/AKKHOREKHA.png"
          alt="অক্ষরেখা"
          className="h-auto w-full object-contain"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        <div
          className="mt-8 h-px w-full overflow-hidden bg-white/20"
          role="progressbar"
          aria-label="Page loading progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.floor(progress)}
        >
          <motion.div
            className="h-full origin-left bg-[#d28745]"
            animate={{ scaleX: progress / 100 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          />
        </div>
      </motion.div>
    </div>
  );
}
