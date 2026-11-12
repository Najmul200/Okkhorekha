import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import ProjectShowcase from './ProjectShowcase.jsx';
import usePublishedProjects from '../hooks/usePublishedProjects.js';

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const [introReady, setIntroReady] = useState(false);
  const homeProjects = usePublishedProjects({ includeUnpublished: true });
  const [visibleProjectCount, setVisibleProjectCount] = useState(2);
  const visibleProjects = homeProjects.slice(0, visibleProjectCount);
  const loadMoreRef = useRef(null);
  const drawnLengthRef = useRef(0);
  const timelineRef = useRef(null);
  const [timeline, setTimeline] = useState({
    segments: [],
    width: 0,
    height: 0,
    startY: 0,
    endY: 0,
  });

  useEffect(() => {
    if (!document.querySelector('[data-site-preloader]')) {
      setIntroReady(true);
      return undefined;
    }

    const revealIntro = () => setIntroReady(true);
    window.addEventListener('site-preloader-opened', revealIntro, { once: true });
    return () => window.removeEventListener('site-preloader-opened', revealIntro);
  }, []);

  useEffect(() => {
    if (visibleProjectCount >= homeProjects.length) return undefined;

    const loadNextProjects = () => {
      const sentinel = loadMoreRef.current;
      if (!sentinel || window.scrollY <= 0) return;
      if (sentinel.getBoundingClientRect().top > window.innerHeight) return;

      setVisibleProjectCount((count) => Math.min(count + 2, homeProjects.length));
    };

    window.addEventListener('scroll', loadNextProjects, { passive: true });
    return () => window.removeEventListener('scroll', loadNextProjects);
  }, [homeProjects.length, visibleProjectCount]);

  useLayoutEffect(() => {
    const container = timelineRef.current;
    if (!container) return undefined;

    const updateTimeline = () => {
      const bounds = container.getBoundingClientRect();
      const width = bounds.width;
      const height = bounds.height;
      const cards = Array.from(container.querySelectorAll('[data-timeline-card]'));
      const points = cards.map((card) => {
        const marker = card.querySelector('[data-timeline-marker]');
        const gallery = card.querySelector('[data-timeline-gallery]');
        if (!marker || !gallery) return null;
        const rect = marker.getBoundingClientRect();
        const galleryRect = gallery.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        const description = card.querySelector('[data-timeline-description]');
        const descriptionRect = description?.getBoundingClientRect();
        const markerX = rect.left + rect.width / 2 - bounds.left;
        const galleryLeft = galleryRect.left - bounds.left;
        const galleryRight = galleryRect.right - bounds.left;
        const trackOnLeft = markerX < (galleryLeft + galleryRight) / 2;
        return {
          x: markerX,
          trackX: trackOnLeft ? galleryLeft - 8 : galleryRight + 8,
          y: rect.top + rect.height / 2 - bounds.top,
          contentBottom: Math.max(
            galleryRect.bottom,
            descriptionRect?.bottom ?? galleryRect.bottom
          ) - bounds.top,
          cardTop: cardRect.top - bounds.top,
        };
      }).filter(Boolean);

      if (points.length === 0) {
        setTimeline({ segments: [], width, height, startY: 0, endY: 0 });
        return;
      }

      const segments = [];
      const addSegment = (kind, fromX, fromY, toX, toY) => {
        const length = Math.abs(toX - fromX) + Math.abs(toY - fromY);
        if (length === 0) return;
        segments.push({
          kind,
          length,
          d: `M ${fromX} ${fromY} L ${toX} ${toY}`,
        });
      };

      addSegment('horizontal', points[0].x, points[0].y, points[0].trackX, points[0].y);
      points.forEach((point, index) => {
        const next = points[index + 1];
        if (!next) {
          addSegment('vertical', point.trackX, point.y, point.trackX, point.contentBottom + 14);
          return;
        }

        const gapStart = point.contentBottom + 8;
        const gapEnd = next.cardTop - 8;
        const gapY = gapStart <= gapEnd
          ? (gapStart + gapEnd) / 2
          : (point.contentBottom + next.cardTop) / 2;
        addSegment('vertical', point.trackX, point.y, point.trackX, gapY);
        addSegment('horizontal', point.trackX, gapY, next.trackX, gapY);
        addSegment('vertical', next.trackX, gapY, next.trackX, next.y);
        addSegment('horizontal', next.trackX, next.y, next.x, next.y);
      });
      setTimeline({
        segments,
        width,
        height,
        startY: points[0].y,
        endY: points[points.length - 1].contentBottom + 14,
      });
    };

    updateTimeline();
    const observer = new ResizeObserver(updateTimeline);
    observer.observe(container);
    container.querySelectorAll('[data-timeline-card]').forEach((card) => observer.observe(card));
    window.addEventListener('project-reveal-complete', updateTimeline);
    window.addEventListener('resize', updateTimeline);

    return () => {
      observer.disconnect();
      window.removeEventListener('project-reveal-complete', updateTimeline);
      window.removeEventListener('resize', updateTimeline);
    };
  }, [homeProjects, visibleProjectCount]);

  useLayoutEffect(() => {
    const container = timelineRef.current;
    if (!container || timeline.segments.length === 0) return undefined;

    const totalLength = timeline.segments.reduce((total, segment) => total + segment.length, 0);
    const preservedDrawnLength = Math.min(drawnLengthRef.current, totalLength);
    let progressFloor = preservedDrawnLength / totalLength;
    let lastScrollY = window.scrollY;
    let frame = 0;
    let currentProgress = progressFloor;
    let targetProgress = progressFloor;
    let previousTime = 0;
    let initialized = false;

    const drawProgress = (progress) => {
      let remainingLength = totalLength * progress;
      let totalDrawnLength = 0;

      container.querySelectorAll('[data-timeline-segment]').forEach((path, index) => {
        const segment = timeline.segments[index];
        const drawnLength = Math.max(0, Math.min(segment.length, remainingLength));
        path.style.strokeDashoffset = String(segment.length - drawnLength);
        remainingLength -= drawnLength;
        totalDrawnLength += drawnLength;
      });
      drawnLengthRef.current = totalDrawnLength;
    };
    const animateProgress = (time) => {
      frame = 0;
      const elapsed = previousTime ? Math.min(time - previousTime, 64) : 16;
      previousTime = time;
      const easing = 1 - Math.exp(-elapsed / 220);
      currentProgress += (targetProgress - currentProgress) * easing;

      if (Math.abs(targetProgress - currentProgress) < 0.0005) {
        currentProgress = targetProgress;
      }
      drawProgress(currentProgress);

      if (currentProgress !== targetProgress) {
        frame = requestAnimationFrame(animateProgress);
      } else {
        previousTime = 0;
      }
    };

    const updateProgress = () => {
      const bounds = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const documentTop = bounds.top + window.scrollY;
      const start = Math.max(0, documentTop + timeline.startY - viewportHeight * 0.7);
      const end = documentTop + timeline.endY - viewportHeight * 0.96;
      const scrollProgress = Math.max(
        0,
        Math.min(1, (window.scrollY - start) / Math.max(end - start, 1))
      );
      if (window.scrollY < lastScrollY) progressFloor = scrollProgress;
      targetProgress = Math.max(progressFloor, scrollProgress);
      lastScrollY = window.scrollY;

      if (!initialized || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        cancelAnimationFrame(frame);
        frame = 0;
        previousTime = 0;
        initialized = true;
        currentProgress = targetProgress;
        drawProgress(currentProgress);
        return;
      }

      if (!frame) frame = requestAnimationFrame(animateProgress);
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [timeline]);


  return (
    <section className="bg-paper text-[#111]">
      <div className="mx-auto w-[min(1240px,calc(100%-3rem))] pb-14 pt-10 max-[700px]:w-[calc(100%-1.5rem)] max-[700px]:pb-10 max-[700px]:pt-8">
        <div className="flex min-h-[170px] flex-col items-center justify-center pt-8 text-center">
          {introReady && (
            <>
              <h1 className="inline-block w-fit max-w-full text-3xl font-medium leading-[1.08] tracking-[-0.045em] text-black md:text-4xl">
                <span className="block overflow-hidden pb-1">
                  <motion.span
                    className="block"
                    initial={reduceMotion ? false : { opacity: 0, y: '110%', textShadow: '0 0 0 rgba(216, 121, 70, 0)' }}
                    animate={{ opacity: 1, y: '0%', textShadow: reduceMotion ? '0 0 0 rgba(216, 121, 70, 0)' : ['0 0 0 rgba(216, 121, 70, 0)', '0 0 10px rgba(216, 121, 70, 0.24)'] }}
                    whileHover={reduceMotion ? undefined : { y: -3, color: '#b95e32' }}
                    transition={{ opacity: { duration: 0.55, delay: 0.05 }, y: { duration: 0.65, delay: 0.05, ease: [0.16, 1, 0.3, 1] }, textShadow: { duration: 2.8, delay: 0.85, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' } }}
                  >
                    <motion.span className="block" animate={reduceMotion ? undefined : { y: [0, -2, 0] }} transition={{ duration: 2.2, delay: 0.8, repeat: Infinity, ease: 'easeInOut' }}>
                      Spaces shaped by thought.
                    </motion.span>
                  </motion.span>
                </span>
                <span className="mt-1 block overflow-hidden pb-1">
                  <motion.span
                    className="block"
                    initial={reduceMotion ? false : { opacity: 0, y: '110%', textShadow: '0 0 0 rgba(216, 121, 70, 0)' }}
                    animate={{ opacity: 1, y: '0%', textShadow: reduceMotion ? '0 0 0 rgba(216, 121, 70, 0)' : ['0 0 0 rgba(216, 121, 70, 0)', '0 0 10px rgba(216, 121, 70, 0.24)'] }}
                    whileHover={reduceMotion ? undefined : { y: -3, color: '#b95e32' }}
                    transition={{ opacity: { duration: 0.55, delay: 0.22 }, y: { duration: 0.65, delay: 0.22, ease: [0.16, 1, 0.3, 1] }, textShadow: { duration: 2.8, delay: 1.02, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' } }}
                  >
                    <motion.span className="block" animate={reduceMotion ? undefined : { y: [0, -2, 0] }} transition={{ duration: 2.2, delay: 1.02, repeat: Infinity, ease: 'easeInOut' }}>
                      Defined by purpose.
                    </motion.span>
                  </motion.span>
                </span>
                <motion.span aria-hidden="true" className="mt-3 block h-0.5 w-full origin-left bg-[#d87946]" initial={reduceMotion ? false : { scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: reduceMotion ? 0 : 1.1, delay: 0.15, ease: [0.22, 1, 0.3, 1] }} />
              </h1>
              <p className="mt-6 text-[0.68rem] font-medium uppercase tracking-[0.3em] text-black/50">
                Architecture · Interior · Landscape
              </p>
            </>
          )}
        </div>
        <div aria-hidden="true" className="mt-10 h-4" />
        <div ref={timelineRef} className="relative mx-auto max-w-7xl">
            <svg
              className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
              viewBox={`0 0 ${timeline.width} ${timeline.height}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {timeline.segments.map((segment, index) => (
                <path
                  key={`${segment.kind}-${index}`}
                  data-timeline-segment
                  d={segment.d}
                  fill="none"
                  stroke="#d87946"
                  strokeWidth={segment.kind === 'vertical' ? 4 : 1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={segment.length}
                  strokeDashoffset={segment.length}
                />
              ))}
            </svg>
            <div className="space-y-4 pl-0 md:space-y-0">
              {visibleProjects.map((project, index) => (
                <ProjectShowcase
                  key={project.id}
                  title={project.name}
                  location={project.location || 'Dhaka'}
                  year={project.year}
                  description={project.description}
                  images={project.cover_url ? [project.cover_url] : []}
                  index={index}
                  projectListAnchor={index === 0}
                  initiallyVisible={index < 2}
                  homeSize
                  project={project}
                />
              ))}
              <div ref={loadMoreRef} aria-hidden="true" className="h-px" />
            </div>
          </div>
      </div>
    </section>
  );
}
