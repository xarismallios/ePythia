import React, { useState } from 'react';
import { Compass, GraduationCap, Briefcase, ChevronRight, ArrowLeft, Sparkles, Eye, Check, Calendar, MessageCircle, Star, ArrowRight } from 'lucide-react';

export default function EPythia() {
  const [step, setStep] = useState('welcome');
  const [userType, setUserType] = useState('');
  const [formData, setFormData] = useState({});
  const [contactInfo, setContactInfo] = useState({ firstName: '', lastName: '', email: '' });
  const [recommendations, setRecommendations] = useState('');
  const [loading, setLoading] = useState(false);

  const coachPhotoUrl = "https://media.licdn.com/dms/image/EDIT-WITH-YOUR-LINKEDIN-ID/profile-displayphoto-shrink_400_400/0/TIMESTAMP?e=EXPIRATION&v=VERSION";

  const userTypes = [
    {
      id: 'highschool',
      title: 'Μαθητής',
      description: 'Ανακάλυψε ποιά σχολή σου ταιριάζει καλύτερα',
      icon: GraduationCap,
      gradient: 'from-cyan-500 to-blue-500',
      color: 'cyan'
    },
    {
      id: 'university',
      title: 'Φοιτητής',
      description: "Βρες το ιδανικό μεταπτυχιακό ή επαγγελματικό ξεκίνημα",
      icon: Compass,
      gradient: 'from-violet-500 to-purple-500',
      color: 'violet'
    },
    {
      id: 'employee',
      title: 'Επαγγελματίας',
      description: 'Εξερεύνησε το επόμενο βήμα της καριέρας σου',
      icon: Briefcase,
      gradient: 'from-fuchsia-500 to-pink-500',
      color: 'fuchsia'
    }
  ];

  const questions = {
    highschool: [
      { id: 'subject', label: 'Ποιο μάθημα σου αρέσει περισσότερο;', type: 'select', options: ['Μαθηματικά', 'Φυσική','Χημεία/Βιολογία','Προγραμματισμός','Μαθήματα Οικονομικών & Διοίκησης', 'Τέχνη/Γραφιστικά', 'Ιστορία/Γλώσσες','Κοινωνικά/Ανθρωπιστικά', 'Φυσική Αγωγή'] },
      { id: 'learning', label: 'Πώς προτιμάς να μαθαίνεις;', type: 'select', options: ['Μέσα από θεωρία', 'Μέσα από πράξη', 'Συνδυαστικά'] },
      { id: 'freetime', label: 'Όταν έχεις ελεύθερο χρόνο, τι κάνεις πιο συχνά;', type: 'select', options: ['Παίζω/χακάρω στον υπολογιστή', 'Ζωγραφίζω/φτιάχνω βίντεο', 'Διαβάζω/ψάχνω για ιδέες','Κάνω Αθλήματα','Είμαι με κόσμο'] },
      { id: 'success', label: 'Τι σε κάνει να αισθάνεσαι πετυχημένος;', type: 'select', options: ['Όταν τα καταφέρνω στα δύσκολα προβλήματα', 'Όταν βοηθάω άλλους', 'Όταν με αναγνωρίζουν', 'Όταν μαθαίνω κάτι καινούριο'] },
      { id: 'adaptation', label: 'Πόσο εύκολα προσαρμόζεσαι σε νέα πράγματα;', type: 'select', options: ['Πολύ εύκολα', 'Ανάλογα τη περίσταση', 'Δύσκολα'] },
      { id: 'technology', label: 'Τι ρόλο έχει η τεχνολογία στη ζωή σου;', type: 'select', options: ['Κεντρικό', 'Βοηθητικό', 'Ελάχιστο'] },
      { id: 'environment', label: 'Σε ποιο περιβάλλον νιώθεις πιο άνετα;', type: 'select', options: ['Με σαφείς κανόνες και ρουτίνα', 'Σε ανοιχτό, δημιουργικό χώρο'] },
      { id: 'people', label: 'Πόσο σε ενδιαφέρει να δουλέψεις με ανθρώπους;', type: 'select', options: ['Πολύ', 'Λίγο', 'Ελάχιστα'] },
      { id: 'abroad', label: 'Θα ήθελες να σπουδάσεις στο εξωτερικό;', type: 'select', options: ['Ναι', 'Ίσως', 'Όχι'] },
      { id: 'fear', label: 'Τι φοβάσαι περισσότερο για το μέλλον σου;', type: 'select', options: ['Να μην πετύχω', 'Να μην ξέρω τι θέλω', 'Να μην έχω λεφτά', 'Να βαριέμαι'] },
      { id: 'organized', label: 'Πόσο οργανωμένος είσαι στην καθημερινότητα;', type: 'select', options: ['Πολύ', 'Μέτρια', 'Καθόλου'] },
      { id: 'public_speaking', label: 'Πώς νιώθεις όταν πρέπει να μιλήσεις μπροστά σε άλλους;', type: 'select', options: ['Μου αρέσει', 'Δεν με ενοχλεί', 'Το αποφεύγω'] },
      { id: 'direction', label: 'Αν έπρεπε να επιλέξεις τώρα μια κατεύθυνση, ποια θα διάλεγες;', type: 'select', options: ['Θετική', 'Τεχνολογική', 'Οικονομική', 'Ανθρωπιστική'] },
      { id: 'motivation', label: 'Τι θα σε έκανε να ξυπνάς με ενθουσιασμό κάθε μέρα;', type: 'select', options: ['Δημιουργία', 'Αναγνώριση', 'Εξερεύνηση', 'Σταθερότητα'] },
      { id: 'future_vision', label: '(Ανοιχτή) Πες με δικά σου λόγια πώς φαντάζεσαι τον εαυτό σου στα 25.', type: 'textarea', placeholder: 'Γράψε τη δική σου απάντηση...' }
    ],
    university: [
      { id: 'subject', label: 'Ποιο είναι το αντικείμενο σπουδών σου;', type: 'text', placeholder: 'π.χ. Πληροφορική, Business, Ιατρικά...' },
      { id: 'stage', label: 'Σε ποιο στάδιο βρίσκεσαι;', type: 'select', options: ['Πρώτα έτη', 'Μέση πορεία', 'Τελειόφοιτος/Μεταπτυχιακός'] },
      { id: 'degree_feeling', label: 'Πώς νιώθεις για το πτυχίο σου;', type: 'select', options: ['Ενθουσιασμένος', 'Ουδέτερος', 'Δεν με εκφράζει πια'] },
      { id: 'priority', label: 'Ποιο από τα παρακάτω σου φαίνεται πιο σημαντικό;', type: 'select', options: ['Επαγγελματική σταθερότητα', 'Ευκαιρίες εξέλιξης', 'Δημιουργικότητα', 'Ελευθερία'] },
      { id: 'experience', label: 'Έχεις ήδη επαγγελματική εμπειρία;', type: 'select', options: ['Ναι', 'Όχι'] },
      { id: 'motivation', label: 'Τι σε κινητοποιεί περισσότερο να δουλέψεις;', type: 'select', options: ['Πρόκληση', 'Αναγνώριση', 'Επίδραση', 'Οικονομική άνεση'] },
      { id: 'work_style', label: 'Πώς προτιμάς να δουλεύεις;', type: 'select', options: ['Σε δομημένο αυστηρό περιβάλλον', 'Σε startup φάση', 'Ως freelancer'] },
      { id: 'field', label: 'Ποιο πεδίο σε τραβάει περισσότερο τώρα;', type: 'select', options: ['Τεχνολογία/Data', 'Marketing/Επικοινωνία', 'Business/Finance','Έρευνα/Research', 'Πωλήσεις/Εξυπηρέτηση','Δημόσιος τομέας/ΜΚΟ'] },
      { id: 'asset', label: 'Ποιο είναι το βασικό σου asset;', type: 'select', options: ['Αναλυτική σκέψη', 'Δημιουργικότητα', 'Οργάνωση', 'Διαπροσωπική επικοινωνία'] },
      { id: 'presentation', label: 'Πόσο άνετα νιώθεις να παρουσιάζεις ή να δικτυώνεσαι;', type: 'select', options: ['Πολύ', 'Μέτρια', 'Ελάχιστα'] },
      { id: 'risk', label: 'Πώς θα περιέγραφες το ρίσκο;', type: 'select', options: ['Ευκαιρία', 'Άγχος', 'Εξαρτάται από το πλαίσιο'] },
      { id: 'masters', label: 'Θα σε ενδιέφερε μεταπτυχιακό;', type: 'select', options: ['Ναι, σίγουρα', 'Ίσως', 'Όχι τώρα'] },
      { id: 'location', label: 'Σε ενδιαφέρει να μείνεις Ελλάδα ή να πας εξωτερικό;', type: 'select', options: ['Ελλάδα', 'Εξωτερικό', 'Δεν έχω αποφασίσει'] },
      { id: 'clarity', label: 'Πόσο ξεκάθαρο έχεις τι θέλεις να κάνεις μετά;', type: 'select', options: ['Πολύ', 'Κάπως', 'Καθόλου'] },
      { id: 'opportunity', label: '(Ανοιχτή) Αν είχες ευκαιρία να δοκιμάσεις κάτι για 6 μήνες χωρίς ρίσκο, τι θα ήταν;', type: 'textarea', placeholder: 'Γράψε τη δική σου απάντηση...' }
    ],
    employee: [
      { id: 'experience', label: 'Πόσα χρόνια εμπειρίας έχεις συνολικά;', type: 'select', options: ['0-2 χρόνια', '3-5 χρόνια', '6-10 χρόνια', '10+ χρόνια'] },
      { id: 'industry', label: 'Σε ποιον κλάδο δραστηριοποιείσαι τώρα;', type: 'text', placeholder: 'π.χ. Τεχνολογία, Marketing...' },
      { id: 'satisfaction', label: 'Πόσο ικανοποιημένος είσαι από τη δουλειά σου;', type: 'select', options: ['Πολύ', 'Μέτρια', 'Καθόλου'] },
      { id: 'change_reason', label: 'Τι σε ωθεί περισσότερο να σκεφτείς αλλαγή;', type: 'select', options: ['Burnout', 'Χαμηλές απολαβές', 'Μικρή εξέλιξη', 'Νέο ενδιαφέρον'] },
      { id: 'fulfillment', label: 'Ποιο στοιχείο της δουλειάς σε γεμίζει ακόμα;', type: 'select', options: ['Οι άνθρωποι', 'Η πρόκληση', 'Η σταθερότητα', 'Η ευθύνη'] },
      { id: 'change_first', label: 'Αν έπρεπε να αλλάξεις κάτι πρώτο, τι θα ήταν;', type: 'select', options: ['Ρόλο', 'Κλάδο', 'Εταιρεία', 'Χώρα'] },
      { id: 'work_life_balance', label: 'Πώς βλέπεις την ισορροπία ζωής–δουλειάς;', type: 'select', options: ['Πρωτεύουσα', 'Δευτερεύουσα', 'Δεν με απασχολεί'] },
      { id: 'learning', label: 'Πόσο πρόθυμος είσαι να μάθεις κάτι τελείως νέο;', type: 'select', options: ['Πολύ', 'Μέτρια', 'Ελάχιστα'] },
      { id: 'excited', label: 'Τι σε ενθουσιάζει αυτή την περίοδο;', type: 'select', options: ['Τεχνολογία/AI', 'Επιχειρηματικότητα', 'Δημιουργικότητα', 'Mentoring/Εκπαίδευση'] },
      { id: 'risk', label: 'Πώς νιώθεις με την ιδέα του ρίσκου;', type: 'select', options: ['Εντάξει, αν έχει λόγο', 'Το αποφεύγω', 'Μου αρέσει'] },
      { id: 'key_skill', label: 'Ποια δεξιότητα θα είναι το "κλειδί" σου για το μέλλον;', type: 'select', options: ['Data/AI', 'Strategy', 'Leadership', 'Communication'] },
      { id: 'future_role', label: 'Ποιον ρόλο θα ήθελες να έχεις σε 3 χρόνια;', type: 'select', options: ['Manager/Lead', 'Individual Contributor', 'Founder/Freelancer'] },
      { id: 'environment', label: 'Αν μπορούσες να αλλάξεις περιβάλλον, ποιο θα διάλεγες;', type: 'select', options: ['Πολυεθνική', 'Startup', 'Δημόσιος Τομέας/NGO', 'Self-employed'] },
      { id: 'personality', label: 'Πώς θα περιέγραφες την προσωπικότητά σου στη δουλειά;', type: 'select', options: ['Αναλυτικός', 'Δημιουργικός', 'Οργανωτικός', 'Συναισθηματικά έξυπνος'] },
      { id: 'ideal_chapter', label: '(Ανοιχτή) Αν μπορούσες να σχεδιάσεις το "ιδανικό επόμενο κεφάλαιο" σου, πώς θα το περιέγραφες;', type: 'textarea', placeholder: 'Γράψε τη δική σου απάντηση...' }
    ]
  };

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setStep('questionnaire');
    setFormData({});
  };

  const handleInputChange = (questionId, value) => {
    setFormData((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleContactChange = (field, value) => {
    setContactInfo((prev) => ({ ...prev, [field]: value }));
  };

  const proceedToContact = () => {
    if (isFormComplete()) {
      setStep('contact');
    }
  };

  const generatePrompt = () => {
    const typeLabels = {
      highschool: 'μαθητής που θέλει να επιλέξει ειδίκευση για το πανεπιστήμιο',
      university: 'φοιτητής που σχεδιάζει το επόμενο επαγγελματικό βήμα',
      employee: 'επαγγελματίας που εξερευνά νέες ευκαιρίες ανέλιξης'
    };

    let prompt = `Είσαι η e-Pythia, ένας έμπειρος και εξειδικευμένος σύμβουλος καριέρας. Ένας/μια ${typeLabels[userType]} χρειάζεται τη δική σου καθοδήγηση σχετικά με τα επόμενα βήματα.\n\nΠροφίλ Χρήστη:\n`;

    questions[userType].forEach((q) => {
      const answer = formData[q.id] || 'Δεν δόθηκε απάντηση';
      prompt += `- ${q.label}: ${answer}\n`;
    });

    if (userType === 'highschool') {
      prompt += `\nΠαράσχε καθαρή καθοδήγηση με:\n1. 1-2 κορυφαίες ειδικεύσεις πανεπιστημίου to the point (και γιατί κάθε μία ταιριάζει). Βάλε μέσα pros & cons και προοπτικές \n2. Εναλλακτικές διαδρομές\n3. Δεξιότητες που πρέπει να αναπτύξει\n4. Επόμενα βήματα\n\nΒe encouraging και συγκεκριμένο.`;
    } else if (userType === 'university') {
      prompt += `\nΠαράσχε:\n1. Επαγγελματικές θέσεις ή μεταπτυχιακά προγράμματα\n2. Κλάδους που εκτιμούν τις δεξιότητές του\n3. Βήματα μετάβασης\n4. Δεξιότητες που πρέπει να αναπτύξει\n\nΒe specific με τίτλους θέσεων.`;
    } else {
      prompt += `\nΠαράσχε:\n1. Επόμενα επαγγελματικά βήματα\n2. Πώς να αξιοποιήσει την εμπειρία του\n3. Δεξιότητες που πρέπει να αναπτύξει\n4. Σχέδιο δράσης για τους επόμενους 6-12 μήνες\n\nΒe strategic.`;
    }

    return prompt;
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
        console.error('Server error:', data);
        setRecommendations('Συγγνώμη, υπήρξε σφάλμα κατά την επεξεργασία του αιτήματός σου.');
        return;
      }

      setRecommendations(data.message);
    } catch (error) {
      console.error('Fetch failed:', error);
      setRecommendations('Συγγνώμη, υπήρξε σφάλμα. Παρακαλώ δοκίμασε ξανά.');
    } finally {
      setLoading(false);
    }
  };

  const resetApp = () => {
    setStep('welcome');
    setUserType('');
    setFormData({});
    setContactInfo({ firstName: '', lastName: '', email: '' });
    setRecommendations('');
  };

  const isFormComplete = () => {
    return questions[userType]?.every((q) => formData[q.id] && formData[q.id].trim() !== '');
  };

  const isContactComplete = () => {
    return contactInfo.firstName.trim() && contactInfo.lastName.trim() && contactInfo.email.includes('@');
  };

  const currentProgress = Math.round((Object.values(formData).filter(v => v?.trim()).length / questions[userType]?.length) * 100) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200">
      {/* Navigation Header */}
      <div className="sticky top-0 bg-slate-900/70 border-b border-slate-700/30 backdrop-blur-2xl z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
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

      <div className="max-w-7xl mx-auto px-6 py-16">
        {step === 'welcome' && (
          <div className="animate-fade-in">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="flex justify-center mb-6">
                <Sparkles className="w-6 h-6 text-violet-400 animate-bounce" />
              </div>
              <h2 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent leading-tight">
                e-Pythia
              </h2>
              <p className="text-xl md:text-2xl text-slate-300 mb-2 font-light">Ο 1ος AI Σύμβουλος Καριέρας στην Ελλάδα</p>
              <p className="text-slate-400 max-w-2xl mx-auto mb-12">Λάβε άμεσες και πρακτικές συμβουλές καριέρας με τη δύναμη του AI και στη συνέχεια αν θες συνδύασε το με εξειδικευμένες 1-on-1 συνεδρίες με έναν επαγγελματία σύμβουλο.</p>
            </div>

            {/* User Type Selection */}
            <div className="max-w-6xl mx-auto mb-20">
              <p className="text-center mb-6 text-lg leading-relaxed bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent font-semibold">Διάλεξε τη κατηγορία που ανήκεις και λάβε άμεσα και δωρέαν την ανάλυση μας, για τα επόμενά σου βήματα με τη δύναμη της Τεχνητής Νοημοσύνης</p>
              <div className="flex justify-center mb-8 animate-bounce">
                <ChevronRight className="w-8 h-8 text-violet-400 rotate-90" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {userTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => handleUserTypeSelect(type.id)}
                    className="group relative bg-gradient-to-br from-slate-800/50 to-slate-800/20 backdrop-blur-sm rounded-3xl p-12 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800/0 to-slate-800/0 group-hover:from-slate-800/50 group-hover:to-slate-800/20 rounded-3xl transition-all duration-300" />
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <h3 className="text-2xl font-bold mb-6 group-hover:text-slate-100 transition-colors">Είσαι {type.title};</h3>
                      <p className="text-slate-400 text-base mb-6 group-hover:text-slate-300 transition-colors">{type.description}</p>
                      <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${type.gradient} flex items-center justify-center mb-6 shadow-lg shadow-${type.color}-500/30 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-12 h-12 text-white" />
                      </div>
                      <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-6 h-6 text-violet-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </button>
                );
              })}
              </div>
            </div>

            {/* Coach Card - After Categories */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="text-center mb-8">
                <p className="text-lg leading-relaxed bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent font-semibold mb-4">Θες καθοδήγηση από εξειδικευμένο σύμβουλο καριέρας; Είσαι μόνο ένα click μακριά</p>
                <div className="flex justify-center animate-bounce">
                  <ChevronRight className="w-8 h-8 text-violet-400 rotate-90" />
                </div>
              </div>
            </div>

            {/* Coach Card */}
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-800/50 to-slate-800/20 rounded-2xl p-10 border border-slate-700/50 backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                {/* Illustration */}
                <div className="flex justify-center md:justify-start">
                  <div className="relative">
                    <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-cyan-400 via-violet-400 to-fuchsia-400 p-1 shadow-xl shadow-violet-500/30 flex items-center justify-center">
                      <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center">
                        <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                          {/* Head */}
                          <circle cx="50" cy="30" r="15" fill="#a78bfa"/>
                          {/* Body */}
                          <rect x="35" y="45" width="30" height="35" rx="5" fill="#818cf8"/>
                          {/* Arms */}
                          <rect x="20" y="50" width="15" height="8" rx="4" fill="#a78bfa"/>
                          <rect x="65" y="50" width="15" height="8" rx="4" fill="#a78bfa"/>
                          {/* Tie */}
                          <polygon points="50,45 47,52 53,52" fill="#06b6d4"/>
                        </svg>
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-lg px-3 py-1 text-xs font-bold text-white shadow-lg flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Εξειδικευμένος
                    </div>
                  </div>
                </div>

                {/* Bio & CTA */}
                <div className="md:col-span-2">
                  <h3 className="text-2xl font-bold mb-3">Θα σου Βρούμε τον Ιδανικό Σύμβουλό</h3>
                  <p className="text-slate-300 mb-4">
                    Μετά την ανάλυση AI, θα σε συνδέσουμε με έναν <span className="font-semibold">εξειδικευμένο σύμβουλο καριέρας</span> που έχει ήδη ζήσει το ίδιο path που σκέφτεσαι τώρα.
                  </p>
                  <p className="text-slate-400 text-sm mb-6">
                    Ο σύμβουλός σου θα έχει:
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-300">Πραγματική εμπειρία στον κλάδο που σε ενδιαφέρει</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-300">Ήδη έχει κάνει τη μετάβαση που εσύ σκέφτεσαι</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-300">Θα σου δώσει πρακτικές και εφαρμόσιμες συμβουλές</span>
                    </div>
                  </div>

                  {/* Contact Button */}
                  <div className="mb-6 flex justify-start">
                    <a 
                      href={`mailto:pythiacontact@gmail.com?subject=Ενδιαφέρομαι για Coaching e-Pythia&body=Γεία,\n\nΘα ήθελα να μάθω περισσότερα για το πρόγραμμα coaching και να βρω τον κατάλληλο σύμβουλο για το προφίλ μου.\n\nΑναμένω να ακούσω από εσάς!`}
                      className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 text-white text-sm font-bold hover:opacity-90 transition-all duration-300 shadow-lg shadow-violet-500/30"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Ενδιαφέρομαι
                    </a>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400 mb-1">50+</div>
                  <div className="text-xs text-slate-400">Εξειδικευμένοι Σύμβουλοι & Ειδικότητες</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-violet-400 mb-1">95%</div>
                  <div className="text-xs text-slate-400">Ικανοποιημένοι Χρήστες</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-fuchsia-400 mb-1">10+</div>
                  <div className="text-xs text-slate-400">Χρόνια Εμπειρίας</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'questionnaire' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-3xl font-bold">Πες μας για σένα</h2>
                <span className="text-sm font-semibold text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full">{currentProgress}%</span>
              </div>
              <p className="text-slate-400 mb-6">Οι απαντήσεις σου θα μας βοηθήσουν να σου παρέχουμε εξατομικευμένη καθοδήγηση. Αυτό συνήθως διαρκεί 5-10 λεπτά.</p>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 rounded-full transition-all duration-500"
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/20 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
              <div className="space-y-8">
                {questions[userType].map((question, idx) => (
                  <div key={question.id} className="group">
                    <label className="block text-lg font-semibold mb-3 text-slate-100">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-sm font-bold text-violet-400 mr-3">
                        {idx + 1}
                      </span>
                      {question.label}
                    </label>
                    {question.type === 'textarea' ? (
                      <textarea
                        value={formData[question.id] || ''}
                        onChange={(e) => handleInputChange(question.id, e.target.value)}
                        placeholder={question.placeholder}
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 hover:border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none text-slate-200 min-h-32 transition-all duration-200 placeholder-slate-500"
                      />
                    ) : question.type === 'select' ? (
                      <select
                        value={formData[question.id] || ''}
                        onChange={(e) => handleInputChange(question.id, e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 hover:border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none text-slate-200 transition-all duration-200"
                      >
                        <option value="">Επίλεξε μια επιλογή</option>
                        {question.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={formData[question.id] || ''}
                        onChange={(e) => handleInputChange(question.id, e.target.value)}
                        placeholder={question.placeholder}
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 hover:border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none text-slate-200 transition-all duration-200 placeholder-slate-500"
                      />
                    )}
                    {formData[question.id]?.trim() && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Check className="w-4 h-4" />
                        <span>Η απάντηση καταγράφηκε</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={proceedToContact}
                disabled={!isFormComplete()}
                className={`w-full mt-10 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                  isFormComplete()
                    ? 'bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 text-white hover:opacity-90 hover:shadow-lg hover:shadow-violet-500/50 cursor-pointer'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                }`}
              >
                Συνέχεια στα Αποτελέσματα
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 'contact' && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/20 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
              <h2 className="text-3xl font-bold mb-2">Σχεδόν Έτοιμο!</h2>
              <p className="text-slate-400 mb-8">Εισήγαγε τα στοιχεία σου για να λάβεις τη δική σου εξατομικευμένη καθοδήγηση</p>
              <div className="space-y-6">
                {['firstName', 'lastName', 'email'].map((field) => (
                  <div key={field}>
                    <label className="block text-base font-semibold mb-3 capitalize text-slate-100">
                      {field === 'firstName' ? 'Όνομα' : field === 'lastName' ? 'Επώνυμο' : 'Email'}
                    </label>
                    <div className="relative">
                      <input
                        type={field === 'email' ? 'email' : 'text'}
                        value={contactInfo[field]}
                        onChange={(e) => handleContactChange(field, e.target.value)}
                        placeholder={`Εισήγαγε το ${field === 'firstName' ? 'όνομά σου' : field === 'lastName' ? 'επώνυμό σου' : 'email σου'}`}
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 hover:border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none text-slate-200 transition-all duration-200 placeholder-slate-500"
                      />
                      {contactInfo[field] && (
                        <Check className="absolute right-4 top-3.5 w-5 h-5 text-emerald-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleSubmit}
                disabled={!isContactComplete()}
                className={`w-full mt-10 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                  isContactComplete()
                    ? 'bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 text-white hover:opacity-90 hover:shadow-lg hover:shadow-violet-500/50 cursor-pointer'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                Δημιουργία της Καριέρας μου
              </button>
            </div>
          </div>
        )}

        {step === 'results' && (
          <div className="max-w-5xl mx-auto animate-fade-in">
            {loading ? (
              <div className="text-center py-32">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 border-4 border-slate-700 border-t-violet-500 rounded-full animate-spin" />
                </div>
                <p className="text-2xl font-semibold text-slate-300 mb-2">Ανάλυση του προφίλ σου...</p>
                <p className="text-slate-400">Ο AI σύμβουλος καριέρας δημιουργεί εξατομικευμένη καθοδήγηση για σένα</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* AI Recommendations */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/20 rounded-2xl p-10 border border-slate-700/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <Sparkles className="w-8 h-8 text-violet-400" />
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                      Ο Χάρτης της Καριέρας σου
                    </h2>
                  </div>
                  <div className="text-slate-200 text-lg leading-relaxed whitespace-pre-wrap space-y-4">
                    {recommendations.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className="text-slate-300">{paragraph}</p>
                    ))}
                  </div>
                </div>

                {/* Coaching Call-to-Action Card */}
                <div className="bg-gradient-to-br from-cyan-900/30 via-violet-900/30 to-fuchsia-900/30 rounded-2xl p-10 border border-violet-500/30 backdrop-blur-sm shadow-lg shadow-violet-500/10">
                  <div className="max-w-3xl">
                    <h3 className="text-2xl font-bold mb-3 text-slate-100">Έτοιμος για το Επόμενο Βήμα;</h3>
                    <p className="text-slate-300 mb-6">
                      Η αξιολόγηση AI παραπάνω σου δίνει μια ισχυρή βάση, αλλά <span className="font-semibold">το προσωπικό coaching μαζί μου</span> μπορεί να σε βοηθήσει να:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <div className="flex gap-3">
                        <Compass className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                        <div>
                          <div className="font-semibold text-slate-200">Αποσαφηνίσεις την Κατεύθυνσή σου</div>
                          <div className="text-sm text-slate-400">Περιηγηθείτε τις επιλογές με ειδική καθοδήγηση</div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Calendar className="w-5 h-5 text-violet-400 flex-shrink-0 mt-1" />
                        <div>
                          <div className="font-semibold text-slate-200">Δημιουργήσεις Σχέδιο Δράσης</div>
                          <div className="text-sm text-slate-400">Συγκεκριμένα βήματα για τους επόμενους 6-12 μήνες</div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <MessageCircle className="w-5 h-5 text-fuchsia-400 flex-shrink-0 mt-1" />
                        <div>
                          <div className="font-semibold text-slate-200">Ξεπεράσεις τα Εμπόδια</div>
                          <div className="text-sm text-slate-400">Αντιμετώπισε τις ανησυχίες και ξεκλείδωσε το δυναμικό σου</div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Star className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-1" />
                        <div>
                          <div className="font-semibold text-slate-200">Μεγιστοποιήσεις το Δυναμικό σου</div>
                          <div className="text-sm text-slate-400">Λάβε insights που μόνο ένας πραγματικός σύμβουλος μπορεί να δώσει</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900/50 rounded-xl p-6 mb-6 border border-slate-700">
                      <p className="text-sm text-slate-400 mb-3">📧 <span className="text-slate-200 font-semibold">Επικοινώνησε μαζί μου για μια προσωπική συνεδρία coaching:</span></p>
                      <a 
                        href={`mailto:pythiacontact@gmail.com?subject=Αίτημα Συνεδρίας Coaching - ${contactInfo.firstName}&body=Γεία σας Χάρη,\n\nΑρτίως ολοκλήρωσα την αξιολόγηση e-Pythia και θα ήθελα να κανονίσουμε μια συνεδρία coaching για να συζητήσουμε την επαγγελματική μου πορεία.\n\nΌνομα: ${contactInfo.firstName} ${contactInfo.lastName}\nEmail: ${contactInfo.email}\n\nΑναμένω να συνδεθούμε!`}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 text-white font-bold hover:opacity-90 transition-all duration-300 shadow-lg shadow-violet-500/30"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Κανονίστε Συνεδρία Coaching
                      </a>
                    </div>

                    <p className="text-xs text-slate-500">
                      Περιορισμένες θέσεις διαθέσιμες. Απάντησε γρήγορα για να εξασφαλίσεις τη δική σου συνεδρία.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={resetApp}
                    className="px-8 py-3 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all duration-200"
                  >
                    Εξέτασε Άλλη Διαδρομή
                  </button>
                  <button
                    onClick={() => {
                      const text = `e-Pythia Καθοδήγηση Καριέρας για ${contactInfo.firstName}\n\n${recommendations}`;
                      const blob = new Blob([text], { type: 'text/plain' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `career-guidance-${Date.now()}.txt`;
                      a.click();
                    }}
                    className="px-8 py-3 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all duration-200"
                  >
                    Κάντε Download τα Αποτελέσματά μου
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-10 text-slate-500 text-sm border-t border-slate-800/50 mt-16">
        <p className="mb-3">
          <span className="font-semibold text-slate-300">e-Pythia</span> • AI Σύμβουλος Καριέρας από τον <span className="font-semibold text-slate-300">Χάρη Μάλλιο</span>
        </p>
        <div className="flex items-center justify-center gap-2">
          <span>✨ Συνδυάζοντας την δύναμη της Τεχνητή Νοημοσύνη με την Ανθρώπινη Εμπειρία Χρόνων ✨</span>
        </div>
        <p className="mt-3">
          <a href="mailto:pythiacontact@gmail.com" className="text-violet-400 hover:text-violet-300 transition-colors font-semibold">
            pythiacontact@gmail.com
          </a>
        </p>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}