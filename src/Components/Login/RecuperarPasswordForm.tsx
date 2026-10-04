import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react';
import { apiVerificarEmail, apiRestablecerPassword } from '../../api';

interface RecuperarPasswordFormProps {
    alIrALogin?: () => void;
}

type Paso = 'email' | 'nueva-password' | 'exito';

const EstiloInput = "w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg bg-white dark:bg-[#0D1523] border border-gray-200 dark:border-[#1D2939] focus:outline-none focus:ring-2 focus:ring-[#465FFF]/50 focus:border-[#465FFF] transition text-gray-900 dark:text-[#F9FAFB] placeholder-gray-400 dark:placeholder-[#4A5568] disabled:opacity-60";
const EstiloLabel = "block text-xs font-medium text-gray-700 dark:text-[#CBD5E0] mb-1.5";
const EstiloIconoInput = "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#4A5568] pointer-events-none";

export const RecuperarPasswordForm: React.FC<RecuperarPasswordFormProps> = ({ alIrALogin }) => {
    const [paso, setPaso] = useState<Paso>('email');
    const [emailVerificado, setEmailVerificado] = useState('');

    // Paso email
    const [email, setEmail] = useState('');

    // Paso nueva contraseña
    const [nuevaPassword, setNuevaPassword] = useState('');
    const [confirmarPassword, setConfirmarPassword] = useState('');
    const [mostrarNueva, setMostrarNueva] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    // ─── Paso 1: Verificar email ───
    const manejarVerificarEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) { setError('Ingresa tu correo electrónico.'); return; }
        setError('');
        setCargando(true);
        try {
            await apiVerificarEmail(email.trim());
            setEmailVerificado(email.trim());
            setPaso('nueva-password');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'No fue posible verificar el correo.');
        } finally {
            setCargando(false);
        }
    };

    // ─── Paso 2: Establecer nueva contraseña ───
    const manejarNuevaPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (nuevaPassword.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
        if (nuevaPassword !== confirmarPassword) { setError('Las contraseñas no coinciden.'); return; }
        setError('');
        setCargando(true);
        try {
            await apiRestablecerPassword(emailVerificado, nuevaPassword);
            setPaso('exito');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'No fue posible restablecer la contraseña.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="w-full">

            {/* ─── PASO: email ─── */}
            {paso === 'email' && (
                <>
                    <div className="mb-6">
                        <div className="w-12 h-12 rounded-xl bg-[#465FFF]/10 dark:bg-[#465FFF]/15 flex items-center justify-center mb-4">
                            <KeyRound size={22} className="text-[#465FFF]" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-[#F9FAFB] mb-1">
                            Recuperar contraseña
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-[#98A2B3] leading-relaxed">
                            Ingresa el correo de tu cuenta y te guiaremos para establecer una nueva contraseña.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 dark:bg-[#2D1B1B] dark:border-[#F04438]/30 dark:text-[#F04438] text-xs rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={manejarVerificarEmail} className="space-y-4">
                        <div>
                            <label className={EstiloLabel}>Correo electrónico</label>
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
                                    autoFocus
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={cargando}
                            className="w-full mt-2 bg-[#465FFF] hover:bg-[#394DD1] text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {cargando ? (
                                <><Loader2 className="animate-spin" size={15} /><span>Verificando…</span></>
                            ) : (
                                <><span>Verificar correo</span><ArrowRight size={15} /></>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={alIrALogin}
                            className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-[#98A2B3] hover:text-gray-900 dark:hover:text-[#F9FAFB] transition-colors mt-1"
                        >
                            <ArrowLeft size={13} />
                            Volver a iniciar sesión
                        </button>
                    </form>
                </>
            )}

            {/* ─── PASO: nueva-password ─── */}
            {paso === 'nueva-password' && (
                <>
                    <div className="mb-6">
                        <div className="w-12 h-12 rounded-xl bg-amber-400/10 dark:bg-amber-400/15 flex items-center justify-center mb-4">
                            <Lock size={22} className="text-amber-500" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-[#F9FAFB] mb-1">
                            Nueva contraseña
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-[#98A2B3]">
                            Cuenta verificada:{' '}
                            <span className="font-medium text-gray-700 dark:text-[#CBD5E0]">{emailVerificado}</span>
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 dark:bg-[#2D1B1B] dark:border-[#F04438]/30 dark:text-[#F04438] text-xs rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={manejarNuevaPassword} className="space-y-4">
                        <div>
                            <label className={EstiloLabel}>Nueva contraseña * (mín. 6 caracteres)</label>
                            <div className="relative">
                                <Lock size={14} className={EstiloIconoInput} />
                                <input
                                    type={mostrarNueva ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={nuevaPassword}
                                    onChange={e => setNuevaPassword(e.target.value)}
                                    disabled={cargando}
                                    className={`${EstiloInput} pr-10`}
                                    required
                                    autoFocus
                                />
                                <button type="button" tabIndex={-1} onClick={() => setMostrarNueva(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-[#F9FAFB] transition-colors">
                                    {mostrarNueva ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                            {nuevaPassword.length > 0 && (
                                <div className="mt-1.5 flex gap-1">
                                    {[1, 2, 3, 4].map(n => (
                                        <div key={n} className={`h-1 flex-1 rounded-full transition-colors ${nuevaPassword.length >= n * 3 ? n <= 2 ? 'bg-amber-400' : n === 3 ? 'bg-green-400' : 'bg-emerald-500' : 'bg-gray-200 dark:bg-[#1D2939]'}`} />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className={EstiloLabel}>Confirmar nueva contraseña *</label>
                            <div className="relative">
                                <Lock size={14} className={EstiloIconoInput} />
                                <input
                                    type={mostrarConfirmar ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={confirmarPassword}
                                    onChange={e => setConfirmarPassword(e.target.value)}
                                    disabled={cargando}
                                    className={`${EstiloInput} pr-10 ${confirmarPassword && confirmarPassword !== nuevaPassword ? 'border-red-400 dark:border-[#F04438]' : ''}`}
                                    required
                                />
                                <button type="button" tabIndex={-1} onClick={() => setMostrarConfirmar(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-[#F9FAFB] transition-colors">
                                    {mostrarConfirmar ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                            {confirmarPassword && confirmarPassword !== nuevaPassword && (
                                <p className="mt-1 text-[11px] text-red-500 dark:text-[#F04438]">Las contraseñas no coinciden</p>
                            )}
                        </div>

                        <div className="flex gap-2.5 pt-1">
                            <button
                                type="button"
                                onClick={() => { setPaso('email'); setError(''); setNuevaPassword(''); setConfirmarPassword(''); }}
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
                                    <><Loader2 className="animate-spin" size={15} /><span>Guardando…</span></>
                                ) : (
                                    <><span>Guardar contraseña</span><ArrowRight size={15} /></>
                                )}
                            </button>
                        </div>
                    </form>
                </>
            )}

            {/* ─── PASO: éxito ─── */}
            {paso === 'exito' && (
                <div className="flex flex-col items-center text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center mb-5">
                        <CheckCircle2 size={32} className="text-emerald-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-[#F9FAFB] mb-2">
                        ¡Contraseña actualizada!
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-[#98A2B3] mb-8 max-w-xs leading-relaxed">
                        Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
                    </p>
                    <button
                        type="button"
                        onClick={alIrALogin}
                        className="w-full max-w-xs bg-[#465FFF] hover:bg-[#394DD1] text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer"
                    >
                        <span>Iniciar sesión</span>
                        <ArrowRight size={15} />
                    </button>
                </div>
            )}
        </div>
    );
};
