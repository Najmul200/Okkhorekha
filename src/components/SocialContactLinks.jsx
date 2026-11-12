import { FaFacebookMessenger, FaWhatsapp } from 'react-icons/fa';
import { SITE } from '../data/content.js';

const linkClass =
  'group relative grid size-16 place-items-center rounded-full border border-white/80 bg-linear-to-br from-[#f49a5a] via-[#e4773c] to-[#bf511d] text-3xl text-white shadow-[0_8px_24px_rgba(216,121,70,0.5)] ring-4 ring-[#d87946]/20 animate-[whatsapp-float_3s_ease-in-out_infinite] transition-all duration-200 hover:-translate-y-1 hover:scale-105 hover:animate-none hover:from-[#ffad70] hover:via-[#e4773c] hover:to-[#bf511d] hover:shadow-[0_10px_30px_rgba(216,121,70,0.7)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a84d18] motion-reduce:animate-none';

const labelClass =
  'pointer-events-none absolute right-full top-1/2 mr-4 -translate-x-1 -translate-y-1/2 whitespace-nowrap rounded-full border border-[#d87946]/70 bg-[#111] px-3.5 py-2 text-xs font-semibold tracking-wide text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 max-[700px]:translate-x-0 max-[700px]:opacity-100';

export default function SocialContactLinks() {
  const digits = SITE.whatsapp.replace(/\D/g, '');
  const whatsappNumber = digits.startsWith('0') ? `880${digits.slice(1)}` : digits;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello, I would like to discuss a project.')}`;

  return (
    <nav className="fixed bottom-40 right-6 z-60 flex flex-col gap-3 max-[700px]:bottom-36 max-[700px]:right-4" aria-label="Message the studio">
      <a
        className={`${linkClass} [animation-delay:180ms]`}
        href="https://m.me/akkhorekhaarchitects"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Message us on Facebook Messenger"
        title="Message on Messenger"
      >
        <span aria-hidden="true" className="pointer-events-none absolute -inset-1.5 rounded-full border border-[#f49a5a]/70 animate-[chat-ring_2.4s_ease-out_infinite] motion-reduce:animate-none" />
        <FaFacebookMessenger className="relative z-10 text-inherit" aria-hidden="true" />
        <span className={labelClass}>
          Messenger
        </span>
      </a>
      <a
        className={linkClass}
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        title="Chat on WhatsApp"
      >
        <span aria-hidden="true" className="pointer-events-none absolute -inset-1.5 rounded-full border border-[#f49a5a]/70 animate-[chat-ring_2.4s_ease-out_infinite] motion-reduce:animate-none" />
        <FaWhatsapp className="relative z-10 text-inherit" aria-hidden="true" />
        <span className={labelClass}>
          WhatsApp
        </span>
      </a>
    </nav>
  );
}
