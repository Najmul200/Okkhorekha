import { STATS } from '../data/content.js';
import { CATEGORIES } from '../data/projects.js';

export default function About() {
  const studioImage =
    CATEGORIES.flatMap((category) => category.projects)[0]?.cover || '/images/Scene 24_1.png';

  return (
    <section className="py-20 max-[700px]:py-14" id="about" aria-labelledby="about-title" data-reveal>
      <div className="mx-auto w-[min(1280px,calc(100%-3rem))] max-[700px]:w-[calc(100%-2rem)] max-[360px]:w-[calc(100%-1.5rem)]">
        <div className="mb-8 flex items-end justify-between gap-4 border-b border-black/15 pb-4 max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-1">
          <h2 id="about-title" className="font-display text-[2.45rem] font-normal leading-tight max-[700px]:text-3xl">About the Studio</h2>
          <p className="max-w-xl text-muted">Architecture and interiors shaped around the way people live.</p>
        </div>
        <div className="grid grid-cols-[0.95fr_1.05fr] items-center gap-14 max-[900px]:gap-8 max-[700px]:grid-cols-1 max-[700px]:gap-6">
          <div className="py-3">
            <span className="text-xs font-bold uppercase tracking-[0.13em] text-ink">Design with intention</span>
            <h3 className="mb-4 mt-3 max-w-xl font-display text-[2rem] font-normal leading-snug max-[700px]:text-2xl">Spaces that feel considered, connected, and distinctly yours.</h3>
            <p className="mb-3 max-w-xl text-muted">
              অক্ষরেখা is a design-led architecture and interior studio. We bring context,
              material, and everyday use together to create places with lasting character.
            </p>
            <p className="mb-3 max-w-xl text-muted">
              From the first conversation through detailed delivery, our process balances clear
              thinking with careful craft.
            </p>
            <div className="my-5 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-ink">
              <span>Context-led design</span>
              <span>Material clarity</span>
              <span>Human-scale spaces</span>
            </div>
            <div className="mt-7 grid grid-cols-3 gap-2 border-t border-black/15 pt-4">
              {STATS.map((s) => (
                <div className="border-0 bg-transparent" key={s.label}>
                  <strong className="block font-display text-3xl font-normal text-black max-[700px]:text-2xl">{s.value}</strong>
                  <span className="text-xs text-muted max-[700px]:text-[0.7rem]">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <img
            src={studioImage}
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
