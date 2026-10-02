import { useCallback, useEffect, useRef, useState } from "react";
import type { FaseViewModel } from "../Types/Fase";
import type { TareaViewModel } from "../Types/Tarea";

const URL_BASE = "https://localhost:7045/api";
const INTERVALO_ACTUALIZACION_MS = 5000;

const EstiloBadgePrioridad: Record<string, string> = {
    Crítico: "bg-red-50 text-red-700 dark:bg-[#382430] dark:text-[#F04438]",
    Alto: "bg-orange-50 text-orange-700 dark:bg-[#382430] dark:text-[#F04438]",
    Medio: "bg-amber-50 text-amber-700 dark:bg-[#1D2939] dark:text-gray-300",
    Bajo: "bg-gray-100 text-gray-600 dark:bg-[#1D2939] dark:text-gray-400",
};

interface PropiedadesTableroFases {
    idProyecto: number;
}

export function TableroFases({ idProyecto }: PropiedadesTableroFases) {

    const [fases, setFases] = useState<FaseViewModel[]>([]);
    const [tareas, setTareas] = useState<TareaViewModel[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [idTareaArrastrando, setIdTareaArrastrando] = useState<number | null>(null);
    const [idFaseSobrevolada, setIdFaseSobrevolada] = useState<number | null>(null);

    const cargarDatos = useCallback(async (mostrarCarga: boolean) => {
        if (mostrarCarga) setCargando(true);
        try {
            const [respFases, respTareas] = await Promise.all([
                fetch(`${URL_BASE}/Fase/proyecto/${idProyecto}`),
                fetch(`${URL_BASE}/Tarea/proyecto/${idProyecto}`),
            ]);
            if (!respFases.ok || !respTareas.ok) throw new Error("Alguno de los recursos no respondió correctamente.");
            const datosFases: FaseViewModel[] = await respFases.json();
            const datosTareas: TareaViewModel[] = await respTareas.json();
            setFases([...datosFases].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)));
            setTareas(datosTareas);
            setError("");
        } catch {
            if (mostrarCarga) setError("No fue posible cargar el tablero. Verifica que la API esté corriendo.");
        } finally {
            if (mostrarCarga) setCargando(false);
        }
    }, [idProyecto]);

    // Carga inicial
    useEffect(() => {
        cargarDatos(true);
    }, [cargarDatos]);

    // "Tiempo real" aproximado: como el backend no tiene SignalR/WebSockets,
    // refrescamos por polling cada 5s en silencio (sin mostrar el loader).
    const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);
    useEffect(() => {
        intervaloRef.current = setInterval(() => cargarDatos(false), INTERVALO_ACTUALIZACION_MS);
        return () => {
            if (intervaloRef.current) clearInterval(intervaloRef.current);
        };
    }, [cargarDatos]);

    async function moverTareaAFase(tarea: TareaViewModel, idFaseDestino: number) {
        if (tarea.idFase === idFaseDestino) return;

        const tareaAnterior = tarea;
        // Actualización optimista: se ve el cambio de inmediato en el tablero.
        setTareas((actuales) => actuales.map((t) => (t.id === tarea.id ? { ...t, idFase: idFaseDestino } : t)));

        try {
            const respuesta = await fetch(`${URL_BASE}/Tarea/${tarea.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...tarea, idFase: idFaseDestino }),
            });
            if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`);
            cargarDatos(false);
        } catch {
            // Si falla, regresamos la tarjeta a su columna original.
            setTareas((actuales) => actuales.map((t) => (t.id === tarea.id ? tareaAnterior : t)));
            setError("No fue posible mover la tarea. Intenta de nuevo.");
        }
    }

    if (cargando) {
        return <div className="p-8 text-center text-[13px] text-gray-500 dark:text-gray-400">Cargando tablero…</div>;
    }

    if (error && fases.length === 0) {
        return (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
                <p className="text-[13px] text-red-600 dark:text-[#F04438]">{error}</p>
                <button onClick={() => cargarDatos(true)} className="rounded-lg border border-gray-200 dark:border-[#1D2939] px-3 py-1.5 text-[12.5px] hover:bg-gray-50 dark:hover:bg-[#1D2939]">
                    Reintentar
                </button>
            </div>
        );
    }

    if (fases.length === 0) {
        return <div className="p-8 text-center text-[13px] text-gray-500 dark:text-gray-400">Este proyecto todavía no tiene fases registradas.</div>;
    }

    return (
        <div className="flex h-full flex-col gap-3 p-6">
            {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 dark:border-[#382430] dark:bg-[#382430] px-3 py-2 text-[12px] text-red-700 dark:text-[#F04438]">
                    {error}
                </p>
            )}

            <div className="flex flex-1 gap-4 overflow-x-auto">
                {fases.map((fase) => {
                    const tareasDeLaFase = tareas.filter((t) => t.idFase === fase.id);
                    const sobrevolada = idFaseSobrevolada === fase.id;

                    return (
                        <div
                            key={fase.id}
                            onDragOver={(e) => { e.preventDefault(); setIdFaseSobrevolada(fase.id); }}
                            onDragLeave={() => setIdFaseSobrevolada((actual) => (actual === fase.id ? null : actual))}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIdFaseSobrevolada(null);
                                const tarea = tareas.find((t) => t.id === idTareaArrastrando);
                                if (tarea) moverTareaAFase(tarea, fase.id);
                                setIdTareaArrastrando(null);
                            }}
                            className={`flex w-[280px] shrink-0 flex-col rounded-xl border bg-gray-50 dark:bg-[#171F2F] transition-colors duration-150 ${
                                sobrevolada
                                    ? "border-indigo-400 dark:border-[#465FFF]"
                                    : "border-gray-200 dark:border-[#1D2939]"
                            }`}
                        >
                            <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#1D2939] px-3 py-2.5">
                                <div className="flex flex-col">
                                    <span className="text-[13px] font-semibold text-gray-900 dark:text-[#F9FAFB]">{fase.nombre}</span>
                                    <span className="font-mono text-[10.5px] text-gray-500 dark:text-gray-400">{fase.porcentajeAvance ?? 0}% avance</span>
                                </div>
                                <span className="rounded-full bg-gray-200 dark:bg-[#1D2939] px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:text-gray-300">
                                    {tareasDeLaFase.length}
                                </span>
                            </div>

                            <div className="flex flex-1 flex-col gap-2 p-2.5">
                                {tareasDeLaFase.length === 0 && (
                                    <p className="p-2 text-center text-[11.5px] text-gray-400 dark:text-gray-500">Suelta una tarea aquí</p>
                                )}

                                {tareasDeLaFase.map((tarea) => (
                                    <div
                                        key={tarea.id}
                                        draggable
                                        onDragStart={() => setIdTareaArrastrando(tarea.id)}
                                        onDragEnd={() => setIdTareaArrastrando(null)}
                                        className={`cursor-grab rounded-lg border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#101828] p-2.5 shadow-sm active:cursor-grabbing ${
                                            idTareaArrastrando === tarea.id ? "opacity-40" : ""
                                        }`}
                                    >
                                        <p className="text-[12.5px] font-medium text-gray-900 dark:text-[#F9FAFB]">{tarea.descripcion}</p>
                                        <div className="mt-2 flex items-center justify-between">
                                            {tarea.prioridad && (
                                                <span className={`rounded px-1.5 py-0.5 text-[10.5px] font-medium ${EstiloBadgePrioridad[tarea.prioridad] ?? "bg-gray-100 text-gray-600 dark:bg-[#1D2939] dark:text-gray-300"}`}>
                                                    {tarea.prioridad}
                                                </span>
                                            )}
                                            <span className="text-[10.5px] text-gray-500 dark:text-gray-400">{tarea.nombreResponsable ?? "Sin asignar"}</span>
                                        </div>
                                        <div className="mt-2 h-1 w-full rounded-full bg-gray-100 dark:bg-[#1D2939]">
                                            <div
                                                className="h-1 rounded-full bg-indigo-600 dark:bg-[#465FFF]"
                                                style={{ width: `${tarea.porcentajeAvance ?? 0}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default TableroFases;