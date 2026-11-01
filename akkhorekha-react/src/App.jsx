import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import AboutPage from './pages/AboutPage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import ProjectPage from './pages/ProjectPage.jsx';
import NotFound from './pages/NotFound.jsx';
import Contact from './components/Contact.jsx';
import SocialContactLinks from './components/SocialContactLinks.jsx';

// Page change hole upore jabe, #hash thakle sei section e jabe
function ScrollManager() {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location]);
  return null;
}

function ScrollRevealManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    ) {
      return undefined;
    }

    document.documentElement.classList.add('motion-ready');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -32px 0px' }
    );
    const observeContent = (node) => {
      if (!(node instanceof Element)) return;
      if (node.matches('[data-reveal]:not(.is-visible)')) observer.observe(node);
      node.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((element) => observer.observe(element));
    };
    document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((element) => observer.observe(element));

    const mutations = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach(observeContent));
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);

  return null;
}

export default function App() {
  const { pathname } = useLocation();

  return (
    <>
      <ScrollManager />
      <ScrollRevealManager />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<main className="min-h-[60vh] bg-paper py-8 pb-16"><Contact /></main>} />
        <Route path="/projects/:category" element={<CategoryPage />} />
        <Route path="/projects/:category/:project" element={<ProjectPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      {pathname === '/contact' && <SocialContactLinks />}
    </>
  );
}
