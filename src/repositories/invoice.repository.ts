import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyThroughRepositoryFactory, BelongsToAccessor} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Invoice, InvoiceRelations, Product, ProductsInvoice, Customer} from '../models';
import {ProductsInvoiceRepository} from './products-invoice.repository';
import {ProductRepository} from './product.repository';
import {CustomerRepository} from './customer.repository';

export class InvoiceRepository extends DefaultCrudRepository<
  Invoice,
  typeof Invoice.prototype.id,
  InvoiceRelations
> {

  public readonly products: HasManyThroughRepositoryFactory<Product, typeof Product.prototype.id,
          ProductsInvoice,
          typeof Invoice.prototype.id
        >;

  public readonly customer: BelongsToAccessor<Customer, typeof Invoice.prototype.id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('ProductsInvoiceRepository') protected productsInvoiceRepositoryGetter: Getter<ProductsInvoiceRepository>, @repository.getter('ProductRepository') protected productRepositoryGetter: Getter<ProductRepository>, @repository.getter('CustomerRepository') protected customerRepositoryGetter: Getter<CustomerRepository>,
  ) {
    super(Invoice, dataSource);
    this.customer = this.createBelongsToAccessorFor('customer', customerRepositoryGetter,);
    this.registerInclusionResolver('customer', this.customer.inclusionResolver);
    this.products = this.createHasManyThroughRepositoryFactoryFor('products', productRepositoryGetter, productsInvoiceRepositoryGetter,);
    this.registerInclusionResolver('products', this.products.inclusionResolver);
  }
}
