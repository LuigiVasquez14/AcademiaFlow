import { useEffect, useState } from "react";
import type { AsignacionTareaViewModel } from "../Types/Asignaciontarea";
import type { ProyectoIntegranteViewModel } from "../Types/Proyectointegrante";
import type { NotificacionViewModel } from "../Types/Notificacion";

const URL_BASE = "https://localhost:7045/api";

interface PropiedadesDashboard {
    idUsuario: number;
}

export function Dashboard({ idUsuario }: PropiedadesDashboard) {

    const [tareas, setTareas] = useState<AsignacionTareaViewModel[]>([]);
    const [proyectos, setProyectos] = useState<ProyectoIntegranteViewModel[]>([]);
    const [alertas, setAlertas] = useState<NotificacionViewModel[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        cargarDatos();
    }, [idUsuario]);

    async function cargarDatos() {
        setCargando(true);
        setError("");
        try {
            const [respTareas, respProyectos, respAlertas] = await Promise.all([
                fetch(`${URL_BASE}/AsignacionTarea/usuario/${idUsuario}`),
                fetch(`${URL_BASE}/ProyectoIntegrante/usuario/${idUsuario}`),
                fetch(`${URL_BASE}/Notificacion/usuario/${idUsuario}/no-leidas`),
            ]);
            if (!respTareas.ok || !respProyectos.ok || !respAlertas.ok) {
                throw new Error("Alguno de los recursos no respondió correctamente.");
            }
            setTareas(await respTareas.json());
            setProyectos(await respProyectos.json());
            setAlertas(await respAlertas.json());
        } catch {
            setError("No fue posible cargar el panel de control. Verifica que la API esté corriendo.");
        } finally {
            setCargando(false);
        }
    }

    if (cargando) {
        return <div className="p-8 text-center text-[13px] text-gray-500 dark:text-gray-400">Cargando panel de control…</div>;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
                <p className="text-[13px] text-red-600 dark:text-[#F04438]">{error}</p>
                <button onClick={cargarDatos} className="rounded-lg border border-gray-200 dark:border-[#1D2939] px-3 py-1.5 text-[12.5px] hover:bg-gray-50 dark:hover:bg-[#1D2939]">
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-8">

            <div>
                <h1 className="text-[26px] font-bold text-gray-900 dark:text-[#F9FAFB]">Panel de Control</h1>
                <p className="mt-1 text-[13px] text-gray-500 dark:text-gray-400">
                    {tareas.length} tarea{tareas.length === 1 ? "" : "s"} asignada{tareas.length === 1 ? "" : "s"} · {proyectos.length} proyecto{proyectos.length === 1 ? "" : "s"} · {alertas.length} alerta{alertas.length === 1 ? "" : "s"} sin leer
                </p>
            </div>

            <div className="grid grid-cols-2 gap-5">

                <div className="rounded-xl border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#171F2F] shadow-sm">
                    <div className="border-b border-gray-100 dark:border-[#1D2939] px-4 py-3">
                        <h2 className="text-[15px] font-semibold text-gray-900 dark:text-[#F9FAFB]">Mis tareas asignadas</h2>
                    </div>
                    {tareas.length === 0 ? (
                        <p className="p-4 text-[13px] text-gray-500 dark:text-gray-400">No tienes tareas asignadas.</p>
                    ) : (
                        <ul>
                            {tareas.map((t, i) => (
                                <li key={t.idTarea} className={`flex items-center justify-between px-4 py-2.5 text-[13px] ${i !== 0 ? "border-t border-gray-100 dark:border-[#1D2939]" : ""}`}>
                                    <span className="text-gray-900 dark:text-[#F9FAFB]">{t.nombreTarea}</span>
                                    <span className="font-mono text-[11.5px] text-gray-500 dark:text-gray-400">{t.horasAsignadas ?? 0} h</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#171F2F] shadow-sm">
                    <div className="border-b border-gray-100 dark:border-[#1D2939] px-4 py-3">
                        <h2 className="text-[15px] font-semibold text-gray-900 dark:text-[#F9FAFB]">Proyectos donde participo</h2>
                    </div>
                    {proyectos.length === 0 ? (
                        <p className="p-4 text-[13px] text-gray-500 dark:text-gray-400">No participas en ningún proyecto todavía.</p>
                    ) : (
                        <ul>
                            {proyectos.map((p, i) => (
                                <li key={p.id} className={`flex items-center justify-between px-4 py-2.5 text-[13px] ${i !== 0 ? "border-t border-gray-100 dark:border-[#1D2939]" : ""}`}>
                                    <span className="text-gray-900 dark:text-[#F9FAFB]">{p.nombreProyecto}</span>
                                    <span className="text-[11.5px] text-indigo-600 dark:text-[#465FFF]">{p.rol}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="col-span-2 rounded-xl border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#171F2F] shadow-sm">
                    <div className="border-b border-gray-100 dark:border-[#1D2939] px-4 py-3">
                        <h2 className="text-[15px] font-semibold text-gray-900 dark:text-[#F9FAFB]">Alertas de verificación</h2>
                    </div>
                    {alertas.length === 0 ? (
                        <p className="p-4 text-[13px] text-gray-500 dark:text-gray-400">No tienes alertas pendientes.</p>
                    ) : (
                        <ul>
                            {alertas.map((a, i) => (
                                <li key={a.id} className={`flex flex-col gap-0.5 px-4 py-2.5 text-[13px] ${i !== 0 ? "border-t border-gray-100 dark:border-[#1D2939]" : ""}`}>
                                    <span className="font-medium text-gray-900 dark:text-[#F9FAFB]">{a.titulo}</span>
                                    <span className="text-[12px] text-gray-500 dark:text-gray-400">{a.mensaje}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;