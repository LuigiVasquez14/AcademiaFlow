import React from 'react';
import { User } from 'lucide-react';

interface GuestLoginButtonProps {
  alEntrarInvitado?: () => void;
}

export const GuestLoginButton: React.FC<GuestLoginButtonProps> = ({ alEntrarInvitado }) => {
  const manejarInvitado = () => {
    if (alEntrarInvitado) {
      alEntrarInvitado();
    }
  };

  return (
    <div className="w-full mt-6 pt-4 border-t border-gray-200 dark:border-[#1D2939] flex flex-col items-center">
      <button
        type="button"
        onClick={manejarInvitado}
        className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-[#1D2939] dark:hover:bg-[#1D2939]/80 border border-gray-300 dark:border-[#1D2939] rounded-lg dark:text-[#F9FAFB] font-medium text-xs flex items-center justify-center gap-2 transition duration-200 cursor-pointer"
      >
        <User size={15} className="text-gray-500 dark:text-[#98A2B3]" />
        <span>Continuar como Invitado</span>
      </button>

      <div className="mt-4 text-center">
        <p className="text-[11px] text-gray-500 dark:text-[#98A2B3]">
          ¿Primera vez aquí? <br />
          <span className="text-gray-700 dark:text-[#F9FAFB] font-medium">
            Usa tu documento como contraseña inicial.
          </span>
        </p>
      </div>
    </div>
  );
};