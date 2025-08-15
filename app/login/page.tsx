'use client';

import React, { useState } from 'react';
import { ArrowLeft, User, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { MockAuth } from '@/lib/auth';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    type: 'renter' as 'renter' | 'rentor'
  });
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (isLogin) {
        result = await MockAuth.login(formData.email, formData.password);
      } else {
        result = await MockAuth.signup(formData.email, formData.password, formData.name, formData.type);
      }

      if (result.success) {
        console.log('✅ Authentication successful:', result.user);
        router.push('/');
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoUser = () => {
    setFormData({
      email: 'john.doe@email.com',
      password: 'demo123',
      name: 'John Doe',
      type: 'rentor'
    });
  };

  const goBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card border-b border-border">
        <Button variant="ghost" size="sm" onClick={goBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">{isLogin ? 'Sign In' : 'Sign Up'}</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="text-center">
            <Image
              src="/parkada_logo.png"
              alt="Parkada"
              width={126}
              height={60}
              className="h-16 w-auto mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-muted-foreground">
              {isLogin ? 'Sign in to your account' : 'Join the Parkada community'}
            </p>
          </div>

          {/* Demo Banner */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Demo Mode</p>
                <p className="text-xs text-blue-600">Use demo credentials for testing</p>
              </div>
              <Button size="sm" variant="outline" onClick={fillDemoUser}>
                Use Demo
              </Button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2">Account Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange('type', 'renter')}
                    className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                      formData.type === 'renter'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    Renter
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('type', 'rentor')}
                    className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                      formData.type === 'rentor'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    Rentor
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          {/* Switch Mode */}
          <div className="text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ email: '', password: '', name: '', type: 'renter' });
              }}
              className="text-sm text-primary hover:underline"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'
              }
            </button>
          </div>

          {/* Demo Users Info */}
          {isLogin && (
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">Demo Users</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>john.doe@email.com</strong> - Rentor (Property Owner)
                </div>
                <div>
                  <strong>maria.santos@email.com</strong> - Rentor (Property Owner)
                </div>
                <div>
                  <strong>carlos.reyes@email.com</strong> - Both Renter & Rentor
                </div>
                <div>
                  <strong>ana.cruz@email.com</strong> - Renter
                </div>
                <p className="text-muted-foreground mt-2">Password: Any password works in demo mode</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}