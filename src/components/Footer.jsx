import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaBehance, FaWhatsapp } from 'react-icons/fa';
import { SITE } from '../data/content.js';

export default function Footer() {
  const whatsappDigits = SITE.whatsapp.replace(/\D/g, '');
  const whatsappNumber = whatsappDigits.startsWith('0') ? `880${whatsappDigits.slice(1)}` : whatsappDigits;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello, I would like to discuss a project.')}`;

  return (
    <footer className="mt-0 bg-black py-12 text-white/70">
      <div className="mx-auto w-[min(1280px,calc(100%-3rem))] max-[700px]:w-[calc(100%-2rem)] max-[360px]:w-[calc(100%-1.5rem)]">
        <div className="mb-7 grid grid-cols-[1.2fr_1fr_1fr] items-start gap-7 max-[900px]:grid-cols-1">
          <div className="max-[900px]:order-3">
            <h3 className="mb-3 font-display text-base font-medium text-white">{SITE.name}</h3>
            <p className="text-sm text-white/60">Build by Najmul Islam</p>
          </div>
          <div className="max-[900px]:order-1">
            <h3 className="mb-3 font-display text-base font-medium text-white">Quick Links</h3>
            <Link className="mb-2 block text-white/70 transition-colors hover:text-white hover:underline" to="/about">About Us</Link>
            <Link className="mb-2 block text-white/70 transition-colors hover:text-white hover:underline" to="/#projects">Projects</Link>
            <Link className="mb-2 block text-white/70 transition-colors hover:text-white hover:underline" to="/contact">Contact</Link>
          </div>
          <div className="max-[900px]:order-2">
            <h3 className="mb-3 font-display text-base font-medium text-white">Contact</h3>
            <p className="mb-2 block text-white/70">{SITE.address}</p>
            <a className="mb-2 block text-white/70 transition-colors hover:text-white hover:underline" href={SITE.phoneHref}>{SITE.phone}</a>
            <a className="mb-2 block text-white/70 transition-colors hover:text-white hover:underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>
            <div className="mt-5 flex items-center gap-4">
              <a
                href="https://www.facebook.com/akkhorekhaarchitects"
                target="_blank"
                rel="noreferrer"
                aria-label="Akkhorekha Architects on Facebook"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d87946] text-lg text-[#d87946] transition-colors hover:bg-[#d87946] hover:text-white"
              >
                <FaFacebookF aria-hidden="true" />
              </a>
              <a
                href="https://www.instagram.com/akkhorekhaarchitects/"
                target="_blank"
                rel="noreferrer"
                aria-label="Akkhorekha Architects on Instagram"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d87946] text-lg text-[#d87946] transition-colors hover:bg-[#d87946] hover:text-white"
              >
                <FaInstagram aria-hidden="true" />
              </a>
              <a
                href="https://www.behance.net/akkhorekhaarchitects"
                target="_blank"
                rel="noreferrer"
                aria-label="Akkhorekha Architects on Behance"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d87946] text-lg text-[#d87946] transition-colors hover:bg-[#d87946] hover:text-white"
              >
                <FaBehance aria-hidden="true" />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Message Akkhorekha Architects on WhatsApp"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d87946] text-lg text-[#d87946] transition-colors hover:bg-[#d87946] hover:text-white"
              >
                <FaWhatsapp aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-3 border-t border-white/15 pt-4 text-sm text-white/65 max-[900px]:justify-center max-[900px]:text-center">
          <span>© 2026 {SITE.name}. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
