import axios from 'axios';

// Create a pre-configured Axios instance pointing to our Node.js backend
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api', // Backend REST API base URL
});

// Axios Request Interceptor: Executed before every single HTTP request
axiosInstance.interceptors.request.use(
    (config) => {
        // Retrieve stored JWT token from browser localStorage
        const token = localStorage.getItem('token');

        // If token exists, automatically attach it to Authorization header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config; // Continue request with attached header
    },
    (error) => {
        console.error('Axios Request Error:', error);
        return Promise.reject(error);
    }
);

// Axios Response Interceptor: Executed on every HTTP response
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Axios Response Error:', error.response || error.message);
        return Promise.reject(error);
    }
);

export default axiosInstance;
