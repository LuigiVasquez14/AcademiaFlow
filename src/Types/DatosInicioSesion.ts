export interface DatosInicioSesion {
    Correo: string;
    Contraseña: string;
    RecordarSesion: boolean;
}

export interface UsuarioAutenticado {
    nombre: string;
    rol: string;
    correo: string;
    iniciales: string;
    esInvitado?: boolean;
}

export interface DatosRegistro {
    Nombres: string;
    Apellidos: string;
    TipoDocumento: "CC" | "CE" | "PAS";
    NumeroDocumento: string;
    Correo: string;
    Telefono: string;
    Cargo: string;
    Contraseña: string;
    ConfirmarContraseña: string;
    AceptaTerminos: boolean;
}