import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory, HasOneRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Customer, CustomerRelations, Invoice, Address, CustomerUser} from '../models';
import {InvoiceRepository} from './invoice.repository';
import {AddressRepository} from './address.repository';
import {CustomerUserRepository} from './customer-user.repository';

export class CustomerRepository extends DefaultCrudRepository<
  Customer,
  typeof Customer.prototype.id,
  CustomerRelations
> {

  public readonly invoices: HasManyRepositoryFactory<Invoice, typeof Customer.prototype.id>;

  public readonly address: HasOneRepositoryFactory<Address, typeof Customer.prototype.id>;

  public readonly customerUser: HasOneRepositoryFactory<CustomerUser, typeof Customer.prototype.id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('InvoiceRepository') protected invoiceRepositoryGetter: Getter<InvoiceRepository>, @repository.getter('AddressRepository') protected addressRepositoryGetter: Getter<AddressRepository>, @repository.getter('CustomerUserRepository') protected customerUserRepositoryGetter: Getter<CustomerUserRepository>,
  ) {
    super(Customer, dataSource);
    this.customerUser = this.createHasOneRepositoryFactoryFor('customerUser', customerUserRepositoryGetter);
    this.registerInclusionResolver('customerUser', this.customerUser.inclusionResolver);
    this.address = this.createHasOneRepositoryFactoryFor('address', addressRepositoryGetter);
    this.registerInclusionResolver('address', this.address.inclusionResolver);
    this.invoices = this.createHasManyRepositoryFactoryFor('invoices', invoiceRepositoryGetter,);
    this.registerInclusionResolver('invoices', this.invoices.inclusionResolver);
  }
}
