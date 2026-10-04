import { useState, useEffect } from 'react';
import { 
    Sun, 
    Moon, 
    Monitor, 
    Activity, 
    Server, 
    ShieldCheck, 
    Bell, 
    Globe, 
    Coins, 
    User, 
    RefreshCw, 
    Check, 
    Sliders,
    Layers,
    Database,
    AlertCircle
} from 'lucide-react';
import { apiPing, apiVerificarEstadoBaseDatos, type EstadoConexionBd, API_BASE } from '../api';
import type { UsuarioAutenticado } from '../Types/DatosInicioSesion';

interface ConfiguracionProps {
    usuario?: UsuarioAutenticado | null;
    alIrAPerfil?: () => void;
}

type Tema = 'claro' | 'oscuro' | 'sistema';

export function Configuracion({ usuario, alIrAPerfil }: ConfiguracionProps) {
    const [temaActual, setTemaActual] = useState<Tema>('sistema');
    const [moneda, setMoneda] = useState<'COP' | 'USD' | 'EUR'>('COP');
    const [idioma, setIdioma] = useState<'es' | 'en'>('es');
    const [notificacionesSonido, setNotificacionesSonido] = useState(true);
    const [autoGuardar, setAutoGuardar] = useState(true);
    const [densidad, setDensidad] = useState<'comoda' | 'compacta'>('comoda');

    // Estado del diagnóstico y conexión a PostgreSQL en Supabase
    const [estadoBd, setEstadoBd] = useState<EstadoConexionBd>({
        conectado: false,
        estado: 'comprobando',
        mensaje: 'Comprobando estado de Supabase...',
        latenciaMs: 0,
    });

    // Estado del ping a la API
    const [pingEstado, setPingEstado] = useState<{ probando: boolean; ok?: boolean; ms?: number; status?: number }>({
        probando: false,
    });
    const [mensajeExito, setMensajeExito] = useState('');

    useEffect(() => {
        // Detectar tema actual
        const esOscuro = document.documentElement.classList.contains('dark');
        const temaGuardado = localStorage.getItem('theme');
        if (temaGuardado === 'dark') setTemaActual('oscuro');
        else if (temaGuardado === 'light') setTemaActual('claro');
        else setTemaActual(esOscuro ? 'oscuro' : 'claro');

        // Ejecutar prueba de API y Base de Datos inicial
        probarConexionApi();
    }, []);

    const cambiarTema = (nuevoTema: Tema) => {
        setTemaActual(nuevoTema);
        if (nuevoTema === 'oscuro') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else if (nuevoTema === 'claro') {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            localStorage.removeItem('theme');
            const prefiereOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefiereOscuro) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
        mostrarToast('Tema visual actualizado');
    };

    const probarConexionApi = async () => {
        setPingEstado({ probando: true });
        setEstadoBd((prev) => ({
            ...prev,
            estado: 'comprobando',
            mensaje: 'Comprobando estado en Supabase...',
        }));

        const diagnostico = await apiVerificarEstadoBaseDatos();
        setEstadoBd(diagnostico);

        setPingEstado({
            probando: false,
            ok: diagnostico.conectado,
            ms: diagnostico.latenciaMs,
            status: diagnostico.conectado ? 200 : 503,
        });
    };

    const mostrarToast = (msg: string) => {
        setMensajeExito(msg);
        setTimeout(() => setMensajeExito(''), 3000);
    };

    return (
        <div className="flex h-full w-full flex-col gap-6 overflow-y-auto bg-slate-50 dark:bg-[#0D1523] p-8 text-gray-900 dark:text-[#F9FAFB] transition-colors duration-300">
            {/* Cabecera */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-[#F9FAFB]">
                        Configuración del Sistema
                    </h1>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Ajusta la apariencia visual, preferencias regionales y verifica la conexión al backend.
                    </p>
                </div>

                {mensajeExito && (
                    <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        <Check size={14} />
                        <span>{mensajeExito}</span>
                    </div>
                )}
            </div>

            {/* SECCIÓN 1: TEMA Y APARIENCIA (Modo Oscuro / Claro) */}
            <div className="rounded-2xl border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#131D30] p-6 shadow-xs">
                <div className="flex items-center gap-2.5 mb-1 text-indigo-600 dark:text-[#465FFF]">
                    <Sun size={18} />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-[#F9FAFB]">
                        Apariencia y Tema Visual
                    </h2>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                    Elige entre modo claro, modo oscuro o sincronización con las preferencias del sistema.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Tarjeta Modo Claro */}
                    <button
                        type="button"
                        onClick={() => cambiarTema('claro')}
                        className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all cursor-pointer text-center ${
                            temaActual === 'claro'
                                ? 'border-indigo-600 dark:border-[#465FFF] bg-indigo-50/40 dark:bg-[#1A263D] shadow-sm'
                                : 'border-gray-200 dark:border-[#1E2B45] hover:border-gray-300 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-[#0D1523]/50'
                        }`}
                    >
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shadow-xs">
                            <Sun size={24} />
                        </div>
                        <div>
                            <span className="font-semibold text-sm block text-gray-900 dark:text-[#F9FAFB]">
                                Modo Claro
                            </span>
                            <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                Fondos limpios y contraste diurno
                            </span>
                        </div>
                        {temaActual === 'claro' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5">
                                <Check size={10} /> Activo
                            </span>
                        )}
                    </button>

                    {/* Tarjeta Modo Oscuro */}
                    <button
                        type="button"
                        onClick={() => cambiarTema('oscuro')}
                        className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all cursor-pointer text-center ${
                            temaActual === 'oscuro'
                                ? 'border-indigo-600 dark:border-[#465FFF] bg-indigo-50/40 dark:bg-[#1A263D] shadow-sm'
                                : 'border-gray-200 dark:border-[#1E2B45] hover:border-gray-300 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-[#0D1523]/50'
                        }`}
                    >
                        <div className="w-12 h-12 rounded-full bg-indigo-950 flex items-center justify-center text-indigo-400 shadow-xs border border-indigo-800">
                            <Moon size={24} />
                        </div>
                        <div>
                            <span className="font-semibold text-sm block text-gray-900 dark:text-[#F9FAFB]">
                                Modo Oscuro
                            </span>
                            <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                Menor fatiga visual y tonos nocturnos
                            </span>
                        </div>
                        {temaActual === 'oscuro' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5">
                                <Check size={10} /> Activo
                            </span>
                        )}
                    </button>

                    {/* Tarjeta Sistema */}
                    <button
                        type="button"
                        onClick={() => cambiarTema('sistema')}
                        className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all cursor-pointer text-center ${
                            temaActual === 'sistema'
                                ? 'border-indigo-600 dark:border-[#465FFF] bg-indigo-50/40 dark:bg-[#1A263D] shadow-sm'
                                : 'border-gray-200 dark:border-[#1E2B45] hover:border-gray-300 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-[#0D1523]/50'
                        }`}
                    >
                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-[#1E2B45] flex items-center justify-center text-gray-600 dark:text-gray-300 shadow-xs">
                            <Monitor size={24} />
                        </div>
                        <div>
                            <span className="font-semibold text-sm block text-gray-900 dark:text-[#F9FAFB]">
                                Automático
                            </span>
                            <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                Sigue la preferencia de tu sistema
                            </span>
                        </div>
                        {temaActual === 'sistema' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5">
                                <Check size={10} /> Activo
                            </span>
                        )}
                    </button>
                </div>

                {/* Ajustes de densidad */}
                <div className="mt-6 pt-5 border-t border-gray-100 dark:border-[#1D2939] flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <Sliders size={16} className="text-gray-400" />
                        <div>
                            <p className="font-medium text-gray-900 dark:text-[#F9FAFB]">Densidad de visualización</p>
                            <p className="text-gray-500">Espaciado entre tarjetas y tablas en el sistema.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#1A263D] p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => { setDensidad('comoda'); mostrarToast('Densidad cómoda aplicada'); }}
                            className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                                densidad === 'comoda'
                                    ? 'bg-white dark:bg-[#131D30] text-indigo-600 dark:text-[#465FFF] shadow-xs'
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            Cómoda
                        </button>
                        <button
                            type="button"
                            onClick={() => { setDensidad('compacta'); mostrarToast('Densidad compacta aplicada'); }}
                            className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                                densidad === 'compacta'
                                    ? 'bg-white dark:bg-[#131D30] text-indigo-600 dark:text-[#465FFF] shadow-xs'
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            Compacta
                        </button>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 2: ACCESO A PERFIL DE USUARIO */}
            <div className="rounded-2xl border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#131D30] p-6 shadow-xs">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {usuario?.iniciales || 'LV'}
                        </div>
                        <div>
                            <h3 className="font-bold text-base text-gray-900 dark:text-[#F9FAFB]">
                                {usuario?.nombre || 'Usuario Activo'}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {usuario?.correo || 'correo@universidad.edu.co'} · <span className="font-medium text-indigo-600 dark:text-[#465FFF]">{usuario?.rol || 'Líder de Proyecto'}</span>
                            </p>
                        </div>
                    </div>

                    {alIrAPerfil && (
                        <button
                            type="button"
                            onClick={alIrAPerfil}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 dark:bg-[#465FFF] dark:hover:bg-[#394DD1] transition shadow-xs cursor-pointer"
                        >
                            <User size={15} />
                            <span>Gestionar Perfil Completo</span>
                        </button>
                    )}
                </div>
            </div>

            {/* SECCIÓN 3: PREFERENCIAS REGIONALES Y DE OPERACIÓN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#131D30] p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-[#465FFF]">
                        <Globe size={18} />
                        <h3 className="text-sm font-bold text-gray-900 dark:text-[#F9FAFB]">
                            Moneda e Idioma
                        </h3>
                    </div>

                    <div className="space-y-3 text-xs">
                        <div>
                            <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1.5">
                                Moneda por defecto
                            </label>
                            <div className="flex gap-2">
                                {(['COP', 'USD', 'EUR'] as const).map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => { setMoneda(m); mostrarToast(`Moneda cambiada a ${m}`); }}
                                        className={`flex-1 py-2 rounded-lg font-mono font-medium border transition cursor-pointer ${
                                            moneda === m
                                                ? 'border-indigo-600 bg-indigo-50 dark:border-[#465FFF] dark:bg-[#465FFF]/10 text-indigo-600 dark:text-[#465FFF]'
                                                : 'border-gray-200 dark:border-[#1D2939] text-gray-600 dark:text-gray-400'
                                        }`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-600 dark:text-gray-300 font-medium mb-1.5">
                                Idioma de la interfaz
                            </label>
                            <select
                                value={idioma}
                                onChange={(e) => { setIdioma(e.target.value as 'es' | 'en'); mostrarToast('Idioma actualizado'); }}
                                className="w-full rounded-lg border border-gray-200 dark:border-[#1D2939] bg-gray-50 dark:bg-[#0D1523] px-3 py-2 text-xs text-gray-800 dark:text-[#F9FAFB] focus:outline-none"
                            >
                                <option value="es">Español (Colombia - es-CO)</option>
                                <option value="en">English (US)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#131D30] p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-[#465FFF]">
                        <Bell size={18} />
                        <h3 className="text-sm font-bold text-gray-900 dark:text-[#F9FAFB]">
                            Comportamiento y Avisos
                        </h3>
                    </div>

                    <div className="space-y-4 text-xs">
                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-[#F9FAFB]">Guardado automático en tablero</p>
                                <p className="text-gray-500">Sincroniza tarjetas Trello al arrastrar o editar.</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={autoGuardar}
                                onChange={(e) => setAutoGuardar(e.target.checked)}
                                className="w-4 h-4 text-indigo-600 rounded accent-indigo-600 cursor-pointer"
                            />
                        </label>

                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-[#F9FAFB]">Alertas de verificación</p>
                                <p className="text-gray-500">Notificar cuando un dictamen pase a Aprobado o Rechazado.</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={notificacionesSonido}
                                onChange={(e) => setNotificacionesSonido(e.target.checked)}
                                className="w-4 h-4 text-indigo-600 rounded accent-indigo-600 cursor-pointer"
                            />
                        </label>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 4: ESTADO Y DIAGNÓSTICO DEL BACKEND (API C# + SUPABASE) */}
            <div className="rounded-2xl border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#131D30] p-6 shadow-xs">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-[#465FFF]">
                        <Server size={18} />
                        <h3 className="text-sm font-bold text-gray-900 dark:text-[#F9FAFB]">
                            Estado de la API Backend y Base de Datos
                        </h3>
                    </div>

                    <button
                        type="button"
                        onClick={probarConexionApi}
                        disabled={pingEstado.probando}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-[#1D2939] bg-gray-50 dark:bg-[#1A263D] px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#233352] transition cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw size={13} className={pingEstado.probando ? 'animate-spin' : ''} />
                        <span>{pingEstado.probando ? 'Comprobando…' : 'Probar Conexión (Ping)'}</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="rounded-xl border border-gray-100 dark:border-[#1D2939] bg-gray-50/70 dark:bg-[#0D1523]/70 p-4">
                        <span className="text-gray-500 dark:text-gray-400 block mb-1">Servidor Backend</span>
                        <span className="font-mono text-gray-900 dark:text-[#F9FAFB] font-semibold block truncate">
                            {API_BASE}
                        </span>
                        <span className="inline-flex items-center gap-1 mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            ASP.NET Core .NET 9
                        </span>
                    </div>

                    {/* Tarjeta Base de Datos PostgreSQL */}
                    <div className={`rounded-xl border p-4 transition-all duration-200 ${
                        estadoBd.estado === 'activo'
                            ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20'
                            : estadoBd.estado === 'comprobando'
                            ? 'border-gray-100 dark:border-[#1D2939] bg-gray-50/70 dark:bg-[#0D1523]/70'
                            : 'border-red-200 dark:border-red-900/60 bg-red-50/30 dark:bg-red-950/20'
                    }`}>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-gray-500 dark:text-gray-400 block font-medium">Base de Datos</span>
                            
                            {/* Estado: ACTIVO o INACTIVO (Pausada) */}
                            {estadoBd.estado === 'activo' ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    ACTIVO
                                </span>
                            ) : estadoBd.estado === 'comprobando' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                    <RefreshCw size={9} className="animate-spin" />
                                    Comprobando...
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-900/70 dark:text-red-300 border border-red-300 dark:border-red-800">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                    INACTIVO (Pausada)
                                </span>
                            )}
                        </div>

                        <span className="font-semibold text-gray-900 dark:text-[#F9FAFB] block text-sm">
                            PostgreSQL en Supabase
                        </span>

                        <div className="mt-2 text-[11px] leading-tight">
                            {estadoBd.estado === 'activo' ? (
                                <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                                    <ShieldCheck size={12} className="inline shrink-0" />
                                    <span>Supabase en línea (No está pausada)</span>
                                </span>
                            ) : estadoBd.estado === 'comprobando' ? (
                                <span className="text-gray-400">Verificando estado del pooler de Supabase...</span>
                            ) : (
                                <span className="text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                                    <AlertCircle size={12} className="inline shrink-0" />
                                    <span>BD Pausada o Inaccesible en Supabase</span>
                                </span>
                            )}
                        </div>

                        {estadoBd.estado === 'inactivo' && (
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 block mt-1.5 leading-tight">
                                Si no has usado Supabase recientemente, ve a supabase.com y pulsa <strong>"Restore project"</strong>.
                            </span>
                        )}
                    </div>

                    <div className="rounded-xl border border-gray-100 dark:border-[#1D2939] bg-gray-50/70 dark:bg-[#0D1523]/70 p-4">
                        <span className="text-gray-500 dark:text-gray-400 block mb-1">Latencia de Respuesta</span>
                        <div className="flex items-center gap-2 mt-1">
                            <Activity size={18} className={pingEstado.ok ? 'text-emerald-500' : 'text-amber-500'} />
                            <span className="font-mono text-base font-bold text-gray-900 dark:text-[#F9FAFB]">
                                {pingEstado.ms !== undefined ? `${pingEstado.ms} ms` : '—'}
                            </span>
                        </div>
                        <span className="text-[10.5px] text-gray-400 mt-1 block">
                            {pingEstado.ok ? 'Conexión óptima y verificada' : 'Comprobando servicio...'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Configuracion;
