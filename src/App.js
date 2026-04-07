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


// ── Trait defaults per persona type (fallback when AI doesn't return traits) ──
const TRAIT_DEFAULTS = {
  innovator: { creativity: 9, leadership: 6, analysis: 7, communication: 7, execution: 6 },
  builder:   { creativity: 7, leadership: 6, analysis: 6, communication: 5, execution: 9 },
  analyst:   { creativity: 6, leadership: 5, analysis: 9, communication: 6, execution: 8 },
  leader:    { creativity: 6, leadership: 9, analysis: 7, communication: 8, execution: 8 },
  explorer:  { creativity: 8, leadership: 6, analysis: 7, communication: 7, execution: 6 },
  caregiver: { creativity: 6, leadership: 6, analysis: 6, communication: 9, execution: 7 },
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
    try {
      persona = JSON.parse(personaMatch[1].trim());
      // Strip any unreplaced placeholders like [GREEK_NAME], [ONE_LINE_GREEK] etc.
      if (persona.name && persona.name.includes('[')) persona.name = '';
      if (persona.tagline && persona.tagline.includes('[')) persona.tagline = '';
    } catch {}
    recommendations = recommendations.replace(/---PERSONA_START---[\s\S]*?---PERSONA_END---/, '').trim();
  }

  const actionsMatch = text.match(/---ACTIONS_START---([\s\S]*?)---ACTIONS_END---/);
  if (actionsMatch) {
    try { actionSteps = JSON.parse(actionsMatch[1].trim()).steps || []; } catch {}
    recommendations = recommendations.replace(/---ACTIONS_START---[\s\S]*?---ACTIONS_END---/, '').trim();
  }

  const traitsMatch = text.match(/---TRAITS_START---([\s\S]*?)---TRAITS_END---/);
  if (traitsMatch && persona) {
    try { persona.traits = JSON.parse(traitsMatch[1].trim()); } catch {}
    recommendations = recommendations.replace(/---TRAITS_START---[\s\S]*?---TRAITS_END---/, '').trim();
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
  const [chatInput, setChatInput] = useState('');

  // Auth state
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [chatLoading, setChatLoading] = useState(false);
  const [profileCheckedSteps, setProfileCheckedSteps] = useState({});

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

  // Auto-advance testimonials
  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx(i => (i + 1) % 3), 4000);
    return () => clearInterval(t);
  }, []);

  // Sync profileCheckedSteps from latest session
  useEffect(() => {
    if (profile && profile.sessions.length > 0) {
      const latest = profile.sessions[profile.sessions.length - 1];
      setProfileCheckedSteps(latest.checkedSteps || {});
    }
  }, [profile]);

  // ── Static data ────────────────────────────────────────────────


  const journeyCards = [
    {
      id: 'highschool',
      prompt: 'Είμαι μαθητής και θέλω να δω τι να σπουδάσω',
      icon: GraduationCap,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50 hover:bg-cyan-100',
      border: 'border-cyan-200 hover:border-cyan-400',
      action: () => handleUserTypeSelect('highschool'),
    },
    {
      id: 'university',
      prompt: 'Είμαι φοιτητής και θέλω να δω τις επαγγελματικές μου επιλογές',
      icon: Compass,
      color: 'text-violet-600',
      bg: 'bg-violet-50 hover:bg-violet-100',
      border: 'border-violet-200 hover:border-violet-400',
      action: () => handleUserTypeSelect('university'),
    },
    {
      id: 'employee',
      prompt: 'Είμαι υπάλληλος και θέλω να αλλάξω καριέρα / δουλειά',
      icon: Briefcase,
      color: 'text-fuchsia-600',
      bg: 'bg-fuchsia-50 hover:bg-fuchsia-100',
      border: 'border-fuchsia-200 hover:border-fuchsia-400',
      action: () => handleUserTypeSelect('employee'),
    },
    {
      id: 'graduate',
      prompt: 'Μόλις αποφοίτησα και ψάχνω την πρώτη μου δουλειά',
      icon: Star,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 hover:bg-emerald-100',
      border: 'border-emerald-200 hover:border-emerald-400',
      action: () => handleUserTypeSelect('university'),
    },
    {
      id: 'freelancer',
      prompt: 'Είμαι ελεύθερος επαγγελματίας και ψάχνω νέες κατευθύνσεις',
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50 hover:bg-orange-100',
      border: 'border-orange-200 hover:border-orange-400',
      action: () => handleUserTypeSelect('employee'),
    },
    {
      id: 'career-change',
      prompt: 'Ψάχνω μια ριζική αλλαγή κατεύθυνσης στη ζωή μου',
      icon: RefreshCw,
      color: 'text-blue-600',
      bg: 'bg-blue-50 hover:bg-blue-100',
      border: 'border-blue-200 hover:border-blue-400',
      action: () => handleUserTypeSelect('employee'),
    },
  ];

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || chatLoading) return;
    setChatLoading(true);
    try {
      const res = await fetch('/.netlify/functions/classify-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput }),
      });
      const data = await res.json();
      const detected = data.userType || 'university';
      setUserType(detected);
      setFormData({});
      setCurrentQuestionIndex(0);
      setStep('choose-path');
    } catch {
      // Fallback: go to choose-path with university as default
      setUserType('university');
      setFormData({});
      setCurrentQuestionIndex(0);
      setStep('choose-path');
    } finally {
      setChatLoading(false);
    }
  };

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

  const stepLabels = ['Προφίλ', 'Πακέτο', 'Ερωτήσεις', 'Στοιχεία', 'Αποτελέσματα'];

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
    if (step === 'choose-path') return 2;
    if (step === 'questionnaire') return 3;
    if (step === 'contact') return 4;
    return 5;
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
    if (error) { setAuthError(error.message); }
    else { setShowAuthModal(false); setStep('profile'); }
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
    setStep('choose-path');
  };

  // Called when user picks Free on the choose-path screen
  const startFreeFlow = () => {
    if (userType === 'employee') setStep('employee-sector-select');
    else if (userType === 'highschool') setStep('highschool-type-select');
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

  const toggleProfileStep = async (sessionId, idx, sessionSteps) => {
    const next = { ...profileCheckedSteps, [idx]: !profileCheckedSteps[idx] };
    setProfileCheckedSteps(next);
    if (!authUser) return;
    await supabase.from('career_sessions').update({ checked_steps: next }).eq('id', sessionId);
    const isNowChecked = !profileCheckedSteps[idx];
    if (isNowChecked) {
      let gained = idx < 2 ? 15 : idx < 4 ? 20 : 25;
      const { data: prof } = await supabase.from('profiles').select('total_xp, badges').eq('id', authUser.id).single();
      const existingBadges = [...(prof?.badges || [])];
      const earned = [];
      if (!existingBadges.includes('action_taker')) { existingBadges.push('action_taker'); earned.push('action_taker'); }
      const allDone = sessionSteps.every((_, i) => next[i]);
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

Μετά τις συστάσεις πρόσθεσε ΑΚΡΙΒΩΣ (valid JSON, χωρίς code fences).
Αντικατέστησε ΟΛΕΣ τις τιμές με πραγματικό περιεχόμενο στα ελληνικά. ΜΗΝ αφήσεις κανένα placeholder.

Παράδειγμα σωστής συμπλήρωσης:
---PERSONA_START---
{"name":"Ο Δημιουργικός Οραματιστής","tagline":"Μετατρέπεις ιδέες σε πραγματικότητα με τόλμη και φαντασία","type":"innovator"}
---PERSONA_END---

Τώρα συμπλήρωσε για τον συγκεκριμένο χρήστη:

---PERSONA_START---
{"name":"<δώσε έναν ελληνικό τίτλο persona>","tagline":"<μία πρόταση στα ελληνικά που περιγράφει τον χρήστη>","type":"<innovator|builder|analyst|leader|explorer|caregiver>"}
---PERSONA_END---

---ACTIONS_START---
{"steps":["<βήμα 1 στα ελληνικά>","<βήμα 2>","<βήμα 3>","<βήμα 4>","<βήμα 5>"]}
---ACTIONS_END---

---TRAITS_START---
{"creativity":[1-10],"leadership":[1-10],"analysis":[1-10],"communication":[1-10],"execution":[1-10]}
---TRAITS_END---

Personas: innovator="Ο Καινοτόμος", builder="Ο Δημιουργός", analyst="Ο Αναλυτής", leader="Ο Ηγέτης", explorer="Ο Εξερευνητής", caregiver="Ο Φροντιστής".
Steps: συγκεκριμένα, εξατομικευμένα, ρήματα δράσης.
Traits: αξιολόγησε βάσει των απαντήσεων του χρήστη, integers 1-10.`;
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

  const RadarChart = ({ traits }) => {
    const labels = { creativity: 'Δημιουργικότητα', leadership: 'Ηγεσία', analysis: 'Ανάλυση', communication: 'Επικοινωνία', execution: 'Υλοποίηση' };
    const keys = Object.keys(labels);
    const N = keys.length;
    const cx = 150, cy = 150, r = 100;
    const angle = (i) => (2 * Math.PI * i / N) - Math.PI / 2;
    const pt = (i, score) => {
      const d = (score / 10) * r;
      return [cx + d * Math.cos(angle(i)), cy + d * Math.sin(angle(i))];
    };
    const outerPt = (i) => [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))];
    const gridLevels = [0.25, 0.5, 0.75, 1];
    const dataPoints = keys.map((k, i) => pt(i, traits[k] || 5));
    const dataPath = dataPoints.map(([x, y]) => `${x},${y}`).join(' ');
    return (
      <svg viewBox="0 0 300 300" className="w-full max-w-xs mx-auto">
        {/* Grid rings */}
        {gridLevels.map(lvl => (
          <polygon key={lvl}
            points={keys.map((_, i) => { const [x,y] = [cx + r*lvl*Math.cos(angle(i)), cy + r*lvl*Math.sin(angle(i))]; return `${x},${y}`; }).join(' ')}
            fill="none" stroke="#c6c5d4" strokeWidth="1" />
        ))}
        {/* Axis lines */}
        {keys.map((_, i) => {
          const [ox, oy] = outerPt(i);
          return <line key={i} x1={cx} y1={cy} x2={ox} y2={oy} stroke="#c6c5d4" strokeWidth="1" />;
        })}
        {/* Data polygon */}
        <polygon points={dataPath} fill="rgba(19,25,126,0.15)" stroke="#13197e" strokeWidth="2" strokeLinejoin="round" />
        {/* Data dots */}
        {dataPoints.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="4" fill="#13197e" />
        ))}
        {/* Labels */}
        {keys.map((k, i) => {
          const [lx, ly] = [cx + (r + 20) * Math.cos(angle(i)), cy + (r + 20) * Math.sin(angle(i))];
          const anchor = lx < cx - 5 ? 'end' : lx > cx + 5 ? 'start' : 'middle';
          return (
            <text key={k} x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle"
              className="text-[10px]" style={{ fontSize: 10, fill: '#464652', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              {labels[k]}
            </text>
          );
        })}
        {/* Score labels */}
        {dataPoints.map(([x, y], i) => (
          <text key={i} x={x} y={y - 8} textAnchor="middle" style={{ fontSize: 9, fill: '#13197e', fontWeight: 700 }}>
            {traits[keys[i]] || 5}
          </text>
        ))}
      </svg>
    );
  };

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
            <p className="text-xs font-label font-semibold uppercase tracking-widest text-on-surface-variant mb-1">Το προφίλ σου</p>
            {(() => {
              const fn = contactInfo.firstName || (profile && profile.firstName) || '';
              const ln = contactInfo.lastName || (profile && profile.lastName) || '';
              const fullName = [fn, ln].filter(Boolean).join(' ');
              return fullName ? <p className="text-lg font-label font-semibold text-on-surface mb-1">{fullName}</p> : null;
            })()}
            <h3 className={`text-3xl font-extrabold mb-2 bg-gradient-to-r ${cfg.gradient} bg-clip-text text-transparent`}>{persona.name}</h3>
            <p className="text-on-surface-variant text-base leading-relaxed max-w-lg">{persona.tagline}</p>
          </div>
        </div>
      </div>
    );
  };

  const ActionPlan = () => {
    if (!actionSteps.length) return null;
    return (
      <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-headline font-bold text-primary">Το Σχέδιο Δράσης σου</h3>
            <p className="text-on-surface-variant text-sm mt-1">Τσέκαρε τα βήματα καθώς τα ολοκληρώνεις</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary">{actionProgress}%</span>
            <p className="text-xs text-on-surface-variant">{checkedCount}/{actionSteps.length} βήματα</p>
          </div>
        </div>
        <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden mb-6">
          <div className="h-full bg-secondary rounded-full transition-all duration-500" style={{ width: `${actionProgress}%` }} />
        </div>
        <div className="space-y-3">
          {actionSteps.map((s, i) => (
            <button key={i} onClick={() => toggleStep(i)}
              className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-200 ${
                checkedSteps[i] ? 'border-secondary/30 bg-secondary-container/20' : 'border-outline-variant/20 bg-surface-container-low hover:border-primary/20 hover:bg-surface-container'
              }`}>
              <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-all ${checkedSteps[i] ? 'bg-secondary border-secondary' : 'border-outline-variant'}`}>
                {checkedSteps[i] && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className={`text-sm leading-relaxed transition-all ${checkedSteps[i] ? 'line-through text-outline' : 'text-on-surface'}`}>
                <span className="font-label font-semibold text-primary mr-2">Βήμα {i + 1}.</span>{s}
              </span>
            </button>
          ))}
        </div>
        {actionProgress === 100 && (
          <div className="mt-6 p-4 rounded-xl bg-secondary-container/30 border border-secondary/20 text-center animate-fade-in">
            <p className="text-secondary font-label font-bold">🎉 Συγχαρητήρια! Ολοκλήρωσες όλα τα βήματα!</p>
          </div>
        )}
      </div>
    );
  };

  const currentStepNum = getStepNumber();

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">

      {/* Auth loading */}
      {authLoading && (
        <div className="fixed inset-0 bg-surface flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-outline-variant border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-on-surface-variant font-body">Φόρτωση...</p>
          </div>
        </div>
      )}

      {/* ── AUTH MODAL ── */}
      {showAuthModal && !authUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowAuthModal(false)}>
          <div className="w-full max-w-md animate-fade-in bg-surface rounded-2xl shadow-2xl border border-outline-variant/20 p-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-headline font-bold text-primary">
                {authMode === 'login' ? 'Σύνδεση' : 'Δημιουργία Λογαριασμού'}
              </h2>
              <button onClick={() => setShowAuthModal(false)} className="p-2 rounded-full hover:bg-surface-container-high transition text-on-surface-variant">✕</button>
            </div>
            <div className="flex rounded-xl bg-surface-container p-1 mb-6">
              {[['login','Σύνδεση'],['signup','Εγγραφή']].map(([mode, label]) => (
                <button key={mode} onClick={() => { setAuthMode(mode); setAuthError(''); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-label font-semibold transition-all duration-200 ${authMode === mode ? 'bg-primary text-on-primary shadow' : 'text-on-surface-variant hover:text-on-surface'}`}>
                  {label}
                </button>
              ))}
            </div>
            <div className="space-y-4">
              {authMode === 'signup' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-label font-semibold text-on-surface-variant mb-1.5">Όνομα</label>
                    <input type="text" value={authForm.firstName} onChange={e => handleAuthFormChange('firstName', e.target.value)}
                      placeholder="Όνομα" autoComplete="given-name"
                      className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 hover:border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-on-surface text-sm transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-label font-semibold text-on-surface-variant mb-1.5">Επώνυμο</label>
                    <input type="text" value={authForm.lastName} onChange={e => handleAuthFormChange('lastName', e.target.value)}
                      placeholder="Επώνυμο" autoComplete="family-name"
                      className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 hover:border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-on-surface text-sm transition-all" />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-label font-semibold text-on-surface-variant mb-1.5">Email</label>
                <input type="email" value={authForm.email} onChange={e => handleAuthFormChange('email', e.target.value)}
                  placeholder="email@example.com" autoComplete="email"
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 hover:border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-on-surface text-sm transition-all" />
              </div>
              <div>
                <label className="block text-xs font-label font-semibold text-on-surface-variant mb-1.5">Κωδικός</label>
                <input type="password" value={authForm.password} onChange={e => handleAuthFormChange('password', e.target.value)}
                  placeholder="Τουλάχιστον 6 χαρακτήρες"
                  autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                  onKeyDown={e => e.key === 'Enter' && (authMode === 'login' ? handleLogin() : handleSignUp())}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 hover:border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-on-surface text-sm transition-all" />
              </div>
              {authError && authError !== 'confirm' && (
                <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm">{authError}</div>
              )}
              {authError === 'confirm' && (
                <div className="p-3 rounded-xl bg-secondary-container/30 border border-secondary/20 text-secondary text-sm">
                  ✓ Σου στείλαμε email επιβεβαίωσης. Έλεγξε τα εισερχόμενα!
                </div>
              )}
              <button
                onClick={authMode === 'login' ? handleLogin : handleSignUp}
                disabled={authSubmitting || !authForm.email || !authForm.password || (authMode === 'signup' && (!authForm.firstName || !authForm.lastName))}
                className={`w-full py-3.5 rounded-xl font-label font-bold transition-all duration-300 mt-2 ${
                  authSubmitting || !authForm.email || !authForm.password || (authMode === 'signup' && (!authForm.firstName || !authForm.lastName))
                    ? 'bg-surface-container text-outline cursor-not-allowed opacity-50'
                    : 'bg-primary text-on-primary hover:opacity-90 shadow-md'
                }`}>
                {authSubmitting ? 'Παρακαλώ περίμενε...' : authMode === 'login' ? 'Σύνδεση →' : 'Δημιουργία Λογαριασμού →'}
              </button>
            </div>
            <p className="text-center text-xs text-on-surface-variant mt-5">Τα δεδομένα σου προστατεύονται και δεν μοιράζονται σε τρίτους.</p>
          </div>
        </div>
      )}

      {/* ── MAIN APP ── */}
      {true && (
      <>

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
      <header className="sticky top-0 z-50 flex justify-between items-center px-6 h-16 bg-surface/80 backdrop-blur-xl shadow-[0px_1px_0px_rgba(24,28,30,0.08)]">
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-sm">
            <Eye className="w-5 h-5 text-on-primary" />
          </div>
          <span className="font-headline font-extrabold tracking-tight text-primary text-xl">e-Pythia</span>
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
                      isDone ? 'bg-primary text-on-primary'
                      : isActive ? 'bg-primary text-on-primary ring-2 ring-primary/30'
                      : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/30'
                    }`}>
                      {isDone ? <Check className="w-3.5 h-3.5" /> : num}
                    </div>
                    <span className={`text-[10px] mt-0.5 font-label font-medium ${isActive ? 'text-primary' : isDone ? 'text-on-surface-variant' : 'text-outline'}`}>{label}</span>
                  </div>
                  {idx < stepLabels.length - 1 && (
                    <div className={`w-6 h-px mb-4 transition-all ${isDone ? 'bg-primary' : 'bg-outline-variant'}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-2 flex-shrink-0">
          {profile && step !== 'profile' && (
            <button onClick={() => setStep('profile')}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 transition duration-200 text-sm font-label font-medium text-primary">
              <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-bold">
                {profile.firstName.charAt(0)}
              </span>
              <span className="hidden sm:inline">{profile.firstName}</span>
            </button>
          )}
          {step !== 'welcome' && (
            <button onClick={resetApp} className="flex items-center gap-2 px-3 py-2 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 transition duration-200 text-sm font-label font-medium text-on-surface-variant">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Αρχή</span>
            </button>
          )}
          {authUser ? (
            <button onClick={handleSignOut}
              className="p-2 rounded-full hover:bg-surface-container-high transition duration-200 text-on-surface-variant hover:text-error" title="Έξοδος">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          ) : (
            <>
              <button onClick={() => { setAuthMode('login'); setAuthError(''); setShowAuthModal(true); }}
                className="px-4 py-2 rounded-full text-sm font-label font-semibold text-primary border border-primary/30 hover:bg-primary/10 transition duration-200">
                Σύνδεση
              </button>
              <button onClick={() => { setAuthMode('signup'); setAuthError(''); setShowAuthModal(true); }}
                className="px-4 py-2 rounded-full text-sm font-label font-semibold bg-primary text-on-primary hover:opacity-90 transition duration-200 shadow-sm">
                Εγγραφή
              </button>
            </>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* ── WELCOME ── */}
        {step === 'welcome' && (
          <div className="animate-fade-in space-y-8">
            {/* Hero */}
            <section className="max-w-2xl mx-auto pt-8 text-center">
              <p className="text-secondary font-label font-medium mb-3 flex items-center justify-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-secondary inline-block"></span>
                AI Σύμβουλος Καριέρας — Ελλάδα
              </p>
              <h1 className="font-headline font-bold text-primary text-[2.5rem] md:text-[3rem] leading-[1.1] tracking-tight mb-8">
                Καλωσόρισες.<br />
                Η πορεία σου <span className="text-secondary">ξεκινά εδώ.</span>
              </h1>
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm p-4 mb-5">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-6 h-6 text-outline ml-1 flex-shrink-0" />
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleChatSubmit()}
                    placeholder="Πες μου λίγα λόγια για σένα..."
                    className="flex-1 outline-none text-on-surface text-base placeholder-outline bg-transparent py-3 font-body"
                  />
                  <button
                    onClick={handleChatSubmit}
                    disabled={!chatInput.trim() || chatLoading}
                    className={`flex-shrink-0 px-6 py-3 rounded-xl font-label font-semibold text-base transition-all duration-200 flex items-center gap-2 ${chatInput.trim() && !chatLoading ? 'bg-primary text-on-primary hover:opacity-90 shadow-sm' : 'bg-surface-container text-outline cursor-not-allowed'}`}
                  >
                    {chatLoading ? (
                      <><div className="w-4 h-4 border-2 border-outline border-t-primary rounded-full animate-spin" />Ανάλυση...</>
                    ) : 'Εκκίνηση →'}
                  </button>
                </div>
              </div>
              <button onClick={() => setStep('about')}
                className="text-sm font-label font-semibold text-on-surface-variant hover:text-primary underline underline-offset-4 transition-colors">
                Μάθε Περισσότερα
              </button>
            </section>

            {/* Bento Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Journey Cards */}
              <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center">
                    <Compass className="w-5 h-5 text-on-secondary-container" />
                  </div>
                  <h2 className="font-headline font-bold text-xl text-primary">Ποια κατηγορία σε εκφράζει;</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {journeyCards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <button key={card.id} onClick={card.action}
                        className="text-left flex items-start gap-3 p-4 rounded-lg bg-surface-container-low hover:bg-surface-container border border-transparent hover:border-outline-variant/30 transition-all duration-200 group">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-label font-medium text-on-surface leading-snug">{card.prompt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-primary text-on-primary p-8 rounded-xl relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="font-headline font-bold text-xl mb-8">Αποτελέσματα</h2>
                  <div className="space-y-6">
                    {[{label:'Μαθητές που βρήκαν κατεύθυνση',pct:'92%',w:'92%'},{label:'Φοιτητές με σαφές επαγγ. πλάνο',pct:'88%',w:'88%'},{label:'Επαγγελματίες που άλλαξαν καριέρα',pct:'76%',w:'76%'}].map(({label,pct,w}) => (
                      <div key={label} className="flex flex-col gap-2">
                        <div className="flex justify-between text-xs font-label opacity-80 uppercase tracking-widest">
                          <span>{label}</span><span>{pct}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full">
                          <div className="h-full bg-secondary-container rounded-full" style={{width:w}} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full blur-3xl -mr-16 -mt-16" />
              </div>

              {/* Bottom row */}
              <div className="lg:col-span-3 grid grid-cols-1 gap-6">
                {/* Testimonials Carousel */}
                <div className="bg-surface-container-low p-8 rounded-xl">
                  <h2 className="font-headline font-bold text-xl text-primary mb-6">Τι λένε οι χρήστες</h2>
                  <div className="relative min-h-[120px]">
                    {(() => {
                      const t = testimonials[testimonialIdx];
                      return (
                        <div className="flex items-start gap-4 animate-fade-in" key={testimonialIdx}>
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5`}>{t.name.charAt(0)}</div>
                          <div>
                            <p className="text-base text-on-surface leading-relaxed italic">"{t.text}"</p>
                            <p className="text-sm text-on-surface-variant mt-2 font-label font-medium">{t.name} · {t.role}</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex items-center justify-center gap-3 mt-6">
                    <button onClick={() => setTestimonialIdx(i => (i - 1 + testimonials.length) % testimonials.length)}
                      className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition">‹</button>
                    {testimonials.map((_, i) => (
                      <button key={i} onClick={() => setTestimonialIdx(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === testimonialIdx ? 'bg-primary w-4' : 'bg-outline-variant'}`} />
                    ))}
                    <button onClick={() => setTestimonialIdx(i => (i + 1) % testimonials.length)}
                      className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition">›</button>
                  </div>
                </div>

                {/* Coach CTA */}
                <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 shadow-sm flex flex-col sm:flex-row items-center gap-8">
                  <div className="flex-1">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4 shadow-md">
                      <Calendar className="w-6 h-6 text-on-primary" />
                    </div>
                    <h3 className="font-headline font-bold text-xl text-primary mb-2">Θέλεις προσωπικό coaching;</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed mb-4">Συνδέσου με εξειδικευμένο σύμβουλο καριέρας που έχει ζήσει το ίδιο path.</p>
                    <div className="space-y-2">
                      {['Πραγματική εμπειρία στον κλάδο σου','Πρακτικές και εφαρμόσιμες συμβουλές','Η 1η συνεδρία είναι ΔΩΡΕΑΝ'].map(item => (
                        <div key={item} className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0">
                            <Check className="w-2.5 h-2.5 text-on-secondary-container" />
                          </div>
                          <span className="text-sm text-on-surface font-label">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <a href="https://calendly.com/pythiacontact/1-coaching-pythia-ai" target="_blank" rel="noopener noreferrer"
                    className="flex-shrink-0 flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-on-primary font-label font-semibold text-base transition-all hover:opacity-90 shadow-md whitespace-nowrap">
                    <Calendar className="w-5 h-5" />Κλείσε Δωρεάν Συνεδρία
                  </a>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ── CHOOSE PATH ── */}
        {step === 'choose-path' && (
          <div className="max-w-3xl mx-auto animate-fade-in py-4">
            {/* Hero */}
            <div className="text-center mb-10">
              <h1 className="font-headline font-extrabold text-[2.75rem] leading-tight text-primary mb-3 tracking-tight">
                Διάλεξε τη Διαδρομή σου
              </h1>
              <p className="font-body text-on-surface-variant text-lg max-w-xl mx-auto leading-relaxed">
                Επίλεξε το επίπεδο ανάλυσης που σου ταιριάζει. Και οι δύο οδηγούν σε εξατομικευμένο χάρτη καριέρας.
              </p>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-5 mb-14 max-w-xl mx-auto w-full">

              {/* Free */}
              <div className="flex flex-col p-8 rounded-xl bg-surface-container-low border border-outline-variant/20 transition-all duration-300 hover:-translate-y-1 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="font-label text-[0.7rem] font-bold uppercase tracking-widest text-secondary mb-2 block">Βασική Πρόσβαση</span>
                    <h2 className="font-headline font-bold text-2xl text-on-surface">Δωρεάν Πακέτο</h2>
                  </div>
                  <div className="text-3xl font-headline font-extrabold text-primary">0€</div>
                </div>
                <div className="space-y-4 mb-8">
                  {[
                    { icon: 'checklist', text: 'Ερωτηματολόγιο (~15 ερωτήσεις)' },
                    { icon: 'description', text: 'Χάρτης Καριέρας AI (soft edition)' },
                    { icon: 'task_alt', text: 'Σχέδιο Δράσης 5 βημάτων' },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-[14px] text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                      </div>
                      <p className="font-body text-on-surface-variant text-sm leading-snug">{text}</p>
                    </div>
                  ))}
                </div>
                <button onClick={startFreeFlow}
                  className="w-full py-4 rounded-xl font-headline font-bold text-secondary border-2 border-secondary hover:bg-secondary-container/20 transition-all active:scale-95">
                  Ξεκίνα Δωρεάν →
                </button>
              </div>

              {/* Premium — coming soon teaser */}
              <div className="flex items-center gap-4 p-5 rounded-xl border border-dashed border-primary/30 bg-primary/5">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-[20px]">lock</span>
                </div>
                <div className="flex-1">
                  <p className="font-label font-bold text-primary text-sm">Premium Πακέτο — 19.99€</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">Γνωστικό ερωτηματολόγιο, AI roadmap & premium PDF. <span className="font-semibold text-secondary">Σύντομα κοντά σας.</span></p>
                </div>
              </div>
            </div>

            {/* Science section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
              <div className="md:col-span-7 space-y-4">
                <h3 className="font-headline font-bold text-2xl text-on-surface tracking-tight">Η Επιστήμη της Επιλογής</h3>
                <p className="font-body text-on-surface-variant leading-relaxed text-sm">
                  Η πλατφόρμα χρησιμοποιεί προηγμένη σημασιολογική ανάλυση και γνωστική χαρτογράφηση για να κατανοήσει το μοναδικό σου επαγγελματικό αποτύπωμα. Το AI e-Pythia συνθέτει χιλιάδες δεδομένα καριέρας σε μία συνεκτική αφήγηση για το μέλλον σου.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[{ val: '98%', label: 'Ακρίβεια Ανάλυσης' }, { val: '<2min', label: 'Χρόνος Αποτελέσματος' }].map(({ val, label }) => (
                    <div key={label} className="p-4 rounded-xl bg-surface-container-high/50">
                      <span className="font-headline font-extrabold text-2xl text-secondary block mb-1">{val}</span>
                      <span className="font-label text-xs uppercase tracking-wider text-on-surface-variant">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:col-span-5">
                <div className="w-full aspect-video rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center border border-outline-variant/10">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-[64px] text-primary/40">psychology</span>
                    <p className="text-xs text-on-surface-variant mt-2 font-label">AI Cognitive Mapping</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ABOUT ── */}
        {step === 'about' && (
          <div className="max-w-3xl mx-auto py-10 animate-fade-in space-y-8">
            <button onClick={() => setStep('welcome')} className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary font-label font-semibold transition-colors">
              <ArrowLeft className="w-4 h-4" />Πίσω στην Αρχική
            </button>
            <div className="text-center">
              <h1 className="text-4xl font-headline font-bold text-primary mb-3">Τι είναι το e-Pythia;</h1>
              <p className="text-on-surface-variant text-lg leading-relaxed">Ο πρώτος AI Σύμβουλος Καριέρας στην Ελλάδα, σχεδιασμένος για μαθητές, φοιτητές και επαγγελματίες που θέλουν να ανακαλύψουν ή να αλλάξουν κατεύθυνση.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: GraduationCap, title: 'Για Μαθητές', desc: 'Βρες ποια σχολή ταιριάζει στα ενδιαφέροντά σου και τον τρόπο σκέψης σου.', gradient: 'from-cyan-500 to-blue-500' },
                { icon: Compass, title: 'Για Φοιτητές', desc: 'Χάρτης επαγγελματικών επιλογών βασισμένος στο πτυχίο και τις αξίες σου.', gradient: 'from-violet-500 to-purple-500' },
                { icon: Briefcase, title: 'Για Επαγγελματίες', desc: 'Δομημένο σχέδιο για αλλαγή καριέρας ή εξέλιξη στον κλάδο σου.', gradient: 'from-fuchsia-500 to-pink-500' },
              ].map(({ icon: Icon, title, desc, gradient }) => (
                <div key={title} className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-sm text-center">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-4 shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-headline font-bold text-primary mb-2">{title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
            <div className="bg-surface-container-low rounded-xl p-8 space-y-4">
              <h2 className="font-headline font-bold text-xl text-primary">Πώς λειτουργεί;</h2>
              {[
                { step: '1', title: 'Διάλεξε κατηγορία', desc: 'Μαθητής, Φοιτητής, Υπάλληλος, Απόφοιτος, Ελεύθερος Επαγγελματίας ή Αλλαγή Κατεύθυνσης.' },
                { step: '2', title: 'Απάντησε στις ερωτήσεις', desc: 'Εξατομικευμένες ερωτήσεις που αποκαλύπτουν τα ενδιαφέροντα, τις αξίες και τις δεξιότητές σου.' },
                { step: '3', title: 'Λάβε το Χάρτη Καριέρας σου', desc: 'Αναλυτικές οδηγίες, σχέδιο δράσης και επαγγελματικό coaching αν το χρειαστείς.' },
              ].map(({ step: s, title, desc }) => (
                <div key={s} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm flex-shrink-0">{s}</div>
                  <div>
                    <p className="font-label font-semibold text-on-surface">{title}</p>
                    <p className="text-sm text-on-surface-variant mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <button onClick={() => setStep('welcome')}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-on-primary font-label font-bold text-base hover:opacity-90 transition shadow-md">
                <Sparkles className="w-5 h-5" />Ξεκίνα τώρα
              </button>
            </div>
          </div>
        )}

        {/* ── HIGHSCHOOL TYPE ── */}
        {step === 'highschool-type-select' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="text-center mb-12"><h2 className="text-4xl font-headline font-bold text-primary mb-4">Σε ποιο σχολείο πας;</h2><p className="text-on-surface-variant">Διάλεξε για να λάβεις προσαρμοσμένες ερωτήσεις</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {highschoolTypes.map((t) => { const Icon = t.icon; return (
                <button key={t.id} onClick={() => handleHighschoolTypeSelect(t.id)}
                  className="group bg-surface-container-lowest rounded-xl p-10 border border-outline-variant/10 hover:border-primary/30 transition-all duration-300 hover:shadow-md hover:-translate-y-1 shadow-sm">
                  <div className="flex flex-col items-center text-center">
                    <h3 className="text-2xl font-headline font-bold mb-3 text-primary">{t.title}</h3>
                    <p className="text-on-surface-variant text-sm mb-6">{t.description}</p>
                    <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${t.gradient} flex items-center justify-center mb-6 shadow-lg`}><Icon className="w-12 h-12 text-white" /></div>
                    <ChevronRight className="w-6 h-6 text-secondary" />
                  </div>
                </button>
              ); })}
            </div>
          </div>
        )}

        {/* ── EMPLOYEE SECTOR ── */}
        {step === 'employee-sector-select' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="text-center mb-12"><h2 className="text-4xl font-headline font-bold text-primary mb-4">Σε ποιον τομέα δραστηριοποιείσαι;</h2><p className="text-on-surface-variant">Διάλεξε για να λάβεις προσαρμοσμένες ερωτήσεις</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {employeeSectors.map((s) => { const Icon = s.icon; return (
                <button key={s.id} onClick={() => handleEmployeeSectorSelect(s.id)}
                  className="group bg-surface-container-lowest rounded-xl p-10 border border-outline-variant/10 hover:border-primary/30 transition-all duration-300 hover:shadow-md hover:-translate-y-1 shadow-sm">
                  <div className="flex flex-col items-center text-center">
                    <h3 className="text-2xl font-headline font-bold mb-3 text-primary">{s.title}</h3>
                    <p className="text-on-surface-variant text-sm mb-6">{s.description}</p>
                    <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-6 shadow-lg`}><Icon className="w-12 h-12 text-white" /></div>
                    <ChevronRight className="w-6 h-6 text-secondary" />
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
                <span className="text-sm text-on-surface-variant font-label">Ερώτηση <span className="text-primary font-bold">{currentQuestionIndex + 1}</span> από {totalQuestions}</span>
                <span className="text-sm font-label font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">{wizardProgress}%</span>
              </div>
              <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${wizardProgress}%` }} />
              </div>
            </div>

            <div key={currentQuestionIndex} className="animate-slide-in">
              <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 shadow-sm">
                <h2 className="text-2xl font-headline font-bold mb-8 text-on-surface leading-snug">{activeQuestion.label}</h2>

                {activeQuestion.type === 'select' && (
                  <div className="space-y-3">
                    {activeQuestion.options.map((opt) => {
                      const isSel = formData[activeQuestion.id] === opt;
                      const isFlash = flashOption === opt;
                      return (
                        <button key={opt} onClick={() => handleOptionSelect(activeQuestion.id, opt)}
                          className={`w-full text-left px-5 py-4 rounded-xl border font-medium transition-all duration-200 ${
                            isFlash || isSel ? 'border-primary bg-primary/10 text-primary scale-[0.99]' : 'border-outline-variant/30 bg-surface-container-low text-on-surface hover:border-primary/30 hover:bg-surface-container transition-colors'
                          }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${isFlash || isSel ? 'border-primary bg-primary' : 'border-outline-variant'}`}>
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
                    className="w-full px-4 py-3 rounded-lg bg-surface-container-low border border-outline-variant/30 hover:border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-on-surface transition-all duration-200 placeholder-outline font-body" />
                )}

                {activeQuestion.type === 'textarea' && (
                  <textarea value={formData[activeQuestion.id] || ''} onChange={(e) => handleInputChange(activeQuestion.id, e.target.value)}
                    placeholder={activeQuestion.placeholder} rows={5} autoFocus
                    className="w-full px-4 py-3 rounded-lg bg-surface-container-low border border-outline-variant/30 hover:border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-on-surface transition-all duration-200 placeholder-outline font-body resize-none" />
                )}
              </div>

              <div className="flex items-center justify-between mt-6">
                <button onClick={goToPrevQuestion} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 transition-all duration-200 text-sm font-label font-medium text-on-surface-variant">
                  <ChevronLeft className="w-4 h-4" />Πίσω
                </button>
                {activeQuestion.type !== 'select' && (
                  <button onClick={advanceQuestion} disabled={!formData[activeQuestion.id]?.trim()}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ${
                      formData[activeQuestion.id]?.trim()
                        ? 'bg-primary text-on-primary hover:opacity-90 shadow-md'
                        : 'bg-surface-container text-outline cursor-not-allowed opacity-50'
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
            <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 shadow-sm">
              <h2 className="text-3xl font-headline font-bold text-primary mb-2">Σχεδόν Έτοιμο!</h2>
              <p className="text-on-surface-variant mb-8">Εισήγαγε τα στοιχεία σου για να λάβεις τη δική σου ανάλυση</p>
              <div className="space-y-6">
                {['firstName','lastName','email'].map(field => (
                  <div key={field}>
                    <label className="block text-xs font-label font-semibold mb-2 text-on-surface-variant uppercase tracking-wide">
                      {field==='firstName'?'Όνομα':field==='lastName'?'Επώνυμο':'Email'}
                    </label>
                    <div className="relative">
                      <input type={field==='email'?'email':'text'} value={contactInfo[field]} onChange={(e)=>handleContactChange(field,e.target.value)}
                        placeholder={`Εισήγαγε το ${field==='firstName'?'όνομά σου':field==='lastName'?'επώνυμό σου':'email σου'}`}
                        className="w-full px-4 py-3 rounded-lg bg-surface-container-low border border-outline-variant/30 hover:border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-on-surface transition-all duration-200 placeholder-outline font-body" />
                      {contactInfo[field] && <Check className="absolute right-4 top-3.5 w-5 h-5 text-secondary" />}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={handleSubmit} disabled={!isContactComplete()}
                className={`w-full mt-10 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                  isContactComplete() ? 'bg-primary text-on-primary hover:opacity-90 shadow-md' : 'bg-surface-container text-outline cursor-not-allowed opacity-50'
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
                <div className="flex justify-center mb-6"><div className="w-20 h-20 border-4 border-outline-variant border-t-primary rounded-full animate-spin" /></div>
                <p className="text-2xl font-headline font-semibold text-primary mb-2">Ανάλυση του προφίλ σου...</p>
                <p className="text-on-surface-variant">Ο AI σύμβουλος δημιουργεί εξατομικευμένη καθοδήγηση</p>
              </div>
            ) : (
              <div className="space-y-6">

                {/* Persona Badge */}
                <PersonaBadge />

                {/* Career Map */}
                <div ref={resultsRef} className="bg-surface-container-lowest rounded-xl p-10 border border-outline-variant/10 shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-on-secondary-container" />
                    </div>
                    <h2 className="text-3xl font-headline font-bold text-primary">Ο Χάρτης της Καριέρας σου</h2>
                  </div>
                  <div className="text-lg leading-relaxed space-y-4">
                    {recommendations.split('\n').map((line, idx) => {
                      if (line.startsWith('###')) return <h3 key={idx} className="mt-8 mb-3 text-xl font-headline font-bold text-primary border-b border-outline-variant/30 pb-2 flex items-center gap-2 pt-6"><span className="w-2 h-2 rounded-full bg-secondary inline-block flex-shrink-0" />{line.replace('### ','')}</h3>;
                      if (line.startsWith('**') && line.endsWith('**')) return <p key={idx} className="text-on-surface font-label font-semibold">{line.replace(/\*\*/g,'')}</p>;
                      if (line.startsWith('-')) return <p key={idx} className="ml-4 text-on-surface-variant flex gap-3"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" /><span>{line.replace('- ','')}</span></p>;
                      return line.trim() && <p key={idx} className="text-on-surface-variant">{line}</p>;
                    })}
                  </div>
                </div>

                {/* Action Plan — only visible after profile is created */}
                {(profileSaved || !!authUser) && <ActionPlan />}

                {/* Profile CTA */}
                {!profileSaved && (
                  <div className="relative overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container-lowest shadow-sm p-8">
                    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                      <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center shadow-md flex-shrink-0">
                        <Trophy className="w-7 h-7 text-on-primary" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-xl font-headline font-bold text-primary mb-1">Δημιούργησε το Προφίλ σου</h3>
                        <p className="text-on-surface-variant text-sm leading-relaxed">Κάνε track τον στόχο σου, παρακολούθησε το σχέδιο δράσης σου, κέρδισε XP και ξεκλείδωσε badges.</p>
                      </div>
                      <button
                        onClick={handleCreateProfile}
                        className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl font-label font-semibold bg-primary text-on-primary hover:opacity-90 transition-all duration-200 shadow-md whitespace-nowrap"
                      >
                        <Sparkles className="w-4 h-4" />
                        Δημιούργησε το Προφίλ μου →
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick Actions Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button onClick={downloadPDF}
                    className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-label font-semibold bg-surface-container-lowest border border-outline-variant/10 hover:border-primary/30 hover:bg-surface-container-low transition-all duration-200 text-on-surface-variant hover:text-primary shadow-sm">
                    <Download className="w-5 h-5 text-primary" />Λήψη PDF
                  </button>

                  <div className="flex flex-col items-center justify-center gap-2 px-6 py-4 rounded-xl bg-surface-container-lowest border border-outline-variant/10 shadow-sm">
                    <p className="text-xs text-gray-400 font-medium">Πόσο χρήσιμο ήταν;</p>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(s => (
                        <button key={s} onClick={() => handleRating(s)} className="transition-transform hover:scale-110 active:scale-95">
                          <Star className={`w-6 h-6 transition-colors ${s<=rating ? 'text-secondary fill-secondary' : 'text-outline-variant hover:text-secondary/60'}`} />
                        </button>
                      ))}
                    </div>
                    {rating > 0 && <p className="text-xs text-secondary font-label font-medium">Ευχαριστούμε!</p>}
                  </div>

                  <button onClick={handleShare}
                    className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-label font-semibold border transition-all duration-200 shadow-sm ${
                      shareSuccess ? 'bg-secondary-container border-secondary/20 text-on-secondary-container' : 'bg-surface-container-lowest border-outline-variant/10 hover:border-primary/30 hover:bg-surface-container-low text-on-surface-variant hover:text-primary'
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
                      ? 'bg-secondary-container border-secondary/20 text-on-secondary-container'
                      : emailSending
                      ? 'bg-surface-container border-outline-variant/20 text-outline cursor-wait'
                      : 'bg-surface-container-lowest border-outline-variant/10 hover:border-primary/30 text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {emailSent ? (
                    <><Check className="w-4 h-4" /> Στάλθηκε στο {contactInfo.email}</>
                  ) : emailSending ? (
                    <>Αποστολή...</>
                  ) : (
                    <><Mail className="w-4 h-4 text-primary" /> Στείλε αποτελέσματα στο email μου</>
                  )}
                </button>

                {/* Coaching CTA */}
                <div className="bg-surface-container-low rounded-xl p-10 border border-outline-variant/10">
                  <h3 className="text-2xl font-headline font-bold mb-3 text-primary">Έτοιμος για το Επόμενο Βήμα;</h3>
                  <p className="text-on-surface-variant mb-6">Η αξιολόγηση AI σου δίνει μια ισχυρή βάση, αλλά <span className="font-semibold text-on-surface">το προσωπικό coaching</span> μπορεί να σε βοηθήσει ακόμα περισσότερο.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {[{icon:Compass,title:'Αποσαφηνίσεις την Κατεύθυνσή σου',sub:'Με κατάλληλη καθοδήγηση'},{icon:Calendar,title:'Σχέδιο Δράσης',sub:'Για τους επόμενους 6-12 μήνες'},{icon:MessageCircle,title:'Ξεπεράσεις τα Εμπόδια',sub:'Αντιμετώπισε τις ανησυχίες σου'},{icon:Star,title:'Μεγιστοποιήσεις το Δυναμικό σου',sub:'Με expert insights'}].map(({icon:Icon,title,sub})=>(
                      <div key={title} className="flex gap-3"><div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5"><Icon className="w-4 h-4 text-primary" /></div><div><div className="font-label font-semibold text-on-surface">{title}</div><div className="text-sm text-on-surface-variant">{sub}</div></div></div>
                    ))}
                  </div>
                  <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-sm">
                    <div className="mb-4 bg-secondary-container/30 border border-secondary/20 rounded-lg px-4 py-3">
                      <p className="text-sm font-label font-bold text-secondary">✨ Η πρώτη αναγνωριστική συνεδρία είναι ΔΩΡΕΑΝ</p>
                      <p className="text-xs text-on-secondary-container mt-1">Θα γνωριστείτε, θα αναλύσουμε το προφίλ σου και θα σχεδιάσουμε το σχέδιό σας μαζί</p>
                    </div>
                    <div className="flex justify-center">
                      <a href="https://calendly.com/pythiacontact/1-coaching-pythia-ai" target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-primary text-on-primary font-label font-bold text-base hover:opacity-90 transition-all duration-300 shadow-md hover:scale-105">
                        <Calendar className="w-5 h-5" />Κλείσε Δωρεάν Συνεδρία<ChevronRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Bottom buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button onClick={retakeQuestionnaire}
                    className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-label font-semibold bg-surface-container-lowest border border-outline-variant/10 hover:border-primary/20 hover:bg-surface-container-low transition-all duration-200 text-on-surface-variant hover:text-primary shadow-sm">
                    <RefreshCw className="w-4 h-4" />Δοκίμασε Διαφορετικές Απαντήσεις
                  </button>
                  <button onClick={resetApp}
                    className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-label font-semibold bg-surface-container-lowest border border-outline-variant/10 hover:border-primary/20 hover:bg-surface-container-low transition-all duration-200 text-on-surface-variant hover:text-primary shadow-sm">
                    Εξερεύνησε Άλλη Διαδρομή
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── PROFILE ── */}
      {step === 'profile' && profile && (() => {
        const levelInfo = getLevel(profile.totalXP);
        const lvlPct = levelInfo.nextXP
          ? Math.round(((profile.totalXP - levelInfo.min) / (levelInfo.nextXP - levelInfo.min)) * 100)
          : 100;
        const latest = profile.sessions.length > 0 ? profile.sessions[profile.sessions.length - 1] : null;
        const latestPersona = latest?.persona;
        const pCfg = latestPersona ? personaConfig[latestPersona.type] || personaConfig.explorer : null;
        const PIcon = pCfg?.icon;
        const traits = latestPersona?.traits || (latestPersona ? TRAIT_DEFAULTS[latestPersona.type] || TRAIT_DEFAULTS.explorer : null);
        const questSteps = latest?.actionSteps || [];
        const questDone = Object.values(profileCheckedSteps).filter(Boolean).length;
        const questPct = questSteps.length ? Math.round((questDone / questSteps.length) * 100) : 0;
        const xpRewards = [15, 15, 20, 20, 25];
        const typeLabels = { highschool: 'Μαθητής', university: 'Φοιτητής', employee: 'Επαγγελματίας' };
        return (
          <div className="max-w-4xl mx-auto px-6 py-10 animate-fade-in space-y-6">

            {/* ── LEVEL CARD ── */}
            <div className={`rounded-2xl p-8 border shadow-sm overflow-hidden relative ${pCfg ? `bg-gradient-to-br ${pCfg.bg} border-${pCfg.border}` : 'bg-surface-container-lowest border-outline-variant/10'}`}>
              <div className="flex items-center gap-5 mb-6">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${pCfg ? pCfg.gradient : 'from-primary to-primary-container'} flex items-center justify-center text-3xl font-bold text-white shadow-lg ring-4 ring-white/30 flex-shrink-0 ${levelInfo.level === 4 ? 'animate-pulse' : ''}`}>
                  {profile.firstName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-label font-semibold uppercase tracking-widest text-on-surface-variant mb-1">Το dashboard σου</p>
                  <h2 className="text-2xl font-headline font-bold text-on-surface">Γεια σου, {profile.firstName}!</h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-sm font-label font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                      ⚡ Lv.{levelInfo.level} — {levelInfo.name}
                    </span>
                    <span className="text-sm font-label font-semibold text-on-surface-variant">{profile.totalXP} XP</span>
                  </div>
                </div>
              </div>
              {levelInfo.nextXP ? (
                <div>
                  <div className="flex justify-between text-xs text-on-surface-variant mb-2">
                    <span>{profile.totalXP} XP</span>
                    <span>+{levelInfo.nextXP - profile.totalXP} XP → Level {levelInfo.level + 1} ({levelInfo.nextXP} XP)</span>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`h-3 flex-1 rounded-full transition-all duration-700 ${i * 20 < lvlPct ? 'bg-primary' : 'bg-surface-container-high'}`} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-secondary-container/30 border border-secondary/20 text-center">
                  <p className="text-secondary font-label font-bold">🏆 Έχεις φτάσει στο μέγιστο level!</p>
                </div>
              )}
            </div>

            {/* ── STATS ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { val: profile.sessions.length, label: 'Αναλύσεις', color: 'text-primary', icon: '🔍' },
                { val: profile.totalXP, label: 'Συνολικά XP', color: 'text-secondary', icon: '⚡' },
                { val: profile.badges.length, label: 'Badges', color: 'text-primary', icon: '🏅' },
                { val: questDone, label: 'Quests ✅', color: 'text-secondary', icon: '🎯' },
              ].map(({ val, label, color, icon }) => (
                <div key={label} className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/10 shadow-sm text-center">
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className={`text-2xl font-extrabold ${color}`}>{val}</div>
                  <div className="text-xs text-on-surface-variant mt-1 font-label">{label}</div>
                </div>
              ))}
            </div>

            {/* ── PERSONA + RADAR ── */}
            {latestPersona && pCfg && PIcon && (
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm overflow-hidden">
                <div className={`bg-gradient-to-br ${pCfg.bg} p-6 border-b border-outline-variant/10`}>
                  <p className="text-xs font-label font-semibold uppercase tracking-widest text-on-surface-variant mb-3">Το τελευταίο σου προφίλ</p>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${pCfg.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <PIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-extrabold bg-gradient-to-r ${pCfg.gradient} bg-clip-text text-transparent`}>{latestPersona.name}</h3>
                      <p className="text-on-surface-variant text-sm">{latestPersona.tagline}</p>
                    </div>
                  </div>
                </div>
                {traits && (
                  <div className="p-6">
                    <h4 className="font-headline font-bold text-base text-on-surface mb-4 text-center">Χάρτης Δεξιοτήτων</h4>
                    <RadarChart traits={traits} />
                  </div>
                )}
              </div>
            )}

            {/* ── QUEST BOARD ── */}
            {questSteps.length > 0 && (
              <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-headline font-bold text-on-surface">🎮 Quest Board</h3>
                    <p className="text-on-surface-variant text-sm mt-0.5">Ολοκλήρωσε τα βήματα & κέρδισε XP</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-primary">{questPct}%</span>
                    <p className="text-xs text-on-surface-variant">{questDone}/{questSteps.length} quests</p>
                  </div>
                </div>

                {/* Quest progress stepper */}
                <div className="flex items-center gap-1 my-5">
                  {questSteps.map((_, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                        profileCheckedSteps[i] ? 'bg-secondary text-white shadow-md' :
                        i === questDone ? 'bg-primary text-on-primary ring-2 ring-primary/30 animate-pulse' :
                        'bg-surface-container-high text-on-surface-variant'
                      }`}>
                        {profileCheckedSteps[i] ? '✓' : i + 1}
                      </div>
                      {i < questSteps.length - 1 && (
                        <div className="hidden" />
                      )}
                    </div>
                  ))}
                </div>
                {/* Connecting line */}
                <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden mb-6 -mt-2">
                  <div className="h-full bg-secondary rounded-full transition-all duration-700" style={{ width: `${questPct}%` }} />
                </div>

                {/* Quest cards */}
                <div className="space-y-3">
                  {questSteps.map((s, i) => {
                    const done = !!profileCheckedSteps[i];
                    const xp = xpRewards[i] || 15;
                    return (
                      <button key={i} onClick={() => latest && toggleProfileStep(latest.id, i, questSteps)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-300 ${
                          done
                            ? 'border-secondary/30 bg-secondary-container/20 opacity-70'
                            : i === questDone
                            ? 'border-primary/40 bg-primary/5 shadow-sm hover:shadow-md hover:-translate-y-0.5'
                            : 'border-outline-variant/20 bg-surface-container-low hover:bg-surface-container'
                        }`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm transition-all ${
                          done ? 'bg-secondary text-white' :
                          i === questDone ? 'bg-primary text-on-primary' :
                          'bg-surface-container-high text-on-surface-variant'
                        }`}>
                          {done ? '✓' : `Q${i+1}`}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm leading-relaxed ${done ? 'line-through text-outline' : 'text-on-surface'}`}>{s}</span>
                        </div>
                        <div className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-label font-bold ${
                          done ? 'bg-secondary-container/40 text-secondary' : 'bg-primary/10 text-primary'
                        }`}>
                          {done ? '✓' : `+${xp}`} XP
                        </div>
                      </button>
                    );
                  })}
                </div>

                {questPct === 100 && (
                  <div className="mt-5 p-4 rounded-xl bg-secondary-container/30 border border-secondary/20 text-center animate-fade-in">
                    <p className="text-secondary font-label font-bold text-lg">🎉 Όλα τα quests ολοκληρώθηκαν! +50 bonus XP</p>
                  </div>
                )}
              </div>
            )}

            {/* ── BADGES ── */}
            <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 shadow-sm">
              <h3 className="text-xl font-headline font-bold text-on-surface mb-6">🏅 Badges ({profile.badges.length}/{BADGE_ORDER.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {BADGE_ORDER.map(badgeId => {
                  const badge = BADGES[badgeId];
                  const earned = profile.badges.includes(badgeId);
                  return (
                    <div key={badgeId} className={`p-4 rounded-xl border text-center transition-all ${
                      earned ? 'bg-primary/10 border-primary/20 shadow-sm' : 'bg-surface-container border-outline-variant/20 opacity-40'
                    }`}>
                      <div className="text-3xl mb-2">{badge.emoji}</div>
                      <p className={`text-sm font-label font-bold ${earned ? 'text-on-surface' : 'text-on-surface-variant'}`}>{badge.name}</p>
                      <p className="text-xs text-on-surface-variant mt-1">{badge.desc}</p>
                      {!earned && <p className="text-xs text-outline mt-2">🔒 Κλειδωμένο</p>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── SESSION HISTORY ── */}
            {profile.sessions.length > 0 && (
              <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 shadow-sm">
                <h3 className="text-xl font-headline font-bold text-on-surface mb-6">📋 Ιστορικό Αναλύσεων</h3>
                <div className="space-y-3">
                  {[...profile.sessions].reverse().map((s) => {
                    const sCfg = s.persona ? personaConfig[s.persona.type] || personaConfig.explorer : null;
                    const SIcon = sCfg?.icon;
                    return (
                      <div key={s.id} className="flex items-center gap-4 p-4 rounded-xl bg-surface-container border border-outline-variant/20">
                        {SIcon && sCfg && (
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${sCfg.gradient} flex items-center justify-center flex-shrink-0`}>
                            <SIcon className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-label font-semibold text-on-surface text-sm">{s.persona?.name || typeLabels[s.userType] || s.userType}</p>
                          <p className="text-xs text-on-surface-variant">{new Date(s.date).toLocaleDateString('el-GR')} • {typeLabels[s.userType]}</p>
                        </div>
                        {s.rating > 0 && (
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(st => <Star key={st} className={`w-3 h-3 ${st <= s.rating ? 'text-amber-400 fill-amber-400' : 'text-outline-variant'}`} />)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── ACTIONS ── */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pb-8">
              <button onClick={resetApp}
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-label font-bold bg-primary text-on-primary hover:opacity-90 transition-all duration-200 shadow-lg shadow-primary/20">
                <Sparkles className="w-4 h-4" />Νέα Ανάλυση
              </button>
              <button onClick={() => setStep('welcome')}
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-label font-semibold bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/20 transition-all duration-200">
                <ArrowLeft className="w-4 h-4" />Αρχική
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── TERMS OF SERVICE ── */}
      {step === 'terms' && (
        <div className="max-w-3xl mx-auto px-6 py-10 animate-fade-in">
          <button onClick={() => setStep('welcome')} className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary font-label font-semibold transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />Πίσω
          </button>
          <h1 className="text-3xl font-headline font-bold text-primary mb-2">Όροι Χρήσης</h1>
          <p className="text-xs text-on-surface-variant mb-8">Τελευταία ενημέρωση: Απρίλιος 2025</p>
          <div className="space-y-6 text-sm text-on-surface-variant leading-relaxed">
            {[
              { title: '1. Αποδοχή Όρων', body: 'Χρησιμοποιώντας την υπηρεσία e-Pythia αποδέχεστε πλήρως τους παρόντες Όρους Χρήσης. Αν δεν συμφωνείτε, παρακαλούμε να μην χρησιμοποιείτε την υπηρεσία.' },
              { title: '2. Περιγραφή Υπηρεσίας', body: 'Το e-Pythia παρέχει AI-υποστηριζόμενη συμβουλευτική καριέρας μέσω ερωτηματολογίου και ανάλυσης. Οι απαντήσεις είναι ενδεικτικές και δεν αντικαθιστούν επαγγελματική συμβουλή από ειδικούς.' },
              { title: '3. Χρήση Υπηρεσίας', body: 'Η υπηρεσία προορίζεται για προσωπική, μη εμπορική χρήση. Απαγορεύεται η αναπαραγωγή, διανομή ή εμπορική εκμετάλλευση του περιεχομένου χωρίς ρητή γραπτή άδεια.' },
              { title: '4. Λογαριασμός Χρήστη', body: 'Ο χρήστης ευθύνεται για την ασφάλεια των κωδικών πρόσβασής του. Το e-Pythia δεν φέρει ευθύνη για μη εξουσιοδοτημένη πρόσβαση στον λογαριασμό σας.' },
              { title: '5. Περιορισμός Ευθύνης', body: 'Το e-Pythia δεν εγγυάται αποτελέσματα από τη χρήση της υπηρεσίας. Οι αναλύσεις παράγονται αυτόματα από AI και ενδέχεται να περιέχουν ανακρίβειες. Χρησιμοποιήστε τα αποτελέσματα ως αφετηρία σκέψης, όχι ως οριστική καθοδήγηση.' },
              { title: '6. Πνευματική Ιδιοκτησία', body: 'Όλο το περιεχόμενο, το λογισμικό και η τεχνολογία της πλατφόρμας ανήκουν στο e-Pythia. Απαγορεύεται η αντιγραφή ή τροποποίηση χωρίς άδεια.' },
              { title: '7. Τερματισμός', body: 'Διατηρούμε το δικαίωμα να αναστείλουμε ή τερματίσουμε λογαριασμούς που παραβιάζουν τους παρόντες όρους.' },
              { title: '8. Επικοινωνία', body: 'Για οποιαδήποτε απορία σχετικά με τους Όρους Χρήσης, επικοινωνήστε μαζί μας στο pythiacontact@gmail.com.' },
            ].map(({ title, body }) => (
              <div key={title}>
                <h2 className="font-label font-bold text-on-surface mb-1">{title}</h2>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PRIVACY POLICY ── */}
      {step === 'privacy' && (
        <div className="max-w-3xl mx-auto px-6 py-10 animate-fade-in">
          <button onClick={() => setStep('welcome')} className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary font-label font-semibold transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />Πίσω
          </button>
          <h1 className="text-3xl font-headline font-bold text-primary mb-2">Πολιτική Απορρήτου</h1>
          <p className="text-xs text-on-surface-variant mb-8">Τελευταία ενημέρωση: Απρίλιος 2025</p>
          <div className="space-y-6 text-sm text-on-surface-variant leading-relaxed">
            {[
              { title: '1. Υπεύθυνος Επεξεργασίας', body: 'Υπεύθυνος επεξεργασίας των προσωπικών σας δεδομένων είναι η υπηρεσία e-Pythia (pythiacontact@gmail.com). Συμμορφωνόμαστε με τον Γενικό Κανονισμό Προστασίας Δεδομένων (GDPR) της ΕΕ.' },
              { title: '2. Δεδομένα που Συλλέγουμε', body: 'Συλλέγουμε: (α) στοιχεία εγγραφής (όνομα, email), (β) απαντήσεις ερωτηματολογίου, (γ) δεδομένα χρήσης και cookies, (δ) δεδομένα από τρίτες υπηρεσίες (Google Analytics, Supabase).' },
              { title: '3. Σκοπός Επεξεργασίας', body: 'Τα δεδομένα σας χρησιμοποιούνται αποκλειστικά για: παροχή εξατομικευμένης ανάλυσης καριέρας, βελτίωση της υπηρεσίας, αποστολή αποτελεσμάτων μέσω email (μόνο αν το ζητήσετε).' },
              { title: '4. Cookies & Διαφήμιση', body: 'Χρησιμοποιούμε cookies για ανάλυση επισκεψιμότητας (Google Analytics) και για την προβολή σχετικών διαφημίσεων μέσω Google AdSense. Μπορείτε να απενεργοποιήσετε τα cookies από τις ρυθμίσεις του browser σας.' },
              { title: '5. Κοινοποίηση σε Τρίτους', body: 'Δεν πωλούμε ούτε μοιραζόμαστε τα προσωπικά σας δεδομένα με τρίτους, εκτός από τους απαραίτητους παρόχους υπηρεσιών (Supabase για αποθήκευση, OpenAI/Anthropic για AI ανάλυση) και μόνο στον βαθμό που είναι αναγκαίο.' },
              { title: '6. Διατήρηση Δεδομένων', body: 'Διατηρούμε τα δεδομένα σας για όσο διατηρείτε ενεργό λογαριασμό. Μπορείτε να ζητήσετε διαγραφή οποτεδήποτε στο pythiacontact@gmail.com.' },
              { title: '7. Δικαιώματά σας (GDPR)', body: 'Έχετε δικαίωμα πρόσβασης, διόρθωσης, διαγραφής, φορητότητας και εναντίωσης στην επεξεργασία των δεδομένων σας. Για άσκηση των δικαιωμάτων σας επικοινωνήστε στο pythiacontact@gmail.com.' },
              { title: '8. Ασφάλεια', body: 'Εφαρμόζουμε τεχνικά και οργανωτικά μέτρα για την προστασία των δεδομένων σας, συμπεριλαμβανομένης κρυπτογράφησης SSL και ασφαλούς αποθήκευσης μέσω Supabase.' },
              { title: '9. Επικοινωνία', body: 'Για ερωτήματα σχετικά με την προστασία δεδομένων, επικοινωνήστε: pythiacontact@gmail.com' },
            ].map(({ title, body }) => (
              <div key={title}>
                <h2 className="font-label font-bold text-on-surface mb-1">{title}</h2>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center py-10 text-on-surface-variant text-sm border-t border-outline-variant/20 mt-16 px-6">
        <p className="mb-3"><span className="font-headline font-semibold text-primary">e-Pythia</span> • AI Σύμβουλος Καριέρας</p>
        <p className="mt-2"><a href="mailto:pythiacontact@gmail.com" className="text-secondary hover:text-secondary/80 transition-colors font-label font-semibold">pythiacontact@gmail.com</a></p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <button onClick={() => setStep('terms')} className="text-on-surface-variant hover:text-primary underline underline-offset-2 transition-colors text-xs font-label">Όροι Χρήσης</button>
          <span className="text-outline-variant">·</span>
          <button onClick={() => setStep('privacy')} className="text-on-surface-variant hover:text-primary underline underline-offset-2 transition-colors text-xs font-label">Πολιτική Απορρήτου</button>
        </div>
        <p className="mt-4 text-xs text-outline">© {new Date().getFullYear()} e-Pythia. Με επιφύλαξη παντός δικαιώματος.</p>
      </div>


      </> )} {/* end main app */}

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
