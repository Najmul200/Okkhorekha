import { Link, useParams } from 'react-router-dom';
import {
  CATEGORIES,
  findCategory,
  categoryPath,
  projectPath,
  groupByYear,
} from '../data/projects.js';
import useSeo from '../hooks/useSeo.js';
import NotFound from './NotFound.jsx';

export default function CategoryPage() {
  const { category } = useParams();
  const cat = findCategory(category);

  useSeo(
    cat
      ? {
          title: `${cat.status}s – অক্ষরেখা | Architecture & Interior Design, Dhaka`,
          description: `Browse the ${cat.status.toLowerCase()}s by অক্ষরেখা – architecture and interior design studio in Dhaka.`,
          path: categoryPath(cat),
          image: cat.cover,
        }
      : { title: 'Page not found | অক্ষরেখা', path: '/404', noindex: true }
  );

  if (!cat) return <NotFound />;

  const groups = groupByYear(cat.projects);
  const anyYear = groups.some((g) => g.year);

  return (
    <main className="min-h-[60vh] bg-paper px-0 py-8 pb-16">
      <div className="mx-auto w-[min(1280px,calc(100%-3rem))] max-[700px]:w-[calc(100%-2rem)] max-[360px]:w-[calc(100%-1.5rem)]">
        <nav className="mb-6 flex flex-wrap gap-2 text-sm text-muted" aria-label="Breadcrumb">
          <Link className="hover:text-black hover:underline" to="/">Home</Link>
          <span>/</span>
          <Link className="hover:text-black hover:underline" to="/#projects">Projects</Link>
          <span>/</span>
          <span>{cat.status}</span>
        </nav>

        <div className="mb-7">
          <h1 className="font-display text-4xl font-medium leading-tight max-[700px]:text-3xl">{cat.status}s</h1>
          <p className="mt-2 text-sm text-muted">
            {cat.projects.length} {cat.projects.length === 1 ? 'project' : 'projects'}
          </p>
        </div>

        {/* Ready / Ongoing / Complete – serial onujayi */}
        <div className="mb-8 flex flex-wrap gap-2" role="navigation" aria-label="Project categories">
          {CATEGORIES.map((c) => (
            <Link
              key={c.key}
              to={categoryPath(c)}
              className={`rounded-sm border px-4 py-2 text-sm transition-colors ${c.key === cat.key ? 'border-black bg-black text-white' : 'border-black/20 text-muted hover:border-black hover:bg-black hover:text-white'}`}
              aria-current={c.key === cat.key ? 'page' : undefined}
            >
              {c.status}
            </Link>
          ))}
        </div>

        {cat.projects.length === 0 ? (
          <div className="max-w-3xl border-t border-black/15 py-12">
            <span className="text-xs font-bold uppercase tracking-[0.13em] text-ink">{cat.status}</span>
            <h2 className="mb-2 font-display text-3xl font-medium">Projects coming soon</h2>
            <p className="text-muted">New work is in progress. Please check back soon.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5" data-reveal>
            {groups.map((g, gi) => (
              <div className="flex items-start gap-6 max-[700px]:flex-col max-[700px]:gap-2" key={`${g.year}-${gi}`}>
                {anyYear && <div className="w-15 shrink-0 pt-2 text-sm font-bold max-[700px]:w-auto max-[700px]:pt-0">{g.year || ''}</div>}
                <div className="flex flex-wrap gap-4">
                  {g.items.map((p) => (
                    <Link className="w-47.5 rounded-sm border border-black/15 bg-surface p-2 transition-all duration-200 hover:-translate-y-1 hover:border-black hover:shadow-lg max-[700px]:w-[calc(50%-0.5rem)]" key={p.folder} to={projectPath(cat, p)} data-reveal>
                      <img className="aspect-square w-full rounded-sm object-cover" src={p.cover} alt={p.alt} loading="lazy" decoding="async" />
                      <h2 className="mt-3 text-xs font-semibold uppercase leading-snug tracking-wide">{p.title}</h2>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
