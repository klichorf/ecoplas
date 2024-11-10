import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import { Image,ImageRelations } from '../models/image.model';
import {Product} from '../models';
import {ProductRepository} from './product.repository';

export class ImageRepository extends DefaultCrudRepository<
  Image,
  typeof Image.prototype.id,
  ImageRelations
> {

  public readonly pertenece_a_producto: BelongsToAccessor<Product, typeof Image.prototype.id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('ProductRepository') protected productRepositoryGetter: Getter<ProductRepository>,
  ) {
    super(Image, dataSource);
    this.pertenece_a_producto = this.createBelongsToAccessorFor('pertenece_a_producto', productRepositoryGetter,);
    this.registerInclusionResolver('pertenece_a_producto', this.pertenece_a_producto.inclusionResolver);
  }
}
