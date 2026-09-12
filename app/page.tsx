'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { CustodyCalendar } from '@/components/CustodyCalendar';
import { MessageForm } from '@/components/MessageForm';
import { SwapRequestsList } from '@/components/SwapRequestsList';
import { ExpenseTracker } from '@/components/ExpenseTracker';
import { ChildInfoBank } from '@/components/ChildInfoBank';
import { CourtReportExport } from '@/components/CourtReportExport';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [caseId, setCaseId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'calendar' | 'messages' | 'swaps' | 'expenses' | 'infobank'>('calendar');

  // Check if user is logged in on mount
  useEffect(() => {
    const checkUser = async () => {
      // Check for demo mode in localStorage
      const demoMode = localStorage.getItem('demo_mode') === 'true';
      if (demoMode) {
        const demoCaseId = localStorage.getItem('demo_case_id') || '00000000-0000-0000-0000-000000000099';
        setIsDemoMode(true);
        setIsLoggedIn(true);
        setCaseId(demoCaseId);
        return;
      }

      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };
    checkUser();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsLoggedIn(!!session);
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      alert('Check your email for confirmation link!');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    localStorage.removeItem('demo_mode');
    setIsDemoMode(false);
    if (!isDemoMode) {
      await supabase.auth.signOut();
    }
    setCaseId('');
    setIsLoggedIn(false);
  };

  const handleDemoMode = () => {
    // Use real demo user IDs from database
    const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'; // Mom
    const DEMO_CASE_ID = '00000000-0000-0000-0000-000000000099';

    localStorage.setItem('demo_mode', 'true');
    localStorage.setItem('demo_user_id', DEMO_USER_ID);
    localStorage.setItem('demo_case_id', DEMO_CASE_ID);
    setIsDemoMode(true);
    setIsLoggedIn(true);
    setCaseId(DEMO_CASE_ID);
    setEmail('');
    setPassword('');
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full space-y-6">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Συνεπιμέλεια
              </h1>
              <p className="text-gray-600 text-sm mt-2">
                Co-Parenting App - Ένας καλύτερος τρόπος επικοινωνίας
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition"
                >
                  {isLoading ? 'Loading...' : 'Sign Up'}
                </button>
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isLoading || !email || !password}
                  className="flex-1 px-4 py-2.5 border-2 border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 disabled:bg-gray-100 disabled:border-gray-400 disabled:text-gray-400 disabled:cursor-not-allowed transition"
                >
                  {isLoading ? 'Loading...' : 'Sign In'}
                </button>
              </div>
            </form>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                <strong>Error:</strong> {error}
              </div>
            )}

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <p className="text-xs text-gray-500 text-center">
                Use any email and password to get started
              </p>
              <button
                type="button"
                onClick={handleDemoMode}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 transition"
              >
                🚀 Δοκιμαστική Είσοδος (Demo Mode)
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Dashboard
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`shadow sticky top-0 z-40 border-b ${isDemoMode ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">Co-Parenting Dashboard</h1>
              {isDemoMode && (
                <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                  DEMO MODE
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {isDemoMode ? '🚀 Δοκιμαστική λειτουργία με mock δεδομένα' : 'Organize custody, communicate, and manage schedules'}
            </p>
          </div>
          <div className="flex gap-2">
            {caseId && <CourtReportExport caseId={caseId} />}
            <button
              onClick={handleSignOut}
              className={`px-4 py-2 font-medium rounded-lg transition ${
                isDemoMode
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Case Selection */}
        {!caseId ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Select a Case</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Enter your case ID (UUID) to access the custody calendar, messaging system, and swap requests
            </p>
            <div className="flex gap-2 max-w-md mx-auto pt-4">
              <input
                type="text"
                placeholder="Paste case UUID here..."
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  if (caseId.trim()) {
                    // Case ID set, UI will update
                  }
                }}
                disabled={!caseId.trim()}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                Load Case
              </button>
            </div>
            <p className="text-xs text-gray-500 pt-4">
              If you don't have a case ID, contact your case administrator
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Case Header */}
            <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Case Management</h2>
                <p className="text-sm text-gray-600 mt-1 font-mono">{caseId}</p>
              </div>
              <button
                onClick={() => setCaseId('')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Change Case
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow border-b border-gray-200">
              <div className="flex overflow-x-auto">
                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`flex-1 px-4 py-3 font-medium transition whitespace-nowrap ${
                    activeTab === 'calendar'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📅 Calendar
                </button>
                <button
                  onClick={() => setActiveTab('swaps')}
                  className={`flex-1 px-4 py-3 font-medium transition whitespace-nowrap ${
                    activeTab === 'swaps'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ↔️ Swaps
                </button>
                <button
                  onClick={() => setActiveTab('expenses')}
                  className={`flex-1 px-4 py-3 font-medium transition whitespace-nowrap ${
                    activeTab === 'expenses'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  💳 Expenses
                </button>
                <button
                  onClick={() => setActiveTab('infobank')}
                  className={`flex-1 px-4 py-3 font-medium transition whitespace-nowrap ${
                    activeTab === 'infobank'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  👤 InfoBank
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`flex-1 px-4 py-3 font-medium transition whitespace-nowrap ${
                    activeTab === 'messages'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  💬 Messages
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {activeTab === 'calendar' && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Custody Schedule</h3>
                    <CustodyCalendar caseId={caseId} />
                  </div>
                )}

                {activeTab === 'expenses' && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">💳 Κοινά Έξοδα Παιδιού</h3>
                    <ExpenseTracker caseId={caseId} />
                  </div>
                )}

                {activeTab === 'infobank' && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">👤 Ψηφιακός Φάκελος Παιδιού</h3>
                    <ChildInfoBank caseId={caseId} />
                  </div>
                )}

                {activeTab === 'messages' && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Send Message</h3>
                    <MessageForm caseId={caseId} />
                  </div>
                )}

                {activeTab === 'swaps' && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Create Swap Request</h3>
                    <div className="text-gray-600 text-sm mb-4">
                      Use the Custody Calendar tab to create swap requests by clicking the "Ανταλλαγή" button on any day.
                    </div>
                    <SwapRequestsList caseId={caseId} />
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Swap Requests */}
                {activeTab !== 'swaps' && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">↔️ Pending Swaps</h3>
                    <SwapRequestsList caseId={caseId} />
                  </div>
                )}

                {/* Calendar Preview */}
                {activeTab !== 'calendar' && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">📅 Calendar</h3>
                    <div className="text-gray-600 text-sm">
                      <p>Switch to the Calendar tab to view and manage your custody schedule.</p>
                    </div>
                  </div>
                )}

                {/* Quick Links */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow p-6 border border-blue-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">ℹ️ Quick Tips</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>✓ Click "Ανταλλαγή" to request a custody swap</li>
                    <li>✓ All messages are analyzed for tone</li>
                    <li>✓ Complete audit trail of all swaps</li>
                    <li>✓ Blue = Father, Purple = Mother</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 text-sm">
          <p>Co-Parenting App v1.0 • Your communications are secure and monitored</p>
        </div>
      </div>
    </main>
  );
}
