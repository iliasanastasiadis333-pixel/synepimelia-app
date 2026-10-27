'use client';

import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Συνεπιμέλεια
          </Link>
          <div className="flex gap-4">
            <Link href="/terms" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Όροι Χρήσης
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Απόρρητο
            </Link>
          </div>
        </nav>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Όροι Χρήσης</h1>
        <p className="text-gray-600 text-sm mb-8">Ημερομηνία τελευταίας ενημέρωσης: 27 Οκτωβρίου 2026</p>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
          {/* Legal Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">⚖️ Νομικό Disclaimer</h2>
            <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-4">
              <p className="font-semibold text-red-900 mb-2">
                ΣΗΜΑΝΤΙΚΟ: Η εφαρμογή "Συνεπιμέλεια" αποτελεί εργαλείο οργάνωσης και επικοινωνίας μόνο.
              </p>
              <ul className="list-disc list-inside space-y-2 text-red-800 text-sm">
                <li>Δεν παρέχει νομικές συμβουλές ούτε υποκαθιστά δικηγόρο</li>
                <li>Δεν υποκαθιστά δικαστικές αποφάσεις ή συμβατικές υποχρεώσεις</li>
                <li>Δεν εγγυάται ότι τα δεδομένα θα γίνουν αποδεκτά σε δικαστήριο</li>
                <li>Δεν δημιουργεί νομικές σχέσεις μεταξύ των χρηστών</li>
              </ul>
            </div>
            <p className="mb-4">
              Για νομικές συμβουλές σχετικές με τη συνεπιμέλεια, επικοινωνήστε με εξειδικευμένο δικηγόρο οικογενειακού δικαίου.
            </p>
          </section>

          {/* Usage Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Δικαιώματα Χρήσης</h2>
            <p className="mb-4">
              Σας χορηγούμε περιορισμένη, μη αποκλειστική άδεια χρήσης της εφαρμογής προς προσωπική χρήση μόνο.
              Δεν επιτρέπεται:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Εμπορική χρήση χωρίς έγγραφη άδεια</li>
              <li>Αναπαραγωγή, τροποποίηση ή διανομή του κώδικα</li>
              <li>Αποκάλυψη κωδικών ή δεδομένων σε τρίτους</li>
              <li>Χρήση για απάτη, παρενόχληση ή παράνομες δραστηριότητες</li>
            </ul>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Ευθύνες Χρήστη</h2>
            <p className="mb-4">Ο χρήστης δηλώνει και επιβεβαιώνει ότι:</p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Έχει νομική εξουσία να εγγραφεί και να χρησιμοποιήσει τον λογαριασμό</li>
              <li>Θα τηρήσει την εμπιστευτικότητα των διαπιστευτηρίων του</li>
              <li>Θα ενημερώσει τον άλλο γονέα ή κηδεμόνα σχετικά με τη χρήση της εφαρμογής</li>
              <li>Δεν θα χρησιμοποιήσει τα δεδομένα άλλου χρήστη χωρίς άδεια</li>
            </ul>
          </section>

          {/* Liability Limitation */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Περιορισμός Ευθύνης</h2>
            <p className="mb-4">
              Η εφαρμογή παρέχεται "όπως είναι" χωρίς εγγυήσεις. Δεν ευθυνόμαστε για:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Απώλεια ή διαρροή δεδομένων (παρά τις προσπάθειες προστασίας)</li>
              <li>Διακοπή υπηρεσίας ή τεχνικά σφάλματα</li>
              <li>Δυσκολίες σε δικαστικές διαφορές λόγω χρήσης (ή μη χρήσης) της εφαρμογής</li>
              <li>Προσωπική, οικογενειακή ή οικονομική ζημία</li>
            </ul>
          </section>

          {/* Content Ownership */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Ιδιοκτησία Περιεχομένου</h2>
            <p className="mb-4">
              Διατηρείτε πλήρη ιδιοκτησία του περιεχομένου που ανεβάζετε (φωτογραφίες, έγγραφα, δεδομένα παιδιού).
              Με την εγγραφή, μας χορηγείτε άδεια:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Να αποθηκεύουμε και να διαχειριζόμαστε τα δεδομένα με ασφάλεια</li>
              <li>Να τα κάνουμε προσβάσιμα στον άλλο γονέα/κηδεμόνα κατά τη διάρκεια της χρήσης</li>
              <li>Να τα χρησιμοποιούμε για συμμόρφωση νομικών υποχρεώσεων</li>
            </ul>
          </section>

          {/* Prohibited Conduct */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Απαγορευμένη Συμπεριφορά</h2>
            <p className="mb-4">
              Δεν επιτρέπεται:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Παρενόχληση, απειλές ή κακοποίηση διά μέσου της εφαρμογής</li>
              <li>Ενέργειες που θέτουν σε κίνδυνο τα δικαιώματα του παιδιού</li>
              <li>Παραποίηση δεδομένων ή κατασκευή ψευδών εγγράφων</li>
              <li>Προσπάθεια κλοπής λογαριασμών ή πρόσβασης χωρίς άδεια</li>
            </ul>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Διατήρηση Δεδομένων</h2>
            <p className="mb-4">
              Τα δεδομένα διατηρούνται για τους χρόνους που αναφέρονται στον πίνακα της Πολιτικής Απορρήτου.
              Μετά τη διαγραφή λογαριασμού, τα δεδομένα που δεν απαιτούνται από νομικές ή φορολογικές υποχρεώσεις διαγράφονται.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Τερματισμός</h2>
            <p className="mb-4">
              Μπορούμε να διακόψουμε ή να αναστείλουμε τη πρόσβασή σας:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Εάν παραβιάσετε αυτούς τους όρους</li>
              <li>Εάν χρησιμοποιηθεί η εφαρμογή για παράνομες δραστηριότητες</li>
              <li>Εάν υπάρχουν ισχυροί ενδείξεις κινδύνου για το παιδί</li>
            </ul>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Αλλαγές στους Όρους</h2>
            <p className="mb-4">
              Διατηρούμε το δικαίωμα να ενημερώσουμε αυτούς τους όρους. Οι σημαντικές αλλαγές θα ανακοινωθούν μέσω email
              ή μηνύματος στην εφαρμογή.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Επικοινωνία</h2>
            <p className="mb-4">
              Για ερωτήσεις σχετικά με αυτούς τους όρους, παρακαλούμε επικοινωνήστε:
            </p>
            <p className="mb-2">
              <strong>Email:</strong> support@synepimelia.gr
            </p>
            <p>
              <strong>Διεύθυνση:</strong> Αθήνα, Ελλάδα
            </p>
          </section>
        </div>

        {/* Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex gap-4">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Επιστροφή στην Αρχική
          </Link>
          <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
            Πολιτική Απορρήτου →
          </Link>
        </div>
      </div>
    </main>
  );
}
