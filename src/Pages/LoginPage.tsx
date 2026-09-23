
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
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))]">
      <LoginCard 
        alIniciarSesion={alIniciarSesion} 
        alEntrarInvitado={alEntrarInvitado} 
      />
    </div>
  );
};