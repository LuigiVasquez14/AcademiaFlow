import React from 'react';
import { LoginBanner } from './LoginBanner';
import { LoginForm } from './LoginForm';
import { GuestLoginButton } from './GuestLoginButton';
import { ThemeToggle } from '../ThemeToggle';
import type { DatosInicioSesion } from '../../Types/DatosInicioSesion';

// 1. Declarar la interfaz de props aquí
interface LoginCardProps {
  alIniciarSesion?: (datos: DatosInicioSesion) => void;
  alEntrarInvitado?: () => void;
}

// 2. Pasar las props al componente
export const LoginCard: React.FC<LoginCardProps> = ({
  alIniciarSesion,
  alEntrarInvitado,
}) => {
  return (
    <div className="w-full max-w-4xl flex flex-col items-center gap-3">
      {/* Botón flotante para cambiar de tema */}
      <div className="self-end">
        <ThemeToggle />
      </div>

      {/* Tarjeta de Login adaptada a Modo Claro (bg-white) y Modo Oscuro (dark:bg-[#171F2F]) */}
      <div className="w-full bg-white dark:bg-[#171F2F] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-200 dark:border-[#1D2939] transition-colors duration-300">
        <LoginBanner />

        <div className="w-full md:w-7/12 p-8 md:p-10 flex flex-col justify-between bg-white dark:bg-[#171F2F] transition-colors duration-300">
          <LoginForm alIniciarSesion={alIniciarSesion} />
          <GuestLoginButton alEntrarInvitado={alEntrarInvitado} />
        </div>
      </div>
    </div>
  );
};