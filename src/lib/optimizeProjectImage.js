const MAX_IMAGE_DIMENSION = 2400;
const WEBP_QUALITY = 0.82;
const OPTIMIZABLE_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export default async function optimizeProjectImage(file) {
  if (!OPTIMIZABLE_IMAGE_TYPES.has(file.type)) return file;

  const bitmap = await createImageBitmap(file);

  try {
    const scale = Math.min(
      1,
      MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height)
    );
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not prepare image for optimization.');

    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const optimizedBlob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Could not encode the optimized image.'));
        },
        'image/webp',
        WEBP_QUALITY
      );
    });

    if (optimizedBlob.type !== 'image/webp') {
      throw new Error('This browser does not support WebP image optimization.');
    }

    return new File(
      [optimizedBlob],
      `${file.name.replace(/\.[^.]+$/, '')}.webp`,
      { type: optimizedBlob.type, lastModified: file.lastModified }
    );
  } finally {
    bitmap.close();
  }
}
