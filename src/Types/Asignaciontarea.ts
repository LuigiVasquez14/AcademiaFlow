// Espejo de AcademiaFlowAPI.ViewModel.AsignacionTareaViewModel
export interface AsignacionTareaViewModel {
    idTarea: number;
    nombreTarea: string;
    idUsuario: number;
    nombreUsuario: string;
    horasAsignadas?: number | null;
    asignadoEn?: string | null;
    asignadoPor?: number | null;
    nombreUsuarioAsigno?: string | null;
}