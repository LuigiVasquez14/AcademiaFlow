import { useEffect, useState } from "react";
import type { UsuarioViewModel } from "../Types/Usuario";
import { apiObtenerUsuario, apiActualizarUsuario, apiRestablecerPassword } from "../api";
import { 
    User, 
    Mail, 
    Phone, 
    Briefcase, 
    Lock, 
    Check, 
    AlertCircle, 
    KeyRound, 
    Eye, 
    EyeOff,
    Building2,
    Calendar,
    Save
} from "lucide-react";

interface PropiedadesPerfil {
    idUsuario: number;
    alVolver?: () => void;
}

const EstiloEntrada = "h-10 w-full rounded-lg border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#101828] px-3 text-[13.5px] text-gray-900 dark:text-[#F9FAFB] outline-none placeholder:text-gray-400 focus:border-indigo-600 dark:focus:border-[#465FFF] disabled:opacity-60 transition-colors duration-150";
const EstiloEtiqueta = "text-[12.5px] font-medium text-gray-700 dark:text-gray-300";

export function Perfil({ idUsuario, alVolver }: PropiedadesPerfil) {
    const [usuario, setUsuario] = useState<UsuarioViewModel | null>(null);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");
    const [mensajeExito, setMensajeExito] = useState("");

    // Campos editables
    const [nombres, setNombres] = useState("");
    const [apellidos, setApellidos] = useState("");
    const [tipoDocumento, setTipoDocumento] = useState("CC");
    const [numeroDocumento, setNumeroDocumento] = useState("");
    const [telefono, setTelefono] = useState("");
    const [cargo, setCargo] = useState("");

    // Cambio de contraseña
    const [mostrarCambioPassword, setMostrarCambioPassword] = useState(false);
    const [nuevaPassword, setNuevaPassword] = useState("");
    const [confirmarPassword, setConfirmarPassword] = useState("");
    const [mostrarPass, setMostrarPass] = useState(false);
    const [guardandoPass, setGuardandoPass] = useState(false);

    useEffect(() => {
        cargarUsuario();
    }, [idUsuario]);

    async function cargarUsuario() {
        if (!idUsuario) {
            // Usuario invitado o ID 0
            setUsuario({
                id: 0,
                nombres: "Usuario",
                apellidos: "Invitado",
                nombreCompleto: "Usuario Invitado",
                email: "invitado@academiaflow.edu",
                cargo: "Investigador Visitante",
                telefono: "300 000 0000",
                tipoDocumento: "CC",
                numeroDocumento: "1000000000",
                nombreInstitucion: "Universidad Nacional",
                activo: true,
            });
            setNombres("Usuario");
            setApellidos("Invitado");
            setTelefono("300 000 0000");
            setCargo("Investigador Visitante");
            setCargando(false);
            return;
        }

        setCargando(true);
        setError("");
        try {
            const datos = await apiObtenerUsuario(idUsuario);
            setUsuario(datos);
            setNombres(datos.nombres || "");
            setApellidos(datos.apellidos || "");
            setTipoDocumento(datos.tipoDocumento || "CC");
            setNumeroDocumento(datos.numeroDocumento || "");
            setTelefono(datos.telefono || "");
            setCargo(datos.cargo || "");
        } catch {
            setError("No fue posible cargar el perfil. Verifica la conexión.");
        } finally {
            setCargando(false);
        }
    }

    async function manejarGuardarPerfil(e: React.FormEvent) {
        e.preventDefault();
        if (!usuario) return;

        setGuardando(true);
        setError("");
        setMensajeExito("");

        try {
            if (usuario.id > 0) {
                await apiActualizarUsuario(usuario.id, {
                    ...usuario,
                    nombres: nombres.trim(),
                    apellidos: apellidos.trim(),
                    nombreCompleto: `${nombres.trim()} ${apellidos.trim()}`,
                    tipoDocumento,
                    numeroDocumento: numeroDocumento.trim(),
                    telefono: telefono.trim(),
                    cargo: cargo.trim(),
                });
            }

            setMensajeExito("¡Perfil actualizado correctamente!");
            setTimeout(() => setMensajeExito(""), 4000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al guardar el perfil.");
        } finally {
            setGuardando(false);
        }
    }

    async function manejarCambiarPassword(e: React.FormEvent) {
        e.preventDefault();
        if (!nuevaPassword) {
            setError("Ingresa una nueva contraseña.");
            return;
        }
        if (nuevaPassword.length < 6) {
            setError("La contraseña debe tener mínimo 6 caracteres.");
            return;
        }
        if (nuevaPassword !== confirmarPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setGuardandoPass(true);
        setError("");
        setMensajeExito("");

        try {
            if (usuario?.email) {
                await apiRestablecerPassword(usuario.email, nuevaPassword);
                setMensajeExito("¡Contraseña actualizada con éxito!");
                setNuevaPassword("");
                setConfirmarPassword("");
                setMostrarCambioPassword(false);
                setTimeout(() => setMensajeExito(""), 4000);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al cambiar contraseña.");
        } finally {
            setGuardandoPass(false);
        }
    }

    if (cargando) {
        return (
            <div className="flex h-full w-full items-center justify-center p-8 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent dark:border-[#465FFF]" />
                    <span>Cargando datos del perfil…</span>
                </div>
            </div>
        );
    }

    const iniciales = usuario?.nombreCompleto
        ? usuario.nombreCompleto
            .split(" ")
            .filter(Boolean)
            .map((p) => p[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
        : "US";

    return (
        <div className="flex h-full w-full flex-col gap-6 overflow-y-auto bg-slate-50 dark:bg-[#0D1523] p-8 text-gray-900 dark:text-[#F9FAFB] transition-colors duration-300">
            {/* Cabecera */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-[#F9FAFB]">
                        Mi Perfil Académico
                    </h1>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Administra tu información de investigador, credenciales y datos de contacto.
                    </p>
                </div>
                {alVolver && (
                    <button
                        type="button"
                        onClick={alVolver}
                        className="rounded-lg border border-gray-200 dark:border-[#1D2939] px-3.5 py-1.5 text-xs font-medium hover:bg-gray-100 dark:hover:bg-[#1A263D] transition"
                    >
                        Volver
                    </button>
                )}
            </div>

            {/* Alertas */}
            {mensajeExito && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 p-4 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    <Check size={16} />
                    <span>{mensajeExito}</span>
                </div>
            )}
            {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 p-4 text-xs font-semibold text-red-700 dark:text-red-300">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Tarjeta Lateral de Avatar y Resumen */}
                <div className="rounded-2xl border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#131D30] p-6 shadow-xs flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg mb-4">
                        {iniciales}
                    </div>

                    <h2 className="text-lg font-bold text-gray-900 dark:text-[#F9FAFB]">
                        {usuario?.nombreCompleto || `${nombres} ${apellidos}`}
                    </h2>
                    <span className="inline-block mt-1 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-[#465FFF] border border-indigo-200 dark:border-indigo-900/40 text-xs font-semibold">
                        {cargo || usuario?.cargo || "Investigador"}
                    </span>

                    <div className="w-full mt-6 pt-6 border-t border-gray-100 dark:border-[#1E2B45] text-left space-y-3 text-xs">
                        <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-400">
                            <Mail size={15} className="text-gray-400" />
                            <span className="truncate">{usuario?.email}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-400">
                            <Building2 size={15} className="text-gray-400" />
                            <span>{usuario?.nombreInstitucion || "Universidad Nacional"}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-400">
                            <Calendar size={15} className="text-gray-400" />
                            <span>Cuenta activa en plataforma</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setMostrarCambioPassword(!mostrarCambioPassword)}
                        className="w-full mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-950/40 py-2.5 text-xs font-semibold text-indigo-700 dark:text-[#465FFF] hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition cursor-pointer"
                    >
                        <KeyRound size={15} />
                        <span>{mostrarCambioPassword ? "Cancelar cambio de clave" : "Cambiar contraseña"}</span>
                    </button>
                </div>

                {/* Formulario Principal de Información Personal */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={manejarGuardarPerfil} className="rounded-2xl border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#131D30] p-6 shadow-xs space-y-5">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#1E2B45]">
                            <div className="flex items-center gap-2 text-indigo-600 dark:text-[#465FFF]">
                                <User size={18} />
                                <h3 className="font-bold text-sm text-gray-900 dark:text-[#F9FAFB]">
                                    Datos Personales e Institucionales
                                </h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={EstiloEtiqueta}>Nombres</label>
                                <input
                                    type="text"
                                    value={nombres}
                                    onChange={(e) => setNombres(e.target.value)}
                                    required
                                    className={`${EstiloEntrada} mt-1`}
                                />
                            </div>

                            <div>
                                <label className={EstiloEtiqueta}>Apellidos</label>
                                <input
                                    type="text"
                                    value={apellidos}
                                    onChange={(e) => setApellidos(e.target.value)}
                                    required
                                    className={`${EstiloEntrada} mt-1`}
                                />
                            </div>

                            <div>
                                <label className={EstiloEtiqueta}>Tipo de Documento</label>
                                <select
                                    value={tipoDocumento}
                                    onChange={(e) => setTipoDocumento(e.target.value)}
                                    className={`${EstiloEntrada} mt-1`}
                                >
                                    <option value="CC">Cédula de Ciudadanía (CC)</option>
                                    <option value="CE">Cédula de Extranjería (CE)</option>
                                    <option value="TI">Tarjeta de Identidad (TI)</option>
                                    <option value="PAS">Pasaporte (PAS)</option>
                                </select>
                            </div>

                            <div>
                                <label className={EstiloEtiqueta}>Número de Documento</label>
                                <input
                                    type="text"
                                    value={numeroDocumento}
                                    onChange={(e) => setNumeroDocumento(e.target.value)}
                                    className={`${EstiloEntrada} mt-1 font-mono`}
                                />
                            </div>

                            <div>
                                <label className={EstiloEtiqueta}>Teléfono / Celular</label>
                                <input
                                    type="tel"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    placeholder="300 123 4567"
                                    className={`${EstiloEntrada} mt-1`}
                                />
                            </div>

                            <div>
                                <label className={EstiloEtiqueta}>Cargo o Rol Académico</label>
                                <input
                                    type="text"
                                    value={cargo}
                                    onChange={(e) => setCargo(e.target.value)}
                                    placeholder="Líder de Investigación, Docente..."
                                    className={`${EstiloEntrada} mt-1`}
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className={EstiloEtiqueta}>Correo Electrónico (No editable)</label>
                                <input
                                    type="email"
                                    value={usuario?.email || ""}
                                    disabled
                                    className={`${EstiloEntrada} mt-1 bg-gray-100 dark:bg-[#1E2B45] text-gray-500`}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-3">
                            <button
                                type="submit"
                                disabled={guardando}
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 dark:bg-[#465FFF] dark:hover:bg-[#394DD1] transition shadow-xs disabled:opacity-50 cursor-pointer"
                            >
                                <Save size={15} />
                                <span>{guardando ? "Guardando cambios..." : "Guardar Información"}</span>
                            </button>
                        </div>
                    </form>

                    {/* Formulario Secundario: Cambio de Contraseña */}
                    {mostrarCambioPassword && (
                        <form onSubmit={manejarCambiarPassword} className="rounded-2xl border border-indigo-200 dark:border-[#465FFF]/30 bg-white dark:bg-[#131D30] p-6 shadow-xs space-y-4">
                            <div className="flex items-center gap-2 text-indigo-600 dark:text-[#465FFF] pb-3 border-b border-gray-100 dark:border-[#1E2B45]">
                                <Lock size={18} />
                                <h3 className="font-bold text-sm text-gray-900 dark:text-[#F9FAFB]">
                                    Cambiar Contraseña de Acceso
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={EstiloEtiqueta}>Nueva Contraseña</label>
                                    <div className="relative mt-1">
                                        <input
                                            type={mostrarPass ? "text" : "password"}
                                            value={nuevaPassword}
                                            onChange={(e) => setNuevaPassword(e.target.value)}
                                            placeholder="Mínimo 6 caracteres"
                                            className={`${EstiloEntrada} pr-10`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setMostrarPass(!mostrarPass)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {mostrarPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className={EstiloEtiqueta}>Confirmar Contraseña</label>
                                    <input
                                        type={mostrarPass ? "text" : "password"}
                                        value={confirmarPassword}
                                        onChange={(e) => setConfirmarPassword(e.target.value)}
                                        placeholder="Repite la contraseña"
                                        className={`${EstiloEntrada} mt-1`}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setMostrarCambioPassword(false)}
                                    className="px-4 py-2 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={guardandoPass}
                                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 dark:bg-[#465FFF] transition disabled:opacity-50"
                                >
                                    {guardandoPass ? "Actualizando clave..." : "Actualizar Contraseña"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Perfil;