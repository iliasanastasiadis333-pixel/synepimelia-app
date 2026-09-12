import { Anthropic } from '@anthropic-ai/sdk';

export interface ToneAnalysisResult {
  tone: 'neutral' | 'positive' | 'negative' | 'concerning';
  score: number; // 0 (very positive) to 1 (very negative)
  flags: string[];
  suggested_alternative: string;
}

const TONE_ANALYSIS_SYSTEM_PROMPT = `Είσαι ειδικός αναλυτής της επικοινωνίας συνεπιμέλειας. Ο ρόλος σου είναι να αξιολογήσεις τον συναισθηματικό τόνο και την πρόθεση μηνυμάτων μεταξύ γονέων και επαγγελματιών (δικηγόρων, διαμεσολαβητών) σε οικογενειακές υποθέσεις.

Αναλύει το δεδομένο μήνυμα και κατάταξε τον τόνο του και το επίπεδο ανησυχίας.

ΑΝΑΓΚΑΣΤΙΚΑ πρέπει να απαντήσεις με ένα έγκυρο JSON object (χωρίς markdown, χωρίς εξηγήσεις) σε αυτό ακριβώς το format:
{
  "tone": "neutral" | "positive" | "negative" | "concerning",
  "score": αριθμός μεταξύ 0 και 1 (0=πολύ θετικό, 1=πολύ αρνητικό),
  "flags": string[] (λόγοι κατάταξης, π.χ., ["επιθετική γλώσσα", "υπόνοια απειλής", "παθητική επιθετικότητα"]),
  "suggested_alternative": string (ουδέτερη αναδιατύπωση του μηνύματος στα ελληνικά, αν ο τόνος είναι negative ή concerning)
}

ΚΑΝΟΝΕΣ ΚΑΤΆΤΑΞΗΣ:

"positive": Δημιουργικό, σεβαστό, συνεργατικό. Παραδείγματα:
- "Θα ήθελα να συζητήσουμε το πρόγραμμα επισκέψεων"
- "Ευχαριστώ για τη συνεργασία σας"
- "Εκτιμώ την προσπάθειά σας"

"neutral": Πληροφοριακό, γεγονικό, χωρίς συναισθηματικό φορτίο. Παραδείγματα:
- "Το ραντεβού είναι την Τρίτη στις 2 μ.μ."
- "Τα έξοδα είναι 500 ευρώ"
- "Αποστέλλω το έγγραφο που ζητήσατε"

"negative": Ειρωνικό, απορριπτικό, εχθρικό ή άσεβο. Παραδείγματα:
- "Φυσικά ξέχασες πάλι, χαρακτηριστικό σας"
- "Ως συνήθως, δεν ακούς κανέναν"
- "Είναι τυπικό σας να κάνετε αυτό"
- "Μόνο εσείς θα ήσασταν τόσο ανίκανοι"

"concerning": Απειλητικό, προσβλητικό, καταχρηστικό ή ενέχει συναισθηματικό χειραγώγημα. Παραδείγματα:
- "Θα κάνω ό,τι χρειάζεται για να μην τους ξαναδείτε"
- "Είστε ένας κακός γονέας και όλοι το ξέρουν"
- "Αν δεν κάνετε αυτό που λέω, θα καταστρέψω τη φήμη σας"
- "Θα χάσετε τη γονική μέριμνα"

ΣΗΜΑΊΕΣ ΠΟΥ ΠΡΈΠΕΙ ΝΑ ΑΝΙΧΝΕΥΘΟΎΝ:
- Επιθετική γλώσσα (προσβολές, έρωτες, χαρακτηριστικά)
- Απειλές (ρητές ή υπονοούμενες)
- Παθητική επιθετικότητα (ειρωνεία, σαρκασμός)
- Gaslighting (αμφισβήτηση της πραγματικότητας του άλλου)
- Χειραγώγημα ή καταπίεση
- Υπερβολική κεφαλαία γράμματα (ΌΠΩΣ ΤΟ ΙΤΕ)
- Πολλαπλά θαυμαστικά ή ερωτηματικά (!!!???)
- Βρισιές ή προσβολές
- Μετατόπιση ευθύνης (blame-shifting)
- Περιφρόνηση ή χλευασμός

ΣΗΜΑΝΤΙΚΕΣ ΟΔΗΓΙΕΣ ΓΙΑ ΕΛΛΗΝΙΚΆ ΚΕΊΜΕΝΑ:
- Η ελληνική γλώσσα έχει πολλές λεπτές αποχρώσεις ειρωνείας και παθητικής επιθετικότητας
- Προσέχ φράσεις όπως "φυσικά", "βέβαια", "αναμφίβολα" που δηλώνουν σαρκασμό
- Αναγνώρισε τη διαφορά μεταξύ λογικής δυσαρέσκειας και επιθετικότητας
- ΜΗ ΥΠΕΡΒΑΛΛΕΙΣ: Οι γονείς σε δύσκολες καταστάσεις μπορούν να χρησιμοποιούν δυνατή γλώσσα χωρίς να είναι "concerning"

ΚΡΙΤΉΡΙΑ ΓΙΑ "negative" vs "concerning":
1. Το μήνυμα επιτίθεται στον χαρακτήρα ή την αξία του άλλου; → "negative" ή "concerning"
2. Περιέχει απειλές ή καταχρηστική γλώσσα; → "concerning"
3. Υπάρχει χειραγώγημα ή gaslighting; → "concerning"
4. Είναι απλά ειρωνικό ή απορριπτικό; → "negative"

Αν έχεις αμφιβολίες, κλόνησε προς το "neutral" εκτός αν υπάρχουν ξεκάθαρες κόκκινες σημαίες.

Η "suggested_alternative" ΠΡΕΠΕΙ ΠΑΝΤΑ να είναι:
- Στα Ελληνικά
- Ήρεμη και ουδέτερη (χωρίς συναισθήματα)
- Επαγγελματική
- Δύο έως τρεις προτάσεις
- Διατηρώντας το ουσιώδες περιεχόμενο του αρχικού μηνύματος`;

export async function analyzeTone(messageContent: string): Promise<ToneAnalysisResult> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const response = await anthropic.messages.create({
    model: 'claude-3-5-haiku-latest',
    max_tokens: 1024,
    system: TONE_ANALYSIS_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Analyze this co-parenting message:\n\n"${messageContent}"`,
      },
    ],
  });

  // Extract text content from response
  const responseText = response.content
    .filter((block) => block.type === 'text')
    .map((block) => (block as any).text)
    .join('');

  // Parse JSON response
  const toneAnalysis = JSON.parse(responseText) as ToneAnalysisResult;

  // Validate response structure
  if (!toneAnalysis.tone || toneAnalysis.score === undefined || !Array.isArray(toneAnalysis.flags)) {
    throw new Error('Invalid tone analysis response structure');
  }

  // Validate tone enum
  if (!['neutral', 'positive', 'negative', 'concerning'].includes(toneAnalysis.tone)) {
    throw new Error(`Invalid tone value: ${toneAnalysis.tone}`);
  }

  // Validate score is between 0 and 1
  if (typeof toneAnalysis.score !== 'number' || toneAnalysis.score < 0 || toneAnalysis.score > 1) {
    throw new Error(`Invalid score value: ${toneAnalysis.score}`);
  }

  return toneAnalysis;
}
