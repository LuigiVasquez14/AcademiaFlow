import { useState } from 'react';
import { LoginPage } from './Pages/LoginPage';
import { BarraLateral } from './Components/BarraLateral';
import type { DatosInicioSesion, UsuarioAutenticado } from './Types/DatosInicioSesion';

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

  // 1. Si NO está autenticado, renderizar la pantalla de Login
  if (!estaAutenticado) {
    return (
      <LoginPage
        alIniciarSesion={manejarInicioSesion}
        alEntrarInvitado={manejarEntrarInvitado}
      />
    );
  }

  // 2. Si ESTÁ autenticado, renderizar la interfaz principal del sistema
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {/* Barra lateral de navegación */}
      <BarraLateral
        rutaActiva={seccionActiva}
        alCambiarRuta={(ruta) => setSeccionActiva(ruta)}
        usuario={usuario}
        alCerrarSesion={manejarCerrarSesion}
      />

     
    </div>
  );
}

export default App;