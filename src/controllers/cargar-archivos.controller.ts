

import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  HttpErrors, param, post,
  Request,
  requestBody,
  Response,
  RestBindings
} from '@loopback/rest';
import multer from 'multer';
import path from 'path';
import {Keys as llaves} from '../config/keys';
import {Image} from '../models';
import {ImageRepository} from '../repositories';

export class CargarArchivosController {
  constructor(
    @repository(ImageRepository)
    private imageRepository: ImageRepository
  ) { }



  /**
   *
   * @param response
   * @param request
   */
  @post('/CargarImagenProducto/{id_producto}', {
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
            },
          },
        },
        description: 'Función de carga de la imagen de un producto.',
      },
    },
  })
  async cargarImagenDelProducto(
    @inject(RestBindings.Http.RESPONSE) response: Response,
    @requestBody.file() request: Request,
    @param.path.string("id_producto") id_producto: string
  ): Promise<object | false> {
    const rutaImagenProducto = path.join(__dirname, llaves.carpetaImagenProducto);
    let res = await this.StoreFileToPath(rutaImagenProducto, llaves.nombreCampoImagenProducto, request, response, llaves.extensionesPermitidasIMG);
    if (res) {
      const nombre_archivo = response.req?.file?.filename;
      if (nombre_archivo) {
        let img = new Image();
        img.name = nombre_archivo;
        img.productId = id_producto;
        await this.imageRepository.save(img);
        return {filename: nombre_archivo};
      }
    }
    return res;
  }


  /**
   *
   * @param response
   * @param request
   */
  @post('/CargarImagenPrincipalProducto', {
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
            },
          },
        },
        description: 'Función de carga de la imagen de un producto.',
      },
    },
  })
  async cargarImagenPrincipalDelProducto(
    @inject(RestBindings.Http.RESPONSE) response: Response,
    @requestBody.file() request: Request
  ): Promise<object | false> {
    const rutaImagenProducto = path.join(__dirname, llaves.carpetaImagenProducto);
    let res = await this.StoreFileToPath(rutaImagenProducto, llaves.nombreCampoImagenProducto, request, response, llaves.extensionesPermitidasIMG);
    if (res) {
      const nombre_archivo = response.req?.file?.filename;
      if (nombre_archivo) {
        return {filename: nombre_archivo};
      }
    }
    return res;
  }

  /**
   *
   * @param response
   * @param request
   */
  @post('/CargarDocumentoPersona', {
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
            },
          },
        },
        description: 'Función de carga de documentos de la persona.',
      },
    },
  })
  async DocumentosPersona(
    @inject(RestBindings.Http.RESPONSE) response: Response,
    @requestBody.file() request: Request,
  ): Promise<object | false> {
    const rutaDocumentoPersona = path.join(__dirname, llaves.carpetaDocumentoPersona);
    let res = await this.StoreFileToPath(rutaDocumentoPersona, llaves.nombreCampoDocumentoPersona, request, response, llaves.extensionesPermitidasDOC);
    if (res) {
      const nombre_archivo = response.req?.file?.filename;
      if (nombre_archivo) {
        return {filename: nombre_archivo};
      }
    }
    return res;
  }


  /**
   * Return a config for multer storage
   * @param path
   */
  private GetMulterStorageConfig(path: string) {
    var filename: string = '';
    const storage = multer.diskStorage({
      destination: function (req: any, file: any, cb: any) {
        cb(null, path)
      },
      filename: function (req: any, file: any, cb: any) {
        filename = `${Date.now()}-${file.originalname}`
        cb(null, filename);
      }
    });
    return storage;
  }

  /**
   * store the file in a specific path
   * @param storePath
   * @param request
   * @param response
   */
  private StoreFileToPath(storePath: string, fieldname: string, request: Request, response: Response, acceptedExt: string[]): Promise<object> {
    return new Promise<object>((resolve, reject) => {
      const storage = this.GetMulterStorageConfig(storePath);
      const upload = multer({
        storage: storage,
        fileFilter: function (req: any, file: any, callback: any) {
          var ext = path.extname(file.originalname).toUpperCase();
          if (acceptedExt.includes(ext)) {
            return callback(null, true);
          }
          return callback(new HttpErrors[400]('El formato del archivo no es permitido.'));
        },
        limits: {
          fileSize: llaves.tamMaxImagenProducto
        }
      },
      ).single(fieldname);
      upload(request, response, (err: any) => {
        if (err) {
          reject(err);
        }
        resolve(response);
      });
    });
  }

}
