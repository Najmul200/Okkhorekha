import { Link } from 'react-router-dom';
import { SITE } from '../data/content.js';

export default function Footer() {
  return (
    <footer className="mt-0 bg-black py-12 text-white/70">
      <div className="mx-auto w-[min(1280px,calc(100%-3rem))] max-[700px]:w-[calc(100%-2rem)] max-[360px]:w-[calc(100%-1.5rem)]">
        <div className="mb-7 grid grid-cols-[1.2fr_1fr_1fr] items-start gap-7 max-[900px]:grid-cols-1">
          <div>
            <h3 className="mb-3 font-display text-base font-medium text-white">{SITE.name}</h3>
            <p className="max-w-sm leading-relaxed text-white/70">
              Designing refined architecture and interiors with an emphasis on clarity, context,
              and material intelligence.
            </p>
          </div>
          <div>
            <h3 className="mb-3 font-display text-base font-medium text-white">Quick Links</h3>
            <Link className="mb-2 block text-white/70 transition-colors hover:text-white hover:underline" to="/about">About Us</Link>
            <Link className="mb-2 block text-white/70 transition-colors hover:text-white hover:underline" to="/#projects">Projects</Link>
            <Link className="mb-2 block text-white/70 transition-colors hover:text-white hover:underline" to="/contact">Contact</Link>
          </div>
          <div>
            <h3 className="mb-3 font-display text-base font-medium text-white">Contact</h3>
            <p className="mb-2 block text-white/70">{SITE.address}</p>
            <a className="mb-2 block text-white/70 transition-colors hover:text-white hover:underline" href={SITE.phoneHref}>{SITE.phone}</a>
            <a className="mb-2 block text-white/70 transition-colors hover:text-white hover:underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-3 border-t border-white/15 pt-4 text-sm text-white/65 max-[900px]:justify-center max-[900px]:text-center">
          <span>© 2026 {SITE.name}. All rights reserved.</span>
          <span>Built for modern architecture studios.</span>
        </div>
      </div>
    </footer>
  );
}
