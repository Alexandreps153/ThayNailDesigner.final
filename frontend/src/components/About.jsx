import { Sparkles, ShieldCheck, HandHeart, Award } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useReveal';
import { DecorativeLeaf, DecorativeDivider } from '@/components/Decorations';

const VALUES = [
  {
    icon: HandHeart,
    title: 'Atendimento Personalizado',
    text: 'Cada cliente é única. Dedico tempo para entender seu estilo e desejos, garantindo um resultado que combina com sua personalidade.',
  },
  {
    icon: Award,
    title: 'Qualidade dos Materiais',
    text: 'Utilizo apenas produtos premium importados, selecionados para garantir durabilidade, acabamento e segurança para suas unhas.',
  },
  {
    icon: ShieldCheck,
    title: 'Higienização Total',
    text: 'Esterilização rigorosa de todos os instrumentos e ambiente, seguindo protocolos de biossegurança para sua total tranquilidade.',
  },
  {
    icon: Sparkles,
    title: 'Compromisso com Resultados',
    text: 'Meu objetivo é que você saia sempre encantada. Cada detalhe é pensado para entregar muito além do esperado.',
  },
];

export default function About() {
  const { ref, visible } = useScrollReveal();

  return (
    <section id="sobre" data-testid="about-section" className="relative py-24 md:py-32 overflow-hidden bg-off-white">
      <DecorativeLeaf className="absolute right-0 top-20 w-16 h-32 opacity-20 hidden lg:block" />

      <div ref={ref} className={`max-w-7xl mx-auto px-6 lg:px-10 reveal ${visible ? 'reveal-visible' : ''}`}>
        <div className="text-center mb-16">
          <p className="font-body text-xs tracking-[0.4em] uppercase text-rose-gold mb-3">Sobre</p>
          <h2 className="font-serif-display text-3xl md:text-5xl text-deep-warm font-light">
            Conheça <span className="gold-text font-medium">Thay Nail</span>
          </h2>
          <DecorativeDivider />
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className={`relative reveal-scale ${visible ? 'reveal-visible' : ''}`}>
            <div className="absolute inset-0 bg-rose-pale rounded-[2rem] rotate-3 transition-transform duration-500" />
            <img
              src="/images/sobre.jpg"
              alt="Thay Nail Designer — profissional de nail design"
              className="relative rounded-[2rem] w-full object-cover aspect-[4/5] card-shadow"
            />
            <div className="absolute -bottom-8 -left-8 w-32 h-44 sm:w-40 sm:h-52 rounded-2xl overflow-hidden card-shadow border-4 border-off-white hidden sm:block">
              <img
                src="/images/servico.jpg"
                alt="Trabalho da Thay Nail Designer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <p className="font-serif-display text-xl md:text-2xl text-deep-warm leading-relaxed font-light italic">
                "Acredito que suas unhas são um reflexo da sua personalidade. Minha missão é
                transformar cada visita em uma experiência única de cuidado e beleza."
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {VALUES.map((v, i) => {
                const Icon = v.icon;
                return (
                  <div key={i} className={`reveal reveal-delay-${i + 1} ${visible ? 'reveal-visible' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-pale flex items-center justify-center">
                        <Icon size={18} className="text-rose-gold" />
                      </div>
                      <div>
                        <h3 className="font-body text-sm font-medium text-deep-warm mb-1 tracking-wide">
                          {v.title}
                        </h3>
                        <p className="font-body text-sm text-warm-gray leading-relaxed font-light">
                          {v.text}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
