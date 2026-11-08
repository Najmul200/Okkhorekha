import { useCallback, useEffect, useRef, useState } from 'react';

export default function Lightbox({ project, startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const thumbsRef = useRef(null);
  const touchX = useRef(null);
 const images = Array.isArray(project?.images) 
  ? project.images 
  : Object.values(project?.images || {});
const total = images.length;

  const prev = useCallback(() => setIndex((i) => (i - 1 + total) % total), [total]);
  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = oldOverflow;
    };
  }, [onClose, prev, next]);

  useEffect(() => {
    const el = thumbsRef.current?.children[index];
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [index]);

  return (
    <div
      className="fixed inset-0 z-100 flex flex-col gap-3 bg-black/95 p-4 text-white"
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} photos`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <strong className="max-w-[65vw] truncate">{project.title}</strong>
          <span className="shrink-0 text-sm text-white/65">
            {index + 1} / {total}
          </span>
        </div>
        <button type="button" className="h-11 w-11 rounded-full border border-white/25 bg-white/10 text-lg text-white transition-colors hover:bg-white hover:text-black" aria-label="Close gallery" onClick={onClose}>
          ✕
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
          touchX.current = null;
        }}
      >
        {total > 1 && (
          <button type="button" className="pointer-events-auto absolute left-1 top-1/2 z-5 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-black/65 text-xl text-white backdrop-blur transition-colors hover:bg-white hover:text-black max-[768px]:h-11 max-[768px]:w-11 max-[768px]:text-base" aria-label="Previous photo" onClick={prev}>
            ❮
          </button>
        )}
        <img
          className="h-auto max-h-full w-auto max-w-full rounded-sm object-contain"
          src={images[index]}
          alt={`${project.alt || project.title} – photo ${index + 1}`}
        />
        {total > 1 && (
          <button type="button" className="pointer-events-auto absolute right-1 top-1/2 z-5 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-black/65 text-xl text-white backdrop-blur transition-colors hover:bg-white hover:text-black max-[768px]:h-11 max-[768px]:w-11 max-[768px]:text-base" aria-label="Next photo" onClick={next}>
            ❯
          </button>
        )}
      </div>

      {total > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" ref={thumbsRef}>
         {images.map((src, i) => (
            <button
              type="button"
              key={src}
              className={`h-14 w-19 shrink-0 cursor-pointer overflow-hidden rounded-sm border-2 bg-transparent opacity-60 transition-opacity hover:opacity-100 ${i === index ? 'border-white opacity-100' : 'border-transparent'}`}
              aria-label={`Show photo ${i + 1}`}
              onClick={() => setIndex(i)}
            >
              <img className="h-full w-full object-cover" src={src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
