import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getProfile } from '../api/profile';

const ProtectedRoute = ({ adminOnly = false }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await getProfile();
                setIsAuthenticated(true);
                // Check if user is admin (is_club_admin or is_staff)
                // Note: getProfile currently returns serializer.data directly or via response.data
                // Adjust based on your API response structure for /auth/profile/
                // Assuming response is the user object directly
                if (response.is_club_admin || response.is_staff || response.is_superuser || (response.user && (response.user.is_club_admin || response.user.is_staff))) {
                    setIsAdmin(true);
                }
            } catch (error) {
                setIsAuthenticated(false);
            }
        };
        checkAuth();
    }, []);

    if (isAuthenticated === null) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
