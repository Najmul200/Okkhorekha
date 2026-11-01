import { Link } from 'react-router-dom';
import useSeo from '../hooks/useSeo.js';

export default function NotFound() {
  useSeo({ title: 'Page not found | অক্ষরেখা', path: '/404', noindex: true });
  return (
    <main className="min-h-[60vh] bg-paper py-8 pb-16">
      <div className="mx-auto mb-7 w-[min(1280px,calc(100%-3rem))] max-w-7xl max-[700px]:w-[calc(100%-2rem)] max-[360px]:w-[calc(100%-1.5rem)]">
        <h1 className="font-display text-4xl font-normal leading-tight">Page not found</h1>
        <p className="mt-2 max-w-xl text-muted">Ei page ta khuje pawa jayni.</p>
        <p className="mt-4">
          <Link to="/" className="inline-flex items-center justify-center gap-2 rounded-sm border border-black bg-black px-5 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-md">Back to Home</Link>
        </p>
      </div>
    </main>
  );
}
