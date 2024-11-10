import {Entity, model, property, hasMany, belongsTo} from '@loopback/repository';
import {Mascota} from './mascota.model';
import { Login } from './login.model';
import {Rol} from './rol.model';

@model()
export class Usuario extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  cedula: string;

  @property({
    type: 'string',
    required: true,
  })
  nombre: string;

  @property({
    type: 'string',
    required: true,
  })
  apellido: string;

  @property({
    type: 'string',
    required: true,
  })
  telefono: string;

  @property({
    type: 'string',
    required: true,
  })
  correo: string;

  @property({
    type: 'string',
    required: false,
  })
  contrasena: string;

  @property({
    type: 'string',
    required: false,
  })
  clave?: string;



  @property({
    type: 'boolean',
    default: true,
  })
  estado?: boolean;


  @property({
    type: 'string',
    required: false,
  })
  tokenVerificacion?: string;

  @property({
    type: 'boolean',
    default: false, 
  })
  correoVerificado?: boolean;


  @hasMany(() => Mascota)
  mascotas: Mascota[];



  @belongsTo(() => Rol, {name: 'tiene_un'})
  rolId: string;

  @hasMany(() => Login)
  logins: Login[];

  constructor(data?: Partial<Usuario>) {
    super(data);
  }
}

export interface UsuarioRelations {
  // describe navigational properties here
}

export type UsuarioWithRelations = Usuario & UsuarioRelations;
