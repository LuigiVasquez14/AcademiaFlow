import React from 'react';
import { LoginCard, type VistaAuth } from '../Components/Login/LoginCard';
import type { DatosInicioSesion } from '../Types/DatosInicioSesion';
import type { LoginResponseDto } from '../api';

interface LoginPageProps {
  alIniciarSesion?: (datos: DatosInicioSesion) => Promise<void>;
  alEntrarInvitado?: () => void;
  alRegistroExitoso?: (respuesta: LoginResponseDto) => Promise<void>;
  vistaInicial?: VistaAuth;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  alIniciarSesion,
  alEntrarInvitado,
  alRegistroExitoso,
  vistaInicial = 'login',
}) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-white dark:bg-[#101828] transition-colors duration-300">
      <LoginCard 
        alIniciarSesion={alIniciarSesion} 
        alEntrarInvitado={alEntrarInvitado}
        alRegistroExitoso={alRegistroExitoso}
        vistaInicial={vistaInicial}
      />
    </div>
  );
};