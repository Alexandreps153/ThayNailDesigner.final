import { useEffect, useRef } from 'react';
import { CalendarHeart } from 'lucide-react';

const FRAME_COUNT = 30;
const framePath = (i) => `/frames/frame-${String(i + 1).padStart(4, '0')}.jpg`;

export default function Hero() {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const currentRef = useRef(-1);
  const tickingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const images = [];
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = framePath(i);
      images.push(img);
    }
    imagesRef.current = images;

    const draw = (index) => {
      const img = images[index];
      if (!img || !img.complete || !img.naturalWidth) return;
      const { width, height } = canvas;
      const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
      currentRef.current = index;
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      draw(currentRef.current < 0 ? 0 : currentRef.current);
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        tickingRef.current = false;
        const range = window.innerHeight * 1.4;
        const progress = Math.min(1, Math.max(0, window.scrollY / range));
        const index = Math.round(progress * (FRAME_COUNT - 1));
        if (index !== currentRef.current) draw(index);
      });
    };

    resize();
    images[0].onload = () => {
      if (currentRef.current < 0) draw(0);
    };
    if (!reduced) {
      window.addEventListener('scroll', onScroll, { passive: true });
    }
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <section id="inicio" data-testid="hero-section" className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-20">
      <canvas
        ref={canvasRef}
        data-testid="hero-animation-canvas"
        className="fixed inset-0 z-0 h-full w-full"
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-0 bg-off-white/45 pointer-events-none" />

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
