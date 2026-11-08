import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { NAV_LINKS, SITE } from '../data/content.js';
import { PROJECT_SECTORS } from '../data/projects.js';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchMenuRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const { pathname } = useLocation();
  const onProjects = pathname.startsWith('/projects');
  useEffect(() => {
    if (!searchOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!searchMenuRef.current?.contains(event.target)) setSearchOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSearchOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchOpen]);

  const isActive = (link) => {
    if (link.href === '/') return pathname === '/';
    if (link.href === '/about') return pathname === '/about';
    if (link.href === '/contact') return pathname === '/contact';
    if (link.href === '/projects') return onProjects;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black text-white">
      <div className="relative z-1 mx-auto flex w-[min(1280px,calc(100%-3rem))] items-center justify-between gap-4 py-2 max-[700px]:grid max-[700px]:min-h-19.75 max-[700px]:grid-cols-[minmax(0,1fr)_44px] max-[700px]:py-[0.55rem] max-[360px]:min-h-18">
        <Link to="/" className="inline-flex flex-auto items-center max-[700px]:col-start-1" aria-label={SITE.name} onClick={() => setOpen(false)}>
          <motion.span
            className="block"
            initial={reduceMotion ? false : { clipPath: 'inset(0 100% 0 0)' }}
            animate={{ clipPath: 'inset(0 0% 0 0)' }}
            transition={{ duration: reduceMotion ? 0 : 4, ease: 'easeInOut' }}
          >
            <motion.img
              src="/images/AKKHOREKHA.png"
              alt={SITE.name}
              className="block h-19.5 w-auto max-w-70 object-contain max-[700px]:h-15 max-[700px]:max-w-55 max-[360px]:h-13"
              initial={reduceMotion ? false : { opacity: 0.12, y: 3, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{
                duration: reduceMotion ? 0 : 3.8,
                delay: reduceMotion ? 0 : 0.2,
                ease: 'easeInOut',
              }}
            />
          </motion.span>
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
            <li ref={searchMenuRef} className="relative">
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-white/40 bg-black px-4 py-2 text-xs font-semibold tracking-[0.14em] text-white transition-colors duration-200 hover:bg-white/10 max-[700px]:w-full max-[700px]:justify-center max-[700px]:py-3"
                aria-label="Search projects by category"
                aria-expanded={searchOpen}
                aria-controls="projectSearchMenu"
                onClick={() => setSearchOpen((isOpen) => !isOpen)}
              >
                <svg
                  aria-hidden="true"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle cx="10.8" cy="10.8" r="6.3" stroke="currentColor" strokeWidth="2" />
                  <path d="m15.5 15.5 4.2 4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>SEARCH</span>
              </button>
              <AnimatePresence>
                {searchOpen && (
                  <motion.ul
                    id="projectSearchMenu"
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute right-0 top-full z-[90] mt-2 flex w-56 origin-top-right flex-col gap-1 rounded-xl border border-neutral-800 bg-neutral-900 p-3 text-left shadow-xl max-[700px]:static max-[700px]:mt-1 max-[700px]:w-full"
                    aria-label="Search project categories"
                  >
                    {PROJECT_SECTORS.map((category, index) => (
                      <motion.li
                        key={category.key}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.22, delay: index * 0.06, ease: 'easeOut' }}
                      >
                        <Link
                          to={`/projects#project-${category.key}`}
                          className="block rounded-lg px-3 py-2 text-sm text-white/85 transition-all duration-200 hover:bg-neutral-800 hover:pl-5 hover:text-white"
                          onClick={() => {
                            setSearchOpen(false);
                            setOpen(false);
                          }}
                        >
                          {category.label}
                        </Link>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
