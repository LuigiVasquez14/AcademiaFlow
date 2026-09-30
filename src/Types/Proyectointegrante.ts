// Espejo de AcademiaFlowAPI.ViewModel.ProyectoIntegranteViewModel
export interface ProyectoIntegranteViewModel {
    id: number;
    idProyecto: number;
    nombreProyecto: string;
    idUsuario: number;
    nombreUsuario: string;
    rol: string;
    idDisciplina?: number | null;
    nombreDisciplina?: string | null;
    dedicacionHoras?: number | null;
    fechaIngreso?: string | null;
    fechaRetiro?: string | null;
    activo?: boolean | null;
}