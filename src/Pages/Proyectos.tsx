import { useEffect, useMemo, useState } from "react";
import type { ProyectoViewModel } from "../Types/Proyecto";

const URL_API = "https://localhost:7045/api/Proyecto";

const EstiloBadge: Record<string, string> = {
    Iniciado: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-[#1D2939] dark:text-gray-300 dark:border-[#1D2939]",
    Publicado: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-[#1B2A5C] dark:text-[#465FFF] dark:border-[#2A3B7A]",
    Aprobado: "bg-green-50 text-green-800 border-green-200 dark:bg-[#173538] dark:text-[#12B76A] dark:border-[#173538]",
    "En Ejecución": "bg-green-50 text-green-800 border-green-200 dark:bg-[#173538] dark:text-[#12B76A] dark:border-[#173538]",
    Cancelado: "bg-red-50 text-red-700 border-red-200 dark:bg-[#382430] dark:text-[#F04438] dark:border-[#382430]",
    Finalizado: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-[#1D2939] dark:text-gray-300 dark:border-[#1D2939]",
};

function Badge({ estado }: { estado?: string | null }) {
    if (!estado) return null;
    const estilo = EstiloBadge[estado] ?? "bg-gray-100 text-gray-700 border-gray-200 dark:bg-[#1D2939] dark:text-gray-300 dark:border-[#1D2939]";
    return (
        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${estilo}`}>
            {estado}
        </span>
    );
}

function formatearPresupuesto(monto?: number | null, moneda?: string | null) {
    if (monto === null || monto === undefined) return "—";
    const numero = new Intl.NumberFormat("es-CO").format(monto);
    return moneda ? `${numero} ${moneda}` : numero;
}

interface PropiedadesProyectos {
    alCrearProyecto?: () => void;
    alVerTablero?: (idProyecto: number) => void;
}

export function Proyectos({ alCrearProyecto, alVerTablero }: PropiedadesProyectos) {

    const [proyectos, setProyectos] = useState<ProyectoViewModel[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("Todos");
    const [filtroFinanciamiento, setFiltroFinanciamiento] = useState("Todos");

    useEffect(() => {
        cargarProyectos();
    }, []);

    async function cargarProyectos() {
        setCargando(true);
        setError("");
        try {
            const respuesta = await fetch(URL_API);
            if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`);
            const datos: ProyectoViewModel[] = await respuesta.json();
            setProyectos(datos);
        } catch {
            setError("No fue posible cargar los proyectos. Verifica que la API esté corriendo.");
        } finally {
            setCargando(false);
        }
    }

    const proyectosFiltrados = useMemo(() => {
        return proyectos.filter((p) => {
            const pasaEstado = filtroEstado === "Todos" || p.estado === filtroEstado;
            const pasaFinanciamiento = filtroFinanciamiento === "Todos" || p.origenFinanciamiento === filtroFinanciamiento;
            return pasaEstado && pasaFinanciamiento;
        });
    }, [proyectos, filtroEstado, filtroFinanciamiento]);

    const EstiloSelect = "h-9 rounded-lg border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#101828] px-2.5 text-[12.5px] text-gray-700 dark:text-gray-300 outline-none focus:border-indigo-600 dark:focus:border-[#465FFF]";

    return (
        <div className="flex h-full w-full flex-col gap-5 overflow-y-auto bg-white dark:bg-[#101828] p-8 transition-colors duration-300">

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-[26px] font-bold text-gray-900 dark:text-[#F9FAFB]">Proyectos</h1>
                    <p className="mt-1 text-[13px] text-gray-500 dark:text-gray-400">
                        Catálogo institucional · {proyectosFiltrados.length} de {proyectos.length} proyecto{proyectos.length === 1 ? "" : "s"}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={alCrearProyecto}
                    className="h-9 rounded-lg bg-indigo-600 dark:bg-[#465FFF] px-4 text-[13px] font-semibold text-white transition-colors duration-150 hover:bg-indigo-700 dark:hover:bg-[#394DD1]"
                >
                    Nuevo proyecto
                </button>
            </div>

            <div className="flex items-center gap-3">
                <select className={EstiloSelect} value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                    <option value="Todos">Estado: Todos</option>
                    <option value="Iniciado">Iniciado</option>
                    <option value="Publicado">Publicado</option>
                    <option value="Aprobado">Aprobado</option>
                    <option value="En Ejecución">En Ejecución</option>
                    <option value="Cancelado">Cancelado</option>
                    <option value="Finalizado">Finalizado</option>
                </select>
                <select className={EstiloSelect} value={filtroFinanciamiento} onChange={(e) => setFiltroFinanciamiento(e.target.value)}>
                    <option value="Todos">Financiamiento: Todos</option>
                    <option value="Propio">Propio</option>
                    <option value="Mixto">Mixto</option>
                    <option value="Público">Público</option>
                    <option value="Privado">Privado</option>
                </select>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#171F2F] shadow-sm">

                {cargando && (
                    <div className="p-8 text-center text-[13px] text-gray-500 dark:text-gray-400">Cargando proyectos…</div>
                )}

                {!cargando && error && (
                    <div className="flex flex-col items-center gap-3 p-8 text-center">
                        <p className="text-[13px] text-red-600 dark:text-[#F04438]">{error}</p>
                        <button
                            type="button"
                            onClick={cargarProyectos}
                            className="rounded-lg border border-gray-200 dark:border-[#1D2939] px-3 py-1.5 text-[12.5px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1D2939]"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {!cargando && !error && proyectosFiltrados.length === 0 && (
                    <div className="p-8 text-center text-[13px] text-gray-500 dark:text-gray-400">
                        No hay proyectos que coincidan con los filtros.
                    </div>
                )}

                {!cargando && !error && proyectosFiltrados.length > 0 && (
                    <table className="w-full text-left text-[13px]">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-[#1D2939] text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                <th className="px-4 py-3">Código</th>
                                <th className="px-4 py-3">Nombre</th>
                                <th className="px-4 py-3">Líder</th>
                                <th className="px-4 py-3">Financiamiento</th>
                                <th className="px-4 py-3">Presupuesto</th>
                                <th className="px-4 py-3">Progreso</th>
                                <th className="px-4 py-3">Estado</th>
                                <th className="px-4 py-3 text-right">Tablero</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proyectosFiltrados.map((proyecto) => (
                                <tr key={proyecto.id} className="border-b border-gray-100 dark:border-[#1D2939] last:border-b-0 hover:bg-gray-50 dark:hover:bg-[#1D2939]/40 transition">
                                    <td className="px-4 py-3 font-mono text-[12px] text-indigo-600 dark:text-[#465FFF]">{proyecto.codigo}</td>
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-[#F9FAFB]">{proyecto.nombre}</td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{proyecto.nombreLider}</td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{proyecto.origenFinanciamiento ?? "—"}</td>
                                    <td className="px-4 py-3 font-mono text-[12px] text-gray-900 dark:text-[#F9FAFB]">
                                        {formatearPresupuesto(proyecto.presupuestoTotal, proyecto.moneda)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-16 rounded-full bg-gray-100 dark:bg-[#1D2939]">
                                                <div
                                                    className="h-1.5 rounded-full bg-indigo-600 dark:bg-[#465FFF]"
                                                    style={{ width: `${proyecto.porcentajeAvance ?? 0}%` }}
                                                />
                                            </div>
                                            <span className="font-mono text-[11.5px] text-gray-500 dark:text-gray-400">
                                                {proyecto.porcentajeAvance ?? 0}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge estado={proyecto.estado} />
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            type="button"
                                            onClick={() => alVerTablero && alVerTablero(proyecto.id)}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-[#465FFF] hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition cursor-pointer"
                                        >
                                            <span>Tareas (Trello)</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Proyectos;