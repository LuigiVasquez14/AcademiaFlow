import React from 'react';
import type { ElementosNavegacion } from '../Types/ElementosNavegacion';
import type { UsuarioAutenticado } from '../Types/DatosInicioSesion';
import { 
  LayoutDashboard, 
  FolderKanban, 
  PlusCircle, 
  CheckCircle2, 
  Settings,
  LogOut
} from 'lucide-react';

interface BarraLateralProps {
  rutaInicial?: string;
  rutaActiva?: string;
  alCambiarRuta?: (ruta: string) => void;
  usuario?: UsuarioAutenticado | null;
  alCerrarSesion?: () => void;
}

export const BarraLateral: React.FC<BarraLateralProps> = ({ 
  rutaInicial = 'proyectos',
  rutaActiva,
  alCambiarRuta,
  usuario,
  alCerrarSesion
}) => {
  const elementoSeleccionado = rutaActiva || rutaInicial;

  const listaNavegacion: ElementosNavegacion[] = [
    { id: 'panelControl', nombreEtiqueta: 'Panel de Control', ruta: 'panelControl', icono: <LayoutDashboard size={19} /> },
    { id: 'proyectos', nombreEtiqueta: 'Proyectos', ruta: 'proyectos', icono: <FolderKanban size={19} /> },
    { id: 'nuevoProyecto', nombreEtiqueta: 'Nuevo Proyecto', ruta: 'nuevoProyecto', icono: <PlusCircle size={19} /> },
    { id: 'verificaciones', nombreEtiqueta: 'Verificaciones', ruta: 'verificaciones', icono: <CheckCircle2 size={19} /> },
    { id: 'configuracionApi', nombreEtiqueta: 'Configuración / API', ruta: 'configuracionApi', icono: <Settings size={19} /> },
  ];

  const manejarSeleccion = (ruta: string) => {
    if (alCambiarRuta) {
      alCambiarRuta(ruta);
    }
  };

  const nombreUsuario = usuario?.nombre || 'Luigi Vásquez';
  const rolUsuario = usuario?.rol || 'Líder de Proyecto';
  const inicialesUsuario = usuario?.iniciales || 'LV';

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col justify-between select-none shadow-xs shrink-0">
      {/* Sección Superior: Logo y Navegación */}
      <div>
        {/* Sección Cabecera / Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100 gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            AF
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-gray-900 block leading-tight">
              AcademiaFlow
            </span>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
              Sistema Académico
            </span>
          </div>
        </div>

        {/* Menú de Navegación */}
        <nav className="p-4 space-y-1">
          {listaNavegacion.map((item) => {
            const estaActivo = elementoSeleccionado === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => manejarSeleccion(item.ruta)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left cursor-pointer ${
                  estaActivo
                    ? 'bg-indigo-50 text-indigo-900 font-semibold border-l-4 border-indigo-600 pl-2.5'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={estaActivo ? 'text-indigo-600' : 'text-gray-400'}>
                  {item.icono}
                </span>
                <span>{item.nombreEtiqueta}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sección Inferior: Perfil de Usuario y Logout */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-xs shadow-inner shrink-0">
              {inicialesUsuario}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-semibold text-gray-800 truncate" title={nombreUsuario}>
                {nombreUsuario}
              </span>
              <span className="text-xs text-gray-500 truncate" title={rolUsuario}>
                {rolUsuario}
              </span>
            </div>
          </div>

          {/* Botón Cerrar Sesión */}
          {alCerrarSesion && (
            <button
              type="button"
              onClick={alCerrarSesion}
              title="Cerrar sesión"
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150 cursor-pointer"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};