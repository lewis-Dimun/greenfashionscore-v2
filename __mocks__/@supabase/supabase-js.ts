export const createClient = jest.fn(() => ({
  auth: {
    getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    onAuthStateChange: jest.fn(() => ({ 
      data: { subscription: { unsubscribe: jest.fn() } } 
    })),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(() => Promise.resolve({ data: null, error: null })),
    limit: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
  })),
}));

export const supabase = createClient();
