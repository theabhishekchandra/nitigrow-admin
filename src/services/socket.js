// Singleton socket for the admin panel. Connects to the API (not the admin
// origin) since static admin builds aren't served by the same host as the
// Express server. The token is required to join the `admins` room — without
// it the server-side join_admin handler silently no-ops.

import { io } from 'socket.io-client';

const API_BASE =
  window.NITIGROW_API_BASE ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : window.location.origin.replace(/^https?:\/\/admin\./, 'https://api.'));

let socket = null;

export const connectAdminSocket = (token) => {
  if (socket?.connected) return socket;
  if (!socket) {
    socket = io(API_BASE, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2_000,
      reconnectionDelayMax: 10_000,
      withCredentials: true,
    });
    socket.on('connect', () => {
      if (token) socket.emit('join_admin', token);
    });
    socket.on('reconnect', () => {
      if (token) socket.emit('join_admin', token);
    });
  } else {
    socket.connect();
    if (token && socket.connected) socket.emit('join_admin', token);
  }
  return socket;
};

export const disconnectAdminSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};

export const getAdminSocket = () => socket;
