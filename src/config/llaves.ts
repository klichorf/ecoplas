/* eslint-disable @typescript-eslint/naming-convention */

export namespace Llaves {
    export const claveJWT = process.env.PASSWORD_JWT;
    export const urlServicioNotificaciones = 'http: //localhost:5000';
    export const emailFrom = 'vtanyelitdance@gmail.com';
    export const AsuntoRegistroUsuario= 'Registro exitoso en el sistema de Mascotas';
    export const AsuntoCambioContrasena= 'Cambio  exitoso de contraseña';
    export const CodigoValidacion= 'Codigo de validacion enviado';
    export const AsuntoRestableserClave= 'Restablecimiento  exitoso de contaseña';
    export const AsuntoRecuperarUsuario= 'Recuperacion de usuario  exitosa';
    export const AsuntoCodigoValidacionUsuario= 'Su codigo de validacion es :';
    export const enlaceVerificacion = 'http://localhost:3000'
    export const TwilioPhone = '+12294698148';
    export const Tiempo_VencimientoJWT = Math.floor(Date.now() / 1000) + (60 * 60);
    export const extensionesPermitidasIMG: string[] = ['.PNG', '.JPG', '.JPEG', '.SVG','.JFIF',];
    export const extensionesPermitidasDOC: string[] = ['.PDF', '.DOC', '.DOCX', '.XLS', '.XLSX'];
    export const carpetaImagenMascotas = "../../archivos/mascotas";
    export const carpetaImagenProducto= "../../archivos/Productos/";
    export const carpetaImagenPersonas = "../../archivos/personas";
    export const carpetaDocumentoPersona = '../../archivos/documentos';
    export const nombreCampoImagenPersona = "file";
    export const nombreCampoImagenMascota = "file";
    export const nombreCampoDocumentoPersona = 'file';
    export const nombreCampoImagenProducto = 'file';
    export const tamMaxImagenMascota = 1024 * 1024;
    export const tamMaxImagenPersona = 2048 * 2048;
    export const tamMaxImagenProducto = 1024 * 1024;
    export const CadenaConectionMongo = process.env.MONGO_CONECTION;

}
