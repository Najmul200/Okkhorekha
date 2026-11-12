import { Link } from 'react-router-dom';
import { CATEGORIES, categoryPath } from '../data/projects.js';

const portfolioCovers = CATEGORIES.flatMap((category) => {
  const list = Array.isArray(category?.projects) 
    ? category.projects 
    : Object.values(category?.projects || {});
  return list.map((project) => project?.cover);
}).filter(Boolean);

export default function Projects() {
  return (
    <section className="py-20 max-[700px]:py-14" id="projects" aria-labelledby="projects-title" data-reveal>
      <div className="mx-auto w-[min(1280px,calc(100%-3rem))] max-[700px]:w-[calc(100%-2rem)] max-[360px]:w-[calc(100%-1.5rem)]">
        <div className="mb-8 flex items-end justify-between gap-4 border-b border-black/15 pb-4 max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-1">
          <h2 id="projects-title" className="font-display text-[2.45rem] font-medium leading-tight max-[700px]:text-3xl">Projects</h2>
          <p className="max-w-xl text-muted">A simple overview of our current and completed work.</p>
        </div>

        <div className="grid grid-cols-3 items-stretch gap-4 max-[900px]:grid-cols-2 max-[700px]:grid-cols-1">
          {CATEGORIES.map((c, index) => {
            const image = c.cover || portfolioCovers[index % portfolioCovers.length];
           const categoryProjects = Array.isArray(c?.projects) 
  ? c.projects 
  : Object.values(c?.projects || {});
const hasProjects = categoryProjects.length > 0;
            return (
            <div className="flex min-w-0 w-full flex-col items-stretch" key={c.key} data-reveal>
              <div className="mb-2 self-start text-xs font-bold uppercase tracking-[0.12em] text-ink">{c.status}</div>
              <Link
                className="group relative isolate block aspect-5/4 w-full overflow-hidden rounded-md border border-white/20 bg-black text-white shadow-lg transition-[transform,box-shadow,border-color] duration-500 ease-out hover:-translate-y-2 hover:border-white/70 hover:shadow-[0_28px_64px_rgba(0,0,0,0.35)] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black max-[700px]:aspect-4/3 max-[700px]:rounded"
                to={categoryPath(c)}
                aria-label={`View ${c.status.toLowerCase()}${c.projects.length ? 's' : ', coming soon'}`}
              >
                {image ? (
                  <img
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08] group-focus-visible:scale-[1.08]"
                    src={image}
                    alt={hasProjects ? c.alt : `Portfolio preview for ${c.status.toLowerCase()}`}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center bg-neutral-900 text-white/40" aria-hidden="true">
                    <span className="font-display text-8xl">{String(CATEGORIES.indexOf(c) + 1).padStart(2, '0')}</span>
                  </div>
                )}
                {hasProjects && (
                  <span className="pointer-events-none absolute right-3 top-3 z-4 rounded-sm border border-white/35 bg-black/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                    {c.projects.length} project{c.projects.length > 1 ? 's' : ''}
                  </span>
                )}
                <div className="project-card-caption absolute inset-x-0 bottom-0 z-2 flex flex-col items-start gap-1 bg-linear-to-t from-black via-black/85 to-transparent p-5 text-left text-white max-[700px]:p-4">
                  <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white/75">{hasProjects ? c.tag : 'Portfolio preview'}</span>
                  <h3 className="font-display text-[1.7rem] font-medium leading-tight max-[700px]:text-xl">{hasProjects ? c.title : 'Projects coming soon'}</h3>
                  <p className="max-w-sm text-sm leading-snug text-white/90 max-[700px]:text-[0.84rem]">{hasProjects ? c.text : 'New work in this category is being prepared.'}</p>
                  <span className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-white underline decoration-white/50 underline-offset-4 transition-[gap] duration-200 group-hover:gap-3 group-focus-visible:gap-3">
                    {hasProjects ? 'Explore projects' : 'Coming soon'} <span aria-hidden="true">↗</span>
                  </span>
                </div>
              </Link>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
