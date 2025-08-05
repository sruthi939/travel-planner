import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:1833/api', // Update if hosted elsewhere
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;