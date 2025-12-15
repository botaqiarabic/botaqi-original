import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface UserProfile {
  name: string;
  email: string;
  level: number;
  xp: number;
  streak: number;
  joinDate: string;
  totalStudyTime: number;
  cardsMastered: number;
}

interface StudyStats {
  totalCards: number;
  masteredCards: number;
  learningCards: number;
  accuracy: number;
  averageTime: number;
}

const Profile: React.FC = () => {
  const { language } = useLanguage();
  const [profile] = useState<UserProfile>({
    name: 'Ahmed Al-Rashid',
    email: 'ahmed@example.com',
    level: 3,
    xp: 1250,
    streak: 7,
    joinDate: '2024-01-15',
    totalStudyTime: 24.5,
    cardsMastered: 45
  });

  const [stats] = useState<StudyStats>({
    totalCards: 150,
    masteredCards: 45,
    learningCards: 30,
    accuracy: 78.5,
    averageTime: 3.2
  });

  return (
    <div className="space-y-6">
        {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {language === 'en' ? 'Profile' : 'الملف الشخصي'}
        </h1>
        <p className="text-gray-600 mt-2">
          {language === 'en' 
            ? 'Manage your account and view your learning progress'
            : 'إدارة حسابك وعرض تقدمك في التعلم'
          }
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">AR</span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
            <p className="text-gray-600">{profile.email}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {language === 'en' ? 'Level' : 'المستوى'} {profile.level}
              </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {profile.xp} XP
              </span>
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                {profile.streak} {language === 'en' ? 'day streak' : 'يوم متتالي'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {language === 'en' ? 'Total Cards' : 'إجمالي البطاقات'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCards}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {language === 'en' ? 'Mastered' : 'متقن'}
              </p>
              <p className="text-2xl font-bold text-green-600">{stats.masteredCards}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {language === 'en' ? 'Accuracy' : 'الدقة'}
              </p>
              <p className="text-2xl font-bold text-purple-600">{stats.accuracy}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
                <div>
              <p className="text-sm font-medium text-gray-600">
                {language === 'en' ? 'Study Time' : 'وقت الدراسة'}
              </p>
              <p className="text-2xl font-bold text-orange-600">{profile.totalStudyTime}h</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏱️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Progress */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {language === 'en' ? 'Learning Progress' : 'تقدم التعلم'}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">
              {language === 'en' ? 'Cards Mastered' : 'البطاقات المتقنة'}
            </span>
            <div className="flex items-center space-x-3">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                  style={{ width: `${(stats.masteredCards / stats.totalCards) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">
                {stats.masteredCards}/{stats.totalCards}
              </span>
              </div>
            </div>
            
                <div className="flex items-center justify-between">
            <span className="text-gray-700">
              {language === 'en' ? 'Learning Cards' : 'البطاقات قيد التعلم'}
            </span>
            <div className="flex items-center space-x-3">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                  style={{ width: `${(stats.learningCards / stats.totalCards) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">
                {stats.learningCards}/{stats.totalCards}
              </span>
            </div>
                </div>

                <div className="flex items-center justify-between">
            <span className="text-gray-700">
              {language === 'en' ? 'Overall Accuracy' : 'الدقة الإجمالية'}
            </span>
            <div className="flex items-center space-x-3">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                  style={{ width: `${stats.accuracy}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">
                {stats.accuracy}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {language === 'en' ? 'Recent Achievements' : 'الإنجازات الأخيرة'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-xl">🏆</span>
                </div>
            <div>
              <div className="font-medium text-green-800">
                {language === 'en' ? 'First Week' : 'الأسبوع الأول'}
                </div>
              <div className="text-sm text-green-600">
                {language === 'en' ? '7 day streak' : '7 أيام متتالية'}
                </div>
                </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xl">📚</span>
            </div>
                <div>
              <div className="font-medium text-blue-800">
                {language === 'en' ? 'Quick Learner' : 'متعلم سريع'}
              </div>
              <div className="text-sm text-blue-600">
                {language === 'en' ? '50 cards mastered' : '50 بطاقة متقنة'}
              </div>
                  </div>
                </div>
                
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-xl">🎯</span>
            </div>
                <div>
              <div className="font-medium text-purple-800">
                {language === 'en' ? 'Accuracy Master' : 'سيد الدقة'}
                  </div>
              <div className="text-sm text-purple-600">
                {language === 'en' ? '80%+ accuracy' : 'دقة 80%+'}
                  </div>
                </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {language === 'en' ? 'Settings' : 'الإعدادات'}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
                <div>
              <div className="font-medium text-gray-900">
                {language === 'en' ? 'Email Notifications' : 'إشعارات البريد الإلكتروني'}
              </div>
              <div className="text-sm text-gray-600">
                {language === 'en' ? 'Get daily reminders to practice' : 'احصل على تذكيرات يومية للتدريب'}
                  </div>
            </div>
            <button className="w-12 h-6 bg-blue-600 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
            </button>
                </div>
                
          <div className="flex items-center justify-between">
                <div>
              <div className="font-medium text-gray-900">
                {language === 'en' ? 'Sound Effects' : 'التأثيرات الصوتية'}
              </div>
              <div className="text-sm text-gray-600">
                {language === 'en' ? 'Play sounds for correct/incorrect answers' : 'تشغيل أصوات للإجابات الصحيحة/الخاطئة'}
              </div>
            </div>
            <button className="w-12 h-6 bg-gray-300 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
            </button>
                    </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">
                {language === 'en' ? 'Dark Mode' : 'الوضع المظلم'}
                    </div>
              <div className="text-sm text-gray-600">
                {language === 'en' ? 'Use dark theme' : 'استخدام المظهر المظلم'}
                    </div>
                  </div>
            <button className="w-12 h-6 bg-gray-300 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;