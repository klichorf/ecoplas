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
import { Product } from '../models';
import { Invoice, } from '../models/invoice.model';

import { InvoiceRepository } from '../repositories/invoice.repository';

export class InvoiceProductController {
  constructor(
    @repository(InvoiceRepository) protected invoiceRepository: InvoiceRepository,
  ) { }

  @get('/invoices/{id}/products', {
    responses: {
      '200': {
        description: 'Array of Invoice has many Product through ProductsInvoice',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Product)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Product>,
  ): Promise<Product[]> {
    return this.invoiceRepository.products(id).find(filter);
  }

  @post('/invoices/{id}/products', {
    responses: {
      '200': {
        description: 'create a Product model instance',
        content: {'application/json': {schema: getModelSchemaRef(Product)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Invoice.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Product, {
            title: 'NewProductInInvoice',
            exclude: ['id'],
          }),
        },
      },
    }) product: Omit<Product, 'id'>,
  ): Promise<Product> {
    return this.invoiceRepository.products(id).create(product);
  }

  @patch('/invoices/{id}/products', {
    responses: {
      '200': {
        description: 'Invoice.Product PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Product, {partial: true}),
        },
      },
    })
    product: Partial<Product>,
    @param.query.object('where', getWhereSchemaFor(Product)) where?: Where<Product>,
  ): Promise<Count> {
    return this.invoiceRepository.products(id).patch(product, where);
  }

  @del('/invoices/{id}/products', {
    responses: {
      '200': {
        description: 'Invoice.Product DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Product)) where?: Where<Product>,
  ): Promise<Count> {
    return this.invoiceRepository.products(id).delete(where);
  }
}
