import {Entity, model, property} from '@loopback/repository';

@model()
export class Modelocorreo extends Entity {
  @property({
    type: 'string',
    required: true,
  })
  correoDestino: string;

  @property({
    type: 'string',
    required: true,
  })
  nombreDestino: string;

  @property({
    type: 'string',
    required: true,
  })
  asuntoCorreo: string;

  @property({
    type: 'string',
    required: true,
  })
  contenidoCorreo: string;


  constructor(data?: Partial<Modelocorreo>) {
    super(data);
  }
}

export interface ModelocorreoRelations {
  // describe navigational properties here
}

export type ModelocorreoWithRelations = Modelocorreo & ModelocorreoRelations;
