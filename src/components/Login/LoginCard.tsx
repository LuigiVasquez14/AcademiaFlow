import React from 'react';
import { LoginBanner } from './LoginBanner';
import { LoginForm } from './LoginForm';
import { GuestLoginButton } from './GuestLoginButton';
import type { DatosInicioSesion } from '../../Types/DatosInicioSesion';

interface LoginCardProps {
  alIniciarSesion?: (datos: DatosInicioSesion) => void;
  alEntrarInvitado?: () => void;
}

export const LoginCard: React.FC<LoginCardProps> = ({
  alIniciarSesion,
  alEntrarInvitado,
}) => {
  return (
    <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100/50">
      {/* Banner Izquierdo */}
      <LoginBanner />

      {/* Formulario Derecho */}
      <div className="w-full md:w-7/12 p-8 md:p-10 flex flex-col justify-between bg-white">
        <LoginForm alIniciarSesion={alIniciarSesion} />
        <GuestLoginButton alEntrarInvitado={alEntrarInvitado} />
      </div>
    </div>
  );
};