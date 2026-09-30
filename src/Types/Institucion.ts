// Espejo de AcademiaFlowAPI.ViewModel.InstitucionViewModel
export interface InstitucionViewModel {
    id: number;
    nombre: string;
    siglas?: string | null;
    nit?: string | null;
    naturaleza?: string | null;
    pais?: string | null;
    ciudad?: string | null;
    sitioWeb?: string | null;
    activo?: boolean | null;
    fechaCreacion?: string | null;
    fechaActualizacion?: string | null;
}