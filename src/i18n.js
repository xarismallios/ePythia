export const translations = {
  el: {
    // Header
    login: 'Σύνδεση',
    signup: 'Εγγραφή',
    signout: 'Έξοδος',
    back: 'Αρχή',

    // Hero
    tagline: 'AI Σύμβουλος Καριέρας — Ελλάδα',
    heroLine1: 'Καλωσόρισες.',
    heroLine2: 'Η πορεία σου',
    heroLine3: 'ξεκινά εδώ.',
    chatPlaceholder: 'Πες μου λίγα λόγια για σένα...',
    startBtn: 'Εκκίνηση →',
    analyzing: 'Ανάλυση...',
    learnMore: 'Μάθε Περισσότερα',

    // Journey section
    journeyTitle: 'Ποια κατηγορία σε εκφράζει;',
    journeyCards: [
      { id: 'highschool',    prompt: 'Είμαι μαθητής και θέλω να δω τι να σπουδάσω',                        type: 'highschool' },
      { id: 'university',   prompt: 'Είμαι φοιτητής και θέλω να δω τις επαγγελματικές μου επιλογές',       type: 'university' },
      { id: 'employee',     prompt: 'Είμαι υπάλληλος και θέλω να αλλάξω καριέρα / δουλειά',               type: 'employee'   },
      { id: 'graduate',     prompt: 'Μόλις αποφοίτησα και ψάχνω την πρώτη μου δουλειά',                   type: 'university' },
      { id: 'freelancer',   prompt: 'Είμαι ελεύθερος επαγγελματίας και ψάχνω νέες κατευθύνσεις',          type: 'employee'   },
      { id: 'career-change',prompt: 'Ψάχνω μια ριζική αλλαγή κατεύθυνσης στη ζωή μου',                   type: 'employee'   },
    ],

    // Testimonials
    testimonials: [
      { text: 'Η e-Pythia με βοήθησε να επιλέξω Πληροφορική αντί για Οικονομικά. Η καλύτερη απόφαση της ζωής μου!', name: 'Νίκος Π.', role: 'Μαθητής, 17 ετών — Αθήνα' },
      { text: 'Ήμουν stuck 2 χρόνια στο δημόσιο. Τώρα έχω σαφές σχέδιο για το επόμενο κεφάλαιό μου.', name: 'Μαρία Σ.', role: 'Δημόσιος υπάλληλος, 34 ετών — Θεσσαλονίκη' },
      { text: 'Σαν να μίλησα με πραγματικό σύμβουλο καριέρας. Εντυπωσιακά εξατομικευμένο.', name: 'Γιώργος Α.', role: 'Φοιτητής, 26 ετών — Πάτρα' },
    ],

    // Step labels
    stepLabels: ['Προφίλ', 'Πακέτο', 'Ερωτήσεις', 'Στοιχεία', 'Αποτελέσματα'],

    // Choose path
    choosePathTitle: 'Διάλεξε τη Διαδρομή σου',
    choosePathStep: 'Βήμα',
    freePlan: 'Δωρεάν',
    premiumPlan: 'Premium',
    comingSoon: 'Σύντομα κοντά σας',
    startFree: 'Ξεκίνα Δωρεάν →',
    freeFeatures: ['Πλήρης AI ανάλυση καριέρας', 'Persona & Radar Chart', 'Action Plan 5 βημάτων', 'Αποθήκευση αποτελεσμάτων'],

    // Sectors
    sectors: [
      { id: 'public',   title: 'Δημόσιος Τομέας',  description: 'Δημόσια υπηρεσία, δημοτική, περιφερειακή διοίκηση, εκπαίδευση, υγεία' },
      { id: 'private',  title: 'Ιδιωτικός Τομέας', description: 'Εταιρείες, startups, ΜΜΕ, επιχειρηματικές δραστηριότητες' },
    ],
    selectSectorTitle: 'Σε ποιο τομέα δραστηριοποιείσαι;',

    // Highschool types
    highschoolTypes: [
      { id: 'epal',    title: 'ΕΠΑΛ',          description: 'Εκπαίδευση με εργαστήρια, πρακτικές δεξιότητες και άμεση εργασιακή δυνατότητα' },
      { id: 'general', title: 'Γενικό Λύκειο', description: 'Θετική/Τεχνολογική/Ανθρωπιστική κατεύθυνση για πανεπιστημιακές σπουδές' },
    ],
    selectHighschoolTitle: 'Ποιο σχολείο παρακολουθείς;',

    // Contact
    contactTitle: 'Σχεδόν Έτοιμο!',
    contactSubtitle: 'Εισήγαγε τα στοιχεία σου για να λάβεις τη δική σου ανάλυση',
    firstNameLabel: 'Όνομα',
    lastNameLabel: 'Επώνυμο',
    emailLabel: 'Email',
    firstNamePlaceholder: 'Εισήγαγε το όνομά σου',
    lastNamePlaceholder: 'Εισήγαγε το επώνυμό σου',
    emailPlaceholder: 'Εισήγαγε το email σου',
    createAnalysisBtn: 'Δημιουργία της Ανάλυσης μου',

    // Results
    loadingTitle: 'Ανάλυση του προφίλ σου...',
    loadingSubtitle: 'Ο AI σύμβουλος δημιουργεί εξατομικευμένη καθοδήγηση',
    careerMapTitle: 'Ο Χάρτης της Καριέρας σου',
    careerMapRoadmapHint: 'Ακολούθησε τα βήματα για να φτάσεις στον στόχο σου',

    // Action plan
    actionPlanTitle: 'Το Σχέδιο Δράσης σου',
    actionPlanSubtitle: 'Τσέκαρε τα βήματα καθώς τα ολοκληρώνεις',
    actionPlanDone: '🎉 Συγχαρητήρια! Ολοκλήρωσες όλα τα βήματα!',
    stepWord: 'Βήμα',
    stepsOf: 'βήματα',

    // Profile CTA
    createProfileTitle: 'Δημιούργησε το Προφίλ σου',
    createProfileDesc: 'Κάνε track τον στόχο σου, παρακολούθησε το σχέδιο δράσης σου, κέρδισε XP και ξεκλείδωσε badges.',
    createProfileBtn: 'Δημιούργησε το Προφίλ μου →',

    // Auth modal
    authLoginTitle: 'Καλωσόρισες πίσω!',
    authSignupTitle: 'Δημιουργία Λογαριασμού',
    authFirstName: 'Όνομα',
    authLastName: 'Επώνυμο',
    authEmail: 'Email',
    authPassword: 'Κωδικός',
    authFirstNamePlaceholder: 'Το όνομά σου',
    authLastNamePlaceholder: 'Το επώνυμό σου',
    authEmailPlaceholder: 'Το email σου',
    authPasswordPlaceholder: 'Κωδικός (min 6 χαρακτήρες)',
    authLoginBtn: 'Σύνδεση →',
    authSignupBtn: 'Δημιουργία Λογαριασμού →',
    authNoAccount: 'Δεν έχεις λογαριασμό;',
    authHaveAccount: 'Έχεις ήδη λογαριασμό;',
    authSignupLink: 'Εγγράψου',
    authLoginLink: 'Συνδέσου',
    authConfirmMsg: '✅ Έλεγξε το email σου για επιβεβαίωση!',
    authPrivacyNote: 'Τα δεδομένα σου προστατεύονται και δεν μοιράζονται σε τρίτους.',

    // Profile dashboard
    dashboardTitle: 'Το dashboard σου',
    dashboardGreeting: 'Γεια σου',
    dashboardMaxLevel: '🏆 Έχεις φτάσει στο μέγιστο level!',
    dashboardStats: ['Αναλύσεις', 'Συνολικά XP', 'Badges', 'Quests ✅'],
    latestProfileLabel: 'Το τελευταίο σου προφίλ',
    skillsMapTitle: 'Χάρτης Δεξιοτήτων',
    questBoardTitle: '🎮 Quest Board',
    questBoardSubtitle: 'Ολοκλήρωσε τα βήματα & κέρδισε XP',
    questsOf: 'quests',
    badgesTitle: 'Badges',
    sessionHistoryTitle: 'Ιστορικό Αναλύσεων',
    sessionLabel: 'Ανάλυση',
    userTypeLabels: { highschool: 'Μαθητής', university: 'Φοιτητής', employee: 'Επαγγελματίας' },

    // Footer
    footerTerms: 'Όροι Χρήσης',
    footerPrivacy: 'Πολιτική Απορρήτου',
    footerCopy: '© 2025 e-Pythia. Με επιφύλαξη παντός δικαιώματος.',

    // Questionnaire
    prevBtn: 'Προηγούμενο',
    nextBtn: 'Επόμενο',
    finishBtn: 'Ολοκλήρωση',
    questionOf: 'από',
    typeAnswer: 'Γράψε τη δική σου απάντηση...',

    // Prompt language instruction
    promptLang: 'el',
  },

  en: {
    // Header
    login: 'Login',
    signup: 'Sign Up',
    signout: 'Logout',
    back: 'Home',

    // Hero
    tagline: 'AI Career Advisor — Greece',
    heroLine1: 'Welcome.',
    heroLine2: 'Your journey',
    heroLine3: 'starts here.',
    chatPlaceholder: 'Tell me a little about yourself...',
    startBtn: 'Get Started →',
    analyzing: 'Analyzing...',
    learnMore: 'Learn More',

    // Journey section
    journeyTitle: 'Which category best describes you?',
    journeyCards: [
      { id: 'highschool',    prompt: 'I\'m a high school student figuring out what to study',               type: 'highschool' },
      { id: 'university',   prompt: 'I\'m a university student exploring my career options',               type: 'university' },
      { id: 'employee',     prompt: 'I\'m employed and looking to change career or job',                   type: 'employee'   },
      { id: 'graduate',     prompt: 'I just graduated and I\'m looking for my first job',                  type: 'university' },
      { id: 'freelancer',   prompt: 'I\'m a freelancer looking for new directions',                        type: 'employee'   },
      { id: 'career-change',prompt: 'I\'m seeking a radical change of direction in my life',               type: 'employee'   },
    ],

    // Testimonials
    testimonials: [
      { text: 'e-Pythia helped me choose Computer Science over Economics. Best decision of my life!', name: 'Nick P.', role: 'Student, 17 — Athens' },
      { text: 'I was stuck in the public sector for 2 years. Now I have a clear plan for my next chapter.', name: 'Maria S.', role: 'Civil servant, 34 — Thessaloniki' },
      { text: 'It felt like talking to a real career advisor. Impressively personalized.', name: 'George A.', role: 'University student, 26 — Patras' },
    ],

    // Step labels
    stepLabels: ['Profile', 'Package', 'Questions', 'Details', 'Results'],

    // Choose path
    choosePathTitle: 'Choose Your Path',
    choosePathStep: 'Step',
    freePlan: 'Free',
    premiumPlan: 'Premium',
    comingSoon: 'Coming soon',
    startFree: 'Start Free →',
    freeFeatures: ['Full AI career analysis', 'Persona & Radar Chart', '5-step Action Plan', 'Save your results'],

    // Sectors
    sectors: [
      { id: 'public',  title: 'Public Sector',   description: 'Civil service, local government, education, healthcare' },
      { id: 'private', title: 'Private Sector',  description: 'Companies, startups, SMEs, entrepreneurial activities' },
    ],
    selectSectorTitle: 'Which sector do you work in?',

    // Highschool types
    highschoolTypes: [
      { id: 'epal',    title: 'Vocational (EPAL)', description: 'Hands-on learning with workshops, practical skills and direct employment' },
      { id: 'general', title: 'General High School', description: 'Science/Tech/Humanities track for university studies' },
    ],
    selectHighschoolTitle: 'Which type of school do you attend?',

    // Contact
    contactTitle: 'Almost There!',
    contactSubtitle: 'Enter your details to receive your personalized analysis',
    firstNameLabel: 'First Name',
    lastNameLabel: 'Last Name',
    emailLabel: 'Email',
    firstNamePlaceholder: 'Enter your first name',
    lastNamePlaceholder: 'Enter your last name',
    emailPlaceholder: 'Enter your email',
    createAnalysisBtn: 'Create My Analysis',

    // Results
    loadingTitle: 'Analyzing your profile...',
    loadingSubtitle: 'The AI advisor is generating personalized guidance',
    careerMapTitle: 'Your Career Map',
    careerMapRoadmapHint: 'Follow the steps to reach your goal',

    // Action plan
    actionPlanTitle: 'Your Action Plan',
    actionPlanSubtitle: 'Check off steps as you complete them',
    actionPlanDone: '🎉 Congratulations! You completed all steps!',
    stepWord: 'Step',
    stepsOf: 'steps',

    // Profile CTA
    createProfileTitle: 'Create Your Profile',
    createProfileDesc: 'Track your goal, follow your action plan, earn XP and unlock badges.',
    createProfileBtn: 'Create My Profile →',

    // Auth modal
    authLoginTitle: 'Welcome back!',
    authSignupTitle: 'Create Account',
    authFirstName: 'First Name',
    authLastName: 'Last Name',
    authEmail: 'Email',
    authPassword: 'Password',
    authFirstNamePlaceholder: 'Your first name',
    authLastNamePlaceholder: 'Your last name',
    authEmailPlaceholder: 'Your email',
    authPasswordPlaceholder: 'Password (min 6 characters)',
    authLoginBtn: 'Login →',
    authSignupBtn: 'Create Account →',
    authNoAccount: "Don't have an account?",
    authHaveAccount: 'Already have an account?',
    authSignupLink: 'Sign up',
    authLoginLink: 'Log in',
    authConfirmMsg: '✅ Check your email to confirm your account!',
    authPrivacyNote: 'Your data is protected and never shared with third parties.',

    // Profile dashboard
    dashboardTitle: 'Your Dashboard',
    dashboardGreeting: 'Hello',
    dashboardMaxLevel: '🏆 You\'ve reached the maximum level!',
    dashboardStats: ['Analyses', 'Total XP', 'Badges', 'Quests ✅'],
    latestProfileLabel: 'Your latest profile',
    skillsMapTitle: 'Skills Map',
    questBoardTitle: '🎮 Quest Board',
    questBoardSubtitle: 'Complete steps & earn XP',
    questsOf: 'quests',
    badgesTitle: 'Badges',
    sessionHistoryTitle: 'Analysis History',
    sessionLabel: 'Analysis',
    userTypeLabels: { highschool: 'Student', university: 'University Student', employee: 'Professional' },

    // Footer
    footerTerms: 'Terms of Service',
    footerPrivacy: 'Privacy Policy',
    footerCopy: '© 2025 e-Pythia. All rights reserved.',

    // Questionnaire
    prevBtn: 'Previous',
    nextBtn: 'Next',
    finishBtn: 'Finish',
    questionOf: 'of',
    typeAnswer: 'Write your answer...',

    // Prompt language instruction
    promptLang: 'en',
  },
};
