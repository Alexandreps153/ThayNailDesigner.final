import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

export function useAdminData() {
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [workDays, setWorkDays] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    try {
      const [svc, apt, wd, bs] = await Promise.all([
        api.getServices(),
        api.getAppointments(),
        api.getWorkDays(),
        api.getBlockedSlots(),
      ]);
      setServices(svc);
      setAppointments(apt);
      setWorkDays(wd);
      setBlockedSlots(bs);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  return { services, setServices, appointments, setAppointments, workDays, setWorkDays, blockedSlots, setBlockedSlots, loading, reload: loadAll };
}
