'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isOAuthLoading, setIsOAuthLoading] = useState<'google' | 'apple' | null>(null);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Οι κωδικοί δεν ταιριάζουν');
      return;
    }

    if (password.length < 6) {
      setError('Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setSuccess('Ελέγξτε το email σας για επιβεβαίωση!');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setIsOAuthLoading(provider);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : `${provider} signup failed`);
      setIsOAuthLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
            Συνεπιμέλεια
          </h1>
          <p className="text-gray-600 text-sm">
            Δημιουργία νέου λογαριασμού
          </p>
        </div>

        {/* Email Signup Form */}
        <form onSubmit={handleEmailSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              disabled={isLoading || isOAuthLoading !== null}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Κωδικός Πρόσβασης
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Τουλάχιστον 6 χαρακτήρες"
              disabled={isLoading || isOAuthLoading !== null}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Επιβεβαίωση Κωδικού
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Επαναλάβετε τον κωδικό"
              disabled={isLoading || isOAuthLoading !== null}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isOAuthLoading !== null || !email || !password || !confirmPassword}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition"
          >
            {isLoading ? 'Δημιουργία...' : 'Εγγραφή'}
          </button>
        </form>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
            {success}
          </div>
        )}

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">ή</span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => handleOAuth('google')}
            disabled={isLoading || isOAuthLoading !== null}
            className="w-full px-4 py-2.5 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {isOAuthLoading === 'google' ? 'Εγγραφή...' : 'Google'}
          </button>

          <button
            onClick={() => handleOAuth('apple')}
            disabled={isLoading || isOAuthLoading !== null}
            className="w-full px-4 py-2.5 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.05 13.5c-.91 0-1.82.55-2.27 1.45 1.27.55 2.73 1.82 2.73 3.64 0 2.73-2.27 4.05-4.77 4.05-3.18 0-5.23-2.09-5.23-4.95 0-2.36 1.27-4.05 3.64-4.05 1.09 0 2.09.27 2.91.82 1.09-.82 2.36-1.96 2.36-3.64 0-1.45-.82-2.64-2.27-2.64-.64 0-1.27.27-1.82.91-.82-1.45-2.36-2.45-4.14-2.45-2.55 0-4.77 2.27-4.77 5 0 1.27.36 2.45.91 3.45.27.45.55.91.91 1.27-.27 0-.55-.09-.82-.09-2.73 0-4.77 2.27-4.77 5.05 0 2.91 2.27 5 5.23 5 3.45 0 5.59-2.27 5.59-4.95 0-2.09-1.27-3.82-3.09-4.55.82-.27 1.64-.45 2.55-.45 1.45 0 2.64.64 3.27 1.55.64.91.91 2.09.91 3.18 0 3.64-3.18 5.32-6.82 5.32-2.45 0-4.59-.91-5.77-2.27" />
            </svg>
            {isOAuthLoading === 'apple' ? 'Εγγραφή...' : 'Apple'}
          </button>
        </div>

        {/* Links */}
        <div className="space-y-2 text-center text-sm">
          <p className="text-gray-600">
            Έχετε ήδη λογαριασμό;{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Σύνδεση
            </Link>
          </p>
          <p>
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              ← Επιστροφή στην Αρχική
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
