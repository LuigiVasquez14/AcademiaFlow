import React from 'react';
import { LoginCard } from '../Components/Login/LoginCard';
import type { DatosInicioSesion } from '../Types/DatosInicioSesion';

interface LoginPageProps {
  alIniciarSesion?: (datos: DatosInicioSesion) => void;
  alEntrarInvitado?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  alIniciarSesion,
  alEntrarInvitado,
}) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-white dark:bg-[#101828] transition-colors duration-300">
      <LoginCard 
        alIniciarSesion={alIniciarSesion} 
        alEntrarInvitado={alEntrarInvitado} 
      />
    </div>
  );
};