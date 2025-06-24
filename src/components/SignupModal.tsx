import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SignupModal({ onSignupSuccess }: { onSignupSuccess: (user: any, username: string) => void }) {
  const [tab, setTab] = useState<'signup' | 'login'>('signup');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }
    // Direct login after signup
    const { error: loginError, data: loginData } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (loginError) {
      toast.error(loginError.message);
      return;
    }
    toast.success('Signup & login successful!');
    onSignupSuccess(loginData.user, username);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Login successful!');
    onSignupSuccess(data.user, data.user.user_metadata?.username || data.user.email);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl p-0 w-full max-w-md animate-fade-in">
        {/* Tabs */}
        <div className="flex">
          <button
            className={`flex-1 py-4 text-lg font-bold rounded-t-xl transition-colors ${tab === 'signup' ? 'bg-gradient-to-r from-primary-400 via-primary-500 to-primary-700 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setTab('signup')}
            type="button"
          >
            Sign Up
          </button>
          <button
            className={`flex-1 py-4 text-lg font-bold rounded-t-xl transition-colors ${tab === 'login' ? 'bg-gradient-to-r from-primary-400 via-primary-500 to-primary-700 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setTab('login')}
            type="button"
          >
            Login
          </button>
        </div>
        <div className="p-8 space-y-5">
          <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-700 bg-clip-text text-transparent">
            {tab === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-center text-base text-gray-600 mb-4">
            {tab === 'signup' ? 'Sign up and start earning instantly on WatchPesa!' : 'Login to your account to continue earning.'}
          </p>
          <form onSubmit={tab === 'signup' ? handleSignup : handleLogin} className="space-y-4">
            {tab === 'signup' && (
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            )}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary-400 via-primary-500 to-primary-700 text-white font-semibold hover:opacity-90 transition text-lg"
              disabled={loading}
            >
              {loading ? (tab === 'signup' ? 'Signing up...' : 'Logging in...') : (tab === 'signup' ? 'Sign Up' : 'Login')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
