import {Entity, model, property} from '@loopback/repository';

@model()
export class ProductCategory extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
  })
  id_product?: string;

  @property({
    type: 'string',
  })
  id_category?: string;

  constructor(data?: Partial<ProductCategory>) {
    super(data);
  }
}

export interface ProductCategoryRelations {
  // describe navigational properties here
}

export type ProductCategoryWithRelations = ProductCategory & ProductCategoryRelations;
