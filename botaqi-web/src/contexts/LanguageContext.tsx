import { createContext, useContext, useState, ReactNode } from 'react';

interface LanguageContextType {
  language: 'en' | 'ar';
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    home: 'Home',
    srs: 'SRS Study',
    decks: 'Decks',
    rewards: 'Rewards',
    forum: 'Forum',
    profile: 'Profile',
    about: 'About',
    
    // Dashboard
    welcomeBack: 'Welcome back!',
    dailyStreak: 'Daily Streak',
    totalCoins: 'Total Coins',
    cardsStudied: 'Cards Studied',
    startSRS: 'Start SRS Session',
    
    // SRS
    revealAnswer: 'Reveal Answer',
    howWellKnow: 'How well did you know this?',
    difficult: 'Difficult',
    good: 'Good',
    easy: 'Easy',
    sessionComplete: 'Session Complete!',
    coinsEarned: 'coins earned',
    
    // Profile
    editProfile: 'Edit Profile',
    shareStats: 'Share Stats',
    username: 'Username',
    description: 'Description',
    country: 'Country',
    level: 'Level',
    accuracy: 'Accuracy',
    dayStreak: 'Day Streak',
    achievementBadges: 'Achievement Badges',
    
    // Forum
    communityForum: 'Community Forum',
    newPost: 'New Post',
    replies: 'replies',
    comment: 'Comment',
    
    // Rewards
    rewardsShop: 'Rewards Shop',
    coinsAvailable: 'coins available',
    purchase: 'Purchase',
    
    // About
    aboutApp: 'About Arabic SRS',
    appVision: 'Our Vision',
    howItWorks: 'How It Works',
    contactUs: 'Contact Us',
  },
  ar: {
    // Navigation
    home: 'الرئيسية',
    srs: 'دراسة التكرار المتباعد',
    decks: 'المجموعات',
    rewards: 'المكافآت',
    forum: 'المنتدى',
    profile: 'الملف الشخصي',
    about: 'حول التطبيق',
    
    // Dashboard
    welcomeBack: 'مرحباً بعودتك!',
    dailyStreak: 'السلسلة اليومية',
    totalCoins: 'إجمالي العملات',
    cardsStudied: 'البطاقات المدروسة',
    startSRS: 'بدء جلسة التكرار المتباعد',
    
    // SRS
    revealAnswer: 'كشف الإجابة',
    howWellKnow: 'كم تعرف هذا جيداً؟',
    difficult: 'صعب',
    good: 'جيد',
    easy: 'سهل',
    sessionComplete: 'انتهت الجلسة!',
    coinsEarned: 'عملة مكتسبة',
    
    // Profile
    editProfile: 'تعديل الملف الشخصي',
    shareStats: 'مشاركة الإحصائيات',
    username: 'اسم المستخدم',
    description: 'الوصف',
    country: 'البلد',
    level: 'المستوى',
    accuracy: 'الدقة',
    dayStreak: 'السلسلة اليومية',
    achievementBadges: 'شارات الإنجاز',
    
    // Forum
    communityForum: 'منتدى المجتمع',
    newPost: 'منشور جديد',
    replies: 'ردود',
    comment: 'تعليق',
    
    // Rewards
    rewardsShop: 'متجر المكافآت',
    coinsAvailable: 'عملة متاحة',
    purchase: 'شراء',
    
    // About
    aboutApp: 'حول تطبيق العربية SRS',
    appVision: 'رؤيتنا',
    howItWorks: 'كيف يعمل',
    contactUs: 'اتصل بنا',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<'en' | 'ar'>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
    document.documentElement.dir = language === 'en' ? 'rtl' : 'ltr';
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}