import React from 'react';

export const LoginBanner: React.FC = () => {
  return (
    <div className="w-full md:w-5/12 bg-gradient-to-br from-[#101828] via-[#171F2F] to-[#465FFF]/30 p-8 md:p-10 text-[#F9FAFB] flex flex-col justify-between relative min-h-[400px] md:min-h-[550px]">
      {/* Logo Badge */}
      <div>
        <div className="inline-block bg-[#171F2F]/60 border border-[#1D2939] backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider text-[#F9FAFB]">
          Academia Flow
        </div>
      </div>

      {/* Mensaje central */}
      <div className="my-auto py-8">
        <h2 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mb-4 text-[#F9FAFB]">
          Hola, <br />
          ¡Bienvenido de nuevo!
        </h2>
        <p className="text-[#98A2B3] text-sm leading-relaxed max-w-sm">
          Gestiona tus tareas, manten control sobre tus objetivos y alcanza tus metas de manera eficiente. Inicia sesión para continuar con tu flujo de trabajo.
        </p>
      </div>

      {/* Footer */}
      <div className="text-xs text-[#98A2B3] tracking-wider">
        © 2026 SISTEMA DE GESTIÓN
      </div>
    </div>
  );
};