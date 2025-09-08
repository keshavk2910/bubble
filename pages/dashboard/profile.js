import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { X, Bell, MoreHorizontal } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import AvatarUpload from '../../components/AvatarUpload';

export default function DashboardProfile() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    displayName: '',
    realName: '',
    phone: '',
    email: '',
    address: '',
    avatarUrl: null
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load current user data on page load
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const session = localStorage.getItem('supabase_session');
        if (!session) {
          router.push('/sign-in?redirect=/dashboard/profile');
          return;
        }

        const sessionData = JSON.parse(session);
        const token = sessionData.access_token;

        const response = await fetch('/api/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setFormData({
            displayName: userData.profile.display_name || '',
            realName: userData.profile.full_name || '',
            phone: userData.profile.phone || '',
            email: userData.profile.email || '',
            address: userData.profile.address || '',
            avatarUrl: userData.profile.avatar_url || null
          });
        } else {
          router.push('/sign-in?redirect=/dashboard/profile');
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        router.push('/sign-in?redirect=/dashboard/profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const session = localStorage.getItem('supabase_session');
      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Profile updated successfully!');
        // Reload user data to get fresh info
        window.location.reload();
      } else {
        alert(data.details || 'Failed to update profile.');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClearAll = () => {
    setFormData({
      displayName: '',
      realName: '',
      phone: '',
      email: '',
      address: '',
    });
  };

  // Mock user for custom header
  const user = {
    name: 'John Smith',
    avatar: formData.avatarUrl || '/api/placeholder/40/40',
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Profile" subtitle="Loading...">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Profile Settings - Bin Cleaning Classifieds</title>
        <meta name="description" content="Update your personal information and profile settings." />
      </Head>
      <div className='min-h-screen bg-gray-50'>
      {/* Custom Header for Profile Page */}
      {/* <header className="fixed top-0 left-60 right-0 bg-white border-b border-gray-200 px-6 py-4 z-30">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-4">
            
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden">
                <img src={user.avatar} alt="User avatar" className="w-full h-full object-cover" />
              </div>
              <button className="text-gray-700 hover:text-gray-900 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header> */}

      <DashboardLayout
        showHeader={true}
        title='Personal info'
        subtitle='Update your personal information'
      >
        {/* Profile Content with top margin for fixed header */}
        <div className='pt-20'>
          {/* Profile Card */}
          <div className='bg-white rounded-lg border border-gray-200 p-12 max-w-6xl mx-auto'>
            <div className='mx-auto'>
              {/* Page Title */}
              <div className=' mb-16'>
                <h1 className='text-zinc-800 text-5xl font-bold font-sans leading-[56px]'>
                  Personal info
                </h1>
              </div>

              {/* Avatar Upload Section */}
              <div className='mb-16'>
                <h2 className='text-zinc-800 text-base font-medium font-sans leading-normal mb-8 text-center'>
                  Profile Picture
                </h2>
                <div className='flex justify-center'>
                  <AvatarUpload
                    currentAvatar={formData.avatarUrl}
                    onAvatarChange={(url) => handleInputChange('avatarUrl', url)}
                    size="large"
                  />
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className='space-y-16'>
                {/* Account Info Section */}
                <div className='space-y-8'>
                  <h2 className='text-zinc-800 text-base font-medium font-sans leading-normal'>
                    Account info
                  </h2>

                  {/* Display Name & Real Name Row */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                    <div className='space-y-3'>
                      <label
                        htmlFor='displayName'
                        className='block text-black text-xs font-normal font-sans capitalize leading-3'
                      >
                        Display Name
                      </label>
                      <input
                        type='text'
                        id='displayName'
                        value={formData.displayName}
                        onChange={(e) =>
                          handleInputChange('displayName', e.target.value)
                        }
                        placeholder='Enter your display name'
                        className='w-full px-4 py-3 rounded-lg border border-gray-200 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 placeholder:text-slate-500'
                      />
                    </div>

                    <div className='space-y-3'>
                      <label
                        htmlFor='realName'
                        className='block text-black text-xs font-normal font-sans capitalize leading-3'
                      >
                        Real Name
                      </label>
                      <input
                        type='text'
                        id='realName'
                        value={formData.realName}
                        onChange={(e) =>
                          handleInputChange('realName', e.target.value)
                        }
                        className='w-full px-4 py-3 rounded-lg border border-gray-200 text-slate-500 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600'
                      />
                    </div>
                  </div>

                  {/* Phone & Email Row */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                    <div className='space-y-3'>
                      <label
                        htmlFor='phone'
                        className='block text-black text-xs font-normal font-sans capitalize leading-3'
                      >
                        Phone
                      </label>
                      <input
                        type='tel'
                        id='phone'
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange('phone', e.target.value)
                        }
                        placeholder='Phone number'
                        className='w-full px-4 py-3 rounded-lg border border-gray-200 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 placeholder:text-slate-500'
                      />
                    </div>

                    <div className='space-y-3'>
                      <label
                        htmlFor='email'
                        className='block text-black text-xs font-normal font-sans capitalize leading-3'
                      >
                        Email
                      </label>
                      <input
                        type='email'
                        id='email'
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange('email', e.target.value)
                        }
                        className='w-full px-4 py-3 rounded-lg border border-gray-200 text-neutral-900 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600'
                      />
                    </div>
                  </div>

                  {/* Address Field */}
                  <div className='space-y-3'>
                    <label
                      htmlFor='address'
                      className='block text-black text-xs font-normal font-sans capitalize leading-3'
                    >
                      Your Address
                    </label>
                    <input
                      type='text'
                      id='address'
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange('address', e.target.value)
                      }
                      className='w-full px-4 py-3 rounded-lg border border-gray-200 text-slate-500 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600'
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className='h-px bg-gray-200'></div>

                {/* Action Buttons */}
                <div className='flex items-center gap-4'>
                  <button
                    type='submit'
                    disabled={isUpdating}
                    className='bg-green-600 text-white text-base font-normal font-sans leading-normal px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center min-w-[176px]'
                  >
                    {isUpdating ? (
                      <>
                        <div className='w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2'></div>
                        Updating...
                      </>
                    ) : (
                      'Update profile'
                    )}
                  </button>

                  <button
                    type='button'
                    onClick={handleClearAll}
                    className='flex items-center gap-3 px-6 py-4 rounded-full text-slate-500 hover:text-slate-700 transition-colors'
                  >
                    <div className='w-4 h-4 relative'>
                      <X className='w-full h-full text-slate-500' />
                    </div>
                    <span className='text-slate-500 text-base font-bold font-sans leading-none'>
                      Clear all
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </div>
    </>
  );
}
