export const createClientComponentClient = jest.fn(() => ({
  auth: {
    getSession: jest.fn(() =>
      Promise.resolve({ 
        data: { 
          session: { 
            user: { 
              id: 'mock-user-id',
              email: 'test@example.com',
              user_metadata: {}
            } 
          } 
        },
        error: null
      })
    ),
    onAuthStateChange: jest.fn(() => ({
      data: { 
        subscription: { 
          unsubscribe: jest.fn() 
        } 
      },
    })),
    signInWithPassword: jest.fn(() =>
      Promise.resolve({
        data: { 
          session: { 
            user: { 
              id: 'mock-user-id',
              email: 'test@example.com'
            } 
          } 
        },
        error: null
      })
    ),
    signUp: jest.fn(() =>
      Promise.resolve({
        data: { 
          session: { 
            user: { 
              id: 'mock-user-id',
              email: 'test@example.com'
            } 
          } 
        },
        error: null
      })
    ),
    signOut: jest.fn(() =>
      Promise.resolve({ error: null })
    ),
    getUser: jest.fn(() =>
      Promise.resolve({
        data: { 
          user: { 
            id: 'mock-user-id',
            email: 'test@example.com'
          } 
        },
        error: null
      })
    )
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        order: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })),
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
      update: jest.fn(() => Promise.resolve({ data: null, error: null })),
      delete: jest.fn(() => Promise.resolve({ data: null, error: null }))
    }))
  }))
}));

export const createServerComponentClient = jest.fn(() => ({
  auth: {
    getSession: jest.fn(() =>
      Promise.resolve({ 
        data: { 
          session: { 
            user: { 
              id: 'mock-user-id',
              email: 'test@example.com'
            } 
          } 
        },
        error: null
      })
    ),
    getUser: jest.fn(() =>
      Promise.resolve({
        data: { 
          user: { 
            id: 'mock-user-id',
            email: 'test@example.com'
          } 
        },
        error: null
      })
    )
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        order: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })),
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
      update: jest.fn(() => Promise.resolve({ data: null, error: null })),
      delete: jest.fn(() => Promise.resolve({ data: null, error: null }))
    }))
  }))
}));