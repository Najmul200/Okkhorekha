import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

export default function ProjectShowcase({
  title,
  location,
  year,
  description,
  images,
  index,
  sectionId,
  projectListAnchor = false,
  id,
  project,
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [isGalleryPaused, setIsGalleryPaused] = useState(false);
  const [isGalleryInView, setIsGalleryInView] = useState(false);
  const [dbImages, setDbImages] = useState([]);
  const galleryRef = useRef(null);
  const touchStartX = useRef(null);
  const suppressClick = useRef(false);
  const galleryImages = [...new Set([...(images || []), ...dbImages].filter(Boolean))];
  const contentOnLeft = index % 2 === 0;
  const previousImage = (activeImage - 1 + galleryImages.length) % galleryImages.length;
  const nextImage = (activeImage + 1) % galleryImages.length;
  const visibleImages = galleryImages.length > 2
    ? [previousImage, activeImage, nextImage]
    : galleryImages.map((_, imageIndex) => imageIndex);

  // Supabase থেকে প্রজেক্টের গ্যালারি ছবি অটো লোড করা
  useEffect(() => {
    const projId = project?.id || id;
    let active = true;
    if (!projId) {
      setDbImages([]);
      return undefined;
    }

    supabase
      .from('project_images')
      .select('image_url')
      .eq('project_id', projId)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error('Failed to load project gallery images:', error);
          return;
        }
        setDbImages((data || []).map((img) => img.image_url));
      });

    return () => {
      active = false;
    };
  }, [project?.id, id]);
  useEffect(() => {
    if (galleryImages.length < 2 || !isGalleryInView || isGalleryPaused || lightboxIndex !== null) return undefined;

    const firstSlide = window.setTimeout(() => {
      setActiveImage((current) => (current + 1) % galleryImages.length);
    }, 250);
    const interval = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % galleryImages.length);
    }, 3250);

    return () => {
      window.clearTimeout(firstSlide);
      window.clearInterval(interval);
    };
  }, [galleryImages.length, isGalleryInView, isGalleryPaused, lightboxIndex]);

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return undefined;

    const selectActiveGallery = () => {
      const viewportCenter = window.innerHeight / 2;
      const candidates = Array.from(document.querySelectorAll('[data-project-gallery]'))
        .map((element) => {
          const bounds = element.getBoundingClientRect();
          const visibleHeight = Math.max(
            0,
            Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, 0)
          );
          return {
            id: element.dataset.galleryIndex,
            ratio: visibleHeight / bounds.height,
            distance: Math.abs((bounds.top + bounds.bottom) / 2 - viewportCenter),
          };
        })
        .filter((candidate) => candidate.ratio >= 0.5)
        .sort((a, b) => a.distance - b.distance);

      window.dispatchEvent(new CustomEvent('project-gallery-active', {
        detail: candidates[0]?.id ?? null,
      }));
    };

    const handleIntersection = () => selectActiveGallery();
    const handleActiveGallery = (event) => {
      setIsGalleryInView(event.detail === String(index));
    };
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: [0, 0.5],
    });

    observer.observe(gallery);
    window.addEventListener('project-gallery-active', handleActiveGallery);
    window.addEventListener('resize', selectActiveGallery);
    selectActiveGallery();

    return () => {
      observer.disconnect();
      window.removeEventListener('project-gallery-active', handleActiveGallery);
      window.removeEventListener('resize', selectActiveGallery);
    };
  }, [index]);

  useEffect(() => {
    if (lightboxIndex === null) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setLightboxIndex(null);
      if (event.key === 'ArrowRight') {
        setLightboxIndex((current) => (current + 1) % galleryImages.length);
      }
      if (event.key === 'ArrowLeft') {
        setLightboxIndex((current) => (current - 1 + galleryImages.length) % galleryImages.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [galleryImages.length, lightboxIndex]);

  if (galleryImages.length === 0) return null;

  const projectHeading = (
    <motion.div
      className={`flex min-w-0 flex-row flex-wrap items-center gap-2 ${
        contentOnLeft ? 'order-1' : 'order-2'
      }`}
      initial={{ opacity: 0, y: 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <span
        data-timeline-marker
        className={`relative z-20 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-black/40 bg-paper text-sm font-semibold tracking-[0.04em] text-black ${
          contentOnLeft ? 'order-1' : 'order-2'
        }`}
      >
        {String(index + 1).padStart(2, '0')}
      </span>
      <h2 className={`min-w-0 wrap-anywhere text-2xl font-medium tracking-[-0.04em] text-black md:text-3xl ${
        contentOnLeft ? 'order-2' : 'order-1'
      }`}>
        {title}
      </h2>
    </motion.div>
  );
  const projectYear = (
    <div
      className={`pt-1 text-[0.62rem] font-medium uppercase tracking-[0.26em] text-black/45 ${
        contentOnLeft ? 'order-2' : 'order-1'
      }`}
    >
      {year && <p aria-label="Project year">{year}</p>}
    </div>
  );
  const content = (
    <div
      className="col-start-2 row-start-1 flex items-start justify-between gap-4 pb-4 md:col-span-2 md:col-start-2"
    >
      {projectHeading}
      {projectYear}
    </div>
  );

  const gallery = (
    <div
      ref={galleryRef}
      data-timeline-gallery
      data-project-gallery
      data-gallery-index={index}
      className="relative z-10 col-start-2 row-start-2 h-[clamp(17rem,85vw,25rem)] min-w-0 overflow-hidden rounded-xl bg-[#d7d7d7] md:col-span-2 md:col-start-2 md:h-120"
      onMouseEnter={() => setIsGalleryPaused(true)}
      onMouseLeave={() => setIsGalleryPaused(false)}
      onFocusCapture={() => setIsGalleryPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsGalleryPaused(false);
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null) return;
        const distance = event.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(distance) < 45 || galleryImages.length < 2) return;
        suppressClick.current = true;
        window.setTimeout(() => {
          suppressClick.current = false;
        }, 500);
        setActiveImage((current) =>
          (current + (distance < 0 ? 1 : -1) + galleryImages.length) % galleryImages.length
        );
      }}
      aria-label={`${title} image gallery`}
    >
      <div className="absolute inset-0 overflow-hidden pb-10 perspective-distant">
        <AnimatePresence initial={false}>
          {visibleImages.map((imageIndex) => {
            const position = imageIndex === activeImage
              ? 'center'
              : imageIndex === previousImage
                ? 'left'
                : 'right';
            const positionStyles = {
              center: { x: '0%', scale: 1, rotateY: 0, opacity: 1, zIndex: 20 },
              left: { x: '-72%', scale: 0.72, rotateY: 12, opacity: 0.58, zIndex: 10 },
              right: { x: '72%', scale: 0.72, rotateY: -12, opacity: 0.58, zIndex: 10 },
            };

            return (
              <motion.button
                key={imageIndex}
                type="button"
                aria-label={`${position === 'center' ? 'Open' : `Show ${position}`} ${title} image ${imageIndex + 1} of ${galleryImages.length}`}
                aria-current={position === 'center' ? 'true' : undefined}
                initial={false}
                animate={positionStyles[position]}
                exit={{ opacity: 0, scale: 0.65, x: position === 'left' ? '-90%' : '90%' }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => {
                  if (suppressClick.current) {
                    suppressClick.current = false;
                    return;
                  }
                  if (position === 'center') {
                    setLightboxIndex(imageIndex);
                  } else {
                    setActiveImage(imageIndex);
                  }
                }}
                className={`absolute left-1/2 top-1/2 h-[84%] w-[68%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-white/30 bg-black/10 shadow-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  position === 'center' ? 'cursor-zoom-in' : 'cursor-pointer'
                }`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <img
                  src={galleryImages[imageIndex]}
                  alt={`${title} project view ${imageIndex + 1}`}
                  loading={index === 0 && imageIndex === activeImage ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 && imageIndex === activeImage ? 'high' : 'auto'}
                  draggable="false"
                  className="h-full w-full object-cover"
                />
                <span
                  className={`pointer-events-none absolute inset-0 transition-colors duration-500 ${
                    position === 'center' ? 'bg-transparent' : 'bg-black/25'
                  }`}
                  aria-hidden="true"
                />
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="pointer-events-none absolute inset-x-4 bottom-4 z-10 flex items-end justify-between gap-3 text-white md:inset-x-5 md:bottom-5">
        <span className="text-xs font-medium uppercase tracking-[0.15em] md:text-sm">
          {title} <span className="text-white/75">· {location}</span>
        </span>
        {galleryImages.length > 1 && (
          <span className="shrink-0 text-xs tabular-nums text-white/85">
            {String(activeImage + 1).padStart(2, '0')} / {String(galleryImages.length).padStart(2, '0')}
          </span>
        )}
      </div>

      {galleryImages.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => setActiveImage((current) => (current - 1 + galleryImages.length) % galleryImages.length)}
            className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-black/35 text-2xl text-white backdrop-blur-sm transition hover:bg-black/65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={() => setActiveImage((current) => (current + 1) % galleryImages.length)}
            className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-black/35 text-2xl text-white backdrop-blur-sm transition hover:bg-black/65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            ›
          </button>
          <div className="absolute bottom-1.5 left-1/2 z-20 flex -translate-x-1/2 gap-1.5" aria-label="Choose project image">
            {galleryImages.map((image, imageIndex) => (
              <button
                key={image}
                type="button"
                aria-label={`Show image ${imageIndex + 1}`}
                aria-current={activeImage === imageIndex ? 'true' : undefined}
                onClick={() => setActiveImage(imageIndex)}
                className={`h-1.5 rounded-full transition-all ${
                  activeImage === imageIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/60 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <motion.div
      id={projectListAnchor ? 'projects' : undefined}
      className={projectListAnchor ? 'scroll-mt-28' : undefined}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      onAnimationComplete={() => window.dispatchEvent(new Event('project-reveal-complete'))}
    >
      <article
        id={sectionId}
        data-timeline-card
        className="relative grid scroll-mt-24 grid-cols-[18px_minmax(0,1fr)] items-stretch gap-x-4 pb-12 md:grid-cols-[32px_minmax(0,1fr)_minmax(0,1fr)] md:gap-x-5 md:pb-16"
      >
        {content}
        {gallery}
        {description && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="col-start-2 row-start-3 mt-4 max-w-2xl pb-2"
          >
            <p data-timeline-description className="text-sm leading-7 text-black/60">
              {description}
            </p>
          </motion.div>
        )}
        {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 p-4 text-white backdrop-blur-sm md:p-10"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} image slideshow`}
          onClick={(event) => {
            if (event.target === event.currentTarget) setLightboxIndex(null);
          }}
        >
          <button
            type="button"
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/40 text-2xl text-white transition hover:bg-white hover:text-black"
            aria-label="Close slideshow"
            onClick={() => setLightboxIndex(null)}
          >
            ×
          </button>

          {galleryImages.length > 1 && (
            <button
              type="button"
              className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-xl text-white transition hover:bg-white hover:text-black md:left-8"
              aria-label="Previous image"
              onClick={() =>
                setLightboxIndex((current) => (current - 1 + galleryImages.length) % galleryImages.length)
              }
            >
              ‹
            </button>
          )}

          <figure className="flex max-h-full w-full max-w-6xl flex-col items-center justify-center gap-4">
            <img
              src={galleryImages[lightboxIndex]}
              alt={`${title} project view ${lightboxIndex + 1}`}
              fetchPriority="high"
              className="max-h-[78vh] w-full rounded-md object-contain"
            />
            <figcaption className="text-center text-sm text-white/75">
              {title} · {location}
              <span className="mx-2 text-white/40">|</span>
              {String(lightboxIndex + 1).padStart(2, '0')} / {String(galleryImages.length).padStart(2, '0')}
            </figcaption>
          </figure>

          {galleryImages.length > 1 && (
            <button
              type="button"
              className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-xl text-white transition hover:bg-white hover:text-black md:right-8"
              aria-label="Next image"
              onClick={() => setLightboxIndex((current) => (current + 1) % galleryImages.length)}
            >
              ›
            </button>
          )}
        </div>
        )}
      </article>
    </motion.div>
  );
}
