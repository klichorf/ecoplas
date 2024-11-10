import {belongsTo, Entity, hasMany, model, property} from '@loopback/repository';
import {Brand} from './brand.model';
import {Category} from './category.model';
import {Image} from './image.model';
import {ProductCategory} from './product-category.model';

@model({
  settings: {
    foreignKeys: {
      fk_product_brandId: {
        name: 'fk_product_brandId',
        entity: 'Brand',
        entityKey: 'id',
        foreignKey: 'brandId',
      }
    },
  },
})
export class Product extends Entity {
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
    required: true,
  })
  main_image: string;

  @property({
    type: 'number',
    required: true,
  })
  price: number;

  @property({
    type: 'number',
    required: true,
  })
  stock: number;

  @property({
    type: 'number',
    default: 0,
  })
  stars?: number;

  @property({
    type: 'number',
    default: 0,
  })
  discount?: number;



  @hasMany(() => Image)
  images: Image[];

  @belongsTo(() => Brand)
  brandId: number;

  @belongsTo(() => Brand, {name: 'has_brand'})
  id_brand: string;

  @hasMany(() => Category, {through: {model: () => ProductCategory, keyFrom: 'id_product', keyTo: 'id_category'}})
  categories: Category[];

  constructor(data?: Partial<Product>) {
    super(data);
  }
}

export interface ProductRelations {
  // describe navigational properties here
}

export type ProductWithRelations = Product & ProductRelations;
