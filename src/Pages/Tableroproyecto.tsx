import { useEffect, useState } from "react";
import type { ProyectoViewModel } from "../Types/Proyecto";
import { TableroFases } from "./Tablerofases";
import { apiObtenerProyectos, apiObtenerProyecto } from "../api";
import { ArrowLeft, FolderKanban } from "lucide-react";

interface PropiedadesTableroProyecto {
    idProyecto?: number;
    alVolver?: () => void;
    alCambiarProyecto?: (id: number) => void;
}

export function TableroProyecto({ idProyecto, alVolver, alCambiarProyecto }: PropiedadesTableroProyecto) {
    const [proyectos, setProyectos] = useState<ProyectoViewModel[]>([]);
    const [proyectoActualId, setProyectoActualId] = useState<number | undefined>(idProyecto);
    const [proyecto, setProyecto] = useState<ProyectoViewModel | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    // Cargar lista de proyectos si no se especificó uno, o para el selector rápido
    useEffect(() => {
        async function cargarListaProyectos() {
            try {
                const lista = await apiObtenerProyectos();
                setProyectos(lista);
                if (!proyectoActualId && lista.length > 0) {
                    setProyectoActualId(lista[0].id);
                }
            } catch {
                // error silencioso al listar proyectos
            }
        }
        cargarListaProyectos();
    }, [proyectoActualId]);

    // Sincronizar idProyecto prop con estado local
    useEffect(() => {
        if (idProyecto) {
            setProyectoActualId(idProyecto);
        }
    }, [idProyecto]);

    // Cargar el proyecto seleccionado
    useEffect(() => {
        if (!proyectoActualId) {
            setCargando(false);
            return;
        }

        async function cargarDetalleProyecto() {
            setCargando(true);
            setError("");
            try {
                const datos = await apiObtenerProyecto(proyectoActualId!);
                setProyecto(datos);
            } catch {
                setError("No fue posible cargar el proyecto. Verifica que la API esté corriendo.");
            } finally {
                setCargando(false);
            }
        }

        cargarDetalleProyecto();
    }, [proyectoActualId]);

    const manejarCambioDeProyecto = (nuevoId: number) => {
        setProyectoActualId(nuevoId);
        if (alCambiarProyecto) {
            alCambiarProyecto(nuevoId);
        }
    };

    if (cargando) {
        return (
            <div className="flex h-full w-full items-center justify-center p-8 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent dark:border-[#465FFF]" />
                    <span>Cargando proyecto...</span>
                </div>
            </div>
        );
    }

    if (error || !proyecto) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center bg-white dark:bg-[#101828]">
                <FolderKanban size={48} className="text-gray-400" />
                <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-[#F9FAFB]">
                        {error || "No se ha seleccionado ningún proyecto"}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm">
                        Selecciona un proyecto de la lista o crea uno nuevo para empezar a usar el tablero tipo Trello.
                    </p>
                </div>
                {alVolver && (
                    <button
                        onClick={alVolver}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                    >
                        <ArrowLeft size={14} />
                        <span>Volver a la lista de proyectos</span>
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="flex h-full w-full flex-col bg-white dark:bg-[#101828] transition-colors duration-300 overflow-hidden">
            {/* Cabecera del proyecto con selector */}
            <div className="border-b border-gray-200 dark:border-[#1D2939] px-6 py-4 flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#131D30] shrink-0">
                <div className="flex items-center gap-4">
                    {alVolver && (
                        <button
                            onClick={alVolver}
                            title="Volver a proyectos"
                            className="p-2 rounded-lg border border-gray-200 dark:border-[#1D2939] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1E2B45] transition cursor-pointer"
                        >
                            <ArrowLeft size={16} />
                        </button>
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-[#465FFF] border border-indigo-200 dark:border-indigo-900/50">
                                {proyecto.codigo}
                            </span>
                            <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-[#F9FAFB]">
                                {proyecto.nombre}
                            </h1>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Tablero Kanban tipo Trello · Arrastra tarjetas entre fases o añade nuevas tareas.
                        </p>
                    </div>
                </div>

                {/* Selector rápido de proyectos */}
                {proyectos.length > 1 && (
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Cambiar proyecto:</span>
                        <select
                            value={proyectoActualId}
                            onChange={(e) => manejarCambioDeProyecto(Number(e.target.value))}
                            className="rounded-lg border border-gray-200 dark:border-[#1D2939] bg-gray-50 dark:bg-[#172236] px-3 py-1.5 text-xs text-gray-800 dark:text-[#F9FAFB] font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            {proyectos.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.codigo} - {p.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Tablero Kanban */}
            <div className="flex-1 overflow-hidden">
                <TableroFases idProyecto={proyecto.id} nombreProyecto={proyecto.nombre} />
            </div>
        </div>
    );
}

export default TableroProyecto;