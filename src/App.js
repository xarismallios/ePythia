import React, { useState, useRef } from 'react';
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

  const resultsRef = useRef(null);

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
      { id: 'vision_35', label: '(Ανοιχτή) Πες με δικά σου λόγια πώς φαντάζεσαι τον εαυτό σου στα 35.', type: 'textarea', placeholder: 'Γράψε τη δική σου απάντηση...' }
    ],
    highschool_general: [
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
      { id: 'direction', label: 'Ποια κατεύθυνση σε ενδιαφέρει περισσότερο;', type: 'select', options: ['Θετική (Math, Physics, Biology)', 'Τεχνολογική (Tech/Engineering)', 'Οικονομική (Business/Economics)', 'Ανθρωπιστική (Humanities/Social)'] },
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
      { id: 'ideal_scenario', label: '(Ανοιχτή) Περιέγραψε το ιδανικό "επόμενο κεφάλαιο" σου.', type: 'textarea', placeholder: 'Γράψε τη δική σου απάντηση...' }
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
      { id: 'vision', label: '(Ανοιχτή) Ποια είναι η δική σου ιδανική σταδιοδρομία;', type: 'textarea', placeholder: 'Γράψε τη δική σου απάντηση...' }
    ]
  };

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setFormData({});
    
    if (type === 'employee') {
      setStep('employee-sector-select');
    } else if (type === 'highschool') {
      setStep('highschool-type-select');
    } else {
      setStep('questionnaire');
    }
  };

  const handleEmployeeSectorSelect = (sector) => {
    setEmployeeSector(sector);
    setFormData({});
    setStep('questionnaire');
  };

  const handleHighschoolTypeSelect = (type) => {
    setHighschoolType(type);
    setFormData({});
    setStep('questionnaire');
  };

  const handleInputChange = (questionId, value) => {
    setFormData((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleContactChange = (field, value) => {
    setContactInfo((prev) => ({ ...prev, [field]: value }));
  };

  const proceedToContact = () => {
    const currentQuestions = userType === 'highschool' 
      ? (highschoolType === 'epal' ? questions.highschool_epal : questions.highschool_general)
      : userType === 'employee' 
      ? (employeeSector === 'public' ? questions.employee_public : questions.employee_private)
      : questions[userType];
    
    if (currentQuestions?.every((q) => formData[q.id] && formData[q.id].trim() !== '')) {
      setStep('contact');
    }
  };

  const generatePrompt = () => {
    const typeLabels = {
      highschool_epal: 'μαθητής ΕΠΑΛ που σχεδιάζει την επαγγελματική του διαδρομή',
      highschool_general: 'μαθητής Γενικού Λυκείου που χρειάζεται καθοδήγηση για τη κατεύθυνση και τις σπουδές',
      university: 'φοιτητής που σχεδιάζει το επόμενο επαγγελματικό βήμα',
      employee_public: 'επαγγελματίας του δημόσιου τομέα που εξερευνά νέες ευκαιρίες ανέλιξης',
      employee_private: 'επαγγελματίας του ιδιωτικού τομέα που εξερευνά νέες ευκαιρίες ανέλιξης'
    };

    let userTypeKey = userType;
    if (userType === 'highschool') {
      userTypeKey = `highschool_${highschoolType}`;
    } else if (userType === 'employee') {
      userTypeKey = `employee_${employeeSector}`;
    }

    const currentQuestions = userType === 'highschool' 
      ? (highschoolType === 'epal' ? questions.highschool_epal : questions.highschool_general)
      : userType === 'employee' 
      ? (employeeSector === 'public' ? questions.employee_public : questions.employee_private)
      : questions[userType];

    let prompt = `Είσαι η e-Pythia, ένας έμπειρος και εξειδικευμένος σύμβουλος καριέρας. Ένας/μια ${typeLabels[userTypeKey]} χρειάζεται τη δική σου καθοδήγηση σχετικά με τα επόμενα βήματα.\n\nΠροφίλ Χρήστη:\n`;
    
    currentQuestions.forEach((q) => {
      const answer = formData[q.id] || 'Δεν δόθηκε απάντηση';
      prompt += `- ${q.label}: ${answer}\n`;
    });

    if (userType === 'highschool' && highschoolType === 'epal') {
      prompt += `\nΠαράσχε καθαρή καθοδήγηση με:\n1. 1-2 ειδικότητες ΕΠΑΛ που ταιριάζουν (και γιατί κάθε μία ταιριάζει). Βάλε μέσα pros & cons, προοπτικές εργασίας και πλάνο εξέλιξης\n2. Εναλλακτικές επαγγελματικές διαδρομές (και άλλα ΕΠΑΛ ή άλλες επιλογές)\n3. Δεξιότητες που πρέπει να αναπτύξει (soft skills, τεχνικές δεξιότητες, γλώσσες)\n4. Επόμενα βήματα (πρακτική, σύντομη πρόγνωση)\n\nBe encouraging, συγκεκριμένο και ρεαλιστικό. Κάνε τις προτάσεις σας με βάση την ελληνική αγορά εργασίας.`;
    } else if (userType === 'highschool' && highschoolType === 'general') {
      prompt += `\nΠαράσχε:\n1. 1-2 κορυφαίες κατευθύνσεις/σπουδές που ταιριάζουν (και γιατί κάθε μία ταιριάζει). Βάλε μέσα pros & cons και προοπτικές\n2. Εναλλακτικές κατευθύνσεις/σχολές\n3. Δεξιότητες που πρέπει να αναπτύξει πριν ή κατά τις σπουδές\n4. Επόμενα βήματα (προετοιμασία για Πανελλήνιες, επιλογή σχολών, κλπ)\n\nBe specific με ονόματα σχολών (ΑΕΙ/ΤΕΙ), κατευθύνσεων και επαγγελματικών πεδίων.`;
    } else if (userType === 'university') {
      prompt += `\nΠαράσχε:\n1. Επαγγελματικές θέσεις ή μεταπτυχιακά προγράμματα\n2. Κλάδους που εκτιμούν τις δεξιότητές του\n3. Βήματα μετάβασης\n4. Δεξιότητες που πρέπει να αναπτύξει\n\nBe specific με τίτλους θέσεων.`;
    } else if (userType === 'employee' && employeeSector === 'public') {
      prompt += `\nΠαράσχε:\n1. Επόμενα επαγγελματικά βήματα στο δημόσιο τομέα ή εναλλακτικές διαδρομές\n2. Πώς να αξιοποιήσει την εμπειρία και τα credentials του\n3. Δεξιότητες που πρέπει να αναπτύξει\n4. Σχέδιο δράσης για τους επόμενους 6-12 μήνες\n\nBe strategic και λάβε υπόψιν τα ειδικά χαρακτηριστικά του δημόσιου τομέα.`;
    } else if (userType === 'employee' && employeeSector === 'private') {
      prompt += `\nΠαράσχε:\n1. Επόμενα επαγγελματικά βήματα (αλλαγή εταιρείας, κλάδου, ή νέα αρχή)\n2. Πώς να αξιοποιήσει την εμπειρία του\n3. Δεξιότητες που πρέπει να αναπτύξει\n4. Σχέδιο δράσης για τους επόμενους 6-12 μήνες\n\nBe strategic και δυναμικό.`;
    }

    prompt += `
\n\nΔώσε την απάντηση σε δομημένη μορφή με markdown, με ξεκάθαρες ενότητες:
### 1. Κορυφαίες επιλογές
### 2. Εναλλακτικές διαδρομές
### 3. Δεξιότητες που πρέπει να αναπτύξει
### 4. Επόμενα βήματα

Μην προσθέτεις χαιρετισμούς (π.χ. "Φίλε/η μαθητή/τρια") ούτε καταληκτικές γενικές παραγράφους.
Μην ξαναγράφεις τίτλο με το όνομα e-Pythia ή το όνομα του χρήστη. Ξεκίνα κατευθείαν από το πρώτο section.
`.trim();

    return prompt;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setStep('results');

    try {
      // 1. Πάρε τις συστάσεις από το LLM
      const response = await fetch('/.netlify/functions/epythia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: generatePrompt() }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Server error:', data);
        setRecommendations('Συγγνώμη, υπήρξε σφάλμα κατά την επεξεργασία του αιτήματός σου.');
        setLoading(false);
        return;
      }

      const recommendations = data.message;
      setRecommendations(recommendations);

      // 2. Σώσε το lead - αφού δεν έχουμε GDPR popup, αποδεχόμαστε πάντα
      if (!leadSaved) {
        setLeadSaved(true); // Prevent duplicate saves
        
        await fetch('/.netlify/functions/save-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: contactInfo.firstName,
            lastName: contactInfo.lastName,
            email: contactInfo.email,
            userType: userType,
            sector: employeeSector || null,
            highschoolType: highschoolType || null,
            results: recommendations
          })
        }).catch(err => console.error('Lead save error:', err));

        // 3. Δείξε το popup ευχαριστιών
        setShowLeadPopup(true);
        setTimeout(() => setShowLeadPopup(false), 4000);
      }

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
    setEmployeeSector('');
    setHighschoolType('');
    setFormData({});
    setContactInfo({ firstName: '', lastName: '', email: '' });
    setRecommendations('');
  };

  const isFormComplete = () => {
    const currentQuestions = userType === 'highschool' 
      ? (highschoolType === 'epal' ? questions.highschool_epal : questions.highschool_general)
      : userType === 'employee' 
      ? (employeeSector === 'public' ? questions.employee_public : questions.employee_private)
      : questions[userType];
    
    return currentQuestions?.every((q) => formData[q.id] && formData[q.id].trim() !== '');
  };

  const isContactComplete = () => {
    return contactInfo.firstName.trim() && contactInfo.lastName.trim() && contactInfo.email.includes('@');
  };

  const currentQuestions = userType === 'highschool' 
    ? (highschoolType === 'epal' ? questions.highschool_epal : questions.highschool_general)
    : userType === 'employee' 
    ? (employeeSector === 'public' ? questions.employee_public : questions.employee_private)
    : questions[userType];
  
  const currentProgress = Math.round((Object.values(formData).filter(v => v?.trim()).length / currentQuestions?.length) * 100) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200">
      {/* Lead Saved Popup */}
      {showLeadPopup && (
        <div className="fixed inset-0 flex items-end justify-center p-4 z-50 pointer-events-none">
          <div className="animate-bounce bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl px-8 py-4 shadow-2xl mb-6 pointer-events-auto">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-bold text-white">✅ Ευχαριστούμε!</p>
                <p className="text-sm text-white/90">Τα δεδομένα σου αποθηκεύτηκαν με επιτυχία</p>
              </div>
            </div>
          </div>
        </div>
      )}

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
        
        {/* Welcome Screen */}
        {step === 'welcome' && (
          <div className="animate-fade-in">
            <div className="text-center mb-16">
              <div className="flex justify-center mb-6">
                <Sparkles className="w-6 h-6 text-violet-400 animate-bounce" />
              </div>
              <h2 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent leading-tight">
                e-Pythia
              </h2>
              <p className="text-xl md:text-2xl text-slate-300 mb-2 font-light">Ο 1ος AI Σύμβουλος Καριέρας στην Ελλάδα</p>
              <p className="text-slate-400 max-w-2xl mx-auto mb-12">Λάβε άμεσες και πρακτικές συμβουλές καριέρας με τη δύναμη του AI</p>
            </div>

            <div className="max-w-6xl mx-auto mb-20">
              <p className="text-center mb-6 text-lg leading-relaxed bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent font-semibold">
                Διάλεξε τη κατηγορία που ανήκεις
              </p>
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
                        <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${type.gradient} flex items-center justify-center mb-6 shadow-lg`}>
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

              {/* Coach Card - Intro */}
              <div className="max-w-4xl mx-auto mb-12 mt-20">
                <div className="text-center mb-8">
                  <p className="text-lg leading-relaxed bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent font-semibold mb-4">
                    Θες καθοδήγηση από εξειδικευμένο σύμβουλο καριέρας; Είσαι μόνο ένα click μακριά
                  </p>
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
                            <circle cx="50" cy="30" r="15" fill="#a78bfa"/>
                            <rect x="35" y="45" width="30" height="35" rx="5" fill="#818cf8"/>
                            <rect x="20" y="50" width="15" height="8" rx="4" fill="#a78bfa"/>
                            <rect x="65" y="50" width="15" height="8" rx="4" fill="#a78bfa"/>
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

                    {/* Free Session Badge */}
                    <div className="mb-6 inline-block bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/50 rounded-lg px-4 py-2 mb-4">
                      <p className="text-sm font-bold text-emerald-300">✨ Η πρώτη αναγνωριστική συνεδρία είναι ΔΩΡΕΑΝ</p>
                    </div>

                    {/* Contact Button */}
                    <div className="mb-6 flex justify-center">
                      <a 
                        href="https://calendly.com/pythiacontact/1-coaching-pythia-ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 text-white font-bold hover:opacity-90 transition-all duration-300 shadow-lg shadow-violet-500/30 hover:scale-105"
                      >
                        <Calendar className="w-5 h-5" />
                        Κλείσε Δωρεάν Συνεδρία
                        <ChevronRight className="w-4 h-4" />
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
          </div>
        )}

        {/* Highschool Type Select */}
        {step === 'highschool-type-select' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Σε ποιο σχολείο πας;</h2>
              <p className="text-slate-400">Διάλεξε για να λάβεις προσαρμοσμένες ερωτήσεις</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {highschoolTypes.map((hsType) => {
                const Icon = hsType.icon;
                return (
                  <button
                    key={hsType.id}
                    onClick={() => handleHighschoolTypeSelect(hsType.id)}
                    className="group relative bg-gradient-to-br from-slate-800/50 to-slate-800/20 backdrop-blur-sm rounded-3xl p-12 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-2"
                  >
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <h3 className="text-2xl font-bold mb-3 group-hover:text-slate-100 transition-colors">{hsType.title}</h3>
                      <p className="text-slate-400 text-sm mb-6 group-hover:text-slate-300 transition-colors">{hsType.description}</p>
                      <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${hsType.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                        <Icon className="w-12 h-12 text-white" />
                      </div>
                      <ChevronRight className="w-6 h-6 text-violet-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Employee Sector Select */}
        {step === 'employee-sector-select' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Σε ποιον τομέα δραστηριοποιείσαι;</h2>
              <p className="text-slate-400">Διάλεξε για να λάβεις προσαρμοσμένες ερωτήσεις</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {employeeSectors.map((sector) => {
                const Icon = sector.icon;
                return (
                  <button
                    key={sector.id}
                    onClick={() => handleEmployeeSectorSelect(sector.id)}
                    className="group relative bg-gradient-to-br from-slate-800/50 to-slate-800/20 backdrop-blur-sm rounded-3xl p-12 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-2"
                  >
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <h3 className="text-2xl font-bold mb-3 group-hover:text-slate-100 transition-colors">{sector.title}</h3>
                      <p className="text-slate-400 text-sm mb-6 group-hover:text-slate-300 transition-colors">{sector.description}</p>
                      <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${sector.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                        <Icon className="w-12 h-12 text-white" />
                      </div>
                      <ChevronRight className="w-6 h-6 text-violet-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Questionnaire */}
        {step === 'questionnaire' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-3xl font-bold">Πες μας για σένα</h2>
                <span className="text-sm font-semibold text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full">{currentProgress}%</span>
              </div>
              <p className="text-slate-400 mb-6">Οι απαντήσεις σου θα μας βοηθήσουν να σου παρέχουμε εξατομικευμένη καθοδήγηση.</p>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 rounded-full transition-all duration-500"
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/20 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
              <div className="space-y-8">
                {currentQuestions?.map((question, idx) => (
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
                      <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400">
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
                Συνέχεια 
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Contact Info */}
        {step === 'contact' && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/20 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
              <h2 className="text-3xl font-bold mb-2">Σχεδόν Έτοιμο!</h2>
              <p className="text-slate-400 mb-8">Εισήγαγε τα στοιχεία σου για να λάβεις τη δική σου ανάλυση</p>
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
                Δημιουργία της Ανάλυσης μου
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {step === 'results' && (
          <div className="max-w-5xl mx-auto animate-fade-in">
            {loading ? (
              <div className="text-center py-32">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 border-4 border-slate-700 border-t-violet-500 rounded-full animate-spin" />
                </div>
                <p className="text-2xl font-semibold text-slate-300 mb-2">Ανάλυση του προφίλ σου...</p>
                <p className="text-slate-400">Ο AI σύμβουλος δημιουργεί εξατομικευμένη καθοδήγηση</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div
                  ref={resultsRef}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-800/20 rounded-2xl p-10 border border-slate-700/50 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <Sparkles className="w-8 h-8 text-violet-400" />
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                      Ο Χάρτης της Καριέρας σου
                    </h2>
                  </div>

                  {/* Recommendations Section */}
                  <div className="text-lg leading-relaxed space-y-4">
                    {recommendations.split('\n').map((line, idx) => {
                      if (line.startsWith('###')) {
                        return (
                          <h3 key={idx} className="mt-8 mb-3 text-2xl font-bold text-cyan-300 border-b border-slate-700 pb-1 flex items-center gap-2 pt-6">
                            <Sparkles className="w-5 h-5 text-violet-400" />
                            {line.replace('### ', '')}
                          </h3>
                        );
                      }
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return (
                          <p key={idx} className="text-slate-200 font-semibold">
                            {line.replace(/\*\*/g, '')}
                          </p>
                        );
                      }
                      if (line.startsWith('-')) {
                        return (
                          <p key={idx} className="ml-4 text-slate-300 flex gap-3">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                            <span>{line.replace('- ', '')}</span>
                          </p>
                        );
                      }
                      return line.trim() && (
                        <p key={idx} className="text-slate-300">
                          {line}
                        </p>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-cyan-900/30 via-violet-900/30 to-fuchsia-900/30 rounded-2xl p-10 border border-violet-500/30 backdrop-blur-sm">
                  <h3 className="text-2xl font-bold mb-3 text-slate-100">Έτοιμος για το Επόμενο Βήμα;</h3>
                  <p className="text-slate-300 mb-6">
                    Η αξιολόγηση AI παραπάνω σου δίνει μια ισχυρή βάση, αλλά <span className="font-semibold">το προσωπικό coaching</span> μπορεί να σε βοηθήσει ακόμα περισσότερο.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="flex gap-3">
                      <Compass className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-semibold text-slate-200">Αποσαφηνίσεις την Κατεύθυνσή σου</div>
                        <div className="text-sm text-slate-400">Με κατάλληλη καθοδήγηση</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Calendar className="w-5 h-5 text-violet-400 flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-semibold text-slate-200">Σχέδιο Δράσης</div>
                        <div className="text-sm text-slate-400">Για τους επόμενους 6-12 μήνες</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <MessageCircle className="w-5 h-5 text-fuchsia-400 flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-semibold text-slate-200">Ξεπεράσεις τα Εμπόδια</div>
                        <div className="text-sm text-slate-400">Αντιμετώπισε τις ανησυχίες σου</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Star className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-semibold text-slate-200">Μεγιστοποιήσεις το Δυναμικό σου</div>
                        <div className="text-sm text-slate-400">Με expert insights</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                    <div className="mb-4 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/50 rounded-lg px-4 py-3">
                      <p className="text-sm font-bold text-emerald-300">✨ Η πρώτη αναγνωριστική συνεδρία είναι ΔΩΡΕΑΝ</p>
                      <p className="text-xs text-emerald-200 mt-1">Θα γνωριστείτε, θα αναλύσουμε το προφίλ σου και θα σχεδιάσουμε το σχέδιό σας μαζί</p>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">📧 <span className="text-slate-200 font-semibold">Κανονίστε συνεδρία coaching:</span></p>
                    <div className="flex justify-center">
                      <a 
                        href="https://calendly.com/pythiacontact/1-coaching-pythia-ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 text-white font-bold text-lg hover:opacity-90 transition-all duration-300 shadow-lg shadow-violet-500/40 hover:scale-105"
                      >
                        <Calendar className="w-6 h-6" />
                        Κλείσε Δωρεάν Συνεδρία
                        <ChevronRight className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={resetApp}
                    className="px-8 py-3 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all duration-200"
                  >
                    Εξερεύνησε Άλλη Διαδρομή
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
          <span className="font-semibold text-slate-300">e-Pythia</span> • AI Σύμβουλος Καριέρας
        </p>
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
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce {
          animation: bounce 0.6s infinite;
        }
      `}</style>
    </div>
  );
}
