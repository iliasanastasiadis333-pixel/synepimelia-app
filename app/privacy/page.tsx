'use client';

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Συνεπιμέλεια
          </Link>
          <div className="flex gap-4">
            <Link href="/terms" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Όροι Χρήσης
            </Link>
            <Link href="/privacy" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Απόρρητο
            </Link>
          </div>
        </nav>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Πολιτική Απορρήτου & GDPR</h1>
        <p className="text-gray-600 text-sm mb-8">Ημερομηνία τελευταίας ενημέρωσης: 27 Οκτωβρίου 2026</p>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
          {/* GDPR Compliance */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🔒 Συμμόρφωση GDPR</h2>
            <p className="mb-4">
              Η εφαρμογή "Συνεπιμέλεια" τηρεί πλήρως τον Κανονισμό (ΕΕ) 2016/679 (GDPR) και τις σχετικές ελληνικές νομοθεσίες
              προστασίας δεδομένων προσωπικού χαρακτήρα.
            </p>
          </section>

          {/* What We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Ποια Δεδομένα Συλλέγουμε</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📧 Δεδομένα Λογαριασμού</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Email διεύθυνση</li>
                  <li>Κωδικός πρόσβασης (κρυπτογραφημένος)</li>
                  <li>Ονοματεπώνυμο (προαιρετικά)</li>
                  <li>Τηλέφωνο επικοινωνίας (προαιρετικά)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">👨‍👩‍👧 Δεδομένα Παιδιού</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Όνομα παιδιού</li>
                  <li>Ημερομηνία γέννησης</li>
                  <li>ΑΜΚΑ (Αριθμός Μητρώου Κοινωνικής Ασφάλισης)</li>
                  <li>ΑΦΜ (Αριθμός Φορολογικού Μητρώου)</li>
                  <li>Στοιχεία ταυτότητας/διαβατηρίου</li>
                  <li>Ομάδα αίματος</li>
                  <li>Ιστορικό εμβολιασμών</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📅 Δεδομένα Συνεπιμέλειας</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Ημερολόγιο φύλαξης και ανταλλαγές</li>
                  <li>Αιτήματα ανταλλαγής και απαντήσεις</li>
                  <li>Μηνύματα επικοινωνίας μεταξύ γονέων</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">💳 Δεδομένα Εξόδων</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Κοινά έξοδα παιδιού και κατηγορίες</li>
                  <li>Ποσά και ημερομηνίες συναλλαγών</li>
                  <li>Σχόλια και παραστατικά</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🆘 Δεδομένα Έκτακτης Ανάγκης</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Στοιχεία παιδιάτρου</li>
                  <li>Στοιχεία σχολείου</li>
                  <li>Στοιχεία επικοινωνίας έκτακτης ανάγκης</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Legal Basis */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Νομική Βάση Επεξεργασίας</h2>
            <p className="mb-4">
              Επεξεργαζόμαστε τα δεδομένα με βάση:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li><strong>Συγκατάθεση:</strong> Για την αποθήκευση και διαχείριση δεδομένων συνεπιμέλειας</li>
              <li><strong>Νομικές Υποχρεώσεις:</strong> Για την τήρηση αρχείων κατά τις διατάξεις οικογενειακού δικαίου</li>
              <li><strong>Συμφέρον Ανηλίκου:</strong> Για τη προστασία των δικαιωμάτων του παιδιού</li>
            </ul>
          </section>

          {/* Data Protection */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Προστασία Δεδομένων</h2>
            <div className="bg-green-50 border-l-4 border-green-600 p-6 mb-4">
              <p className="font-semibold text-green-900 mb-3">Μέτρα ασφαλείας που λαμβάνουμε:</p>
              <ul className="list-disc list-inside space-y-2 text-green-800 text-sm">
                <li><strong>Κρυπτογράφηση TLS/SSL:</strong> Για όλες τις μεταφορές δεδομένων</li>
                <li><strong>Κρυπτογράφηση αποθήκευσης:</strong> Τα δεδομένα είναι κρυπτογραφημένα στη βάση δεδομένων</li>
                <li><strong>Row Level Security (RLS):</strong> Κάθε γονέας βλέπει μόνο τα δεδομένα της υπόθεσής του</li>
                <li><strong>Ασφαλείς κωδικοί:</strong> Οι κωδικοί αποθηκεύονται μόνο ως κρυπτογραφημένο hash (bcrypt)</li>
              </ul>
            </div>
            <p>
              Τα δεδομένα αποθηκεύονται σε ασφαλή κέντρο δεδομένων στην ΕΕ (Supabase EU) σύμφωνα με τις ανώτατες
              διεθνείς πρακτικές ασφαλείας.
            </p>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Κοινοποίηση Δεδομένων</h2>
            <p className="mb-4">
              Τα δεδομένα σας κοινοποιούνται μόνο:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>
                <strong>Στον άλλο γονέα/κηδεμόνα:</strong> Που είναι εγγεγραμμένος στην ίδια υπόθεση
                (ημερολόγιο, μηνύματα, έξοδα)
              </li>
              <li>
                <strong>Σε νομικές αρχές:</strong> Μόνο κατ' εντολή ή όταν απαιτείται από τη νομοθεσία
              </li>
              <li>
                <strong>Σε δικηγόρους/διαμεσολαβητές:</strong> Εάν τις περιλάβετε στη υπόθεση
              </li>
              <li>
                <strong>Δεν πουλάμε δεδομένα</strong> σε τρίτους και δεν τα χρησιμοποιούμε για marketing
              </li>
            </ul>
          </section>

          {/* Children Protection */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Προστασία Ανηλίκων</h2>
            <p className="mb-4">
              Τα δεδομένα των ανηλίκων (παιδιών) χαίρουν ιδιαίτερης προστασίας:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Τα δεδομένα του παιδιού είναι προσβάσιμα μόνο στους γονείς/κηδεμόνες</li>
              <li>Δεν επιτρέπεται χρήση παιδικών δεδομένων για άλλες δραστηριότητες</li>
              <li>Ειδικές σαφές προειδοποιήσεις για ευαίσθητα δεδομένα (ΑΜΚΑ, ιστορικό υγείας)</li>
              <li>Αυστηρή πολιτική διαγραφής δεδομένων αν ζητηθεί</li>
            </ul>
          </section>

          {/* User Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Δικαιώματα Χρήστη (GDPR)</h2>
            <p className="mb-4">
              Έχετε το δικαίωμα να:
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900">📋 Πρόσβαση (Art. 15)</h3>
                <p className="text-sm text-gray-600">Ζητήστε αντίγραφο όλων των δεδομένων που έχουμε για εσάς</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">✏️ Διόρθωση (Art. 16)</h3>
                <p className="text-sm text-gray-600">Διορθώστε ανακριβή ή ελλιπή δεδομένα</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">🗑️ Διαγραφή (Art. 17 - "Δικαίωμα Ξεχάσματος")</h3>
                <p className="text-sm text-gray-600">Ζητήστε διαγραφή, εκτός αν υπάρχουν νομικές υποχρεώσεις (π.χ. τήρηση αρχείων)</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">⏸️ Περιορισμό Επεξεργασίας (Art. 18)</h3>
                <p className="text-sm text-gray-600">Ζητήστε να σταματήσει η επεξεργασία μέχρι επιβεβαίωσης</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">📊 Δυνατότητα Μεταφοράς Δεδομένων (Art. 20)</h3>
                <p className="text-sm text-gray-600">Ζητήστε τα δεδομένα σας σε δομημένη μορφή για μεταφορά σε άλλη υπηρεσία</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">⚖️ Ένστασης (Art. 21)</h3>
                <p className="text-sm text-gray-600">Αντιταχθείτε στη χρήση δεδομένων για συγκεκριμένα σκοπό</p>
              </div>
            </div>
            <p className="mt-4">
              Για άσκηση οποιουδήποτε δικαιώματος, επικοινωνήστε στο iliasanastasiadis333@gmail.com με αίτημα GDPR.
            </p>
            <p className="mt-4">
              <strong>Διαγραφή λογαριασμού:</strong> μπορείς να διαγράψεις τον λογαριασμό σου απευθείας από το dashboard,
              στην ενότητα «Διαγραφή λογαριασμού». Η διαγραφή αφαιρεί το email και τα στοιχεία σύνδεσης και απενεργοποιεί τον λογαριασμό.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Χρόνοι Διατήρησης Δεδομένων</h2>
            <table className="w-full text-sm border-collapse border border-gray-300 mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Κατηγορία Δεδομένων</th>
                  <th className="border border-gray-300 p-2 text-left">Χρόνος Διατήρησης</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">Λογαριασμός χρήστη (ενεργό)</td>
                  <td className="border border-gray-300 p-2">Όσο είναι ενεργό</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 p-2">Δεδομένα συνεπιμέλειας</td>
                  <td className="border border-gray-300 p-2">Ως 7 χρόνια (για νομικές υποχρεώσεις)</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">Μηνύματα επικοινωνίας</td>
                  <td className="border border-gray-300 p-2">Ως 7 χρόνια (δικαστική χρήση)</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 p-2">Αρχεία έκτακτης ανάγκης</td>
                  <td className="border border-gray-300 p-2">Ως 3 χρόνια μετά τη διακοπή</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">Logs επικοινωνίας/backup</td>
                  <td className="border border-gray-300 p-2">Ως 90 ημέρες</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* DPO Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Αξιωματούχος Προστασίας Δεδομένων (DPO)</h2>
            <p className="mb-4">
              Ορίσαμε Αξιωματούχο Προστασίας Δεδομένων για επιτήρηση συμμόρφωσης με το GDPR:
            </p>
            <p className="mb-2">
              <strong>Email DPO:</strong> iliasanastasiadis333@gmail.com
            </p>
          </section>

          {/* Complaint */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Κατάθεση Παραπόνου</h2>
            <p className="mb-4">
              Εάν πιστεύετε ότι δεν τηρούμε τα δικαιώματά σας στην προστασία δεδομένων,
              μπορείτε να καταθέσετε καταγγελία στην Ελληνική Αρχή Προστασίας Δεδομένων (ΑAΠΔ):
            </p>
            <p className="mb-2">
              <strong>ΑAΠΔ Website:</strong> www.dpa.gr
            </p>
            <p>
              <strong>Email:</strong> contact@dpa.gr
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Ενημερώσεις Πολιτικής</h2>
            <p className="mb-4">
              Ενδέχεται να ενημερώσουμε αυτή την πολιτική σύμφωνα με νέες ρυθμίσεις ή διορθώσεις.
              Σημαντικές αλλαγές θα ανακοινωθούν μέσω email ή ειδοποίησης στην εφαρμογή.
            </p>
          </section>
        </div>

        {/* Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex gap-4">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Επιστροφή στην Αρχική
          </Link>
          <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
            Όροι Χρήσης →
          </Link>
        </div>
      </div>
    </main>
  );
}
