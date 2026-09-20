import { Instagram, MessageCircle, Lock } from 'lucide-react';
import { WHATSAPP_NUMBER } from '@/lib/api';

export default function Footer() {
  return (
    <footer className="bg-[#5C4A42] text-off-white py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="font-serif-display text-2xl font-light">
              Thay <span className="gold-text font-medium">Nail</span>
            </p>
            <p className="font-body text-xs tracking-[0.3em] uppercase text-off-white/60 mt-1">
              Nail Designer
            </p>
          </div>

          <p className="font-body text-sm text-off-white/70 font-light italic text-center">
            Realçando sua beleza através das unhas.
          </p>

          <div className="flex items-center gap-4">
            <a
              href={`https://wa.me/55${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="footer-whatsapp-link"
              className="w-10 h-10 rounded-full bg-off-white/10 flex items-center justify-center hover:bg-rose-gold transition-colors duration-300"
            >
              <MessageCircle size={18} className="text-off-white" />
            </a>
            <a
              href="#"
              data-testid="footer-instagram-link"
              className="w-10 h-10 rounded-full bg-off-white/10 flex items-center justify-center hover:bg-rose-gold transition-colors duration-300"
            >
              <Instagram size={18} className="text-off-white" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-off-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="font-body text-xs text-off-white/50 font-light">
            © {new Date().getFullYear()} Thay Nail Designer. Todos os direitos reservados.
          </p>
          <a
            href="/admin"
            data-testid="footer-admin-link"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-rose-gold bg-rose-gold px-5 py-2 font-body text-xs font-medium tracking-widest uppercase text-white transition-opacity duration-300 hover:opacity-90"
          >
            <Lock size={14} /> Área Administrativa
          </a>
        </div>
      </div>
    </footer>
  );
}
