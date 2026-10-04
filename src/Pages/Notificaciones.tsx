import { useEffect, useState } from "react";
import type { NotificacionViewModel } from "../Types/Notificacion";
import type { ProyectoViewModel } from "../Types/Proyecto";
import type { UsuarioViewModel } from "../Types/Usuario";
import {
    apiObtenerNotificaciones,
    apiCrearNotificacion,
    apiMarcarNotificacionLeida,
    apiObtenerProyectos,
    apiObtenerUsuarios,
} from "../api";

interface PropiedadesNotificaciones {
    idUsuario: number;
}

export function Notificaciones({ idUsuario }: PropiedadesNotificaciones) {
    const [notificaciones, setNotificaciones] = useState<NotificacionViewModel[]>([]);
    const [proyectos, setProyectos] = useState<ProyectoViewModel[]>([]);
    const [usuarios, setUsuarios] = useState<UsuarioViewModel[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [filtro, setFiltro] = useState<"todas" | "no_leidas" | "leidas">("todas");
    const [busqueda, setBusqueda] = useState("");

    // Modal para crear nueva notificación (Insert)
    const [modalAbierto, setModalAbierto] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [formTitulo, setFormTitulo] = useState("");
    const [formMensaje, setFormMensaje] = useState("");
    const [formTipo, setFormTipo] = useState<string>("info");
    const [formIdProyecto, setFormIdProyecto] = useState<string>("");
    const [formIdDestinatario, setFormIdDestinatario] = useState<number>(idUsuario);

    useEffect(() => {
        cargarDatos();
    }, [idUsuario]);

    async function cargarDatos() {
        setCargando(true);
        setError("");
        try {
            const [notifs, proys, users] = await Promise.all([
                apiObtenerNotificaciones(idUsuario).catch(() => []),
                apiObtenerProyectos().catch(() => []),
                apiObtenerUsuarios().catch(() => []),
            ]);
            setNotificaciones(notifs);
            setProyectos(proys);
            setUsuarios(users);
        } catch {
            setError("No fue posible cargar las notificaciones.");
        } finally {
            setCargando(false);
        }
    }

    async function marcarComoLeida(id: number) {
        try {
            await apiMarcarNotificacionLeida(id);
            setNotificaciones((prev) =>
                prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
            );
        } catch {
            // error silencioso
        }
    }

    async function marcarTodas() {
        try {
            const noLeidas = notificaciones.filter((n) => !n.leida);
            await Promise.all(noLeidas.map((n) => apiMarcarNotificacionLeida(n.id)));
            setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
        } catch {
            setError("No se pudieron marcar todas como leídas.");
        }
    }

    async function handleSubmitNueva(e: React.FormEvent) {
        e.preventDefault();
        if (!formTitulo.trim() || !formMensaje.trim()) return;

        setGuardando(true);
        try {
            const nueva = await apiCrearNotificacion({
                idUsuario: formIdDestinatario || idUsuario,
                idProyecto: formIdProyecto ? Number(formIdProyecto) : null,
                tipo: formTipo,
                titulo: formTitulo.trim(),
                mensaje: formMensaje.trim(),
            });

            // Si el destinatario es el usuario activo, la agregamos a la lista
            if (nueva.idUsuario === idUsuario) {
                setNotificaciones((prev) => [nueva, ...prev]);
            }
            setModalAbierto(false);
            setFormTitulo("");
            setFormMensaje("");
            setFormTipo("info");
            setFormIdProyecto("");
        } catch (err) {
            alert(err instanceof Error ? err.message : "Error al enviar notificación");
        } finally {
            setGuardando(false);
        }
    }

    // Filtrado
    const filtradas = notificaciones.filter((n) => {
        if (filtro === "no_leidas" && n.leida) return false;
        if (filtro === "leidas" && !n.leida) return false;
        if (busqueda.trim()) {
            const b = busqueda.toLowerCase();
            const matchTit = n.titulo?.toLowerCase().includes(b);
            const matchMsg = n.mensaje?.toLowerCase().includes(b);
            const matchProy = n.nombreProyecto?.toLowerCase().includes(b);
            if (!matchTit && !matchMsg && !matchProy) return false;
        }
        return true;
    });

    const totalNoLeidas = notificaciones.filter((n) => !n.leida).length;
    const totalLeidas = notificaciones.filter((n) => n.leida).length;

    const tipoIcono = (tipo?: string) => {
        switch (tipo?.toLowerCase()) {
            case "urgente":
            case "alerta":
                return (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                );
            case "exito":
            case "aprobado":
                return (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case "tarea":
            case "proyecto":
                return (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#0B111E] p-6 lg:p-10 transition-colors">
            <div className="mx-auto max-w-5xl space-y-6">

                {/* Encabezado */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Centro de Avisos y Notificaciones
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Supervisa alertas de proyectos, solicitudes de revisión y comunicados del equipo académico.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {totalNoLeidas > 0 && (
                            <button
                                onClick={marcarTodas}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111C2E] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Marcar todas
                            </button>
                        )}
                        <button
                            onClick={() => setModalAbierto(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Emitir Notificación
                        </button>
                    </div>
                </div>

                {/* Métricas rápidas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#111C2E] border border-gray-200/80 dark:border-gray-800/80 shadow-sm flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Notificaciones</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{notificaciones.length}</p>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-[#111C2E] border border-gray-200/80 dark:border-gray-800/80 shadow-sm flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Pendientes de Leer</p>
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{totalNoLeidas}</p>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-[#111C2E] border border-gray-200/80 dark:border-gray-800/80 shadow-sm flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Revisadas</p>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalLeidas}</p>
                        </div>
                    </div>
                </div>

                {/* Filtros y Búsqueda */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#111C2E] border border-gray-200/80 dark:border-gray-800/80">
                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        <button
                            onClick={() => setFiltro("todas")}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                                filtro === "todas"
                                    ? "bg-indigo-600 text-white"
                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                        >
                            Todas ({notificaciones.length})
                        </button>
                        <button
                            onClick={() => setFiltro("no_leidas")}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                                filtro === "no_leidas"
                                    ? "bg-indigo-600 text-white"
                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                        >
                            Sin Leer ({totalNoLeidas})
                        </button>
                        <button
                            onClick={() => setFiltro("leidas")}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                                filtro === "leidas"
                                    ? "bg-indigo-600 text-white"
                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                        >
                            Leídas ({totalLeidas})
                        </button>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Buscar en avisos..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Lista de Notificaciones */}
                <div className="rounded-2xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#111C2E] overflow-hidden shadow-sm">
                    {cargando && (
                        <div className="p-12 text-center text-sm text-gray-500 dark:text-gray-400">
                            Cargando avisos del sistema...
                        </div>
                    )}

                    {!cargando && error && (
                        <div className="p-10 text-center space-y-3">
                            <p className="text-sm text-red-500">{error}</p>
                            <button
                                onClick={cargarDatos}
                                className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                Reintentar
                            </button>
                        </div>
                    )}

                    {!cargando && !error && filtradas.length === 0 && (
                        <div className="p-12 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800/60 text-gray-400 mb-3">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Bandeja despejada</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">No hay notificaciones para los criterios seleccionados.</p>
                        </div>
                    )}

                    {!cargando && !error && (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
                            {filtradas.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => !n.leida && marcarComoLeida(n.id)}
                                    className={`flex items-start gap-4 p-5 transition cursor-pointer ${
                                        n.leida
                                            ? "bg-white dark:bg-[#111C2E] hover:bg-gray-50 dark:hover:bg-gray-900/40"
                                            : "bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/30"
                                    }`}
                                >
                                    {tipoIcono(n.tipo)}

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {n.titulo}
                                            </span>
                                            {!n.leida && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300">
                                                    Nuevo
                                                </span>
                                            )}
                                            {n.tipo && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 capitalize">
                                                    {n.tipo}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                            {n.mensaje}
                                        </p>

                                        <div className="mt-2.5 flex items-center gap-4 text-[11px] text-gray-400 dark:text-gray-500">
                                            {n.nombreProyecto && (
                                                <span className="inline-flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                                    </svg>
                                                    {n.nombreProyecto}
                                                </span>
                                            )}
                                            {n.fechaCreacion && (
                                                <span>{new Date(n.fechaCreacion).toLocaleString()}</span>
                                            )}
                                        </div>
                                    </div>

                                    {!n.leida && (
                                        <button
                                            title="Marcar como leída"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                marcarComoLeida(n.id);
                                            }}
                                            className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                                        >
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Insert: Nueva Notificación */}
            {modalAbierto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#111C2E] border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                            <div>
                                <h2 className="text-base font-bold text-gray-900 dark:text-white">Emitir Notificación o Alerta</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Registrar un nuevo aviso para el equipo académico</p>
                            </div>
                            <button
                                onClick={() => setModalAbierto(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmitNueva} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Destinatario *
                                </label>
                                <select
                                    value={formIdDestinatario}
                                    onChange={(e) => setFormIdDestinatario(Number(e.target.value))}
                                    className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    required
                                >
                                    {usuarios.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.nombres} {u.apellidos} ({u.cargo || u.rol})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Tipo de Aviso *
                                    </label>
                                    <select
                                        value={formTipo}
                                        onChange={(e) => setFormTipo(e.target.value)}
                                        className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="info">Información General</option>
                                        <option value="alerta">Alerta de Entrega</option>
                                        <option value="urgente">Urgente / Bloqueante</option>
                                        <option value="exito">Aprobación / Éxito</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Proyecto Vinculado
                                    </label>
                                    <select
                                        value={formIdProyecto}
                                        onChange={(e) => setFormIdProyecto(e.target.value)}
                                        className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">(Ninguno - General)</option>
                                        {proyectos.map((p) => (
                                            <option key={p.id} value={p.id}>{p.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Título del Aviso *
                                </label>
                                <input
                                    type="text"
                                    value={formTitulo}
                                    onChange={(e) => setFormTitulo(e.target.value)}
                                    placeholder="Ej: Fase de Revisión iniciada para el entregable"
                                    className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Mensaje Detallado *
                                </label>
                                <textarea
                                    rows={3}
                                    value={formMensaje}
                                    onChange={(e) => setFormMensaje(e.target.value)}
                                    placeholder="Escribe la descripción o instrucciones para el destinatario..."
                                    className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-none"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setModalAbierto(false)}
                                    className="px-4 py-2 text-xs font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={guardando}
                                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
                                >
                                    {guardando ? "Enviando..." : "Emitir Notificación"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Notificaciones;