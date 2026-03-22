import React, { useState, useRef, useEffect } from 'react';
import { supabase } from './supabaseClient';
import {
  Compass,
  GraduationCap,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Sparkles,
  Eye,
  Check,
  Calendar,
  MessageCircle,
  Star,
  Building2,
  TrendingUp,
  RefreshCw,
  Quote,
  Download,
  Share2,
  Lightbulb,
  Wrench,
  BarChart2,
  Trophy,
  Heart,
  Mail
} from 'lucide-react';

// ── Profile constants ────────────────────────────────────────────
const BADGES = {
  first_quest:   { name: 'Πρώτη Αποστολή', emoji: '🌟', desc: 'Ολοκλήρωσες την πρώτη σου ανάλυση' },
  action_taker:  { name: 'Πρώτη Δράση',   emoji: '⚡', desc: 'Ολοκλήρωσες ένα βήμα δράσης' },
  plan_complete: { name: 'Πλήρες Πλάνο',  emoji: '✅', desc: 'Ολοκλήρωσες όλα τα βήματα δράσης' },
  rated:         { name: 'Κριτής',         emoji: '⭐', desc: 'Αξιολόγησες τα αποτελέσματά σου' },
  explorer:      { name: 'Εξερευνητής',    emoji: '🗺️', desc: 'Ολοκλήρωσες 2 αναλύσεις' },
  veteran:       { name: 'Βετεράνος',      emoji: '🏆', desc: 'Ολοκλήρωσες 3 αναλύσεις' },
};
const BADGE_ORDER = ['first_quest', 'action_taker', 'plan_complete', 'rated', 'explorer', 'veteran'];

const getLevel = (xp) => {
  if (xp >= 500) return { level: 4, name: 'Μάστερ',      nextXP: null, min: 500 };
  if (xp >= 250) return { level: 3, name: 'Στρατηγός',   nextXP: 500,  min: 250 };
  if (xp >= 100) return { level: 2, name: 'Εξερευνητής', nextXP: 250,  min: 100 };
  return           { level: 1, name: 'Αρχάριος',          nextXP: 100,  min: 0   };
};


// ── Persona config ──────────────────────────────────────────────
const personaConfig = {
  innovator: { icon: Lightbulb, gradient: 'from-cyan-500 to-blue-500', bg: 'from-cyan-500/15 to-blue-500/10', border: 'border-cyan-500/30', ring: 'ring-cyan-500/40' },
  builder:   { icon: Wrench,    gradient: 'from-green-500 to-emerald-500', bg: 'from-green-500/15 to-emerald-500/10', border: 'border-green-500/30', ring: 'ring-green-500/40' },
  analyst:   { icon: BarChart2, gradient: 'from-violet-500 to-purple-500', bg: 'from-violet-500/15 to-purple-500/10', border: 'border-violet-500/30', ring: 'ring-violet-500/40' },
  leader:    { icon: Trophy,    gradient: 'from-orange-500 to-amber-500', bg: 'from-orange-500/15 to-amber-500/10', border: 'border-orange-500/30', ring: 'ring-orange-500/40' },
  explorer:  { icon: Compass,   gradient: 'from-fuchsia-500 to-pink-500', bg: 'from-fuchsia-500/15 to-pink-500/10', border: 'border-fuchsia-500/30', ring: 'ring-fuchsia-500/40' },
  caregiver: { icon: Heart,     gradient: 'from-rose-500 to-red-500', bg: 'from-rose-500/15 to-red-500/10', border: 'border-rose-500/30', ring: 'ring-rose-500/40' },
};

// ── Parse persona & action steps from AI response ───────────────
const parseAIResponse = (text) => {
  let recommendations = text;
  let persona = null;
  let actionSteps = [];

  const personaMatch = text.match(/---PERSONA_START---([\s\S]*?)---PERSONA_END---/);
  if (personaMatch) {
    try { persona = JSON.parse(personaMatch[1].trim()); } catch {}
    recommendations = recommendations.replace(/---PERSONA_START---[\s\S]*?---PERSONA_END---/, '').trim();
  }

  const actionsMatch = text.match(/---ACTIONS_START---([\s\S]*?)---ACTIONS_END---/);
  if (actionsMatch) {
    try { actionSteps = JSON.parse(actionsMatch[1].trim()).steps || []; } catch {}
    recommendations = recommendations.replace(/---ACTIONS_START---[\s\S]*?---ACTIONS_END---/, '').trim();
  }

  return { recommendations, persona, actionSteps };
};

export default function EPythia() {
  const [step, setStep] = useState('welcome');
  const [userType, setUserType] = useState('');
  const [employeeSector, setEmployeeSector] = useState('');
  const [highschoolType, setHighschoolType] = useState('');
  const [formData, setFormData] = useState({});
  const [contactInfo, setContactInfo] = useState({ firstName: '', lastName: '', email: '' });
  const [recommendations, setRecommendations] = useState('');
  const [persona, setPersona] = useState(null);
  const [actionSteps, setActionSteps] = useState([]);
  const [checkedSteps, setCheckedSteps] = useState({});
  const [rating, setRating] = useState(0);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLeadPopup, setShowLeadPopup] = useState(false);
  const [leadSaved, setLeadSaved] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [flashOption, setFlashOption] = useState(null);
  const [profile, setProfile] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [xpToast, setXpToast] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Auth state
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const resultsRef = useRef(null);

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      setAuthUser(user);
      if (user) fetchProfile(user);
      else setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setAuthUser(user);
      if (user) fetchProfile(user);
      else { setProfile(null); setAuthLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Static data ────────────────────────────────────────────────

  const userTypes = [
    { id: 'highschool', title: 'Μαθητής', description: 'Ανακάλυψε ποιά σχολή σου ταιριάζει καλύτερα', icon: GraduationCap, gradient: 'from-cyan-500 to-blue-500' },
    { id: 'university', title: 'Φοιτητής', description: 'Βρες το ιδανικό μεταπτυχιακό ή επαγγελματικό ξεκίνημα', icon: Compass, gradient: 'from-violet-500 to-purple-500' },
    { id: 'employee', title: 'Επαγγελματίας', description: 'Εξερεύνησε το επόμενο βήμα της καριέρας σου', icon: Briefcase, gradient: 'from-fuchsia-500 to-pink-500' }
  ];

  const employeeSectors = [
    { id: 'public', title: 'Δημόσιος Τομέας', description: 'Δημόσια υπηρεσία, δημοτική, περιφερειακή διοίκηση, εκπαίδευση, υγεία', icon: Building2, gradient: 'from-blue-500 to-indigo-500' },
    { id: 'private', title: 'Ιδιωτικός Τομέας', description: 'Εταιρείες, startups, ΜΜΕ, επιχειρηματικές δραστηριότητες', icon: TrendingUp, gradient: 'from-orange-500 to-red-500' }
  ];

  const highschoolTypes = [
    { id: 'epal', title: 'ΕΠΑΛ', description: 'Εκπαίδευση με εργαστήρια, πρακτικές δεξιότητες και άμεση εργασιακή δυνατότητα', icon: Briefcase, gradient: 'from-green-500 to-emerald-500' },
    { id: 'general', title: 'Γενικό Λύκειο', description: 'Θετική/Τεχνολογική/Ανθρωπιστική κατεύθυνση για πανεπιστημιακές σπουδές', icon: GraduationCap, gradient: 'from-purple-500 to-pink-500' }
  ];

  const questions = {
    highschool_epal: [
      { id: 'workshop_interest', label: 'Ποιο εργαστήριο σε ενδιαφέρει περισσότερο;', type: 'select', options: ['Μηχανολογία', 'Ηλεκτρολογία', 'Πληροφορική/IT', 'Τουρισμός/Ξενοδοχείο', 'Οικοδομικά', 'Αυτοκινήτων', 'Κομμωτική/Αισθητικά', 'Ξυλουργική', 'Άλλο'] },
      { id: 'practical_learning', label: 'Προτιμάς να μαθαίνεις κάνοντας (χέρια);', type: 'select', options: ['Πολύ προτίμησή μου', 'Λίγο', 'Προτιμώ τη θεωρία'] },
      { id: 'manual_skills', label: 'Πόσο δεξιός είσαι στη χρήση εργαλείων/χεριών;', type: 'select', options: ['Πολύ δεξιός', 'Μέτρια', 'Δεν με ενδιαφέρει'] },
      { id: 'immediate_work', label: 'Σημαντικό για σένα να εργάσεις αμέσως μετά;', type: 'select', options: ['Πολύ σημαντικό', 'Ίσως και το πτυχίο', 'Μπορώ να περιμένω'] },
      { id: 'salary_motivation', label: 'Πόσο σημαντική είναι η ικανότητα να κερδίσεις σύντομα;', type: 'select', options: ['Πολύ σημαντική', 'Σημαντική', 'Δεν με απασχολεί'] },
      { id: 'international', label: 'Θα ήθελες να δουλέψεις στο εξωτερικό με τα credentials σου;', type: 'select', options: ['Ναι, απόλυτα', 'Ίσως', 'Όχι'] },
      { id: 'business_idea', label: 'Έχεις σκεφτεί να ξεκινήσεις δική σου δραστηριότητα;', type: 'select', options: ['Ναι, έχω ιδέα', 'Μπορεί κάποτε', 'Όχι'] },
      { id: 'further_studies', label: 'Θα ήθελες να κάνεις περαιτέρω σπουδές μετά το ΕΠΑΛ;', type: 'select', options: ['Ναι, ΑΕΙ/ΤΕΙ', 'Μήπως ειδικότητα', 'Όχι, θέλω να δουλέψω'] },
      { id: 'personality_work', label: 'Πώς θα περιέγραφες τον εαυτό σου στο χώρο εργασίας;', type: 'select', options: ['Ανεξάρτητος', 'Συνεργατικός', 'Αρχηγικός', 'Λεπτομερής'] },
      { id: 'continuous_learning', label: 'Προθυμία να ενημερώνεσαι με νέες τεχνολογίες;', type: 'select', options: ['Πολύ ενδιαφέρον', 'Ίσως', 'Δεν με απασχολεί'] },
      { id: 'team_preference', label: 'Προτιμάς μικρές ή μεγάλες ομάδες εργασίας;', type: 'select', options: ['Μικρές και άμεσες', 'Δε με νοιάζει', 'Μεγάλες δομημένες'] },
      { id: 'job_satisfaction', label: 'Τι σε κάνει ικανοποιημένο σε μια δουλειά;', type: 'select', options: ['Αποτέλεσμα που φαίνεται', 'Καλή αμοιβή', 'Σταθερότητα', 'Δημιουργικότητα'] },
      { id: 'challenges', label: 'Πώς αντιμετωπίζεις τα προβλήματα;', type: 'select', options: ['Με πρακτική σκέψη', 'Ζητώ βοήθεια', 'Αποφεύγω το πρόβλημα'] },
      { id: 'specialization_plan', label: 'Έχεις ήδη σκεφτεί ποια ειδικότητα ΕΠΑΛ σε ενδιαφέρει;', type: 'text', placeholder: 'π.χ. Μηχανολογία, Ηλεκτρολογία, κλπ' },
      { id: 'vision_35', label: 'Πες με δικά σου λόγια πώς φαντάζεσαι τον εαυτό σου στα 35.', type: 'textarea', placeholder: 'Γράψε τη δική σου απάντηση...' }
    ],
    highschool_general: [
      { id: 'subject', label: 'Ποιο μάθημα σου αρέσει περισσότερο;', type: 'select', options: ['Μαθηματικά', 'Φυσική', 'Χημεία/Βιολογία', 'Προγραμματισμός', 'Μαθήματα Οικονομικών & Διοίκησης', 'Τέχνη/Γραφιστικά', 'Ιστορία/Γλώσσες', 'Κοινωνικά/Ανθρωπιστικά', 'Φυσική Αγωγή'] },
      { id: 'learning', label: 'Πώς προτιμάς να μαθαίνεις;', type: 'select', options: ['Μέσα από θεωρία', 'Μέσα από πράξη', 'Συνδυαστικά'] },
      { id: 'freetime', label: 'Όταν έχεις ελεύθερο χρόνο, τι κάνεις πιο συχνά;', type: 'select', options: ['Παίζω/χακάρω στον υπολογιστή', 'Ζωγραφίζω/φτιάχνω βίντεο', 'Διαβάζω/ψάχνω για ιδέες', 'Κάνω Αθλήματα', 'Είμαι με κόσμο'] },
      { id: 'success', label: 'Τι σε κάνει να αισθάνεσαι πετυχημένος;', type: 'select', options: ['Όταν τα καταφέρνω στα δύσκολα προβλήματα', 'Όταν βοηθάω άλλους', 'Όταν με αναγνωρίζουν', 'Όταν μαθαίνω κάτι καινούριο'] },
      { id: 'adaptation', label: 'Πόσο εύκολα προσαρμόζεσαι σε νέα πράγματα;', type: 'select', options: ['Πολύ εύκολα', 'Ανάλογα τη περίσταση', 'Δύσκολα'] },
      { id: 'technology', label: 'Τι ρόλο έχει η τεχνολογία στη ζωή σου;', type: 'select', options: ['Κεντρικό', 'Βοηθητικό', 'Ελάχιστο'] },
      { id: 'environment', label: 'Σε ποιο περιβάλλον νιώθεις πιο άνετα;', type: 'select', options: ['Με σαφείς κανόνες και ρουτίνα', 'Σε ανοιχτό, δημιουργικό χώρο'] },
      { id: 'people', label: 'Πόσο σε ενδιαφέρει να δουλέψεις με ανθρώπους;', type: 'select', options: ['Πολύ', 'Λίγο', 'Ελάχιστα'] },
      { id: 'abroad', label: 'Θα ήθελες να σπουδάσεις στο εξωτερικό;', type: 'select', options: ['Ναι', 'Ίσως', 'Όχι'] },
      { id: 'fear', label: 'Τι φοβάσαι περισσότερο για το μέλλον σου;', type: 'select', options: ['Να μην πετύχω', 'Να μην ξέρω τι θέλω', 'Να μην έχω λεφτά', 'Να βαριέμαι'] },
      { id: 'organized', label: 'Πόσο οργανωμένος είσαι στην καθημερινότητα;', type: 'select', options: ['Πολύ', 'Μέτρια', 'Καθόλου'] },
      { id: 'public_speaking', label: 'Πώς νιώθεις όταν πρέπει να μιλήσεις μπροστά σε άλλους;', type: 'select', options: ['Μου αρέσει', 'Δεν με ενοχλεί', 'Το αποφεύγω'] },
      { id: 'direction', label: 'Ποια κατεύθυνση σε ενδιαφέρει περισσότερο;', type: 'select', options: ['Θετική (Math, Physics, Biology)', 'Τεχνολογική (Tech/Engineering)', 'Οικονομική (Business/Economics)', 'Ανθρωπιστική (Humanities/Social)'] },
      { id: 'motivation', label: 'Τι θα σε έκανε να ξυπνάς με ενθουσιασμό κάθε μέρα;', type: 'select', options: ['Δημιουργία', 'Αναγνώριση', 'Εξερεύνηση', 'Σταθερότητα'] },
      { id: 'future_vision', label: 'Πες με δικά σου λόγια πώς φαντάζεσαι τον εαυτό σου στα 25.', type: 'textarea', placeholder: 'Γράψε τη δική σου απάντηση...' }
    ],
    university: [
      { id: 'subject', label: 'Ποιο είναι το αντικείμενο σπουδών σου;', type: 'text', placeholder: 'π.χ. Πληροφορική, Business, Ιατρικά...' },
      { id: 'stage', label: 'Σε ποιο στάδιο βρίσκεσαι;', type: 'select', options: ['Πρώτα έτη', 'Μέση πορεία', 'Τελειόφοιτος/Μεταπτυχιακός'] },
      { id: 'degree_feeling', label: 'Πώς νιώθεις για το πτυχίο σου;', type: 'select', options: ['Ενθουσιασμένος', 'Ουδέτερος', 'Δεν με εκφράζει πια'] },
      { id: 'priority', label: 'Ποιο από τα παρακάτω σου φαίνεται πιο σημαντικό;', type: 'select', options: ['Επαγγελματική σταθερότητα', 'Ευκαιρίες εξέλιξης', 'Δημιουργικότητα', 'Ελευθερία'] },
      { id: 'experience', label: 'Έχεις ήδη επαγγελματική εμπειρία;', type: 'select', options: ['Ναι', 'Όχι'] },
      { id: 'motivation', label: 'Τι σε κινητοποιεί περισσότερο να δουλέψεις;', type: 'select', options: ['Πρόκληση', 'Αναγνώριση', 'Επίδραση', 'Οικονομική άνεση'] },
      { id: 'work_style', label: 'Πώς προτιμάς να δουλεύεις;', type: 'select', options: ['Σε δομημένο αυστηρό περιβάλλον', 'Σε startup φάση', 'Ως freelancer'] },
      { id: 'field', label: 'Ποιο πεδίο σε τραβάει περισσότερο τώρα;', type: 'select', options: ['Τεχνολογία/Data', 'Marketing/Επικοινωνία', 'Business/Finance', 'Έρευνα/Research', 'Πωλήσεις/Εξυπηρέτηση', 'Δημόσιος τομέας/ΜΚΟ'] },
      { id: 'asset', label: 'Ποιο είναι το βασικό σου asset;', type: 'select', options: ['Αναλυτική σκέψη', 'Δημιουργικότητα', 'Οργάνωση', 'Διαπροσωπική επικοινωνία'] },
      { id: 'presentation', label: 'Πόσο άνετα νιώθεις να παρουσιάζεις ή να δικτυώνεσαι;', type: 'select', options: ['Πολύ', 'Μέτρια', 'Ελάχιστα'] },
      { id: 'risk', label: 'Πώς θα περιέγραφες το ρίσκο;', type: 'select', options: ['Ευκαιρία', 'Άγχος', 'Εξαρτάται από το πλαίσιο'] },
      { id: 'masters', label: 'Θα σε ενδιέφερε μεταπτυχιακό;', type: 'select', options: ['Ναι, σίγουρα', 'Ίσως', 'Όχι τώρα'] },
      { id: 'location', label: 'Σε ενδιαφέρει να μείνεις Ελλάδα ή να πας εξωτερικό;', type: 'select', options: ['Ελλάδα', 'Εξωτερικό', 'Δεν έχω αποφασίσει'] },
      { id: 'clarity', label: 'Πόσο ξεκάθαρο έχεις τι θέλεις να κάνεις μετά;', type: 'select', options: ['Πολύ', 'Κάπως', 'Καθόλου'] },
      { id: 'opportunity', label: 'Αν είχες ευκαιρία να δοκιμάσεις κάτι για 6 μήνες χωρίς ρίσκο, τι θα ήταν;', type: 'textarea', placeholder: 'Γράψε τη δική σου απάντηση...' }
    ],
    employee_public: [
      { id: 'experience', label: 'Πόσα χρόνια εμπειρίας έχεις στο δημόσιο;', type: 'select', options: ['0-2 χρόνια', '3-5 χρόνια', '6-10 χρόνια', '10+ χρόνια'] },
      { id: 'position', label: 'Ποια είναι η τρέχουσα θέση σου;', type: 'text', placeholder: 'π.χ. Λειτουργός, Μηχανικός, Εκπαιδευτικός...' },
      { id: 'department', label: 'Σε ποιον τομέα του δημόσιου δραστηριοποιείσαι;', type: 'select', options: ['Εκπαίδευση', 'Υγεία', 'Τοπική Αυτοδιοίκηση', 'Κεντρική Διοίκηση', 'Δικαιοσύνη', 'Άλλο'] },
      { id: 'satisfaction', label: 'Πόσο ικανοποιημένος είσαι από τη θέση σου;', type: 'select', options: ['Πολύ', 'Μέτρια', 'Καθόλου'] },
      { id: 'change_reason', label: 'Τι σε ωθεί να σκεφτείς αλλαγή;', type: 'select', options: ['Γραφειοκρατία & κανονισμοί', 'Χαμηλές απολαβές', 'Μικρή εξέλιξη', 'Νέες προκλήσεις', 'Δε σε απασχολεί ακόμη'] },
      { id: 'stability_value', label: 'Πόσο σημαντική είναι η σταθερότητα για σένα;', type: 'select', options: ['Πολύ', 'Αρκετά', 'Λίγο'] },
      { id: 'work_life_balance', label: 'Πώς βλέπεις την ισορροπία ζωής–δουλειάς;', type: 'select', options: ['Πρωτεύουσα', 'Ισορροπημένη', 'Δευτερεύουσα'] },
      { id: 'learning', label: 'Θέλεις να αποκτήσεις νέες δεξιότητες;', type: 'select', options: ['Ναι, σίγουρα', 'Ίσως', 'Όχι'] },
      { id: 'move_direction', label: 'Θα σε ενδιέφερε μετακίνηση σε άλλο τμήμα;', type: 'select', options: ['Μέσα στο ίδιο φορέα', 'Σε άλλο δημόσιο φορέα', 'Όχι, προτιμώ ιδιωτικό'] },
      { id: 'public_impact', label: 'Πόσο σημαντικό για σένα είναι το κοινωφελές;', type: 'select', options: ['Πολύ σημαντικό', 'Κάπως σημαντικό', 'Δεν με απασχολεί'] },
      { id: 'private_consideration', label: 'Έχεις σκεφτεί ποτέ να πας στον ιδιωτικό τομέα;', type: 'select', options: ['Ναι, σοβαρά', 'Ίσως', 'Όχι, θέλω δημόσιο'] },
      { id: 'skills_gap', label: 'Τι δεξιότητες σου λείπουν;', type: 'select', options: ['Digital/IT', 'Leadership', 'Foreign languages', 'Project management', 'Άλλο'] },
      { id: 'future_role', label: 'Τι ρόλο φαντάζεσαι στο μέλλον;', type: 'select', options: ['Ανέλιξη στο δημόσιο', 'Αλλαγή τομέα', 'Ίδια δραστηριότητα', 'Freelancing/Consulting'] },
      { id: 'pension_concerns', label: 'Πόσο σε ανησυχεί η συνταξιοδότηση;', type: 'select', options: ['Πολύ', 'Μέτρια', 'Δεν με απασχολεί'] },
      { id: 'ideal_scenario', label: 'Περιέγραψε το ιδανικό "επόμενο κεφάλαιο" σου.', type: 'textarea', placeholder: 'Γράψε τη δική σου απάντηση...' }
    ],
    employee_private: [
      { id: 'experience', label: 'Πόσα χρόνια εμπειρίας έχεις στον ιδιωτικό τομέα;', type: 'select', options: ['0-2 χρόνια', '3-5 χρόνια', '6-10 χρόνια', '10+ χρόνια'] },
      { id: 'industry', label: 'Σε ποιον κλάδο δραστηριοποιείσαι;', type: 'select', options: ['Τεχνολογία/IT', 'Τραπεζική/Finance', 'Marketing/Διαφήμιση', 'Πωλήσεις', 'Σύμβουλος/Consulting', 'Κατασκευή', 'E-commerce', 'Άλλο'] },
      { id: 'company_size', label: 'Σε ποιου μεγέθους εταιρεία δουλεύεις;', type: 'select', options: ['Startup (0-50)', 'SME (50-250)', 'Mid-size (250-1000)', 'Large corporation (1000+)'] },
      { id: 'satisfaction', label: 'Πόσο ικανοποιημένος είσαι από τη δουλειά σου;', type: 'select', options: ['Πολύ', 'Μέτρια', 'Καθόλου'] },
      { id: 'change_reason', label: 'Τι σε ωθεί να σκεφτείς αλλαγή;', type: 'select', options: ['Burnout', 'Χαμηλές απολαβές', 'Κακή κουλτούρα', 'Μικρή εξέλιξη', 'Νέο ενδιαφέρον', 'Δε σε απασχολεί'] },
      { id: 'fulfillment', label: 'Ποιο στοιχείο της δουλειάς σε γεμίζει ακόμα;', type: 'select', options: ['Η ομάδα', 'Η πρόκληση', 'Η αμοιβή', 'Η ευθύνη', 'Κανένα'] },
      { id: 'next_step', label: 'Τι θα ήθελες να κάνεις μετά;', type: 'select', options: ['Ίδια ρόλο αλλά άλλη εταιρεία', 'Νέα ρόλο στην ίδια εταιρεία', 'Αλλαγή κλάδου', 'Freelancer/Self-employed', 'Δημόσιος τομέας'] },
      { id: 'salary_expectation', label: 'Ποια είναι η προτεραιότητα σου για τον μισθό;', type: 'select', options: ['Αύξηση', 'Ισορροπία με άλλα', 'Δεν είναι πρωτεύουσα'] },
      { id: 'work_life_balance', label: 'Πώς αισθάνεσαι για την εργασία από το σπίτι;', type: 'select', options: ['Προτιμώ remote', 'Hybrid είναι ιδανικό', 'Προτιμώ γραφείο'] },
      { id: 'skills_to_develop', label: 'Ποιες δεξιότητες θες να αναπτύξεις;', type: 'select', options: ['Leadership', 'AI/Machine Learning', 'Data Analytics', 'Soft skills', 'Άλλο'] },
      { id: 'risk_appetite', label: 'Πώς νιώθεις με τη στρατηγική του ρίσκου;', type: 'select', options: ['Αγοράζω τις προκλήσεις', 'Προσεκτικά', 'Αποφεύγω τον ρίσκο'] },
      { id: 'career_timeline', label: 'Πόσο επείγουσα είναι η αλλαγή;', type: 'select', options: ['Άμεσα', 'Στους επόμενους 6 μήνες', 'Στον επόμενο χρόνο', 'Δεν είμαι σίγουρος'] },
      { id: 'international', label: 'Θα σε ενδιέφερε θέση στο εξωτερικό;', type: 'select', options: ['Ναι, σίγουρα', 'Ίσως', 'Όχι'] },
      { id: 'entrepreneurship', label: 'Έχεις ποτέ σκεφτεί να ξεκινήσεις δική σου εταιρεία;', type: 'select', options: ['Ναι, σοβαρά', 'Ίσως κάποια στιγμή', 'Όχι'] },
      { id: 'vision', label: 'Ποια είναι η δική σου ιδανική σταδιοδρομία;', type: 'textarea', placeholder: 'Γράψε τη δική σου απάντηση...' }
    ]
  };

  const testimonials = [
    { text: 'Η e-Pythia με βοήθησε να επιλέξω Πληροφορική αντί για Οικονομικά. Η καλύτερη απόφαση της ζωής μου!', name: 'Νίκος Π.', role: 'Μαθητής, 17 ετών — Αθήνα', gradient: 'from-cyan-500 to-blue-500' },
    { text: 'Ήμουν stuck 2 χρόνια στο δημόσιο. Τώρα έχω σαφές σχέδιο για το επόμενο κεφάλαιό μου.', name: 'Μαρία Σ.', role: 'Δημόσιος υπάλληλος, 34 ετών — Θεσσαλονίκη', gradient: 'from-violet-500 to-fuchsia-500' },
    { text: 'Σαν να μίλησα με πραγματικό σύμβουλο καριέρας. Εντυπωσιακά εξατομικευμένο.', name: 'Γιώργος Α.', role: 'Φοιτητής, 26 ετών — Πάτρα', gradient: 'from-fuchsia-500 to-pink-500' },
  ];

  const stepLabels = ['Προφίλ', 'Ερωτήσεις', 'Στοιχεία', 'Αποτελέσματα'];

  // ── Derived ────────────────────────────────────────────────────

  const currentQuestions = userType === 'highschool'
    ? (highschoolType === 'epal' ? questions.highschool_epal : questions.highschool_general)
    : userType === 'employee'
    ? (employeeSector === 'public' ? questions.employee_public : questions.employee_private)
    : questions[userType];

  const activeQuestion = currentQuestions?.[currentQuestionIndex];
  const totalQuestions = currentQuestions?.length || 0;
  const wizardProgress = totalQuestions ? Math.round((currentQuestionIndex / totalQuestions) * 100) : 0;
  const checkedCount = Object.values(checkedSteps).filter(Boolean).length;
  const actionProgress = actionSteps.length ? Math.round((checkedCount / actionSteps.length) * 100) : 0;

  const getStepNumber = () => {
    if (step === 'welcome' || step === 'employee-sector-select' || step === 'highschool-type-select') return 1;
    if (step === 'questionnaire') return 2;
    if (step === 'contact') return 3;
    return 4;
  };

  // ── Profile fetch ──────────────────────────────────────────────

  const fetchProfile = async (user) => {
    const { data } = await supabase
      .from('profiles')
      .select('*, career_sessions(*)')
      .eq('id', user.id)
      .single();
    if (data) {
      setProfile({
        firstName: data.first_name,
        lastName: data.last_name,
        email: user.email,
        totalXP: data.total_xp,
        badges: data.badges || [],
        sessions: (data.career_sessions || []).map(s => ({
          id: s.id,
          date: s.date,
          userType: s.user_type,
          subType: s.sub_type,
          persona: s.persona,
          actionSteps: s.action_steps || [],
          checkedSteps: s.checked_steps || {},
          rating: s.rating,
          rated: s.rated,
        })),
      });
      setContactInfo({ firstName: data.first_name, lastName: data.last_name, email: user.email });
    }
    setAuthLoading(false);
  };

  // ── Auth handlers ──────────────────────────────────────────────

  const handleAuthFormChange = (field, value) => setAuthForm(p => ({ ...p, [field]: value }));

  const handleSignUp = async () => {
    setAuthSubmitting(true);
    setAuthError('');
    const { error } = await supabase.auth.signUp({
      email: authForm.email,
      password: authForm.password,
      options: { data: { first_name: authForm.firstName, last_name: authForm.lastName } },
    });
    if (error) setAuthError(error.message);
    else setAuthError('confirm');
    setAuthSubmitting(false);
  };

  const handleLogin = async () => {
    setAuthSubmitting(true);
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({
      email: authForm.email,
      password: authForm.password,
    });
    if (error) setAuthError(error.message);
    setAuthSubmitting(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAuthUser(null);
    setProfile(null);
    resetApp();
  };

  // ── Handlers ───────────────────────────────────────────────────

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setFormData({});
    setCurrentQuestionIndex(0);
    if (type === 'employee') setStep('employee-sector-select');
    else if (type === 'highschool') setStep('highschool-type-select');
    else setStep('questionnaire');
  };

  const handleEmployeeSectorSelect = (sector) => {
    setEmployeeSector(sector);
    setFormData({});
    setCurrentQuestionIndex(0);
    setStep('questionnaire');
  };

  const handleHighschoolTypeSelect = (type) => {
    setHighschoolType(type);
    setFormData({});
    setCurrentQuestionIndex(0);
    setStep('questionnaire');
  };

  const handleInputChange = (id, value) => setFormData((p) => ({ ...p, [id]: value }));
  const handleContactChange = (field, value) => setContactInfo((p) => ({ ...p, [field]: value }));

  const advanceQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((p) => p + 1);
    } else {
      if (authUser) handleSubmit();
      else setStep('contact');
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) { setCurrentQuestionIndex((p) => p - 1); return; }
    if (userType === 'employee') setStep('employee-sector-select');
    else if (userType === 'highschool') setStep('highschool-type-select');
    else setStep('welcome');
  };

  const handleOptionSelect = (id, value) => {
    setFlashOption(value);
    handleInputChange(id, value);
    setTimeout(() => { setFlashOption(null); advanceQuestion(); }, 280);
  };

  const toggleStep = async (idx) => {
    const next = { ...checkedSteps, [idx]: !checkedSteps[idx] };
    setCheckedSteps(next);

    if (!currentSessionId || !authUser) return;

    await supabase.from('career_sessions').update({ checked_steps: next }).eq('id', currentSessionId);

    const isNowChecked = !checkedSteps[idx];
    if (isNowChecked) {
      let gained = 15;
      const { data: prof } = await supabase.from('profiles').select('total_xp, badges').eq('id', authUser.id).single();
      const existingBadges = [...(prof?.badges || [])];
      const earned = [];

      if (!existingBadges.includes('action_taker')) { existingBadges.push('action_taker'); earned.push('action_taker'); }
      const allDone = actionSteps.every((_, i) => next[i]);
      if (allDone) {
        gained += 50;
        if (!existingBadges.includes('plan_complete')) { existingBadges.push('plan_complete'); earned.push('plan_complete'); }
      }

      const newXP = (prof?.total_xp || 0) + gained;
      await supabase.from('profiles').update({ total_xp: newXP, badges: existingBadges }).eq('id', authUser.id);
      await fetchProfile(authUser);

      setXpToast({ xp: gained, newBadges: earned });
      setTimeout(() => setXpToast(null), 3000);
    }
  };

  const retakeQuestionnaire = () => {
    setFormData({});
    setCurrentQuestionIndex(0);
    setRecommendations('');
    setPersona(null);
    setActionSteps([]);
    setCheckedSteps({});
    setRating(0);
    setLeadSaved(false);
    setCurrentSessionId(null);
    setEmailSent(false);
    setProfileSaved(false);
    setStep('questionnaire');
  };

  const resetApp = () => {
    setStep('welcome');
    setUserType('');
    setEmployeeSector('');
    setHighschoolType('');
    setFormData({});
    setContactInfo({ firstName: '', lastName: '', email: '' });
    setRecommendations('');
    setPersona(null);
    setActionSteps([]);
    setCheckedSteps({});
    setRating(0);
    setLeadSaved(false);
    setCurrentQuestionIndex(0);
    setFlashOption(null);
    setCurrentSessionId(null);
    setEmailSent(false);
    setProfileSaved(false);
    setXpToast(null);
    setAuthError('');
    setAuthForm({ email: '', password: '', firstName: '', lastName: '' });
  };

  const isContactComplete = () =>
    contactInfo.firstName.trim() && contactInfo.lastName.trim() && contactInfo.email.includes('@');

  const saveSessionToProfile = async (personaArg, steps, rat) => {
    if (!authUser) return;
    const sessionId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    setCurrentSessionId(sessionId);

    const { data: prof } = await supabase.from('profiles').select('total_xp, badges').eq('id', authUser.id).single();
    const { count: sessionCount } = await supabase.from('career_sessions').select('*', { count: 'exact', head: true }).eq('user_id', authUser.id);

    const cnt = (sessionCount || 0) + 1;
    let gained = cnt === 1 ? 50 : cnt === 2 ? 75 : 100;
    const existingBadges = [...(prof?.badges || [])];
    const earned = [];

    if (cnt === 1 && !existingBadges.includes('first_quest')) { existingBadges.push('first_quest'); earned.push('first_quest'); }
    if (cnt === 2 && !existingBadges.includes('explorer'))    { existingBadges.push('explorer');   earned.push('explorer'); }
    if (cnt >= 3  && !existingBadges.includes('veteran'))     { existingBadges.push('veteran');    earned.push('veteran'); }

    await supabase.from('career_sessions').insert({
      id: sessionId,
      user_id: authUser.id,
      user_type: userType,
      sub_type: highschoolType || employeeSector || '',
      persona: personaArg,
      action_steps: steps,
      checked_steps: {},
      rating: rat,
      rated: false,
    });

    const newXP = (prof?.total_xp || 0) + gained;
    await supabase.from('profiles').update({ total_xp: newXP, badges: existingBadges }).eq('id', authUser.id);
    await fetchProfile(authUser);

    setXpToast({ xp: gained, newBadges: earned });
    setTimeout(() => setXpToast(null), 4000);
  };

  const handleRating = async (stars) => {
    setRating(stars);
    if (!currentSessionId || stars === 0 || !authUser) return;

    const { data: sess } = await supabase.from('career_sessions').select('rated').eq('id', currentSessionId).single();
    if (sess?.rated) return;

    await supabase.from('career_sessions').update({ rating: stars, rated: true }).eq('id', currentSessionId);

    const { data: prof } = await supabase.from('profiles').select('total_xp, badges').eq('id', authUser.id).single();
    const existingBadges = [...(prof?.badges || [])];
    const earned = [];
    if (!existingBadges.includes('rated')) { existingBadges.push('rated'); earned.push('rated'); }

    const newXP = (prof?.total_xp || 0) + 10;
    await supabase.from('profiles').update({ total_xp: newXP, badges: existingBadges }).eq('id', authUser.id);
    await fetchProfile(authUser);

    setXpToast({ xp: 10, newBadges: earned });
    setTimeout(() => setXpToast(null), 3000);
  };

  const handleEmailResults = async () => {
    setEmailSending(true);
    try {
      const res = await fetch('/.netlify/functions/send-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: contactInfo.firstName,
          email: contactInfo.email,
          persona,
          recommendations,
          actionSteps,
        }),
      });
      if (res.ok) setEmailSent(true);
    } catch {}
    setEmailSending(false);
  };

  const handleCreateProfile = async () => {
    await saveSessionToProfile(persona, actionSteps, rating);
    setProfileSaved(true);
    setStep('profile');
  };

  const handleShare = async () => {
    const text = `Ανακάλυψα το καριερικό μου προφίλ στην e-Pythia!${persona ? ` Είμαι: ${persona.name} — ${persona.tagline}` : ''}\n\nΔοκίμασε κι εσύ: https://epythia.netlify.app`;
    try {
      await navigator.clipboard.writeText(text);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    } catch {}
  };

  const downloadPDF = () => {
    const html = `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <title>e-Pythia — ${contactInfo.firstName} ${contactInfo.lastName}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',Arial,sans-serif;color:#1e1b4b;background:#fff}
    .header{background:linear-gradient(135deg,#7c3aed,#06b6d4);color:#fff;padding:28px 40px}
    .header h1{font-size:28px;font-weight:800}
    .header p{font-size:13px;opacity:.85;margin-top:4px}
    .content{padding:36px 40px}
    .user-name{font-size:20px;font-weight:700;color:#4c1d95;margin-bottom:4px}
    .date{font-size:12px;color:#94a3b8;margin-bottom:28px}
    .persona-card{background:linear-gradient(135deg,#f5f3ff,#ede9fe);border-left:5px solid #7c3aed;border-radius:10px;padding:20px 24px;margin-bottom:32px}
    .persona-name{font-size:22px;font-weight:800;color:#5b21b6}
    .persona-tagline{font-size:13px;color:#6d28d9;margin-top:4px}
    .section-title{font-size:18px;font-weight:700;color:#5b21b6;border-bottom:2px solid #ede9fe;padding-bottom:8px;margin:28px 0 14px}
    .rec-h3{font-size:15px;font-weight:700;color:#4c1d95;margin:20px 0 8px}
    .rec-line{font-size:13px;line-height:1.8;color:#374151}
    .rec-bullet{font-size:13px;color:#374151;padding-left:16px;margin:4px 0;line-height:1.7}
    .action-plan{background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:20px 24px;margin-top:28px}
    .action-item{font-size:13px;color:#166534;padding:8px 0;border-bottom:1px solid #dcfce7;line-height:1.6}
    .action-item:last-child{border-bottom:none}
    .footer{margin-top:48px;padding:16px 40px;background:#f5f3ff;font-size:11px;color:#7c3aed;display:flex;justify-content:space-between}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style>
</head>
<body>
  <div class="header"><h1>e-Pythia</h1><p>AI Σύμβουλος Καριέρας</p></div>
  <div class="content">
    <div class="user-name">${contactInfo.firstName} ${contactInfo.lastName}</div>
    <div class="date">${new Date().toLocaleDateString('el-GR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
    ${persona ? `<div class="persona-card"><div class="persona-name">${persona.name}</div><div class="persona-tagline">${persona.tagline}</div></div>` : ''}
    <div class="section-title">Ο Χάρτης της Καριέρας σου</div>
    ${recommendations.split('\n').map(l => {
      if (l.startsWith('###')) return `<div class="rec-h3">${l.replace(/^###\s*/, '')}</div>`;
      if (l.startsWith('-')) return `<div class="rec-bullet">• ${l.replace(/^-\s*/, '')}</div>`;
      if (l.startsWith('**') && l.endsWith('**')) return `<div class="rec-line"><strong>${l.replace(/\*\*/g, '')}</strong></div>`;
      return l.trim() ? `<div class="rec-line">${l}</div>` : '<br>';
    }).join('')}
    ${actionSteps.length ? `<div class="action-plan"><div class="section-title" style="margin-top:0">Σχέδιο Δράσης</div>${actionSteps.map((s, i) => `<div class="action-item">${i + 1}. ${s}</div>`).join('')}</div>` : ''}
  </div>
  <div class="footer"><span>epythia.netlify.app • pythiacontact@gmail.com</span><span>Δημιουργήθηκε με e-Pythia AI</span></div>
  <script>window.onload=()=>window.print()</script>
</body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
  };

  // ── Prompt ─────────────────────────────────────────────────────

  const generatePrompt = () => {
    const typeLabels = {
      highschool_epal: 'μαθητής ΕΠΑΛ που σχεδιάζει την επαγγελματική του διαδρομή',
      highschool_general: 'μαθητής Γενικού Λυκείου που χρειάζεται καθοδήγηση για τη κατεύθυνση και τις σπουδές',
      university: 'φοιτητής που σχεδιάζει το επόμενο επαγγελματικό βήμα',
      employee_public: 'επαγγελματίας του δημόσιου τομέα που εξερευνά νέες ευκαιρίες ανέλιξης',
      employee_private: 'επαγγελματίας του ιδιωτικού τομέα που εξερευνά νέες ευκαιρίες ανέλιξης'
    };
    let key = userType;
    if (userType === 'highschool') key = `highschool_${highschoolType}`;
    else if (userType === 'employee') key = `employee_${employeeSector}`;

    let p = `Είσαι η e-Pythia, ένας έμπειρος σύμβουλος καριέρας. Ένας/μια ${typeLabels[key]} χρειάζεται καθοδήγηση.\n\nΠροφίλ:\n`;
    currentQuestions.forEach((q) => { p += `- ${q.label}: ${formData[q.id] || 'Δεν δόθηκε'}\n`; });

    if (userType === 'highschool' && highschoolType === 'epal') {
      p += `\n1. 1-2 ειδικότητες ΕΠΑΛ (pros/cons, προοπτικές)\n2. Εναλλακτικές\n3. Δεξιότητες\n4. Επόμενα βήματα\nΕλληνική αγορά εργασίας.`;
    } else if (userType === 'highschool' && highschoolType === 'general') {
      p += `\n1. 1-2 κατευθύνσεις/σπουδές (pros/cons)\n2. Εναλλακτικές σχολές\n3. Δεξιότητες\n4. Επόμενα βήματα\nΟνόματα σχολών ΑΕΙ/ΤΕΙ.`;
    } else if (userType === 'university') {
      p += `\n1. Θέσεις/μεταπτυχιακά\n2. Κλάδοι\n3. Βήματα μετάβασης\n4. Δεξιότητες`;
    } else if (userType === 'employee' && employeeSector === 'public') {
      p += `\n1. Επόμενα βήματα/εναλλακτικές\n2. Αξιοποίηση εμπειρίας\n3. Δεξιότητες\n4. Σχέδιο 6-12 μηνών`;
    } else {
      p += `\n1. Επόμενα βήματα\n2. Αξιοποίηση εμπειρίας\n3. Δεξιότητες\n4. Σχέδιο 6-12 μηνών`;
    }

    p += `

Markdown με sections:
### 1. Κορυφαίες επιλογές
### 2. Εναλλακτικές διαδρομές
### 3. Δεξιότητες που πρέπει να αναπτύξει
### 4. Επόμενα βήματα

Χωρίς χαιρετισμούς. Ξεκίνα από το πρώτο section.

Μετά τις συστάσεις πρόσθεσε ΑΚΡΙΒΩΣ (valid JSON, χωρίς code fences):

---PERSONA_START---
{"name":"[GREEK_NAME]","tagline":"[ONE_LINE_GREEK]","type":"[innovator|builder|analyst|leader|explorer|caregiver]"}
---PERSONA_END---

---ACTIONS_START---
{"steps":["[ACTION_1_GREEK]","[ACTION_2]","[ACTION_3]","[ACTION_4]","[ACTION_5]"]}
---ACTIONS_END---

Personas: innovator="Ο Καινοτόμος", builder="Ο Δημιουργός", analyst="Ο Αναλυτής", leader="Ο Ηγέτης", explorer="Ο Εξερευνητής", caregiver="Ο Φροντιστής".
Steps: συγκεκριμένα, εξατομικευμένα, ρήματα δράσης.`;
    return p.trim();
  };

  // ── Submit ─────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setLoading(true);
    setStep('results');
    try {
      const res = await fetch('/.netlify/functions/epythia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: generatePrompt() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRecommendations('Συγγνώμη, υπήρξε σφάλμα κατά την επεξεργασία του αιτήματός σου.');
        setLoading(false);
        return;
      }
      const parsed = parseAIResponse(data.message);
      setRecommendations(parsed.recommendations);
      setPersona(parsed.persona);
      setActionSteps(parsed.actionSteps);

      if (!leadSaved) {
        setLeadSaved(true);
        await fetch('/.netlify/functions/save-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstName: contactInfo.firstName, lastName: contactInfo.lastName, email: contactInfo.email, userType, sector: employeeSector || null, highschoolType: highschoolType || null, results: parsed.recommendations })
        }).catch(console.error);
        setShowLeadPopup(true);
        setTimeout(() => setShowLeadPopup(false), 4000);
      }
    } catch {
      setRecommendations('Συγγνώμη, υπήρξε σφάλμα. Παρακαλώ δοκίμασε ξανά.');
    } finally {
      setLoading(false);
    }
  };

  // ── Sub-components ─────────────────────────────────────────────

  const PersonaBadge = () => {
    if (!persona) return null;
    const cfg = personaConfig[persona.type] || personaConfig.explorer;
    const Icon = cfg.icon;
    return (
      <div className={`bg-gradient-to-br ${cfg.bg} rounded-2xl p-8 border ${cfg.border} backdrop-blur-sm animate-fade-in`}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shadow-lg flex-shrink-0 ring-4 ${cfg.ring}`}>
            <Icon className="w-10 h-10 text-white" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Το προφίλ σου</p>
            <h3 className={`text-3xl font-extrabold mb-2 bg-gradient-to-r ${cfg.gradient} bg-clip-text text-transparent`}>{persona.name}</h3>
            <p className="text-slate-300 text-base leading-relaxed max-w-lg">{persona.tagline}</p>
          </div>
        </div>
      </div>
    );
  };

  const ActionPlan = () => {
    if (!actionSteps.length) return null;
    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/20 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-100">Το Σχέδιο Δράσης σου</h3>
            <p className="text-slate-400 text-sm mt-1">Τσέκαρε τα βήματα καθώς τα ολοκληρώνεις</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-violet-400">{actionProgress}%</span>
            <p className="text-xs text-slate-500">{checkedCount}/{actionSteps.length} βήματα</p>
          </div>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-6">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500" style={{ width: `${actionProgress}%` }} />
        </div>
        <div className="space-y-3">
          {actionSteps.map((s, i) => (
            <button key={i} onClick={() => toggleStep(i)}
              className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-200 ${
                checkedSteps[i] ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-slate-700 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-800/60'
              }`}>
              <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-all ${checkedSteps[i] ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
                {checkedSteps[i] && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className={`text-sm leading-relaxed transition-all ${checkedSteps[i] ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                <span className="font-semibold text-violet-400 mr-2">Βήμα {i + 1}.</span>{s}
              </span>
            </button>
          ))}
        </div>
        {actionProgress === 100 && (
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 text-center animate-fade-in">
            <p className="text-emerald-300 font-bold">🎉 Συγχαρητήρια! Ολοκλήρωσες όλα τα βήματα!</p>
          </div>
        )}
      </div>
    );
  };

  const currentStepNum = getStepNumber();

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200">

      {/* Auth loading */}
      {authLoading && (
        <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Φόρτωση...</p>
          </div>
        </div>
      )}

      {/* ── AUTH PAGE ── (temporarily disabled) */}
      {false && !authUser && !authLoading && (
        <div className="min-h-screen flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-md animate-fade-in">
            <div className="text-center mb-10">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">e-Pythia</h1>
              <p className="text-slate-400">Ο 1ος AI Σύμβουλος Καριέρας στην Ελλάδα</p>
            </div>
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-800/30 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm shadow-2xl">
              <div className="flex rounded-xl bg-slate-900/60 p-1 mb-8">
                {[['login','Σύνδεση'],['signup','Εγγραφή']].map(([mode, label]) => (
                  <button key={mode} onClick={() => { setAuthMode(mode); setAuthError(''); }}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${authMode === mode ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="space-y-4">
                {authMode === 'signup' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Όνομα</label>
                      <input type="text" value={authForm.firstName} onChange={e => handleAuthFormChange('firstName', e.target.value)}
                        placeholder="Όνομα" autoComplete="given-name"
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 hover:border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none text-slate-200 text-sm transition-all placeholder-slate-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Επώνυμο</label>
                      <input type="text" value={authForm.lastName} onChange={e => handleAuthFormChange('lastName', e.target.value)}
                        placeholder="Επώνυμο" autoComplete="family-name"
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 hover:border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none text-slate-200 text-sm transition-all placeholder-slate-500" />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email</label>
                  <input type="email" value={authForm.email} onChange={e => handleAuthFormChange('email', e.target.value)}
                    placeholder="email@example.com" autoComplete="email"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 hover:border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none text-slate-200 text-sm transition-all placeholder-slate-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Κωδικός</label>
                  <input type="password" value={authForm.password} onChange={e => handleAuthFormChange('password', e.target.value)}
                    placeholder="Τουλάχιστον 6 χαρακτήρες"
                    autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                    onKeyDown={e => e.key === 'Enter' && (authMode === 'login' ? handleLogin() : handleSignUp())}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/50 border border-slate-700 hover:border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none text-slate-200 text-sm transition-all placeholder-slate-500" />
                </div>
                {authError && authError !== 'confirm' && (
                  <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm">{authError}</div>
                )}
                {authError === 'confirm' && (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm">
                    ✓ Σου στείλαμε email επιβεβαίωσης. Έλεγξε τα εισερχόμενα!
                  </div>
                )}
                <button
                  onClick={authMode === 'login' ? handleLogin : handleSignUp}
                  disabled={authSubmitting || !authForm.email || !authForm.password || (authMode === 'signup' && (!authForm.firstName || !authForm.lastName))}
                  className={`w-full py-3.5 rounded-xl font-bold text-white transition-all duration-300 mt-2 ${
                    authSubmitting || !authForm.email || !authForm.password || (authMode === 'signup' && (!authForm.firstName || !authForm.lastName))
                      ? 'bg-slate-700 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 hover:opacity-90 hover:shadow-lg hover:shadow-violet-500/40'
                  }`}>
                  {authSubmitting ? 'Παρακαλώ περίμενε...' : authMode === 'login' ? 'Σύνδεση →' : 'Δημιουργία Λογαριασμού →'}
                </button>
              </div>
            </div>
            <p className="text-center text-xs text-slate-600 mt-6">Τα δεδομένα σου προστατεύονται και δεν μοιράζονται σε τρίτους.</p>
          </div>
        </div>
      )}

      {/* ── MAIN APP ── */}
      {true && (
      <div>

      {showLeadPopup && (
        <div className="fixed inset-0 flex items-end justify-center p-4 z-50 pointer-events-none">
          <div className="animate-bounce bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl px-8 py-4 shadow-2xl mb-6 pointer-events-auto">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-bold text-white">Ευχαριστούμε!</p>
                <p className="text-sm text-white/90">Τα δεδομένα σου αποθηκεύτηκαν με επιτυχία</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* XP Toast */}
      {xpToast && (
        <div className="fixed top-24 right-4 z-50 animate-slide-in-right">
          <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl px-6 py-4 shadow-2xl shadow-violet-500/30 border border-violet-400/30">
            <p className="text-white font-bold text-lg">+{xpToast.xp} XP 🎉</p>
            {xpToast.newBadges.length > 0 && (
              <p className="text-violet-200 text-sm mt-1">
                Νέο badge: {xpToast.newBadges.map(b => `${BADGES[b].emoji} ${BADGES[b].name}`).join(', ')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 bg-slate-900/70 border-b border-slate-700/30 backdrop-blur-2xl z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative">
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-cyan-400 via-violet-400 to-fuchsia-400 p-0.5 shadow-lg shadow-violet-500/20">
                <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-gradient-to-br from-violet-400 to-fuchsia-400 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">e-Pythia</h1>
              <p className="text-xs text-slate-500">Ο Σύμβουλός σου Καριέρας</p>
            </div>
          </div>

          {step !== 'welcome' && (
            <div className="hidden sm:flex items-center gap-1">
              {stepLabels.map((label, idx) => {
                const num = idx + 1;
                const isActive = num === currentStepNum;
                const isDone = num < currentStepNum;
                return (
                  <div key={label} className="flex items-center gap-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        isDone ? 'bg-gradient-to-br from-cyan-500 to-violet-500 text-white'
                        : isActive ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white ring-2 ring-violet-400/50'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}>
                        {isDone ? <Check className="w-3.5 h-3.5" /> : num}
                      </div>
                      <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'text-violet-400' : isDone ? 'text-slate-400' : 'text-slate-600'}`}>{label}</span>
                    </div>
                    {idx < stepLabels.length - 1 && (
                      <div className={`w-6 h-px mb-4 transition-all ${isDone ? 'bg-violet-500' : 'bg-slate-700'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-2 flex-shrink-0">
            {profile && step !== 'profile' && (
              <button onClick={() => setStep('profile')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/40 hover:border-violet-400 transition duration-200 text-sm font-medium text-violet-300">
                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold">
                  {profile.firstName.charAt(0)}
                </span>
                <span className="hidden sm:inline">{profile.firstName}</span>
              </button>
            )}
            {step !== 'welcome' && (
              <button onClick={resetApp} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition duration-200 text-sm font-medium">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Αρχή</span>
              </button>
            )}
            <button onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-red-900/30 border border-slate-700 hover:border-red-500/40 transition duration-200 text-sm text-slate-400 hover:text-red-300">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Έξοδος</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* ── WELCOME ── */}
        {step === 'welcome' && (
          <div className="animate-fade-in">
            <div className="text-center mb-16">
              <div className="flex justify-center mb-6"><Sparkles className="w-6 h-6 text-violet-400 animate-bounce" /></div>
              <h2 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent leading-tight">e-Pythia</h2>
              <p className="text-xl md:text-2xl text-slate-300 mb-2 font-light">Ο 1ος AI Σύμβουλος Καριέρας στην Ελλάδα</p>
              <p className="text-slate-400 max-w-2xl mx-auto mb-12">Λάβε άμεσες και πρακτικές συμβουλές καριέρας με τη δύναμη του AI</p>
            </div>

            <div className="max-w-6xl mx-auto mb-20">
              <p className="text-center mb-6 text-lg bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent font-semibold">Διάλεξε τη κατηγορία που ανήκεις</p>
              <div className="flex justify-center mb-8 animate-bounce"><ChevronRight className="w-8 h-8 text-violet-400 rotate-90" /></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {userTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button key={type.id} onClick={() => handleUserTypeSelect(type.id)}
                      className="group relative bg-gradient-to-br from-slate-800/50 to-slate-800/20 backdrop-blur-sm rounded-3xl p-12 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-2">
                      <div className="relative z-10 flex flex-col items-center text-center">
                        <h3 className="text-2xl font-bold mb-6">Είσαι {type.title};</h3>
                        <p className="text-slate-400 text-base mb-6">{type.description}</p>
                        <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${type.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                          <Icon className="w-12 h-12 text-white" />
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight className="w-6 h-6 text-violet-400" /></div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Testimonials */}
            <div className="max-w-6xl mx-auto mb-20">
              <p className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest mb-8">Τι λένε οι χρήστες μας</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map((t, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-slate-800/40 to-slate-800/10 rounded-2xl p-6 border border-slate-700/40 backdrop-blur-sm">
                    <Quote className="w-5 h-5 text-violet-400/60 mb-3" />
                    <p className="text-slate-300 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{t.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{t.name}</p>
                        <p className="text-xs text-slate-500">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coach Card */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="text-center mb-8">
                <p className="text-lg bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent font-semibold mb-4">Θες καθοδήγηση από εξειδικευμένο σύμβουλο καριέρας; Είσαι μόνο ένα click μακριά</p>
                <div className="flex justify-center animate-bounce"><ChevronRight className="w-8 h-8 text-violet-400 rotate-90" /></div>
              </div>
            </div>
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-800/50 to-slate-800/20 rounded-2xl p-10 border border-slate-700/50 backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <div className="flex justify-center md:justify-start">
                  <div className="relative">
                    <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-cyan-400 via-violet-400 to-fuchsia-400 p-1 shadow-xl shadow-violet-500/30 flex items-center justify-center">
                      <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center">
                        <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                          <circle cx="50" cy="30" r="15" fill="#a78bfa"/>
                          <rect x="35" y="45" width="30" height="35" rx="5" fill="#818cf8"/>
                          <rect x="20" y="50" width="15" height="8" rx="4" fill="#a78bfa"/>
                          <rect x="65" y="50" width="15" height="8" rx="4" fill="#a78bfa"/>
                          <polygon points="50,45 47,52 53,52" fill="#06b6d4"/>
                        </svg>
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-lg px-3 py-1 text-xs font-bold text-white shadow-lg flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />Εξειδικευμένος
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-2xl font-bold mb-3">Θα σου Βρούμε τον Ιδανικό Σύμβουλό</h3>
                  <p className="text-slate-300 mb-4">Μετά την ανάλυση AI, θα σε συνδέσουμε με έναν <span className="font-semibold">εξειδικευμένο σύμβουλο καριέρας</span> που έχει ήδη ζήσει το ίδιο path.</p>
                  <div className="space-y-3 mb-6">
                    {['Πραγματική εμπειρία στον κλάδο που σε ενδιαφέρει','Ήδη έχει κάνει τη μετάβαση που εσύ σκέφτεσαι','Θα σου δώσει πρακτικές και εφαρμόσιμες συμβουλές'].map(item => (
                      <div key={item} className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" /><span className="text-sm text-slate-300">{item}</span></div>
                    ))}
                  </div>
                  <div className="mb-6 inline-block bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/50 rounded-lg px-4 py-2">
                    <p className="text-sm font-bold text-emerald-300">✨ Η πρώτη αναγνωριστική συνεδρία είναι ΔΩΡΕΑΝ</p>
                  </div>
                  <div className="flex justify-center">
                    <a href="https://calendly.com/pythiacontact/1-coaching-pythia-ai" target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 text-white font-bold hover:opacity-90 transition-all duration-300 shadow-lg hover:scale-105">
                      <Calendar className="w-5 h-5" />Κλείσε Δωρεάν Συνεδρία<ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-700">
                {[{v:'50+',l:'Εξειδικευμένοι Σύμβουλοι',c:'text-cyan-400'},{v:'95%',l:'Ικανοποιημένοι Χρήστες',c:'text-violet-400'},{v:'10+',l:'Χρόνια Εμπειρίας',c:'text-fuchsia-400'}].map(({v,l,c})=>(
                  <div key={l} className="text-center"><div className={`text-2xl font-bold ${c} mb-1`}>{v}</div><div className="text-xs text-slate-400">{l}</div></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── HIGHSCHOOL TYPE ── */}
        {step === 'highschool-type-select' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="text-center mb-12"><h2 className="text-4xl font-bold mb-4">Σε ποιο σχολείο πας;</h2><p className="text-slate-400">Διάλεξε για να λάβεις προσαρμοσμένες ερωτήσεις</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {highschoolTypes.map((t) => { const Icon = t.icon; return (
                <button key={t.id} onClick={() => handleHighschoolTypeSelect(t.id)}
                  className="group bg-gradient-to-br from-slate-800/50 to-slate-800/20 backdrop-blur-sm rounded-3xl p-12 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-2">
                  <div className="flex flex-col items-center text-center">
                    <h3 className="text-2xl font-bold mb-3">{t.title}</h3>
                    <p className="text-slate-400 text-sm mb-6">{t.description}</p>
                    <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${t.gradient} flex items-center justify-center mb-6 shadow-lg`}><Icon className="w-12 h-12 text-white" /></div>
                    <ChevronRight className="w-6 h-6 text-violet-400" />
                  </div>
                </button>
              ); })}
            </div>
          </div>
        )}

        {/* ── EMPLOYEE SECTOR ── */}
        {step === 'employee-sector-select' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="text-center mb-12"><h2 className="text-4xl font-bold mb-4">Σε ποιον τομέα δραστηριοποιείσαι;</h2><p className="text-slate-400">Διάλεξε για να λάβεις προσαρμοσμένες ερωτήσεις</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {employeeSectors.map((s) => { const Icon = s.icon; return (
                <button key={s.id} onClick={() => handleEmployeeSectorSelect(s.id)}
                  className="group bg-gradient-to-br from-slate-800/50 to-slate-800/20 backdrop-blur-sm rounded-3xl p-12 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-2">
                  <div className="flex flex-col items-center text-center">
                    <h3 className="text-2xl font-bold mb-3">{s.title}</h3>
                    <p className="text-slate-400 text-sm mb-6">{s.description}</p>
                    <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-6 shadow-lg`}><Icon className="w-12 h-12 text-white" /></div>
                    <ChevronRight className="w-6 h-6 text-violet-400" />
                  </div>
                </button>
              ); })}
            </div>
          </div>
        )}

        {/* ── WIZARD ── */}
        {step === 'questionnaire' && activeQuestion && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="mb-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Ερώτηση <span className="text-violet-400 font-bold">{currentQuestionIndex + 1}</span> από {totalQuestions}</span>
                <span className="text-sm font-semibold text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full">{wizardProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 rounded-full transition-all duration-500" style={{ width: `${wizardProgress}%` }} />
              </div>
            </div>

            <div key={currentQuestionIndex} className="animate-slide-in">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/20 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
                <h2 className="text-2xl font-bold mb-8 text-slate-100 leading-snug">{activeQuestion.label}</h2>

                {activeQuestion.type === 'select' && (
                  <div className="space-y-3">
                    {activeQuestion.options.map((opt) => {
                      const isSel = formData[activeQuestion.id] === opt;
                      const isFlash = flashOption === opt;
                      return (
                        <button key={opt} onClick={() => handleOptionSelect(activeQuestion.id, opt)}
                          className={`w-full text-left px-5 py-4 rounded-xl border font-medium transition-all duration-200 ${
                            isFlash || isSel ? 'border-violet-500 bg-violet-500/20 text-white scale-[0.99]' : 'border-slate-700 bg-slate-900/40 text-slate-300 hover:border-slate-500 hover:bg-slate-800/60 hover:text-white'
                          }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${isFlash || isSel ? 'border-violet-400 bg-violet-500' : 'border-slate-600'}`}>
                              {(isFlash || isSel) && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            {opt}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {activeQuestion.type === 'text' && (
                  <input type="text" value={formData[activeQuestion.id] || ''} onChange={(e) => handleInputChange(activeQuestion.id, e.target.value)}
                    placeholder={activeQuestion.placeholder} autoFocus
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 hover:border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none text-slate-200 transition-all duration-200 placeholder-slate-500" />
                )}

                {activeQuestion.type === 'textarea' && (
                  <textarea value={formData[activeQuestion.id] || ''} onChange={(e) => handleInputChange(activeQuestion.id, e.target.value)}
                    placeholder={activeQuestion.placeholder} rows={5} autoFocus
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 hover:border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none text-slate-200 transition-all duration-200 placeholder-slate-500 resize-none" />
                )}
              </div>

              <div className="flex items-center justify-between mt-6">
                <button onClick={goToPrevQuestion} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all duration-200 text-sm font-medium text-slate-300">
                  <ChevronLeft className="w-4 h-4" />Πίσω
                </button>
                {activeQuestion.type !== 'select' && (
                  <button onClick={advanceQuestion} disabled={!formData[activeQuestion.id]?.trim()}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ${
                      formData[activeQuestion.id]?.trim()
                        ? 'bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 text-white hover:opacity-90 hover:shadow-lg hover:shadow-violet-500/40'
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                    }`}>
                    {currentQuestionIndex === totalQuestions - 1 ? 'Ολοκλήρωση' : 'Επόμενο'}<ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── CONTACT ── */}
        {step === 'contact' && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/20 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
              <h2 className="text-3xl font-bold mb-2">Σχεδόν Έτοιμο!</h2>
              <p className="text-slate-400 mb-8">Εισήγαγε τα στοιχεία σου για να λάβεις τη δική σου ανάλυση</p>
              <div className="space-y-6">
                {['firstName','lastName','email'].map(field => (
                  <div key={field}>
                    <label className="block text-base font-semibold mb-3 text-slate-100">
                      {field==='firstName'?'Όνομα':field==='lastName'?'Επώνυμο':'Email'}
                    </label>
                    <div className="relative">
                      <input type={field==='email'?'email':'text'} value={contactInfo[field]} onChange={(e)=>handleContactChange(field,e.target.value)}
                        placeholder={`Εισήγαγε το ${field==='firstName'?'όνομά σου':field==='lastName'?'επώνυμό σου':'email σου'}`}
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 hover:border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none text-slate-200 transition-all duration-200 placeholder-slate-500" />
                      {contactInfo[field] && <Check className="absolute right-4 top-3.5 w-5 h-5 text-emerald-400" />}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={handleSubmit} disabled={!isContactComplete()}
                className={`w-full mt-10 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                  isContactComplete() ? 'bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 text-white hover:opacity-90 hover:shadow-lg hover:shadow-violet-500/50' : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                }`}>
                <Sparkles className="w-5 h-5" />Δημιουργία της Ανάλυσης μου
              </button>
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {step === 'results' && (
          <div className="max-w-5xl mx-auto animate-fade-in">
            {loading ? (
              <div className="text-center py-32">
                <div className="flex justify-center mb-6"><div className="w-20 h-20 border-4 border-slate-700 border-t-violet-500 rounded-full animate-spin" /></div>
                <p className="text-2xl font-semibold text-slate-300 mb-2">Ανάλυση του προφίλ σου...</p>
                <p className="text-slate-400">Ο AI σύμβουλος δημιουργεί εξατομικευμένη καθοδήγηση</p>
              </div>
            ) : (
              <div className="space-y-6">

                {/* Persona Badge */}
                <PersonaBadge />

                {/* Career Map */}
                <div ref={resultsRef} className="bg-gradient-to-br from-slate-800/50 to-slate-800/20 rounded-2xl p-10 border border-slate-700/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <Sparkles className="w-8 h-8 text-violet-400" />
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Ο Χάρτης της Καριέρας σου</h2>
                  </div>
                  <div className="text-lg leading-relaxed space-y-4">
                    {recommendations.split('\n').map((line, idx) => {
                      if (line.startsWith('###')) return <h3 key={idx} className="mt-8 mb-3 text-2xl font-bold text-cyan-300 border-b border-slate-700 pb-1 flex items-center gap-2 pt-6"><Sparkles className="w-5 h-5 text-violet-400" />{line.replace('### ','')}</h3>;
                      if (line.startsWith('**') && line.endsWith('**')) return <p key={idx} className="text-slate-200 font-semibold">{line.replace(/\*\*/g,'')}</p>;
                      if (line.startsWith('-')) return <p key={idx} className="ml-4 text-slate-300 flex gap-3"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" /><span>{line.replace('- ','')}</span></p>;
                      return line.trim() && <p key={idx} className="text-slate-300">{line}</p>;
                    })}
                  </div>
                </div>

                {/* Action Plan */}
                <ActionPlan />

                {/* Profile CTA */}
                {!profileSaved && (
                  <div className="relative overflow-hidden rounded-2xl border border-violet-500/40 bg-gradient-to-br from-violet-900/40 via-fuchsia-900/30 to-slate-900/40 backdrop-blur-sm p-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 pointer-events-none" />
                    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30 flex-shrink-0">
                        <Trophy className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-xl font-bold text-slate-100 mb-1">Δημιούργησε το Προφίλ σου</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">Κάνε track τον στόχο σου, παρακολούθησε το σχέδιο δράσης σου, κέρδισε XP και ξεκλείδωσε badges — όλα σε ένα μέρος.</p>
                      </div>
                      <button
                        onClick={handleCreateProfile}
                        className="flex-shrink-0 flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 text-white hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-lg shadow-violet-500/30 whitespace-nowrap"
                      >
                        <Sparkles className="w-5 h-5" />
                        Δημιούργησε το Προφίλ μου →
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick Actions Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button onClick={downloadPDF}
                    className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold bg-gradient-to-br from-slate-800/60 to-slate-800/30 border border-slate-700 hover:border-violet-500/50 hover:bg-slate-700/50 transition-all duration-200 text-slate-300 hover:text-white">
                    <Download className="w-5 h-5 text-violet-400" />Λήψη PDF
                  </button>

                  <div className="flex flex-col items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-800/30 border border-slate-700">
                    <p className="text-xs text-slate-500 font-medium">Πόσο χρήσιμο ήταν;</p>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(s => (
                        <button key={s} onClick={() => handleRating(s)} className="transition-transform hover:scale-110 active:scale-95">
                          <Star className={`w-6 h-6 transition-colors ${s<=rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600 hover:text-amber-400/60'}`} />
                        </button>
                      ))}
                    </div>
                    {rating > 0 && <p className="text-xs text-emerald-400 font-medium">Ευχαριστούμε!</p>}
                  </div>

                  <button onClick={handleShare}
                    className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold border transition-all duration-200 ${
                      shareSuccess ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'bg-gradient-to-br from-slate-800/60 to-slate-800/30 border-slate-700 hover:border-violet-500/50 hover:bg-slate-700/50 text-slate-300 hover:text-white'
                    }`}>
                    {shareSuccess ? <><Check className="w-5 h-5" />Αντιγράφηκε!</> : <><Share2 className="w-5 h-5 text-violet-400" />Κοινοποίησε</>}
                  </button>
                </div>

                {/* Email Results */}
                <button
                  onClick={handleEmailResults}
                  disabled={emailSent || emailSending}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold border transition-all duration-200 ${
                    emailSent
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : emailSending
                      ? 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-wait'
                      : 'bg-gradient-to-br from-slate-800/60 to-slate-800/30 border-slate-700 hover:border-violet-500/50 text-slate-300 hover:text-white'
                  }`}
                >
                  {emailSent ? (
                    <><Check className="w-4 h-4" /> Στάλθηκε στο {contactInfo.email}</>
                  ) : emailSending ? (
                    <>Αποστολή...</>
                  ) : (
                    <><Mail className="w-4 h-4 text-violet-400" /> Στείλε αποτελέσματα στο email μου</>
                  )}
                </button>

                {/* Coaching CTA */}
                <div className="bg-gradient-to-br from-cyan-900/30 via-violet-900/30 to-fuchsia-900/30 rounded-2xl p-10 border border-violet-500/30 backdrop-blur-sm">
                  <h3 className="text-2xl font-bold mb-3 text-slate-100">Έτοιμος για το Επόμενο Βήμα;</h3>
                  <p className="text-slate-300 mb-6">Η αξιολόγηση AI σου δίνει μια ισχυρή βάση, αλλά <span className="font-semibold">το προσωπικό coaching</span> μπορεί να σε βοηθήσει ακόμα περισσότερο.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {[{icon:Compass,color:'text-cyan-400',title:'Αποσαφηνίσεις την Κατεύθυνσή σου',sub:'Με κατάλληλη καθοδήγηση'},{icon:Calendar,color:'text-violet-400',title:'Σχέδιο Δράσης',sub:'Για τους επόμενους 6-12 μήνες'},{icon:MessageCircle,color:'text-fuchsia-400',title:'Ξεπεράσεις τα Εμπόδια',sub:'Αντιμετώπισε τις ανησυχίες σου'},{icon:Star,color:'text-emerald-400',title:'Μεγιστοποιήσεις το Δυναμικό σου',sub:'Με expert insights'}].map(({icon:Icon,color,title,sub})=>(
                      <div key={title} className="flex gap-3"><Icon className={`w-5 h-5 ${color} flex-shrink-0 mt-1`}/><div><div className="font-semibold text-slate-200">{title}</div><div className="text-sm text-slate-400">{sub}</div></div></div>
                    ))}
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                    <div className="mb-4 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/50 rounded-lg px-4 py-3">
                      <p className="text-sm font-bold text-emerald-300">✨ Η πρώτη αναγνωριστική συνεδρία είναι ΔΩΡΕΑΝ</p>
                      <p className="text-xs text-emerald-200 mt-1">Θα γνωριστείτε, θα αναλύσουμε το προφίλ σου και θα σχεδιάσουμε το σχέδιό σας μαζί</p>
                    </div>
                    <div className="flex justify-center">
                      <a href="https://calendly.com/pythiacontact/1-coaching-pythia-ai" target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 text-white font-bold text-lg hover:opacity-90 transition-all duration-300 shadow-lg shadow-violet-500/40 hover:scale-105">
                        <Calendar className="w-6 h-6" />Κλείσε Δωρεάν Συνεδρία<ChevronRight className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Bottom buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button onClick={retakeQuestionnaire}
                    className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-violet-500/50 transition-all duration-200 text-slate-300 hover:text-white">
                    <RefreshCw className="w-4 h-4" />Δοκίμασε Διαφορετικές Απαντήσεις
                  </button>
                  <button onClick={resetApp}
                    className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all duration-200">
                    Εξερεύνησε Άλλη Διαδρομή
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── PROFILE ── */}
      {step === 'profile' && profile && (
        <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
          {/* Level Header Card */}
          {(() => {
            const levelInfo = getLevel(profile.totalXP);
            const pct = levelInfo.nextXP
              ? Math.round(((profile.totalXP - levelInfo.min) / (levelInfo.nextXP - levelInfo.min)) * 100)
              : 100;
            return (
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/20 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-violet-500/30 flex-shrink-0">
                    {profile.firstName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-100">Γεια σου, {profile.firstName}!</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-violet-300 bg-violet-500/20 px-3 py-0.5 rounded-full border border-violet-500/30">
                        Lv.{levelInfo.level} — {levelInfo.name}
                      </span>
                      <span className="text-sm text-slate-400">{profile.totalXP} XP</span>
                    </div>
                  </div>
                </div>
                {levelInfo.nextXP && (
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                      <span>{profile.totalXP} XP</span>
                      <span>{levelInfo.nextXP - profile.totalXP} XP μέχρι Level {levelInfo.level + 1}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}
                {!levelInfo.nextXP && (
                  <div className="mt-2 p-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-center">
                    <p className="text-amber-300 font-bold">🏆 Έχεις φτάσει στο μέγιστο level!</p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { val: profile.sessions.length, label: 'Αναλύσεις', color: 'text-cyan-400' },
              { val: profile.totalXP, label: 'Συνολικά XP', color: 'text-violet-400' },
              { val: profile.badges.length, label: 'Badges', color: 'text-fuchsia-400' },
              { val: profile.sessions.reduce((acc, s) => acc + Object.values(s.checkedSteps || {}).filter(Boolean).length, 0), label: 'Βήματα ✅', color: 'text-emerald-400' },
            ].map(({ val, label, color }) => (
              <div key={label} className="bg-gradient-to-br from-slate-800/50 to-slate-800/20 rounded-xl p-5 border border-slate-700/50 text-center">
                <div className={`text-3xl font-extrabold ${color}`}>{val}</div>
                <div className="text-xs text-slate-400 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Latest Persona */}
          {profile.sessions.length > 0 && profile.sessions[profile.sessions.length - 1].persona && (() => {
            const p = profile.sessions[profile.sessions.length - 1].persona;
            const cfg = personaConfig[p.type] || personaConfig.explorer;
            const Icon = cfg.icon;
            return (
              <div className={`bg-gradient-to-br ${cfg.bg} rounded-2xl p-6 border ${cfg.border} backdrop-blur-sm`}>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Τελευταίο Προφίλ</p>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-extrabold bg-gradient-to-r ${cfg.gradient} bg-clip-text text-transparent`}>{p.name}</h3>
                    <p className="text-slate-300 text-sm">{p.tagline}</p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Badges */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/20 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-slate-100 mb-6">Badges ({profile.badges.length}/{BADGE_ORDER.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {BADGE_ORDER.map(badgeId => {
                const badge = BADGES[badgeId];
                const earned = profile.badges.includes(badgeId);
                return (
                  <div key={badgeId} className={`p-4 rounded-xl border text-center transition-all ${
                    earned ? 'bg-violet-500/15 border-violet-500/40' : 'bg-slate-900/30 border-slate-700/50 opacity-40'
                  }`}>
                    <div className="text-3xl mb-2">{badge.emoji}</div>
                    <p className={`text-sm font-bold ${earned ? 'text-slate-100' : 'text-slate-500'}`}>{badge.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{badge.desc}</p>
                    {!earned && <p className="text-xs text-slate-600 mt-2">🔒 Κλειδωμένο</p>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action plan from latest session */}
          {(() => {
            const latest = profile.sessions[profile.sessions.length - 1];
            if (!latest?.actionSteps?.length) return null;
            const checked = latest.checkedSteps || {};
            const done = Object.values(checked).filter(Boolean).length;
            const pct = Math.round((done / latest.actionSteps.length) * 100);
            return (
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/20 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-100">Σχέδιο Δράσης</h3>
                    <p className="text-slate-400 text-sm mt-0.5">Τελευταία ανάλυση</p>
                  </div>
                  <span className="text-2xl font-bold text-violet-400">{pct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-5">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="space-y-2">
                  {latest.actionSteps.map((s, i) => (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${checked[i] ? 'opacity-60' : ''}`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 ${checked[i] ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
                        {checked[i] && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm ${checked[i] ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                        <span className="font-semibold text-violet-400 mr-1">Βήμα {i + 1}.</span>{s}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Session History */}
          {profile.sessions.length > 0 && (
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/20 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-slate-100 mb-6">Ιστορικό Αναλύσεων</h3>
              <div className="space-y-3">
                {[...profile.sessions].reverse().map((s) => {
                  const pCfg = s.persona ? personaConfig[s.persona.type] || personaConfig.explorer : null;
                  const PIcon = pCfg?.icon;
                  const typeLabels = { highschool: 'Μαθητής', university: 'Φοιτητής', employee: 'Επαγγελματίας' };
                  return (
                    <div key={s.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-700/50">
                      {PIcon && pCfg && (
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${pCfg.gradient} flex items-center justify-center flex-shrink-0`}>
                          <PIcon className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-200 text-sm">{s.persona?.name || typeLabels[s.userType] || s.userType}</p>
                        <p className="text-xs text-slate-500">{new Date(s.date).toLocaleDateString('el-GR')} • {typeLabels[s.userType]}</p>
                      </div>
                      {s.rating > 0 && (
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(st => <Star key={st} className={`w-3 h-3 ${st <= s.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pb-8">
            <button onClick={resetApp}
              className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 text-white hover:opacity-90 transition-all duration-200 shadow-lg shadow-violet-500/30">
              <Sparkles className="w-4 h-4" />Νέα Ανάλυση
            </button>
            <button onClick={() => setStep('welcome')}
              className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all duration-200">
              <ArrowLeft className="w-4 h-4" />Αρχική
            </button>
          </div>
        </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center py-10 text-slate-500 text-sm border-t border-slate-800/50 mt-16">
        <p className="mb-3"><span className="font-semibold text-slate-300">e-Pythia</span> • AI Σύμβουλος Καριέρας</p>
        <p className="mt-3"><a href="mailto:pythiacontact@gmail.com" className="text-violet-400 hover:text-violet-300 transition-colors font-semibold">pythiacontact@gmail.com</a></p>
      </div>

      </div>
      )} {/* end authUser */}

      <style jsx>{`
        @keyframes fade-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .animate-fade-in { animation: fade-in 0.4s ease-out; }
        @keyframes slide-in { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .animate-bounce { animation: bounce 0.6s infinite; }
        @keyframes slide-in-right { from{opacity:0;transform:translateX(100%)} to{opacity:1;transform:translateX(0)} }
        .animate-slide-in-right { animation: slide-in-right 0.35s ease-out; }
      `}</style>
    </div>
  );
}
