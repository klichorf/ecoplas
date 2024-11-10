import { inject, Getter } from '@loopback/core';
import { DefaultCrudRepository, repository, HasManyThroughRepositoryFactory, HasManyRepositoryFactory, BelongsToAccessor } from '@loopback/repository';
import { MongodbDataSource } from '../datasources';
import { Product, ProductRelations, Category, ProductCategory, Image, Brand } from '../models';
import { ProductCategoryRepository } from './product-category.repository';
import { CategoryRepository } from './category.repository';
import { ImageRepository } from './image.repository';

export class ProductRepository extends DefaultCrudRepository<
  Product,
  typeof Product.prototype.id,
  ProductRelations
> {


  public readonly categories: HasManyThroughRepositoryFactory<Category, typeof Category.prototype.id,
    ProductCategory,
    typeof Product.prototype.id
  >;

  public readonly images: HasManyRepositoryFactory<Image, typeof Product.prototype.id>;

  public readonly brand: BelongsToAccessor<Brand, typeof Product.prototype.id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('ProductCategoryRepository') protected productCategoryRepositoryGetter: Getter<ProductCategoryRepository>, @repository.getter('CategoryRepository') protected categoryRepositoryGetter: Getter<CategoryRepository>,
  ) {
    super(Product, dataSource);
    this.categories = this.createHasManyThroughRepositoryFactoryFor('categories', categoryRepositoryGetter, productCategoryRepositoryGetter,);
    this.registerInclusionResolver('categories', this.categories.inclusionResolver);
  }
}
