// Espejo de AcademiaFlowAPI.ViewModel.EntidadFinanciadoraViewModel
export interface EntidadFinanciadoraViewModel {
    id: number;
    nombre: string;
    tipo?: string | null;
    nit?: string | null;
    pais?: string | null;
    contacto?: string | null;
    activo?: boolean | null;
}