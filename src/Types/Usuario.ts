// Espejo de AcademiaFlowAPI.ViewModel.UsuarioViewModel
export interface UsuarioViewModel {
    id: number;
    idInstitucion?: number | null;
    nombreInstitucion?: string | null;
    idUnidadAcademica?: number | null;
    nombreUnidadAcademica?: string | null;
    tipoDocumento?: string | null;
    numeroDocumento?: string | null;
    nombres: string;
    apellidos: string;
    nombreCompleto: string;
    email: string;
    emailConfirmado?: boolean | null;
    telefono?: string | null;
    cargo?: string | null;
    activo?: boolean | null;
    ultimoAcceso?: string | null;
    fechaCreacion?: string | null;
    fechaActualizacion?: string | null;
}