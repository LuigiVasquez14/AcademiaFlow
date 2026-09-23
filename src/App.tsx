import type { DatosInicioSesion } from './Types/DatosInicioSesion';
import { IniciarSesion } from './Pages/IniciarSesion';

function App() {
  async function manejarInicioSesion(valores: DatosInicioSesion) {
    // TODO: conectar con Supabase / la Web API en C#.
    console.log('Inicio de sesión:', valores);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FBF9F5] px-6">
      <div className="w-full max-w-[400px] rounded-[6px] border border-[#E8E1D5] bg-white p-7">
        <h1 className="mb-6 font-serif text-2xl font-semibold text-[#2B2621]">
          Iniciar sesión
        </h1>
        <IniciarSesion AlEnviar={manejarInicioSesion} />
      </div>
    </div>
  );
}

export default App;