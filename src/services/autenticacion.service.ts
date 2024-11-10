/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable prefer-const */
import { injectable, /* inject, */ BindingScope, inject, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import { UserProfile } from '@loopback/security';
import { Llaves } from '../config/llaves';
import { Credenciales, DobleFactorAutenticacion, Usuario } from '../models';
import { UsuarioRepository } from '../repositories';
import { LoginRepository } from '../repositories';
import { RolMenuRepository } from '../repositories';
import { v4 as uuidv4 } from 'uuid'; // Generador de UUIDs
import { NotificacionService } from './notificacion.service';

const generador = require('password-generator');
const cryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

@injectable({ scope: BindingScope.TRANSIENT })
export class AutenticacionService {

  constructor(            /* Add @inject to inject parameters */
    @repository(UsuarioRepository)
    public usuarioRepository: UsuarioRepository,
    @repository(LoginRepository)
    public LoginRepository: LoginRepository,
    @repository(RolMenuRepository)
    private repositorioRolMenu: RolMenuRepository,
    @service(NotificacionService)
    private notificacionService: NotificacionService,





  ) { }

  /*
   * Add service methods here


   */


  /*codigoAleatorio(n:number):string {
    let clave = generador.generate({
      length: n,
      numbers: true
    });
    return clave;
  }*/



     /**
   * Genera un token de verificación único para un usuario
   * @returns token único
   */
  // Generar token con fecha de expiración
  GenerarTokenVerificacion(): { token: string, expiracion: Date } {
    const token = uuidv4();  // Genera un UUID
    const expiracion = new Date();
    expiracion.setHours(expiracion.getHours() + 1);  // Establece que el token expire en 1 hora

    return { token, expiracion }; // Retorna un objeto con el token y la expiración
  }
  /**
   * Envia un correo con el enlace de verificación
   * @param correo Correo del usuario
   * @param token Token de verificación
   * @param nombre Nombre del usuario
   */



  /**
   * Valida un token de verificación y devuelve el usuario asociado
   * @param token Token de verificación
   * @returns Usuario asociado si es válido, de lo contrario lanza un error
   */
  async ValidarTokenVerificacion(token: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { tokenVerificacion: token },
    });

    if (!usuario) {
      throw new HttpErrors.NotFound('Token inválido o expirado.');
    }

    // Actualizar el estado de verificación
    usuario.correoVerificado = true;
    await this.usuarioRepository.updateById(usuario.id, usuario);

    return usuario;
  }




  GenerarClave() {    //metodo que genera la clave
    let clave = generador(8, false);
    //                    (length:8 , numbers: false , uppercase: true)
    return clave;
  }
  CifrarClave(clave: string) {   //variable claveCifrada
    let claveCifrada = cryptoJS.MD5(clave).toString();  // MD5 metodo de cifrado
    return claveCifrada;  //metodo que cifra la clave

  }



  /**
     * Se busca un usuario por sus credenciales de acceso
     * @param credenciales credenciales del usuario
     * @returns usuario encontrado o null
     */
  async identificarUsuario(credenciales: Credenciales): Promise<Usuario | null> {
    let usuario = await this.usuarioRepository.findOne({
      where: {
        correo: credenciales.correo,
        clave: credenciales.clave
      }
    });
    if (usuario) {

      return usuario as Usuario;
    }

    else {

      return null
    }



  }











  GenerarTokenJWT(usuario: Usuario) {
    let token = jwt.sign({
      exp: Llaves.Tiempo_VencimientoJWT,
      data: {
        id: usuario.id,
        correo: usuario.correo,
        nombre: usuario.nombre,
        estado: usuario.estado,
      }
    },
      Llaves.claveJWT);
    return token;
  }
  ValidarTokenJWT(token: string) {
    try {
      let datos = jwt.verify(token, Llaves.claveJWT);
      return datos;
    } catch {
      return false;
    }
  }

  /**
    * Valida un código de 2fa para un usuario
    * @param credenciales2fa credenciales del usuario con el código del 2fa
    * @returns el registro de login o null
    */
  async validarCodigo2fa(credenciales2fa: DobleFactorAutenticacion): Promise<Usuario | null> {
    let login = await this.LoginRepository.findOne({
      where: {
        usuarioId: credenciales2fa.usuarioId,
        codigo2fa: credenciales2fa.codigo2fa,
        estadoCodigo2fa: false
      }
    });



    if (login) {
      let p = await this.usuarioRepository.findById(credenciales2fa.usuarioId);
      return p;

    }
    return null;
  }


  /**
     * Generación de jwt
     * @param usuario información del usuario
     * @returns token
     */

  crearToken(usuario: Usuario): string {
    let datos = {
      name: `${usuario.nombre} ${usuario.apellido} `,
      role: usuario.rolId,
      email: usuario.correo
    };
    let token = jwt.sign(datos, Llaves.claveJWT);
    return token;
  }


  /**
    * Valida y obtiene el rol de un token
    * @param tk el token
    * @returns el _id del rol
    */
  obtenerRolDesdeToken(tk: string): string {
    let obj = jwt.verify(tk, Llaves.claveJWT);
    return obj.role;
  }





  async VerificarPermisoDeUsuarioPorRol(idRol: string, idMenu: string, accion: string): Promise<UserProfile | undefined> {
    let permiso = await this.repositorioRolMenu.findOne({
      where: {
        rolId: idRol,
        menuId: idMenu
      }
    });
    console.log(permiso);
    let continuar: boolean = false;
    if (permiso) {
      switch (accion) {
        case "guardar":
          continuar = permiso.guardar;
          break;
        case "editar":
          continuar = permiso.editar;
          break;
        case "listar":
          continuar = permiso.listar;
          break;
        case "eliminar":
          continuar = permiso.eliminar;
          break;
        case "descargar":
          continuar = permiso.descargar;
          break;

        default:
          throw new HttpErrors[401]("No es posible ejecutar la acción porque no existe.");
      }
      if (continuar) {
        let perfil: UserProfile = Object.assign({
          permitido: "OK"
        });
        return perfil;
      } else {
        return undefined;
      }
    } else {
      throw new HttpErrors[401]("No es posible ejecutar la acción por falta de permisos.");
    }
  }


}


