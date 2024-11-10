import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory, HasOneRepositoryFactory, BelongsToAccessor} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Usuario, UsuarioRelations, Mascota, Rol, Login} from '../models';
import {MascotaRepository} from './mascota.repository';
import {RolRepository} from './rol.repository';
import {LoginRepository} from './login.repository';

export class UsuarioRepository extends DefaultCrudRepository<
  Usuario,
  typeof Usuario.prototype.id,
  UsuarioRelations
> {

  public readonly mascotas: HasManyRepositoryFactory<Mascota, typeof Usuario.prototype.id>;

  public readonly tiene_un: BelongsToAccessor<Rol, typeof Usuario.prototype.id>;

  public readonly logins: HasManyRepositoryFactory<Login, typeof Usuario.prototype.id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('MascotaRepository') protected mascotaRepositoryGetter: Getter<MascotaRepository>, @repository.getter('RolRepository') protected rolRepositoryGetter: Getter<RolRepository>, @repository.getter('LoginRepository') protected loginRepositoryGetter: Getter<LoginRepository>,
  ) {
    super(Usuario, dataSource);
    this.logins = this.createHasManyRepositoryFactoryFor('logins', loginRepositoryGetter,);
    this.registerInclusionResolver('logins', this.logins.inclusionResolver);
    this.tiene_un = this.createBelongsToAccessorFor('tiene_un', rolRepositoryGetter,);
    this.registerInclusionResolver('tiene_un', this.tiene_un.inclusionResolver);
    
    this.mascotas = this.createHasManyRepositoryFactoryFor('mascotas', mascotaRepositoryGetter,);
    this.registerInclusionResolver('mascotas', this.mascotas.inclusionResolver);
  }
}
