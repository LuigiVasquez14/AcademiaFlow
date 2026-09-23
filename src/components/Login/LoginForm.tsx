import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import type { DatosInicioSesion } from '../../Types/DatosInicioSesion';

interface LoginFormProps {
  alIniciarSesion?: (datos: DatosInicioSesion) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ alIniciarSesion }) => {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [recordarSesion, setRecordarSesion] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correo.trim() || !contraseña.trim()) {
      setError('Por favor ingresa tu correo/documento y contraseña.');
      return;
    }

    setError('');
    setCargando(true);

    // Simulación de respuesta inmediata de frontend
    setTimeout(() => {
      setCargando(false);
      if (alIniciarSesion) {
        alIniciarSesion({
          Correo: correo,
          Contraseña: contraseña,
          RecordarSesion: recordarSesion,
        });
      }
    }, 400);
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

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={manejarEnvio} className="space-y-4">
        {/* Input Documento o Correo */}
        <div>
          <label htmlFor="correo" className="block text-xs font-medium text-gray-700 mb-1.5">
            Documento o Correo
          </label>
          <input
            id="correo"
            type="text"
            placeholder="1143XXXXXX o usuario@correo.com"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            disabled={cargando}
            required
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-gray-800 placeholder-gray-400 disabled:bg-gray-100"
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
              type={mostrarContraseña ? 'text' : 'password'}
              placeholder="••••••••"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              disabled={cargando}
              required
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-gray-800 placeholder-gray-400 pr-10 disabled:bg-gray-100"
            />
            <button
              type="button"
              onClick={() => setMostrarContraseña(!mostrarContraseña)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              tabIndex={-1}
            >
              {mostrarContraseña ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Checkbox Recordarme */}
        <div className="flex items-center pt-1">
          <input
            id="remember"
            type="checkbox"
            checked={recordarSesion}
            onChange={(e) => setRecordarSesion(e.target.checked)}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
          />
          <label htmlFor="remember" className="ml-2 text-xs text-gray-600 cursor-pointer">
            Recordarme en este equipo
          </label>
        </div>

        {/* Botón Entrar */}
        <button
          type="submit"
          disabled={cargando}
          className="w-full mt-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-600 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer disabled:cursor-not-allowed"
        >
          {cargando ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              <span>Ingresando...</span>
            </>
          ) : (
            <>
              <span>Entrar al Sistema</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};