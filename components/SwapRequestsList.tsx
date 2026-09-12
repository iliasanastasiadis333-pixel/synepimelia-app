'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface SwapRequest {
  id: string;
  case_id: string;
  requester_id: string;
  requested_date: string;
  offered_swap_date: string;
  reason: string | null;
  status: 'pending' | 'approved' | 'declined' | 'withdrawn' | 'cancelled';
  response_notes: string | null;
  responded_at: string | null;
  created_at: string;
  requester?: { full_name: string; email: string };
}

interface RespondModalState {
  isOpen: boolean;
  swapRequestId: string | null;
  status: 'approved' | 'declined';
  notes: string;
}

export function SwapRequestsList({ caseId }: { caseId: string }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isDemoMode] = useState(() =>
    typeof window !== 'undefined' && localStorage.getItem('demo_mode') === 'true'
  );
  const [requests, setRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondModal, setRespondModal] = useState<RespondModalState>({
    isOpen: false,
    swapRequestId: null,
    status: 'approved',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get auth session token
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) {
        setAccessToken(data.session.access_token);
      }
    };
    getSession();
  }, []);

  // Load swap requests
  useEffect(() => {
    const loadRequests = async () => {
      try {
        if (isDemoMode) {
          // Demo mode: use mock data
          const mockRequests: SwapRequest[] = [
            {
              id: 'swap-1-demo',
              case_id: caseId,
              requester_id: 'parent-1-demo',
              requested_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
              offered_swap_date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
              reason: 'Έχω σημαντικό γεγονός αυτή την ημέρα',
              status: 'pending',
              response_notes: null,
              responded_at: null,
              created_at: new Date(Date.now() - 86400000).toISOString(),
              requester: { full_name: 'Γιάννης (Πατέρας)', email: 'father@demo.com' },
            },
            {
              id: 'swap-2-demo',
              case_id: caseId,
              requester_id: 'parent-2-demo',
              requested_date: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
              offered_swap_date: new Date(Date.now() + 86400000 * 12).toISOString().split('T')[0],
              reason: null,
              status: 'approved',
              response_notes: 'Συμφωνώ!',
              responded_at: new Date(Date.now() - 43200000).toISOString(),
              created_at: new Date(Date.now() - 172800000).toISOString(),
              requester: { full_name: 'Μαρία (Μητέρα)', email: 'mother@demo.com' },
            },
          ];
          setRequests(mockRequests);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('swap_requests')
          .select('*, requester:requester_id(full_name, email)')
          .eq('case_id', caseId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRequests(data || []);
      } catch (err) {
        console.error('Failed to load swap requests:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isDemoMode || accessToken) {
      loadRequests();
    }
  }, [caseId, accessToken]);

  // Handle respond to swap request
  const handleRespond = async () => {
    if (!respondModal.swapRequestId) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/calendar/swap-request/${respondModal.swapRequestId}/respond`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: respondModal.status,
            response_notes: respondModal.notes.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to respond to swap request');
      }

      // Update local state
      setRequests(
        requests.map((r) =>
          r.id === respondModal.swapRequestId
            ? { ...r, status: respondModal.status, response_notes: respondModal.notes }
            : r
        )
      );

      setRespondModal({ isOpen: false, swapRequestId: null, status: 'approved', notes: '' });
      alert('Απάντηση αποστάλθηκε!');
    } catch (err) {
      alert(`Σφάλμα: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeColor = (status: SwapRequest['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      withdrawn: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status];
  };

  const getStatusLabel = (status: SwapRequest['status']) => {
    const labels = {
      pending: 'Εκκρεμής',
      approved: 'Εγκρίθηκε',
      declined: 'Απορρίφθηκε',
      withdrawn: 'Ανακλήθηκε',
      cancelled: 'Ακυρώθηκε',
    };
    return labels[status];
  };

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Φόρτωση αιτημάτων...</div>;
  }

  if (requests.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Δεν υπάρχουν αιτήματα ανταλλαγής
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-800">Αιτήματα Ανταλλαγής</h3>

      {/* Requests List */}
      <div className="space-y-3">
        {requests.map((request) => (
          <div
            key={request.id}
            className="border rounded-lg p-4 space-y-3 hover:shadow-md transition"
          >
            {/* Header with status */}
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-800">
                  {request.requester?.full_name || 'Ζήτησε'} - Ανταλλαγή ημέρας
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(request.created_at).toLocaleDateString('el-GR')}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(request.status)}`}>
                {getStatusLabel(request.status)}
              </span>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Ημέρα που ζητά:</span>
                <p className="text-gray-900">
                  {new Date(request.requested_date).toLocaleDateString('el-GR')}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Προσφέρει ανταλλαγή:</span>
                <p className="text-gray-900">
                  {new Date(request.offered_swap_date).toLocaleDateString('el-GR')}
                </p>
              </div>
            </div>

            {/* Reason */}
            {request.reason && (
              <div>
                <span className="font-medium text-gray-700 text-sm">Λόγος:</span>
                <p className="text-gray-700 text-sm">{request.reason}</p>
              </div>
            )}

            {/* Response info */}
            {request.responded_at && (
              <div className="border-t pt-2">
                <p className="text-sm text-gray-600">
                  {request.response_notes && (
                    <span>
                      <strong>Σχόλια:</strong> {request.response_notes}
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Action buttons - only for pending requests */}
            {request.status === 'pending' && (
              <div className="flex gap-2 pt-2 border-t">
                <button
                  onClick={() =>
                    setRespondModal({
                      isOpen: true,
                      swapRequestId: request.id,
                      status: 'approved',
                      notes: '',
                    })
                  }
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
                >
                  ✓ Αποδοχή
                </button>
                <button
                  onClick={() =>
                    setRespondModal({
                      isOpen: true,
                      swapRequestId: request.id,
                      status: 'declined',
                      notes: '',
                    })
                  }
                  className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
                >
                  ✗ Απόρριψη
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Response Modal */}
      {respondModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full space-y-4 p-6">
            <h3 className="text-lg font-bold">
              {respondModal.status === 'approved' ? 'Αποδοχή Αιτήματος' : 'Απόρριψη Αιτήματος'}
            </h3>

            <div>
              <label className="text-sm font-medium text-gray-700">Σχόλια (προαιρετικό):</label>
              <textarea
                value={respondModal.notes}
                onChange={(e) =>
                  setRespondModal({ ...respondModal, notes: e.target.value })
                }
                placeholder="Π.χ., Συμφωνώ με τη δική σας πρόταση..."
                maxLength={500}
                rows={4}
                className="mt-1 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() =>
                  setRespondModal({ isOpen: false, swapRequestId: null, status: 'approved', notes: '' })
                }
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Ακύρωση
              </button>
              <button
                onClick={handleRespond}
                disabled={isSubmitting}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition ${
                  respondModal.status === 'approved'
                    ? 'bg-green-600 hover:bg-green-700 disabled:bg-gray-400'
                    : 'bg-red-600 hover:bg-red-700 disabled:bg-gray-400'
                }`}
              >
                {isSubmitting ? 'Αποστολή...' : 'Απάντηση'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
