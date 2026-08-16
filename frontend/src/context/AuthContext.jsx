import { createContext, useContext, useState } from 'react';

// Create Global Auth Context Object
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Initialize state from localStorage so login persists on browser refresh
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [token, setToken] = useState(() => localStorage.getItem('token') || null);

    // Helper function to save login details into React state & localStorage
    const loginState = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userToken);
    };

    // Helper function to clear login details on sign out
    const logoutState = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    return (
        // Expose user, token, helper methods, and role flags to all components
        <AuthContext.Provider
            value={{
                user,
                token,
                loginState,
                logoutState,
                isAdmin: user?.role === 'ADMIN'
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Custom Hook to easily access AuthContext anywhere in the app
export const useAuth = () => useContext(AuthContext);