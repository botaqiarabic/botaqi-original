import { useSupabaseClient } from '../supabase/client';
import { openDB } from 'idb';

const DB_NAME = 'gulfArabicFlashcards';
const QUEUE_STORE = 'syncQueue';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(QUEUE_STORE, { keyPath: 'id', autoIncrement: true });
  },
});

export const queueAction = async (action) => {
  const db = await dbPromise;
  await db.add(QUEUE_STORE, action);
};

export const sync = async () => {
  if (!navigator.onLine) return;

  const client = useSupabaseClient();
  const db = await dbPromise;
  let transaction = await db.getAll(QUEUE_STORE);

  for (const action of transaction) {
    try {
      switch (action.type) {
        case 'insert_deck':
          await client.from('decks').insert(action.data);
          break;
        case 'update_progress':
          await client.from('user_progress').upsert(action.data);
          break;
        default:
          console.warn('Unknown action type:', action.type);
      }
      await db.delete(QUEUE_STORE, action.id);
    } catch (error) {
      console.error('Sync failed for action:', action, error);
    }
  }
};

window.addEventListener('online', sync);
setInterval(sync, 60000);