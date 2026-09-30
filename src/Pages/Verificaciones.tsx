import { useEffect, useState } from "react";
import type { VerificacionViewModel } from "../Types/Verificacion";

const URL_VERIFICACIONES = "https://localhost:7045/api/Verificacion";

const EstiloBadgeResultado: Record<string, string> = {
    Pendiente: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-[#1D2939] dark:text-gray-300 dark:border-[#1D2939]",
    Aprobado: "bg-green-50 text-green-800 border-green-200 dark:bg-[#173538] dark:text-[#12B76A] dark:border-[#173538]",
    Rechazado: "bg-red-50 text-red-700 border-red-200 dark:bg-[#382430] dark:text-[#F04438] dark:border-[#382430]",
    "Requiere Ajustes": "bg-blue-50 text-blue-800 border-blue-200 dark:bg-[#1B2A5C] dark:text-[#465FFF] dark:border-[#2A3B7A]",
};

function BadgeResultado({ resultado }: { resultado?: string | null }) {
    const valor = resultado ?? "Pendiente";
    const estilo = EstiloBadgeResultado[valor] ?? EstiloBadgeResultado.Pendiente;
    return (
        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${estilo}`}>
            {valor}
        </span>
    );
}

export function Verificaciones() {

    const [verificaciones, setVerificaciones] = useState<VerificacionViewModel[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [seleccionada, setSeleccionada] = useState<VerificacionViewModel | null>(null);

    useEffect(() => {
        cargarVerificaciones();
    }, []);

    async function cargarVerificaciones() {
        setCargando(true);
        setError("");
        try {
            const respuesta = await fetch(URL_VERIFICACIONES);
            if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`);
            const datos: VerificacionViewModel[] = await respuesta.json();
            setVerificaciones(datos);
        } catch {
            setError("No fue posible cargar las verificaciones. Verifica que la API esté corriendo.");
        } finally {
            setCargando(false);
        }
    }

    return (
        <div className="flex h-full w-full flex-col gap-5 overflow-y-auto bg-white dark:bg-[#101828] p-8 transition-colors duration-300">

            <div>
                <h1 className="text-[26px] font-bold text-gray-900 dark:text-[#F9FAFB]">Verificaciones</h1>
                <p className="mt-1 text-[13px] text-gray-500 dark:text-gray-400">
                    Solicitudes de revisión · trazabilidad por proyecto, fase y tarea
                </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#171F2F] shadow-sm">

                {cargando && (
                    <div className="p-8 text-center text-[13px] text-gray-500 dark:text-gray-400">Cargando verificaciones…</div>
                )}

                {!cargando && error && (
                    <div className="flex flex-col items-center gap-3 p-8 text-center">
                        <p className="text-[13px] text-red-600 dark:text-[#F04438]">{error}</p>
                        <button
                            type="button"
                            onClick={cargarVerificaciones}
                            className="rounded-lg border border-gray-200 dark:border-[#1D2939] px-3 py-1.5 text-[12.5px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1D2939]"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {!cargando && !error && verificaciones.length === 0 && (
                    <div className="p-8 text-center text-[13px] text-gray-500 dark:text-gray-400">
                        No hay verificaciones registradas todavía.
                    </div>
                )}

                {!cargando && !error && verificaciones.length > 0 && (
                    <table className="w-full text-left text-[13px]">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-[#1D2939] text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                <th className="px-4 py-3">Proyecto</th>
                                <th className="px-4 py-3">Objeto de verificación</th>
                                <th className="px-4 py-3">Asignado por</th>
                                <th className="px-4 py-3">Fecha límite</th>
                                <th className="px-4 py-3">Resultado</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {verificaciones.map((v) => (
                                <tr key={v.id} className="border-b border-gray-100 dark:border-[#1D2939] last:border-b-0 hover:bg-gray-50 dark:hover:bg-[#1D2939]/40">
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900 dark:text-[#F9FAFB]">{v.nombreProyecto}</span>
                                            <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">V-{String(v.id).padStart(4, "0")}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                        {v.tipo ?? "—"}
                                        {v.nombreFase && ` · ${v.nombreFase}`}
                                        {v.descripcionTarea && ` · ${v.descripcionTarea}`}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{v.nombreAsignadoPor ?? "—"}</td>
                                    <td className="px-4 py-3 font-mono text-[12px] text-gray-900 dark:text-[#F9FAFB]">{v.fechaLimite ?? "—"}</td>
                                    <td className="px-4 py-3"><BadgeResultado resultado={v.resultado} /></td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            type="button"
                                            onClick={() => setSeleccionada(v)}
                                            className="rounded-lg border border-indigo-600 dark:border-[#465FFF] px-3 py-1 text-[12px] font-medium text-indigo-600 dark:text-[#465FFF] hover:bg-indigo-50 dark:hover:bg-[#465FFF]/10"
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

            {seleccionada && (
                <ModalDictamen
                    verificacion={seleccionada}
                    onCerrar={() => setSeleccionada(null)}
                    onGuardado={() => {
                        setSeleccionada(null);
                        cargarVerificaciones();
                    }}
                />
            )}
        </div>
    );
}

interface PropiedadesModalDictamen {
    verificacion: VerificacionViewModel;
    onCerrar: () => void;
    onGuardado: () => void;
}

function ModalDictamen({ verificacion, onCerrar, onGuardado }: PropiedadesModalDictamen) {

    const [resultado, setResultado] = useState<"Aprobado" | "Rechazado" | "Requiere Ajustes">("Aprobado");
    const [observaciones, setObservaciones] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");

    const requiereObservaciones = resultado !== "Aprobado";

    async function manejarGuardar() {
        if (requiereObservaciones && !observaciones.trim()) {
            setError("Las observaciones son obligatorias para Rechazado o Requiere Ajustes.");
            return;
        }
        setError("");
        setEnviando(true);
        try {
            const respuesta = await fetch(`${URL_VERIFICACIONES}/${verificacion.id}/resultado`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resultado, observaciones: observaciones || null }),
            });
            if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`);
            onGuardado();
        } catch {
            setError("No fue posible registrar el dictamen. Intenta nuevamente.");
        } finally {
            setEnviando(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-[440px] rounded-xl border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#171F2F] shadow-xl">

                <div className="border-b border-gray-100 dark:border-[#1D2939] px-5 py-4">
                    <h2 className="text-[18px] font-semibold text-gray-900 dark:text-[#F9FAFB]">Dictamen de verificación</h2>
                    <p className="mt-1 font-mono text-[11.5px] text-gray-500 dark:text-gray-400">
                        V-{String(verificacion.id).padStart(4, "0")} · {verificacion.nombreProyecto}
                    </p>
                </div>

                <div className="flex flex-col gap-4 px-5 py-5">

                    {error && (
                        <p className="rounded-lg border border-red-200 bg-red-50 dark:border-[#382430] dark:bg-[#382430] px-3 py-2 text-[12px] text-red-700 dark:text-[#F04438]">
                            {error}
                        </p>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <span className="text-[12.5px] font-medium text-gray-700 dark:text-gray-300">Resultado</span>
                        <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-gray-200 dark:border-[#1D2939]">
                            {(["Aprobado", "Rechazado", "Requiere Ajustes"] as const).map((opcion, i) => (
                                <button
                                    key={opcion}
                                    type="button"
                                    onClick={() => setResultado(opcion)}
                                    className={`py-2 text-[12px] font-medium transition-colors duration-150 ${
                                        i < 2 ? "border-r border-gray-200 dark:border-[#1D2939]" : ""
                                    } ${
                                        resultado === opcion
                                            ? "bg-indigo-50 text-indigo-700 dark:bg-[#1D2939] dark:text-[#F9FAFB]"
                                            : "bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1D2939]/50"
                                    }`}
                                >
                                    {opcion}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <span className="flex items-center gap-1 text-[12.5px] font-medium text-gray-700 dark:text-gray-300">
                            Observaciones
                            {requiereObservaciones && <span className="text-red-600 dark:text-[#F04438]">*</span>}
                        </span>
                        <textarea
                            className="h-24 w-full resize-none rounded-lg border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#101828] px-3 py-2 text-[13px] text-gray-900 dark:text-[#F9FAFB] outline-none placeholder:text-gray-400 focus:border-indigo-600 dark:focus:border-[#465FFF]"
                            placeholder="Detalle el resultado de la verificación…"
                            disabled={enviando}
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-gray-100 dark:border-[#1D2939] px-5 py-4">
                    <button
                        type="button"
                        onClick={onCerrar}
                        disabled={enviando}
                        className="h-9 rounded-lg border border-gray-200 dark:border-[#1D2939] px-4 text-[12.5px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1D2939]"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={manejarGuardar}
                        disabled={enviando}
                        className="h-9 rounded-lg bg-indigo-600 dark:bg-[#465FFF] px-4 text-[12.5px] font-semibold text-white hover:bg-indigo-700 dark:hover:bg-[#394DD1] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {enviando ? "Guardando…" : "Registrar dictamen"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Verificaciones;