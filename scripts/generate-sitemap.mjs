// npm run build er somoy public/sitemap.xml automatic banay (category + project page soho)
// Domain: SITE_URL env variable ba nicher default
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = (process.env.SITE_URL || 'https://your-domain.com').replace(/\/$/, '');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = path.join(root, 'src/assets/projects');
const CATS = ['ready', 'ongoing', 'complete'];
const norm = (s) => s.toLowerCase().replace(/project/g, '').replace(/[^a-z0-9]/g, '');
const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
const IMG = /\.(jpe?g|png|webp|avif|gif|jfif)$/i;
const today = new Date().toISOString().slice(0, 10);

const urls = [
  { loc: `${SITE}/`, priority: '1.0' },
  { loc: `${SITE}/projects`, priority: '0.9' },
  { loc: `${SITE}/about`, priority: '0.7' },
  { loc: `${SITE}/contact`, priority: '0.6' },
];

try {
  if (fs.existsSync(base)) {
    for (const d of fs.readdirSync(base, { withFileTypes: true })) {
      const cat = norm(d.name);
      if (!d.isDirectory() || !CATS.includes(cat)) continue;
      const catDir = path.join(base, d.name);
      const projects = fs
        .readdirSync(catDir, { withFileTypes: true })
        .filter(
          (p) =>
            p.isDirectory() &&
            fs.readdirSync(path.join(catDir, p.name)).some((f) => IMG.test(f))
        )
        .map((p) => p.name)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      if (!projects.length) continue;
      urls.push({ loc: `${SITE}/projects/${cat}`, priority: '0.8' });
      const used = new Set();
      projects.forEach((name, i) => {
        const base = slugify(name) || `project-${i + 1}`;
        let slug = base;
        for (let n = 2; used.has(slug); n += 1) slug = `${base}-${n}`;
        used.add(slug);
        urls.push({ loc: `${SITE}/projects/${cat}/${slug}`, priority: '0.7' });
      });
    }
  }
} catch (e) {
  console.warn('[sitemap] project folder porte parlam na:', e.message);
}

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls
    .map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`
    )
    .join('\n') +
  '\n</urlset>\n';

fs.mkdirSync(path.join(root, 'public'), { recursive: true });
fs.writeFileSync(path.join(root, 'public/sitemap.xml'), xml);
console.log(`[sitemap] ${urls.length} ta URL likha hoyeche (${SITE})`);
