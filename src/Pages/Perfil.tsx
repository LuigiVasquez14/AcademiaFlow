import { useEffect, useState } from "react";
import type { UsuarioViewModel } from "../Types/Usuario";

const URL_USUARIOS = "https://localhost:7045/api/Usuario";

const EstiloEntrada = "h-10 w-full rounded-lg border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#101828] px-3 text-[13.5px] text-gray-900 dark:text-[#F9FAFB] outline-none placeholder:text-gray-400 focus:border-indigo-600 dark:focus:border-[#465FFF] disabled:opacity-60 transition-colors duration-150";
const EstiloEtiqueta = "text-[13px] font-medium text-gray-700 dark:text-gray-300";
const EstiloBoton = "h-10 rounded-lg bg-indigo-600 dark:bg-[#465FFF] px-5 text-[13.5px] font-medium text-white transition-colors duration-150 hover:bg-indigo-700 dark:hover:bg-[#394DD1] disabled:cursor-not-allowed disabled:opacity-60";

interface PropiedadesPerfil {
    // Id del usuario autenticado. Como el login todavía no está conectado
    // al backend, quien use este componente debe pasar el id real.
    idUsuario: number;
}

export function Perfil({ idUsuario }: PropiedadesPerfil) {

    const [usuario, setUsuario] = useState<UsuarioViewModel | null>(null);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");
    const [mensajeExito, setMensajeExito] = useState("");

    const [telefono, setTelefono] = useState("");
    const [cargo, setCargo] = useState("");

    useEffect(() => {
        cargarUsuario();
    }, [idUsuario]);

    async function cargarUsuario() {
        setCargando(true);
        setError("");
        try {
            const respuesta = await fetch(`${URL_USUARIOS}/${idUsuario}`);
            if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`);
            const datos: UsuarioViewModel = await respuesta.json();
            setUsuario(datos);
            setTelefono(datos.telefono ?? "");
            setCargo(datos.cargo ?? "");
        } catch {
            setError("No fue posible cargar el perfil. Verifica que la API esté corriendo.");
        } finally {
            setCargando(false);
        }
    }

    async function manejarGuardar() {
        if (!usuario) return;
        setGuardando(true);
        setError("");
        setMensajeExito("");
        try {
            const respuesta = await fetch(`${URL_USUARIOS}/${idUsuario}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...usuario, telefono, cargo }),
            });
            if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`);
            setMensajeExito("Perfil actualizado.");
            cargarUsuario();
        } catch {
            setError("No fue posible guardar los cambios.");
        } finally {
            setGuardando(false);
        }
    }

    if (cargando) {
        return <div className="p-8 text-center text-[13px] text-gray-500 dark:text-gray-400">Cargando perfil…</div>;
    }

    if (error && !usuario) {
        return (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
                <p className="text-[13px] text-red-600 dark:text-[#F04438]">{error}</p>
                <button onClick={cargarUsuario} className="rounded-lg border border-gray-200 dark:border-[#1D2939] px-3 py-1.5 text-[12.5px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1D2939]">
                    Reintentar
                </button>
            </div>
        );
    }

    if (!usuario) return null;

    return (
        <div className="mx-auto flex w-full max-w-[560px] flex-col gap-5 p-8">

            <div>
                <h1 className="text-[26px] font-bold text-gray-900 dark:text-[#F9FAFB]">Mi perfil</h1>
                <p className="mt-1 text-[13px] text-gray-500 dark:text-gray-400">
                    {usuario.nombreInstitucion ?? "Sin institución"}
                    {usuario.nombreUnidadAcademica ? ` · ${usuario.nombreUnidadAcademica}` : ""}
                </p>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#171F2F] shadow-sm p-6">

                {error && (
                    <p className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:border-[#382430] dark:bg-[#382430] px-3 py-2 text-[12px] text-red-700 dark:text-[#F04438]">{error}</p>
                )}
                {mensajeExito && (
                    <p className="mb-4 rounded-lg border border-green-200 bg-green-50 dark:border-[#173538] dark:bg-[#173538] px-3 py-2 text-[12px] text-green-700 dark:text-[#12B76A]">{mensajeExito}</p>
                )}

                <div className="mb-4 grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <span className={EstiloEtiqueta}>Nombres</span>
                        <input className={EstiloEntrada} value={usuario.nombres} disabled />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <span className={EstiloEtiqueta}>Apellidos</span>
                        <input className={EstiloEntrada} value={usuario.apellidos} disabled />
                    </div>
                </div>

                <div className="mb-4 flex flex-col gap-1.5">
                    <span className={EstiloEtiqueta}>Correo</span>
                    <input className={EstiloEntrada} value={usuario.email} disabled />
                </div>

                <div className="mb-4 grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="telefonoPerfil" className={EstiloEtiqueta}>Teléfono</label>
                        <input
                            id="telefonoPerfil"
                            className={EstiloEntrada}
                            disabled={guardando}
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="cargoPerfil" className={EstiloEtiqueta}>Cargo</label>
                        <input
                            id="cargoPerfil"
                            className={EstiloEntrada}
                            disabled={guardando}
                            value={cargo}
                            onChange={(e) => setCargo(e.target.value)}
                        />
                    </div>
                </div>

                <button onClick={manejarGuardar} disabled={guardando} className={EstiloBoton}>
                    {guardando ? "Guardando…" : "Guardar cambios"}
                </button>
            </div>
        </div>
    );
}

export default Perfil;