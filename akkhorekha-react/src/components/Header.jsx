import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_LINKS, SITE } from '../data/content.js';

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const onProjects = pathname.startsWith('/projects');

  const isActive = (link) => {
    if (link.href === '/') return pathname === '/';
    if (link.href === '/about') return pathname === '/about';
    if (link.href === '/contact') return pathname === '/contact';
    if (link.href === '/#projects') return onProjects || (pathname === '/' && window.location.hash === '#projects');
    return false;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black text-white">
      <div className="relative z-1 mx-auto flex w-[min(1280px,calc(100%-3rem))] items-center justify-between gap-4 py-2 max-[700px]:grid max-[700px]:min-h-19.75 max-[700px]:grid-cols-[minmax(0,1fr)_44px] max-[700px]:py-[0.55rem] max-[360px]:min-h-18">
        <Link to="/" className="inline-flex flex-auto items-center max-[700px]:col-start-1" aria-label={SITE.name} onClick={() => setOpen(false)}>
          <img src="/images/AKKHOREKHA.png" alt={SITE.name} className="block h-19.5 w-auto max-w-70 object-contain max-[700px]:h-15 max-[700px]:max-w-55 max-[360px]:h-13" />
        </Link>
        <button
          className="hidden h-11 w-11 items-center justify-center rounded-sm border border-white/35 bg-transparent text-xl text-white transition-colors hover:bg-white/15 max-[700px]:col-start-2 max-[700px]:flex max-[700px]:justify-self-end"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
          aria-controls="navLinks"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? '×' : '☰'}
        </button>
        <nav className="max-[700px]:absolute max-[700px]:right-0 max-[700px]:top-[calc(100%+0.5rem)] max-[700px]:z-80 max-[700px]:w-[min(280px,calc(100vw-2rem))]" aria-label="Main navigation">
          <ul className={`flex list-none gap-1 max-[700px]:static max-[700px]:max-h-[calc(100svh-100px)] max-[700px]:w-full max-[700px]:flex-col max-[700px]:items-stretch max-[700px]:gap-1 max-[700px]:overflow-y-auto max-[700px]:rounded max-[700px]:border max-[700px]:border-white/20 max-[700px]:bg-black max-[700px]:p-2 max-[700px]:shadow-xl ${open ? 'max-[700px]:flex' : 'max-[700px]:hidden'}`} id="navLinks">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  to={l.href}
                  className={`relative rounded-sm px-3 py-2 text-white/75 transition-colors duration-200 after:absolute after:bottom-1 after:left-3 after:right-3 after:h-px after:origin-center after:scale-x-0 after:bg-white after:transition-transform hover:bg-white/10 hover:text-white hover:after:scale-x-100 max-[700px]:block max-[700px]:w-full max-[700px]:px-4 max-[700px]:py-3 ${isActive(l) ? 'active bg-white/10 text-white after:scale-x-100' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
