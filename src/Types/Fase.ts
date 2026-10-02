// Espejo de AcademiaFlowAPI.ViewModel.FaseViewModel
export interface FaseViewModel {
    id: number;
    idProyecto: number;
    nombreProyecto: string;
    nombre: string;
    descripcion?: string | null;
    orden?: number | null;
    peso?: number | null;
    fechaInicioPlan?: string | null;
    fechaFinPlan?: string | null;
    fechaInicioReal?: string | null;
    fechaFinReal?: string | null;
    porcentajeAvance?: number | null;
    fechaCreacion?: string | null;
    fechaActualizacion?: string | null;
}