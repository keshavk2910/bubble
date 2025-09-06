import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkUserRoleAndRedirect = async () => {
      try {
        // Check if user is authenticated
        const session = localStorage.getItem('supabase_session');
        if (!session) {
          router.push('/sign-in?redirect=/dashboard');
          return;
        }

        const sessionData = JSON.parse(session);
        const token = sessionData.access_token;

        if (!token) {
          router.push('/sign-in?redirect=/dashboard');
          return;
        }

        // Get current user info to determine role
        const response = await fetch('/api/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('supabase_session');
            localStorage.removeItem('user_profile');
            router.push('/sign-in?redirect=/dashboard');
            return;
          }
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        const userRole = userData.profile?.role;

        // Redirect based on role
        if (userRole === 'admin') {
          router.replace('/dashboard/admin');
        } else {
          router.replace('/dashboard/user');
        }

      } catch (error) {
        console.error('Dashboard redirect error:', error);
        setError('Failed to load dashboard. Please try signing in again.');
        setTimeout(() => {
          router.push('/sign-in?redirect=/dashboard');
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRoleAndRedirect();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-gray-900 text-xl font-semibold font-sans mb-2">
            Dashboard Error
          </h2>
          <p className="text-gray-600 text-base font-normal font-sans mb-4">
            {error}
          </p>
          <button
            onClick={() => router.push('/sign-in')}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        </div>
        <h2 className="text-gray-900 text-xl font-semibold font-sans mb-2">
          Loading Dashboard
        </h2>
        <p className="text-gray-600 text-base font-normal font-sans">
          Redirecting you to the appropriate dashboard...
        </p>
      </div>
    </div>
  );
}