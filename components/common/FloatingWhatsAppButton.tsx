'use client';

import { useEffect, useState } from 'react';

function normalizePhoneNumber(value: string | undefined) {
  return value?.replace(/[^\d]/g, '') || '8801616449801';
}

export function FloatingWhatsAppButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  const phoneNumber = normalizePhoneNumber(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);
  const message = encodeURIComponent(
    process.env.NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE || 'Hello, I need help with Ghuri Automobiles.'
  );
  const href = `https://wa.me/${phoneNumber}?text=${message}`;

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 220);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-[70] sm:bottom-6 sm:right-6">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        onFocus={() => setIsExpanded(true)}
        onBlur={() => setIsExpanded(false)}
        className={`group relative flex items-center gap-3 rounded-full border border-emerald-200/25 bg-[#25D366] text-white shadow-[0_18px_45px_rgba(37,211,102,0.35)] transition-all duration-300 hover:scale-[1.03] active:scale-95 ${
          isExpanded || hasScrolled ? 'px-5 py-4' : 'h-14 w-14 justify-center p-0'
        }`}
        aria-label="Chat on WhatsApp"
      >
        <span className="absolute inset-0 rounded-full bg-white/10 opacity-0 transition group-hover:opacity-100 motion-safe:animate-pulse" />
        <span className="absolute inset-0 rounded-full ring-4 ring-[#25D366]/25 motion-safe:animate-ping" />
        <svg
          className={`h-6 w-6 ${isExpanded || hasScrolled ? 'relative z-10' : 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10'}`}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M20.52 3.48A11.88 11.88 0 0 0 12 0C5.373 0 0 5.373 0 12c0 2.112.553 4.176 1.603 6.014L0 24l6.246-1.612A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12 0-1.99-.492-3.86-1.48-5.52zM12 21.5c-1.8 0-3.55-.48-5.07-1.39l-.36-.21-3.71.96.99-3.62-.23-.37A9.34 9.34 0 0 1 2 12C2 6.48 6.48 2 12 2c2.5 0 4.86.82 6.76 2.33C20.18 6.24 21 8.5 21 11c0 5.52-4.48 10.5-9 10.5z" />
          <path d="M17.3 14.1c-.3-.1-1.7-.9-1.9-1-.2-.1-.4-.1-.6.1-.2.2-.7.9-.8 1.1-.1.2-.2.3-.5.1-.3-.2-1.2-.4-2.3-1.4-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.4.1-.6.1-.1.3-.3.5-.5.2-.2.3-.3.5-.5.2-.2.1-.4 0-.6-.1-.2-.6-1.4-.9-1.9-.2-.4-.5-.3-.6-.3-.2 0-.4 0-.6 0-.2 0-.6.1-.9.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.1 3 .1.2 1.8 3 4.4 4.3 3 1.5 3.1.9 3.6.8.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.1-1.4-.1-.1-.3-.2-.6-.3z" />
        </svg>
        <span
          className={`relative z-10 whitespace-nowrap text-sm font-semibold tracking-wide transition-all duration-300 ${
            isExpanded || hasScrolled ? 'max-w-[220px] opacity-100' : 'max-w-0 overflow-hidden opacity-0'
          }`}
        >
          WhatsApp us
        </span>
      </a>
    </div>
  );
}