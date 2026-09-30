// Espejo de AcademiaFlowAPI.ViewModel.ProyectoViewModel
export interface ProyectoViewModel {
    id: number;
    codigo: string;
    nombre: string;
    descripcion?: string | null;
    justificacion?: string | null;
    objetivoGeneral?: string | null;
    resumen?: string | null;
    palabrasClave?: string | null;
    idInstitucion: number;
    nombreInstitucion: string;
    idUnidadAcademica?: number | null;
    nombreUnidadAcademica?: string | null;
    idLider: number;
    nombreLider: string;
    estado?: string | null;
    origenFinanciamiento?: string | null;
    presupuestoTotal?: number | null;
    moneda?: string | null;
    fechaInicioPlan?: string | null;
    fechaFinPlan?: string | null;
    fechaInicioReal?: string | null;
    fechaFinReal?: string | null;
    porcentajeAvance?: number | null;
    justificacionCancelacion?: string | null;
    creadoPor?: number | null;
    nombreCreadoPor?: string | null;
    actualizadoPor?: number | null;
    nombreActualizadoPor?: string | null;
    fechaCreacion?: string | null;
    fechaActualizacion?: string | null;
    eliminadoEn?: string | null;
}