'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface ScheduleEntry {
  day_of_week: number;
  parent_id: string;
}

interface SwapModalState {
  isOpen: boolean;
  selectedDate: string | null;
  offeredSwapDate: string | null;
  reason: string;
}

export function CustodyCalendar({ caseId }: { caseId: string }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [schedule, setSchedule] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode] = useState(() =>
    typeof window !== 'undefined' && localStorage.getItem('demo_mode') === 'true'
  );

  const [modal, setModal] = useState<SwapModalState>({
    isOpen: false,
    selectedDate: null,
    offeredSwapDate: null,
    reason: '',
  });

  const [isSubmittingSwap, setIsSubmittingSwap] = useState(false);

  // Φόρτωση προγράμματος φύλαξης από τη βάση
  useEffect(() => {
    loadSchedule();
  }, [caseId]);

  const loadSchedule = async () => {
    try {
      setLoading(true);

      // Demo Mode: Use hard-coded schedule
      if (isDemoMode) {
        const demoSchedule: Record<number, string> = {
          0: '00000000-0000-0000-0000-000000000002', // Monday: Dad
          1: '00000000-0000-0000-0000-000000000002', // Tuesday: Dad
          2: '00000000-0000-0000-0000-000000000001', // Wednesday: Mom
          3: '00000000-0000-0000-0000-000000000001', // Thursday: Mom
          4: '00000000-0000-0000-0000-000000000001', // Friday: Mom
          5: '00000000-0000-0000-0000-000000000002', // Saturday: Dad
          6: '00000000-0000-0000-0000-000000000002', // Sunday: Dad
        };
        setSchedule(demoSchedule);
        setError(null);
        setLoading(false);
        return;
      }

      const { data, error: err } = await supabase
        .from('custody_schedule')
        .select('day_of_week, parent_id')
        .eq('case_id', caseId);

      if (err) throw err;

      // Δημιουργία χάρτη ημερών
      const scheduleMap: Record<number, string> = {};
      (data || []).forEach((entry: ScheduleEntry) => {
        scheduleMap[entry.day_of_week] = entry.parent_id;
      });

      setSchedule(scheduleMap);
    } catch (err) {
      console.error('Σφάλμα φόρτωσης προγράμματος:', err);
      setError('Αποτυχία φόρτωσης προγράμματος');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    // Μετατροπή: JS getDay() (0=Sunday) σε schema format (0=Monday)
    const jsDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return (jsDay + 6) % 7;
  };

  const getCustodyParent = (date: Date) => {
    const jsDay = date.getDay();
    const dayIndex = (jsDay + 6) % 7; // Μετατροπή σε schema format
    return schedule[dayIndex];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleSwapClick = (date: Date) => {
    setModal({
      isOpen: true,
      selectedDate: date.toISOString().split('T')[0],
      offeredSwapDate: null,
      reason: '',
    });
  };

  const handleSubmitSwap = async () => {
    if (!modal.selectedDate || !modal.offeredSwapDate) {
      setError('Επιλέξτε και τις δύο ημερομηνίες');
      return;
    }

    setIsSubmittingSwap(true);

    // Demo Mode: Just simulate success
    if (isDemoMode) {
      await new Promise(r => setTimeout(r, 600));
      setModal({ isOpen: false, selectedDate: null, offeredSwapDate: null, reason: '' });
      setError(null);
      alert('✅ Αίτημα ανταλλαγής στάλθηκε!');
      setIsSubmittingSwap(false);
      return;
    }

    try {
      const { error: err } = await supabase
        .from('swap_requests')
        .insert({
          case_id: caseId,
          requested_by_id: localStorage.getItem('demo_user_id'),
          original_date: modal.selectedDate,
          requested_date: modal.offeredSwapDate,
          status: 'pending',
        });

      if (err) throw err;

      setModal({ isOpen: false, selectedDate: null, offeredSwapDate: null, reason: '' });
      setError(null);
      alert('✅ Αίτημα ανταλλαγής στάλθηκε!');
    } catch (err) {
      console.error('Σφάλμα αιτήματος:', err);
      setError('Αποτυχία αποστολής αιτήματος');
    } finally {
      setIsSubmittingSwap(false);
    }
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];

  // Γεμίσματα για ημέρες του προηγούμενου μήνα
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Ημέρες του τρέχοντος μήνα
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
  }

  const monthName = currentMonth.toLocaleDateString('el-GR', { month: 'long', year: 'numeric' });
  const momId = '00000000-0000-0000-0000-000000000001';
  const dadId = '00000000-0000-0000-0000-000000000002';

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          ← Προηγούμενος
        </button>
        <h2 className="text-xl font-bold text-gray-900 capitalize">{monthName}</h2>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Επόμενος →
        </button>
      </div>

      {/* Legend */}
      <div className="flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-100 border-2 border-blue-300 rounded"></div>
          <span>👨 Μπαμπάς</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-purple-100 border-2 border-purple-300 rounded"></div>
          <span>👩 Μαμά</span>
        </div>
      </div>

      {/* Calendar */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Φόρτωση ημερολογίου...</div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {/* Days of week headers */}
          {['Δευ', 'Τρί', 'Τετ', 'Πέ', 'Παρ', 'Σάβ', 'Κυρ'].map(day => (
            <div key={day} className="text-center font-bold text-gray-700 py-2 text-sm">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map((date, idx) => {
            if (!date) {
              return <div key={`empty-${idx}`} className="aspect-square"></div>;
            }

            const parentId = getCustodyParent(date);
            const isParent1 = parentId === dadId;
            const isToday_ = isToday(date);
            const isPast_ = isPast(date);

            const bgClass = isParent1 ? 'bg-blue-50 border-blue-300' : 'bg-purple-50 border-purple-300';
            const textClass = isParent1 ? 'text-blue-900' : 'text-purple-900';

            return (
              <div
                key={date.toISOString()}
                className={`aspect-square p-2 border-2 rounded-lg cursor-pointer transition hover:shadow-md ${bgClass} ${
                  isToday_ ? 'ring-4 ring-yellow-400' : ''
                } ${isPast_ ? 'opacity-60' : ''}`}
                onClick={() => !isPast_ && handleSwapClick(date)}
              >
                <div className={`text-xs font-bold ${textClass} mb-1`}>
                  {date.getDate()}
                </div>
                <div className={`text-xs font-semibold ${textClass}`}>
                  {isParent1 ? '👨' : '👩'}
                </div>
                {!isPast_ && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSwapClick(date);
                    }}
                    className="text-xs mt-1 px-1 py-0.5 bg-white bg-opacity-70 rounded text-blue-600 hover:bg-opacity-100 transition whitespace-nowrap"
                  >
                    ↔️ Ανταλλ.
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Swap Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">↔️ Αίτημα Ανταλλαγής</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ημερομηνία που έχω φύλαξη</label>
              <input
                type="date"
                value={modal.selectedDate || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ημερομηνία που θέλω να ανταλλάξω</label>
              <input
                type="date"
                value={modal.offeredSwapDate || ''}
                onChange={(e) => setModal({ ...modal, offeredSwapDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Λόγος (προαιρετικό)</label>
              <textarea
                value={modal.reason}
                onChange={(e) => setModal({ ...modal, reason: e.target.value })}
                placeholder="π.χ. Έχω ένα σημαντικό γεγονός"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={handleSubmitSwap}
                disabled={isSubmittingSwap}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {isSubmittingSwap ? 'Αποστολή...' : 'Αποστολή Αιτήματος'}
              </button>
              <button
                onClick={() => setModal({ isOpen: false, selectedDate: null, offeredSwapDate: null, reason: '' })}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Ακύρωση
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
