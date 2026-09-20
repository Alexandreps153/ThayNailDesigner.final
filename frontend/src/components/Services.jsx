import { useCallback, useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { useScrollReveal, useRefetchOnFocus } from '@/hooks/useReveal';
import { DecorativeDivider, DecorativeLeaf } from '@/components/Decorations';

function formatDuration(minutes) {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h}h${String(m).padStart(2, '0')}`;
  if (h) return `${h}h`;
  return `${m}min`;
}

export default function Services() {
  const { ref, visible } = useScrollReveal();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await api.getServices();
      setServices(data);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useRefetchOnFocus(load);

  return (
    <section id="servicos" data-testid="services-section" className="relative py-24 md:py-32 bg-cream overflow-hidden">
      <DecorativeLeaf className="absolute left-0 bottom-20 w-14 h-28 opacity-15 hidden lg:block" alt />

      <div ref={ref} className={`max-w-7xl mx-auto px-6 lg:px-10 reveal ${visible ? 'reveal-visible' : ''}`}>
        <div className="text-center mb-16">
          <p className="font-body text-xs tracking-[0.4em] uppercase text-rose-gold mb-3">Serviços</p>
          <h2 className="font-serif-display text-3xl md:text-5xl text-deep-warm font-light">
            Nossos <span className="gold-text font-medium">Serviços</span>
          </h2>
          <DecorativeDivider />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-rose-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : services.length === 0 ? (
          <p className="text-center font-body text-warm-gray font-light py-10">
            Em breve novidades por aqui.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <div
                key={service.id}
                data-testid={`service-card-${service.id}`}
                className={`group bg-off-white rounded-2xl overflow-hidden card-shadow card-shadow-hover transition-all duration-500 hover:-translate-y-2 reveal reveal-delay-${(i % 5) + 1} ${
                  visible ? 'reveal-visible' : ''
                }`}
              >
                {service.image && (
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(92,74,66,0.3)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-serif-display text-2xl text-deep-warm font-medium mb-2">
                    {service.name}
                  </h3>
                  <p className="font-body text-sm text-warm-gray leading-relaxed font-light mb-4">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-rose-gold/10">
                    <div className="flex items-center gap-3">
                      <span className="font-serif-display text-2xl gold-text font-medium">
                        R$ {Number(service.price).toFixed(0)}
                      </span>
                      {service.duration_minutes ? (
                        <span className="flex items-center gap-1 font-body text-xs text-warm-gray">
                          <Clock size={12} /> {formatDuration(service.duration_minutes)}
                        </span>
                      ) : null}
                    </div>
                    <a
                      href="#agendamento"
                      data-testid={`service-book-link-${service.id}`}
                      className="font-body text-xs tracking-widest uppercase text-rose-gold hover:text-deep-warm transition-colors border-b border-rose-gold/30 hover:border-deep-warm pb-0.5"
                    >
                      Agendar
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
