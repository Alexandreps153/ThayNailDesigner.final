import { useEffect, useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Check, Calendar, Clock, User, Phone, Sparkles } from 'lucide-react';
import { api, WHATSAPP_NUMBER, DAY_NAMES_SHORT, MONTH_NAMES, formatDateBR } from '@/lib/api';
import { useScrollReveal, useRefetchOnFocus } from '@/hooks/useReveal';
import { DecorativeDivider, DecorativeLeaf } from '@/components/Decorations';

function dateToISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function generateTimeSlots(open, close) {
  const [oh = 0, om = 0] = open.split(':').map(Number);
  const [ch = 0, cm = 0] = close.split(':').map(Number);
  const slots = [];
  let h = oh, m = om;
  const endMin = ch * 60 + cm;
  while (h * 60 + m < endMin) {
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    m += 60;
    if (m >= 60) { h += Math.floor(m / 60); m = m % 60; }
  }
  return slots;
}

export default function Booking() {
  const { ref, visible } = useScrollReveal();
  const [services, setServices] = useState([]);
  const [workDays, setWorkDays] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedService, setSelectedService] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [svc, wd, bs, booked] = await Promise.all([
        api.getServices(),
        api.getWorkDays(),
        api.getBlockedSlots(),
        api.getBookedSlots(),
      ]);
      setServices(svc);
      setWorkDays(wd);
      setBlockedSlots(bs);
      setBookedSlots(booked);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useRefetchOnFocus(load);

  const getWorkDay = useCallback((dayOfWeek) => {
    return workDays.find((wd) => wd.day === dayOfWeek);
  }, [workDays]);

  const isDateAvailable = useCallback((date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;
    const wd = getWorkDay(date.getDay());
    if (!wd || !wd.active) return false;
    const iso = dateToISO(date);
    const fullDayBlock = blockedSlots.some((bs) => bs.date === iso && !bs.time);
    return !fullDayBlock;
  }, [getWorkDay, blockedSlots]);

  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    const wd = getWorkDay(selectedDate.getDay());
    if (!wd || !wd.active) return [];
    const iso = dateToISO(selectedDate);
    const allSlots = generateTimeSlots(wd.opening_time, wd.closing_time);
    const blockedTimes = new Set(
      blockedSlots.filter((bs) => bs.date === iso && bs.time).map((bs) => bs.time)
    );
    const bookedTimes = new Set(
      bookedSlots.filter((apt) => apt.date === iso).map((apt) => apt.time)
    );
    return allSlots.filter((t) => !blockedTimes.has(t) && !bookedTimes.has(t));
  }, [selectedDate, getWorkDay, blockedSlots, bookedSlots]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  }, [currentMonth]);

  const handleConfirm = async () => {
    if (!selectedDate || !selectedService || !selectedTime || !name || !phone) return;
    setSubmitting(true);
    setError('');
    try {
      await api.createAppointment({
        name,
        phone,
        service: selectedService,
        date: dateToISO(selectedDate),
        time: selectedTime,
      });
      const message = `Olá, gostaria de confirmar meu agendamento.\n\nNome: ${name}\nServiço: ${selectedService}\nData: ${formatDateBR(dateToISO(selectedDate))}\nHorário: ${selectedTime}`;
      const whatsappUrl = `https://wa.me/55${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      setWhatsappLink(whatsappUrl);
      const win = window.open(whatsappUrl, '_blank');
      if (!win) window.location.href = whatsappUrl;
      setConfirmed(true);
      load();
    } catch (e) {
      setError(e.status === 409 ? 'Este horário acabou de ser reservado. Escolha outro.' : 'Não foi possível enviar. Tente novamente.');
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const canConfirm = selectedDate && selectedService && selectedTime && name.trim() && phone.trim() && !submitting;

  return (
    <section id="agendamento" data-testid="booking-section" className="relative py-24 md:py-32 bg-cream overflow-hidden">
      <DecorativeLeaf className="absolute right-0 top-30 w-12 h-24 opacity-15 hidden lg:block" />

      <div ref={ref} className={`max-w-5xl mx-auto px-6 lg:px-10 reveal ${visible ? 'reveal-visible' : ''}`}>
        <div className="text-center mb-12">
          <p className="font-body text-xs tracking-[0.4em] uppercase text-rose-gold mb-3">Agendamento</p>
          <h2 className="font-serif-display text-3xl md:text-5xl text-deep-warm font-light">
            Agende seu <span className="gold-text font-medium">Horário</span>
          </h2>
          <DecorativeDivider />
        </div>

        {confirmed ? (
          <div data-testid="booking-confirmation" className="bg-off-white rounded-3xl p-8 md:p-12 text-center card-shadow max-w-lg mx-auto animate-fade-in-scale">
            <div className="w-16 h-16 rounded-full bg-rose-pale flex items-center justify-center mx-auto mb-6">
              <Check size={32} className="text-rose-gold" />
            </div>
            <h3 className="font-serif-display text-2xl text-deep-warm font-medium mb-3">
              Agendamento enviado!
            </h3>
            <p className="font-body text-warm-gray font-light leading-relaxed mb-6">
              Abrimos o WhatsApp com sua mensagem pronta. Envie para confirmar seu horário.
            </p>
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="booking-whatsapp-link"
                className="btn-shine inline-flex items-center justify-center gap-2 px-6 py-3 mb-6 bg-rose-gold text-white font-body text-sm tracking-widest uppercase rounded-full hover:opacity-90 transition-opacity"
              >
                Abrir WhatsApp
              </a>
            )}
            <br />
            <button
              data-testid="booking-new-button"
              onClick={() => {
                setConfirmed(false);
                setSelectedDate(null);
                setSelectedService('');
                setSelectedTime('');
                setName('');
                setPhone('');
              }}
              className="font-body text-sm tracking-widest uppercase text-rose-gold border-b border-rose-gold/30 pb-1 hover:text-deep-warm transition-colors"
            >
              Novo Agendamento
            </button>
          </div>
        ) : (
          <div className="bg-off-white rounded-3xl p-6 md:p-10 card-shadow">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-rose-gold border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      data-testid="booking-prev-month"
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                      className="p-2 rounded-lg hover:bg-rose-pale transition-colors"
                    >
                      <ChevronLeft size={20} className="text-deep-warm" />
                    </button>
                    <h3 className="font-serif-display text-xl text-deep-warm font-medium">
                      {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h3>
                    <button
                      data-testid="booking-next-month"
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                      className="p-2 rounded-lg hover:bg-rose-pale transition-colors"
                    >
                      <ChevronRight size={20} className="text-deep-warm" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {DAY_NAMES_SHORT.map((d) => (
                      <div key={d} className="text-center text-xs text-warm-gray font-body py-1">
                        {d}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((date, i) => {
                      if (!date) return <div key={`empty-${i}`} />;
                      const available = isDateAvailable(date);
                      const isSelected = selectedDate?.toDateString() === date.toDateString();
                      const isToday = new Date().toDateString() === date.toDateString();
                      return (
                        <button
                          key={dateToISO(date)}
                          data-testid={`booking-day-${dateToISO(date)}`}
                          disabled={!available}
                          onClick={() => {
                            setSelectedDate(date);
                            setSelectedTime('');
                          }}
                          className={`
                            aspect-square rounded-lg text-sm font-body transition-colors duration-200
                            ${isSelected
                              ? 'bg-rose-gold text-white shadow-md'
                              : available
                                ? 'text-deep-warm hover:bg-rose-pale'
                                : 'text-warm-gray/30 cursor-not-allowed'
                            }
                            ${isToday && !isSelected ? 'ring-1 ring-rose-gold/40' : ''}
                          `}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="flex items-center gap-2 font-body text-xs tracking-wider uppercase text-warm-gray mb-2">
                      <Sparkles size={14} className="text-rose-gold" /> Serviço
                    </label>
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      data-testid="booking-service-select"
                      className="w-full bg-cream border border-rose-gold/20 rounded-xl px-4 py-3 font-body text-sm text-deep-warm focus:outline-none focus:border-rose-gold transition-colors"
                    >
                      <option value="">Selecione um serviço</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name} — R$ {Number(s.price).toFixed(0)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 font-body text-xs tracking-wider uppercase text-warm-gray mb-2">
                      <Clock size={14} className="text-rose-gold" /> Horário
                    </label>
                    {selectedDate ? (
                      availableSlots.length > 0 ? (
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto scrollbar-hide">
                          {availableSlots.map((t) => (
                            <button
                              key={t}
                              data-testid={`booking-slot-${t}`}
                              onClick={() => setSelectedTime(t)}
                              className={`
                                px-4 py-2 rounded-lg text-sm font-body transition-colors duration-200
                                ${selectedTime === t
                                  ? 'bg-rose-gold text-white'
                                  : 'bg-cream text-deep-warm hover:bg-rose-pale border border-rose-gold/15'
                                }
                              `}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="font-body text-sm text-warm-gray italic">
                          Nenhum horário disponível para esta data.
                        </p>
                      )
                    ) : (
                      <p className="font-body text-sm text-warm-gray italic">
                        Selecione uma data no calendário.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 font-body text-xs tracking-wider uppercase text-warm-gray mb-2">
                      <User size={14} className="text-rose-gold" /> Nome
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome completo"
                      data-testid="booking-name-input"
                      className="w-full bg-cream border border-rose-gold/20 rounded-xl px-4 py-3 font-body text-sm text-deep-warm placeholder:text-warm-gray/40 focus:outline-none focus:border-rose-gold transition-colors"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 font-body text-xs tracking-wider uppercase text-warm-gray mb-2">
                      <Phone size={14} className="text-rose-gold" /> Telefone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(00) 00000-0000"
                      data-testid="booking-phone-input"
                      className="w-full bg-cream border border-rose-gold/20 rounded-xl px-4 py-3 font-body text-sm text-deep-warm placeholder:text-warm-gray/40 focus:outline-none focus:border-rose-gold transition-colors"
                    />
                  </div>

                  {selectedDate && selectedService && selectedTime && (
                    <div className="bg-rose-pale/50 rounded-xl p-4 animate-fade-in">
                      <div className="flex items-center gap-2 mb-2 text-warm-gray">
                        <Calendar size={16} className="text-rose-gold" />
                        <span className="font-body text-sm">
                          {formatDateBR(dateToISO(selectedDate))} às {selectedTime}
                        </span>
                      </div>
                      <p className="font-body text-sm text-deep-warm">{selectedService}</p>
                    </div>
                  )}

                  {error && (
                    <p data-testid="booking-error" className="font-body text-sm text-red-500 animate-fade-in">{error}</p>
                  )}

                  <button
                    onClick={handleConfirm}
                    disabled={!canConfirm}
                    data-testid="booking-confirm-button"
                    className={`
                      btn-shine w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full font-body text-sm tracking-widest uppercase transition-all duration-300
                      ${canConfirm
                        ? 'bg-rose-gold text-white hover:scale-[1.02] hover:shadow-lg hover:shadow-[rgba(183,110,121,0.3)]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    {submitting ? 'Enviando...' : 'Confirmar no WhatsApp'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
