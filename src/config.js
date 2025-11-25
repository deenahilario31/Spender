// API Configuration
// In production, use Railway backend. In development, use local server.
export const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://spender-production.up.railway.app' 
    : 'http://localhost:3001');
