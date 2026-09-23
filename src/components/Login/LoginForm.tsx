import React, { useState } from 'react';

export const LoginForm: React.FC = () => {
  const [documento, setDocumento] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ documento, password, rememberMe });
  };

  return (
    <div className="w-full">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          Iniciar Sesión
        </h1>
        <p className="text-xs text-gray-500">
          ¿Eres visitante?{' '}
          <a href="#registro" className="text-indigo-600 font-semibold hover:underline">
            Haz tu registro aquí.
          </a>
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Documento o Correo */}
        <div>
          <label htmlFor="documento" className="block text-xs font-medium text-gray-700 mb-1.5">
            Documento o Correo
          </label>
          <input
            id="documento"
            type="text"
            placeholder="1143XXXXXX o usuario@correo.com"
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-gray-800 placeholder-gray-400"
          />
        </div>

        {/* Input Contraseña */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="password" className="text-xs font-medium text-gray-700">
              Contraseña
            </label>
            <a href="#forgot" className="text-xs text-indigo-600 font-semibold hover:underline">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-gray-800 placeholder-gray-400 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none text-sm"
            >
            </button>
          </div>
        </div>

        {/* Checkbox Recordarme */}
        <div className="flex items-center pt-1">
          <input
            id="remember"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
          />
          <label htmlFor="remember" className="ml-2 text-xs text-gray-600 cursor-pointer">
            Recordarme en este equipo
          </label>
        </div>

        {/* Botón Entrar */}
        <button
          type="submit"
          className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition duration-200 flex items-center justify-center gap-2 text-sm"
        >
          <span>Entrar al Sistema</span>
          <span>→</span>
        </button>
      </form>
    </div>
  );
};