import React, { useState, useRef, useEffect } from 'react';
import { 
  Compass, 
  GraduationCap, 
  Briefcase, 
  ChevronRight, 
  ArrowLeft, 
  Sparkles, 
  Eye, 
  Check, 
  Calendar, 
  MessageCircle, 
  Star,
  Building2,
  TrendingUp
} from 'lucide-react';

export default function EPythia() {
  const [step, setStep] = useState('welcome');
  const [userType, setUserType] = useState('');
  const [employeeSector, setEmployeeSector] = useState('');
  const [highschoolType, setHighschoolType] = useState('');
  const [formData, setFormData] = useState({});
  const [contactInfo, setContactInfo] = useState({ firstName: '', lastName: '', email: '' });
  const [recommendations, setRecommendations] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLeadPopup, setShowLeadPopup] = useState(false);
  const [gdprAccepted, setGdprAccepted] = useState(null);
  const [showGdprPopup, setShowGdprPopup] = useState(false);

  const resultsRef = useRef(null);

  // --- GDPR εμφανίζεται στην αρχή ---
  useEffect(() => {
    setShowGdprPopup(true);
  }, []);

  const userTypes = [
    {
      id: 'highschool',
      title: 'Μαθητής',
      description: 'Ανακάλυψε ποιά σχολή σου ταιριάζει καλύτερα',
      icon: GraduationCap,
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      id: 'university',
      title: 'Φοιτητής',
      description: "Βρες το ιδανικό μεταπτυχιακό ή επαγγελματικό ξεκίνημα",
      icon: Compass,
      gradient: 'from-violet-500 to-purple-500',
    },
    {
      id: 'employee',
      title: 'Επαγγελματίας',
      description: 'Εξερεύνησε το επόμενο βήμα της καριέρας σου',
      icon: Briefcase,
      gradient: 'from-fuchsia-500 to-pink-500',
    }
  ];

  const employeeSectors = [
    {
      id: 'public',
      title: 'Δημόσιος Τομέας',
      description: 'Δημόσια υπηρεσία, δημοτική, περιφερειακή διοίκηση, εκπαίδευση, υγεία',
      icon: Building2,
      gradient: 'from-blue-500 to-indigo-500',
    },
    {
      id: 'private',
      title: 'Ιδιωτικός Τομέας',
      description: 'Εταιρείες, startups, ΜΜΕ, επιχειρηματικές δραστηριότητες',
      icon: TrendingUp,
      gradient: 'from-orange-500 to-red-500',
    }
  ];

  const highschoolTypes = [
    {
      id: 'epal',
      title: 'ΕΠΑΛ',
      description: 'Εκπαίδευση με εργαστήρια, πρακτικές δεξιότητες και άμεση εργασιακή δυνατότητα',
      icon: Briefcase,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      id: 'general',
      title: 'Γενικό Λύκειο',
      description: 'Θετική/Τεχνολογική/Ανθρωπιστική κατεύθυνση για πανεπιστημιακές σπουδές',
      icon: GraduationCap,
      gradient: 'from-purple-500 to-pink-500',
    }
  ];

  // Φέρνουμε ερωτήσεις
  const questions = {/* ... οι ίδιες ερωτήσεις που είχες ... */};

  // === Helper για unified λογική ===
  const getCurrentQuestions = () => {
    if (userType === 'highschool') {
      return highschoolType === 'epal'
        ? questions.highschool_epal
        : questions.highschool_general;
    }
    if (userType === 'employee') {
      return employeeSector === 'public'
        ? questions.employee_public
        : questions.employee_private;
    }
    return questions[userType];
  };

  const handleUserTypeSelect = (type) => {
    if (type === 'employee') {
      setUserType(type);
      setStep('employee-sector-select');
      setFormData({});
    } else if (type === 'highschool') {
      setUserType(type);
      setStep('highschool-type-select');
      setFormData({});
    } else {
      setUserType(type);
      setStep('questionnaire');
      setFormData({});
    }
  };

  const handleEmployeeSectorSelect = (sector) => {
    setEmployeeSector(sector);
    setStep('questionnaire');
    setFormData({});
  };

  const handleHighschoolTypeSelect = (type) => {
    setHighschoolType(type);
    setStep('questionnaire');
    setFormData({});
  };

  const handleInputChange = (id, value) => {
    setFormData((p) => ({ ...p, [id]: value }));
  };

  const handleContactChange = (field, value) => {
    setContactInfo((p) => ({ ...p, [field]: value }));
  };

  const handleGdprAccept = (accepted) => {
    setGdprAccepted(accepted);
    setShowGdprPopup(false);
  };

  const isFormComplete = () => {
    const currentQuestions = getCurrentQuestions();
    return currentQuestions?.every((q) => formData[q.id] && formData[q.id].trim() !== '');
  };

  const proceedToContact = () => {
    if (isFormComplete()) setStep('contact');
  };

  const isContactComplete = () =>
    contactInfo.firstName.trim() && contactInfo.lastName.trim() && contactInfo.email.includes('@');

  const generatePrompt = () => {
    // ίδια λογική με πριν
  };

  const handleSubmit = async () => {
    setLoading(true);
    setStep('results');
    try {
      const response = await fetch('/.netlify/functions/epythia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: generatePrompt() }),
      });
      const data = await response.json();
      if (!response.ok) {
        setRecommendations('Σφάλμα κατά την επεξεργασία.');
        return;
      }
      const rec = data.message;
      setRecommendations(rec);

      // αποθήκευση lead μόνο μία φορά
      if (gdprAccepted === true) {
        await fetch('/.netlify/functions/save-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: contactInfo.firstName,
            lastName: contactInfo.lastName,
            email: contactInfo.email,
            userType,
            sector: employeeSector || null,
            highschoolType: highschoolType || null,
            results: rec,
          }),
        });
        setShowLeadPopup(true);
        setTimeout(() => setShowLeadPopup(false), 4000);
      }
    } catch {
      setRecommendations('Σφάλμα. Δοκίμασε ξανά.');
    } finally {
      setLoading(false);
    }
  };

  const resetApp = () => {
    setStep('welcome');
    setUserType('');
    setEmployeeSector('');
    setHighschoolType('');
    setFormData({});
    setContactInfo({ firstName: '', lastName: '', email: '' });
    setRecommendations('');
  };

  const currentQuestions = getCurrentQuestions();
  const currentProgress =
    Math.round(
      (Object.values(formData).filter((v) => v?.trim()).length /
        (currentQuestions?.length || 1)) * 100
    ) || 0;

  // === UI ===
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200">

      {/* GDPR POPUP */}
      {showGdprPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-700">
            <h3 className="text-xl font-bold mb-3">Προστασία Δεδομένων</h3>
            <p className="text-sm text-slate-300 mb-3">
              Οι απαντήσεις σου και τα στοιχεία επικοινωνίας σου χρησιμοποιούνται για
              να σου παρέχουμε εξατομικευμένη ανάλυση καριέρας και πιθανή πρόταση
              για σύμβουλο καριέρας.
            </p>
            <p className="text-xs text-slate-500 mb-4">
              Δεν μοιραζόμαστε τα δεδομένα με τρίτους χωρίς τη ρητή συγκατάθεσή σου.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => handleGdprAccept(false)}
                className="px-4 py-2 rounded-lg text-sm bg-slate-800 hover:bg-slate-700"
              >
                Δεν αποδέχομαι
              </button>
              <button
                onClick={() => handleGdprAccept(true)}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 text-white"
              >
                Αποδέχομαι
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup αποθήκευσης */}
      {showLeadPopup && (
        <div className="fixed inset-0 flex items-end justify-center p-4 z-50 pointer-events-none">
          <div className="animate-bounce bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl px-8 py-4 shadow-2xl mb-6 pointer-events-auto">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-bold text-white">✅ Ευχαριστούμε!</p>
                <p className="text-sm text-white/90">Τα δεδομένα σου αποθηκεύτηκαν</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 bg-slate-900/70 border-b border-slate-700/30 backdrop-blur-2xl z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-cyan-400 via-violet-400 to-fuchsia-400 p-0.5 shadow-lg shadow-violet-500/20">
                <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">e-Pythia</h1>
              <p className="text-xs text-slate-500">Ο Σύμβουλός σου Καριέρας</p>
            </div>
          </div>
          {step !== 'welcome' && (
            <button 
              onClick={resetApp} 
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition duration-200 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Αρχή</span>
            </button>
          )}
        </div>
      </div>

      {/* ... Όλα τα υπόλοιπα sections (welcome, questionnaire, contact, results) παραμένουν ίδια ... */}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce { animation: bounce 0.6s infinite; }
      `}</style>
    </div>
  );
}
