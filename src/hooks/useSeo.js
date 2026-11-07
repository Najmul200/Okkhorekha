import { useEffect } from 'react';

// TODO: index.html e ja domain diyecho, ekhaneo sheta-i dao
export const SITE_URL = 'https://your-domain.com';

const DEFAULTS = {
  title: 'অক্ষরেখা – Architecture & Interior Design in Dhaka',
  description:
    'অক্ষরেখা is a Dhaka-based architecture and interior design studio creating timeless, climate-responsive spaces. Book a consultation today.',
  image: '/portfolio-cover.webp',
};

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function useSeo({ title, description, path = '/', image, noindex = false } = {}) {
  useEffect(() => {
    const t = title || DEFAULTS.title;
    const d = description || DEFAULTS.description;
    const img = image || DEFAULTS.image;
    const absImg = /^https?:/.test(img) ? img : SITE_URL + img;
    const url = SITE_URL + path;

    document.title = t;
    setMeta('name', 'description', d);
    setMeta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large');
    setMeta('property', 'og:title', t);
    setMeta('property', 'og:description', d);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', absImg);
    setMeta('name', 'twitter:title', t);
    setMeta('name', 'twitter:description', d);
    setMeta('name', 'twitter:image', absImg);

    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }, [title, description, path, image, noindex]);
}
