import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useScrollPosition } from '@/hooks/useReveal';

const NAV_LINKS = [
  { label: 'Início', href: '#inicio' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Agendamento', href: '#agendamento' },
  { label: 'Contato', href: '#contato' },
];

export default function Navbar() {
  const scrolled = useScrollPosition();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <header
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-off-white/90 backdrop-blur-md shadow-[0_2px_20px_rgba(183,110,121,0.08)]'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-20">
        <a
          href="#inicio"
          data-testid="navbar-logo"
          className="font-serif-display text-xl tracking-wider text-deep-warm"
          onClick={() => setMenuOpen(false)}
        >
          <span className="font-light">Thay</span>{' '}
          <span className="gold-text font-medium">Nail</span>{' '}
          <span className="font-light text-sm tracking-[0.3em] block leading-none -mt-1 text-warm-gray">
            DESIGNER
          </span>
        </a>

        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                data-testid={`navbar-link-${link.label.toLowerCase().replace(/í/g, 'i')}`}
                className="relative text-sm tracking-wide text-deep-warm/80 hover:text-rose-gold transition-colors duration-300 font-body font-light group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-rose-gold transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        <button
          data-testid="navbar-menu-toggle"
          className="md:hidden text-deep-warm p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <div
        className={`md:hidden overflow-hidden transition-all duration-500 bg-off-white/95 backdrop-blur-md ${
          menuOpen ? 'max-h-screen border-t border-rose-gold/10' : 'max-h-0'
        }`}
      >
        <ul className="flex flex-col px-6 py-4 gap-4">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                data-testid={`navbar-mobile-link-${link.label.toLowerCase().replace(/í/g, 'i')}`}
                className="block py-2 text-deep-warm/80 hover:text-rose-gold transition-colors font-body font-light tracking-wide"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
