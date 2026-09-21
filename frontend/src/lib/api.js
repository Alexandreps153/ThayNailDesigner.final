const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TOKEN_KEY = 'thay_admin_token';

export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
export const setToken = (token) => sessionStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => sessionStorage.removeItem(TOKEN_KEY);

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let detail = 'Erro na requisição';
    try {
      const data = await res.json();
      if (typeof data.detail === 'string') detail = data.detail;
    } catch {}
    const err = new Error(detail);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export const api = {
  login: (password) => request('/auth/login', { method: 'POST', body: { password } }),
  checkAuth: () => request('/auth/check', { auth: true }),

  getServices: () => request('/services'),
  createService: (data) => request('/services', { method: 'POST', body: data, auth: true }),
  updateService: (id, data) => request(`/services/${id}`, { method: 'PUT', body: data, auth: true }),
  deleteService: (id) => request(`/services/${id}`, { method: 'DELETE', auth: true }),
  setServiceOrder: (id, sort_order) => request(`/services/${id}/order`, { method: 'PUT', body: { sort_order }, auth: true }),

  getWorkDays: () => request('/work-days'),
  updateWorkDay: (day, data) => request(`/work-days/${day}`, { method: 'PUT', body: data, auth: true }),

  getBlockedSlots: () => request('/blocked-slots'),
  addBlockedSlot: (data) => request('/blocked-slots', { method: 'POST', body: data, auth: true }),
  removeBlockedSlot: (id) => request(`/blocked-slots/${id}`, { method: 'DELETE', auth: true }),

  getBookedSlots: () => request('/appointments/booked'),
  getAppointments: () => request('/appointments', { auth: true }),
  createAppointment: (data) => request('/appointments', { method: 'POST', body: data }),
  updateAppointmentStatus: (id, status) => request(`/appointments/${id}/status`, { method: 'PATCH', body: { status }, auth: true }),
};

export const WHATSAPP_NUMBER = '11958566979';
export const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
export const DAY_NAMES_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export function formatDateBR(isoDate) {
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}
