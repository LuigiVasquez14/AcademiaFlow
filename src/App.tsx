import { useState } from 'react';
import { BarraLateral } from './Components/BarraLateral';
import type { DatosInicioSesion, UsuarioAutenticado } from './Types/DatosInicioSesion';
import { LoginPage } from './Pages/CrearSesion';
import { Dashboard } from './Pages/Dashboard';
import { Proyectos } from './Pages/Proyectos';
import { TableroProyecto } from './Pages/Tableroproyecto';
import { NuevoProyecto } from './Pages/NuevoProyecto';
import { Verificaciones } from './Pages/Verificaciones';
import { Equipo } from './Pages/Equipo';
import { Notificaciones } from './Pages/Notificaciones';
import { Configuracion } from './Pages/Configuracion';
import { Perfil } from './Pages/Perfil';
import { apiLogin, type LoginResponseDto } from './api';

export function App() {
  // Estado para controlar si el usuario ha iniciado sesión
  const [estaAutenticado, setEstaAutenticado] = useState<boolean>(false);

  // Datos del usuario logueado en frontend
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);

  // ID del usuario autenticado (viene de la API)
  const [idUsuario, setIdUsuario] = useState<number>(0);

  // Sección actual de navegación
  const [seccionActiva, setSeccionActiva] = useState<string>('proyectos');

  // Proyecto actualmente seleccionado para ver en el Tablero tipo Trello
  const [idProyectoSeleccionado, setIdProyectoSeleccionado] = useState<number | undefined>(undefined);

  // Helper común para inicializar la sesión a partir de LoginResponseDto
  const establecerSesion = (respuesta: LoginResponseDto) => {
    const iniciales = respuesta.nombreCompleto
      .split(' ')
      .filter(Boolean)
      .map((p: string) => p.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'US';

    setIdUsuario(respuesta.id);
    setUsuario({
      nombre: respuesta.nombreCompleto,
      rol: respuesta.cargo ?? 'Usuario',
      correo: respuesta.email,
      iniciales,
    });
    setEstaAutenticado(true);
  };

  // Función para manejar el inicio de sesión — llama al endpoint real
  const manejarInicioSesion = async (datos: DatosInicioSesion): Promise<void> => {
    const respuesta = await apiLogin(datos.Correo, datos.Contraseña);
    establecerSesion(respuesta);
  };

  // Función para manejar el registro exitoso (inicia sesión inmediatamente)
  const manejarRegistroExitoso = async (respuesta: LoginResponseDto): Promise<void> => {
    establecerSesion(respuesta);
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
    setIdUsuario(1);
    setEstaAutenticado(true);
  };

  // Función para cerrar sesión y volver a la pantalla de login
  const manejarCerrarSesion = () => {
    setEstaAutenticado(false);
    setUsuario(null);
    setIdUsuario(0);
    setSeccionActiva('proyectos');
  };

  // Navegar al tablero tipo Trello con un proyecto específico
  const abrirTableroDeProyecto = (idProyecto: number) => {
    setIdProyectoSeleccionado(idProyecto);
    setSeccionActiva('tablero');
  };

  // 1. Si NO está autenticado, renderizar la pantalla unificada de Auth (Login, Crear Cuenta, Recuperar)
  if (!estaAutenticado) {
    return (
      <div className="min-h-screen w-screen bg-white dark:bg-[#101828] flex items-center justify-center transition-colors duration-300">
        <LoginPage
          alIniciarSesion={manejarInicioSesion}
          alEntrarInvitado={manejarEntrarInvitado}
          alRegistroExitoso={manejarRegistroExitoso}
        />
      </div>
    );
  }

  // 2. Si ESTÁ autenticado, renderizar la interfaz principal del sistema
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-[#0B111E] text-gray-900 dark:text-[#F9FAFB] transition-colors duration-300">
      {/* Barra lateral de navegación */}
      <BarraLateral
        rutaActiva={seccionActiva}
        alCambiarRuta={(ruta) => setSeccionActiva(ruta)}
        usuario={usuario}
        alCerrarSesion={manejarCerrarSesion}
      />

      {/* Contenido principal según sección */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {seccionActiva === 'panelControl' && (
          <Dashboard 
            idUsuario={idUsuario} 
            alNavegar={(ruta, idProy) => {
              if (idProy) setIdProyectoSeleccionado(idProy);
              setSeccionActiva(ruta);
            }}
          />
        )}
        
        {seccionActiva === 'proyectos' && (
          <Proyectos
            alCrearProyecto={() => setSeccionActiva('nuevoProyecto')}
            alVerTablero={abrirTableroDeProyecto}
          />
        )}

        {seccionActiva === 'tablero' && (
          <TableroProyecto
            idProyecto={idProyectoSeleccionado}
            alVolver={() => setSeccionActiva('proyectos')}
            alCambiarProyecto={(nuevoId) => setIdProyectoSeleccionado(nuevoId)}
          />
        )}

        {seccionActiva === 'nuevoProyecto' && (
          <NuevoProyecto
            alCrear={() => setSeccionActiva('proyectos')}
            alCancelar={() => setSeccionActiva('proyectos')}
          />
        )}

        {seccionActiva === 'equipo' && (
          <Equipo />
        )}

        {seccionActiva === 'verificaciones' && (
          <Verificaciones />
        )}

        {seccionActiva === 'notificaciones' && (
          <Notificaciones idUsuario={idUsuario} />
        )}

        {seccionActiva === 'configuracion' && (
          <Configuracion 
            usuario={usuario} 
            alIrAPerfil={() => setSeccionActiva('perfil')} 
          />
        )}

        {seccionActiva === 'perfil' && (
          <Perfil 
            idUsuario={idUsuario} 
            alVolver={() => setSeccionActiva('configuracion')} 
          />
        )}
      </main>
    </div>
  );
}

export default App;