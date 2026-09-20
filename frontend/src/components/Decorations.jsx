import { Sparkles } from 'lucide-react';

export function DecorativeLeaf({ className = '', alt = false }) {
  return (
    <svg
      viewBox="0 0 100 200"
      className={`${className} ${alt ? 'animate-leaf-alt' : 'animate-leaf'}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M50 10 C 20 50, 15 120, 50 190 C 85 120, 80 50, 50 10 Z"
        fill="url(#leafGrad)"
        opacity="0.15"
      />
      <path d="M50 10 C 20 50, 15 120, 50 190" stroke="#B76E79" strokeWidth="0.5" opacity="0.3" />
      <path d="M50 10 C 80 50, 85 120, 50 190" stroke="#B76E79" strokeWidth="0.5" opacity="0.3" />
      <line x1="50" y1="30" x2="50" y2="180" stroke="#C9A96E" strokeWidth="0.5" opacity="0.2" />
      <defs>
        <linearGradient id="leafGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8C4C0" />
          <stop offset="100%" stopColor="#D4A88A" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function OrganicLine({ className = '' }) {
  return (
    <svg viewBox="0 0 300 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 30 Q 75 0, 150 30 T 300 30" stroke="url(#lineGrad)" strokeWidth="1.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#C9A96E" stopOpacity="0" />
          <stop offset="50%" stopColor="#B76E79" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#C9A96E" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function DecorativeDivider() {
  return (
    <div className="flex items-center justify-center gap-4 py-2">
      <OrganicLine className="w-24 h-6" />
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-gold opacity-60" />
        <Sparkles size={14} style={{ color: '#C9A96E', opacity: 0.5 }} />
        <span className="w-1.5 h-1.5 rounded-full bg-rose-gold opacity-60" />
      </div>
      <OrganicLine className="w-24 h-6 rotate-180" />
    </div>
  );
}
