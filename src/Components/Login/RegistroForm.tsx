import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, ArrowRight, User, Mail, Lock, Phone, Briefcase, CreditCard, ChevronRight } from 'lucide-react';
import { apiRegistro } from '../../api';
import type { LoginResponseDto } from '../../api';

interface RegistroFormProps {
    alRegistroExitoso?: (respuesta: LoginResponseDto) => Promise<void>;
    alIrALogin?: () => void;
}

const EstiloInput = "w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg bg-white dark:bg-[#0D1523] border border-gray-200 dark:border-[#1D2939] focus:outline-none focus:ring-2 focus:ring-[#465FFF]/50 focus:border-[#465FFF] transition text-gray-900 dark:text-[#F9FAFB] placeholder-gray-400 dark:placeholder-[#4A5568] disabled:opacity-60";
const EstiloLabel = "block text-xs font-medium text-gray-700 dark:text-[#CBD5E0] mb-1.5";
const EstiloIconoInput = "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#4A5568] pointer-events-none";

type Paso = 1 | 2;

export const RegistroForm: React.FC<RegistroFormProps> = ({ alRegistroExitoso, alIrALogin }) => {
    const [paso, setPaso] = useState<Paso>(1);

    // Paso 1
    const [nombres, setNombres] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [tipoDocumento, setTipoDocumento] = useState('CC');
    const [numeroDocumento, setNumeroDocumento] = useState('');
    const [telefono, setTelefono] = useState('');
    const [cargo, setCargo] = useState('');

    // Paso 2
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmarPassword, setConfirmarPassword] = useState('');
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    const [aceptaTerminos, setAceptaTerminos] = useState(false);

    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    const validarPaso1 = () => {
        if (!nombres.trim()) return 'El nombre es requerido.';
        if (!apellidos.trim()) return 'El apellido es requerido.';
        return null;
    };

    const irAlPaso2 = (e: React.FormEvent) => {
        e.preventDefault();
        const err = validarPaso1();
        if (err) { setError(err); return; }
        setError('');
        setPaso(2);
    };

    const manejarRegistro = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) { setError('El correo es requerido.'); return; }
        if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
        if (password !== confirmarPassword) { setError('Las contraseñas no coinciden.'); return; }
        if (!aceptaTerminos) { setError('Debes aceptar los términos y condiciones.'); return; }

        setError('');
        setCargando(true);
        try {
            const respuesta = await apiRegistro({
                nombres: nombres.trim(),
                apellidos: apellidos.trim(),
                tipoDocumento,
                numeroDocumento: numeroDocumento.trim() || undefined,
                email: email.trim(),
                password,
                telefono: telefono.trim() || undefined,
                cargo: cargo.trim() || undefined,
            });
            if (alRegistroExitoso) await alRegistroExitoso(respuesta);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'No fue posible crear la cuenta. Intenta nuevamente.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="w-full">
            {/* Encabezado */}
            <div className="mb-5">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-[#F9FAFB] mb-1">
                    Crear cuenta
                </h1>
                <p className="text-xs text-gray-500 dark:text-[#98A2B3]">
                    ¿Ya tienes cuenta?{' '}
                    <button
                        type="button"
                        onClick={alIrALogin}
                        className="text-[#465FFF] font-semibold hover:underline transition-colors"
                    >
                        Inicia sesión aquí.
                    </button>
                </p>
            </div>

            {/* Indicador de paso */}
            <div className="flex items-center gap-2 mb-5">
                {[1, 2].map((n) => (
                    <React.Fragment key={n}>
                        <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${paso >= n ? 'text-[#465FFF]' : 'text-gray-400 dark:text-[#4A5568]'}`}>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${paso >= n ? 'bg-[#465FFF] border-[#465FFF] text-white' : 'border-gray-300 dark:border-[#1D2939] text-gray-400'}`}>
                                {n}
                            </div>
                            {n === 1 ? 'Datos personales' : 'Acceso'}
                        </div>
                        {n < 2 && <ChevronRight size={13} className="text-gray-300 dark:text-[#1D2939]" />}
                    </React.Fragment>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 dark:bg-[#2D1B1B] dark:border-[#F04438]/30 dark:text-[#F04438] text-xs rounded-lg">
                    {error}
                </div>
            )}

            {/* ─── PASO 1: Datos personales ─── */}
            {paso === 1 && (
                <form onSubmit={irAlPaso2} className="space-y-4">
                    {/* Nombres + Apellidos */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={EstiloLabel}>Nombres *</label>
                            <div className="relative">
                                <User size={14} className={EstiloIconoInput} />
                                <input
                                    type="text"
                                    placeholder="Luis Fernando"
                                    value={nombres}
                                    onChange={e => setNombres(e.target.value)}
                                    className={EstiloInput}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className={EstiloLabel}>Apellidos *</label>
                            <div className="relative">
                                <User size={14} className={EstiloIconoInput} />
                                <input
                                    type="text"
                                    placeholder="Vásquez Torres"
                                    value={apellidos}
                                    onChange={e => setApellidos(e.target.value)}
                                    className={EstiloInput}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tipo + Número de documento */}
                    <div className="grid grid-cols-[120px_1fr] gap-3">
                        <div>
                            <label className={EstiloLabel}>Tipo doc.</label>
                            <select
                                value={tipoDocumento}
                                onChange={e => setTipoDocumento(e.target.value)}
                                className={`${EstiloInput} pl-3.5`}
                            >
                                <option value="CC">CC</option>
                                <option value="CE">CE</option>
                                <option value="PAS">PAS</option>
                                <option value="TI">TI</option>
                            </select>
                        </div>
                        <div>
                            <label className={EstiloLabel}>Número de documento</label>
                            <div className="relative">
                                <CreditCard size={14} className={EstiloIconoInput} />
                                <input
                                    type="text"
                                    placeholder="1143000000"
                                    value={numeroDocumento}
                                    onChange={e => setNumeroDocumento(e.target.value)}
                                    className={EstiloInput}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Teléfono + Cargo */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={EstiloLabel}>Teléfono</label>
                            <div className="relative">
                                <Phone size={14} className={EstiloIconoInput} />
                                <input
                                    type="tel"
                                    placeholder="+57 300 000 0000"
                                    value={telefono}
                                    onChange={e => setTelefono(e.target.value)}
                                    className={EstiloInput}
                                />
                            </div>
                        </div>
                        <div>
                            <label className={EstiloLabel}>Cargo / Rol</label>
                            <div className="relative">
                                <Briefcase size={14} className={EstiloIconoInput} />
                                <input
                                    type="text"
                                    placeholder="Investigador, Docente…"
                                    value={cargo}
                                    onChange={e => setCargo(e.target.value)}
                                    className={EstiloInput}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-2 bg-[#465FFF] hover:bg-[#394DD1] text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer"
                    >
                        Continuar
                        <ArrowRight size={16} />
                    </button>
                </form>
            )}

            {/* ─── PASO 2: Credenciales ─── */}
            {paso === 2 && (
                <form onSubmit={manejarRegistro} className="space-y-4">
                    {/* Email */}
                    <div>
                        <label className={EstiloLabel}>Correo electrónico *</label>
                        <div className="relative">
                            <Mail size={14} className={EstiloIconoInput} />
                            <input
                                type="email"
                                placeholder="usuario@universidad.edu.co"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                disabled={cargando}
                                className={EstiloInput}
                                required
                            />
                        </div>
                    </div>

                    {/* Contraseña */}
                    <div>
                        <label className={EstiloLabel}>Contraseña * (mín. 6 caracteres)</label>
                        <div className="relative">
                            <Lock size={14} className={EstiloIconoInput} />
                            <input
                                type={mostrarPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                disabled={cargando}
                                className={`${EstiloInput} pr-10`}
                                required
                            />
                            <button type="button" tabIndex={-1} onClick={() => setMostrarPassword(p => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-[#F9FAFB] transition-colors">
                                {mostrarPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        {/* Fuerza de contraseña */}
                        {password.length > 0 && (
                            <div className="mt-1.5 flex gap-1">
                                {[1, 2, 3, 4].map(n => (
                                    <div key={n} className={`h-1 flex-1 rounded-full transition-colors ${password.length >= n * 3 ? n <= 2 ? 'bg-amber-400' : n === 3 ? 'bg-green-400' : 'bg-emerald-500' : 'bg-gray-200 dark:bg-[#1D2939]'}`} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Confirmar contraseña */}
                    <div>
                        <label className={EstiloLabel}>Confirmar contraseña *</label>
                        <div className="relative">
                            <Lock size={14} className={EstiloIconoInput} />
                            <input
                                type={mostrarConfirmar ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={confirmarPassword}
                                onChange={e => setConfirmarPassword(e.target.value)}
                                disabled={cargando}
                                className={`${EstiloInput} pr-10 ${confirmarPassword && confirmarPassword !== password ? 'border-red-400 dark:border-[#F04438]' : ''}`}
                                required
                            />
                            <button type="button" tabIndex={-1} onClick={() => setMostrarConfirmar(p => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-[#F9FAFB] transition-colors">
                                {mostrarConfirmar ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        {confirmarPassword && confirmarPassword !== password && (
                            <p className="mt-1 text-[11px] text-red-500 dark:text-[#F04438]">Las contraseñas no coinciden</p>
                        )}
                    </div>

                    {/* Términos */}
                    <div className="flex items-start gap-2 pt-1">
                        <input
                            id="terminos"
                            type="checkbox"
                            checked={aceptaTerminos}
                            onChange={e => setAceptaTerminos(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded text-[#465FFF] accent-[#465FFF] cursor-pointer"
                        />
                        <label htmlFor="terminos" className="text-xs text-gray-600 dark:text-[#98A2B3] cursor-pointer leading-relaxed">
                            Acepto los{' '}
                            <span className="text-[#465FFF] font-medium hover:underline cursor-pointer">términos de uso</span>
                            {' '}y la{' '}
                            <span className="text-[#465FFF] font-medium hover:underline cursor-pointer">política de privacidad</span>
                        </label>
                    </div>

                    <div className="flex gap-2.5 pt-1">
                        <button
                            type="button"
                            onClick={() => { setPaso(1); setError(''); }}
                            disabled={cargando}
                            className="flex-1 py-2.5 px-4 border border-gray-200 dark:border-[#1D2939] text-gray-700 dark:text-[#F9FAFB] rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#1D2939] transition-colors disabled:opacity-50"
                        >
                            Atrás
                        </button>
                        <button
                            type="submit"
                            disabled={cargando}
                            className="flex-1 bg-[#465FFF] hover:bg-[#394DD1] text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {cargando ? (
                                <><Loader2 className="animate-spin" size={15} /><span>Creando…</span></>
                            ) : (
                                <><span>Crear cuenta</span><ArrowRight size={15} /></>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};
