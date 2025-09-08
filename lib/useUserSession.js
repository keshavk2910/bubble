import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export function useUserSession() {
  const [userSession, setUserSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeSession = () => {
      try {
        const session = localStorage.getItem('supabase_session');
        const profile = localStorage.getItem('user_profile');

        if (session && profile) {
          const sessionData = JSON.parse(session);
          const profileData = JSON.parse(profile);
          setUserSession({
            session: sessionData,
            profile: profileData,
            isAuthenticated: true,
          });
        } else {
          setUserSession({
            session: null,
            profile: null,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error('Session initialization error:', error);
        setUserSession({
          session: null,
          profile: null,
          isAuthenticated: false,
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'supabase_session' || e.key === 'user_profile') {
        initializeSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateProfile = (newProfile) => {
    try {
      localStorage.setItem('user_profile', JSON.stringify(newProfile));
      setUserSession((prev) =>
        prev
          ? {
              ...prev,
              profile: newProfile,
            }
          : null
      );
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('supabase_session');
    localStorage.removeItem('user_profile');
    setUserSession({
      session: null,
      profile: null,
      isAuthenticated: false,
    });
    router.push('/');
  };

  return {
    userSession,
    isLoading,
    updateProfile,
    logout,
    // Convenience getters
    user: userSession?.profile || null,
    avatar: userSession?.profile?.avatar_url || null,
    isAuthenticated: userSession?.isAuthenticated || false,
    token: userSession?.session?.access_token || null,
  };
}

// Hook for components that need user data but shouldn't redirect on auth failure
export function useOptionalUserSession() {
  const { userSession, isLoading, user, avatar, isAuthenticated, token } =
    useUserSession();

  return {
    user,
    avatar,
    isAuthenticated,
    token,
    isLoading,
  };
}
