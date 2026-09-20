import { CalendarDays, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { DAY_NAMES, formatDateBR } from '@/lib/api';

export default function AdminDashboard({ data }) {
  const { appointments, workDays, blockedSlots } = data;

  const today = new Date().toISOString().split('T')[0] ?? '';
  const upcoming = appointments
    .filter((a) => a.date >= today && a.status !== 'cancelled')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

  const totalPending = appointments.filter((a) => a.status === 'pending').length;
  const totalConfirmed = appointments.filter((a) => a.status === 'confirmed').length;
  const totalCancelled = appointments.filter((a) => a.status === 'cancelled').length;

  const activeDays = workDays.filter((wd) => wd.active).length;

  const stats = [
    { label: 'Total Agendamentos', value: appointments.length, icon: CalendarDays, color: 'bg-rose-pale', text: 'text-rose-gold' },
    { label: 'Próximos Atendimentos', value: upcoming.length, icon: Clock, color: 'bg-[#E8D5A8]/40', text: 'text-gold' },
    { label: 'Confirmados', value: totalConfirmed, icon: CheckCircle, color: 'bg-[#D4E8D4]', text: 'text-[#5a8a5a]' },
    { label: 'Cancelados', value: totalCancelled, icon: XCircle, color: 'bg-[#F0D4D4]', text: 'text-[#a55a5a]' },
  ];

  return (
    <div data-testid="admin-dashboard">
      <h1 className="font-serif-display text-3xl text-deep-warm font-light mb-2">Painel</h1>
      <p className="font-body text-sm text-warm-gray mb-8 font-light">Visão geral da sua agenda</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} data-testid={`admin-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`} className="bg-off-white rounded-2xl p-6 card-shadow">
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <Icon size={22} className={stat.text} />
              </div>
              <p className="font-serif-display text-3xl text-deep-warm font-medium">{stat.value}</p>
              <p className="font-body text-xs text-warm-gray tracking-wider uppercase mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-off-white rounded-2xl p-6 card-shadow">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-rose-gold" />
            <h2 className="font-serif-display text-xl text-deep-warm font-medium">Próximos Atendimentos</h2>
          </div>
          {upcoming.length === 0 ? (
            <p className="font-body text-sm text-warm-gray italic py-8 text-center">
              Nenhum agendamento próximo.
            </p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide">
              {upcoming.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between border-b border-rose-gold/10 pb-3">
                  <div>
                    <p className="font-body text-sm text-deep-warm font-medium">{apt.name}</p>
                    <p className="font-body text-xs text-warm-gray">{apt.service}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-body text-xs text-deep-warm">{formatDateBR(apt.date)}</p>
                    <p className="font-body text-xs text-rose-gold">{apt.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-off-white rounded-2xl p-6 card-shadow">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays size={20} className="text-rose-gold" />
            <h2 className="font-serif-display text-xl text-deep-warm font-medium">Dias de Trabalho</h2>
          </div>
          <div className="space-y-2">
            {workDays.map((wd) => (
              <div key={wd.day} className="flex items-center justify-between border-b border-rose-gold/10 pb-2">
                <span className="font-body text-sm text-deep-warm">{DAY_NAMES[wd.day]}</span>
                <div className="flex items-center gap-3">
                  <span className="font-body text-xs text-warm-gray">
                    {wd.active ? `${wd.opening_time} — ${wd.closing_time}` : 'Fechado'}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${wd.active ? 'bg-green-400' : 'bg-gray-300'}`} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 flex items-center justify-between">
            <span className="font-body text-xs text-warm-gray">Dias ativos: {activeDays}/7</span>
            <span className="font-body text-xs text-warm-gray">Datas bloqueadas: {blockedSlots.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
