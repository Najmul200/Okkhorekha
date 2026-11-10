import { PROJECT_CATEGORIES, PROJECT_INFO } from './content.js';
import { getCategory } from './projectImages.js';

const prettify = (s) => s.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// "khilkhet full unit" -> "khilkhet-full-unit" (URL er jonno)
const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Folder er nam "2014-bhawal-resort" hole year = 2014, nam = "Bhawal Resort"
const YEAR_PREFIX = /^(\d{4})[-_ ]+(.+)$/;

const byYear = (a, b) => {
  if (a.year && b.year && a.year !== b.year) return a.year - b.year; // purono age (Jubair Hasan er moto)
  if (a.year && !b.year) return -1;
  if (!a.year && b.year) return 1;
  return a.folder.localeCompare(b.folder, undefined, { numeric: true });
};

export const PROJECT_SECTORS = [
  { key: 'residential', label: 'Residential' },
  { key: 'religious', label: 'Religious' },
  { key: 'commercial', label: 'Commercial' },
];

// 3 ta category (Ready, Ongoing, Complete) + tar bhitorer project gulo
export const CATEGORIES = PROJECT_CATEGORIES.map((cat) => {
  const data = getCategory(cat.key);
  const used = new Set();
  const projects = data.projects
    .map((p, i) => {
      let base = slugify(p.folder) || `project-${i + 1}`;
      let slug = base;
      for (let n = 2; used.has(slug); n += 1) slug = `${base}-${n}`;
      used.add(slug);
      return { ...p, slug };
    })
    .map((p) => {
      const info = PROJECT_INFO[p.folder] || {};
      const m = p.folder.match(YEAR_PREFIX);
      const year = info.year ? Number(info.year) : m ? Number(m[1]) : null;
      const title = info.title || prettify(m ? m[2] : p.folder);
      let cover = p.files[0]?.url;
      if (info.cover) {
        const requestedCover = info.cover.replace(/\.[^.]+$/, '');
        const found = p.files.find((x) => x.file.replace(/\.webp$/i, '') === requestedCover);
        if (found) cover = found.url;
      }
      return {
        folder: p.folder,
        slug: p.slug,
        title,
        year,
        location: info.location || '',
        tag: info.tag || '',
        sector: info.sector || '',
        text: info.text || '',
        alt: info.alt || title,
        images: p.files.map((x) => x.url),
        cover,
      };
    })
    .sort(byYear);
  return { ...cat, projects, cover: data.cover || projects[0]?.cover || null };
});

export const findCategory = (key) => CATEGORIES.find((c) => c.key === key);

export const categoryPath = (cat) => `/projects/${cat.key}`;
export const projectPath = (cat, p) => `/projects/${cat.key}/${p.slug}`;

// Year onujayi group: [{ year: 2014, items: [...] }, ...]
export function groupByYear(projects) {
  const groups = [];
  projects.forEach((p) => {
    const last = groups[groups.length - 1];
    if (last && last.year === p.year) last.items.push(p);
    else groups.push({ year: p.year, items: [p] });
  });
  return groups;
}
