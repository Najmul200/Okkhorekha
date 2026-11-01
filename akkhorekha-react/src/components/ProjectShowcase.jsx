import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ProjectShowcase({ title, location, description, images, index }) {
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const galleryImages = [...new Set(images.filter(Boolean))].slice(0, 6);
  const contentOnLeft = index % 2 === 0;

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
      className="relative z-10 col-start-2 row-start-2 flex h-[18rem] min-w-0 gap-1.5 overflow-hidden rounded-xl bg-[#f4f3f1] md:col-span-2 md:col-start-2 md:h-[22rem]"
      onMouseLeave={() => setActiveImage(0)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setActiveImage(0);
      }}
      aria-label={`${title} image gallery`}
    >
      {galleryImages.map((image, imageIndex) => {
        const isActive = activeImage === imageIndex;

        return (
          <button
            key={image}
            type="button"
            aria-label={`Open ${title} image ${imageIndex + 1} of ${galleryImages.length} in slideshow`}
            aria-pressed={isActive}
            onMouseEnter={() => setActiveImage(imageIndex)}
            onFocus={() => setActiveImage(imageIndex)}
            onClick={() => setLightboxIndex(imageIndex)}
            className={`group relative min-w-0 cursor-zoom-in overflow-hidden rounded-lg border border-black/10 bg-[#d7d7d7] text-left transition-[flex-grow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
              isActive ? 'flex-[5]' : 'flex-[0.55]'
            }`}
          >
            <img
              src={image}
              alt={`${title} project view ${imageIndex + 1}`}
              loading={imageIndex === 0 ? 'eager' : 'lazy'}
              className={`h-full w-full object-cover transition-transform duration-700 ${
                isActive ? 'scale-100' : 'scale-110 group-hover:scale-100'
              }`}
            />
            <span
              className={`absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 transition-opacity duration-500 ${
                isActive ? 'opacity-100' : 'opacity-45'
              }`}
              aria-hidden="true"
            />
            {isActive && (
              <span className="absolute bottom-3 left-3 text-xs font-medium uppercase tracking-[0.15em] text-white md:bottom-4 md:left-4 md:text-sm">
                {title} <span className="text-white/75">· {location}</span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      onAnimationComplete={() => window.dispatchEvent(new Event('project-reveal-complete'))}
    >
      <article
        data-timeline-card
        className="relative grid grid-cols-[18px_minmax(0,1fr)] items-stretch gap-x-4 pb-12 md:grid-cols-[32px_minmax(0,1fr)_minmax(0,1fr)] md:gap-x-5 md:pb-16"
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
