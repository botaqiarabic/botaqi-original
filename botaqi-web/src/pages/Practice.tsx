import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface SRSData {
  id: string;
  front: string;
  back: string;
  hint?: string;
  example?: string;
  difficulty: number;
  interval: number;
  repetitions: number;
  easeFactor: number;
  dueDate: number;
}

interface Session {
  cards: SRSData[];
  currentIndex: number;
  score: number;
  timeSpent: number;
}

const Practice: React.FC = () => {
  const { language } = useLanguage();
  const [session, setSession] = useState<Session>({
    cards: [],
    currentIndex: 0,
    score: 0,
    timeSpent: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  const loadPracticeSession = async () => {
    setIsLoading(true);
    
    // TODO: Load real cards from Supabase based on scenario
    const mockCards: SRSData[] = [
      {
        id: '1',
        front: 'مرحبا',
        back: 'Hello / Hi',
        hint: 'Common greeting',
        example: 'مرحبا، كيف حالك؟',
        difficulty: 1,
        interval: 1,
        repetitions: 0,
        easeFactor: 2.5,
        dueDate: Date.now()
      },
      {
        id: '2',
        front: 'شكراً',
        back: 'Thank you',
        hint: 'Expression of gratitude',
        example: 'شكراً لك على المساعدة',
        difficulty: 1,
        interval: 1,
        repetitions: 0,
        easeFactor: 2.5,
        dueDate: Date.now()
      },
      {
        id: '3',
        front: 'أهلاً وسهلاً',
        back: 'Welcome',
        hint: 'Traditional welcome',
        example: 'أهلاً وسهلاً في بيتك',
        difficulty: 2,
        interval: 1,
        repetitions: 0,
        easeFactor: 2.5,
        dueDate: Date.now()
      }
    ];

    setSession(prev => ({
      ...prev,
      cards: mockCards,
      currentIndex: 0
    }));
    
    setIsLoading(false);
  };

  useEffect(() => {
    loadPracticeSession();
  }, []);

  const handleAnswer = async (correct: boolean, timeSpent: number) => {
    const currentCard = session.cards[session.currentIndex];
    if (!currentCard) return;

    // Update session score
    const newScore = correct ? session.score + 1 : session.score;
    const newTimeSpent = session.timeSpent + timeSpent;

    // TODO: Update card in SRS system
    console.log('Card answered:', { correct, timeSpent, card: currentCard });

    // Move to next card or complete session
    if (session.currentIndex + 1 >= session.cards.length) {
      setSessionComplete(true);
      setShowResults(true);
    } else {
      setSession(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        score: newScore,
        timeSpent: newTimeSpent
      }));
    }
  };

  const startNewSession = () => {
    setSessionComplete(false);
    setShowResults(false);
    setSession(prev => ({
      ...prev,
      currentIndex: 0,
      score: 0,
      timeSpent: 0
    }));
    loadPracticeSession();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            {language === 'en' ? 'Loading practice session...' : 'جاري تحميل جلسة التدريب...'}
          </p>
        </div>
      </div>
    );
  }

  if (sessionComplete && showResults) {
    const accuracy = (session.score / session.cards.length) * 100;
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {language === 'en' ? 'Session Complete!' : 'اكتملت الجلسة!'}
          </h2>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{session.score}</div>
              <div className="text-sm text-gray-600">
                {language === 'en' ? 'Correct' : 'صحيح'}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{accuracy.toFixed(0)}%</div>
              <div className="text-sm text-gray-600">
                {language === 'en' ? 'Accuracy' : 'دقة'}
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{Math.round(session.timeSpent / 1000)}s</div>
              <div className="text-sm text-gray-600">
                {language === 'en' ? 'Time' : 'الوقت'}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={startNewSession}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all"
            >
              {language === 'en' ? 'Practice Again' : 'تدرب مرة أخرى'}
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-all"
            >
              {language === 'en' ? 'Back to Dashboard' : 'العودة للوحة التحكم'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = session.cards[session.currentIndex];
  if (!currentCard) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">
          {language === 'en' ? 'No cards available for practice' : 'لا توجد بطاقات متاحة للتدريب'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>
            {language === 'en' ? 'Card' : 'البطاقة'} {session.currentIndex + 1} {language === 'en' ? 'of' : 'من'} {session.cards.length}
          </span>
          <span>
            {session.score} {language === 'en' ? 'correct' : 'صحيح'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((session.currentIndex + 1) / session.cards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 text-center">
          <div className="text-4xl font-bold text-gray-900 mb-4">
            {currentCard.front}
          </div>
          {currentCard.hint && (
            <div className="text-sm text-gray-500 mb-4">
              {language === 'en' ? 'Hint:' : 'تلميح:'} {currentCard.hint}
            </div>
          )}
        </div>

        {/* Answer buttons */}
        <div className="bg-gray-50 p-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleAnswer(false, 5000)}
              className="p-4 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors"
            >
              {language === 'en' ? '❌ Incorrect' : '❌ خطأ'}
            </button>
            <button
              onClick={() => handleAnswer(true, 5000)}
              className="p-4 bg-green-100 text-green-700 rounded-lg font-semibold hover:bg-green-200 transition-colors"
            >
              {language === 'en' ? '✅ Correct' : '✅ صحيح'}
            </button>
          </div>
        </div>
      </div>

      {/* Show answer */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-blue-800 mb-2">
            {language === 'en' ? 'Answer:' : 'الإجابة:'}
          </div>
          <div className="text-xl text-blue-700 mb-2">{currentCard.back}</div>
          {currentCard.example && (
            <div className="text-sm text-blue-600">
              {language === 'en' ? 'Example:' : 'مثال:'} {currentCard.example}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Practice;