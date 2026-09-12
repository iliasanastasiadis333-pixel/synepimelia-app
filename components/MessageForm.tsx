'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface ToneRejection {
  tone: 'negative' | 'concerning';
  score: number;
  flags: string[];
  suggested_alternative: string;
  can_force_send: boolean;
}

interface ModalState {
  isOpen: boolean;
  toneRejection: ToneRejection | null;
  originalContent: string;
}

export function MessageForm({ caseId }: { caseId: string }) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successWarning, setSuccessWarning] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isDemoMode] = useState(() =>
    typeof window !== 'undefined' && localStorage.getItem('demo_mode') === 'true'
  );
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    toneRejection: null,
    originalContent: '',
  });

  // Get auth session token
  useEffect(() => {
    if (isDemoMode) {
      // In demo mode, use a dummy token
      setAccessToken('demo-token-12345');
      return;
    }

    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) {
        setAccessToken(data.session.access_token);
      }
    };
    getSession();
  }, [isDemoMode]);

  const handleSendMessage = async (
    messageContent: string,
    forceSend: boolean = false
  ) => {
    setError(null);
    setSuccess(false);
    setSuccessWarning(null);
    setIsLoading(true);

    try {
      if (isDemoMode) {
        // Demo mode: simulate tone analysis
        const mockToneAnalysis: {
          tone: 'neutral' | 'negative' | 'concerning';
          score: number;
          flags: string[];
          suggested_alternative: string;
        } = {
          tone: 'neutral',
          score: 0.3,
          flags: [] as string[],
          suggested_alternative: messageContent,
        };

        // Simulate harsh message detection
        if (messageContent.toLowerCase().includes('ξέρω')) {
          mockToneAnalysis.tone = 'negative';
          mockToneAnalysis.score = 0.8;
          mockToneAnalysis.flags = ['Επιθετικό ύφος', 'Αρνητικές λέξεις'];
          mockToneAnalysis.suggested_alternative = 'Θα ήθελα να συζητήσουμε...';

          if (!forceSend) {
            setModal({
              isOpen: true,
              toneRejection: {
                tone: mockToneAnalysis.tone as 'negative' | 'concerning',
                score: mockToneAnalysis.score,
                flags: mockToneAnalysis.flags,
                suggested_alternative: mockToneAnalysis.suggested_alternative,
                can_force_send: true,
              },
              originalContent: messageContent,
            });
            setIsLoading(false);
            return;
          }
        }

        // Success - simulate delayed response
        await new Promise(r => setTimeout(r, 800));
        setContent('');
        setSuccess(true);

        if (forceSend && mockToneAnalysis.tone !== 'neutral') {
          setSuccessWarning(`Το μήνυμα αποθηκεύτηκε με flag "${mockToneAnalysis.tone}" - θα εμφανιστεί στο επίσημο ιστορικό.`);
        }

        setTimeout(() => {
          setSuccess(false);
          setSuccessWarning(null);
        }, 5000);
        return;
      }

      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          case_id: caseId,
          content: messageContent.trim(),
          force_send: forceSend,
        }),
      });

      const data = await response.json();

      if (response.status === 422) {
        setModal({
          isOpen: true,
          toneRejection: {
            tone: data.tone,
            score: data.score,
            flags: data.flags,
            suggested_alternative: data.suggested_alternative,
            can_force_send: data.can_force_send,
          },
          originalContent: messageContent,
        });
        return;
      }

      if (!response.ok) {
        setError(data.error || 'Αποτυχία αποστολής μηνύματος');
        return;
      }

      setContent('');
      setSuccess(true);

      if (data.force_sent) {
        setSuccessWarning(data.warning);
      }

      setTimeout(() => {
        setSuccess(false);
        setSuccessWarning(null);
      }, 5000);
    } catch (err) {
      setError('Σφάλμα δικτύου. Παρακαλώ προσπαθήστε ξανά.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Το μήνυμα δεν μπορεί να είναι κενό');
      return;
    }

    if (!accessToken) {
      setError('Απαιτείται ταυτοποίηση');
      return;
    }

    await handleSendMessage(content);
  };

  const handleApplySuggestion = () => {
    if (modal.toneRejection) {
      setContent(modal.toneRejection.suggested_alternative);
      setModal({ isOpen: false, toneRejection: null, originalContent: '' });
    }
  };

  const handleForceSend = async () => {
    if (!modal.toneRejection) return;

    setModal({ isOpen: false, toneRejection: null, originalContent: '' });
    await handleSendMessage(modal.originalContent, true);
  };

  const closeModal = () => {
    setModal({ isOpen: false, toneRejection: null, originalContent: '' });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Γράψτε το μήνυμά σας εδώ..."
          disabled={isLoading}
          className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          rows={4}
          maxLength={5000}
        />

        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>{content.length}/5000</span>
          <button
            type="submit"
            disabled={isLoading || !content.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {isLoading ? 'Ανάλυση...' : 'Αποστολή Μηνύματος'}
          </button>
        </div>
      </form>

      {/* Success message */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
          ✓ Το μήνυμα αποστάλθηκε με επιτυχία!
        </div>
      )}

      {/* Warning for force-sent messages */}
      {successWarning && (
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-orange-800">
          ⚠️ {successWarning}
        </div>
      )}

      {/* Generic error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Tone Rejection Modal */}
      {modal.isOpen && modal.toneRejection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full space-y-4 p-6">
            {/* Header */}
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-red-700">
                ⚠️ Ο τόνος του μηνύματος είναι έντονος
              </h2>
              <p className="text-sm text-gray-700">
                Το μήνυμά σας έχει έντονο ή επιθετικό ύφος και θα καταγραφεί αρνητικά
                στο επίσημο ιστορικό της υπόθεσης.
              </p>
            </div>

            {/* Flags */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm font-medium text-red-900 mb-2">Ζητήματα που εντοπίστηκαν:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                {modal.toneRejection.flags.map((flag, i) => (
                  <li key={i}>{flag}</li>
                ))}
              </ul>
            </div>

            {/* Suggested Alternative */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
              <p className="text-sm font-medium text-blue-900">Προτεινόμενη αναδιατύπωση:</p>
              <p className="text-sm text-blue-800 italic leading-relaxed">
                "{modal.toneRejection.suggested_alternative}"
              </p>
            </div>

            {/* Tone Score */}
            <div className="text-xs text-gray-600">
              Σκορ τόνου: {(modal.toneRejection.score * 100).toFixed(0)}%
              ({modal.toneRejection.tone === 'concerning' ? 'Ανησυχητικό' : 'Αρνητικό'})
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleApplySuggestion}
                className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
              >
                ✓ Εφαρμογή Πρότασης
              </button>
              <button
                type="button"
                onClick={handleForceSend}
                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition"
              >
                → Αποστολή όπως είναι
              </button>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-500 border-t pt-3">
              Εάν επιλέξετε "Αποστολή όπως είναι", το μήνυμα θα αποθηκευτεί με επίσημη σήμανση
              του αρνητικού τόνου και θα εμφανιστεί στο δικαστικό ιστορικό.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
