import React from 'react';
import { LoginCard } from '../Components/Login/LoginCard';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 md:p-6">
      <LoginCard />
    </div>
  );
};