import { useState } from 'react';
import { LayoutDashboard, CalendarDays, Sparkles, LogOut, ExternalLink } from 'lucide-react';
import { clearToken } from '@/lib/api';
import { useAdminData } from './useAdminData';
import AdminDashboard from './AdminDashboard';
import AdminSchedule from './AdminSchedule';
import AdminServices from './AdminServices';

const TABS = [
  { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
  { id: 'schedule', label: 'Agenda', icon: CalendarDays },
  { id: 'services', label: 'Serviços', icon: Sparkles },
];

export default function AdminPanel({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const data = useAdminData();

  const handleLogout = () => {
    clearToken();
    onLogout();
  };

  return (
    <div data-testid="admin-panel" className="min-h-screen bg-cream flex flex-col md:flex-row">
      <aside className="md:w-64 bg-[#5C4A42] text-off-white md:min-h-screen flex md:flex-col items-center md:items-start justify-between md:justify-start px-4 md:px-6 py-4 md:py-8 sticky top-0 z-30">
        <div className="hidden md:block mb-8">
          <p className="font-serif-display text-xl font-light">
            Thay <span className="gold-text font-medium">Nail</span>
          </p>
          <p className="font-body text-xs tracking-[0.2em] uppercase text-off-white/50 mt-1">
            Admin
          </p>
        </div>

        <nav className="flex md:flex-col gap-1 w-full md:w-auto overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                data-testid={`admin-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-body text-sm transition-colors duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-rose-gold text-white'
                    : 'text-off-white/70 hover:bg-off-white/10'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="hidden md:block mt-auto pt-8 space-y-2 w-full">
          <a
            href="/"
            data-testid="admin-view-site-link"
            className="flex items-center gap-2 px-4 py-2 text-off-white/60 hover:text-off-white transition-colors font-body text-sm"
          >
            <ExternalLink size={16} /> Ver site
          </a>
          <button
            onClick={handleLogout}
            data-testid="admin-logout-button"
            className="flex items-center gap-2 px-4 py-2 text-off-white/60 hover:text-off-white transition-colors font-body text-sm"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>

        <button
          onClick={handleLogout}
          data-testid="admin-logout-button-mobile"
          className="md:hidden flex items-center gap-2 text-off-white/60 hover:text-off-white transition-colors"
        >
          <LogOut size={18} />
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-x-hidden">
        {data.loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-rose-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <AdminDashboard data={data} />}
            {activeTab === 'schedule' && <AdminSchedule data={data} />}
            {activeTab === 'services' && <AdminServices data={data} />}
          </>
        )}
      </main>
    </div>
  );
}
