// Espejo de AcademiaFlowAPI.ViewModel.NotificacionViewModel
export interface NotificacionViewModel {
    id: number;
    idUsuario: number;
    nombreUsuario: string;
    idProyecto?: number | null;
    nombreProyecto?: string | null;
    tipo?: string | null;
    titulo: string;
    mensaje: string;
    enlace?: string | null;
    leida?: boolean | null;
    fechaCreacion?: string | null;
}