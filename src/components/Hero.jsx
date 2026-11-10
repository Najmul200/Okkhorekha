import { useLayoutEffect, useRef, useState } from 'react';
import ProjectShowcase from './ProjectShowcase.jsx';
import usePublishedProjects from '../hooks/usePublishedProjects.js';

export default function Hero() {
  const homeProjects = usePublishedProjects({ homeOnly: true });
  const timelineRef = useRef(null);
  const [timeline, setTimeline] = useState({
    segments: [],
    width: 0,
    height: 0,
    startY: 0,
    endY: 0,
  });

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
  }, [homeProjects]);

  useLayoutEffect(() => {
    const container = timelineRef.current;
    if (!container || timeline.segments.length === 0) return undefined;

    const totalLength = timeline.segments.reduce((total, segment) => total + segment.length, 0);
    let frame = 0;
    let currentProgress = 0;
    let targetProgress = 0;
    let previousTime = 0;
    let initialized = false;

    const drawProgress = (progress) => {
      let remainingLength = totalLength * progress;

      container.querySelectorAll('[data-timeline-segment]').forEach((path, index) => {
        const segment = timeline.segments[index];
        const drawnLength = Math.max(0, Math.min(segment.length, remainingLength));
        path.style.strokeDashoffset = String(segment.length - drawnLength);
        remainingLength -= drawnLength;
      });
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
      targetProgress = Math.max(
        0,
        Math.min(1, (window.scrollY - start) / Math.max(end - start, 1))
      );

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

  if (homeProjects.length === 0) return null;

  return (
    <section className="bg-paper text-[#111]">
      <div className="mx-auto w-[min(1240px,calc(100%-3rem))] pb-14 pt-10 max-[700px]:w-[calc(100%-1.5rem)] max-[700px]:pb-10 max-[700px]:pt-8">
          <div ref={timelineRef} className="relative mx-auto max-w-270">
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
              {homeProjects.map((project, index) => (
                <ProjectShowcase
                  key={project.id}
                  title={project.name}
                  location={project.location || 'Dhaka'}
                  year={project.year}
                  description={project.description}
                  images={project.cover_url ? [project.cover_url] : []}
                  index={index}
                  projectListAnchor={index === 0}
                  project={project}
                />
              ))}
            </div>
          </div>
      </div>
    </section>
  );
}
