import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const MAXIMUM_DISPLAY_MS = 5000;
const PROGRESS_STEP_INTERVAL_MS = 190;
const PROGRESS_STEPS = [10, 30, 50, 80, 90, 92, 94, 96, 97, 98];
const CURTAIN_DURATION_MS = 850;

export default function SiteIntro() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(!reduceMotion);
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      setVisible(false);
      return undefined;
    }

    let loadingFinished = false;
    let progressComplete = false;
    let completionStarted = false;
    let progressTimer;
    let fallbackTimer;
    let removeTimer;
    let completeTimer;

    const completeLoading = () => {
      if (!loadingFinished || !progressComplete || completionStarted) return;
      completionStarted = true;
      setProgress(100);
      completeTimer = window.setTimeout(() => {
        setLeaving(true);
        removeTimer = window.setTimeout(() => {
          window.dispatchEvent(new Event('site-preloader-opened'));
          setVisible(false);
        }, CURTAIN_DURATION_MS);
      }, 50);
    };

    const finishLoading = () => {
      if (loadingFinished) return;
      loadingFinished = true;
      window.clearTimeout(fallbackTimer);
      completeLoading();
    };

    let progressStep = 0;
    const advanceProgress = () => {
      const nextProgress = PROGRESS_STEPS[progressStep];
      if (nextProgress === undefined) {
        progressComplete = true;
        completeLoading();
        return;
      }

      progressStep += 1;
      setProgress(nextProgress);
      if (progressStep === PROGRESS_STEPS.length) {
        progressComplete = true;
        completeLoading();
        return;
      }
      progressTimer = window.setTimeout(advanceProgress, PROGRESS_STEP_INTERVAL_MS);
    };

    progressTimer = window.setTimeout(advanceProgress, PROGRESS_STEP_INTERVAL_MS);
    fallbackTimer = window.setTimeout(finishLoading, MAXIMUM_DISPLAY_MS);

    if (document.readyState === 'complete') {
      finishLoading();
    } else {
      window.addEventListener('load', finishLoading, { once: true });
    }

    return () => {
      window.clearTimeout(progressTimer);
      window.clearTimeout(fallbackTimer);
      window.clearTimeout(removeTimer);
      window.clearTimeout(completeTimer);
      window.removeEventListener('load', finishLoading);
    };
  }, [reduceMotion]);

  useEffect(() => {
    if (!visible || reduceMotion) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible, reduceMotion]);

  if (!visible || reduceMotion) return null;

  return (
    <div
      aria-label="Welcome to Akkhorekha"
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
        <motion.p
          className="mb-3 text-base font-semibold uppercase tracking-[0.3em] text-white/90 sm:text-lg"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          Welcome to
        </motion.p>
        <motion.img
          src="/images/AKKHOREKHA.png"
          alt="অক্ষরেখা"
          className="h-auto w-full object-contain"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        <div className="mt-8 flex w-full items-center gap-3">
          <div
            className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-white/20"
            role="progressbar"
            aria-label="Page loading progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.floor(progress)}
          >
            <motion.div
              className="h-full rounded-full bg-[#d28745]"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
          <span className="w-10 shrink-0 text-right text-xs font-medium tabular-nums text-[#d28745]">
            {Math.floor(progress)}%
          </span>
        </div>
      </motion.div>
    </div>
  );
}
