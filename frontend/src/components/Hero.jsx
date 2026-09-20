import { CalendarHeart } from 'lucide-react';

export default function Hero() {
  return (
    <section id="inicio" data-testid="hero-section" className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-20">
      <video
        data-testid="hero-animation-video"
        className="fixed inset-0 -z-10 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src="/videos/home-animation.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 -z-10 bg-off-white/45 pointer-events-none" />

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <h1 className="font-serif-display text-deep-warm font-light leading-none animate-fade-in-scale">
          <span data-testid="hero-title-thay" className="block text-[clamp(3.75rem,10vw,8.5rem)]">THAY</span>
          <span className="mt-3 block text-[clamp(1.25rem,3.5vw,3rem)] font-normal tracking-[0.28em] pl-[0.28em]">NAIL DESIGNER</span>
        </h1>

        <p className="font-serif-display italic text-xl md:text-2xl text-deep-warm mt-8 mb-10 animate-fade-in-up reveal-delay-1">
          Realçando sua beleza através das unhas.
        </p>

        <a
          href="#agendamento"
          data-testid="hero-booking-button"
          className="btn-shine inline-flex items-center gap-2 px-8 py-4 bg-rose-gold text-white font-body text-sm tracking-widest uppercase rounded-full hover:opacity-90 transition-opacity duration-300 card-shadow animate-fade-in-up reveal-delay-2"
        >
          <CalendarHeart size={18} />
          Agendar Horário
        </a>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float-gentle">
        <div className="w-px h-12 bg-gradient-to-b from-rose-gold/40 to-transparent" />
      </div>
    </section>
  );
}
