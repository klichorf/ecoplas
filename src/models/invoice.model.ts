import {belongsTo, Entity, hasMany, model, property} from '@loopback/repository';
import {Customer} from './customer.model';
import {Product} from './product.model';
import {ProductsInvoice} from './products-invoice.model';

@model({
  settings: {
    foreignKeys: {
      fk_invoice_customerId: {
        name: 'fk_invoice_customerId',
        entity: 'Customer',
        entityKey: 'id',
        foreignKey: 'customerId',
      }
    },
  },
})
export class Invoice extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'number',
    required: true,
  })
  invoice_number: number;

  @property({
    type: 'date',
    required: true,
  })
  invoice_date: string;

  @property({
    type: 'string',
    default: '',
  })
  invoice_time?: string;

  @hasMany(() => Product, {through: {model: () => ProductsInvoice}})
  products: Product[];

  @belongsTo(() => Customer)
  customerId: number;

  constructor(data?: Partial<Invoice>) {
    super(data);
  }
}

export interface InvoiceRelations {
  // describe navigational properties here
}

export type InvoiceWithRelations = Invoice & InvoiceRelations;
