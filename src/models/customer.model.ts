import {Entity, model, property, hasMany, hasOne} from '@loopback/repository';
import {Invoice} from './invoice.model';
import {Address} from './address.model';
import {CustomerUser} from './customer-user.model';

@model()
export class Customer extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  identification: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  cellphone: string;

  @property({
    type: 'number',
    default: 1,
  })
  status?: number;

  @hasMany(() => Invoice)
  invoices: Invoice[];

  @hasOne(() => Address)
  address: Address;

  @hasOne(() => CustomerUser)
  customerUser: CustomerUser;

  constructor(data?: Partial<Customer>) {
    super(data);
  }
}

export interface CustomerRelations {
  // describe navigational properties here
}

export type CustomerWithRelations = Customer & CustomerRelations;
