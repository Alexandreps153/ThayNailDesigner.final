import { useEffect, useState } from 'react';
import { Instagram, MessageCircle, Clock } from 'lucide-react';
import { api, WHATSAPP_NUMBER, DAY_NAMES } from '@/lib/api';
import { useScrollReveal, useRefetchOnFocus } from '@/hooks/useReveal';
import { useCallback } from 'react';
import { DecorativeDivider, DecorativeLeaf } from '@/components/Decorations';

export default function Contact() {
  const { ref, visible } = useScrollReveal();
  const [workDays, setWorkDays] = useState([]);

  const load = useCallback(async () => {
    try {
      setWorkDays(await api.getWorkDays());
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);
  useRefetchOnFocus(load);

  const activeDays = workDays.filter((wd) => wd.active);

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

        <div className="grid md:grid-cols-3 gap-6">
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
            href="#"
            data-testid="contact-instagram-link"
            className="group bg-cream rounded-2xl p-8 text-center card-shadow card-shadow-hover transition-all duration-500 hover:-translate-y-1"
          >
            <div className="w-14 h-14 rounded-full bg-rose-pale flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Instagram size={24} className="text-rose-gold" />
            </div>
            <h3 className="font-serif-display text-xl text-deep-warm font-medium mb-2">Instagram</h3>
            <p className="font-body text-sm text-warm-gray font-light">
              @thaymaildesigner
            </p>
          </a>

          <div className="bg-cream rounded-2xl p-8 text-center card-shadow">
            <div className="w-14 h-14 rounded-full bg-rose-pale flex items-center justify-center mx-auto mb-4">
              <Clock size={24} className="text-rose-gold" />
            </div>
            <h3 className="font-serif-display text-xl text-deep-warm font-medium mb-2">Horários</h3>
            <div data-testid="contact-hours" className="font-body text-sm text-warm-gray font-light space-y-1">
              {activeDays.length === 0 ? (
                <p>Consulte disponibilidade pelo WhatsApp</p>
              ) : (
                activeDays.map((wd) => (
                  <p key={wd.day}>
                    {DAY_NAMES[wd.day]}: {wd.opening_time} — {wd.closing_time}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
