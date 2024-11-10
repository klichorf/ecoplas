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
  Invoice,
} from '../models';
import { CustomerRepository } from '../repositories/customer.repository';

export class CustomerInvoiceController {
  constructor(
    @repository(CustomerRepository) protected customerRepository: CustomerRepository,
  ) { }

  @get('/customers/{id}/invoices', {
    responses: {
      '200': {
        description: 'Array of Customer has many Invoice',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Invoice)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Invoice>,
  ): Promise<Invoice[]> {
    return this.customerRepository.invoices(id).find(filter);
  }

  @post('/customers/{id}/invoices', {
    responses: {
      '200': {
        description: 'Customer model instance',
        content: {'application/json': {schema: getModelSchemaRef(Invoice)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Customer.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Invoice, {
            title: 'NewInvoiceInCustomer',
            exclude: ['id'],
            optional: ['customerId']
          }),
        },
      },
    }) invoice: Omit<Invoice, 'id'>,
  ): Promise<Invoice> {
    return this.customerRepository.invoices(id).create(invoice);
  }

  @patch('/customers/{id}/invoices', {
    responses: {
      '200': {
        description: 'Customer.Invoice PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Invoice, {partial: true}),
        },
      },
    })
    invoice: Partial<Invoice>,
    @param.query.object('where', getWhereSchemaFor(Invoice)) where?: Where<Invoice>,
  ): Promise<Count> {
    return this.customerRepository.invoices(id).patch(invoice, where);
  }

  @del('/customers/{id}/invoices', {
    responses: {
      '200': {
        description: 'Customer.Invoice DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Invoice)) where?: Where<Invoice>,
  ): Promise<Count> {
    return this.customerRepository.invoices(id).delete(where);
  }
}
