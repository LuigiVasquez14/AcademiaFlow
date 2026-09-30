// Espejo de AcademiaFlowAPI.ViewModel.UnidadAcademicaViewModel
export interface UnidadAcademicaViewModel {
    id: number;
    idInstitucion: number;
    nombreInstitucion: string;
    idPadre?: number | null;
    nombreUnidadPadre?: string | null;
    nombre: string;
    tipo?: string | null;
    activo?: boolean | null;
    fechaCreacion?: string | null;
    fechaActualizacion?: string | null;
}