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

  // ... (rest of your userTypes, employeeSectors, highschoolTypes remain the same)

  const handleSubmit = async () => {
    setLoading(true);
    setStep('results');

    try {
      // Simulate LLM response with markdown formatted output
      const recommendations = `### 1. Κορυφαίες επιλογές
Με βάση τις απαντήσεις σου, σε συνιστώ να ακολουθήσεις ένα δομημένο σχέδιο ανάπτυξης.

- Πρώτη επιλογή: Ανάλυσε τις δυνατότητές σου
- Δεύτερη επιλογή: Εξερεύνησε εναλλακτικές διαδρομές

### 2. Εναλλακτικές διαδρομές
Δεν υπάρχει ένας μόνο δρόμος.

- Κατάρτιση και συνεχή μάθηση
- Δικτύωση με επαγγελματίες
- Πρακτική εμπειρία

### 3. Δεξιότητες που πρέπει να αναπτύξει
Εστίασε στις ακόλουθες περιοχές:

- Τεχνικές δεξιότητες
- Soft skills
- Ξένες γλώσσες

### 4. Επόμενα βήματα
Σχέδιο δράσης:

- Μήνες 1-2: Έρευνα
- Μήνες 3-4: Πρακτική εφαρμογή
- Μήνες 5-6: Αξιολόγηση`;

      setRecommendations(recommendations);

      // Save lead to Supabase
      try {
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
        });
      } catch (err) {
        console.error('Lead save error:', err);
      }

      // Show popup
      setShowLeadPopup(true);
      setTimeout(() => setShowLeadPopup(false), 4000);

    } catch (error) {
      console.error('Error:', error);
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

  // ... rest of your code remains the same
}
