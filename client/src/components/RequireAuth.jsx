import React, { useState, useEffect } from 'react';
import LoginModal from '../components/LoginModal';

export default function RequireAuth({ children }) {
  const [showLogin, setShowLogin] = useState(() => !localStorage.getItem('user'));

  useEffect(() => {
    // Nếu user logout ở tab khác cũng tự show modal
    const onStorage = () => setShowLogin(!localStorage.getItem('user'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleLoginSuccess = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    setShowLogin(false);
  };

  if (showLogin) {
    return <LoginModal onSuccess={handleLoginSuccess} />;
  }
  return children;
}
