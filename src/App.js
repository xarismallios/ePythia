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
      description: 'Find your ideal master\'s program or career start',
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
      { id: 'experience', label: 'Any internships or projects you\'ve done?', type: 'textarea', placeholder: 'Describe your relevant experience...' },
      { id: 'nextStep', label: 'Are you considering a Master\'s degree or entering the workforce?', type: 'select', options: ['Master\'s Degree', 'Start Working', 'Not Sure Yet'] },
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
    setFormData(prev => ({ ...prev, [questionId]: value }));
  };

  const handleContactChange = (field, value) => {
    setContactInfo(prev => ({ ...prev, [field]: value }));
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
    
    questions[userType].forEach(q => {
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
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.REACT_APP_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [
            { role: 'user', content: generatePrompt() }
          ],
        }),
      });

      const data = await response.json();
      const aiResponse = data.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n');
      
      setRecommendations(aiResponse);

    } catch (error) {
      setRecommendations('Sorry, there was an error. Please try again.');
      console.error('Error:', error);
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
    return questions[userType]?.every(q => formData[q.id] && formData[q.id].trim() !== '');
  };

  const isContactComplete = () => {
    return contactInfo.firstName.trim() && contactInfo.lastName.trim() && contactInfo.email.includes('@');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 via-violet-400 to-fuchsia-400 p-0.5">
                <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-violet-400 to-fuchsia-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">e-Pythia</h1>
              <p className="text-xs text-slate-400">Your Career Oracle</p>
            </div>
          </div>
          {step !== 'welcome' && (
            <button onClick={resetApp} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Start Over</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {step === 'welcome' && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 mb-6">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-slate-300">Powered by AI</span>
            </div>
            
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 via-violet-400 to-fuchsia-400 p-0.5">
                  <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center">
                    <Eye className="w-10 h-10 text-cyan-400" />
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-violet-400 to-fuchsia-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">e-Pythia</h2>
            <p className="text-2xl text-slate-300 mb-8 max-w-2xl mx-auto font-semibold">Your Career Guide</p>
            
            <div className="mb-8 flex justify-center">
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                <rect x="35" y="50" width="50" height="55" rx="8" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2"/>
                <rect x="40" y="25" width="40" height="35" rx="8" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2"/>
                <line x1="60" y1="25" x2="60" y2="15" stroke="#94A3B8" strokeWidth="2"/>
                <circle cx="60" cy="12" r="3" fill="#8B5CF6"/>
                <circle cx="50" cy="40" r="4" fill="#6366F1"/>
                <circle cx="70" cy="40" r="4" fill="#6366F1"/>
                <path d="M 48 50 Q 60 56 72 50" stroke="#94A3B8" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <rect x="25" y="60" width="8" height="25" rx="4" fill="#CBD5E1"/>
                <rect x="87" y="60" width="8" height="25" rx="4" fill="#CBD5E1"/>
                <g transform="translate(15, 75)">
                  <circle cx="10" cy="10" r="12" fill="#FFFFFF" stroke="#8B5CF6" strokeWidth="2"/>
                  <circle cx="10" cy="10" r="8" fill="none" stroke="#C4B5FD" strokeWidth="1"/>
                  <line x1="10" y1="10" x2="10" y2="4" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="10" y1="10" x2="10" y2="16" stroke="#64748B" strokeWidth="2" strokeLinecap="round"/>
                  <text x="10" y="3" fontSize="4" fill="#8B5CF6" textAnchor="middle" fontWeight="bold">N</text>
                </g>
                <rect x="42" y="105" width="12" height="8" rx="4" fill="#CBD5E1"/>
                <rect x="66" y="105" width="12" height="8" rx="4" fill="#CBD5E1"/>
                <circle cx="60" cy="70" r="3" fill="#6366F1" opacity="0.6"/>
                <rect x="50" y="80" width="20" height="2" rx="1" fill="#6366F1" opacity="0.4"/>
                <rect x="52" y="85" width="16" height="2" rx="1" fill="#6366F1" opacity="0.4"/>
              </svg>
            </div>
            
            <div className="mb-16 max-w-2xl mx-auto">
              <p className="text-lg text-slate-400 mb-2">Select Your Profile</p>
              <p className="text-base text-slate-500">Choose the option that best matches your current career stage</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-5">
              {userTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => handleUserTypeSelect(type.id)}
                    className="group w-full bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 hover:bg-slate-800 transition-all duration-300 border border-slate-700/50 hover:border-slate-600 hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${type.gradient} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-2xl font-bold mb-1 text-white">{type.title}</h3>
                        <p className="text-slate-400 text-base">{type.description}</p>
                      </div>
                      <ChevronRight className="w-7 h-7 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-1 transition flex-shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 'questionnaire' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <h2 className="text-3xl font-bold mb-2 text-white">Tell Us About Yourself</h2>
              <p className="text-slate-400 mb-8">Your answers help us provide personalized career guidance</p>

              <div className="space-y-6">
                {questions[userType].map((question, idx) => (
                  <div key={question.id}>
                    <label className="block text-base font-semibold mb-2 text-slate-200">
                      {idx + 1}. {question.label}
                    </label>
                    {question.type === 'textarea' ? (
                      <textarea
                        value={formData[question.id] || ''}
                        onChange={(e) => handleInputChange(question.id, e.target.value)}
                        placeholder={question.placeholder}
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 placeholder-slate-500 text-slate-200 min-h-28 transition"
                      />
                    ) : question.type === 'select' ? (
                      <select
                        value={formData[question.id] || ''}
                        onChange={(e) => handleInputChange(question.id, e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-slate-200 transition"
                      >
                        <option value="">Select an option</option>
                        {question.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={formData[question.id] || ''}
                        onChange={(e) => handleInputChange(question.id, e.target.value)}
                        placeholder={question.placeholder}
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 placeholder-slate-500 text-slate-200 transition"
                      />
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={proceedToContact}
                disabled={!isFormComplete()}
                className={`w-full mt-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
                  isFormComplete()
                    ? 'bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 hover:from-cyan-400 hover:via-violet-400 hover:to-fuchsia-400 text-white shadow-lg shadow-violet-500/50'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 'contact' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <h2 className="text-3xl font-bold mb-2 text-white">Almost There!</h2>
              <p className="text-slate-400 mb-8">Enter your details to receive your personalized career guidance</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-base font-semibold mb-2 text-slate-200">First Name</label>
                  <input
                    type="text"
                    value={contactInfo.firstName}
                    onChange={(e) => handleContactChange('firstName', e.target.value)}
                    placeholder="Enter your first name"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 placeholder-slate-500 text-slate-200 transition"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold mb-2 text-slate-200">Last Name</label>
                  <input
                    type="text"
                    value={contactInfo.lastName}
                    onChange={(e) => handleContactChange('lastName', e.target.value)}
                    placeholder="Enter your last name"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 placeholder-slate-500 text-slate-200 transition"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold mb-2 text-slate-200">Email Address</label>
                  <input
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => handleContactChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 placeholder-slate-500 text-slate-200 transition"
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-violet-500/10 border border-violet-500/30 rounded-xl">
                <p className="text-sm text-slate-300">🔒 Your information is secure. We'll send your personalized career guidance to this email address.</p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!isContactComplete()}
                className={`w-full mt-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
                  isContactComplete()
                    ? 'bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 hover:from-cyan-400 hover:via-violet-400 hover:to-fuchsia-400 text-white shadow-lg shadow-violet-500/50'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                Generate Career Guidance
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 'results' && (
          <div className="max-w-5xl mx-auto">
            {loading ? (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
                <div className="text-center py-20">
                  <div className="inline-block w-16 h-16 border-4 border-slate-700 border-t-violet-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-xl text-slate-400 mb-2">Analyzing your profile...</p>
                  <p className="text-sm text-slate-500">Preparing to send results to {contactInfo.email}</p>
                </div>
              </div>
            ) : (
              <div>
                <div className="bg-gradient-to-br from-cyan-500/10 via-violet-500/10 to-fuchsia-500/10 backdrop-blur-sm rounded-3xl p-12 border border-violet-500/30 mb-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-cyan-500/20 to-transparent rounded-full blur-3xl"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-lg">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-4xl font-bold text-white mb-1">Your Career Roadmap</h2>
                        <p className="text-slate-300">Personalized guidance for {contactInfo.firstName} {contactInfo.lastName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-200 font-semibold">Report Ready</p>
                        <p className="text-sm text-slate-400">A detailed PDF will be sent to {contactInfo.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/30 backdrop-blur-sm rounded-3xl border border-slate-700/50 overflow-hidden mb-8">
                  <div className="bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-cyan-600/20 border-b border-slate-700/50 px-10 py-8">
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-1">
                      Your Personalized Analysis
                    </h3>
                    <p className="text-slate-300 text-base">Tailored insights based on your unique profile</p>
                  </div>
                  
                  <div className="px-10 py-10">
                    <div className="prose prose-invert prose-slate max-w-none">
                      <div className="text-slate-200 text-lg leading-relaxed whitespace-pre-wrap">
                        {recommendations}
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-1 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500"></div>
                </div>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">Ready to Start Your Journey?</h3>
                      <p className="text-slate-400">Use this guidance as your roadmap to achieve your career goals.</p>
                    </div>
                    <button
                      onClick={resetApp}
                      className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 hover:from-cyan-400 hover:via-violet-400 hover:to-fuchsia-400 text-white font-bold transition-all shadow-lg shadow-violet-500/50 whitespace-nowrap"
                    >
                      Start New Analysis
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-center py-8 text-slate-500 text-sm border-t border-slate-800">
        <p>e-Pythia • AI-Powered Career Guidance • Your Future Starts Here • Created by Charis Mallios contact me at charismallios@gmail.com </p>
      </div>
    </div>
  );
}