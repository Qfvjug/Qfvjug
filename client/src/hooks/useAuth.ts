import { useState, useEffect } from "react";
import { auth } from "@/lib/utils";

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(auth.isLoggedIn());
  const [isAdmin, setIsAdmin] = useState(auth.isAdmin());
  const [user, setUser] = useState(auth.getUser());

  // Listen for changes to authentication state
  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(auth.isLoggedIn());
      setIsAdmin(auth.isAdmin());
      setUser(auth.getUser());
    };

    // Check immediately
    checkAuth();
    
    // Setup interval to check periodically
    const interval = setInterval(checkAuth, 60000); // Check every minute
    
    // Listen for storage events (if another tab changes auth state)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = (token: string, userData: any) => {
    auth.setToken(token);
    auth.setUser(userData);
    setIsLoggedIn(true);
    setIsAdmin(userData.isAdmin || false);
    setUser(userData);
  };

  const logout = () => {
    auth.logout();
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUser(null);
  };

  return {
    isLoggedIn,
    isAdmin,
    user,
    login,
    logout
  };
};

export default useAuth;
