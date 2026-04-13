import axios from 'axios';

const api = axios.create({
  baseURL: 'https://valtrofinance.pythonanywhere.com/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;