import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function ProjectShowcase({
  title,
  location,
  description,
  images,
  index,
  sectionId,
  projectListAnchor = false,
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [isGalleryPaused, setIsGalleryPaused] = useState(false);
  const touchStartX = useRef(null);
  const suppressClick = useRef(false);
  const galleryImages = [...new Set(images.filter(Boolean))].slice(0, 6);
  const contentOnLeft = index % 2 === 0;

  useEffect(() => {
    if (galleryImages.length < 2 || isGalleryPaused || lightboxIndex !== null) return undefined;

    const interval = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % galleryImages.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [galleryImages.length, isGalleryPaused, lightboxIndex]);

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
      className={`flex flex-row items-center gap-2 ${
        contentOnLeft ? 'order-1' : 'order-2'
      }`}
      initial={{ opacity: 0, y: 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <span
        data-timeline-marker
        className={`relative z-20 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-black/40 bg-[#f4f3f1] text-sm font-semibold tracking-[0.04em] text-black ${
          contentOnLeft ? 'order-1' : 'order-2'
        }`}
      >
        {String(index + 1).padStart(2, '0')}
      </span>
      <h2 className={`text-2xl font-medium tracking-[-0.04em] text-black md:text-3xl ${
        contentOnLeft ? 'order-2' : 'order-1'
      }`}>
        {title}
      </h2>
    </motion.div>
  );
  const projectLocation = (
    <p
        className={`pt-1 text-[0.62rem] font-medium uppercase tracking-[0.26em] text-black/45 ${
        contentOnLeft ? 'order-2' : 'order-1'
      }`}
      aria-label="Project location"
    >
      {location}
    </p>
  );
  const content = (
    <div
      className="col-start-2 row-start-1 flex items-start justify-between gap-4 pb-4 md:col-span-2 md:col-start-2"
    >
      {projectHeading}
      {projectLocation}
    </div>
  );

  const gallery = (
    <div
      data-timeline-gallery
      className="relative z-10 col-start-2 row-start-2 h-[18rem] min-w-0 overflow-hidden rounded-xl bg-[#d7d7d7] md:col-span-2 md:col-start-2 md:h-[22rem]"
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
      <button
        type="button"
        aria-label={`Open ${title} image ${activeImage + 1} of ${galleryImages.length} in slideshow`}
        onClick={() => {
          if (suppressClick.current) {
            suppressClick.current = false;
            return;
          }
          setLightboxIndex(activeImage);
        }}
        className="absolute inset-0 z-0 block h-full w-full cursor-zoom-in text-left focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={galleryImages[activeImage]}
            src={galleryImages[activeImage]}
            alt={`${title} project view ${activeImage + 1}`}
            loading={activeImage === 0 ? 'eager' : 'lazy'}
            initial={{ opacity: 0, x: 24, scale: 1.02 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            draggable="false"
            className="h-full w-full object-cover"
          />
        </AnimatePresence>
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" aria-hidden="true" />
      </button>

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
            className="col-start-2 row-start-3 mt-4 max-w-[42rem] pb-2"
          >
            <p data-timeline-description className="text-sm leading-7 text-black/60">
              {description}
            </p>
          </motion.div>
        )}
        {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 text-white backdrop-blur-sm md:p-10"
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
