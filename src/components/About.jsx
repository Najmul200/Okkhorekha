import useAboutContent from '../hooks/useAboutContent.js';

export default function About() {
  const content = useAboutContent();

  return (
    <section className="py-20 max-[700px]:py-14" id="about" aria-labelledby="about-title" data-reveal>
      <div className="mx-auto w-[min(1280px,calc(100%-3rem))] max-[700px]:w-[calc(100%-2rem)] max-[360px]:w-[calc(100%-1.5rem)]">
        <div className="mb-8 flex items-end justify-between gap-4 border-b border-black/15 pb-4 max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-1">
          <h2 id="about-title" className="font-display text-[2.45rem] font-medium leading-tight max-[700px]:text-3xl">{content.homeTitle}</h2>
          <p className="max-w-xl text-muted">{content.homeSubtitle}</p>
        </div>
        <div className="grid grid-cols-[0.95fr_1.05fr] items-center gap-14 max-[900px]:gap-8 max-[700px]:grid-cols-1 max-[700px]:gap-6">
          <div className="py-3">
            <span className="text-xs font-bold uppercase tracking-[0.13em] text-ink">{content.homeKicker}</span>
            <h3 className="mb-4 mt-3 max-w-xl font-display text-[2rem] font-medium leading-snug max-[700px]:text-2xl">{content.homeHeading}</h3>
            <p className="mb-3 max-w-xl text-muted">{content.homeParagraph}</p>
            <p className="mb-3 max-w-xl text-muted">{content.homeParagraphTwo}</p>
            <div className="my-5 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-ink">
              {content.homeHighlights.map((highlight) => <span key={highlight}>{highlight}</span>)}
            </div>
            <div className="mt-7 grid grid-cols-3 gap-2 border-t border-black/15 pt-4">
              {content.stats.map((s) => (
                <div className="border-0 bg-transparent" key={s.label}>
                  <strong className="block font-display text-3xl font-medium text-black max-[700px]:text-2xl">{s.value}</strong>
                  <span className="text-xs text-muted max-[700px]:text-[0.7rem]">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <img
            src={content.imageUrl}
            alt="Interior architecture from the studio portfolio"
            loading="lazy"
            decoding="async"
            className="aspect-4/3 max-h-140 w-full rounded-sm object-cover"
          />
        </div>
      </div>
    </section>
  );
}
