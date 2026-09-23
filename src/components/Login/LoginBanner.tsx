import React from 'react';

export const LoginBanner: React.FC = () => {
  return (
    <div className="w-full md:w-5/12 bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-600 p-8 md:p-10 text-white flex flex-col justify-between relative min-h-[400px] md:min-h-[550px]">
      {/* Logo Badge */}
      <div>
        <div className="inline-block bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider">
          ACADEMIA FLOW
        </div>
      </div>

      {/* Mensaje central */}
      <div className="my-auto py-8">
        <h2 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mb-4">
          Hola, <br />
          ¡Bienvenido de nuevo!
        </h2>
        <p className="text-indigo-100 text-sm leading-relaxed max-w-sm">
        gestiona tus tareas, manten control sobre tus objetivos y alcanza tus metas de manera eficiente. Inicia sesión para continuar con tu flujo de trabajo.
        </p>
      </div>

      {/* Footer */}
      <div className="text-xs text-indigo-200 tracking-wider">
        © 2026 SISTEMA DE GESTIÓN
      </div>
    </div>
  );
};