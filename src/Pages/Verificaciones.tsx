import React, { useEffect, useState } from "react";
import type { VerificacionViewModel } from "../Types/Verificacion";
import type { ProyectoViewModel } from "../Types/Proyecto";
import type { FaseViewModel } from "../Types/Fase";
import type { TareaViewModel } from "../Types/Tarea";
import { 
    apiObtenerVerificaciones, 
    apiCrearVerificacion, 
    apiActualizarVerificacion, 
    apiObtenerProyectos, 
    apiObtenerFasesPorProyecto, 
    apiObtenerTareasPorProyecto 
} from "../api";
import { 
    Plus, 
    CheckCircle2, 
    AlertCircle, 
    Clock, 
    XCircle, 
    Filter, 
    Search, 
    Calendar, 
    FileText, 
    X,
    FolderKanban
} from "lucide-react";

const EstiloBadgeResultado: Record<string, { bg: string; text: string }> = {
    Pendiente: { bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", text: "Pendiente" },
    Aprobado: { bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", text: "Aprobado" },
    Rechazado: { bg: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20", text: "Rechazado" },
    "Requiere Ajustes": { bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", text: "Requiere Ajustes" },
};

function BadgeResultado({ resultado }: { resultado?: string | null }) {
    const valor = resultado ?? "Pendiente";
    const estilo = EstiloBadgeResultado[valor] ?? EstiloBadgeResultado.Pendiente;
    return (
        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${estilo.bg}`}>
            {valor}
        </span>
    );
}

export function Verificaciones() {
    const [verificaciones, setVerificaciones] = useState<VerificacionViewModel[]>([]);
    const [proyectos, setProyectos] = useState<ProyectoViewModel[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensajeExito, setMensajeExito] = useState("");

    // Filtros
    const [filtroProyecto, setFiltroProyecto] = useState<string>("Todos");
    const [filtroResultado, setFiltroResultado] = useState<string>("Todos");
    const [busqueda, setBusqueda] = useState<string>("");

    // Modal Dictamen
    const [seleccionada, setSeleccionada] = useState<VerificacionViewModel | null>(null);

    // Modal Crear Nueva Verificación (INSERT)
    const [mostrandoModalCrear, setMostrandoModalCrear] = useState(false);
    const [nuevoProyectoId, setNuevoProyectoId] = useState<number | "">("");
    const [nuevaFaseId, setNuevaFaseId] = useState<number | "">("");
    const [nuevaTareaId, setNuevaTareaId] = useState<number | "">("");
    const [fasesDisponibles, setFasesDisponibles] = useState<FaseViewModel[]>([]);
    const [tareasDisponibles, setTareasDisponibles] = useState<TareaViewModel[]>([]);
    const [nuevoTipo, setNuevoTipo] = useState("Entregable");
    const [nuevaFechaLimite, setNuevaFechaLimite] = useState("");
    const [nuevasObservaciones, setNuevasObservaciones] = useState("");
    const [guardandoVerificacion, setGuardandoVerificacion] = useState(false);

    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    async function cargarDatosIniciales() {
        setCargando(true);
        setError("");
        try {
            const [datosVerificaciones, datosProyectos] = await Promise.all([
                apiObtenerVerificaciones(),
                apiObtenerProyectos(),
            ]);
            setVerificaciones(datosVerificaciones);
            setProyectos(datosProyectos);
        } catch {
            setError("No fue posible cargar las verificaciones. Verifica la conexión.");
        } finally {
            setCargando(false);
        }
    }

    // Al seleccionar proyecto en el modal de nueva verificación, cargar sus fases y tareas
    const manejarCambioProyectoNuevo = async (id: number) => {
        setNuevoProyectoId(id);
        setNuevaFaseId("");
        setNuevaTareaId("");
        if (!id) {
            setFasesDisponibles([]);
            setTareasDisponibles([]);
            return;
        }
        try {
            const [fases, tareas] = await Promise.all([
                apiObtenerFasesPorProyecto(id),
                apiObtenerTareasPorProyecto(id),
            ]);
            setFasesDisponibles(fases);
            setTareasDisponibles(tareas);
        } catch {
            // error silencioso
        }
    };

    // Insertar nueva verificación (POST)
    const manejarCrearVerificacion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoProyectoId) {
            setError("Selecciona el proyecto a verificar.");
            return;
        }

        setGuardandoVerificacion(true);
        setError("");
        try {
            await apiCrearVerificacion({
                idProyecto: Number(nuevoProyectoId),
                idFase: nuevaFaseId === "" ? null : Number(nuevaFaseId),
                idTarea: nuevaTareaId === "" ? null : Number(nuevaTareaId),
                tipo: nuevoTipo,
                resultado: "Pendiente",
                fechaLimite: nuevaFechaLimite || null,
                observaciones: nuevasObservaciones.trim(),
            });

            setMostrandoModalCrear(false);
            setNuevoProyectoId("");
            setNuevaFaseId("");
            setNuevaTareaId("");
            setNuevasObservaciones("");
            setNuevaFechaLimite("");
            setMensajeExito("¡Solicitud de verificación creada exitosamente!");
            setTimeout(() => setMensajeExito(""), 4000);

            // Recargar lista
            const actualizadas = await apiObtenerVerificaciones();
            setVerificaciones(actualizadas);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al crear la verificación.");
        } finally {
            setGuardandoVerificacion(false);
        }
    };

    // Filtrar verificaciones
    const verificacionesFiltradas = verificaciones.filter((v) => {
        const coincideProyecto = filtroProyecto === "Todos" || String(v.idProyecto) === filtroProyecto;
        const coincideResultado = filtroResultado === "Todos" || (v.resultado || "Pendiente") === filtroResultado;
        const coincideBusqueda = busqueda === "" ||
            (v.nombreProyecto && v.nombreProyecto.toLowerCase().includes(busqueda.toLowerCase())) ||
            (v.tipo && v.tipo.toLowerCase().includes(busqueda.toLowerCase())) ||
            (v.observaciones && v.observaciones.toLowerCase().includes(busqueda.toLowerCase()));
        return coincideProyecto && coincideResultado && coincideBusqueda;
    });

    const pendientesCount = verificaciones.filter(v => (v.resultado || "Pendiente") === "Pendiente").length;
    const aprobadasCount = verificaciones.filter(v => v.resultado === "Aprobado").length;

    return (
        <div className="flex h-full w-full flex-col gap-6 overflow-y-auto bg-slate-50 dark:bg-[#0D1523] p-8 text-gray-900 dark:text-[#F9FAFB] transition-colors duration-300">
            {/* Cabecera y botón Crear (Insert) */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-[#F9FAFB]">
                        Verificaciones y Control de Calidad
                    </h1>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Inspecciones académicas, auditorías de entregables y dictámenes de proyectos.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setMostrandoModalCrear(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 dark:bg-[#465FFF] dark:hover:bg-[#394DD1] transition shadow-xs cursor-pointer"
                    >
                        <Plus size={16} />
                        <span>Nueva Verificación</span>
                    </button>
                </div>
            </div>

            {/* Resumen / Contadores */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#131D30] p-4 flex items-center justify-between shadow-xs">
                    <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Verificaciones</span>
                        <p className="text-2xl font-bold text-gray-900 dark:text-[#F9FAFB] mt-0.5">{verificaciones.length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-[#465FFF] flex items-center justify-center">
                        <FileText size={20} />
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#131D30] p-4 flex items-center justify-between shadow-xs">
                    <div>
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Pendientes de Dictamen</span>
                        <p className="text-2xl font-bold text-gray-900 dark:text-[#F9FAFB] mt-0.5">{pendientesCount}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                        <Clock size={20} />
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#131D30] p-4 flex items-center justify-between shadow-xs">
                    <div>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Aprobadas</span>
                        <p className="text-2xl font-bold text-gray-900 dark:text-[#F9FAFB] mt-0.5">{aprobadasCount}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 size={20} />
                    </div>
                </div>
            </div>

            {/* Alertas */}
            {mensajeExito && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 p-4 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 size={16} />
                    <span>{mensajeExito}</span>
                </div>
            )}
            {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 p-4 text-xs font-semibold text-red-700 dark:text-red-300">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {/* Barra de Filtros y Búsqueda */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#131D30] p-3 shadow-xs">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-64">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar en verificaciones..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-[#1D2939] bg-gray-50 dark:bg-[#0D1523] text-gray-900 dark:text-[#F9FAFB] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                        <Filter size={14} className="text-gray-400" />
                        <select
                            value={filtroProyecto}
                            onChange={(e) => setFiltroProyecto(e.target.value)}
                            className="rounded-lg border border-gray-200 dark:border-[#1D2939] bg-gray-50 dark:bg-[#0D1523] px-2.5 py-1.5 text-xs text-gray-800 dark:text-[#F9FAFB] focus:outline-none"
                        >
                            <option value="Todos">Proyecto: Todos</option>
                            {proyectos.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.codigo} - {p.nombre}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filtroResultado}
                            onChange={(e) => setFiltroResultado(e.target.value)}
                            className="rounded-lg border border-gray-200 dark:border-[#1D2939] bg-gray-50 dark:bg-[#0D1523] px-2.5 py-1.5 text-xs text-gray-800 dark:text-[#F9FAFB] focus:outline-none"
                        >
                            <option value="Todos">Resultado: Todos</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Aprobado">Aprobado</option>
                            <option value="Requiere Ajustes">Requiere Ajustes</option>
                            <option value="Rechazado">Rechazado</option>
                        </select>
                    </div>
                </div>

                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {verificacionesFiltradas.length} resultado{verificacionesFiltradas.length === 1 ? "" : "s"}
                </span>
            </div>

            {/* Tabla de Verificaciones */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#131D30] shadow-xs">
                {cargando ? (
                    <div className="p-8 text-center text-xs text-gray-500 dark:text-gray-400">
                        Cargando verificaciones…
                    </div>
                ) : verificacionesFiltradas.length === 0 ? (
                    <div className="p-12 text-center text-xs text-gray-500 dark:text-gray-400 flex flex-col items-center gap-2">
                        <FileText size={32} className="text-gray-300 dark:text-gray-600 mb-1" />
                        <span className="font-semibold text-gray-700 dark:text-gray-300">No hay verificaciones que coincidan con los filtros</span>
                        <p>Crea una nueva solicitud de verificación usando el botón superior.</p>
                    </div>
                ) : (
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-[#1D2939] text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-[#0D1523]/50">
                                <th className="px-5 py-3.5">Código / Proyecto</th>
                                <th className="px-5 py-3.5">Tipo y Objeto</th>
                                <th className="px-5 py-3.5">Fecha Límite</th>
                                <th className="px-5 py-3.5">Resultado</th>
                                <th className="px-5 py-3.5">Observaciones</th>
                                <th className="px-5 py-3.5 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-[#1D2939]">
                            {verificacionesFiltradas.map((v) => (
                                <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-[#1A263D]/40 transition">
                                    <td className="px-5 py-3.5">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900 dark:text-[#F9FAFB]">{v.nombreProyecto || `Proyecto #${v.idProyecto}`}</span>
                                            <span className="font-mono text-[10.5px] text-indigo-600 dark:text-[#465FFF]">VER-{String(v.id).padStart(4, "0")}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{v.tipo || "Revisión General"}</span>
                                            <span className="text-[11px] text-gray-400">
                                                {v.nombreFase ? `Fase: ${v.nombreFase}` : ""} 
                                                {v.descripcionTarea ? ` · ${v.descripcionTarea}` : ""}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 font-mono text-[11.5px] text-gray-600 dark:text-gray-300">
                                        {v.fechaLimite ? (
                                            <span className="inline-flex items-center gap-1">
                                                <Calendar size={12} className="text-gray-400" />
                                                {v.fechaLimite}
                                            </span>
                                        ) : "—"}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <BadgeResultado resultado={v.resultado} />
                                    </td>
                                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                        {v.observaciones || "Sin observaciones registradas."}
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <button
                                            type="button"
                                            onClick={() => setSeleccionada(v)}
                                            className="rounded-lg border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-[#465FFF] hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition cursor-pointer"
                                        >
                                            Dictaminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* MODAL CREAR NUEVA VERIFICACIÓN (INSERT) */}
            {mostrandoModalCrear && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <form 
                        onSubmit={manejarCrearVerificacion}
                        className="w-full max-w-lg rounded-2xl border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#131D30] p-6 shadow-2xl space-y-4"
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#1D2939]">
                            <div className="flex items-center gap-2 text-indigo-600 dark:text-[#465FFF]">
                                <Plus size={18} />
                                <h3 className="font-bold text-base text-gray-900 dark:text-[#F9FAFB]">
                                    Nueva Solicitud de Verificación
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setMostrandoModalCrear(false)}
                                className="rounded-lg p-1 text-gray-400 hover:text-gray-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Proyecto a Inspeccionar *
                                </label>
                                <select
                                    value={nuevoProyectoId}
                                    onChange={(e) => manejarCambioProyectoNuevo(Number(e.target.value))}
                                    required
                                    className="w-full rounded-lg border border-gray-200 dark:border-[#1D2939] bg-gray-50 dark:bg-[#0D1523] px-3 py-2 text-xs text-gray-900 dark:text-[#F9FAFB] focus:outline-none"
                                >
                                    <option value="">Selecciona un proyecto…</option>
                                    {proyectos.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.codigo} - {p.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Fase del Proyecto (Opcional)
                                    </label>
                                    <select
                                        value={nuevaFaseId}
                                        onChange={(e) => setNuevaFaseId(e.target.value === "" ? "" : Number(e.target.value))}
                                        disabled={!nuevoProyectoId || fasesDisponibles.length === 0}
                                        className="w-full rounded-lg border border-gray-200 dark:border-[#1D2939] bg-gray-50 dark:bg-[#0D1523] px-3 py-2 text-xs text-gray-900 dark:text-[#F9FAFB] focus:outline-none disabled:opacity-50"
                                    >
                                        <option value="">Cualquier fase / General</option>
                                        {fasesDisponibles.map((f) => (
                                            <option key={f.id} value={f.id}>
                                                {f.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Tipo de Verificación
                                    </label>
                                    <select
                                        value={nuevoTipo}
                                        onChange={(e) => setNuevoTipo(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 dark:border-[#1D2939] bg-gray-50 dark:bg-[#0D1523] px-3 py-2 text-xs text-gray-900 dark:text-[#F9FAFB] focus:outline-none"
                                    >
                                        <option value="Entregable">Entregable / Producto</option>
                                        <option value="Fase">Fase Completa</option>
                                        <option value="Tarea">Tarea Específica</option>
                                        <option value="Metodología">Auditoría Metodológica</option>
                                        <option value="Presupuesto">Ejecución Presupuestal</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Fecha Límite para el Dictamen
                                </label>
                                <input
                                    type="date"
                                    value={nuevaFechaLimite}
                                    onChange={(e) => setNuevaFechaLimite(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 dark:border-[#1D2939] bg-gray-50 dark:bg-[#0D1523] px-3 py-2 text-xs text-gray-900 dark:text-[#F9FAFB] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Criterios y Observaciones Iniciales
                                </label>
                                <textarea
                                    rows={3}
                                    value={nuevasObservaciones}
                                    onChange={(e) => setNuevasObservaciones(e.target.value)}
                                    placeholder="Describe qué aspectos técnicos, éticos o metodológicos deben revisarse..."
                                    className="w-full rounded-lg border border-gray-200 dark:border-[#1D2939] bg-gray-50 dark:bg-[#0D1523] p-2.5 text-xs text-gray-900 dark:text-[#F9FAFB] focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#1D2939]">
                            <button
                                type="button"
                                onClick={() => setMostrandoModalCrear(false)}
                                className="px-3.5 py-2 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={guardandoVerificacion}
                                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 dark:bg-[#465FFF] transition disabled:opacity-50"
                            >
                                {guardandoVerificacion ? "Insertando..." : "Crear Verificación"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* MODAL DICTAMINAR EXISTENTE */}
            {seleccionada && (
                <ModalDictamen
                    verificacion={seleccionada}
                    onCerrar={() => setSeleccionada(null)}
                    onGuardado={async () => {
                        setSeleccionada(null);
                        const actualizadas = await apiObtenerVerificaciones();
                        setVerificaciones(actualizadas);
                        setMensajeExito("¡Dictamen registrado exitosamente!");
                        setTimeout(() => setMensajeExito(""), 4000);
                    }}
                />
            )}
        </div>
    );
}

// Subcomponente para dictaminar una verificación
function ModalDictamen({ verificacion, onCerrar, onGuardado }: {
    verificacion: VerificacionViewModel;
    onCerrar: () => void;
    onGuardado: () => void;
}) {
    const [resultado, setResultado] = useState(verificacion.resultado || "Aprobado");
    const [observaciones, setObservaciones] = useState(verificacion.observaciones || "");
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");

    const manejarGuardar = async (e: React.FormEvent) => {
        e.preventDefault();
        setEnviando(true);
        setError("");
        try {
            await apiActualizarVerificacion(verificacion.id, {
                ...verificacion,
                resultado,
                observaciones: observaciones.trim(),
            });
            onGuardado();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al registrar el dictamen.");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <form onSubmit={manejarGuardar} className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#131D30] p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#1D2939]">
                    <h3 className="font-bold text-base text-gray-900 dark:text-[#F9FAFB]">
                        Emitir Dictamen de Verificación
                    </h3>
                    <button type="button" onClick={onCerrar} className="text-gray-400 hover:text-gray-600">
                        <X size={18} />
                    </button>
                </div>

                {error && (
                    <div className="p-3 text-xs bg-red-50 text-red-600 rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                <div className="space-y-3 text-xs">
                    <div className="rounded-lg bg-gray-50 dark:bg-[#0D1523] p-3 text-gray-600 dark:text-gray-400 space-y-1">
                        <p><span className="font-semibold text-gray-800 dark:text-gray-200">Proyecto:</span> {verificacion.nombreProyecto}</p>
                        <p><span className="font-semibold text-gray-800 dark:text-gray-200">Tipo:</span> {verificacion.tipo}</p>
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Resultado del Dictamen
                        </label>
                        <select
                            value={resultado}
                            onChange={(e) => setResultado(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#0D1523] px-3 py-2 text-xs text-gray-900 dark:text-[#F9FAFB] focus:outline-none"
                        >
                            <option value="Aprobado">Aprobado</option>
                            <option value="Requiere Ajustes">Requiere Ajustes</option>
                            <option value="Rechazado">Rechazado</option>
                            <option value="Pendiente">Pendiente</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Observaciones y Dictamen Técnico
                        </label>
                        <textarea
                            rows={4}
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            placeholder="Detalla las conclusiones, correcciones o comentarios del dictamen..."
                            className="w-full rounded-lg border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#0D1523] p-2.5 text-xs text-gray-900 dark:text-[#F9FAFB] focus:outline-none"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#1D2939]">
                    <button type="button" onClick={onCerrar} className="px-3.5 py-2 text-xs text-gray-500 hover:text-gray-700">
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={enviando}
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 dark:bg-[#465FFF] transition disabled:opacity-50"
                    >
                        {enviando ? "Guardando..." : "Registrar Dictamen"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Verificaciones;