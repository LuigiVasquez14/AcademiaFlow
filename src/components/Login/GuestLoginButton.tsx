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
    <div className="w-full mt-6 pt-4 border-t border-gray-100 flex flex-col items-center">
      <button
        type="button"
        onClick={manejarInvitado}
        className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium text-xs flex items-center justify-center gap-2 transition duration-200 cursor-pointer"
      >
        <User size={15} className="text-gray-500" />
        <span>Continuar como Invitado</span>
      </button>

      <div className="mt-4 text-center">
        <p className="text-[11px] text-gray-400">
          ¿Primera vez aquí? <br />
          <span className="text-gray-500 font-medium">
            Usa tu documento como contraseña inicial.
          </span>
        </p>
      </div>
    </div>
  );
};