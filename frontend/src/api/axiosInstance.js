import axios from 'axios';

// Create a pre-configured Axios instance pointing to our backend API
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

// Axios Request Interceptor: Attach JWT token automatically
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Axios Request Error:', error);
        return Promise.reject(error);
    }
);

// Axios Response Interceptor: Handle response
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Axios Response Error:', error.response || error.message);
        return Promise.reject(error);
    }
);

export default axiosInstance;
