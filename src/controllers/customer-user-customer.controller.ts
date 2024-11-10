import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  CustomerUser,
  Customer,
} from '../models';
import { CustomerUserRepository } from '../repositories/customer-user.repository';

export class CustomerUserCustomerController {
  constructor(
    @repository(CustomerUserRepository)
    public customerUserRepository: CustomerUserRepository,
  ) { }

  @get('/customer-users/{id}/customer', {
    responses: {
      '200': {
        description: 'Customer belonging to CustomerUser',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Customer)},
          },
        },
      },
    },
  })
  async getCustomer(
    @param.path.number('id') id: typeof CustomerUser.prototype.id,
  ): Promise<Customer> {
    return this.customerUserRepository.customer(id);
  }
}
