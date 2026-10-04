// ============================================================
// api.ts — Cliente centralizado para AcademiaFlowAPI
// URL base: https://localhost:7045/api
// ============================================================

import type { ProyectoViewModel } from './Types/Proyecto';
import type { FaseViewModel } from './Types/Fase';
import type { TareaViewModel } from './Types/Tarea';
import type { UsuarioViewModel } from './Types/Usuario';
import type { VerificacionViewModel } from './Types/Verificacion';
import type { ProyectoIntegranteViewModel } from './Types/Proyectointegrante';
import type { NotificacionViewModel } from './Types/Notificacion';

export const API_BASE = "https://localhost:7045/api";

// ---------- Tipos de respuesta ----------

export interface LoginResponseDto {
    id: number;
    nombreCompleto: string;
    email: string;
    cargo?: string | null;
    activo: boolean;
}

export interface ErrorApi {
    mensaje?: string;
    errors?: Record<string, string[]>;
}

// ---------- Helper interno ----------

async function manejarRespuesta<T>(res: Response): Promise<T> {
    const texto = await res.text();
    if (!res.ok) {
        let mensaje = `Error ${res.status}`;
        try {
            const cuerpo: ErrorApi = JSON.parse(texto);
            if (cuerpo?.mensaje) {
                mensaje = cuerpo.mensaje;
            } else if (cuerpo?.errors) {
                mensaje = Object.values(cuerpo.errors).flat().join("; ");
            }
        } catch { /* no-op */ }
        throw new Error(mensaje);
    }
    if (!texto) return undefined as unknown as T;
    return JSON.parse(texto) as T;
}

// ---------- Ping y Diagnóstico de Base de Datos ----------

export interface EstadoConexionBd {
    conectado: boolean;
    estado: 'activo' | 'inactivo' | 'comprobando' | 'error_servidor';
    mensaje: string;
    latenciaMs: number;
    detalles?: string;
}

export async function apiVerificarEstadoBaseDatos(): Promise<EstadoConexionBd> {
    const inicio = performance.now();
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(`${API_BASE}/Institucion`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        const fin = performance.now();
        const ms = Math.round(fin - inicio);

        if (res.ok) {
            return {
                conectado: true,
                estado: 'activo',
                mensaje: 'PostgreSQL Activo en Supabase',
                latenciaMs: ms,
                detalles: 'El proyecto en Supabase está en ejecución y respondiendo consultas activamente.',
            };
        } else {
            const texto = await res.text().catch(() => '');
            return {
                conectado: false,
                estado: 'inactivo',
                mensaje: 'PostgreSQL Pausado o Inaccesible',
                latenciaMs: ms,
                detalles: texto || `Error HTTP ${res.status}. Es probable que el proyecto de Supabase esté pausado por inactividad.`,
            };
        }
    } catch (err: unknown) {
        const fin = performance.now();
        const ms = Math.round(fin - inicio);
        const errorMsg = err instanceof Error ? err.message : '';
        const fueTimeout = errorMsg.toLowerCase().includes('abort');

        return {
            conectado: false,
            estado: 'inactivo',
            mensaje: fueTimeout ? 'Tiempo de espera agotado (BD Pausada)' : 'PostgreSQL Inactivo / Sin Conexión',
            latenciaMs: ms,
            detalles: fueTimeout
                ? 'La base de datos en Supabase tardó demasiado en responder. Posiblemente esté pausada.'
                : 'No se pudo establecer conexión con PostgreSQL o la API backend.',
        };
    }
}

export async function apiPing(): Promise<{ ok: boolean; status: number; ms: number }> {
    const inicio = performance.now();
    try {
        const res = await fetch(`${API_BASE}/Institucion`);
        const fin = performance.now();
        return { ok: res.ok, status: res.status, ms: Math.round(fin - inicio) };
    } catch {
        const fin = performance.now();
        return { ok: false, status: 0, ms: Math.round(fin - inicio) };
    }
}

// ---------- Auth ----------

export async function apiLogin(email: string, password: string): Promise<LoginResponseDto> {
    const res = await fetch(`${API_BASE}/Auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    return manejarRespuesta<LoginResponseDto>(res);
}

export interface DatosRegistro {
    nombres: string;
    apellidos: string;
    tipoDocumento?: string;
    numeroDocumento?: string;
    email: string;
    password: string;
    telefono?: string;
    cargo?: string;
}

export async function apiRegistro(datos: DatosRegistro): Promise<LoginResponseDto> {
    const res = await fetch(`${API_BASE}/Auth/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
    });
    return manejarRespuesta<LoginResponseDto>(res);
}

export async function apiVerificarEmail(email: string): Promise<{ mensaje: string; email?: string }> {
    const res = await fetch(`${API_BASE}/Auth/verificar-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });
    return manejarRespuesta<{ mensaje: string; email?: string }>(res);
}

export async function apiRestablecerPassword(
    email: string,
    nuevaPassword: string
): Promise<{ mensaje: string }> {
    const res = await fetch(`${API_BASE}/Auth/restablecer-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, nuevaPassword }),
    });
    return manejarRespuesta<{ mensaje: string }>(res);
}

// ---------- Proyectos ----------

export async function apiObtenerProyectos(): Promise<ProyectoViewModel[]> {
    const res = await fetch(`${API_BASE}/Proyecto`);
    return manejarRespuesta<ProyectoViewModel[]>(res);
}

export async function apiObtenerProyecto(id: number): Promise<ProyectoViewModel> {
    const res = await fetch(`${API_BASE}/Proyecto/${id}`);
    return manejarRespuesta<ProyectoViewModel>(res);
}

export async function apiActualizarProyecto(id: number, proyecto: Partial<ProyectoViewModel>): Promise<void> {
    const res = await fetch(`${API_BASE}/Proyecto/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proyecto),
    });
    return manejarRespuesta<void>(res);
}

// ---------- Fases (Columnas Kanban) ----------

export async function apiObtenerFasesPorProyecto(idProyecto: number): Promise<FaseViewModel[]> {
    const res = await fetch(`${API_BASE}/Fase/proyecto/${idProyecto}`);
    return manejarRespuesta<FaseViewModel[]>(res);
}

export async function apiCrearFase(fase: {
    idProyecto: number;
    nombre: string;
    descripcion?: string;
    orden?: number;
}): Promise<FaseViewModel> {
    const res = await fetch(`${API_BASE}/Fase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...fase,
            nombreProyecto: "",
        }),
    });
    return manejarRespuesta<FaseViewModel>(res);
}

export async function apiActualizarFase(id: number, fase: Partial<FaseViewModel>): Promise<void> {
    const res = await fetch(`${API_BASE}/Fase/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fase),
    });
    return manejarRespuesta<void>(res);
}

// ---------- Tareas (Tarjetas Trello) ----------

export async function apiObtenerTodasLasTareas(): Promise<TareaViewModel[]> {
    const res = await fetch(`${API_BASE}/Tarea`);
    return manejarRespuesta<TareaViewModel[]>(res);
}

export async function apiObtenerTareasPorProyecto(idProyecto: number): Promise<TareaViewModel[]> {
    const res = await fetch(`${API_BASE}/Tarea/proyecto/${idProyecto}`);
    return manejarRespuesta<TareaViewModel[]>(res);
}

export async function apiCrearTarea(tarea: {
    idFase: number;
    idProyecto: number;
    descripcion: string;
    prioridad?: string;
    horasEstimadas?: number;
    orden?: number;
    porcentajeAvance?: number;
    idResponsable?: number | null;
}): Promise<TareaViewModel> {
    const res = await fetch(`${API_BASE}/Tarea`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...tarea,
            nombreFase: "",
            nombreProyecto: "",
        }),
    });
    return manejarRespuesta<TareaViewModel>(res);
}

export async function apiActualizarTarea(id: number, tarea: Partial<TareaViewModel>): Promise<void> {
    const res = await fetch(`${API_BASE}/Tarea/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tarea),
    });
    return manejarRespuesta<void>(res);
}

export async function apiEliminarTarea(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/Tarea/${id}`, {
        method: "DELETE",
    });
    return manejarRespuesta<void>(res);
}

// ---------- Usuarios y Perfil ----------

export async function apiObtenerUsuarios(): Promise<UsuarioViewModel[]> {
    const res = await fetch(`${API_BASE}/Usuario`);
    return manejarRespuesta<UsuarioViewModel[]>(res);
}

export async function apiObtenerUsuario(id: number): Promise<UsuarioViewModel> {
    const res = await fetch(`${API_BASE}/Usuario/${id}`);
    return manejarRespuesta<UsuarioViewModel>(res);
}

export async function apiActualizarUsuario(id: number, usuario: Partial<UsuarioViewModel>): Promise<void> {
    const res = await fetch(`${API_BASE}/Usuario/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario),
    });
    return manejarRespuesta<void>(res);
}

// ---------- Verificaciones (Revisión y Dictámenes) ----------

export async function apiObtenerVerificaciones(): Promise<VerificacionViewModel[]> {
    const res = await fetch(`${API_BASE}/Verificacion`);
    return manejarRespuesta<VerificacionViewModel[]>(res);
}

export async function apiCrearVerificacion(verificacion: {
    idProyecto: number;
    idFase?: number | null;
    idTarea?: number | null;
    tipo?: string;
    asignadoPor?: number | null;
    resultado?: string;
    observaciones?: string;
    fechaLimite?: string | null;
}): Promise<VerificacionViewModel> {
    const res = await fetch(`${API_BASE}/Verificacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...verificacion,
            nombreProyecto: "",
            resultado: verificacion.resultado || "Pendiente",
        }),
    });
    return manejarRespuesta<VerificacionViewModel>(res);
}

export async function apiActualizarVerificacion(id: number, verificacion: Partial<VerificacionViewModel>): Promise<void> {
    const res = await fetch(`${API_BASE}/Verificacion/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(verificacion),
    });
    return manejarRespuesta<void>(res);
}

// ---------- Integrantes y Equipo de Proyecto ----------

export async function apiObtenerIntegrantes(): Promise<ProyectoIntegranteViewModel[]> {
    const res = await fetch(`${API_BASE}/ProyectoIntegrante`);
    return manejarRespuesta<ProyectoIntegranteViewModel[]>(res);
}

export async function apiObtenerIntegrantesPorProyecto(idProyecto: number): Promise<ProyectoIntegranteViewModel[]> {
    const res = await fetch(`${API_BASE}/ProyectoIntegrante/proyecto/${idProyecto}`);
    return manejarRespuesta<ProyectoIntegranteViewModel[]>(res);
}

export async function apiCrearIntegrante(integrante: {
    idProyecto: number;
    idUsuario: number;
    rol: string;
    idDisciplina?: number | null;
    dedicacionHoras?: number | null;
    fechaIngreso?: string | null;
    activo?: boolean;
}): Promise<ProyectoIntegranteViewModel> {
    const res = await fetch(`${API_BASE}/ProyectoIntegrante`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...integrante,
            nombreProyecto: "",
            nombreUsuario: "",
            activo: integrante.activo ?? true,
        }),
    });
    return manejarRespuesta<ProyectoIntegranteViewModel>(res);
}

export async function apiEliminarIntegrante(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/ProyectoIntegrante/${id}`, {
        method: "DELETE",
    });
    return manejarRespuesta<void>(res);
}

// ---------- Notificaciones ----------

export async function apiObtenerNotificaciones(idUsuario: number): Promise<NotificacionViewModel[]> {
    const res = await fetch(`${API_BASE}/Notificacion/usuario/${idUsuario}`);
    return manejarRespuesta<NotificacionViewModel[]>(res);
}

export async function apiCrearNotificacion(notificacion: {
    idUsuario: number;
    idProyecto?: number | null;
    tipo?: string;
    titulo: string;
    mensaje: string;
    enlace?: string;
}): Promise<NotificacionViewModel> {
    const res = await fetch(`${API_BASE}/Notificacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...notificacion,
            nombreUsuario: "",
            leida: false,
        }),
    });
    return manejarRespuesta<NotificacionViewModel>(res);
}

export async function apiMarcarNotificacionLeida(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/Notificacion/${id}/marcar-leida`, {
        method: "PATCH",
    });
    return manejarRespuesta<void>(res);
}
