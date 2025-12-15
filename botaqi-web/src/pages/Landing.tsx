import React, { useEffect } from 'react';
import '../styles/landing.css';
import { logEvent } from '../lib/firebase/analytics';
import { useAuth } from '../lib/firebase/auth';

const Landing: React.FC = () => {
  const { signInWithGoogle, user } = useAuth();

  useEffect(() => {
    logEvent('page_view', { page: 'landing' });
  }, []);

  const handleCTA = async () => {
    logEvent('click_cta', { button_id: 'hero_start' });
    if (!user) {
      try {
        await signInWithGoogle();
      } catch (e) {
        console.error(e);
      }
    } else {
      // Redirect to dashboard (placeholder)
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="landing-container">
      <div className="geometric-pattern" />
      
      <nav style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--gold-primary)' }}>BOTAQI</div>
        <button onClick={handleCTA} style={{ background: 'transparent', border: '1px solid var(--gold-primary)', color: 'var(--gold-primary)', padding: '0.5rem 1.5rem', borderRadius: '25px', cursor: 'pointer' }}>
          {user ? 'Dashboard' : 'Login'}
        </button>
      </nav>

      <header className="hero-section">
        <h1 className="arabic-title">تعلم العربية بذكاء</h1>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Master Arabic with AI & Spaced Repetition</h2>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px', marginBottom: '3rem', opacity: 0.8 }}>
          Botaqi combines advanced AI generation with the proven SM-2 algorithm to help you achieve fluency faster.
        </p>
        <button className="luxury-button" onClick={handleCTA}>
          Start Your Journey
        </button>
      </header>

      <section className="feature-grid">
        <div className="feature-card">
          <h3 style={{ color: 'var(--gold-primary)' }}>AI-Powered</h3>
          <p>Generate custom flashcards instantly from any text or topic using GPT-4o.</p>
        </div>
        <div className="feature-card">
          <h3 style={{ color: 'var(--gold-primary)' }}>Smart Review</h3>
          <p>Our algorithm schedules reviews at the perfect time to maximize retention.</p>
        </div>
        <div className="feature-card">
          <h3 style={{ color: 'var(--gold-primary)' }}>Gamified</h3>
          <p>Earn coins, maintain streaks, and level up as you master the language.</p>
        </div>
      </section>

      <footer style={{ textAlign: 'center', padding: '4rem', opacity: 0.6, fontSize: '0.9rem' }}>
        <p>&copy; {new Date().getFullYear()} Botaqi. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
