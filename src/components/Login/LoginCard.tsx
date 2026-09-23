import React from 'react';
import { LoginBanner } from './LoginBanner';
import { LoginForm } from './LoginForm';
import { GuestLoginButton } from './GuestLoginButton';

export const LoginCard: React.FC = () => {
  return (
    <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
      {/* Banner Izquierdo */}
      <LoginBanner />

      {/* Formulario Derecho */}
      <div className="w-full md:w-7/12 p-8 md:p-10 flex flex-col justify-between bg-white">
        <LoginForm />
        <GuestLoginButton />
      </div>
    </div>
  );
};