import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {ProductsInvoice, ProductsInvoiceRelations} from '../models';

export class ProductsInvoiceRepository extends DefaultCrudRepository<
  ProductsInvoice,
  typeof ProductsInvoice.prototype.id,
  ProductsInvoiceRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(ProductsInvoice, dataSource);
  }
}
