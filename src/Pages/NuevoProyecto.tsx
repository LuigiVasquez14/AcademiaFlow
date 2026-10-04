import { useEffect, useState, type FormEvent } from "react";
import type { InstitucionViewModel } from "../Types/Institucion";
import type { UsuarioViewModel } from "../Types/Usuario";

const URL_PROYECTOS = "https://localhost:7045/api/Proyecto";
const URL_INSTITUCIONES = "https://localhost:7045/api/Institucion";
const URL_USUARIOS = "https://localhost:7045/api/Usuario";

const EstiloEntrada = "h-10 w-full rounded-lg border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#101828] px-3 text-[13.5px] text-gray-900 dark:text-[#F9FAFB] outline-none placeholder:text-gray-400 focus:border-indigo-600 dark:focus:border-[#465FFF] disabled:opacity-60 transition-colors duration-150";
const EstiloEtiqueta = "text-[12.5px] font-medium text-gray-700 dark:text-gray-300";
const EstiloTextarea = `${EstiloEntrada} h-auto min-h-[80px] py-2 resize-none`;

interface PropiedadesNuevoProyecto {
    alCrear?: () => void;
    alCancelar?: () => void;
}

export function NuevoProyecto({ alCrear, alCancelar }: PropiedadesNuevoProyecto) {

    const [instituciones, setInstituciones] = useState<InstitucionViewModel[]>([]);
    const [usuarios, setUsuarios] = useState<UsuarioViewModel[]>([]);
    const [cargandoListas, setCargandoListas] = useState(true);

    const [codigo, setCodigo] = useState("");
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [justificacion, setJustificacion] = useState("");
    const [objetivoGeneral, setObjetivoGeneral] = useState("");
    const [palabrasClave, setPalabrasClave] = useState("");
    const [idInstitucion, setIdInstitucion] = useState("");
    const [idLider, setIdLider] = useState("");
    const [origenFinanciamiento, setOrigenFinanciamiento] = useState("Propio");
    const [presupuestoTotal, setPresupuestoTotal] = useState("");
    const [moneda, setMoneda] = useState("COP");
    const [fechaInicioPlan, setFechaInicioPlan] = useState("");
    const [fechaFinPlan, setFechaFinPlan] = useState("");

    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        cargarListas();
    }, []);

    async function cargarListas() {
        setCargandoListas(true);
        try {
            const [respInstituciones, respUsuarios] = await Promise.all([
                fetch(URL_INSTITUCIONES),
                fetch(URL_USUARIOS),
            ]);
            setInstituciones(respInstituciones.ok ? await respInstituciones.json() : []);
            setUsuarios(respUsuarios.ok ? await respUsuarios.json() : []);
        } catch {
            setError("No fue posible cargar instituciones/usuarios. Verifica que la API esté corriendo.");
        } finally {
            setCargandoListas(false);
        }
    }

    async function manejarEnvio(evento: FormEvent) {
        evento.preventDefault();

        if (!codigo || !nombre || !idInstitucion || !idLider) {
            setError("Completa código, nombre, institución y líder.");
            return;
        }

        setError("");
        setEnviando(true);
        try {
            const respuesta = await fetch(URL_PROYECTOS, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    codigo,
                    nombre,
                    descripcion: descripcion || null,
                    justificacion: justificacion || null,
                    objetivoGeneral: objetivoGeneral || null,
                    palabrasClave: palabrasClave || null,
                    idInstitucion: Number(idInstitucion),
                    nombreInstitucion: "",
                    idLider: Number(idLider),
                    nombreLider: "",
                    estado: "Iniciado",
                    origenFinanciamiento,
                    presupuestoTotal: presupuestoTotal ? Number(presupuestoTotal) : 0,
                    moneda,
                    fechaInicioPlan: fechaInicioPlan || null,
                    fechaFinPlan: fechaFinPlan || null,
                }),
            });

            if (!respuesta.ok) {
                const cuerpo = await respuesta.json().catch(() => null);
                let msg = cuerpo?.mensaje;
                if (!msg && cuerpo?.errors) {
                    msg = Object.values(cuerpo.errors).flat().join("; ");
                }
                throw new Error(msg ?? cuerpo?.title ?? `El servidor respondió ${respuesta.status}`);
            }

            alCrear?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : "No fue posible crear el proyecto.");
        } finally {
            setEnviando(false);
        }
    }

    return (
        <div className="flex h-full w-full flex-col overflow-y-auto bg-white dark:bg-[#101828] p-8 transition-colors duration-300">

            <div className="mb-6">
                <h1 className="text-[26px] font-bold text-gray-900 dark:text-[#F9FAFB]">Nuevo proyecto</h1>
                <p className="mt-1 text-[13px] text-gray-500 dark:text-gray-400">
                    Se crea en estado <span className="font-medium">Iniciado</span>. Podrás cambiar el estado luego desde el detalle del proyecto.
                </p>
            </div>

            <form onSubmit={manejarEnvio} className="max-w-[720px] rounded-xl border border-gray-200 dark:border-[#1D2939] bg-white dark:bg-[#171F2F] shadow-sm p-6">

                {error && (
                    <p className="mb-5 rounded-lg border border-red-200 bg-red-50 dark:border-[#382430] dark:bg-[#382430] px-3 py-2.5 text-[12.5px] text-red-700 dark:text-[#F04438]">
                        {error}
                    </p>
                )}

                <div className="mb-4 grid grid-cols-[160px_1fr] gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="codigoProyecto" className={EstiloEtiqueta}>Código</label>
                        <input
                            id="codigoProyecto"
                            className={`${EstiloEntrada} font-mono`}
                            placeholder="PRJ-2026-090"
                            disabled={enviando}
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="nombreProyecto" className={EstiloEtiqueta}>Nombre del proyecto</label>
                        <input
                            id="nombreProyecto"
                            className={EstiloEntrada}
                            placeholder="Modelado hidrológico de microcuencas…"
                            disabled={enviando}
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mb-4 flex flex-col gap-1.5">
                    <label htmlFor="descripcionProyecto" className={EstiloEtiqueta}>Descripción</label>
                    <textarea
                        id="descripcionProyecto"
                        className={EstiloTextarea}
                        disabled={enviando}
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                    />
                </div>

                <div className="mb-4 flex flex-col gap-1.5">
                    <label htmlFor="justificacionProyecto" className={EstiloEtiqueta}>Justificación</label>
                    <textarea
                        id="justificacionProyecto"
                        className={EstiloTextarea}
                        disabled={enviando}
                        value={justificacion}
                        onChange={(e) => setJustificacion(e.target.value)}
                    />
                </div>

                <div className="mb-4 flex flex-col gap-1.5">
                    <label htmlFor="objetivoProyecto" className={EstiloEtiqueta}>Objetivo general</label>
                    <textarea
                        id="objetivoProyecto"
                        className={EstiloTextarea}
                        disabled={enviando}
                        value={objetivoGeneral}
                        onChange={(e) => setObjetivoGeneral(e.target.value)}
                    />
                </div>

                <div className="mb-4 grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="institucionProyecto" className={EstiloEtiqueta}>Institución</label>
                        <select
                            id="institucionProyecto"
                            className={EstiloEntrada}
                            disabled={enviando || cargandoListas}
                            value={idInstitucion}
                            onChange={(e) => setIdInstitucion(e.target.value)}
                        >
                            <option value="">{cargandoListas ? "Cargando…" : "Selecciona…"}</option>
                            {instituciones.map((inst) => (
                                <option key={inst.id} value={inst.id}>{inst.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="liderProyecto" className={EstiloEtiqueta}>Líder del proyecto</label>
                        <select
                            id="liderProyecto"
                            className={EstiloEntrada}
                            disabled={enviando || cargandoListas}
                            value={idLider}
                            onChange={(e) => setIdLider(e.target.value)}
                        >
                            <option value="">{cargandoListas ? "Cargando…" : "Selecciona…"}</option>
                            {usuarios.map((u) => (
                                <option key={u.id} value={u.id}>{u.nombreCompleto}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="origenFinanciamiento" className={EstiloEtiqueta}>Origen de financiamiento</label>
                        <select
                            id="origenFinanciamiento"
                            className={EstiloEntrada}
                            disabled={enviando}
                            value={origenFinanciamiento}
                            onChange={(e) => setOrigenFinanciamiento(e.target.value)}
                        >
                            <option value="Propio">Propio</option>
                            <option value="Mixto">Mixto</option>
                            <option value="Público">Público</option>
                            <option value="Privado">Privado</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="palabrasClaveProyecto" className={EstiloEtiqueta}>Palabras clave</label>
                        <input
                            id="palabrasClaveProyecto"
                            className={EstiloEntrada}
                            placeholder="hidrología, microcuencas…"
                            disabled={enviando}
                            value={palabrasClave}
                            onChange={(e) => setPalabrasClave(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mb-6 grid grid-cols-[1fr_100px_1fr_1fr] gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="presupuestoProyecto" className={EstiloEtiqueta}>Presupuesto</label>
                        <input
                            id="presupuestoProyecto"
                            type="number"
                            min="0"
                            className={`${EstiloEntrada} font-mono`}
                            disabled={enviando}
                            value={presupuestoTotal}
                            onChange={(e) => setPresupuestoTotal(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="monedaProyecto" className={EstiloEtiqueta}>Moneda</label>
                        <input
                            id="monedaProyecto"
                            maxLength={3}
                            className={`${EstiloEntrada} font-mono uppercase`}
                            disabled={enviando}
                            value={moneda}
                            onChange={(e) => setMoneda(e.target.value.toUpperCase())}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="inicioPlanProyecto" className={EstiloEtiqueta}>Inicio planificado</label>
                        <input
                            id="inicioPlanProyecto"
                            type="date"
                            className={EstiloEntrada}
                            disabled={enviando}
                            value={fechaInicioPlan}
                            onChange={(e) => setFechaInicioPlan(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="finPlanProyecto" className={EstiloEtiqueta}>Fin planificado</label>
                        <input
                            id="finPlanProyecto"
                            type="date"
                            className={EstiloEntrada}
                            disabled={enviando}
                            value={fechaFinPlan}
                            onChange={(e) => setFechaFinPlan(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 border-t border-gray-100 dark:border-[#1D2939] pt-5">
                    <button
                        type="submit"
                        disabled={enviando}
                        className="h-10 rounded-lg bg-indigo-600 dark:bg-[#465FFF] px-5 text-[13.5px] font-semibold text-white transition-colors duration-150 hover:bg-indigo-700 dark:hover:bg-[#394DD1] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {enviando ? "Creando…" : "Crear proyecto"}
                    </button>
                    <button
                        type="button"
                        onClick={alCancelar}
                        disabled={enviando}
                        className="h-10 rounded-lg border border-gray-200 dark:border-[#1D2939] px-5 text-[13.5px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1D2939]"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default NuevoProyecto;