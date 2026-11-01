import { PROJECT_CATEGORIES } from './content.js';

// src/assets/projects/<category>/<project>/<image> khuje ney
const modules = import.meta.glob('../assets/projects-optimized/**/*.*', {
  eager: true,
  query: '?url',
  import: 'default',
});

const IMAGE_RE = /\.webp$/i;
const byName = (a, b) => a.file.localeCompare(b.file, undefined, { numeric: true });

// "Ready Project", "ready", "Ready-Project" -> sob 'ready' hishebe dhora hoy
const norm = (s) => s.toLowerCase().replace(/project/g, '').replace(/[^a-z0-9]/g, '');

const keys = PROJECT_CATEGORIES.map((c) => c.key);
const tree = {};
keys.forEach((k) => (tree[k] = { coverFiles: [], projects: {} }));
const unknown = new Set();

Object.entries(modules).forEach(([path, url]) => {
  const parts = path.split('/'); // ['..','assets','projects','ready','my-house','01.jpg']
  const file = parts[parts.length - 1];
  if (parts.length < 5 || !IMAGE_RE.test(file)) return;

  const cat = norm(parts[3]);
  if (!tree[cat]) {
    unknown.add(parts[3]);
    return;
  }
  if (parts.length === 5) {
    tree[cat].coverFiles.push({ file, url }); // category folder er sorasori image = card cover
  } else {
    const folder = parts[4];
    (tree[cat].projects[folder] = tree[cat].projects[folder] || []).push({ file, url });
  }
});

unknown.forEach((f) =>
  console.warn(
    `[Projects] "src/assets/projects/${f}" ekta valid category na. ${keys.join(' / ')} folder er bhitore rakho.`
  )
);

export function getCategory(key) {
  const t = tree[key] || { coverFiles: [], projects: {} };
  const projects = Object.keys(t.projects)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((folder) => ({ folder, files: t.projects[folder].slice().sort(byName) }));
  const coverFile = t.coverFiles.slice().sort(byName)[0];
  const cover = coverFile ? coverFile.url : projects[0]?.files[0]?.url || null;
  return { cover, projects };
}
