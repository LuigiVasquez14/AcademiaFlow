// import { Interface } from "readline";

export interface DatosInicioSesion{
    Correo : string;
    Contraseña : string;
    RecordarSesion : Boolean;
}

export interface DatosRegistro {
    Nombres : string;
    Apellidos : string;
    TipoDocumento : "CC" | "CE" | "PAS"
    NumeroDocumento : string;
    Correo : string;
    Telefono : string;
    Cargo : string;
    Contraseña : string;
    ConfirmarContraseña : string;
    AceptaTerminos : boolean;

}