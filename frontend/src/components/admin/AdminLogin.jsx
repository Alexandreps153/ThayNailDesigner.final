import { useState } from 'react';
import { Lock, ArrowLeft, LoaderCircle } from 'lucide-react';
import { api, setToken } from '@/lib/api';
import { DecorativeLeaf } from '@/components/Decorations';

export default function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const { token } = await api.login(password);
      setToken(token);
      onSuccess();
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 relative overflow-hidden">
      <DecorativeLeaf className="absolute left-10 top-20 w-12 h-24 opacity-20" />
      <DecorativeLeaf className="absolute right-10 bottom-20 w-10 h-20 opacity-15" alt />

      <div className="bg-off-white rounded-3xl p-8 md:p-10 card-shadow w-full max-w-md animate-fade-in-scale relative">
        <a
          href="/"
          data-testid="admin-login-back-link"
          className="flex items-center gap-1 text-warm-gray hover:text-rose-gold transition-colors mb-6 font-body text-sm"
        >
          <ArrowLeft size={16} /> Voltar ao site
        </a>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-rose-pale flex items-center justify-center mx-auto mb-4">
            <Lock size={28} className="text-rose-gold" />
          </div>
          <h1 className="font-serif-display text-2xl text-deep-warm font-medium">
            Área Administrativa
          </h1>
          <p className="font-body text-sm text-warm-gray mt-1 font-light">
            Thay Nail Designer
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block font-body text-xs tracking-wider uppercase text-warm-gray mb-2">
            Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            placeholder="Digite a senha"
            autoFocus
            data-testid="admin-login-password-input"
            className={`w-full bg-cream border rounded-xl px-4 py-3 font-body text-sm text-deep-warm focus:outline-none transition-colors ${
              error ? 'border-red-400' : 'border-rose-gold/20 focus:border-rose-gold'
            }`}
          />
          {error && (
            <p data-testid="admin-login-error" className="text-red-400 text-xs font-body mt-2 animate-fade-in">
              Senha incorreta. Tente novamente.
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            data-testid="admin-login-submit-button"
            className="btn-shine w-full mt-6 px-6 py-3 bg-rose-gold text-white font-body text-sm tracking-widest uppercase rounded-full hover:opacity-90 transition-opacity duration-300 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <LoaderCircle size={16} className="animate-spin" />}
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
