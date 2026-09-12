'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  paid_by_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_by_id?: string;
  notes?: string;
}

const CATEGORIES = {
  Education: { label: 'Εκπαίδευση', icon: '📚' },
  Healthcare: { label: 'Υγεία', icon: '🏥' },
  Activities: { label: 'Δραστηριότητες', icon: '⚽' },
  Clothing: { label: 'Ένδυση', icon: '👕' },
  Food: { label: 'Τροφή', icon: '🍎' },
  Other: { label: 'Άλλα', icon: '💰' },
};

export function ExpenseTracker({ caseId }: { caseId: string }) {
  const [isDemoMode] = useState(() =>
    typeof window !== 'undefined' && localStorage.getItem('demo_mode') === 'true'
  );

  const [currentUserId] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('demo_user_id') || '' : ''
  );

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'Other',
  });

  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Φόρτωση εξόδων από τη βάση
  useEffect(() => {
    loadExpenses();
  }, [caseId]);

  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      const { data, error: err } = await supabase
        .from('expenses')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });

      if (err) throw err;
      setExpenses(data || []);
    } catch (err) {
      console.error('Σφάλμα φόρτωσης εξόδων:', err);
      setError('Αποτυχία φόρτωσης εξόδων');
    } finally {
      setIsLoading(false);
    }
  };

  // Υπολογισμός υπολοίπου
  const calculateBalance = () => {
    let totalPaidByMom = 0;
    let totalPaidByDad = 0;

    expenses.forEach((exp) => {
      if (exp.status === 'approved') {
        if (exp.paid_by_id === '00000000-0000-0000-0000-000000000001') {
          totalPaidByMom += exp.amount;
        } else {
          totalPaidByDad += exp.amount;
        }
      }
    });

    const balance = totalPaidByMom - totalPaidByDad;
    return {
      totalPaidByMom,
      totalPaidByDad,
      balance: Math.abs(balance),
      whoOwes: balance > 0 ? 'Μπαμπάς' : 'Μαμά',
    };
  };

  const balance = calculateBalance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount) {
      setError('Συμπληρώστε όλα τα πεδία');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: err } = await supabase
        .from('expenses')
        .insert({
          case_id: caseId,
          description: newExpense.description,
          amount: parseFloat(newExpense.amount),
          category: newExpense.category,
          paid_by_id: currentUserId,
          status: 'pending',
        });

      if (err) throw err;

      // Ανανέωση λίστας
      await loadExpenses();
      setNewExpense({ description: '', amount: '', category: 'Other' });
      setShowForm(false);
      setError(null);
    } catch (err) {
      console.error('Σφάλμα προσθήκης εξόδου:', err);
      setError('Αποτυχία προσθήκης εξόδου');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (expenseId: string) => {
    try {
      const { error: err } = await supabase
        .from('expenses')
        .update({ status: 'approved', approved_by_id: currentUserId })
        .eq('id', expenseId);

      if (err) throw err;
      await loadExpenses();
    } catch (err) {
      console.error('Σφάλμα έγκρισης:', err);
      setError('Αποτυχία έγκρισης');
    }
  };

  const handleReject = async (expenseId: string) => {
    try {
      const { error: err } = await supabase
        .from('expenses')
        .update({ status: 'rejected' })
        .eq('id', expenseId);

      if (err) throw err;
      await loadExpenses();
    } catch (err) {
      console.error('Σφάλμα απόρριψης:', err);
      setError('Αποτυχία απόρριψης');
    }
  };

  return (
    <div className="space-y-6">
      {/* Balance Widget */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm opacity-90 mb-1">💰 Υπόλοιπο</p>
            <p className="text-3xl font-bold">€{balance.balance.toFixed(2)}</p>
            <p className="text-sm opacity-75 mt-2">{balance.whoOwes} οφείλει</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-75">Έξοδα Μαμάς: €{balance.totalPaidByMom.toFixed(2)}</p>
            <p className="text-xs opacity-75">Έξοδα Μπαμπά: €{balance.totalPaidByDad.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Add Expense Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          + Προσθήκη Εξόδου
        </button>
      )}

      {/* Add Expense Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Περιγραφή</label>
            <input
              type="text"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              placeholder="π.χ. Σχολικά είδη"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ποσό (€)</label>
            <input
              type="number"
              step="0.01"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Κατηγορία</label>
            <select
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(CATEGORIES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.icon} {value.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
            >
              {isSubmitting ? 'Αποθήκευση...' : 'Αποθήκευση'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setNewExpense({ description: '', amount: '', category: 'Other' });
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Ακύρωση
            </button>
          </div>
        </form>
      )}

      {/* Expenses List */}
      <div className="space-y-3">
        <h3 className="font-bold text-gray-900">📋 Ιστορικό Εξόδων</h3>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Φόρτωση...</div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Δεν υπάρχουν έξοδα ακόμα</div>
        ) : (
          expenses.map((expense) => (
            <div key={expense.id} className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{expense.description}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(expense.created_at).toLocaleDateString('el-GR')}
                  </p>
                </div>
                <p className="text-lg font-bold text-gray-900">€{expense.amount.toFixed(2)}</p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  expense.status === 'approved' ? 'bg-green-100 text-green-800' :
                  expense.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {expense.status === 'approved' ? '✅ Εγκρίθη' :
                   expense.status === 'rejected' ? '❌ Απορρίφθη' :
                   '⏳ Εκκρεμεί'}
                </span>

                {expense.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(expense.id)}
                      className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200 transition"
                    >
                      ✅ Έγκριση
                    </button>
                    <button
                      onClick={() => handleReject(expense.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 transition"
                    >
                      ❌ Απόρριψη
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
