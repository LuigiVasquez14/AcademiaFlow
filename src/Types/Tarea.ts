// Espejo de AcademiaFlowAPI.ViewModel.TareaViewModel
export interface TareaViewModel {
    id: number;
    idFase: number;
    nombreFase: string;
    idProyecto: number;
    nombreProyecto: string;
    descripcion: string;
    orden?: number | null;
    prioridad?: string | null;
    estado?: string | null;
    idResponsable?: number | null;
    nombreResponsable?: string | null;
    fechaInicioPlan?: string | null;
    fechaFinPlan?: string | null;
    fechaInicioReal?: string | null;
    fechaFinReal?: string | null;
    horasEstimadas?: number | null;
    porcentajeAvance?: number | null;
    fechaCreacion?: string | null;
    fechaActualizacion?: string | null;
}