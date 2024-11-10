import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Customer} from './customer.model';

@model({
  settings: {
    foreignKeys: {
      fk_user_customerId: {
        name: 'fk_user_customerId',
        entity: 'Customer',
        entityKey: 'id',
        foreignKey: 'customerId',
      }
    },
  },
})
export class CustomerUser extends Entity {
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
  username: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @belongsTo(() => Customer)
  customerId: number;

  constructor(data?: Partial<CustomerUser>) {
    super(data);
  }
}

export interface CustomerUserRelations {
  // describe navigational properties here
}

export type CustomerUserWithRelations = CustomerUser & CustomerUserRelations;
