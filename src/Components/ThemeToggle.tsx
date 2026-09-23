import React, {useState} from 'react';
import {Sun, Moon} from 'lucide-react'

export const ThemeToggle : React.FC = () => {
  //1. Estado para saber si estamos en oscuro o no
  const [esOscuro,setEsOscuro] = useState(true);

  //2. Click del usuario
  const alternarTema = () => {
    const nuevoEstado = !esOscuro;
    setEsOscuro(nuevoEstado);

  //3.Modificacion directa de la raiz html
    if(nuevoEstado){
      document.documentElement.classList.add('dark')
    } else{
      document.documentElement.classList.remove('dark')
    }
  };

  //4.Interfaz visual
  return(
    <button
    type="button"
    onClick={alternarTema}
    className='flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-100hover:bg-gray-200 text-gray-800 dark:bg-[#1D2939] dark:hover:bg-[#1D2939]/80 border border-gray-300 dark:border-[#1D2939] dark:text-[#F9FAFB] font-medium text-xs cursor-pointer transition-colors shadow-sm'
    >{esOscuro ? (
        <>
          <Sun size={15} className="text-amber-500" />
          <span>Modo Blanco</span>
        </>
        ) : (
          <>
          <Moon size={15} className="text-[#465FFF]"/>
          <span>Modo Oscuro</span>
          </>
        )
        
      }</button>
  )
  


}