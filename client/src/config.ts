const isProd = process.env.NODE_ENV === 'production';

export const API_URL = isProd
  ? 'https://collab-editor-server-vh0m.onrender.com'
  : 'http://localhost:5000';

export const SOCKET_URL = isProd
  ? 'https://collab-editor-server-vh0m.onrender.com'
  : 'http://localhost:5000';