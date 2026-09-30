// Espejo de AcademiaFlowAPI.ViewModel.VerificacionViewModel
export interface VerificacionViewModel {
    id: number;
    idProyecto: number;
    nombreProyecto: string;
    idFase?: number | null;
    nombreFase?: string | null;
    idTarea?: number | null;
    descripcionTarea?: string | null;
    tipo?: string | null;
    asignadoPor?: number | null;
    nombreAsignadoPor?: string | null;
    resultado?: string | null;
    observaciones?: string | null;
    fechaAsignacion?: string | null;
    fechaLimite?: string | null;
    fechaVerificacion?: string | null;
}