import { Link } from 'react-router-dom';
import { STATS } from '../data/content.js';
import { CATEGORIES } from '../data/projects.js';
import useSeo from '../hooks/useSeo.js';

const practices = [
  {
    number: '01',
    title: 'Architecture',
    text: 'Context-aware buildings shaped by climate, culture, and daily use.',
  },
  {
    number: '02',
    title: 'Interior design',
    text: 'Carefully composed spaces with thoughtful materials, light, and movement.',
  },
  {
    number: '03',
    title: 'Planning',
    text: 'Clear spatial strategies that connect people, place, and purpose.',
  },
];

export default function AboutPage() {
  useSeo({
    title: 'About Us – অক্ষরেখা | Architecture & Interior Design',
    description: 'Meet অক্ষরেখা, a design-led architecture and interior studio in Dhaka.',
    path: '/about',
  });

  const studioImage =
    CATEGORIES.flatMap((category) => category.projects)[0]?.cover || '/portfolio-cover.webp';

  return (
    <main className="min-h-[60vh] bg-paper py-8 pb-16">
      <div className="mx-auto w-[min(1280px,calc(100%-3rem))] max-[700px]:w-[calc(100%-2rem)] max-[360px]:w-[calc(100%-1.5rem)]">
        <header className="max-w-4xl py-10 max-[700px]:py-5" data-reveal>
          <span className="text-xs font-bold uppercase tracking-[0.13em] text-ink">About the studio</span>
          <h1 className="my-3 max-w-3xl font-display text-5xl font-medium leading-tight max-[700px]:text-4xl">Designing for life, place, and purpose.</h1>
          <p className="max-w-2xl text-lg text-muted">
            We are অক্ষরেখা, an architecture and interior studio in Dhaka. Our work brings clear
            ideas, careful craft, and everyday needs together.
          </p>
        </header>

        <div className="grid grid-cols-[1.05fr_0.95fr] items-center gap-12 pb-16 pt-4 max-[900px]:gap-8 max-[700px]:grid-cols-1 max-[700px]:gap-6 max-[700px]:pb-10" data-reveal>
          <img
            src={studioImage}
            alt="A completed architecture and interior project from the studio"
            loading="lazy"
            decoding="async"
            className="aspect-4/3 w-full rounded-sm object-cover"
          />
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.13em] text-ink">Our point of view</span>
            <h2 className="my-3 font-display text-3xl font-medium leading-snug max-[700px]:text-2xl">Good design begins by understanding how a place is lived in.</h2>
            <p className="text-muted">
              Every project starts with listening: to the people who will use it, the character of
              the site, and the practical demands of the brief. From that foundation, we develop
              spaces that feel purposeful, balanced, and lasting.
            </p>
            <p className="mt-3 text-muted">
              We stay involved from early concepts through detail and delivery, keeping the design
              intent clear at every step.
            </p>
          </div>
        </div>

        <section className="border-t border-black/15 py-10" aria-labelledby="practice-title" data-reveal>
          <div className="mb-8 flex items-end justify-between gap-4 border-b border-black/15 pb-4 max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-1">
            <h2 id="practice-title" className="font-display text-[2.45rem] font-medium leading-tight max-[700px]:text-3xl">What we do</h2>
            <p className="max-w-xl text-muted">One thoughtful process across every scale of work.</p>
          </div>
          <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[700px]:grid-cols-1">
            {practices.map((practice) => (
              <article className="grid grid-cols-[auto_1fr] gap-4 border-t border-neutral-300 py-4" key={practice.number} data-reveal>
                <span className="text-xs text-neutral-500">{practice.number}</span>
                <div>
                  <h3 className="mb-1 text-base font-semibold">{practice.title}</h3>
                  <p className="text-sm text-muted">{practice.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-4 items-center gap-4 border-t border-black/15 py-6 max-[700px]:grid-cols-2" data-reveal>
          {STATS.map((stat) => (
            <div className="border-0 bg-transparent" key={stat.label}>
              <strong className="block font-display text-3xl font-medium text-black">{stat.value}</strong>
              <span className="text-xs text-muted">{stat.label}</span>
            </div>
          ))}
          <Link className="inline-flex items-center justify-center gap-2 justify-self-end rounded-sm border border-black/25 px-5 py-3 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-black hover:shadow-md max-[700px]:justify-self-start" to="/contact">Start a conversation</Link>
        </div>
      </div>
    </main>
  );
}