import React, { useState } from 'react';
import { SupabaseAuthProvider, useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const LoginForm: React.FC = () => {
  const { language } = useLanguage();
  const { signInWithEmail, signUpWithEmail, user, loading } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    setError(null);
    try {
      await signUpWithEmail(email, password);
      // Supabase may require email confirmation depending on project settings
    } catch (e: any) {
      setError(e?.message || 'signup failed');
    }
  };

  const handleSignIn = async () => {
    setError(null);
    try {
      await signInWithEmail(email, password);
    } catch (e: any) {
      setError(e?.message || 'signin failed');
    }
  };

  if (loading) return <div>{language === 'en' ? 'Checking session...' : 'جارٍ التحقق...'}</div>;
  if (user) return <div>{language === 'en' ? 'Signed in' : 'مسجل الدخول'}</div>;

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">{language === 'en' ? 'Sign in / Sign up' : 'تسجيل الدخول / إنشاء حساب'}</h2>
      <input className="w-full mb-3 p-2 border rounded" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" className="w-full mb-3 p-2 border rounded" placeholder={language === 'en' ? 'Password' : 'كلمة المرور'} value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <div className="text-red-600 mb-3">{error}</div>}
      <div className="flex space-x-2">
        <button onClick={handleSignIn} className="px-4 py-2 bg-blue-600 text-white rounded">{language === 'en' ? 'Sign In' : 'تسجيل الدخول'}</button>
        <button onClick={handleSignUp} className="px-4 py-2 bg-gray-200 rounded">{language === 'en' ? 'Sign Up' : 'إنشاء حساب'}</button>
      </div>
    </div>
  );
};

const LoginPage: React.FC = () => {
  return (
    <SupabaseAuthProvider>
      <LoginForm />
    </SupabaseAuthProvider>
  );
};

export default LoginPage;
