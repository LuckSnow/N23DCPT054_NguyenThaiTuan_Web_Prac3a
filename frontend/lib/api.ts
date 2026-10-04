import axios from 'axios';

const rawUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.BACKEND_URL ||
    'http://localhost:5000';

const baseURL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

const api = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
});

export default api;