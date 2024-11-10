import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class CorreoVerificado extends Entity {
  @property({
    type: 'boolean',
    default: false,
  })
  correoVerificado?: boolean;

  @property({
    type: 'string',
  })
  tokenverifivado?: string;

  constructor(data?: Partial<CorreoVerificado>) {
    super(data);
  }
}

export interface CorreoVerificadoRelations {
  // describe navigational properties here
}

export type CorreoVerificadoWithRelations = CorreoVerificado & CorreoVerificadoRelations;
