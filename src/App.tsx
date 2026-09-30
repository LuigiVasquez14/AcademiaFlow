import { useState } from 'react';
import { BarraLateral } from './Components/BarraLateral';
import type { DatosInicioSesion, UsuarioAutenticado } from './Types/DatosInicioSesion';
import { LoginPage } from './Pages/CrearSesion';
import { Dashboard } from './Pages/Dashboard';
import { Proyectos } from './Pages/Proyectos';
import { NuevoProyecto } from './Pages/NuevoProyecto';
import { Verificaciones } from './Pages/Verificaciones';

// Vista de relleno para lo que todavía no está construido (Configuración/API).
function VistaEnConstruccion({ titulo }: { titulo: string }) {
    return (
        <div className="flex h-full w-full items-center justify-center bg-white dark:bg-[#101828] p-8 transition-colors duration-300">
            <div className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#171F2F] px-10 py-8 text-center shadow-sm">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-[#465FFF]">
                    Próximamente
                </p>
                <h2 className="text-[20px] font-bold text-gray-900 dark:text-[#F9FAFB]">{titulo}</h2>
                <p className="max-w-[320px] text-[12.5px] text-gray-500 dark:text-gray-400">
                    Esta sección todavía no está conectada al backend.
                </p>
            </div>
        </div>
    );
}

export function App() {
  // Estado para controlar si el usuario ha iniciado sesión
  const [estaAutenticado, setEstaAutenticado] = useState<boolean>(false);

  // Datos del usuario logueado en frontend
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);

  // Sección actual de navegación
  const [seccionActiva, setSeccionActiva] = useState<string>('proyectos');

  // Función para manejar el inicio de sesión con credenciales
  const manejarInicioSesion = (datos: DatosInicioSesion) => {
    // Generar un nombre a partir del correo o usar el líder por defecto
    const nombreExtraido = datos.Correo.includes('@') 
      ? datos.Correo.split('@')[0].replace('.', ' ')
      : 'Luigi Vásquez';

    const nombreFormateado = nombreExtraido
      .split(' ')
      .map(p => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ');

    const iniciales = nombreFormateado
      .split(' ')
      .map(p => p.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'LV';

    setUsuario({
      nombre: nombreFormateado || 'Luigi Vásquez',
      rol: 'Líder de Proyecto',
      correo: datos.Correo,
      iniciales: iniciales,
    });

    setEstaAutenticado(true);
  };

  // Función para entrar directamente como invitado
  const manejarEntrarInvitado = () => {
    setUsuario({
      nombre: 'Usuario Invitado',
      rol: 'Visitante Académico',
      correo: 'invitado@academiaflow.edu',
      iniciales: 'IN',
      esInvitado: true,
    });
    setEstaAutenticado(true);
  };

  // Función para cerrar sesión y volver a la pantalla de login
  const manejarCerrarSesion = () => {
    setEstaAutenticado(false);
    setUsuario(null);
    setSeccionActiva('proyectos');
  };

  // 1. Si NO está autenticado, renderizar la pantalla de Login con el contenedor unificado
  if (!estaAutenticado) {
    return (
      <div className="min-h-screen w-screen bg-white dark:bg-[#101828] flex items-center justify-center transition-colors duration-300">
        <LoginPage
          alIniciarSesion={manejarInicioSesion}
          alEntrarInvitado={manejarEntrarInvitado}
        />
      </div>
    );
  }

  // 2. Si ESTÁ autenticado, renderizar la interfaz principal del sistema
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-[#101828] text-gray-900 dark:text-[#F9FAFB] transition-colors duration-300">
      {/* Barra lateral de navegación */}
      <BarraLateral
        rutaActiva={seccionActiva}
        alCambiarRuta={(ruta) => setSeccionActiva(ruta)}
        usuario={usuario}
        alCerrarSesion={manejarCerrarSesion}
      />

      {/* Contenido: cambia según la sección activa del sidebar */}
      <main className="flex-1 overflow-hidden">
        {seccionActiva === 'panelControl' && <Dashboard idUsuario={1} />}
        {seccionActiva === 'proyectos' && (
          <Proyectos alCrearProyecto={() => setSeccionActiva('nuevoProyecto')} />
        )}
        {seccionActiva === 'nuevoProyecto' && (
          <NuevoProyecto
            alCrear={() => setSeccionActiva('proyectos')}
            alCancelar={() => setSeccionActiva('proyectos')}
          />
        )}
        {seccionActiva === 'verificaciones' && <Verificaciones />}
        {seccionActiva === 'configuracionApi' && <VistaEnConstruccion titulo="Configuración / API" />}
      </main>
    </div>
  );
}

export default App;