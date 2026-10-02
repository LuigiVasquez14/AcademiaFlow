import { useEffect, useState } from "react";
import type { ProyectoViewModel } from "../Types/Proyecto";
import { TableroFases } from "./Tablerofases";

const URL_PROYECTOS = "https://localhost:7045/api/Proyecto";

interface PropiedadesTableroProyecto {
    idProyecto: number;
}

// Vista para el usuario/investigador que participa en el proyecto:
// ve la ficha del proyecto y puede mover tareas entre fases (tipo Trello).
export function TableroProyecto({ idProyecto }: PropiedadesTableroProyecto) {

    const [proyecto, setProyecto] = useState<ProyectoViewModel | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        cargarProyecto();
    }, [idProyecto]);

    async function cargarProyecto() {
        setCargando(true);
        setError("");
        try {
            const respuesta = await fetch(`${URL_PROYECTOS}/${idProyecto}`);
            if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`);
            setProyecto(await respuesta.json());
        } catch {
            setError("No fue posible cargar el proyecto. Verifica que la API esté corriendo.");
        } finally {
            setCargando(false);
        }
    }

    if (cargando) {
        return <div className="p-8 text-center text-[13px] text-gray-500 dark:text-gray-400">Cargando proyecto…</div>;
    }

    if (error || !proyecto) {
        return (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
                <p className="text-[13px] text-red-600 dark:text-[#F04438]">{error || "Proyecto no encontrado."}</p>
                <button onClick={cargarProyecto} className="rounded-lg border border-gray-200 dark:border-[#1D2939] px-3 py-1.5 text-[12.5px] hover:bg-gray-50 dark:hover:bg-[#1D2939]">
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="flex h-full w-full flex-col bg-white dark:bg-[#101828] transition-colors duration-300">
            <div className="border-b border-gray-200 dark:border-[#1D2939] px-6 py-4">
                <p className="font-mono text-[11.5px] text-indigo-600 dark:text-[#465FFF]">{proyecto.codigo}</p>
                <h1 className="text-[20px] font-bold text-gray-900 dark:text-[#F9FAFB]">{proyecto.nombre}</h1>
                <p className="mt-0.5 text-[12.5px] text-gray-500 dark:text-gray-400">
                    Arrastra una tarea a otra columna para cambiarla de fase. Se sincroniza automáticamente cada 5 segundos.
                </p>
            </div>

            <div className="flex-1 overflow-hidden">
                <TableroFases idProyecto={idProyecto} />
            </div>
        </div>
    );
}

export default TableroProyecto;