import { useState } from 'react';
import { Plus, Trash2, CalendarOff, CalendarCheck, Check, LoaderCircle } from 'lucide-react';
import { api, DAY_NAMES, formatDateBR } from '@/lib/api';

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

function normalizeTime(value) {
  if (!value) return '09:00';
  const parts = value.split(':');
  const h = parts[0] ?? '09';
  const m = parts[1] ?? '00';
  const rounded = Number(m) >= 30 ? '30' : '00';
  return `${h.padStart(2, '0')}:${rounded}`;
}

export default function AdminSchedule({ data }) {
  const { workDays, setWorkDays, blockedSlots, setBlockedSlots, reload } = data;
  const [blockDate, setBlockDate] = useState('');
  const [blockTime, setBlockTime] = useState('');
  const [blockAllDay, setBlockAllDay] = useState(false);

  const [savedDay, setSavedDay] = useState(null);
  const [savingDay, setSavingDay] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const updateWorkDay = async (day, patch) => {
    const currentDay = workDays.find((wd) => wd.day === day);
    if (!currentDay) return;

    const next = { ...currentDay, ...patch };
    if (next.active && normalizeTime(next.opening_time) >= normalizeTime(next.closing_time)) {
      setSaveError('O último horário precisa ser depois do primeiro horário.');
      return;
    }

    setWorkDays(workDays.map((wd) => (wd.day === day ? next : wd)));
    setSavingDay(day);
    setSavedDay(null);
    setSaveError(null);
    try {
      await api.updateWorkDay(day, {
        active: next.active,
        opening_time: next.opening_time,
        closing_time: next.closing_time,
      });
      setSavedDay(day);
      setTimeout(() => setSavedDay((cur) => (cur === day ? null : cur)), 3500);
    } catch {
      setSaveError('Não foi possível salvar. Verifique sua conexão e tente novamente.');
      await reload();
    } finally {
      setSavingDay(null);
    }
  };

  const addBlock = async () => {
    if (!blockDate) return;
    try {
      const created = await api.addBlockedSlot({
        date: blockDate,
        time: blockAllDay ? null : blockTime || null,
      });
      setBlockedSlots([...blockedSlots, created]);
    } catch {}
    setBlockDate('');
    setBlockTime('');
    setBlockAllDay(false);
    reload();
  };

  const removeBlock = async (id) => {
    setBlockedSlots(blockedSlots.filter((bs) => bs.id !== id));
    try {
      await api.removeBlockedSlot(id);
    } catch {}
  };

  return (
    <div data-testid="admin-schedule">
      <h1 className="font-serif-display text-3xl text-deep-warm font-light mb-2">Agenda</h1>
      <p className="font-body text-sm text-warm-gray mb-8 font-light">Gerencie seus dias e horários de trabalho</p>

      {saveError && (
        <div data-testid="admin-schedule-error" className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 font-body text-sm text-red-600">
          {saveError}
        </div>
      )}

      <div className="bg-off-white rounded-2xl p-6 card-shadow mb-6">
        <h2 className="font-serif-display text-xl text-deep-warm font-medium mb-4">Dias de Trabalho</h2>
        <p className="font-body text-sm text-warm-gray mb-5 font-light">
          Escolha se cada dia está disponível. Nos dias disponíveis, defina o primeiro e o último horário.
        </p>
        <div className="space-y-3">
          {workDays.map((wd) => (
            <div key={wd.day} data-testid={`admin-workday-${wd.day}`} className="rounded-xl border border-rose-gold/15 bg-cream/60 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-body text-base font-medium text-deep-warm">{DAY_NAMES[wd.day]}</span>
                <div className="flex items-center gap-2">
                  {savingDay === wd.day && <LoaderCircle size={16} className="animate-spin text-rose-gold" />}
                  <div className="inline-flex overflow-hidden rounded-lg border border-rose-gold/30" role="group">
                    <button
                      data-testid={`admin-workday-${wd.day}-available`}
                      onClick={() => { if (!wd.active) updateWorkDay(wd.day, { active: true }); }}
                      disabled={savingDay === wd.day}
                      aria-pressed={wd.active}
                      className={`flex min-h-11 items-center justify-center gap-2 px-4 py-2 font-body text-sm font-medium transition-colors ${
                        wd.active ? 'bg-rose-gold text-white' : 'bg-off-white text-warm-gray hover:bg-rose-gold/10'
                      }`}
                    >
                      <CalendarCheck size={16} /> Disponível
                    </button>
                    <button
                      data-testid={`admin-workday-${wd.day}-closed`}
                      onClick={() => { if (wd.active) updateWorkDay(wd.day, { active: false }); }}
                      disabled={savingDay === wd.day}
                      aria-pressed={!wd.active}
                      className={`flex min-h-11 items-center justify-center gap-2 border-l border-rose-gold/30 px-4 py-2 font-body text-sm font-medium transition-colors ${
                        !wd.active ? 'bg-deep-warm text-white' : 'bg-off-white text-warm-gray hover:bg-rose-gold/10'
                      }`}
                    >
                      <CalendarOff size={16} /> Fechado
                    </button>
                  </div>
                </div>
              </div>
              {wd.active ? (
                <div className="mt-4 grid grid-cols-1 gap-3 border-t border-rose-gold/10 pt-4 sm:grid-cols-2">
                  <label className="font-body text-xs font-medium text-warm-gray">
                    Atende a partir das
                    <select
                      value={normalizeTime(wd.opening_time)}
                      disabled={savingDay === wd.day}
                      data-testid={`admin-workday-${wd.day}-open`}
                      onChange={(e) => updateWorkDay(wd.day, { opening_time: e.target.value })}
                      className="mt-1 min-h-11 w-full rounded-lg border border-rose-gold/20 bg-off-white px-3 py-2 font-body text-base text-deep-warm focus:border-rose-gold focus:outline-none disabled:opacity-60"
                    >
                      {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </label>
                  <label className="font-body text-xs font-medium text-warm-gray">
                    Último horário até
                    <select
                      value={normalizeTime(wd.closing_time)}
                      disabled={savingDay === wd.day}
                      data-testid={`admin-workday-${wd.day}-close`}
                      onChange={(e) => updateWorkDay(wd.day, { closing_time: e.target.value })}
                      className="mt-1 min-h-11 w-full rounded-lg border border-rose-gold/20 bg-off-white px-3 py-2 font-body text-base text-deep-warm focus:border-rose-gold focus:outline-none disabled:opacity-60"
                    >
                      {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </label>
                  {savedDay === wd.day && (
                    <span data-testid={`admin-workday-${wd.day}-saved`} className="col-span-full flex items-center gap-1 font-body text-xs text-green-600" role="status">
                      <Check size={14} /> Alteração salva
                    </span>
                  )}
                </div>
              ) : savedDay === wd.day ? (
                <span data-testid={`admin-workday-${wd.day}-saved`} className="mt-3 flex items-center gap-1 font-body text-xs text-green-600" role="status">
                  <Check size={14} /> Alteração salva
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-off-white rounded-2xl p-6 card-shadow">
        <h2 className="font-serif-display text-xl text-deep-warm font-medium mb-4">Bloquear Data / Horário</h2>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="date"
            value={blockDate}
            onChange={(e) => setBlockDate(e.target.value)}
            data-testid="admin-block-date-input"
            className="bg-cream border border-rose-gold/20 rounded-lg px-3 py-2 font-body text-sm text-deep-warm focus:outline-none focus:border-rose-gold"
          />
          <label className="flex items-center gap-2 font-body text-sm text-deep-warm">
            <input
              type="checkbox"
              checked={blockAllDay}
              onChange={(e) => setBlockAllDay(e.target.checked)}
              data-testid="admin-block-allday-checkbox"
              className="accent-rose-gold"
            />
            Dia todo
          </label>
          {!blockAllDay && (
            <input
              type="time"
              value={blockTime}
              onChange={(e) => setBlockTime(e.target.value)}
              data-testid="admin-block-time-input"
              className="bg-cream border border-rose-gold/20 rounded-lg px-3 py-2 font-body text-sm text-deep-warm focus:outline-none focus:border-rose-gold"
            />
          )}
          <button
            onClick={addBlock}
            disabled={!blockDate}
            data-testid="admin-block-add-button"
            className="btn-shine flex items-center gap-2 px-4 py-2 bg-rose-gold text-white font-body text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Plus size={16} /> Bloquear
          </button>
        </div>

        {blockedSlots.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
            {blockedSlots.map((bs) => (
              <div key={bs.id} data-testid={`admin-blocked-slot-${bs.id}`} className="flex items-center justify-between bg-cream rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  {!bs.time ? <CalendarOff size={16} className="text-rose-gold" /> : <CalendarCheck size={16} className="text-gold" />}
                  <span className="font-body text-sm text-deep-warm">
                    {formatDateBR(bs.date)} {bs.time && `às ${bs.time}`}
                    {!bs.time && ' (dia todo)'}
                  </span>
                </div>
                <button
                  onClick={() => removeBlock(bs.id)}
                  data-testid={`admin-blocked-slot-remove-${bs.id}`}
                  className="text-red-400 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
