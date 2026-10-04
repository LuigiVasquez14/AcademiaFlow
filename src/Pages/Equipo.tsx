import { useEffect, useState } from "react";
import type { ProyectoIntegranteViewModel } from "../Types/Proyectointegrante";
import type { ProyectoViewModel } from "../Types/Proyecto";
import type { UsuarioViewModel } from "../Types/Usuario";
import { 
    apiObtenerIntegrantes, 
    apiCrearIntegrante, 
    apiEliminarIntegrante, 
    apiObtenerProyectos, 
    apiObtenerUsuarios 
} from "../api";
import { 
    Users, 
    UserPlus, 
    Trash2, 
    Search, 
    Clock, 
    Mail, 
    FolderKanban, 
    X, 
    CheckCircle2, 
    AlertCircle, 
    Shield
} from "lucide-react";

const EstiloBadgeRol: Record<string, { bg: string }> = {
    "Líder Principal": { bg: "bg-indigo-500/10 text-indigo-700 dark:text-[#465FFF] border-indigo-500/20" },
    "Co-Investigador": { bg: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20" },
    "Asistente de Investigación": { bg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" },
    "Estudiante": { bg: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" },
    "Consultor Externo": { bg: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20" },
};

export function Equipo() {
    const [integrantes, setIntegrantes] = useState<ProyectoIntegranteViewModel[]>([]);
    const [proyectos, setProyectos] = useState<ProyectoViewModel[]>([]);
    const [usuarios, setUsuarios] = useState<UsuarioViewModel[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensajeExito, setMensajeExito] = useState("");

    // Filtros
    const [filtroProyecto, setFiltroProyecto] = useState<string>("Todos");
    const [busqueda, setBusqueda] = useState<string>("");

    // Modal Insertar Integrante
    const [mostrandoModalCrear, setMostrandoModalCrear] = useState(false);
    const [idProyectoNuevo, setIdProyectoNuevo] = useState<number | "">("");
    const [idUsuarioNuevo, setIdUsuarioNuevo] = useState<number | "">("");
    const [rolNuevo, setRolNuevo] = useState("Co-Investigador");
    const [dedicacionHoras, setDedicacionHoras] = useState<number | "">(10);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        cargarDatos();
    }, []);

    async function cargarDatos() {
        setCargando(true);
        setError("");
        try {
            const [datosIntegrantes, datosProyectos, datosUsuarios] = await Promise.all([
                apiObtenerIntegrantes(),
                apiObtenerProyectos(),
                apiObtenerUsuarios(),
            ]);
            setIntegrantes(datosIntegrantes);
            setProyectos(datosProyectos);
            setUsuarios(datosUsuarios);
        } catch {
            setError("No fue posible cargar el equipo. Verifica la conexión.");
        } finally {
            setCargando(false);
        }
    }

    const manejarCrearIntegrante = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!idProyectoNuevo || !idUsuarioNuevo) {
            setError("Selecciona tanto el proyecto como el usuario a vincular.");
            return;
        }

        setGuardando(true);
        setError("");
        try {
            await apiCrearIntegrante({
                idProyecto: Number(idProyectoNuevo),
                idUsuario: Number(idUsuarioNuevo),
                rol: rolNuevo,
                dedicacionHoras: dedicacionHoras === "" ? null : Number(dedicacionHoras),
                fechaIngreso: new Date().toISOString().split("T")[0],
                activo: true,
            });

            setMostrandoModalCrear(false);
            setIdProyectoNuevo("");
            setIdUsuarioNuevo("");
            setMensajeExito("¡Integrante vinculado al proyecto exitosamente!");
            setTimeout(() => setMensajeExito(""), 4000);

            const actualizados = await apiObtenerIntegrantes();
            setIntegrantes(actualizados);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al vincular integrante.");
        } finally {
            setGuardando(false);
        }
    };

    const manejarEliminar = async (id: number) => {
        if (!window.confirm("¿Seguro que deseas desvincular a este integrante del proyecto?")) return;
        try {
            await apiEliminarIntegrante(id);
            setMensajeExito("Integrante desvinculado.");
            setTimeout(() => setMensajeExito(""), 4000);
            const actualizados = await apiObtenerIntegrantes();
            setIntegrantes(actualizados);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al eliminar integrante.");
        }
    };

    const integrantesFiltrados = integrantes.filter((m) => {
        const coincideProyecto = filtroProyecto === "Todos" || String(m.idProyecto) === filtroProyecto;
        const coincideTexto = busqueda === "" ||
            (m.nombreUsuario && m.nombreUsuario.toLowerCase().includes(busqueda.toLowerCase())) ||
            (m.nombreProyecto && m.nombreProyecto.toLowerCase().includes(busqueda.toLowerCase())) ||
            (m.rol && m.rol.toLowerCase().includes(busqueda.toLowerCase()));
        return coincideProyecto && coincideTexto;
    });

    return (
        <div className="flex h-full w-full flex-col gap-6 overflow-y-auto bg-slate-50 dark:bg-[#0D1523] p-8 text-gray-900 dark:text-[#F9FAFB] transition-colors duration-300">
            {/* Cabecera */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-[#F9FAFB]">
                        Equipo e Investigadores
                    </h1>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Gestión de colaboradores, asignación de roles y dedicación horaria en proyectos.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setMostrandoModalCrear(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 dark:bg-[#465FFF] dark:hover:bg-[#394DD1] transition shadow-xs cursor-pointer"
                >
                    <UserPlus size={16} />
                    <span>Asignar Integrante</span>
                </button>
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

            {/* Filtros */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#131D30] p-3 shadow-xs">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-64">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar investigador, rol..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-[#1D2939] bg-gray-50 dark:bg-[#0D1523] text-gray-900 dark:text-[#F9FAFB] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                        <FolderKanban size={14} className="text-gray-400" />
                        <select
                            value={filtroProyecto}
                            onChange={(e) => setFiltroProyecto(e.target.value)}
                            className="rounded-lg border border-gray-200 dark:border-[#1D2939] bg-gray-50 dark:bg-[#0D1523] px-2.5 py-1.5 text-xs text-gray-800 dark:text-[#F9FAFB] focus:outline-none"
                        >
                            <option value="Todos">Filtrar por Proyecto: Todos</option>
                            {proyectos.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.codigo} - {p.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {integrantesFiltrados.length} integrante{integrantesFiltrados.length === 1 ? "" : "s"}
                </span>
            </div>

            {/* Grid de Tarjetas de Integrantes */}
            {cargando ? (
                <div className="p-8 text-center text-xs text-gray-500 dark:text-gray-400">
                    Cargando equipo…
                </div>
            ) : integrantesFiltrados.length === 0 ? (
                <div className="p-12 text-center text-xs text-gray-500 dark:text-gray-400 rounded-2xl border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#131D30] flex flex-col items-center gap-2">
                    <Users size={32} className="text-gray-400 mb-1" />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">No hay integrantes asignados con los filtros seleccionados</span>
                    <p>Usa el botón "Asignar Integrante" para vincular investigadores a tus proyectos.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {integrantesFiltrados.map((m) => {
                        const estiloRol = EstiloBadgeRol[m.rol] || EstiloBadgeRol["Co-Investigador"];
                        const iniciales = (m.nombreUsuario || "LV")
                            .split(" ")
                            .filter(Boolean)
                            .map((p) => p[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase();

                        return (
                            <div
                                key={m.id}
                                className="rounded-2xl border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#131D30] p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0">
                                                {iniciales}
                                            </div>
                                            <div className="overflow-hidden">
                                                <h3 className="font-bold text-sm text-gray-900 dark:text-[#F9FAFB] truncate">
                                                    {m.nombreUsuario || `Usuario #${m.idUsuario}`}
                                                </h3>
                                                <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold mt-1 ${estiloRol.bg}`}>
                                                    {m.rol}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => manejarEliminar(m.id)}
                                            title="Desvincular del proyecto"
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>

                                    <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-[#1E2B45]">
                                        <div className="flex items-center gap-2">
                                            <FolderKanban size={13} className="text-gray-400 shrink-0" />
                                            <span className="truncate font-medium text-gray-800 dark:text-gray-200">
                                                {m.nombreProyecto || `Proyecto #${m.idProyecto}`}
                                            </span>
                                        </div>

                                        {m.dedicacionHoras ? (
                                            <div className="flex items-center gap-2">
                                                <Clock size={13} className="text-gray-400 shrink-0" />
                                                <span>{m.dedicacionHoras} horas/semana</span>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-50 dark:border-[#1E2B45] flex items-center justify-between text-[11px] text-gray-400">
                                    <span>Ingreso: {m.fechaIngreso || "Reciente"}</span>
                                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        Activo
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MODAL INSERTAR INTEGRANTE */}
            {mostrandoModalCrear && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <form
                        onSubmit={manejarCrearIntegrante}
                        className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#131D30] p-6 shadow-2xl space-y-4"
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#1D2939]">
                            <div className="flex items-center gap-2 text-indigo-600 dark:text-[#465FFF]">
                                <UserPlus size={18} />
                                <h3 className="font-bold text-base text-gray-900 dark:text-[#F9FAFB]">
                                    Vincular Integrante al Proyecto
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setMostrandoModalCrear(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Proyecto *
                                </label>
                                <select
                                    value={idProyectoNuevo}
                                    onChange={(e) => setIdProyectoNuevo(Number(e.target.value))}
                                    required
                                    className="w-full rounded-lg border border-gray-200 dark:border-[#1D2939] bg-gray-50 dark:bg-[#0D1523] px-3 py-2 text-xs text-gray-900 dark:text-[#F9FAFB] focus:outline-none"
                                >
                                    <option value="">Selecciona el proyecto…</option>
                                    {proyectos.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.codigo} - {p.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Usuario / Investigador *
                                </label>
                                <select
                                    value={idUsuarioNuevo}
                                    onChange={(e) => setIdUsuarioNuevo(Number(e.target.value))}
                                    required
                                    className="w-full rounded-lg border border-gray-200 dark:border-[#1D2939] bg-gray-50 dark:bg-[#0D1523] px-3 py-2 text-xs text-gray-900 dark:text-[#F9FAFB] focus:outline-none"
                                >
                                    <option value="">Selecciona el usuario…</option>
                                    {usuarios.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.nombreCompleto} ({u.cargo || "Investigador"})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Rol en el Proyecto
                                    </label>
                                    <select
                                        value={rolNuevo}
                                        onChange={(e) => setRolNuevo(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 dark:border-[#1D2939] bg-gray-50 dark:bg-[#0D1523] px-3 py-2 text-xs text-gray-900 dark:text-[#F9FAFB] focus:outline-none"
                                    >
                                        <option value="Líder Principal">Líder Principal</option>
                                        <option value="Co-Investigador">Co-Investigador</option>
                                        <option value="Asistente de Investigación">Asistente</option>
                                        <option value="Estudiante">Estudiante</option>
                                        <option value="Consultor Externo">Consultor Externo</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Horas / Semana
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="60"
                                        value={dedicacionHoras}
                                        onChange={(e) => setDedicacionHoras(e.target.value === "" ? "" : Number(e.target.value))}
                                        className="w-full rounded-lg border border-gray-200 dark:border-[#1D2939] bg-gray-50 dark:bg-[#0D1523] px-3 py-2 text-xs text-gray-900 dark:text-[#F9FAFB] focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#1D2939]">
                            <button
                                type="button"
                                onClick={() => setMostrandoModalCrear(false)}
                                className="px-3.5 py-2 text-xs text-gray-500 hover:text-gray-700"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={guardando}
                                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 dark:bg-[#465FFF] transition disabled:opacity-50"
                            >
                                {guardando ? "Vinculando..." : "Vincular Integrante"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Equipo;
