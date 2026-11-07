import { readdir, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));
const inputRoot = path.join(root, 'src', 'assets', 'projects');
const outputRoot = path.join(root, 'src', 'assets', 'projects-optimized');
const socialCover = path.join(root, 'public', 'portfolio-cover.webp');
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.jfif']);

async function listImages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const fullPath = path.join(directory, entry.name);
      return entry.isDirectory() ? listImages(fullPath) : [fullPath];
    })
  );
  return nested.flat();
}

try {
  const sources = (await listImages(inputRoot))
    .filter((file) => imageExtensions.has(path.extname(file).toLowerCase()))
    .sort();
  await rm(outputRoot, { recursive: true, force: true });
  let nextSource = 0;
  const optimizeNext = async () => {
    while (nextSource < sources.length) {
      const source = sources[nextSource++];
      const relative = path.relative(inputRoot, source);
      const destination = path.join(outputRoot, relative.replace(/\.[^.]+$/, '.webp'));
      await mkdir(path.dirname(destination), { recursive: true });
      await sharp(source)
        .rotate()
        .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82, effort: 5 })
        .toFile(destination);
    }
  };
  await Promise.all(Array.from({ length: Math.min(4, sources.length) }, optimizeNext));
  if (sources[0]) {
    await sharp(sources[0])
      .rotate()
      .resize({ width: 1800, height: 1200, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(socialCover);
  } else {
    await rm(socialCover, { force: true });
  }
  console.log(`[images] Optimized ${sources.length} source images to WebP.`);
} catch (error) {
  console.error(`[images] Optimization failed: ${error.message}`);
  process.exitCode = 1;
}