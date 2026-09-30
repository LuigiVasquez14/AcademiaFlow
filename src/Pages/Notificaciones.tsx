import { useEffect, useState } from "react";
import type { NotificacionViewModel } from "../Types/Notificacion";

const URL_NOTIFICACIONES = "https://localhost:7045/api/Notificacion";

interface PropiedadesNotificaciones {
    idUsuario: number;
}

export function Notificaciones({ idUsuario }: PropiedadesNotificaciones) {

    const [notificaciones, setNotificaciones] = useState<NotificacionViewModel[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        cargarNotificaciones();
    }, [idUsuario]);

    async function cargarNotificaciones() {
        setCargando(true);
        setError("");
        try {
            const respuesta = await fetch(`${URL_NOTIFICACIONES}/usuario/${idUsuario}`);
            if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`);
            const datos: NotificacionViewModel[] = await respuesta.json();
            setNotificaciones(datos);
        } catch {
            setError("No fue posible cargar las notificaciones.");
        } finally {
            setCargando(false);
        }
    }

    async function marcarComoLeida(id: number) {
        try {
            await fetch(`${URL_NOTIFICACIONES}/${id}/marcar-leida`, { method: "PATCH" });
            setNotificaciones((actuales) =>
                actuales.map((n) => (n.id === id ? { ...n, leida: true } : n))
            );
        } catch {
            // Si falla, la dejamos como estaba; el usuario puede reintentar.
        }
    }

    async function marcarTodasComoLeidas() {
        try {
            await fetch(`${URL_NOTIFICACIONES}/usuario/${idUsuario}/marcar-todas-leidas`, { method: "PATCH" });
            setNotificaciones((actuales) => actuales.map((n) => ({ ...n, leida: true })));
        } catch {
            setError("No fue posible marcar todas como leídas.");
        }
    }

    const noLeidas = notificaciones.filter((n) => !n.leida).length;

    return (
        <div className="mx-auto flex w-full max-w-[480px] flex-col gap-4 p-8">

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-[22px] font-bold text-gray-900 dark:text-[#F9FAFB]">Notificaciones</h1>
                    <p className="mt-0.5 text-[12.5px] text-gray-500 dark:text-gray-400">{noLeidas} sin leer</p>
                </div>
                {noLeidas > 0 && (
                    <button
                        onClick={marcarTodasComoLeidas}
                        className="text-[12px] font-medium text-indigo-600 dark:text-[#465FFF] hover:text-indigo-800 dark:hover:text-[#394DD1]"
                    >
                        Marcar todas como leídas
                    </button>
                )}
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#171F2F] shadow-sm">

                {cargando && (
                    <div className="p-6 text-center text-[13px] text-gray-500 dark:text-gray-400">Cargando…</div>
                )}

                {!cargando && error && (
                    <div className="flex flex-col items-center gap-2 p-6 text-center">
                        <p className="text-[13px] text-red-600 dark:text-[#F04438]">{error}</p>
                        <button onClick={cargarNotificaciones} className="rounded-lg border border-gray-200 dark:border-[#1D2939] px-3 py-1 text-[12px] hover:bg-gray-50 dark:hover:bg-[#1D2939]">
                            Reintentar
                        </button>
                    </div>
                )}

                {!cargando && !error && notificaciones.length === 0 && (
                    <div className="p-6 text-center text-[13px] text-gray-500 dark:text-gray-400">No tienes notificaciones.</div>
                )}

                {!cargando && !error && notificaciones.map((n, i) => (
                    <button
                        key={n.id}
                        onClick={() => !n.leida && marcarComoLeida(n.id)}
                        className={`flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors duration-150 ${
                            i !== 0 ? "border-t border-gray-100 dark:border-[#1D2939]" : ""
                        } ${n.leida ? "bg-white dark:bg-[#171F2F]" : "bg-indigo-50/50 dark:bg-[#101828] hover:bg-indigo-50 dark:hover:bg-[#1D2939]/60"}`}
                    >
                        <div className="flex items-center gap-2">
                            {!n.leida && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-[#465FFF]" />}
                            <span className="text-[13px] font-medium text-gray-900 dark:text-[#F9FAFB]">{n.titulo}</span>
                        </div>
                        <p className="text-[12px] text-gray-500 dark:text-gray-400">{n.mensaje}</p>
                        {n.nombreProyecto && (
                            <span className="text-[11px] text-indigo-600 dark:text-[#465FFF]">{n.nombreProyecto}</span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default Notificaciones;