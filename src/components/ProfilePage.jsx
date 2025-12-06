import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../services/authService';
import LoadingSkeleton from './LoadingSkeleton';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getProfile();
        setProfile(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-y-auto" style={{ height: '100vh', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-y-auto" style={{ height: '100vh', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Profile</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/chat')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'PREMIUM':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'USER':
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-y-auto" style={{ height: '100vh', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/chat')}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back to Chat</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Profile Settings</h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-12">
        <div className="bg-white rounded-2xl shadow-xl">
          {/* Profile Header Section - Rectangular */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 sm:px-8 py-8 sm:py-12 rounded-t-2xl">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg flex-shrink-0">
                {getInitials(profile?.name)}
              </div>
              
              {/* User Info */}
              <div className="flex-1 text-center sm:text-left min-w-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 break-words">
                  {profile?.name || 'User'}
                </h2>
                <p className="text-purple-100 text-sm sm:text-base mb-3 break-words">
                  {profile?.email || 'No email'}
                </p>
                {profile?.role && (
                  <span className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border ${getRoleBadgeColor(profile.role)}`}>
                    {profile.role}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details Section */}
          <div className="p-6 sm:p-8">
            <div className="space-y-6">
              {/* Personal Information */}
              <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal Information
                </h3>
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                      <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800">
                        {profile?.name || 'Not provided'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                      <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800">
                        {profile?.email || 'Not provided'}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Account Information */}
              {/* <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Account Information
                </h3>
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">User ID</label>
                      <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-mono text-sm break-all">
                        {profile?.id || 'Not available'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Tenant ID</label>
                      <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800 font-mono text-sm break-all">
                        {profile?.tenantId || 'Not available'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Account Role</label>
                      <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(profile?.role)}`}>
                          {profile?.role || 'USER'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section> */}

              {/* Actions */}
              {/* <section>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={() => navigate('/chat')}
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Back to Chat
                  </button>
                </div>
              </section> */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

