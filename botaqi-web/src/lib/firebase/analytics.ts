import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './client';

// Simple rate limiter: max 10 events per session per minute (in-memory)
let eventCount = 0;
setInterval(() => { eventCount = 0; }, 60000);

export async function logEvent(eventName: string, params: Record<string, any> = {}) {
  if (eventCount > 10) return; // Drop event if rate limit exceeded
  eventCount++;

  try {
    // Log to 'landing_analytics' collection
    await addDoc(collection(db, 'landing_analytics'), {
      event_name: eventName,
      ...params,
      timestamp: serverTimestamp(),
      url: window.location.pathname,
      userAgent: navigator.userAgent
    });
  } catch (e) {
    // Fail silently for analytics
    console.warn('Analytics log failed', e);
  }
}
