import Hero from '../components/Hero.jsx';
import useSeo from '../hooks/useSeo.js';

export default function Home() {
  useSeo({ path: '/' });
  return (
    <main id="home">
      <Hero />
    </main>
  );
}
