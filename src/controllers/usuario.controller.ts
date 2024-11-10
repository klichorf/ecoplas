/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/naming-convention */
import { service } from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, HttpErrors, param, patch, post, put, requestBody,
  response
} from '@loopback/rest';
import { Llaves } from '../config/llaves';
import { ResetearClave, Usuario, Credenciales, CambioClave, RecuperarUsuario, DobleFactorAutenticacion } from '../models';
import { UsuarioRepository } from '../repositories';
import { AutenticacionService, NotificacionService } from '../services';
import { Login } from '../models';
import { LoginRepository } from '../repositories';
import { PermisosRolMenu } from '../models/permisos-rol-menu.model';
import { UserProfile } from '@loopback/security';

require('dotenv').config();

export class UsuarioController {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository: UsuarioRepository,
    @repository(LoginRepository)
    public loginRepository: LoginRepository,
    @service(AutenticacionService)
    public servicioAutenticacion: AutenticacionService,
    @service(NotificacionService)
    public notificacionService: NotificacionService
  ) { }


  @post('/validar-permisos')
  @response(200, {
    description: "Validación de permisos de usuario para lógica de negocio",
    content: { 'application/json': { schema: getModelSchemaRef(PermisosRolMenu) } }
  })
  async ValidarPermisosDeUsuario(
    @requestBody(
      {
        content: {
          'application/json': {
            schema: getModelSchemaRef(PermisosRolMenu)
          }
        }
      }
    )
    datos: PermisosRolMenu
  ): Promise<UserProfile | undefined> {
    let idRol = this.servicioAutenticacion.obtenerRolDesdeToken(datos.token);
    return this.servicioAutenticacion.VerificarPermisoDeUsuarioPorRol(idRol, datos.idMenu, datos.accion);
  }
  /// identificar usuario metodos personalizados
  @post('/identificarUsuario')
  @response(200, {
    description: 'Identificacion de usuarios',
    content: { 'application/json': { schema: getModelSchemaRef(Credenciales) } }
  })
  async identificarUsuario(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Credenciales)
        }
      }
    })
    credenciales: Credenciales
  ): Promise<object | String> {
    try {
      let usuario = await this.servicioAutenticacion.identificarUsuario(credenciales);
      if (usuario) {
        let codigo2fa = this.servicioAutenticacion.GenerarClave();
        console.log("Codigo de Validacion enviado al correo");
        console.log(codigo2fa);
        let login: Login = new Login();
        login.usuarioId = usuario.id!;
        login.codigo2fa = codigo2fa;
        login.estadoCodigo2fa = false;
        login.token = "";
        login.estadoToken = false;
        await this.loginRepository.create(login);
        usuario.clave = "";

        // Notificar al usuario vía correo o SMS
        const contenido = `Hola ${usuario.nombre}, su codigo de validacion es ${codigo2fa}`;
        const Correo_enviado = await this.notificacionService.EnviarEmail(
          usuario.correo,
          Llaves.AsuntoCodigoValidacionUsuario,
          contenido
        );
        const asunto = `Hola ${usuario.nombre}, su codigo de validacion es ${codigo2fa}`;
        const MSMenviado = this.notificacionService.EnviarSMS(usuario.telefono, asunto);

        // Respuesta utilizando operadores ternarios
        return Correo_enviado && MSMenviado
          ? {
              Correo_enviado: "Codigo de Validacion enviado al correo " + usuario.correo,
              MSMenviado: "Codigo de Validacion enviado al celular " + usuario.telefono
            }
          : !Correo_enviado
          ? { Correo_enviado: "No se pudo enviar el codigo de validacion al correo" }
          : { MSMenviado: "El Codigo de Validacion no fue enviado al celular " + usuario.telefono };
      }
      throw new HttpErrors.Unauthorized("Credenciales incorrectas.");
    } catch (error) {
      console.error("Error al identificar usuario:", error);
      throw error;
    }
  }

  @post('/verificar-2factor-autenticacion')
  @response(200, {
    description: "Validar un código de 2fa"
  })
  async VerificarCodigo2fa(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(DobleFactorAutenticacion)
        }
      }
    })
    credenciales: DobleFactorAutenticacion
  ): Promise<object> {
    try {
      let usuario = await this.servicioAutenticacion.validarCodigo2fa(credenciales);

      if (usuario) {
        let token = this.servicioAutenticacion.GenerarTokenJWT(usuario);
        usuario.clave = "";

        // Manejar la promesa utilizando `await` en el método `patch`
        try {
          await this.usuarioRepository.logins(usuario.id).patch(
            {
              estadoCodigo2fa: true,
              token: token
            },
            {
              estadoCodigo2fa: false
            }
          );
        } catch (error) {
          console.log("No se ha almacenado el cambio del estado de token en la base de datos.", error);
        }

        return {
          user: usuario.correo,
          token: token
        };
      }

      throw new HttpErrors.Unauthorized("Código de 2fa inválido para el usuario definido.");

    } catch (error) {
      console.error("Error al verificar el código de 2fa:", error);
      throw error;
    }
  }
  //cambio de contraseña
  @post('/cambiar-clave')
  @response(200, {
    description: 'Cambio de clave de usuarios',
    content: { 'application/json': { schema: getModelSchemaRef(CambioClave) } },
  })
  async cambiarClave(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CambioClave, {
            title: 'Cambio de clave del Usuario'
          }),
        },
      },
    })
    credencialesClave: CambioClave,
  ): Promise<Object | null> {
    try {
      let usuario = await this.usuarioRepository.findOne({
        where: {
          id: credencialesClave.id_usuario,
          contrasena: credencialesClave.clave_actual
        }
      });

      if (usuario) {
        // Cambiar la contraseña y actualizar en la base de datos
        usuario.contrasena = credencialesClave.nueva_clave;
        const claveCifrada = this.servicioAutenticacion.CifrarClave(usuario.contrasena);
        usuario.clave = claveCifrada;
        await this.usuarioRepository.updateById(credencialesClave.id_usuario, usuario);

        // Enviar notificación por correo
        const contenido = `Hola ${usuario.nombre}, su usuario es ${usuario.correo} y su nueva contraseña es ${usuario.contrasena}`;
        await this.notificacionService.EnviarEmail(usuario.correo, Llaves.AsuntoCambioContrasena, contenido);

        // Enviar notificación por SMS
        const asunto = `Hola ${usuario.nombre}, su nueva contraseña es ${usuario.contrasena}`;
        const enviado = this.notificacionService.EnviarSMS(usuario.telefono, asunto);

        // Verificar el envío del SMS
        if (enviado) {
          return {
            enviado: "Contraseña actualizada"
          };
        }

        return {
          enviado: "No se pudo enviar el mensaje, asegúrese de tener un número telefónico real"
        };
      }

      return usuario;

    } catch (error) {
      console.error("Error al cambiar la clave del usuario:", error);
      throw error;
    }
  }
//resetear pasword
@post('/recuperar-usuario')
  @response(200, {
    description: 'Recuperación de usuario',
    content: { 'application/json': { schema: getModelSchemaRef(RecuperarUsuario) } },
  })
  async RecuperarUsuario(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(RecuperarUsuario, {
            title: 'RecuperacionDeUsuario'
          }),
        },
      },
    })
    datosRecuperacion: RecuperarUsuario,
  ): Promise<Object> {

    // Buscar usuario por cédula
    const usuario = await this.usuarioRepository.findOne({ where: { cedula: datosRecuperacion.cedula } });
    if (!usuario) {
      throw new HttpErrors[403]("No se encuentra el usuario"); // Lanzar error si el usuario no existe
    }
    // Envío de mensaje por email
    const contenido = `Hola ${usuario.nombre}, su usuario es: ${usuario.correo}`;
    await this.notificacionService.EnviarEmail(usuario.correo, Llaves.AsuntoRecuperarUsuario, contenido);
    // Notificación por SMS
    let asunto = `Hola ${usuario.nombre}, su usuario es ${usuario.correo}`;
    this.notificacionService.EnviarSMS(usuario.telefono, asunto);
    return { correo: usuario.correo };

  }
// Crear usuario
@post('/usuarios')
@response(200, {
  description: 'Usuario model instance',
  content: { 'application/json': { schema: getModelSchemaRef(Usuario) } },
})
async crearUsuario(
  @requestBody({
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usuario, {
          title: 'NewUsuario',
          exclude: ['id'],
        }),
      },
    },
  })
  usuario: Omit<Usuario, 'id'>,
): Promise<Usuario> {
  const [usuarioPorCorreo, usuarioPorCedula] = await Promise.all([
    this.usuarioRepository.findOne({ where: { correo: usuario.correo } }),
    this.usuarioRepository.findOne({ where: { cedula: usuario.cedula } }),
  ]);

  const errores: string[] = [];
  if (usuarioPorCorreo) errores.push('El correo electrónico ya está registrado');
  if (usuarioPorCedula) errores.push('La cédula ya está registrada');
  if (errores.length > 0) throw new HttpErrors.BadRequest(errores.join('. '));

  try {
    const { token, expiracion } = this.servicioAutenticacion.GenerarTokenVerificacion();
    console.log(`Token generado: ${token}, Expiración: ${expiracion}`);

    // Asignar token de verificación y estado de correo no verificado
    usuario.tokenVerificacion = token;
    usuario.correoVerificado = false;

    // Guardar el usuario con el token en la base de datos
    const usuarioCreado = await this.usuarioRepository.create(usuario);

    // Enviar el correo de verificación
    const contenido = `Hola ${usuario.nombre}, para activar su cuenta, haga clic en el siguiente enlace: ${Llaves.enlaceVerificacion}/verificar-correo?token=${token}`;
    await this.notificacionService.EnviarEmail(usuario.correo, Llaves.enlaceVerificacion, contenido);
    console.log('Correo de verificación enviado.');

    return usuarioCreado;
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    throw new HttpErrors.InternalServerError('Error al crear el usuario. Inténtelo más tarde.');
  }
}


@get('/verificar-correo')
async verificarCorreo(@param.query.string('token') token: string):  Promise<{ mensaje: string }> {
  try {
    console.log('Token recibido:', token);  // Verifica el token recibido

    // Buscar el usuario usando el token de verificación
    const usuario = await this.usuarioRepository.findOne({ where: { tokenVerificacion: token } });

    if (!usuario) {
      console.error(`Token no encontrado: ${token}`);
      throw new HttpErrors.NotFound('Token de verificación no válido');
    }

    console.log(`Usuario encontrado: ${usuario.id} - Correo: ${usuario.correo}`);

    // Verificar si el correo ya ha sido verificado
    if (usuario.correoVerificado) {
      console.log(`Correo ya verificado para el usuario: ${usuario.correo}`);
      throw new HttpErrors.BadRequest('El correo ya ha sido verificado');
    }

    // Marcar el correo como verificado
    usuario.correoVerificado = true;
    usuario.tokenVerificacion = '';  // Limpiar el token de verificación
    await this.usuarioRepository.updateById(usuario.id, usuario);

    console.log(`Correo verificado para el usuario: ${usuario.correo}`);

    // Generar y cifrar la contraseña
    const clave = this.servicioAutenticacion.GenerarClave();
    console.log(`Clave generada: ${clave}`);
    usuario.contrasena = clave;
    const claveCifrada = this.servicioAutenticacion.CifrarClave(clave);
    usuario.clave = claveCifrada;

    // Actualizar la contraseña del usuario en la base de datos
    await this.usuarioRepository.updateById(usuario.id, usuario);

    // Enviar correo con las credenciales
    const contenido = `Hola ${usuario.nombre}, su usuario es ${usuario.correo} y su contraseña es ${clave}.`;
    await this.notificacionService.EnviarEmail(usuario.correo, Llaves.AsuntoRegistroUsuario, contenido);

    console.log('Correo de confirmación con las credenciales enviado.');

    // Enviar SMS de confirmación
    const enviado = this.notificacionService.EnviarSMS(usuario.telefono, contenido);
    console.log(`SMS enviado: ${enviado}`);

    return { mensaje: 'Verificación exitosa' };
  } catch (error) {
    console.error('Error al verificar el correo:', error);
    throw new HttpErrors.InternalServerError('Error al verificar el correo');
  }
}




  @get('/usuarios/count')
  @response(200, {
    description: 'Usuario model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.count(where);
  }

  @get('/usuarios')
  @response(200, {
    description: 'Array of Usuario model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Usuario, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(Usuario) filter?: Filter<Usuario>,
  ): Promise<Usuario[]> {
    return this.usuarioRepository.find(filter);
  }

  @patch('/usuarios')
  @response(200, {
    description: 'Usuario PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, { partial: true }),
        },
      },
    })
    usuario: Usuario,
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.updateAll(usuario, where);
  }

  @get('/usuarios/{id}')
  @response(200, {
    description: 'Usuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usuario, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Usuario, { exclude: 'where' }) filter?: FilterExcludingWhere<Usuario>
  ): Promise<Usuario> {
    return this.usuarioRepository.findById(id, filter);
  }

  @patch('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, { partial: true }),
        },
      },
    })
    usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.updateById(id, usuario);
  }

  @put('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.replaceById(id, usuario);
  }

  @del('/usuarios/{id}')
  @response(204, {
    description: 'Usuario DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.usuarioRepository.deleteById(id);
  }

  @post('/reset-password')
  @response(200, {
    description: 'Usuario model instance',
    content: { 'application/json': { schema: getModelSchemaRef(ResetearClave) } },
  })
  async resetPassword(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ResetearClave, {

          }),
        },
      },
    })
    resetearClave: ResetearClave,
  ): Promise<Object> {

    let usuario = await this.usuarioRepository.findOne({ where: { correo: resetearClave.correo } })
    if (!usuario) {
      throw new HttpErrors[403]("No se encuentra el usuario")
    }
    const clave = this.servicioAutenticacion.GenerarClave();
    console.log(clave);
    const claveCifrada = this.servicioAutenticacion.CifrarClave(clave);
    console.log(claveCifrada);
    usuario.clave = claveCifrada
    usuario.contrasena = clave
    await this.usuarioRepository.update(usuario);
    const mensaje = `Hola ${usuario.nombre}, su usuario es ${usuario.correo} y  su nueva contrasena es ${usuario.contrasena}`;
    await this.notificacionService.EnviarEmail(usuario.correo, Llaves.AsuntoRestableserClave, mensaje)
    //notificar al Usuario para consumir servicio del@  SMS
    let contenido = `Hola ${usuario.nombre}, su nueva contraseña es ${clave}`;
    let enviado = this.notificacionService.EnviarSMS(usuario.telefono, contenido);
    if (enviado) {
      return {
        enviado: " contraseña actualizada"
      };
    }
    return {
      enviado: "no se puede enviar el mensaje asegurese de tener un numero telefonico real"
    };
  }
}


// TIPOS DE ERRORES DE SERVIDOR

// 1xx: Respuestas Informativas
// - Indican que el servidor ha recibido la solicitud y el cliente debe esperar más información.
// - Ejemplos:
//   100 Continue: El cliente debe continuar con la solicitud.
//   101 Switching Protocols: El servidor acepta cambiar el protocolo (ej. WebSocket).
//   102 Processing: El servidor está procesando la solicitud, pero aún no tiene respuesta.

// 2xx: Respuestas Exitosas
// - Indican que la solicitud fue recibida, entendida y procesada con éxito.
// - Ejemplos:
//   200 OK: La solicitud fue exitosa.
//   201 Created: Se ha creado un recurso en el servidor.
//   202 Accepted: La solicitud fue aceptada, pero el procesamiento está pendiente.
//   204 No Content: Solicitud exitosa, pero sin contenido que devolver.
//   206 Partial Content: Parte del contenido solicitado (descargas parciales).

// 3xx: Redirecciones
// - El cliente debe realizar más acciones para completar la solicitud.
// - Ejemplos:
//   301 Moved Permanently: El recurso se ha movido de forma permanente.
//   302 Found: El recurso está temporalmente en otra ubicación.
//   304 Not Modified: El contenido no ha cambiado desde la última solicitud (útil para caché).
//   307 Temporary Redirect: Redirección temporal usando el mismo método HTTP.

// 4xx: Errores del Cliente
// - Indican problemas con la solicitud enviada por el cliente.
// - Ejemplos:
//   400 Bad Request: La solicitud está mal formada o contiene errores.
//   401 Unauthorized: Se requiere autenticación para acceder al recurso.
//   403 Forbidden: El cliente no tiene permisos para acceder al recurso.
//   404 Not Found: El recurso solicitado no fue encontrado.
//   405 Method Not Allowed: Método HTTP utilizado no está permitido.
//   413 Payload Too Large: La solicitud es demasiado grande para procesar.
//   429 Too Many Requests: El cliente envió demasiadas solicitudes en poco tiempo.

// 5xx: Errores del Servidor
// - Indican fallos internos del servidor al procesar solicitudes válidas.
// - Ejemplos:
//   500 Internal Server Error: Error genérico del servidor.
//   501 Not Implemented: Funcionalidad requerida no soportada.
//   502 Bad Gateway: Problemas de comunicación entre servidores.
//   503 Service Unavailable: Servidor no disponible (sobrecarga o mantenimiento).
//   504 Gateway Timeout: El servidor no recibió respuesta a tiempo de otro servidor.
//   507 Insufficient Storage: No hay suficiente espacio en el servidor.

// ERRORES FRECUENTES FUERA DE HTTP
// - Errores de Configuración: Configuración incorrecta de archivos como .htaccess o SSL/TLS.
// - Errores de Base de Datos: Fallos en consultas SQL o conexiones fallidas.
// - Errores de Dependencias: API externas inaccesibles o fallos en microservicios.
// - Problemas de Recursos: Falta de memoria, espacio en disco o sobreuso de CPU.
// - Problemas de Seguridad: Inyecciones SQL o bloqueos por firewalls.

















