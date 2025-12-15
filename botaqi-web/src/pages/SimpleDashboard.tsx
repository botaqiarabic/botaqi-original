import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const SimpleDashboard: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        {language === 'en' ? 'Dashboard' : 'لوحة التحكم'}
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        {language === 'en' 
          ? 'Track your Gulf Arabic learning progress'
          : 'تتبع تقدمك في تعلم اللهجة الخليجية'
        }
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {language === 'en' ? 'Total Cards' : 'إجمالي البطاقات'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">150</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {language === 'en' ? 'Mastered' : 'متقن'}
              </p>
              <p className="text-2xl font-bold text-green-600">45</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {language === 'en' ? 'Learning' : 'أتعلم'}
              </p>
              <p className="text-2xl font-bold text-blue-600">30</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔄</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {language === 'en' ? 'Streak' : 'سلسلة'}
              </p>
              <p className="text-2xl font-bold text-orange-600">7 {language === 'en' ? 'days' : 'يوم'}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔥</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;
