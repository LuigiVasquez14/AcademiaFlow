// import { useState, type FormEvent } from "react";
// import type { DatosRegistro } from "../Types/DatosInicioSesion";



// const EstiloBoton = "h-10 w-full rounded-[4px] bg-[#7C5C38] text-[13.5px] font-medium text-white transition-colors duration-150 hover:bg-[#63482A] disabled:cursor-not-allowed disabled:bg-[#D3C3B0]"


// interface PropiedadesCrearCuenta {
//     AlEnviar :(valores : DatosRegistro) => Promise<void>;
// }

// const ValoresIniciales : DatosRegistro = {
//  Nombres: "",
//   Apellidos: "",
//   TipoDocumento: "CC",
//   NumeroDocumento: "",
//   Correo: "",
//   Telefono: "",
//   Cargo: "",
//   Contraseña: "",
//   ConfirmarContraseña: "",
//   AceptaTerminos: false,
// };

// export function CrearCuenta({AlEnviar}: PropiedadesCrearCuenta) {
//     const [valores,setValores] = useState<DatosRegistro>(ValoresIniciales);
//     const [enviando,setEnviando] = useState(false)
//     const [error,setError] = useState("");

//       function actualizar<C extends keyof DatosRegistro>(campo: C, valor: DatosRegistro[C])
//        {
// setValores((v) => ({ ...v, [campo]: valor }));
//        }

//         async function manejarEnvio(evento: FormEvent) {
//     evento.preventDefault();
//     if (!valores.Nombres || !valores.Apellidos || !valores.NumeroDocumento || !valores.Correo) {
//       setError("Completa los campos obligatorios.");
//       return;
//     }
//     if (valores.Contraseña.length < 8) {
//       setError("La contraseña debe tener al menos 8 caracteres.");
//       return;
//     }
//     if (valores.Contraseña !== valores.ConfirmarContraseña) {
//       setError("Las contraseñas no coinciden.");
//       return;
//     }
//     if (!valores.AceptaTerminos) {
//       setError("Debes aceptar los términos y la política de tratamiento de datos.");
//       return;
//     }
//     setError("");
//     setEnviando(true);
//     try {
//       await AlEnviar(valores);
//     } catch {
//       setError("No fue posible crear la cuenta. Intenta nuevamente.");
//     } finally {
//       setEnviando(false);
//     }
//   }

    
// }

// return (
//     <form onSubmit={}></form>
// )
// // export const CrearCuenta = () => {
// //   return (
// //     <div>CrearCuenta</div>
// //   )
// // }

// export default CrearCuenta;