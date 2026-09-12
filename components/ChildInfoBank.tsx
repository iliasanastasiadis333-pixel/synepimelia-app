'use client';

import { useState } from 'react';

interface ChildInfo {
  amka: string;
  afm: string;
  documentId: string;
  bloodType: string;
}

interface EmergencyContact {
  type: 'pediatrician' | 'school' | 'tutor';
  name: string;
  phone: string;
  notes?: string;
}

interface Document {
  id: string;
  title: string;
  type: 'vaccination' | 'court_order' | 'insurance' | 'school' | 'other';
  uploadedDate: string;
  url?: string;
}

export function ChildInfoBank({ caseId }: { caseId: string }) {
  const [isDemoMode] = useState(() =>
    typeof window !== 'undefined' && localStorage.getItem('demo_mode') === 'true'
  );

  const [childInfo] = useState<ChildInfo>({
    amka: '12-345678-9',
    afm: '98-765-432-1',
    documentId: 'Α-ΖΖZZZ-9',
    bloodType: 'O+',
  });

  const [emergencyContacts] = useState<EmergencyContact[]>([
    {
      type: 'pediatrician',
      name: 'Δρ. Γεώργιος Παπαδόπουλος',
      phone: '+30210-1234567',
      notes: 'Δόμιο επιδό, Δευτέρα-Παρασκευή',
    },
    {
      type: 'school',
      name: '3ο Δημοτικό Σχολείο Αθήνας',
      phone: '+30210-9876543',
      notes: 'Τάξη Ε1',
    },
    {
      type: 'tutor',
      name: 'Μαρία Κωνσταντίνου (Μαθήματα Αγγλικών)',
      phone: '+30693-1234567',
    },
  ]);

  const [documents] = useState<Document[]>([
    {
      id: 'doc-1',
      title: 'Βιβλιάριο Εμβολίων',
      type: 'vaccination',
      uploadedDate: '2025-08-15',
    },
    {
      id: 'doc-2',
      title: 'Δικαστική Απόφαση Συνεπιμέλειας',
      type: 'court_order',
      uploadedDate: '2025-01-10',
    },
    {
      id: 'doc-3',
      title: 'Ασφαλιστήριο Συμβόλαιο (ΟΕΚ)',
      type: 'insurance',
      uploadedDate: '2025-07-20',
    },
  ]);

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} αντιγράφηκε: ${text}`);
  };

  const getDocumentTypeLabel = (type: Document['type']) => {
    const labels = {
      vaccination: '💉 Εμβόλια',
      court_order: '⚖️ Δικαστική Απόφαση',
      insurance: '🏥 Ασφάλεια',
      school: '📚 Σχολείο',
      other: '📄 Άλλο',
    };
    return labels[type];
  };

  const getContactIcon = (type: EmergencyContact['type']) => {
    const icons = {
      pediatrician: '🏥',
      school: '🏫',
      tutor: '👨‍🏫',
    };
    return icons[type];
  };

  return (
    <div className="space-y-6">
      {/* Personal Info Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6 border-2 border-blue-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">👤 Στοιχεία Παιδιού</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white rounded-lg border border-blue-100">
            <p className="text-xs text-gray-600 font-semibold">ΑΜΚΑ</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-lg font-mono font-bold text-gray-900">{childInfo.amka}</p>
              <button
                onClick={() => handleCopyToClipboard(childInfo.amka, 'ΑΜΚΑ')}
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition"
                title="Αντιγραφή στο πρόχειρο"
              >
                📋
              </button>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-blue-100">
            <p className="text-xs text-gray-600 font-semibold">ΑΦΜ</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-lg font-mono font-bold text-gray-900">{childInfo.afm}</p>
              <button
                onClick={() => handleCopyToClipboard(childInfo.afm, 'ΑΦΜ')}
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition"
                title="Αντιγραφή στο πρόχειρο"
              >
                📋
              </button>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-blue-100">
            <p className="text-xs text-gray-600 font-semibold">Διαβατήριο/Ταυτότητα</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-lg font-mono font-bold text-gray-900">{childInfo.documentId}</p>
              <button
                onClick={() => handleCopyToClipboard(childInfo.documentId, 'ID')}
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition"
                title="Αντιγραφή στο πρόχειρο"
              >
                📋
              </button>
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-blue-100">
            <p className="text-xs text-gray-600 font-semibold">Ομάδα Αίματος</p>
            <p className="text-lg font-bold text-red-600 mt-2">{childInfo.bloodType}</p>
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900">🚨 Επαφές Έκτακτης Ανάγκης & Υγείας</h3>
        <div className="space-y-2">
          {emergencyContacts.map((contact, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-4 border-l-4 border-red-400">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getContactIcon(contact.type)}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{contact.name}</p>
                      <p className="text-xs text-gray-600">
                        {contact.type === 'pediatrician'
                          ? 'Παιδίατρος'
                          : contact.type === 'school'
                            ? 'Σχολείο'
                            : 'Φροντιστήριο'}
                      </p>
                    </div>
                  </div>
                  {contact.notes && <p className="text-xs text-gray-600 italic">{contact.notes}</p>}
                </div>
                <a
                  href={`tel:${contact.phone}`}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition text-sm whitespace-nowrap"
                  title="Κλήση"
                >
                  ☎️ {contact.phone}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Documents Archive */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">📄 Αρχείο Εγγράφων</h3>
          <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition font-medium">
            + Προσθήκη Εγγράφου
          </button>
        </div>
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between hover:shadow-md transition">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{doc.title}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                  <span className="px-2 py-1 bg-gray-100 rounded">{getDocumentTypeLabel(doc.type)}</span>
                  <span>Ανέβηκε: {new Date(doc.uploadedDate).toLocaleDateString('el-GR')}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition font-medium">
                  👁️ Προβολή
                </button>
                <button className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition font-medium">
                  ⬇️ Λήψη
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded">
        <p className="text-sm text-amber-900">
          <strong>ℹ️ Σημείωση:</strong> Τα στοιχεία εδώ προστατεύονται με κρυπτογραφία GDPR και είναι προσβάσιμα μόνο στους εγκεκριμένους γονέες.
        </p>
      </div>
    </div>
  );
}
