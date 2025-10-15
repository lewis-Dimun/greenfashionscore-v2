export const createClientComponentClient = jest.fn(() => ({
  auth: {
    getSession: jest.fn(() =>
      Promise.resolve({ data: { session: { user: { id: 'mock-user' } } } })
    ),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
    getUser: jest.fn(() =>
      Promise.resolve({ data: { user: { id: 'mock-user' } } })
    ),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(() => Promise.resolve({ data: null, error: null })),
  })),
}));

export const createServerComponentClient = jest.fn(() => ({
  auth: {
    getSession: jest.fn(() =>
      Promise.resolve({ data: { session: { user: { id: 'mock-user' } } } })
    ),
    getUser: jest.fn(() =>
      Promise.resolve({ data: { user: { id: 'mock-user' } } })
    ),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(() => Promise.resolve({ data: null, error: null })),
  })),
}));
