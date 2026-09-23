import { useState, type ChangeEvent } from 'react';
import {Eye, EyeOff} from "lucide-react"
// import React from 'react'
import type { DatosInicioSesion } from '../Types/DatosInicioSesion';

// import { error } from 'console';

const EstiloEntrada = "h-10 w-full rounded-[4px] border border-[#E8D1D5] bg-white px-3 text-[13.5px] text-[#2B2621] outline-none placeholder:text-[#6E655B] focus:border-[#7C5C38] disabled:bg-[#F5F0E6] disabled:opacity-70";
const EstiloEtiqueta = "text-[13px] font-medium text-[#2B2621]";
const EstiloBoton = "h-10 w-full rounded-[4px] bg-[#7C5C38] text-[13.5px] font-medium text-white transition-colors duration-150 hover:bg-[#63482A] disabled:cursor-not-allowed disabled:bg-[#D3C3B0]"

interface PropiedadesIniciarSesion {
    AlEnviar : (valores : DatosInicioSesion) => Promise<void>;
}

export function IniciarSesion({AlEnviar}: PropiedadesIniciarSesion) {

    const [correo, setCorreo] = useState("");
    const [contraseña, setContraseña] = useState("");
    const [recordarSesion, setRecordarSesion] = useState(true);
    const [mostrarContraseña, setMostrarContraseña] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");

    async function manejarEnvio(evento: ChangeEvent) {
        evento.preventDefault();
        if (!correo || !contraseña) {
            setError("Completa tu correo y contraseña. ");
            return;
        }
        setError("");
        setEnviando(true);
        try {
            await AlEnviar({Correo : correo, Contraseña: contraseña, RecordarSesion: recordarSesion});
        } catch {
            setError("Correo o contraseña incorrectos. Intenta de nuevo.");
        } finally {
            setEnviando(false);
        }
    }

    return (

        
        <form onSubmit={manejarEnvio} className='flex flex-col gap-4'>
            {error && (
                <p className='rounded-[4px] border border-[#F8B4B4] bg-[#FDF2F2] px-3 py-2 text-[12px] text-[#9B2C2C]'>{error}</p> 
            )}
            <div className='flex flex-col gap-1.5'>
            <label htmlFor="correoInicioSesion" className={EstiloEtiqueta}>Correo 
            </label>
            <input
            id="correoInicioSesion"
            type='email'
            placeholder="nombre@universidad.edu.co"
            className={EstiloEntrada}
            disabled={enviando}
            value={correo}
            onChange={(e)=> setCorreo(e.target.value)}            
            />
            </div>

            <div className='flex flex-col gap-1.5'>
    <label htmlFor="ContraseñaInicioSesion" className={EstiloEtiqueta}>
        Contraseña
    </label>

    <div className='relative'>
        <input
            id="ContraseñaInicioSesion"
            type={mostrarContraseña ? "text" : "password"}
            placeholder="••••••••"
            className={`${EstiloEntrada} pr-10`}
            disabled={enviando}
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}   
        />
        <button
            type='button'
            onClick={() => setMostrarContraseña((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7C5C38]"
            tabIndex={-1}
        >
            {mostrarContraseña ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4'/>}
        </button>
    </div>
</div>

            <div className='flex items-center justify-between'>
                <label className="flex items-center gap-2 text-[12-5px] text-[#6E655B]">
                    <input
                     type="checkbox"
                     checked={recordarSesion}
                     onChange={(e) => setRecordarSesion(e.target.checked)}
                     className="h-[15px] w-[15px] rounded-[3px] border border-[#E8E1D5] accent-[#7C5C38]"
                     
                     />
                     Recordar sesión
                </label>
                <a href="/recuperar-contrasena" className="text-[12px] font-medium text-[#7C5C38]">
                ¿Olvidaste tu contraseña?
                </a>
            </div>

            <button type='submit' disabled={enviando} className={EstiloBoton}>{enviando ? "Ingresando" : "Ingresar a la plataforma"}
                
            </button>

        </form>
    );
}

export default IniciarSesion; 