import { useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CATEGORIES } from '../data/projects.js';
import ProjectShowcase from './ProjectShowcase.jsx';

const readyProjects = CATEGORIES.find((category) => category.key === 'ready')?.projects ?? [];
const readyProjectByFolder = new Map(readyProjects.map((project) => [project.folder, project]));
const featuredProjectConfig = [
  {
    folder: 'MOHAKHALI DOHS',
    title: 'Mosque',
    category: 'religious',
    categoryAnchor: true,
    description:
      'A contemporary sacred architecture project in Dhaka designed around the interplay of natural light and shadow, creating a serene atmosphere.',
  },
  {
    folder: 'bashundhara',
    title: 'Residential',
    category: 'residential',
    categoryAnchor: true,
    description:
      'A contemporary residential project in Dhaka, designed to combine practical living with thoughtful architectural details.',
  },
  {
    folder: 'kitchen d5',
    title: 'Interior Design',
    category: 'commercial',
    categoryAnchor: true,
    description:
      'A carefully composed interior that balances material, light, and practical everyday use.',
  },
  {
    folder: 'khilkhet full unit',
    title: 'Architecture',
    category: 'residential',
    description:
      'A residential architecture project shaped by clear planning and thoughtful details.',
  },
  {
    folder: 'duplex reading',
    title: 'House Interior',
    category: 'residential',
    description:
      'A warm home interior designed around comfort, natural textures, and quiet moments.',
  },
  {
    folder: 'Advocate',
    title: 'Office Interior',
    category: 'commercial',
    description:
      'A professional interior focused on a calm atmosphere, purposeful details, and everyday functionality.',
    imageStart: 0,
    imageEnd: 6,
  },
  {
    folder: 'Advocate',
    title: 'Advocate Interior',
    category: 'commercial',
    description:
      'An advocate’s interior space bringing together a welcoming character and considered design.',
    imageStart: 6,
  },
];
const featuredProjects = featuredProjectConfig.flatMap((item) => {
  const project = readyProjectByFolder.get(item.folder);
  if (!project) return [];

  const projectImages = item.imageStart === undefined
    ? project.images
    : project.images.slice(item.imageStart, item.imageEnd);

  return [{
    ...item,
    project,
    sectionId: item.categoryAnchor ? `project-${item.category}` : undefined,
    images: [...new Set([
      ...(item.imageStart === 6 ? [] : [project.cover]),
      ...projectImages,
    ].filter(Boolean))],
  }];
});

export default function Hero() {
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
  }, []);

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
      const start = documentTop + timeline.startY - viewportHeight * 0.7;
      const end = documentTop + timeline.endY - viewportHeight * 0.88;
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

  return (
    <section className="bg-[#f4f3f1] text-[#111111]">
      <div className="mx-auto w-[min(1240px,calc(100%-3rem))] pb-14 pt-10 max-[700px]:w-[calc(100%-1.5rem)] max-[700px]:pb-10 max-[700px]:pt-8">
        <div className="flex flex-col items-center justify-center pt-8 text-center">
          <h1 className="inline-block w-fit max-w-full text-3xl font-medium leading-[1.08] tracking-[-0.045em] text-black md:text-4xl">
            <span className="block overflow-hidden pb-1">
              <motion.span
                className="block"
                initial={{ opacity: 0, y: '110%' }}
                animate={{ opacity: 1, y: '0%' }}
                transition={{ duration: 1, delay: 2, ease: [0.16, 1, 0.3, 1] }}
              >
                Spaces shaped by thought.
              </motion.span>
            </span>
            <span className="mt-1 block overflow-hidden pb-1">
              <motion.span
                className="block"
                initial={{ opacity: 0, y: '110%' }}
                animate={{ opacity: 1, y: '0%' }}
                transition={{ duration: 1, delay: 2.25, ease: [0.16, 1, 0.3, 1] }}
              >
                Defined by purpose.
              </motion.span>
            </span>
            <motion.span
              aria-hidden="true"
              className="mt-3 block h-[2px] w-full origin-left bg-[#d87946]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.3, 1] }}
            />
          </h1>
          <p
            className="mt-6 text-[0.68rem] font-medium uppercase tracking-[0.3em] text-black/50"
          >
            Architecture · Interior · Landscape
          </p>
        </div>

        <div className="mt-10 flex items-center justify-center">
          <span className="text-[0.62rem] font-medium uppercase tracking-[0.4em] text-black/45">
            Selected work
          </span>
        </div>

        <div ref={timelineRef} className="relative mx-auto mt-10 max-w-[1080px]">
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
            {featuredProjects.map(({ project, title, description, images, sectionId }, index) => (
              <ProjectShowcase
                key={`${project.folder}-${title}`}
                title={title}
                location={project.location || 'Dhaka'}
                description={description}
                images={images}
                index={index}
                sectionId={sectionId}
                projectListAnchor={index === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
