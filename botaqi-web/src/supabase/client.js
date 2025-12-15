// ARCHIVED: Supabase client replaced with Firebase.
// This file remains for compatibility but returns a no-op stub.

export const useSupabaseClient = () => {
  console.warn('useSupabaseClient is deprecated. Use Firebase/Firestore instead.');
  
  // Return a no-op client interface to prevent runtime errors
  return {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      upsert: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
    }),
  };
};
};