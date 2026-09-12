'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  const handleDemoClick = () => {
    const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';
    const DEMO_CASE_ID = '00000000-0000-0000-0000-000000000099';

    localStorage.setItem('demo_mode', 'true');
    localStorage.setItem('demo_user_id', DEMO_USER_ID);
    localStorage.setItem('demo_case_id', DEMO_CASE_ID);
    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Συνεπιμέλεια
          </div>
          <div className="flex gap-4">
            <Link href="/terms" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Όροι Χρήσης
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Απόρρητο
            </Link>
            <button
              onClick={handleDemoClick}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition text-sm font-medium"
            >
              Είσοδος
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center space-y-8">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Αρμονική Συνεπιμέλεια για <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Καλύτερη Οικογένεια</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Μια σύγχρονη πλατφόρμα για διαχείριση κοινής φύλαξης παιδιών: ημερολόγια, ανταλλαγές, κοινά έξοδα και ασφαλής επικοινωνία.
          </p>
          <div className="flex gap-4 justify-center pt-6">
            <button
              onClick={handleDemoClick}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-xl transition font-semibold text-lg"
            >
              🚀 Δοκιμάστε το Demo
            </button>
            <Link
              href="/dashboard"
              className="px-8 py-4 border-2 border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition font-semibold text-lg"
            >
              Δημιουργία Λογαριασμού
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-b from-blue-50 to-transparent py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Κύριες Λειτουργίες
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Calendar */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ημερολόγιο Επιμέλειας</h3>
              <p className="text-gray-600">
                Διαχείριση εβδομαδιαίων ρόλων φύλαξης και εγκρίσεις ανταλλαγών με ένα κλικ.
              </p>
            </div>

            {/* Expenses */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Καταμερισμός Εξόδων</h3>
              <p className="text-gray-600">
                Παρακολούθηση κοινών εξόδων παιδιού και αυτόματα υπολογιζόμενο ισοζύγιο.
              </p>
            </div>

            {/* InfoBank */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="text-4xl mb-4">👤</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ψηφιακός Φάκελος</h3>
              <p className="text-gray-600">
                Αποθήκευση ΑΜΚΑ, ΑΦΜ, εμβολιασμών και στοιχείων έκτακτης ανάγκης.
              </p>
            </div>

            {/* AI Messages */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Έλεγχος Τόνου</h3>
              <p className="text-gray-600">
                Ανάλυση τόνου μηνυμάτων για ειρηνική και σεβαστή επικοινωνία.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">
                🔒 Ασφάλεια & Απόρρητο
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 text-green-600 font-bold text-xl">✓</div>
                  <p className="text-gray-600">
                    <strong>Κρυπτογράφηση end-to-end</strong> για όλες τις επικοινωνίες
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 text-green-600 font-bold text-xl">✓</div>
                  <p className="text-gray-600">
                    <strong>Συμμόρφωση GDPR</strong> - δεδομένα αποθηκευμένα με ασφάλεια στην ΕΕ
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 text-green-600 font-bold text-xl">✓</div>
                  <p className="text-gray-600">
                    <strong>Δικαστικά αρχεία</strong> - πλήρες ιστορικό για νομικές διαφορές
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 text-green-600 font-bold text-xl">✓</div>
                  <p className="text-gray-600">
                    <strong>Προστασία ανηλίκων</strong> - όλα τα δεδομένα παιδιών αντιμετωπίζονται με ιδιαίτερη φροντίδα
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">🛡️</div>
              <p className="text-gray-700 font-semibold text-lg">
                Διαχείριση Δεδομένων κατά GDPR με <strong>Row Level Security</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-6">
          <h2 className="text-4xl font-bold">Ξεκινήστε σήμερα</h2>
          <p className="text-xl text-blue-100">
            Δοκιμάστε τη δωρεάν demo έκδοση ή δημιουργήστε ένα λογαριασμό
          </p>
          <button
            onClick={handleDemoClick}
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg hover:shadow-xl transition font-semibold text-lg"
          >
            Δοκιμάστε το Demo Τώρα
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">Συνεπιμέλεια</h4>
              <p className="text-sm">
                Ασφαλής πλατφόρμα για αρμονική συνεπιμέλεια παιδιών.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Νομικά</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/terms" className="hover:text-white transition">
                    Όροι Χρήσης
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition">
                    Πολιτική Απορρήτου
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Χαρακτηριστικά</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Ημερολόγιο</a></li>
                <li><a href="#" className="hover:text-white transition">Έξοδα</a></li>
                <li><a href="#" className="hover:text-white transition">Μηνύματα</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Υποστήριξη</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Βοήθεια</a></li>
                <li><a href="#" className="hover:text-white transition">Επικοινωνία</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 Συνεπιμέλεια. Όλα τα δικαιώματα διατηρούνται.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
