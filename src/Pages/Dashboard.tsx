import { useEffect, useState } from "react";
import type { ProyectoViewModel } from "../Types/Proyecto";
import type { TareaViewModel } from "../Types/Tarea";
import type { VerificacionViewModel } from "../Types/Verificacion";
import type { UsuarioViewModel } from "../Types/Usuario";
import { 
    apiObtenerProyectos, 
    apiObtenerTodasLasTareas, 
    apiObtenerVerificaciones, 
    apiObtenerUsuarios 
} from "../api";
import { 
    FolderKanban, 
    CheckCircle2, 
    Clock, 
    TrendingUp, 
    Coins, 
    AlertTriangle, 
    ArrowRight, 
    Plus, 
    Kanban, 
    ShieldCheck, 
    User, 
    RefreshCw,
    Layers,
    ListTodo
} from "lucide-react";

interface PropiedadesDashboard {
    idUsuario: number;
    alNavegar?: (ruta: string, idProyecto?: number) => void;
}

export function Dashboard({ idUsuario, alNavegar }: PropiedadesDashboard) {
    const [proyectos, setProyectos] = useState<ProyectoViewModel[]>([]);
    const [tareas, setTareas] = useState<TareaViewModel[]>([]);
    const [verificaciones, setVerificaciones] = useState<VerificacionViewModel[]>([]);
    const [usuarios, setUsuarios] = useState<UsuarioViewModel[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [tabTareas, setTabTareas] = useState<"todas" | "mis_tareas">("todas");
    const [ultimaActualizacion, setUltimaActualizacion] = useState<string>("");

    useEffect(() => {
        cargarDatos();
    }, [idUsuario]);

    async function cargarDatos() {
        setCargando(true);
        setError("");
        try {
            const [datosProyectos, datosTareas, datosVerifs, datosUsuarios] = await Promise.all([
                apiObtenerProyectos().catch(() => []),
                apiObtenerTodasLasTareas().catch(() => []),
                apiObtenerVerificaciones().catch(() => []),
                apiObtenerUsuarios().catch(() => []),
            ]);

            setProyectos(datosProyectos);
            setTareas(datosTareas);
            setVerificaciones(datosVerifs);
            setUsuarios(datosUsuarios);
            setUltimaActualizacion(new Date().toLocaleTimeString());
        } catch {
            setError("No fue posible cargar toda la información del panel.");
        } finally {
            setCargando(false);
        }
    }

    // Cálculos y Métricas
    const totalProyectos = proyectos.length;
    const proyectosActivos = proyectos.filter(p => !p.eliminadoEn).length;
    
    // Promedio de avance general del sistema
    const avancePromedio = totalProyectos > 0
        ? Math.round(proyectos.reduce((acc, p) => acc + (p.porcentajeAvance ?? 0), 0) / totalProyectos)
        : 0;

    // Presupuesto total
    const presupuestoTotal = proyectos.reduce((acc, p) => acc + (p.presupuestoTotal ?? 0), 0);

    // Métricas de tareas
    const totalTareas = tareas.length;
    const tareasCompletadas = tareas.filter(t => (t.porcentajeAvance ?? 0) >= 100 || t.estado === "Completada").length;
    const tareasEnProgreso = tareas.filter(t => (t.porcentajeAvance ?? 0) > 0 && (t.porcentajeAvance ?? 0) < 100).length;
    const tareasPendientes = totalTareas - tareasCompletadas - tareasEnProgreso;
    const totalHorasEstimadas = tareas.reduce((acc, t) => acc + (t.horasEstimadas ?? 0), 0);

    // Tareas del usuario activo
    const misTareas = tareas.filter(t => t.idResponsable === idUsuario);

    // Métricas de verificaciones
    const verifPendientes = verificaciones.filter(v => v.resultado === "Pendiente" || !v.resultado).length;
    const verifAprobadas = verificaciones.filter(v => v.resultado === "Aprobado").length;

    // Formateador de moneda COP
    const formatoMoneda = (val: number) => {
        return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val);
    };

    const tareasAMostrar = tabTareas === "mis_tareas" ? misTareas : tareas;

    if (cargando) {
        return (
            <div className="flex h-full w-full items-center justify-center p-12 text-gray-500 dark:text-gray-400">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-9 w-9 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent dark:border-[#465FFF]" />
                    <span className="text-sm font-medium">Cargando Panel de Control Académico…</span>
                </div>
            </div>
        );
    }

    if (error && proyectos.length === 0) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                    <AlertTriangle size={24} />
                </div>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                <button
                    onClick={cargarDatos}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
                >
                    <RefreshCw size={14} /> Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-gray-50/50 dark:bg-[#0B111E] p-6 lg:p-10 transition-colors space-y-8">
            
            {/* Cabecera del Dashboard */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Panel de Control Ejecutivo
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Visión global de proyectos de investigación, avance de tareas, presupuesto y revisiones.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    {ultimaActualizacion && (
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 hidden md:inline">
                            Sincronizado: {ultimaActualizacion}
                        </span>
                    )}
                    <button
                        onClick={cargarDatos}
                        title="Actualizar datos"
                        className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111C2E] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                        <RefreshCw size={15} />
                    </button>
                    {alNavegar && (
                        <button
                            onClick={() => alNavegar("nuevoProyecto")}
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition"
                        >
                            <Plus size={15} />
                            Nuevo Proyecto
                        </button>
                    )}
                </div>
            </div>

            {/* Fila 1: Métricas Clave (KPIs) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* KPI 1: Proyectos */}
                <div 
                    onClick={() => alNavegar && alNavegar("proyectos")}
                    className="p-5 rounded-2xl bg-white dark:bg-[#111C2E] border border-gray-200/80 dark:border-gray-800/80 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500/50 transition cursor-pointer group"
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Proyectos Activos</span>
                        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            <FolderKanban size={18} />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{proyectosActivos}</span>
                        <span className="text-xs text-gray-400">en curso</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800/60">
                        <span>Avance global: <strong>{avancePromedio}%</strong></span>
                        <ArrowRight size={13} className="text-gray-400 group-hover:translate-x-1 group-hover:text-indigo-600 transition" />
                    </div>
                </div>

                {/* KPI 2: Avance Ponderado */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#111C2E] border border-gray-200/80 dark:border-gray-800/80 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Progreso del Sistema</span>
                        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                            <TrendingUp size={18} />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{avancePromedio}%</span>
                        <span className="text-xs text-gray-400">cumplimiento</span>
                    </div>
                    <div className="mt-3 w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                            style={{ width: `${avancePromedio}%` }} 
                        />
                    </div>
                </div>

                {/* KPI 3: Tareas Totales */}
                <div 
                    onClick={() => alNavegar && alNavegar("tablero")}
                    className="p-5 rounded-2xl bg-white dark:bg-[#111C2E] border border-gray-200/80 dark:border-gray-800/80 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500/50 transition cursor-pointer group"
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Tareas del Tablero</span>
                        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                            <Kanban size={18} />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{totalTareas}</span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{tareasCompletadas} listas</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800/60">
                        <span>{totalHorasEstimadas}h estimadas</span>
                        <ArrowRight size={13} className="text-gray-400 group-hover:translate-x-1 group-hover:text-indigo-600 transition" />
                    </div>
                </div>

                {/* KPI 4: Presupuesto Total */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#111C2E] border border-gray-200/80 dark:border-gray-800/80 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Presupuesto Asignado</span>
                        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                            <Coins size={18} />
                        </div>
                    </div>
                    <div className="truncate">
                        <span className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white" title={formatoMoneda(presupuestoTotal)}>
                            {formatoMoneda(presupuestoTotal)}
                        </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800/60">
                        <span>{verifPendientes} revisiones pendientes</span>
                        <ShieldCheck size={14} className="text-amber-500" />
                    </div>
                </div>
            </div>

            {/* Fila 2: Seguimiento de Proyectos en Curso */}
            <div className="rounded-2xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#111C2E] p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-gray-100 dark:border-gray-800/60">
                    <div>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Layers size={18} className="text-indigo-600 dark:text-[#465FFF]" />
                            Proyectos Académicos y Avance
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Listado en tiempo real con su líder, presupuesto y acceso directo al Kanban.
                        </p>
                    </div>
                    {alNavegar && (
                        <button
                            onClick={() => alNavegar("proyectos")}
                            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
                        >
                            Ver todos los proyectos <ArrowRight size={13} />
                        </button>
                    )}
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-800/60 mt-2">
                    {proyectos.length === 0 ? (
                        <div className="py-8 text-center text-xs text-gray-400">No hay proyectos registrados en el sistema.</div>
                    ) : (
                        proyectos.map((p) => {
                            const avance = p.porcentajeAvance ?? 0;
                            const tareasDelProy = tareas.filter(t => t.idProyecto === p.id);

                            return (
                                <div key={p.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                                                {p.codigo || `PRY-${p.id}`}
                                            </span>
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                {p.nombre}
                                            </h3>
                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                                {p.estado || "Iniciado"}
                                            </span>
                                        </div>

                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">
                                            {p.descripcion || "Sin descripción proporcionada."}
                                        </p>

                                        <div className="flex items-center gap-4 text-[11px] text-gray-400 dark:text-gray-500">
                                            <span>Líder: <strong className="text-gray-700 dark:text-gray-300">{p.nombreLider || "Sin asignar"}</strong></span>
                                            <span>•</span>
                                            <span>Presupuesto: <strong className="text-gray-700 dark:text-gray-300">{formatoMoneda(p.presupuestoTotal ?? 0)}</strong></span>
                                            <span>•</span>
                                            <span>{tareasDelProy.length} tareas</span>
                                        </div>
                                    </div>

                                    {/* Barra de avance y botón Kanban */}
                                    <div className="flex items-center gap-4 shrink-0">
                                        <div className="w-36">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-400 text-[11px]">Avance</span>
                                                <span className="font-semibold text-gray-900 dark:text-white font-mono">{avance}%</span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full ${
                                                        avance >= 100 ? "bg-emerald-500" : avance > 40 ? "bg-indigo-600 dark:bg-[#465FFF]" : "bg-amber-500"
                                                    }`}
                                                    style={{ width: `${avance}%` }}
                                                />
                                            </div>
                                        </div>

                                        {alNavegar && (
                                            <button
                                                onClick={() => alNavegar("tablero", p.id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-950/70 transition cursor-pointer"
                                            >
                                                <Kanban size={13} />
                                                <span>Tablero</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Fila 3: Dos Columnas (Tareas Recientes y Revisiones / Verificaciones) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Columna Izquierda: Tareas del Sistema */}
                <div className="rounded-2xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#111C2E] p-6 shadow-xs flex flex-col">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800/60 mb-3">
                        <div className="flex items-center gap-2">
                            <ListTodo size={18} className="text-indigo-600 dark:text-[#465FFF]" />
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">Tareas del Tablero</h2>
                        </div>

                        {/* Switch Todas vs Mis Tareas */}
                        <div className="flex items-center bg-gray-100 dark:bg-gray-800/80 rounded-xl p-0.5 text-xs">
                            <button
                                onClick={() => setTabTareas("todas")}
                                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                                    tabTareas === "todas" ? "bg-white dark:bg-[#111C2E] text-gray-900 dark:text-white shadow-2xs font-semibold" : "text-gray-500"
                                }`}
                            >
                                Todas ({totalTareas})
                            </button>
                            <button
                                onClick={() => setTabTareas("mis_tareas")}
                                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                                    tabTareas === "mis_tareas" ? "bg-white dark:bg-[#111C2E] text-gray-900 dark:text-white shadow-2xs font-semibold" : "text-gray-500"
                                }`}
                            >
                                Mis Tareas ({misTareas.length})
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 divide-y divide-gray-100 dark:divide-gray-800/60 overflow-y-auto max-h-[360px] custom-scrollbar">
                        {tareasAMostrar.length === 0 ? (
                            <div className="py-12 text-center text-xs text-gray-400">
                                {tabTareas === "mis_tareas" 
                                    ? "No tienes tareas asignadas actualmente. Puedes asignarte tareas desde el tablero Kanban."
                                    : "No hay tareas registradas en los proyectos."}
                            </div>
                        ) : (
                            tareasAMostrar.slice(0, 7).map((t) => (
                                <div key={t.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                                t.prioridad === "Crítico" ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400" :
                                                t.prioridad === "Alto" ? "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400" :
                                                "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                            }`}>
                                                {t.prioridad || "Normal"}
                                            </span>
                                            <span className="font-medium text-gray-900 dark:text-white truncate">
                                                {t.descripcion}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] text-gray-400">
                                            <span className="truncate max-w-[140px] text-indigo-600 dark:text-indigo-400 font-medium">
                                                {t.nombreProyecto || `Proyecto #${t.idProyecto}`}
                                            </span>
                                            <span>•</span>
                                            <span>
                                                {t.nombreResponsable ? `👤 ${t.nombreResponsable.split(" ")[0]}` : "Sin asignar"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="font-mono text-xs font-semibold text-gray-600 dark:text-gray-300">
                                            {t.porcentajeAvance ?? 0}%
                                        </span>
                                        {(t.porcentajeAvance ?? 0) >= 100 ? (
                                            <CheckCircle2 size={16} className="text-emerald-500" />
                                        ) : (
                                            <Clock size={16} className="text-amber-500" />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Columna Derecha: Verificaciones y Auditorías */}
                <div className="rounded-2xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#111C2E] p-6 shadow-xs flex flex-col">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800/60 mb-3">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={18} className="text-indigo-600 dark:text-[#465FFF]" />
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">Verificaciones y Calidad</h2>
                        </div>
                        {alNavegar && (
                            <button
                                onClick={() => alNavegar("verificaciones")}
                                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                            >
                                Ver todas <ArrowRight size={13} />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 divide-y divide-gray-100 dark:divide-gray-800/60 overflow-y-auto max-h-[360px] custom-scrollbar">
                        {verificaciones.length === 0 ? (
                            <div className="py-12 text-center text-xs text-gray-400">
                                No hay auditorías o verificaciones académicas programadas.
                            </div>
                        ) : (
                            verificaciones.slice(0, 6).map((v) => (
                                <div key={v.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="font-semibold text-gray-900 dark:text-white truncate">
                                                {v.tipo || "Auditoría General"}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                                v.resultado === "Aprobado" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" :
                                                v.resultado === "Rechazado" ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400" :
                                                "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                                            }`}>
                                                {v.resultado || "Pendiente"}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                                            {v.nombreProyecto || `Proyecto #${v.idProyecto}`} — {v.observaciones || "Sin observaciones adicionales"}
                                        </p>
                                    </div>

                                    {v.fechaLimite && (
                                        <span className="text-[11px] font-mono text-gray-400 shrink-0">
                                            {new Date(v.fechaLimite).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Dashboard;