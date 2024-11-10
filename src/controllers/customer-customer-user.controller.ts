import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  Customer,
  CustomerUser,
} from '../models';
import { CustomerRepository } from '../repositories/customer.repository';

export class CustomerCustomerUserController {
  constructor(
    @repository(CustomerRepository) protected customerRepository: CustomerRepository,
  ) { }

  @get('/customers/{id}/customer-user', {
    responses: {
      '200': {
        description: 'Customer has one CustomerUser',
        content: {
          'application/json': {
            schema: getModelSchemaRef(CustomerUser),
          },
        },
      },
    },
  })
  async get(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<CustomerUser>,
  ): Promise<CustomerUser> {
    return this.customerRepository.customerUser(id).get(filter);
  }

  @post('/customers/{id}/customer-user', {
    responses: {
      '200': {
        description: 'Customer model instance',
        content: {'application/json': {schema: getModelSchemaRef(CustomerUser)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Customer.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CustomerUser, {
            title: 'NewCustomerUserInCustomer',
            exclude: ['id'],
            optional: ['customerId']
          }),
        },
      },
    }) customerUser: Omit<CustomerUser, 'id'>,
  ): Promise<CustomerUser> {
    return this.customerRepository.customerUser(id).create(customerUser);
  }

  @patch('/customers/{id}/customer-user', {
    responses: {
      '200': {
        description: 'Customer.CustomerUser PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CustomerUser, {partial: true}),
        },
      },
    })
    customerUser: Partial<CustomerUser>,
    @param.query.object('where', getWhereSchemaFor(CustomerUser)) where?: Where<CustomerUser>,
  ): Promise<Count> {
    return this.customerRepository.customerUser(id).patch(customerUser, where);
  }

  @del('/customers/{id}/customer-user', {
    responses: {
      '200': {
        description: 'Customer.CustomerUser DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(CustomerUser)) where?: Where<CustomerUser>,
  ): Promise<Count> {
    return this.customerRepository.customerUser(id).delete(where);
  }
}
