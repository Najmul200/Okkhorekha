import { FaWhatsapp } from 'react-icons/fa';
import { SITE } from '../data/content.js';

const linkClass =
  'group relative grid size-14 place-items-center rounded-full border border-neutral-300 bg-surface text-3xl text-ink shadow-lg animate-[whatsapp-float_3s_ease-in-out_infinite] transition-all duration-200 hover:-translate-y-1 hover:animate-none hover:border-black hover:bg-black hover:text-white hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black';

export default function SocialContactLinks() {
  const digits = SITE.whatsapp.replace(/\D/g, '');
  const whatsappNumber = digits.startsWith('0') ? `880${digits.slice(1)}` : digits;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello, I would like to discuss a project.')}`;

  return (
    <nav className="fixed bottom-6 right-6 z-60 flex flex-col gap-3 max-[700px]:bottom-4 max-[700px]:right-4" aria-label="Message the studio">
      <a
        className={linkClass}
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        title="Chat on WhatsApp"
      >
        <FaWhatsapp className="text-inherit" aria-hidden="true" />
        <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-sm bg-black px-3 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          WhatsApp
        </span>
      </a>
    </nav>
  );
}
