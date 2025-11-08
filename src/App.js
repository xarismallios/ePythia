import React, { useState } from 'react';
import { Compass, GraduationCap, Briefcase, ChevronRight, ArrowLeft, Sparkles, Eye } from 'lucide-react';

export default function EPythia() {
  const [step, setStep] = useState('welcome');
  const [userType, setUserType] = useState('');
  const [formData, setFormData] = useState({});
  const [contactInfo, setContactInfo] = useState({ firstName: '', lastName: '', email: '' });
  const [recommendations, setRecommendations] = useState('');
  const [loading, setLoading] = useState(false);

  const userTypes = [
    {
      id: 'highschool',
      title: 'High School Student',
      description: 'Discover what to study in university',
      icon: GraduationCap,
      gradient: 'from-cyan-500 to-blue-500'
    },
    {
      id: 'university',
      title: 'University Student',
      description: "Find your ideal master's program or career start",
      icon: Compass,
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      id: 'employee',
      title: 'Professional',
      description: 'Explore your next career move',
      icon: Briefcase,
      gradient: 'from-fuchsia-500 to-pink-500'
    }
  ];

  const questions = {
    highschool: [
      { id: 'interests', label: 'What subjects or activities do you enjoy most?', type: 'textarea', placeholder: 'e.g., Mathematics, Art, Sports, Science experiments...' },
      { id: 'strengths', label: 'What are your key strengths?', type: 'textarea', placeholder: 'e.g., Problem-solving, creativity, leadership...' },
      { id: 'careerDreams', label: 'What kind of career do you dream about?', type: 'textarea', placeholder: 'e.g., Helping people, creating technology, business...' },
      { id: 'workStyle', label: 'Do you prefer working with people, data, or things?', type: 'select', options: ['People', 'Data/Analysis', 'Hands-on/Things', 'Mix of everything'] },
      { id: 'goals', label: 'What matters most to you in a career?', type: 'textarea', placeholder: 'e.g., Good salary, work-life balance, making impact...' }
    ],
    university: [
      { id: 'degree', label: 'What is your current degree/major?', type: 'text', placeholder: 'e.g., Computer Science, Business Administration...' },
      { id: 'interests', label: 'What topics or areas interest you most?', type: 'textarea', placeholder: 'e.g., AI, Marketing, Finance, Research...' },
      { id: 'experience', label: "Any internships or projects you've done?", type: 'textarea', placeholder: 'Describe your relevant experience...' },
      { id: 'nextStep', label: "Are you considering a Master's degree or entering the workforce?", type: 'select', options: ["Master's Degree", 'Start Working', 'Not Sure Yet'] },
      { id: 'goals', label: 'What are your career goals?', type: 'textarea', placeholder: 'Where do you see yourself in 5 years?' }
    ],
    employee: [
      { id: 'currentRole', label: 'What is your current role?', type: 'text', placeholder: 'e.g., Software Engineer, Marketing Manager...' },
      { id: 'experience', label: 'Years of experience in your field?', type: 'select', options: ['0-2 years', '3-5 years', '6-10 years', '10+ years'] },
      { id: 'skills', label: 'What are your key skills?', type: 'textarea', placeholder: 'List your main professional skills...' },
      { id: 'challenges', label: 'What challenges or frustrations do you face in your current role?', type: 'textarea', placeholder: 'What makes you consider a change?' },
      { id: 'aspirations', label: 'What would your ideal next step look like?', type: 'textarea', placeholder: 'e.g., Leadership role, different industry, entrepreneurship...' }
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
      highschool: 'high school student looking to choose a university major',
      university: 'university student planning their next career step',
      employee: 'professional exploring career advancement options'
    };

    let prompt = `You are e-Pythia, an expert career counselor. A ${typeLabels[userType]} needs your guidance.\n\nUser Profile:\n`;

    questions[userType].forEach((q) => {
      const answer = formData[q.id] || 'Not provided';
      prompt += `- ${q.label}: ${answer}\n`;
    });

    if (userType === 'highschool') {
      prompt += `\nProvide clear guidance with:\n1. Top 3-4 university majors (why each fits)\n2. Alternative paths\n3. Skills to develop\n4. Next steps\n\nBe encouraging and specific.`;
    } else if (userType === 'university') {
      prompt += `\nProvide:\n1. Career positions or master's programs\n2. Industries that value their skills\n3. Transition steps\n4. Skills to develop\n\nBe specific with job titles.`;
    } else {
      prompt += `\nProvide:\n1. Next career moves\n2. How to leverage experience\n3. Skills to develop\n4. Action steps for 6-12 months\n\nBe strategic.`;
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
        setRecommendations('Sorry, there was an error processing your request.');
        return;
      }

      setRecommendations(data.message);
    } catch (error) {
      console.error('Fetch failed:', error);
      setRecommendations('Sorry, there was an error. Please try again.');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200">
      <div className="sticky top-0 bg-slate-900/80 border-b border-slate-700/50 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 via-violet-400 to-fuchsia-400 p-0.5">
                <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-violet-400 to-fuchsia-400 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">e-Pythia</h1>
              <p className="text-xs text-slate-400">Your Career Oracle</p>
            </div>
          </div>
          {step !== 'welcome' && (
            <button onClick={resetApp} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Start Over</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {step === 'welcome' && (
          <div className="text-center mb-12">
            <Sparkles className="w-5 h-5 mx-auto mb-4 text-violet-400" />
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">e-Pythia</h2>
            <p className="text-xl text-slate-300 mb-10">Your AI-Powered Career Guide</p>
            <div className="max-w-3xl mx-auto space-y-5">
              {userTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => handleUserTypeSelect(type.id)}
                    className="group w-full bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${type.gradient} flex items-center justify-center`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-2xl font-bold mb-1">{type.title}</h3>
                        <p className="text-slate-400">{type.description}</p>
                      </div>
                      <ChevronRight className="w-6 h-6 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-1 transition" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 'questionnaire' && (
          <div className="max-w-4xl mx-auto bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50">
            <h2 className="text-3xl font-bold mb-2">Tell Us About Yourself</h2>
            <p className="text-slate-400 mb-8">Your answers help us provide personalized career guidance</p>
            <div className="space-y-6">
              {questions[userType].map((question, idx) => (
                <div key={question.id}>
                  <label className="block text-base font-semibold mb-2">
                    {idx + 1}. {question.label}
                  </label>
                  {question.type === 'textarea' ? (
                    <textarea
                      value={formData[question.id] || ''}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      placeholder={question.placeholder}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 focus:border-violet-500 outline-none text-slate-200 min-h-28 transition"
                    />
                  ) : question.type === 'select' ? (
                    <select
                      value={formData[question.id] || ''}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 focus:border-violet-500 outline-none text-slate-200 transition"
                    >
                      <option value="">Select an option</option>
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
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 focus:border-violet-500 outline-none text-slate-200 transition"
                    />
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={proceedToContact}
              disabled={!isFormComplete()}
              className={`w-full mt-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 ${
                isFormComplete()
                  ? 'bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 text-white hover:opacity-90'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 'contact' && (
          <div className="max-w-2xl mx-auto bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50">
            <h2 className="text-3xl font-bold mb-2">Almost There!</h2>
            <p className="text-slate-400 mb-8">Enter your details to receive your personalized career guidance</p>
            <div className="space-y-5">
              {['firstName', 'lastName', 'email'].map((field) => (
                <div key={field}>
                  <label className="block text-base font-semibold mb-2 capitalize">{field}</label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    value={contactInfo[field]}
                    onChange={(e) => handleContactChange(field, e.target.value)}
                    placeholder={`Enter your ${field}`}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 focus:border-violet-500 outline-none text-slate-200 transition"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!isContactComplete()}
              className={`w-full mt-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 ${
                isContactComplete()
                  ? 'bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 text-white hover:opacity-90'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              Generate Career Guidance
            </button>
          </div>
        )}

        {step === 'results' && (
          <div className="max-w-5xl mx-auto">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block w-16 h-16 border-4 border-slate-700 border-t-violet-500 rounded-full animate-spin mb-4"></div>
                <p className="text-xl text-slate-400 mb-2">Analyzing your profile...</p>
              </div>
            ) : (
              <div className="bg-slate-800/30 rounded-3xl p-12 border border-slate-700/50">
                <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Your Career Roadmap
                </h2>
                <div className="text-slate-200 text-lg whitespace-pre-wrap leading-relaxed">{recommendations}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-center py-8 text-slate-500 text-sm border-t border-slate-800">
        <p>
          e-Pythia • AI Career Guide • Created by Charis Mallios •
          <a href="mailto:charismallios@gmail.com" className="text-violet-400 hover:underline ml-1">
            charismallios@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
