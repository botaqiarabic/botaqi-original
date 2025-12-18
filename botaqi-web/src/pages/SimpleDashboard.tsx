import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const SimpleDashboard: React.FC = () => {
  const { language } = useLanguage();
  const [serverStatus, setServerStatus] = useState<'unknown' | 'ok' | 'warn' | 'error'>('unknown');
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const r = await fetch('/api/status', { method: 'GET' });
        if (!mounted) return;
        if (!r.ok) {
          setServerStatus('error');
          setServerMessage(`status:${r.status}`);
          return;
        }
        const j = await r.json();
        if (j && (j.auth && j.auth.ok || j.db && j.db.ok)) {
          setServerStatus('ok');
          setServerMessage(null);
        } else {
          setServerStatus('warn');
          setServerMessage(j.auth?.reason || j.db?.reason || 'degraded');
        }
      } catch (e) {
        if (!mounted) return;
        setServerStatus('error');
        setServerMessage('network');
      }
    };
    check();
    return () => { mounted = false; };
  }, []);
  
  const retryStatus = async () => {
    setServerStatus('unknown');
    setServerMessage(null);
    try {
      const r = await fetch('/api/status', { method: 'GET' });
      if (!r.ok) {
        setServerStatus('error');
        setServerMessage(`status:${r.status}`);
        return;
      }
      const j = await r.json();
      if (j && (j.auth && j.auth.ok || j.db && j.db.ok)) {
        setServerStatus('ok');
        setServerMessage(null);
      } else {
        setServerStatus('warn');
        setServerMessage(j.auth?.reason || j.db?.reason || 'degraded');
      }
    } catch (e) {
      setServerStatus('error');
      setServerMessage('network');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-end mb-4">
        <div className="flex items-center text-sm space-x-2">
          <span
            className={
              serverStatus === 'ok'
                ? 'w-3 h-3 rounded-full bg-green-500 block'
                : serverStatus === 'warn'
                ? 'w-3 h-3 rounded-full bg-yellow-400 block'
                : serverStatus === 'error'
                ? 'w-3 h-3 rounded-full bg-red-500 block'
                : 'w-3 h-3 rounded-full bg-gray-300 block'
            }
          />
          <span className="text-gray-600">
            {serverStatus === 'ok' ? (language === 'en' ? 'Server OK' : 'الخادم جاهز') : serverStatus === 'warn' ? (language === 'en' ? 'Server Degraded' : 'الخادم متدهور') : serverStatus === 'error' ? (language === 'en' ? 'Server Unreachable' : 'لا يمكن الوصول للخادم') : (language === 'en' ? 'Checking...' : 'جارٍ الفحص...')}
            {serverMessage ? ` · ${serverMessage}` : ''}
          </span>
          <button onClick={() => retryStatus()} className="ml-3 px-3 py-1 bg-gray-100 rounded text-xs text-gray-700 hover:bg-gray-200">
            {language === 'en' ? 'Retry' : 'إعادة الفحص'}
          </button>
        </div>
      </div>
      <div className="flex justify-end mb-4">
        <div className="flex items-center text-sm space-x-2">
          <span
            className={
              serverStatus === 'ok'
                ? 'w-3 h-3 rounded-full bg-green-500 block'
                : serverStatus === 'warn'
                ? 'w-3 h-3 rounded-full bg-yellow-400 block'
                : serverStatus === 'error'
                ? 'w-3 h-3 rounded-full bg-red-500 block'
                : 'w-3 h-3 rounded-full bg-gray-300 block'
            }
          />
          <span className="text-gray-600">
            {serverStatus === 'ok' ? (language === 'en' ? 'Server OK' : 'الخادم جاهز') : serverStatus === 'warn' ? (language === 'en' ? 'Server Degraded' : 'الخادم متدهور') : serverStatus === 'error' ? (language === 'en' ? 'Server Unreachable' : 'لا يمكن الوصول للخادم') : (language === 'en' ? 'Checking...' : 'جارٍ الفحص...')}
            {serverMessage ? ` · ${serverMessage}` : ''}
          </span>
        </div>
      </div>
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
