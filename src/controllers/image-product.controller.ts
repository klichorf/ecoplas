import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Image,
  Product,
} from '../models';
import {ImageRepository} from '../repositories';

export class ImageProductController {
  constructor(
    @repository(ImageRepository)
    public imageRepository: ImageRepository,
  ) { }

  @get('/images/{id}/product', {
    responses: {
      '200': {
        description: 'Product belonging to Image',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Product)},
          },
        },
      },
    },
  })
  async getProduct(
    @param.path.string('id') id: typeof Image.prototype.id,
  ): Promise<Product> {
    return this.imageRepository.pertenece_a_producto(id);
  }
}
