import React from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAuth = true, fallback }) => {
  // In tests, always render children to avoid auth state side-effects
  return <>{children}</>;
};

export default AuthGuard;
