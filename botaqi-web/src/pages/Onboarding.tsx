import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface OnboardingData {
  name: string;
  gender: string;
  ageRange: string;
  occupation: string;
  interests: string[];
  difficultyLevel: string;
}

const Onboarding: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    name: '',
    gender: '',
    ageRange: '',
    occupation: '',
    interests: [],
    difficultyLevel: ''
  });

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      console.log('Onboarding completed:', data);
      navigate('/app/dashboard');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return data.name.trim() !== '';
      case 2: return data.gender !== '';
      case 3: return data.ageRange !== '';
      case 4: return data.occupation.trim() !== '';
      case 5: return data.difficultyLevel !== '';
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{language === 'en' ? 'Step' : 'الخطوة'} {currentStep} {language === 'en' ? 'of' : 'من'} 5</span>
            <span>{Math.round((currentStep / 5) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Name */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {language === 'en' ? 'What\'s your name?' : 'ما اسمك؟'}
              </h2>
              <p className="text-gray-600 mb-6">
                {language === 'en' 
                  ? 'We\'ll use this to personalize your learning experience'
                  : 'سنستخدم هذا لتخصيص تجربة التعلم الخاصة بك'
                }
              </p>
              <input
                type="text"
                value={data.name}
                onChange={(e) => updateData('name', e.target.value)}
                placeholder={language === 'en' ? 'Enter your name' : 'أدخل اسمك'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Step 2: Gender */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {language === 'en' ? 'How do you identify?' : 'كيف تعرّف نفسك؟'}
              </h2>
              <p className="text-gray-600 mb-6">
                {language === 'en' 
                  ? 'This helps us provide culturally appropriate examples'
                  : 'هذا يساعدنا في تقديم أمثلة مناسبة ثقافياً'
                }
              </p>
              <div className="space-y-3">
                {[
                  { value: 'male', label: language === 'en' ? 'Male' : 'ذكر' },
                  { value: 'female', label: language === 'en' ? 'Female' : 'أنثى' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer bg-white">
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      checked={data.gender === option.value}
                      onChange={(e) => updateData('gender', e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-lg text-gray-900 font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Age Range */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {language === 'en' ? 'What\'s your age range?' : 'ما هو نطاق عمرك؟'}
              </h2>
              <p className="text-gray-600 mb-6">
                {language === 'en' 
                  ? 'This helps us tailor content to your life stage'
                  : 'هذا يساعدنا في تخصيص المحتوى لمرحلة حياتك'
                }
              </p>
              <div className="space-y-3">
                {[
                  { value: '18-25', label: '18-25' },
                  { value: '26-35', label: '26-35' },
                  { value: '36-45', label: '36-45' },
                  { value: '46-55', label: '46-55' },
                  { value: '55+', label: '55+' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer bg-white">
                    <input
                      type="radio"
                      name="ageRange"
                      value={option.value}
                      checked={data.ageRange === option.value}
                      onChange={(e) => updateData('ageRange', e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-lg text-gray-900 font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Occupation */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {language === 'en' ? 'What do you do?' : 'ماذا تعمل؟'}
              </h2>
              <p className="text-gray-600 mb-6">
                {language === 'en' 
                  ? 'We\'ll include relevant workplace vocabulary'
                  : 'سنشمل مفردات العمل ذات الصلة'
                }
              </p>
              <input
                type="text"
                value={data.occupation}
                onChange={(e) => updateData('occupation', e.target.value)}
                placeholder={language === 'en' ? 'e.g., Engineer, Teacher, Student...' : 'مثل: مهندس، معلم، طالب...'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Step 5: Difficulty Level */}
          {currentStep === 5 && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {language === 'en' ? 'What\'s your Arabic level?' : 'ما هو مستواك في العربية؟'}
              </h2>
              <p className="text-gray-600 mb-6">
                {language === 'en' 
                  ? 'This helps us start with the right difficulty'
                  : 'هذا يساعدنا في البدء بالمستوى المناسب'
                }
              </p>
              <div className="space-y-3">
                {[
                  { value: 'A1', label: 'A1 - Beginner', desc: language === 'en' ? 'I know basic greetings' : 'أعرف التحيات الأساسية' },
                  { value: 'A2', label: 'A2 - Elementary', desc: language === 'en' ? 'I can have simple conversations' : 'يمكنني إجراء محادثات بسيطة' },
                  { value: 'B1', label: 'B1 - Intermediate', desc: language === 'en' ? 'I can discuss familiar topics' : 'يمكنني مناقشة المواضيع المألوفة' },
                  { value: 'B2', label: 'B2 - Upper Intermediate', desc: language === 'en' ? 'I can express opinions clearly' : 'يمكنني التعبير عن الآراء بوضوح' },
                  { value: 'C1', label: 'C1 - Advanced', desc: language === 'en' ? 'I can use complex language' : 'يمكنني استخدام اللغة المعقدة' }
                ].map((option) => (
                  <label key={option.value} className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer bg-white">
                    <input
                      type="radio"
                      name="difficultyLevel"
                      value={option.value}
                      checked={data.difficultyLevel === option.value}
                      onChange={(e) => updateData('difficultyLevel', e.target.value)}
                      className="mr-3 mt-1"
                    />
                    <div>
                      <div className="font-medium text-lg text-gray-900">{option.label}</div>
                      <div className="text-gray-600">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium ${
                currentStep === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {language === 'en' ? 'Back' : 'السابق'}
            </button>
            
            <button
              onClick={nextStep}
              disabled={!isStepValid()}
              className={`px-6 py-3 rounded-lg font-medium ${
                isStepValid()
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {currentStep === 5 
                ? (language === 'en' ? 'Complete Setup' : 'إكمال الإعداد')
                : (language === 'en' ? 'Next' : 'التالي')
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;