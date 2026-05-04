import { create } from 'zustand';

const KEY = 'ng_admin';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const saved = load();

if (saved.theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

export const useAdminStore = create((set, get) => ({
  token: saved.token || null,
  admin: saved.admin || null,
  theme: saved.theme || 'light',
  sidebarCollapsed: saved.sidebarCollapsed || false,
  notifications: [],
  unreadCount: 0,
  commandBarOpen: false,

  setAuth: ({ accessToken, user }) => {
    const s = { ...load(), token: accessToken, admin: user };
    localStorage.setItem(KEY, JSON.stringify(s));
    set({ token: accessToken, admin: user });
  },

  setToken: (token) => {
    localStorage.setItem(KEY, JSON.stringify({ ...load(), token }));
    set({ token });
  },

  logout: () => {
    localStorage.removeItem(KEY);
    set({ token: null, admin: null });
  },

  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next === 'dark' ? 'dark' : '');
    localStorage.setItem(KEY, JSON.stringify({ ...load(), theme: next }));
    set({ theme: next });
  },

  toggleSidebar: () => {
    const next = !get().sidebarCollapsed;
    localStorage.setItem(KEY, JSON.stringify({ ...load(), sidebarCollapsed: next }));
    set({ sidebarCollapsed: next });
  },

  openCommandBar:  () => set({ commandBarOpen: true }),
  closeCommandBar: () => set({ commandBarOpen: false }),

  setNotifications: (notifications) => {
    set({ notifications, unreadCount: notifications.filter(n => !n.read).length });
  },

  addNotification: (n) => {
    set(s => ({ notifications: [{ ...n, read: false, id: Date.now() }, ...s.notifications], unreadCount: s.unreadCount + 1 }));
  },

  markAllRead: () => {
    set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })), unreadCount: 0 }));
  },
}));
