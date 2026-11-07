import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { findCategory, categoryPath, projectPath } from '../data/projects.js';
import useSeo from '../hooks/useSeo.js';
import Lightbox from '../components/Lightbox.jsx';
import Reviews from '../components/Reviews.jsx';
import NotFound from './NotFound.jsx';

const normalizeImages = (value) => {
  const entries = Array.isArray(value) ? value : Object.values(value || {});
  return entries
    .map((image) => (typeof image === 'string' ? image : image?.url || image?.src))
    .filter(Boolean);
};

export default function ProjectPage() {
  const { category, project: projectParam } = useParams();
  const cat = findCategory(category);
  const categoryProjects = Array.isArray(cat?.projects)
    ? cat.projects
    : Object.values(cat?.projects || {});
  const index = categoryProjects.findIndex((p) => p.slug === projectParam);
  const project = index >= 0 ? categoryProjects[index] : null;
  const [lightboxAt, setLightboxAt] = useState(null);

  useSeo(
    project
      ? {
          title: `${project.title} – ${cat.status} | অক্ষরেখা`,
          description:
            project.text ||
            `${project.title}${project.location ? ` in ${project.location}` : ''} – ${cat.status.toLowerCase()} by অক্ষরেখা, architecture and interior design studio in Dhaka.`,
          path: projectPath(cat, project),
          image: project.cover,
        }
      : { title: 'Page not found | অক্ষরেখা', path: '/404', noindex: true }
  );

  if (!project) return <NotFound />;

  const images = normalizeImages(project.images);
  const prev = index > 0 ? categoryProjects[index - 1] : null;
  const next = index < categoryProjects.length - 1 ? categoryProjects[index + 1] : null;

  return (
    <main className="min-h-[60vh] bg-paper px-0 py-8 pb-16">
      <div className="mx-auto w-[min(1280px,calc(100%-3rem))] max-[700px]:w-[calc(100%-2rem)] max-[360px]:w-[calc(100%-1.5rem)]">
        <nav className="mb-6 flex flex-wrap gap-2 text-sm text-muted" aria-label="Breadcrumb">
          <Link className="hover:text-black hover:underline" to="/">Home</Link>
          <span>/</span>
          <Link className="hover:text-black hover:underline" to="/#projects">Projects</Link>
          <span>/</span>
          <Link className="hover:text-black hover:underline" to={categoryPath(cat)}>{cat.status}</Link>
          <span>/</span>
          <span>{project.title}</span>
        </nav>

        <div className="mb-7" data-reveal>
          <h1 className="font-display text-4xl font-normal leading-tight">{project.title}</h1>
          <dl className="mt-4 flex flex-wrap gap-x-9 gap-y-3">
            {project.location && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-ink">Location</dt>
                <dd>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📍 {project.location}
                  </a>
                </dd>
              </div>
            )}
            {project.year && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-ink">Year</dt>
                <dd>{project.year}</dd>
              </div>
            )}
            {project.tag && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-ink">Type</dt>
                <dd>{project.tag}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-semibold uppercase tracking-widest text-ink">Status</dt>
              <dd>{cat.status}</dd>
            </div>
          </dl>
          {project.text && <p className="mt-2 max-w-xl text-muted">{project.text}</p>}
        </div>

        <div className="columns-3 gap-[0.65rem] max-[900px]:columns-2 max-[560px]:columns-1">
          {images.map((src, i) => (
            <button
              type="button"
              className="mb-[0.65rem] block w-full break-inside-avoid cursor-zoom-in overflow-hidden rounded-sm border border-black/15 bg-transparent p-0 transition-all hover:-translate-y-1 hover:border-black hover:shadow-lg"
              key={src}
              data-reveal
              aria-label={`Open photo ${i + 1} of ${project.title}`}
              onClick={() => setLightboxAt(i)}
            >
              <img
                src={src}
                alt={`${project.alt} – photo ${i + 1}`}
                loading={i < 3 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </button>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-black/15 pt-6" data-reveal>
          {prev ? (
            <Link to={projectPath(cat, prev)} className="inline-flex items-center justify-center gap-2 rounded-sm border border-black/25 px-5 py-3 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-black hover:shadow-md">
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          <Link to={categoryPath(cat)} className="inline-flex items-center justify-center gap-2 rounded-sm border border-black/25 px-5 py-3 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-black hover:shadow-md">
            All {cat.status}s
          </Link>
          {next ? (
            <Link to={projectPath(cat, next)} className="inline-flex items-center justify-center gap-2 rounded-sm border border-black bg-black px-5 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-md">
              {next.title} →
            </Link>
          ) : (
            <span />
          )}
        </div>
        <Reviews projectId={`${cat.key}:${project.slug}`} projectTitle={project.title} />
      </div>

      {lightboxAt !== null && (
        <Lightbox project={{ ...project, images }} startIndex={lightboxAt} onClose={() => setLightboxAt(null)} />
      )}
    </main>
  );
}
