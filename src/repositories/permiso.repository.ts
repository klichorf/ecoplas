import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Permiso, PermisoRelations} from '../models';

export class PermisoRepository extends DefaultCrudRepository<
  Permiso,
  typeof Permiso.prototype._id,
  PermisoRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(Permiso, dataSource);
  }
}
