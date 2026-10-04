import React, { useCallback, useEffect, useRef, useState } from "react";
import type { FaseViewModel } from "../Types/Fase";
import type { TareaViewModel } from "../Types/Tarea";
import type { UsuarioViewModel } from "../Types/Usuario";
import { 
    apiObtenerFasesPorProyecto, 
    apiObtenerTareasPorProyecto, 
    apiCrearTarea, 
    apiActualizarTarea, 
    apiEliminarTarea,
    apiCrearFase,
    apiObtenerUsuarios,
    apiActualizarProyecto 
} from "../api";
import { 
    Plus, 
    Trash2, 
    Clock, 
    Search, 
    SlidersHorizontal, 
    CheckCircle, 
    AlertCircle, 
    X, 
    Edit3,
    ArrowRight,
    User,
    UserCheck,
    Users
} from "lucide-react";

const INTERVALO_ACTUALIZACION_MS = 6000;

const EstiloBadgePrioridad: Record<string, { bg: string; text: string }> = {
    Crítico: { bg: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20", text: "text-red-600" },
    Alto: { bg: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20", text: "text-orange-600" },
    Medio: { bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", text: "text-amber-600" },
    Bajo: { bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", text: "text-emerald-600" },
};

interface PropiedadesTableroFases {
    idProyecto: number;
    nombreProyecto?: string;
}

export function TableroFases({ idProyecto, nombreProyecto = "Proyecto" }: PropiedadesTableroFases) {
    const [fases, setFases] = useState<FaseViewModel[]>([]);
    const [tareas, setTareas] = useState<TareaViewModel[]>([]);
    const [usuarios, setUsuarios] = useState<UsuarioViewModel[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [idTareaArrastrando, setIdTareaArrastrando] = useState<number | null>(null);
    const [idFaseSobrevolada, setIdFaseSobrevolada] = useState<number | null>(null);

    // Búsqueda y Filtros
    const [busqueda, setBusqueda] = useState("");
    const [filtroPrioridad, setFiltroPrioridad] = useState("Todos");
    const [filtroResponsable, setFiltroResponsable] = useState<string>("Todos");

    // Estado para nueva tarea por columna
    const [faseParaNuevaTarea, setFaseParaNuevaTarea] = useState<number | null>(null);
    const [nuevaDescripcion, setNuevaDescripcion] = useState("");
    const [nuevaPrioridad, setNuevaPrioridad] = useState("Medio");
    const [nuevasHoras, setNuevasHoras] = useState<number | "">("");
    const [nuevoResponsableId, setNuevoResponsableId] = useState<number | "">("");
    const [guardandoTarea, setGuardandoTarea] = useState(false);

    // Estado para nueva fase / columna
    const [mostrandoNuevaFase, setMostrandoNuevaFase] = useState(false);
    const [nuevoNombreFase, setNuevoNombreFase] = useState("");
    const [guardandoFase, setGuardandoFase] = useState(false);

    // Modal de edición / detalle de tarea
    const [tareaSeleccionada, setTareaSeleccionada] = useState<TareaViewModel | null>(null);
    const [editandoDescripcion, setEditandoDescripcion] = useState("");
    const [editandoPrioridad, setEditandoPrioridad] = useState("Medio");
    const [editandoAvance, setEditandoAvance] = useState<number>(0);
    const [editandoFaseId, setEditandoFaseId] = useState<number>(0);
    const [editandoResponsableId, setEditandoResponsableId] = useState<number | "">("");
    const [guardandoEdicion, setGuardandoEdicion] = useState(false);

    const cargarDatos = useCallback(async (mostrarCarga: boolean) => {
        if (mostrarCarga) setCargando(true);
        try {
            const [datosFases, datosTareas, datosUsuarios] = await Promise.all([
                apiObtenerFasesPorProyecto(idProyecto),
                apiObtenerTareasPorProyecto(idProyecto),
                apiObtenerUsuarios().catch(() => []),
            ]);
            setFases([...datosFases].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)));
            setTareas(datosTareas);
            setUsuarios(datosUsuarios);
            setError("");
        } catch {
            if (mostrarCarga) setError("No fue posible cargar el tablero. Verifica la conexión con la API.");
        } finally {
            if (mostrarCarga) setCargando(false);
        }
    }, [idProyecto]);

    // Carga inicial
    useEffect(() => {
        cargarDatos(true);
    }, [cargarDatos]);

    // Polling en segundo plano
    const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);
    useEffect(() => {
        intervaloRef.current = setInterval(() => cargarDatos(false), INTERVALO_ACTUALIZACION_MS);
        return () => {
            if (intervaloRef.current) clearInterval(intervaloRef.current);
        };
    }, [cargarDatos]);

    // Sincroniza el progreso del proyecto en base al promedio de tareas
    const sincronizarProgreso = async (listaTareas: TareaViewModel[]) => {
        if (listaTareas.length === 0) return;
        const suma = listaTareas.reduce((acc, t) => acc + (t.porcentajeAvance ?? 0), 0);
        const porcentaje = Math.round(suma / listaTareas.length);
        try {
            await apiActualizarProyecto(idProyecto, { porcentajeAvance: porcentaje });
        } catch {
            // Silencioso si la API no requiere actualización inmediata
        }
    };

    // Mover tarea entre fases mediante Drag and Drop con ajuste automático de progreso
    async function moverTareaAFase(tarea: TareaViewModel, idFaseDestino: number) {
        if (tarea.idFase === idFaseDestino) return;

        const faseDestino = fases.find(f => f.id === idFaseDestino);
        const esFaseFinal = faseDestino && /final|complet|listo|hech|termin/i.test(faseDestino.nombre);
        const esFaseInicial = faseDestino && /inici|pendient|hacer|backlog/i.test(faseDestino.nombre);

        let nuevoAvance = tarea.porcentajeAvance ?? 0;
        if (esFaseFinal) {
            nuevoAvance = 100;
        } else if (esFaseInicial && nuevoAvance === 100) {
            nuevoAvance = 0;
        }

        const tareaActualizada: TareaViewModel = {
            ...tarea,
            idFase: idFaseDestino,
            porcentajeAvance: nuevoAvance,
            estado: nuevoAvance === 100 ? "Completada" : nuevoAvance > 0 ? "En Progreso" : "Pendiente"
        };

        const nuevasTareas = tareas.map((t) => (t.id === tarea.id ? tareaActualizada : t));
        setTareas(nuevasTareas);

        try {
            await apiActualizarTarea(tarea.id, tareaActualizada);
            await sincronizarProgreso(nuevasTareas);
            cargarDatos(false);
        } catch {
            setTareas(tareas);
            setError("No fue posible mover la tarea. Intenta de nuevo.");
        }
    }

    // Crear nueva tarea con responsable asignado y actualizar métricas de progreso
    async function manejarCrearTarea(idFase: number) {
        if (!nuevaDescripcion.trim()) return;
        setGuardandoTarea(true);
        try {
            const nueva = await apiCrearTarea({
                idFase,
                idProyecto,
                descripcion: nuevaDescripcion.trim(),
                prioridad: nuevaPrioridad,
                horasEstimadas: nuevasHoras === "" ? undefined : Number(nuevasHoras),
                idResponsable: nuevoResponsableId === "" ? null : Number(nuevoResponsableId),
                orden: tareas.filter(t => t.idFase === idFase).length + 1,
                porcentajeAvance: 0,
            });
            setNuevaDescripcion("");
            setNuevasHoras("");
            setNuevoResponsableId("");
            setFaseParaNuevaTarea(null);
            const tareasConNueva = [...tareas, nueva];
            await sincronizarProgreso(tareasConNueva);
            await cargarDatos(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al crear la tarea.");
        } finally {
            setGuardandoTarea(false);
        }
    }

    // Crear nueva fase
    async function manejarCrearFase() {
        if (!nuevoNombreFase.trim()) return;
        setGuardandoFase(true);
        try {
            await apiCrearFase({
                idProyecto,
                nombre: nuevoNombreFase.trim(),
                orden: fases.length + 1,
            });
            setNuevoNombreFase("");
            setMostrandoNuevaFase(false);
            await cargarDatos(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al crear la columna.");
        } finally {
            setGuardandoFase(false);
        }
    }

    // Abrir modal de detalle/edición
    function abrirModalDetalle(tarea: TareaViewModel) {
        setTareaSeleccionada(tarea);
        setEditandoDescripcion(tarea.descripcion);
        setEditandoPrioridad(tarea.prioridad || "Medio");
        setEditandoAvance(tarea.porcentajeAvance ?? 0);
        setEditandoFaseId(tarea.idFase);
        setEditandoResponsableId(tarea.idResponsable ?? "");
    }

    // Guardar cambios de edición de tarea (incluyendo asignación de responsable)
    async function guardarEdicionTarea() {
        if (!tareaSeleccionada || !editandoDescripcion.trim()) return;
        setGuardandoEdicion(true);
        try {
            const respId = editandoResponsableId === "" ? null : Number(editandoResponsableId);
            const usuarioAsignado = usuarios.find(u => u.id === respId);

            await apiActualizarTarea(tareaSeleccionada.id, {
                ...tareaSeleccionada,
                descripcion: editandoDescripcion.trim(),
                prioridad: editandoPrioridad,
                porcentajeAvance: editandoAvance,
                idFase: editandoFaseId,
                idResponsable: respId,
                nombreResponsable: usuarioAsignado ? `${usuarioAsignado.nombres} ${usuarioAsignado.apellidos}` : null,
            });
            setTareaSeleccionada(null);
            await cargarDatos(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al actualizar la tarea.");
        } finally {
            setGuardandoEdicion(false);
        }
    }

    // Eliminar tarea
    async function manejarEliminarTarea(id: number) {
        if (!window.confirm("¿Seguro que deseas eliminar esta tarea?")) return;
        try {
            await apiEliminarTarea(id);
            setTareaSeleccionada(null);
            await cargarDatos(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al eliminar la tarea.");
        }
    }

    // Helper para obtener iniciales del responsable
    const obtenerIniciales = (tarea: TareaViewModel) => {
        if (tarea.idResponsable) {
            const u = usuarios.find(usr => usr.id === tarea.idResponsable);
            if (u) {
                return `${u.nombres.charAt(0)}${u.apellidos.charAt(0)}`.toUpperCase();
            }
        }
        if (tarea.nombreResponsable) {
            const partes = tarea.nombreResponsable.trim().split(" ");
            return partes.length >= 2
                ? `${partes[0].charAt(0)}${partes[1].charAt(0)}`.toUpperCase()
                : partes[0].slice(0, 2).toUpperCase();
        }
        return "U";
    };

    // Filtrar tareas por búsqueda, prioridad y responsable
    const tareasFiltradas = tareas.filter((t) => {
        const coincideTexto = t.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
            (t.nombreResponsable && t.nombreResponsable.toLowerCase().includes(busqueda.toLowerCase()));
        
        const coincidePrioridad = filtroPrioridad === "Todos" || t.prioridad === filtroPrioridad;
        
        let coincideResponsable = true;
        if (filtroResponsable === "SinAsignar") {
            coincideResponsable = !t.idResponsable && !t.nombreResponsable;
        } else if (filtroResponsable !== "Todos") {
            coincideResponsable = t.idResponsable === Number(filtroResponsable);
        }

        return coincideTexto && coincidePrioridad && coincideResponsable;
    });

    const totalTareas = tareas.length;
    const tareasCompletadas = tareas.filter(t => (t.porcentajeAvance ?? 0) >= 100).length;
    const porcentajeGlobal = totalTareas > 0 ? Math.round((tareasCompletadas / totalTareas) * 100) : 0;

    if (cargando) {
        return (
            <div className="flex h-full w-full items-center justify-center p-8 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent dark:border-[#465FFF]" />
                    <span>Cargando tablero tipo Trello…</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#F8FAFC] dark:bg-[#0B111E] select-none transition-colors duration-200">
            {/* Barra superior de herramientas y filtros */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#111C2E] px-6 py-3.5 shadow-2xs shrink-0">
                <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                    {/* Búsqueda */}
                    <div className="relative w-48 sm:w-60">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar tareas o responsables..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full pl-9 pr-7 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-[#1D2939] bg-gray-50 dark:bg-[#172236] text-gray-900 dark:text-[#F9FAFB] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {busqueda && (
                            <button onClick={() => setBusqueda("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X size={13} />
                            </button>
                        )}
                    </div>

                    {/* Filtro por Prioridad */}
                    <div className="flex items-center gap-1 text-xs">
                        <SlidersHorizontal size={13} className="text-gray-400 ml-1" />
                        {["Todos", "Crítico", "Alto", "Medio", "Bajo"].map((p) => (
                            <button
                                key={p}
                                onClick={() => setFiltroPrioridad(p)}
                                className={`px-2 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                                    filtroPrioridad === p
                                        ? "bg-indigo-600 text-white dark:bg-[#465FFF]"
                                        : "bg-gray-100 dark:bg-[#1A263D] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#233352]"
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    {/* Filtro por Responsable Asignado */}
                    <div className="flex items-center gap-1.5">
                        <Users size={14} className="text-gray-400" />
                        <select
                            value={filtroResponsable}
                            onChange={(e) => setFiltroResponsable(e.target.value)}
                            className="rounded-lg border border-gray-200 dark:border-[#1D2939] bg-gray-50 dark:bg-[#1A263D] px-2.5 py-1 text-xs text-gray-700 dark:text-gray-200 focus:outline-none font-medium cursor-pointer"
                        >
                            <option value="Todos">Todos los responsables</option>
                            <option value="SinAsignar">👤 Sin asignar</option>
                            {usuarios.map((u) => (
                                <option key={u.id} value={String(u.id)}>
                                    👤 {u.nombres} {u.apellidos}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Métricas rápidas */}
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-gray-400 font-medium">Progreso:</span>
                        <div className="w-24 h-2 rounded-full bg-gray-200 dark:bg-[#1D2939] overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 transition-all duration-300"
                                style={{ width: `${porcentajeGlobal}%` }}
                            />
                        </div>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{porcentajeGlobal}%</span>
                    </div>

                    <div className="h-4 w-px bg-gray-200 dark:bg-[#1D2939]" />

                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                        <CheckCircle size={15} className="text-indigo-500 dark:text-[#465FFF]" />
                        <span>{tareasCompletadas}/{totalTareas} tareas completadas</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mx-6 mt-3 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                    <button onClick={() => setError("")} className="hover:opacity-75">
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Contenedor de Columnas Estilo Trello */}
            <div className="flex flex-1 gap-5 overflow-x-auto p-6 items-start">
                {fases.map((fase) => {
                    const tareasDeLaFase = tareasFiltradas.filter((t) => t.idFase === fase.id);
                    const agregandoEnEstaFase = faseParaNuevaTarea === fase.id;
                    const sobrevolada = idFaseSobrevolada === fase.id;

                    return (
                        <div
                            key={fase.id}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIdFaseSobrevolada(fase.id);
                            }}
                            onDragLeave={() => setIdFaseSobrevolada((actual) => (actual === fase.id ? null : actual))}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIdFaseSobrevolada(null);
                                const tarea = tareas.find((t) => t.id === idTareaArrastrando);
                                if (tarea) moverTareaAFase(tarea, fase.id);
                                setIdTareaArrastrando(null);
                            }}
                            className={`flex w-72 shrink-0 flex-col rounded-xl border bg-white dark:bg-[#131D30] shadow-sm transition-all duration-200 max-h-[calc(100vh-160px)] ${
                                sobrevolada
                                    ? "border-indigo-500 ring-2 ring-indigo-500/20 dark:border-[#465FFF] bg-indigo-50/10 dark:bg-[#465FFF]/5"
                                    : "border-gray-200 dark:border-[#1D2939]"
                            }`}
                        >
                            {/* Encabezado de Columna */}
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#1D2939] px-4 py-3 shrink-0">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <h3 className="font-semibold text-sm text-gray-900 dark:text-[#F9FAFB] truncate">
                                        {fase.nombre}
                                    </h3>
                                    <span className="rounded-full bg-gray-100 dark:bg-[#1E2B45] px-2 py-0.5 text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                                        {tareasDeLaFase.length}
                                    </span>
                                </div>

                                <button
                                    onClick={() => setFaseParaNuevaTarea(agregandoEnEstaFase ? null : fase.id)}
                                    title="Añadir tarea a esta fase"
                                    className="p-1 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-[#1E2B45] dark:hover:text-[#465FFF] transition"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>

                            {/* Lista de Tarjetas (Scrollable) */}
                            <div className="flex flex-1 flex-col gap-2.5 p-3 overflow-y-auto min-h-[80px]">
                                {tareasDeLaFase.length === 0 && !agregandoEnEstaFase && (
                                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 dark:border-[#1D2939] rounded-lg text-center text-xs text-gray-400 dark:text-gray-500">
                                        <span>Arrastra tareas aquí o añade una nueva</span>
                                    </div>
                                )}

                                {tareasDeLaFase.map((tarea) => {
                                    const badgePrioridad = EstiloBadgePrioridad[tarea.prioridad || "Medio"] || EstiloBadgePrioridad["Medio"];
                                    const completada = (tarea.porcentajeAvance ?? 0) >= 100;

                                    return (
                                        <div
                                            key={tarea.id}
                                            draggable
                                            onDragStart={() => setIdTareaArrastrando(tarea.id)}
                                            onDragEnd={() => setIdTareaArrastrando(null)}
                                            onClick={() => abrirModalDetalle(tarea)}
                                            className={`group relative cursor-grab rounded-lg border bg-white dark:bg-[#172236] p-3.5 shadow-xs transition duration-150 hover:shadow-md hover:border-indigo-300 dark:hover:border-[#465FFF]/50 active:cursor-grabbing ${
                                                idTareaArrastrando === tarea.id ? "opacity-30 border-dashed" : "border-gray-200 dark:border-[#1E2B45]"
                                            }`}
                                        >
                                            {/* Prioridad y estado */}
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold ${badgePrioridad.bg}`}>
                                                    {tarea.prioridad || "Normal"}
                                                </span>
                                                {completada && (
                                                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                        <CheckCircle size={12} /> Hecho
                                                    </span>
                                                )}
                                            </div>

                                            {/* Título / Descripción */}
                                            <p className="text-xs font-medium text-gray-800 dark:text-[#E2E8F0] line-clamp-3 leading-relaxed mb-3">
                                                {tarea.descripcion}
                                            </p>

                                            {/* Barra de progreso de la tarea */}
                                            <div className="mb-2.5">
                                                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                                    <span>Avance</span>
                                                    <span className="font-mono">{tarea.porcentajeAvance ?? 0}%</span>
                                                </div>
                                                <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-[#101828] overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${
                                                            completada ? "bg-emerald-500" : "bg-indigo-600 dark:bg-[#465FFF]"
                                                        }`}
                                                        style={{ width: `${tarea.porcentajeAvance ?? 0}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Footer de la tarjeta: Responsable Asignado y Horas */}
                                            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-[#1E2B45] text-[11px] text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center gap-1.5 truncate max-w-[140px]">
                                                    {tarea.idResponsable || tarea.nombreResponsable ? (
                                                        <>
                                                            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-[9px] shadow-xs shrink-0">
                                                                {obtenerIniciales(tarea)}
                                                            </div>
                                                            <span className="font-medium text-gray-700 dark:text-gray-300 truncate" title={tarea.nombreResponsable || undefined}>
                                                                {(() => {
                                                                    const u = usuarios.find(usr => usr.id === tarea.idResponsable);
                                                                    return u ? `${u.nombres.split(" ")[0]} ${u.apellidos.charAt(0)}.` : (tarea.nombreResponsable?.split(" ")[0] || "Asignado");
                                                                })()}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-gray-400 hover:text-indigo-600 dark:hover:text-[#465FFF] transition">
                                                            <User size={12} />
                                                            <span>Sin asignar</span>
                                                        </span>
                                                    )}
                                                </div>

                                                {tarea.horasEstimadas ? (
                                                    <div className="flex items-center gap-1 font-mono text-[10.5px]">
                                                        <Clock size={11} />
                                                        <span>{tarea.horasEstimadas}h</span>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Formulario inline para añadir tarea con asignación */}
                                {agregandoEnEstaFase && (
                                    <div className="rounded-lg border border-indigo-200 dark:border-[#465FFF]/40 bg-indigo-50/40 dark:bg-[#172236] p-3 space-y-2.5">
                                        <textarea
                                            placeholder="Escribe el nombre o descripción de la tarea..."
                                            value={nuevaDescripcion}
                                            onChange={(e) => setNuevaDescripcion(e.target.value)}
                                            autoFocus
                                            rows={2}
                                            className="w-full rounded-md border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#0D1523] p-2 text-xs text-gray-900 dark:text-[#F9FAFB] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />

                                        {/* Selector de Responsable */}
                                        <div>
                                            <label className="block text-[10.5px] font-semibold text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-1">
                                                <User size={11} /> Asignar a miembro:
                                            </label>
                                            <select
                                                value={nuevoResponsableId}
                                                onChange={(e) => setNuevoResponsableId(e.target.value === "" ? "" : Number(e.target.value))}
                                                className="w-full rounded-md border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#0D1523] px-2 py-1 text-xs text-gray-800 dark:text-[#F9FAFB] focus:outline-none"
                                            >
                                                <option value="">👤 (Sin asignar - Vacante)</option>
                                                {usuarios.map((u) => (
                                                    <option key={u.id} value={u.id}>
                                                        {u.nombres} {u.apellidos} {u.cargo ? `— ${u.cargo}` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <select
                                                value={nuevaPrioridad}
                                                onChange={(e) => setNuevaPrioridad(e.target.value)}
                                                className="flex-1 rounded-md border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#0D1523] px-2 py-1.5 text-xs text-gray-800 dark:text-[#F9FAFB] focus:outline-none"
                                            >
                                                <option value="Bajo">Prioridad Baja</option>
                                                <option value="Medio">Prioridad Media</option>
                                                <option value="Alto">Prioridad Alta</option>
                                                <option value="Crítico">Prioridad Crítica</option>
                                            </select>

                                            <input
                                                type="number"
                                                placeholder="Horas (ej. 4)"
                                                value={nuevasHoras}
                                                onChange={(e) => setNuevasHoras(e.target.value === "" ? "" : Number(e.target.value))}
                                                className="w-20 rounded-md border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#0D1523] px-2 py-1.5 text-xs text-gray-800 dark:text-[#F9FAFB] focus:outline-none"
                                            />
                                        </div>

                                        <div className="flex items-center justify-end gap-2 pt-1">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFaseParaNuevaTarea(null);
                                                    setNuevaDescripcion("");
                                                    setNuevoResponsableId("");
                                                }}
                                                className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="button"
                                                disabled={guardandoTarea || !nuevaDescripcion.trim()}
                                                onClick={() => manejarCrearTarea(fase.id)}
                                                className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition"
                                            >
                                                {guardandoTarea ? "Añadiendo..." : "Añadir Tarea"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Botón inferior rápido para añadir tarea */}
                            {!agregandoEnEstaFase && (
                                <button
                                    onClick={() => setFaseParaNuevaTarea(fase.id)}
                                    className="flex items-center gap-1.5 border-t border-gray-100 dark:border-[#1D2939] px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1E2B45] hover:text-indigo-600 dark:hover:text-[#465FFF] transition text-left"
                                >
                                    <Plus size={14} />
                                    <span>Añadir tarea</span>
                                </button>
                            )}
                        </div>
                    );
                })}

                {/* Columna final: "+ Añadir Columna / Fase" */}
                <div className="w-72 shrink-0">
                    {mostrandoNuevaFase ? (
                        <div className="rounded-xl border border-indigo-200 dark:border-[#465FFF]/30 bg-white dark:bg-[#131D30] p-4 shadow-sm space-y-3">
                            <h4 className="text-xs font-semibold text-gray-800 dark:text-[#F9FAFB]">
                                Nueva Fase o Columna
                            </h4>
                            <input
                                type="text"
                                placeholder="Nombre de la fase (ej: Por Revisar)"
                                value={nuevoNombreFase}
                                onChange={(e) => setNuevoNombreFase(e.target.value)}
                                autoFocus
                                className="w-full rounded-lg border border-gray-200 dark:border-[#1D2939] bg-gray-50 dark:bg-[#0D1523] px-3 py-2 text-xs text-gray-900 dark:text-[#F9FAFB] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <div className="flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setMostrandoNuevaFase(false)}
                                    className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    disabled={guardandoFase || !nuevoNombreFase.trim()}
                                    onClick={manejarCrearFase}
                                    className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition"
                                >
                                    {guardandoFase ? "Guardando..." : "Crear Fase"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setMostrandoNuevaFase(true)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-[#1D2939] p-4 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-[#465FFF] hover:text-indigo-600 dark:hover:text-[#465FFF] transition duration-150 cursor-pointer bg-white/40 dark:bg-[#131D30]/40"
                        >
                            <Plus size={16} />
                            <span>Añadir otra fase / columna</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Modal de Detalle / Edición / Asignación de Tarea */}
            {tareaSeleccionada && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
                    <div className="w-full max-w-lg rounded-2xl border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#131D30] p-6 shadow-2xl transition-all">
                        {/* Header modal */}
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#1D2939]">
                            <div className="flex items-center gap-2 text-indigo-600 dark:text-[#465FFF]">
                                <Edit3 size={18} />
                                <h3 className="font-bold text-base text-gray-900 dark:text-[#F9FAFB]">
                                    Tarea #{tareaSeleccionada.id}
                                </h3>
                            </div>
                            <button
                                onClick={() => setTareaSeleccionada(null)}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-[#1E2B45] dark:hover:text-[#F9FAFB]"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Contenido modal */}
                        <div className="space-y-4 py-4 text-xs">
                            {/* Descripción */}
                            <div>
                                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Descripción / Título de la Tarea
                                </label>
                                <textarea
                                    rows={3}
                                    value={editandoDescripcion}
                                    onChange={(e) => setEditandoDescripcion(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 dark:border-[#1D2939] bg-gray-50 dark:bg-[#0D1523] p-2.5 text-xs text-gray-900 dark:text-[#F9FAFB] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>

                            {/* SECCIÓN CLAVE: Asignar Responsable a otros usuarios */}
                            <div className="rounded-xl border border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/30 dark:bg-[#10192A] p-3.5 space-y-2">
                                <label className="block font-semibold text-gray-800 dark:text-gray-200 text-xs flex items-center gap-1.5">
                                    <UserCheck size={15} className="text-indigo-600 dark:text-[#465FFF]" />
                                    <span>Asignar Responsable / Miembro del Equipo</span>
                                </label>
                                <select
                                    value={editandoResponsableId}
                                    onChange={(e) => setEditandoResponsableId(e.target.value === "" ? "" : Number(e.target.value))}
                                    className="w-full rounded-lg border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#0D1523] px-3 py-2 text-xs text-gray-900 dark:text-[#F9FAFB] focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                                >
                                    <option value="">👤 (Sin asignar - Cualquiera puede tomarla)</option>
                                    {usuarios.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            👤 {u.nombres} {u.apellidos} {u.cargo ? `— ${u.cargo}` : ''} ({u.email})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[10.5px] text-gray-400 dark:text-gray-500">
                                    Puedes asignar la tarea a cualquier usuario o investigador del sistema académico.
                                </p>
                            </div>

                            {/* Fila: Fase actual y Prioridad */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Fase / Columna
                                    </label>
                                    <select
                                        value={editandoFaseId}
                                        onChange={(e) => setEditandoFaseId(Number(e.target.value))}
                                        className="w-full rounded-lg border border-gray-200 dark:border-[#1D2939] bg-gray-50 dark:bg-[#0D1523] px-3 py-2 text-xs text-gray-900 dark:text-[#F9FAFB] focus:outline-none"
                                    >
                                        {fases.map((f) => (
                                            <option key={f.id} value={f.id}>
                                                {f.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Prioridad
                                    </label>
                                    <select
                                        value={editandoPrioridad}
                                        onChange={(e) => setEditandoPrioridad(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 dark:border-[#1D2939] bg-gray-50 dark:bg-[#0D1523] px-3 py-2 text-xs text-gray-900 dark:text-[#F9FAFB] focus:outline-none"
                                    >
                                        <option value="Bajo">Bajo</option>
                                        <option value="Medio">Medio</option>
                                        <option value="Alto">Alto</option>
                                        <option value="Crítico">Crítico</option>
                                    </select>
                                </div>
                            </div>

                            {/* Avance */}
                            <div>
                                <div className="flex justify-between mb-1.5 font-medium text-gray-700 dark:text-gray-300">
                                    <span>Porcentaje de Avance</span>
                                    <span className="font-mono text-indigo-600 dark:text-[#465FFF]">{editandoAvance}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={editandoAvance}
                                    onChange={(e) => setEditandoAvance(Number(e.target.value))}
                                    className="w-full accent-indigo-600 dark:accent-[#465FFF]"
                                />
                                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                    <button type="button" onClick={() => setEditandoAvance(0)} className="hover:underline">0% (Pendiente)</button>
                                    <button type="button" onClick={() => setEditandoAvance(50)} className="hover:underline">50% (En Proceso)</button>
                                    <button type="button" onClick={() => setEditandoAvance(100)} className="hover:underline text-emerald-600 font-semibold">100% (Completado)</button>
                                </div>
                            </div>

                            {/* Metadatos informativos */}
                            <div className="rounded-lg bg-gray-50 dark:bg-[#0D1523] p-3 space-y-1 text-[11px] text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-[#1D2939]">
                                <p><span className="font-semibold text-gray-700 dark:text-gray-300">Proyecto:</span> {nombreProyecto}</p>
                                {tareaSeleccionada.horasEstimadas && (
                                    <p><span className="font-semibold text-gray-700 dark:text-gray-300">Horas estimadas:</span> {tareaSeleccionada.horasEstimadas} horas</p>
                                )}
                            </div>
                        </div>

                        {/* Footer modal: acciones */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-[#1D2939]">
                            <button
                                type="button"
                                onClick={() => manejarEliminarTarea(tareaSeleccionada.id)}
                                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                            >
                                <Trash2 size={15} />
                                <span>Eliminar tarea</span>
                            </button>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setTareaSeleccionada(null)}
                                    className="rounded-lg px-3.5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#1E2B45] transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    disabled={guardandoEdicion || !editandoDescripcion.trim()}
                                    onClick={guardarEdicionTarea}
                                    className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 dark:bg-[#465FFF] dark:hover:bg-[#394DD1] transition disabled:opacity-50 cursor-pointer"
                                >
                                    {guardandoEdicion ? "Guardando..." : "Guardar Cambios"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TableroFases;