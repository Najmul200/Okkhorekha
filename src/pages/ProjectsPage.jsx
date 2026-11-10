import { Link } from 'react-router-dom';
import ProjectShowcase from '../components/ProjectShowcase.jsx';
import { PROJECT_SECTORS } from '../data/projects.js';
import useSeo from '../hooks/useSeo.js';
import usePublishedProjects from '../hooks/usePublishedProjects.js';

export default function ProjectsPage() {
  useSeo({
    title: 'Projects – অক্ষরেখা | Architecture & Interior Design, Dhaka',
    description: 'Explore commercial, residential, and religious projects by অক্ষরেখা.',
    path: '/projects',
  });

  const publishedProjects = usePublishedProjects();
  const projects = publishedProjects.map((project) => ({
      ...project,
      title: project.name,
      text: project.description,
      images: project.cover_url ? [project.cover_url] : [],
      sector: PROJECT_SECTORS.find((sector) =>
        (project.collections || []).some(
          (collection) => collection.toLowerCase() === sector.label.toLowerCase()
        )
      )?.key,
      category: 'admin',
      project,
    }));

  const groupedProjects = PROJECT_SECTORS.map((sector) => ({
    ...sector,
    projects: projects.filter((project) => project.sector === sector.key),
  }));
  const uncategorizedProjects = projects.filter(
    (project) => !PROJECT_SECTORS.some((sector) => sector.key === project.sector)
  );

  if (uncategorizedProjects.length > 0) {
    groupedProjects.push({
      key: 'other',
      label: 'Other Projects',
      projects: uncategorizedProjects,
    });
  }

  let projectIndex = 0;

  return (
    <main className="min-h-[60vh] bg-paper text-[#111]">
      <div className="mx-auto w-[min(1240px,calc(100%-3rem))] pb-14 pt-10 max-[700px]:w-[calc(100%-1.5rem)] max-[700px]:pb-10 max-[700px]:pt-8">
        <nav className="mb-8 flex gap-2 text-sm text-muted" aria-label="Breadcrumb">
          <Link className="hover:text-black hover:underline" to="/">Home</Link>
          <span>/</span>
          <span aria-current="page">Projects</span>
        </nav>

        <header className="mb-12 border-b border-black/15 pb-6">
          <span className="text-[0.62rem] font-medium uppercase tracking-[0.4em] text-black/45">
            Our portfolio
          </span>
          <h1 className="mt-3 font-display text-4xl font-medium leading-tight md:text-5xl">
            Projects
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-black/60">
            Explore selected work across commercial, residential, and religious architecture.
          </p>
        </header>

        {groupedProjects.map((group) => (
          <section
            key={group.key}
            id={`project-${group.key}`}
            className="scroll-mt-28 border-b border-black/15 py-10 first:pt-0"
            aria-labelledby={`project-${group.key}-title`}
          >
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <span className="text-[0.62rem] font-medium uppercase tracking-[0.3em] text-black/45">
                  {String(group.projects.length).padStart(2, '0')} projects
                </span>
                <h2
                  id={`project-${group.key}-title`}
                  className="mt-2 font-display text-3xl font-medium md:text-4xl"
                >
                  {group.label}
                </h2>
              </div>
            </div>

            {group.projects.length > 0 ? (
              <div className="relative mx-auto max-w-270">
                {group.projects.map((project) => {
                  const index = projectIndex;
                  projectIndex += 1;
                  return (
                    <ProjectShowcase
                      key={project.project?.id || `${project.category}-${project.folder}`}
                      title={project.title}
                      location={project.location || 'Dhaka'}
                      year={project.year}
                      description={project.text}
                      images={project.images}
                      index={index}
                      project={project.project}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="py-4 text-sm text-black/55">Projects in this category are coming soon.</p>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
