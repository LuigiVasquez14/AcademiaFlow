import React from 'react';
import type { ElementosNavegacion } from '../Types/ElementosNavegacion';
import type { UsuarioAutenticado } from '../Types/DatosInicioSesion';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Kanban,
  PlusCircle, 
  CheckCircle2, 
  Users,
  Bell,
  Settings,
  LogOut,
  UserCheck
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
    { id: 'panelControl', nombreEtiqueta: 'Panel de Control', ruta: 'panelControl', icono: <LayoutDashboard size={18} /> },
    { id: 'proyectos', nombreEtiqueta: 'Proyectos', ruta: 'proyectos', icono: <FolderKanban size={18} /> },
    { id: 'tablero', nombreEtiqueta: 'Tablero Kanban', ruta: 'tablero', icono: <Kanban size={18} /> },
    { id: 'nuevoProyecto', nombreEtiqueta: 'Nuevo Proyecto', ruta: 'nuevoProyecto', icono: <PlusCircle size={18} /> },
    { id: 'equipo', nombreEtiqueta: 'Equipo de Trabajo', ruta: 'equipo', icono: <Users size={18} /> },
    { id: 'verificaciones', nombreEtiqueta: 'Verificaciones', ruta: 'verificaciones', icono: <CheckCircle2 size={18} /> },
    { id: 'notificaciones', nombreEtiqueta: 'Notificaciones', ruta: 'notificaciones', icono: <Bell size={18} /> },
    { id: 'configuracion', nombreEtiqueta: 'Configuración', ruta: 'configuracion', icono: <Settings size={18} /> },
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
    <aside className="w-64 h-screen bg-white dark:bg-[#0E1726] border-r border-gray-200 dark:border-gray-800/80 flex flex-col justify-between select-none shadow-xs shrink-0 transition-colors duration-200">
      {/* Sección Superior: Logo y Navegación */}
      <div className="flex flex-col min-h-0 flex-1">
        {/* Cabecera / Logo */}
        <div className="h-16 flex items-center px-5 border-b border-gray-100 dark:border-gray-800/80 gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20">
            AF
          </div>
          <div className="truncate">
            <span className="font-bold text-base tracking-tight text-gray-900 dark:text-white block leading-tight">
              AcademiaFlow
            </span>
            <span className="text-[10px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold">
              Gestión Ágil & EF Core
            </span>
          </div>
        </div>

        {/* Menú de Navegación con Scroll si la pantalla es reducida */}
        <nav className="p-3 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
          {listaNavegacion.map((item) => {
            const estaActivo = elementoSeleccionado === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => manejarSeleccion(item.ruta)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 text-left cursor-pointer ${
                  estaActivo
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <span className={estaActivo ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}>
                  {item.icono}
                </span>
                <span className="truncate">{item.nombreEtiqueta}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sección Inferior: Perfil de Usuario y Logout */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-[#0B111E]/60">
        <div className="flex items-center justify-between gap-2">
          {/* Tarjeta de perfil clickeable que lleva a Perfil */}
          <button
            type="button"
            onClick={() => manejarSeleccion('perfil')}
            className={`flex items-center gap-2.5 overflow-hidden p-1.5 rounded-xl transition text-left cursor-pointer group flex-1 ${
              elementoSeleccionado === 'perfil'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 ring-1 ring-indigo-500/30'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800/60'
            }`}
            title="Ver y editar perfil"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
              {inicialesUsuario}
            </div>
            <div className="flex flex-col truncate min-w-0">
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {nombreUsuario}
              </span>
              <span className="text-[10.5px] text-gray-400 dark:text-gray-500 truncate flex items-center gap-1">
                <UserCheck size={11} className="inline text-emerald-500" />
                {rolUsuario}
              </span>
            </div>
          </button>

          {/* Botón Cerrar Sesión */}
          {alCerrarSesion && (
            <button
              type="button"
              onClick={alCerrarSesion}
              title="Cerrar sesión"
              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition cursor-pointer shrink-0"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};