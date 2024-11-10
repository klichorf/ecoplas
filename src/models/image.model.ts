import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Product} from './product.model';

@model({

  settings: {
    foreignKeys: {
      fk_image_productId: {
        name: 'fk_image_productId',
        entity: 'Product',
        entityKey: 'id',
        foreignKey: 'productId',
      }
    },
  },


})
export class Image extends Entity {
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
  name: string;


  @property({
    type: 'string',
  })
  productId?: string;

  @belongsTo(() => Product, {name: 'pertenece_a_producto'})
  id_product: string;

  constructor(data?: Partial<Image>) {
    super(data);
  }
}

export interface ImageRelations {
  // describe navigational properties here
}

export type ImageWithRelations = Image & ImageRelations;
