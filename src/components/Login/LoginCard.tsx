import React, { useState } from 'react';
import { AuthBanner } from './AuthBanner';
import { LoginForm } from './LoginForm';
import { RegistroForm } from './RegistroForm';
import { RecuperarPasswordForm } from './RecuperarPasswordForm';
import { GuestLoginButton } from './GuestLoginButton';
import { ThemeToggle } from '../ThemeToggle';
import type { DatosInicioSesion } from '../../Types/DatosInicioSesion';
import type { LoginResponseDto } from '../../api';

export type VistaAuth = 'login' | 'registro' | 'recuperar';

interface LoginCardProps {
  alIniciarSesion?: (datos: DatosInicioSesion) => Promise<void>;
  alEntrarInvitado?: () => void;
  alRegistroExitoso?: (respuesta: LoginResponseDto) => Promise<void>;
  vistaInicial?: VistaAuth;
}

export const LoginCard: React.FC<LoginCardProps> = ({
  alIniciarSesion,
  alEntrarInvitado,
  alRegistroExitoso,
  vistaInicial = 'login',
}) => {
  const [vista, setVista] = useState<VistaAuth>(vistaInicial);

  const bannerProps = {
    login: {
      titulo: 'Hola,\n¡Bienvenido!',
      subtitulo: 'Gestiona proyectos, controla tareas y colabora con tu equipo académico desde un solo lugar.',
    },
    registro: {
      titulo: 'Crea tu\ncuenta',
      subtitulo: 'Únete a AcademiaFlow para coordinar investigaciones, proyectos y tareas estilo Trello.',
    },
    recuperar: {
      titulo: 'Recupera tu\nacceso',
      subtitulo: 'Restablece tu contraseña de manera rápida y segura para continuar tus proyectos.',
    },
  }[vista];

  return (
    <div className="w-full max-w-4xl flex flex-col items-center gap-3">
      {/* Botón flotante para cambiar de tema y selector rápido de vista */}
      <div className="w-full flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setVista('login')}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition cursor-pointer ${
              vista === 'login'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => setVista('registro')}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition cursor-pointer ${
              vista === 'registro'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Crear Cuenta
          </button>
          <button
            type="button"
            onClick={() => setVista('recuperar')}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition cursor-pointer ${
              vista === 'recuperar'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Recuperar Clave
          </button>
        </div>
        <ThemeToggle />
      </div>

      {/* Tarjeta de Auth adaptada a Modo Claro y Modo Oscuro */}
      <div className="w-full bg-white dark:bg-[#171F2F] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-200 dark:border-[#1D2939] transition-colors duration-300">
        <AuthBanner titulo={bannerProps.titulo} subtitulo={bannerProps.subtitulo} />

        <div className="w-full md:w-7/12 p-8 md:p-10 flex flex-col justify-between bg-white dark:bg-[#171F2F] transition-colors duration-300 min-h-[520px]">
          {vista === 'login' && (
            <>
              <LoginForm 
                alIniciarSesion={alIniciarSesion} 
                alIrARegistro={() => setVista('registro')}
                alIrARecuperar={() => setVista('recuperar')}
              />
              <div className="pt-6">
                <GuestLoginButton alEntrarInvitado={alEntrarInvitado} />
              </div>
            </>
          )}

          {vista === 'registro' && (
            <RegistroForm 
              alIrALogin={() => setVista('login')}
              alRegistroExitoso={alRegistroExitoso}
            />
          )}

          {vista === 'recuperar' && (
            <RecuperarPasswordForm 
              alIrALogin={() => setVista('login')}
            />
          )}
        </div>
      </div>
    </div>
  );
};