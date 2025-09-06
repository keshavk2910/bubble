import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSigningIn(true);
    
    // Simulate sign-in process
    setTimeout(() => {
      console.log('Sign-in form submitted:', formData);
      setIsSigningIn(false);
      
      // Simulate successful login
      alert('Welcome back! Redirecting to your dashboard...');
      // In real app, redirect to dashboard
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-md">
        {/* Sign In Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-9 h-8 bg-gradient-to-br from-green-600 to-green-600 rounded-full relative">
                <div className="absolute top-1 left-1 w-5 h-0.5 bg-white"></div>
              </div>
              <h1 className="text-gray-900 text-2xl font-bold font-sans leading-snug">
                Bubblebinz
              </h1>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-gray-700 text-3xl font-normal font-sans leading-9 mb-4">
              Welcome Back
            </h2>
            <p className="text-gray-500 text-base font-normal font-sans leading-normal">
              Sign in to access your account.
            </p>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-gray-700 text-sm font-normal font-sans leading-tight mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-white rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-gray-700 text-sm font-normal font-sans leading-tight focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-gray-700 text-sm font-normal font-sans leading-tight mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-white rounded-xl border border-gray-200 pl-10 pr-12 py-3 text-gray-700 text-sm font-normal font-sans leading-tight focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 placeholder:text-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-green-600 hover:text-green-700" />
                  ) : (
                    <Eye className="w-5 h-5 text-green-600 hover:text-green-700" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link 
                href="/forgot-password" 
                className="text-green-600 text-sm font-normal font-sans leading-tight hover:text-green-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSigningIn}
              className="w-full bg-green-600 text-white text-base font-normal font-sans leading-normal py-3 rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSigningIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <span className="text-gray-700 text-sm font-normal font-sans leading-tight">
                Don't have an account?{' '}
              </span>
              <Link href="/register" className="text-green-600 text-sm font-normal font-sans leading-tight hover:text-green-700 transition-colors">
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}