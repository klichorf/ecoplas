import {Model, model, property} from '@loopback/repository';

@model()
export class RecuperarUsuario extends Model {
  @property({
    type: 'string',
    required: true,
  })
  cedula: string;


  constructor(data?: Partial<RecuperarUsuario>) {
    super(data);
  }
}

export interface RecuperarUsuarioRelations {
  // describe navigational properties here
}

export type RecuperarUsuarioWithRelations = RecuperarUsuario & RecuperarUsuarioRelations;
