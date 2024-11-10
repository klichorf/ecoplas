/* eslint-disable @typescript-eslint/naming-convention */
import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    foreignKeys: {
      fk_address_customerId: {
        name: 'fk_address_customerId',
        entity: 'Customer',
        entityKey: 'id',
        foreignKey: 'customerId',
      }
    },
  },
})
export class Address extends Entity {
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
  street: string;

  @property({
    type: 'string',
    required: true,
  })
  address_number: string;

  @property({
    type: 'number',
  })
  customerId?: number;

  constructor(data?: Partial<Address>) {
    super(data);
  }
}

export interface AddressRelations {
  // describe navigational properties here
}

export type AddressWithRelations = Address & AddressRelations;
