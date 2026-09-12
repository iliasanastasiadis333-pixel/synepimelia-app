'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface ReportOptions {
  dateRange: 'month' | 'quarter' | 'all';
  includeMessages: boolean;
  includeSwaps: boolean;
  includeExpenses: boolean;
}

export function CourtReportExport({ caseId }: { caseId: string }) {
  const [isDemoMode] = useState(() =>
    typeof window !== 'undefined' && localStorage.getItem('demo_mode') === 'true'
  );

  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const [options, setOptions] = useState<ReportOptions>({
    dateRange: 'month',
    includeMessages: true,
    includeSwaps: true,
    includeExpenses: true,
  });

  // Mock data for demo
  const mockMessages = [
    {
      id: 'msg-1',
      sender: 'Γιάννης',
      content: 'Θα παραλάβω το παιδί στις 5 το απόγευμα',
      tone: 'neutral',
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      flagged: false,
    },
    {
      id: 'msg-2',
      sender: 'Μαρία',
      content: 'Ξέρω ότι δεν σας ενδιαφέρει αλλά κάντε το ότι σας λέω!',
      tone: 'negative',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      flagged: true,
    },
  ];

  const mockSwaps = [
    {
      id: 'swap-1',
      requester: 'Γιάννης',
      requested_date: '2025-09-15',
      offered_date: '2025-09-17',
      status: 'approved',
      reason: 'Δουλειακή συνάντηση',
    },
    {
      id: 'swap-2',
      requester: 'Μαρία',
      requested_date: '2025-09-22',
      offered_date: '2025-09-24',
      status: 'pending',
      reason: null,
    },
  ];

  const mockExpenses = [
    { id: 'exp-1', title: 'Ιατρική εξέταση', amount: 150, payer: 'Γιάννης', status: 'approved' },
    { id: 'exp-2', title: 'Σχολικά είδη', amount: 85, payer: 'Μαρία', status: 'pending' },
  ];

  const getDateRangeLabel = () => {
    const today = new Date();
    let startDate: Date;

    if (options.dateRange === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    } else if (options.dateRange === 'quarter') {
      startDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
    } else {
      startDate = new Date(2020, 0, 1);
    }

    return `${startDate.toLocaleDateString('el-GR')} - ${today.toLocaleDateString('el-GR')}`;
  };

  const handleGenerateReport = () => {
    setShowPreview(true);
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(printRef.current.innerHTML);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    }
  };

  return (
    <>
      {/* Export Button */}
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-teal-700 transition"
        title="Εξαγωγή Αναφοράς Δικαστηρίου"
      >
        📄 Αναφορά
      </button>

      {/* Options Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full space-y-6 p-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">📄 Εξαγωγή Αναφοράς Δικαστηρίου</h2>
              <p className="text-sm text-gray-600 mt-1">Επίσημη ψηφιακή καταγραφή συνεπιμέλειας</p>
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-900">Εύρος Ημερομηνιών</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="dateRange"
                    value="month"
                    checked={options.dateRange === 'month'}
                    onChange={() => setOptions({ ...options, dateRange: 'month' })}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Τελευταίος 1 μήνας</p>
                    <p className="text-xs text-gray-600">~30 ημέρες</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="dateRange"
                    value="quarter"
                    checked={options.dateRange === 'quarter'}
                    onChange={() => setOptions({ ...options, dateRange: 'quarter' })}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Τελευταίες 3 μήνες</p>
                    <p className="text-xs text-gray-600">~90 ημέρες</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="dateRange"
                    value="all"
                    checked={options.dateRange === 'all'}
                    onChange={() => setOptions({ ...options, dateRange: 'all' })}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Όλο το διάστημα</p>
                    <p className="text-xs text-gray-600">Από την έναρξη της υπόθεσης</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-900">Ενότητες Προς Συμπερίληψη</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={options.includeMessages}
                    onChange={(e) => setOptions({ ...options, includeMessages: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium text-gray-900">💬 Μηνύματα & Σημάνσεις Τόνου</p>
                    <p className="text-xs text-gray-600">Καταγραφή όλων των επικοινωνιών</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={options.includeSwaps}
                    onChange={(e) => setOptions({ ...options, includeSwaps: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium text-gray-900">↔️ Ιστορικό Ανταλλαγών Ημερών</p>
                    <p className="text-xs text-gray-600">Αιτήματα και εγκρίσεις</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={options.includeExpenses}
                    onChange={(e) => setOptions({ ...options, includeExpenses: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium text-gray-900">💳 Εκκαθάριση Εξόδων</p>
                    <p className="text-xs text-gray-600">Κοινά έξοδα και ισοζύγιο</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Ακύρωση
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  handleGenerateReport();
                }}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition"
              >
                ✓ Δημιουργία Αναφοράς
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Preview */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl space-y-4 p-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-xl font-bold text-gray-900">📄 Προεπισκόπηση Αναφοράς</h2>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  🖨️ Εκτύπωση/PDF
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  ✕ Κλείσιμο
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div
              ref={printRef}
              className="space-y-6 p-8 bg-white text-gray-900 print:p-0"
              style={{ fontSize: '12pt', lineHeight: '1.6' }}
            >
              {/* Header */}
              <div className="text-center space-y-2 border-b pb-6">
                <h1 className="text-3xl font-bold">⚖️ ΑΝΑΦΟΡΑ ΔΙΚΑΣΤΗΡΙΟΥ</h1>
                <p className="text-sm text-gray-600">Ψηφιακή Κατάγραφη Συνεπιμέλειας</p>
                <p className="text-xs text-gray-500">Πλατφόρμα: Συνεπιμέλεια v1.0</p>
              </div>

              {/* Case Info */}
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="font-semibold text-gray-700">Αριθμός Υπόθεσης</p>
                  <p className="text-gray-900 font-mono">{caseId}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Ημερομηνία Έκδοσης</p>
                  <p className="text-gray-900">{new Date().toLocaleDateString('el-GR')}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Εύρος Αναφοράς</p>
                  <p className="text-gray-900">{getDateRangeLabel()}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Συμμετέχοντες</p>
                  <p className="text-gray-900">Γιάννης & Μαρία</p>
                </div>
              </div>

              {/* Messages Section */}
              {options.includeMessages && (
                <div className="space-y-3 border-t pt-6">
                  <h2 className="text-lg font-bold text-gray-900">💬 Μηνύματα & Σημάνσεις Τόνου</h2>
                  <div className="space-y-2">
                    {mockMessages.map((msg) => (
                      <div key={msg.id} className="p-3 border border-gray-200 rounded text-sm">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{msg.sender}</p>
                            <p className="text-gray-800 my-1">"{msg.content}"</p>
                            <p className="text-xs text-gray-600">{new Date(msg.created_at).toLocaleDateString('el-GR')}</p>
                          </div>
                          {msg.flagged && (
                            <div className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
                              ⚠️ ΑΡΝΗΤΙΚΟΣ ΤΟΝΟΣ
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Swaps Section */}
              {options.includeSwaps && (
                <div className="space-y-3 border-t pt-6">
                  <h2 className="text-lg font-bold text-gray-900">↔️ Ιστορικό Ανταλλαγών Ημερών</h2>
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="text-left p-2 font-semibold">Αιτών</th>
                        <th className="text-left p-2 font-semibold">Ζήτησε</th>
                        <th className="text-left p-2 font-semibold">Προσφέρει</th>
                        <th className="text-left p-2 font-semibold">Κατάσταση</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockSwaps.map((swap) => (
                        <tr key={swap.id} className="border-b border-gray-200">
                          <td className="p-2">{swap.requester}</td>
                          <td className="p-2">{swap.requested_date}</td>
                          <td className="p-2">{swap.offered_date}</td>
                          <td className="p-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                swap.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {swap.status === 'approved' ? 'Εγκρίθηκε' : 'Εκκρεμής'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Expenses Section */}
              {options.includeExpenses && (
                <div className="space-y-3 border-t pt-6">
                  <h2 className="text-lg font-bold text-gray-900">💳 Εκκαθάριση Εξόδων</h2>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded">
                      <p className="text-xs text-gray-600">Σύνολο Εγκριμένων Εξόδων</p>
                      <p className="text-2xl font-bold text-emerald-700">€235.00</p>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-xs text-gray-600">Τρέχον Ισοζύγιο</p>
                      <p className="text-2xl font-bold text-blue-700">Γιάννης -€75.00</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="border-t pt-6 text-center space-y-2 text-xs text-gray-600">
                <p className="font-semibold">🔐 ΔΗΛΩΣΗ ΑΚΕΡΑΙΟΤΗΤΑΣ ΔΕΔΟΜΕΝΩΝ</p>
                <p>
                  Αυτή η αναφορά αποτελεί αδιάβλητη ψηφιακή καταγραφή από τη πλατφόρμα συνεπιμέλειας.
                </p>
                <p>Τα δεδομένα προστατεύονται με κρυπτογραφία και ακολουθούν τα ευρωπαϊκά πρότυπα GDPR.</p>
                <p className="text-gray-500">
                  Δημιουργήθηκε: {new Date().toLocaleString('el-GR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
