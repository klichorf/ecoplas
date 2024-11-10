import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import { Brand,BrandRelations,Product } from '../models/brand.model';
import {ProductRepository} from './product.repository';

export class BrandRepository extends DefaultCrudRepository<
  Brand,
  typeof Brand.prototype.id,
  BrandRelations
> {

  public readonly products: HasManyRepositoryFactory<Product, typeof Brand.prototype.id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('ProductRepository') protected productRepositoryGetter: Getter<ProductRepository>,
  ) {
    super(Brand, dataSource);
    this.products = this.createHasManyRepositoryFactoryFor('products', productRepositoryGetter,);
    this.registerInclusionResolver('products', this.products.inclusionResolver);
  }
}
