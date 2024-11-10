import {Model, model, property} from '@loopback/repository';

@model()
export class DobleFactorAutenticacion extends Model {
  @property({
    type: 'string',
    required: true,
  })
  usuarioId: string;

  @property({
    type: 'string',
    required: true,
  })
  codigo2fa: string;


  constructor(data?: Partial<DobleFactorAutenticacion>) {
    super(data);
  }
}

export interface DobleFactorAutenticacionRelations {
  // describe navigational properties here
}

export type DobleFactorAutenticacionWithRelations = DobleFactorAutenticacion & DobleFactorAutenticacionRelations;
