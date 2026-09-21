import { Instagram, MessageCircle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '@/lib/api';
import { useScrollReveal } from '@/hooks/useReveal';
import { DecorativeDivider, DecorativeLeaf } from '@/components/Decorations';

const INSTAGRAM_URL = 'https://www.instagram.com/by_thay.designer?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==';

export default function Contact() {
  const { ref, visible } = useScrollReveal();

  return (
    <section id="contato" data-testid="contact-section" className="relative py-24 md:py-32 overflow-hidden bg-off-white">
      <DecorativeLeaf className="absolute left-0 bottom-10 w-12 h-24 opacity-15 hidden lg:block" alt />

      <div ref={ref} className={`max-w-5xl mx-auto px-6 lg:px-10 reveal ${visible ? 'reveal-visible' : ''}`}>
        <div className="text-center mb-12">
          <p className="font-body text-xs tracking-[0.4em] uppercase text-rose-gold mb-3">Contato</p>
          <h2 className="font-serif-display text-3xl md:text-5xl text-deep-warm font-light">
            Entre em <span className="gold-text font-medium">Contato</span>
          </h2>
          <DecorativeDivider />
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <a
            href={`https://wa.me/55${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="contact-whatsapp-link"
            className="group bg-cream rounded-2xl p-8 text-center card-shadow card-shadow-hover transition-all duration-500 hover:-translate-y-1"
          >
            <div className="w-14 h-14 rounded-full bg-rose-pale flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <MessageCircle size={24} className="text-rose-gold" />
            </div>
            <h3 className="font-serif-display text-xl text-deep-warm font-medium mb-2">WhatsApp</h3>
            <p className="font-body text-sm text-warm-gray font-light">
              (11) 95856-6979
            </p>
          </a>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="contact-instagram-link"
            className="group bg-cream rounded-2xl p-8 text-center card-shadow card-shadow-hover transition-all duration-500 hover:-translate-y-1"
          >
            <div className="w-14 h-14 rounded-full bg-rose-pale flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Instagram size={24} className="text-rose-gold" />
            </div>
            <h3 className="font-serif-display text-xl text-deep-warm font-medium mb-2">Instagram</h3>
            <p className="font-body text-sm text-warm-gray font-light">
              @by_thay.designer
            </p>
          </a>
        </div>
      </div>
    </section>
  );
}
