import { createContext, useContext, useState, useEffect } from 'react';
import fetchWithAuth from '../services/apiFetch';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt silently login on mount
    const fetchUser = async () => {
      try {
        const response = await fetchWithAuth('/users/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Listen to custom event when API says unauthenticated
    const handleAuthFailed = () => setUser(null);
    window.addEventListener('auth-failed', handleAuthFailed);

    return () => window.removeEventListener('auth-failed', handleAuthFailed);
  }, []);

  const login = () => {
    // Redirect to the backend OAuth endpoint
    window.location.href = "/auth/google";
  };

  const logout = async () => {
    try {
      await fetchWithAuth('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
