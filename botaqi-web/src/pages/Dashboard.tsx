import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface Stats {
  totalCards: number;
  masteredCards: number;
  learningCards: number;
  streak: number;
  level: number;
  xp: number;
}

interface CategoryProgress {
  id: number;
  name: string;
  mastered: number;
  total: number;
  level: number;
}

const Dashboard: React.FC = () => {
  const { language } = useLanguage();
  const [stats, setStats] = useState<Stats>({
    totalCards: 0,
    masteredCards: 0,
    learningCards: 0,
    streak: 0,
    level: 1,
    xp: 0
  });

  const [categoryProgress, setCategoryProgress] = useState<CategoryProgress[]>([]);

  console.log('Dashboard component rendering...', { stats, categoryProgress });

  const loadDashboardData = async () => {
    // Mock data for now
    setStats({
      totalCards: 150,
      masteredCards: 45,
      learningCards: 30,
      streak: 7,
      level: 3,
      xp: 1250
    });

    setCategoryProgress([
      { id: 1, name: 'Family', mastered: 8, total: 12, level: 2 },
      { id: 2, name: 'Work', mastered: 5, total: 15, level: 1 },
      { id: 3, name: 'Travel', mastered: 12, total: 18, level: 3 },
      { id: 4, name: 'Food', mastered: 3, total: 10, level: 1 },
      { id: 5, name: 'Shopping', mastered: 7, total: 12, level: 2 }
    ]);

  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getLevelColor = (level: number) => {
    if (level <= 2) return 'text-green-600';
    if (level <= 4) return 'text-blue-600';
    if (level <= 6) return 'text-purple-600';
    return 'text-yellow-600';
  };

  const getLevelProgress = () => {
    const currentLevelXp = (stats.level - 1) * 500;
    const nextLevelXp = stats.level * 500;
    const difference = nextLevelXp - currentLevelXp;
    if (difference === 0) return 100;
    const progress = ((stats.xp - currentLevelXp) / difference) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  try {
    return (
      <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {language === 'en' ? 'Dashboard' : 'لوحة التحكم'}
        </h1>
        <p className="text-gray-600 mt-2">
          {language === 'en' 
            ? 'Track your Gulf Arabic learning progress'
            : 'تتبع تقدمك في تعلم اللهجة الخليجية'
          }
        </p>
      </div>

      {/* Stats Cards */}
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
                {language === 'en' ? 'Learning' : 'أتعلم'}
              </p>
              <p className="text-2xl font-bold text-blue-600">{stats.learningCards}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔄</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {language === 'en' ? 'Streak' : 'سلسلة'}
              </p>
              <p className="text-2xl font-bold text-orange-600">{stats.streak} {language === 'en' ? 'days' : 'يوم'}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔥</span>
            </div>
          </div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'en' ? 'Level Progress' : 'تقدم المستوى'}
          </h3>
          <span className="text-sm text-gray-600">
            {language === 'en' ? 'Level' : 'المستوى'} {stats.level}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-600 to-cyan-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${getLevelProgress()}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>{stats.xp} XP</span>
          <span>{stats.level * 500} XP {language === 'en' ? 'to next level' : 'للمستوى التالي'}</span>
        </div>
      </div>

      {/* Category Progress */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {language === 'en' ? 'Category Progress' : 'تقدم الفئات'}
        </h3>
        <div className="space-y-4">
          {categoryProgress.map((category) => (
            <div key={category.id} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{category.name}</span>
                  <span className="text-sm text-gray-600">
                    {category.mastered}/{category.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full"
                    style={{ width: `${(category.mastered / category.total) * 100}%` }}
                  />
                </div>
              </div>
              <div className="ml-4">
                <span className={`text-sm font-medium ${getLevelColor(category.level)}`}>
                  L{category.level}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {language === 'en' ? 'Quick Actions' : 'إجراءات سريعة'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all">
            <div className="text-center">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-medium">
                {language === 'en' ? 'Start Practice' : 'ابدأ التدريب'}
              </div>
            </div>
          </button>
          
          <button className="p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all">
            <div className="text-center">
              <div className="text-2xl mb-2">🏆</div>
              <div className="font-medium">
                {language === 'en' ? 'View Rewards' : 'عرض المكافآت'}
              </div>
            </div>
          </button>
          
          <button className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">
                {language === 'en' ? 'View Profile' : 'عرض الملف الشخصي'}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Dashboard Error</h1>
        <p className="text-gray-600">Something went wrong loading the dashboard.</p>
        <pre className="mt-4 text-sm text-gray-500">{String(error)}</pre>
      </div>
    );
  }
};

export default Dashboard;