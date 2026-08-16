import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Route Guard Component: Protects private routes from unauthorized access
const ProtectedRoute = ({ allowedRole }) => {
    const { user, token } = useAuth();

    // If user is not logged in, redirect them to Login page
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // If route requires specific role (e.g., 'ADMIN') and user role doesn't match, redirect away
    if (allowedRole && user.role?.toUpperCase() !== allowedRole?.toUpperCase()) {
        return <Navigate to={user.role?.toUpperCase() === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'} replace />;
    }

    // If authorized, render the requested child page via <Outlet />
    return <Outlet />;
};

export default ProtectedRoute;