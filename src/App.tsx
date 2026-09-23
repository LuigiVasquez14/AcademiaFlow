import React from 'react';
import { BarraLateral } from './Components/BarraLateral';

function App() {
  const manejarCambioRuta = (ruta: string) => {
    console.log('Navegando a la ruta:', ruta);
    // Aquí puedes manejar la lógica de enrutamiento o cambiar de vista
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Barra lateral izquierda */}
      <BarraLateral 
        rutaInicial="proyectos" 
        alCambiarRuta={manejarCambioRuta} 
      />

      {/* Contenido principal de la aplicación (Simulando la vista de la imagen) */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Proyectos</h1>
          <p className="text-sm text-gray-500 mb-6">Catálogo institucional - 38 proyectos registrados - 24 activos</p>
          
          {/* Aquí irá el contenido de la tabla o las tarjetas que haremos en el siguiente paso */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <p className="text-gray-600">Espacio de trabajo principal listo para conectar los componentes de la interfaz.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;