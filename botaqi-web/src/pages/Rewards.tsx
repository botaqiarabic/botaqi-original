import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
}

interface VoucherData {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  available: boolean;
  claimed: boolean;
}

const Rewards: React.FC = () => {
  const { language } = useLanguage();
  const [userPoints] = useState(1250);
  const [userLevel] = useState(3);
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [vouchers, setVouchers] = useState<VoucherData[]>([]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherData | null>(null);

  const loadRewardsData = () => {
    // Mock badges data
    setBadges([
      {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Complete your first practice session',
        icon: '👶',
        earned: true,
        earnedDate: '2024-01-15'
      },
      {
        id: 'streak_master',
        name: 'Streak Master',
        description: 'Practice for 7 days in a row',
        icon: '🔥',
        earned: true,
        earnedDate: '2024-01-22'
      },
      {
        id: 'quick_learner',
        name: 'Quick Learner',
        description: 'Master 50 cards',
        icon: '⚡',
        earned: true,
        earnedDate: '2024-01-20'
      },
      {
        id: 'accuracy_king',
        name: 'Accuracy King',
        description: 'Achieve 90% accuracy in a session',
        icon: '🎯',
        earned: false
      },
      {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Practice after 10 PM',
        icon: '🦉',
        earned: false
      },
      {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Practice before 6 AM',
        icon: '🐦',
        earned: false
      }
    ]);

    // Mock vouchers data
    setVouchers([
      {
        id: 'coffee_voucher',
        title: 'Free Coffee',
        description: 'Get a free coffee at any participating café',
        pointsRequired: 500,
        available: true,
        claimed: false
      },
      {
        id: 'book_voucher',
        title: 'Arabic Book',
        description: 'Free Arabic learning book',
        pointsRequired: 1000,
        available: true,
        claimed: false
      },
      {
        id: 'course_voucher',
        title: 'Online Course',
        description: 'Free online Arabic course',
        pointsRequired: 1000,
        available: true,
        claimed: false
      }
    ]);
  };

  useEffect(() => {
    loadRewardsData();
  }, []);

  const getLevelProgress = () => {
    const currentLevelPoints = (userLevel - 1) * 500;
    const nextLevelPoints = userLevel * 500;
    const progress = ((userPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    return Math.min(progress, 100);
  };

  const handleClaimVoucher = (voucher: VoucherData) => {
    if (userPoints >= voucher.pointsRequired) {
      setSelectedVoucher(voucher);
      setShowVoucherModal(true);
    }
  };

    return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {language === 'en' ? 'Rewards' : 'المكافآت'}
        </h1>
        <p className="text-gray-600 mt-2">
          {language === 'en' 
            ? 'Earn points, unlock badges, and claim rewards'
            : 'اكسب النقاط، افتح الشارات، واحصل على المكافآت'
          }
        </p>
      </div>

        {/* Points and Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'en' ? 'Your Points' : 'نقاطك'}
            </h3>
            <span className="text-2xl">💰</span>
                </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">{userPoints.toLocaleString()}</div>
          <p className="text-gray-600">
            {language === 'en' ? 'Keep practicing to earn more!' : 'استمر في التدريب لكسب المزيد!'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'en' ? 'Level Progress' : 'تقدم المستوى'}
            </h3>
            <span className="text-2xl">⭐</span>
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {language === 'en' ? 'Level' : 'المستوى'} {userLevel}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
              style={{ width: `${getLevelProgress()}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {userPoints % 500}/500 {language === 'en' ? 'to next level' : 'للمستوى التالي'}
                  </p>
                </div>
              </div>

        {/* Badges */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {language === 'en' ? 'Badges' : 'الشارات'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
                    key={badge.id}
              className={`p-4 rounded-lg border-2 ${
                badge.earned 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200'
                    }`}
                  >
              <div className="flex items-center space-x-3">
                <div className={`text-3xl ${badge.earned ? '' : 'grayscale opacity-50'}`}>
                  {badge.icon}
                </div>
                      <div className="flex-1">
                  <div className={`font-semibold ${badge.earned ? 'text-green-800' : 'text-gray-500'}`}>
                          {badge.name}
                  </div>
                  <div className={`text-sm ${badge.earned ? 'text-green-600' : 'text-gray-400'}`}>
                          {badge.description}
                  </div>
                  {badge.earned && badge.earnedDate && (
                    <div className="text-xs text-green-500 mt-1">
                      {language === 'en' ? 'Earned on' : 'حصلت عليه في'} {badge.earnedDate}
                    </div>
                          )}
                        </div>
                      </div>
                    </div>
                ))}
              </div>
      </div>

        {/* Vouchers */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {language === 'en' ? 'Available Rewards' : 'المكافآت المتاحة'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vouchers.map((voucher) => (
            <div
                    key={voucher.id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="text-center">
                <div className="text-3xl mb-3">🎁</div>
                <h4 className="font-semibold text-gray-900 mb-2">{voucher.title}</h4>
                <p className="text-sm text-gray-600 mb-4">{voucher.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {voucher.pointsRequired} {language === 'en' ? 'points' : 'نقطة'}
                  </span>
                  <button
                    onClick={() => handleClaimVoucher(voucher)}
                    disabled={userPoints < voucher.pointsRequired || voucher.claimed}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      userPoints >= voucher.pointsRequired && !voucher.claimed
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {voucher.claimed 
                      ? (language === 'en' ? 'Claimed' : 'مطالب به')
                      : (language === 'en' ? 'Claim' : 'احصل عليه')
                    }
                  </button>
                      </div>
                      </div>
                    </div>
                ))}
              </div>
      </div>

        {/* Voucher Modal */}
        {showVoucherModal && selectedVoucher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
              <div className="text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {language === 'en' ? 'Congratulations!' : 'تهانينا!'}
              </h3>
              <p className="text-gray-600 mb-4">
                {language === 'en' 
                  ? `You've successfully claimed ${selectedVoucher.title}!`
                  : `لقد حصلت بنجاح على ${selectedVoucher.title}!`
                }
                </p>
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="font-semibold text-blue-800">{selectedVoucher.title}</div>
                <div className="text-sm text-blue-600">{selectedVoucher.description}</div>
              </div>
              <button
                onClick={() => {
                  setShowVoucherModal(false);
                  setSelectedVoucher(null);
                }}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {language === 'en' ? 'Close' : 'إغلاق'}
              </button>
            </div>
          </div>
      </div>
      )}
    </div>
  );
};

export default Rewards;