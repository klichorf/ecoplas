import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Invoice} from '../models';
import { InvoiceRepository } from '../repositories/invoice.repository';

export class InvoiceController {
  constructor(
    @repository(InvoiceRepository)
    public invoiceRepository : InvoiceRepository,
  ) {}

  @post('/invoices')
  @response(200, {
    description: 'Invoice model instance',
    content: {'application/json': {schema: getModelSchemaRef(Invoice)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Invoice, {
            title: 'NewInvoice',
            exclude: ['id'],
          }),
        },
      },
    })
    invoice: Omit<Invoice, 'id'>,
  ): Promise<Invoice> {
    return this.invoiceRepository.create(invoice);
  }

  @get('/invoices/count')
  @response(200, {
    description: 'Invoice model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Invoice) where?: Where<Invoice>,
  ): Promise<Count> {
    return this.invoiceRepository.count(where);
  }

  @get('/invoices')
  @response(200, {
    description: 'Array of Invoice model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Invoice, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Invoice) filter?: Filter<Invoice>,
  ): Promise<Invoice[]> {
    return this.invoiceRepository.find(filter);
  }

  @patch('/invoices')
  @response(200, {
    description: 'Invoice PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Invoice, {partial: true}),
        },
      },
    })
    invoice: Invoice,
    @param.where(Invoice) where?: Where<Invoice>,
  ): Promise<Count> {
    return this.invoiceRepository.updateAll(invoice, where);
  }

  @get('/invoices/{id}')
  @response(200, {
    description: 'Invoice model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Invoice, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Invoice, {exclude: 'where'}) filter?: FilterExcludingWhere<Invoice>
  ): Promise<Invoice> {
    return this.invoiceRepository.findById(id, filter);
  }

  @patch('/invoices/{id}')
  @response(204, {
    description: 'Invoice PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Invoice, {partial: true}),
        },
      },
    })
    invoice: Invoice,
  ): Promise<void> {
    await this.invoiceRepository.updateById(id, invoice);
  }

  @put('/invoices/{id}')
  @response(204, {
    description: 'Invoice PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() invoice: Invoice,
  ): Promise<void> {
    await this.invoiceRepository.replaceById(id, invoice);
  }

  @del('/invoices/{id}')
  @response(204, {
    description: 'Invoice DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.invoiceRepository.deleteById(id);
  }
}
