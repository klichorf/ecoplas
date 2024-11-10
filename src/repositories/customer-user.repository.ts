import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {CustomerUser, CustomerUserRelations, Customer} from '../models';
import {CustomerRepository} from './customer.repository';

export class CustomerUserRepository extends DefaultCrudRepository<
  CustomerUser,
  typeof CustomerUser.prototype.id,
  CustomerUserRelations
> {

  public readonly customer: BelongsToAccessor<Customer, typeof CustomerUser.prototype.id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('CustomerRepository') protected customerRepositoryGetter: Getter<CustomerRepository>,
  ) {
    super(CustomerUser, dataSource);
    this.customer = this.createBelongsToAccessorFor('customer', customerRepositoryGetter,);
    this.registerInclusionResolver('customer', this.customer.inclusionResolver);
  }
}
