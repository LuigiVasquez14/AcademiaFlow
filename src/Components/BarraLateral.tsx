import React, { useState } from 'react';
import type { ElementosNavegacion } from '../Types/ElementosNavegacion';

// Opcional: Iconos de ejemplo
import { 
  LayoutDashboard, 
  FolderKanban, 
  PlusCircle, 
  CheckCircle2, 
  Settings 
} from 'lucide-react';

interface BarraLateralProps {
  rutaInicial?: string;
  alCambiarRuta?: (ruta: string) => void;
}

export const BarraLateral: React.FC<BarraLateralProps> = ({ 
  rutaInicial = 'proyectos', 
  alCambiarRuta 
}) => {
  // Estado para controlar cuál elemento está seleccionado actualmente
  const [elementoActivo, setElementoActivo] = useState<string>(rutaInicial);

  // Lista de elementos de navegación traducidos al español y en camelCase
  const listaNavegacion: ElementosNavegacion[] = [
    { id: 'panelControl', nombreEtiqueta: 'Panel de Control', ruta: '/dashboard', icono: <LayoutDashboard size={20} /> },
    { id: 'proyectos', nombreEtiqueta: 'Proyectos', ruta: '/proyectos', icono: <FolderKanban size={20} /> },
    { id: 'nuevoProyecto', nombreEtiqueta: 'Nuevo Proyecto', ruta: '/nuevo-proyecto', icono: <PlusCircle size={20} /> },
    { id: 'verificaciones', nombreEtiqueta: 'Verificaciones', ruta: '/verificaciones', icono: <CheckCircle2 size={20} /> },
    { id: 'configuracionApi', nombreEtiqueta: 'Configuración / API', ruta: '/configuracion', icono: <Settings size={20} /> },
  ];

  const manejarSeleccion = (id: string, ruta: string) => {
    setElementoActivo(id);
    if (alCambiarRuta) {
      alCambiarRuta(ruta);
    }
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col justify-between select-none">
      {/* Sección Superior: Logo y Navegación */}
      <div>
        {/* Seccion cabecera / Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <span className="font-serif font-bold text-xl tracking-tight text-gray-900">
            AcademiaFlow
          </span>
        </div>

        {/* Menú de Navegación */}
        <nav className="p-4 space-y-1">
          {listaNavegacion.map((item) => {
            const estaActivo = elementoActivo === item.id;

            return (
              <button
                key={item.id}
                onClick={() => manejarSeleccion(item.id, item.ruta)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors duration-150 text-left ${
                  estaActivo
                    ? 'bg-[#F3EFEA] text-gray-900 font-semibold' // Color fuerte seleccionado según la UI de la imagen
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={estaActivo ? 'text-gray-900' : 'text-gray-500'}>
                  {item.icono}
                </span>
                <span>{item.nombreEtiqueta}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sección Inferior: Perfil de Usuario */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-2">
          {/* Avatar con las iniciales LV como en la imagen */}
          <div className="w-9 h-9 rounded-full bg-[#E6D7C3] text-amber-900 font-bold flex items-center justify-center text-xs shadow-inner">
            LV
          </div>
          <div className="flex flex-col truncate">
            <span className="text-sm font-semibold text-gray-800 truncate">Luigi Vásquez</span>
            <span className="text-xs text-gray-500 truncate">Investigador líder</span>
          </div>
        </div>
      </div>
    </aside>
  );
};