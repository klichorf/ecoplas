/* eslint-disable @typescript-eslint/no-shadow */
import { inject, lifeCycleObserver, LifeCycleObserver } from '@loopback/core';
import { juggler } from '@loopback/repository';
import { Llaves } from '../config/llaves';
import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { URL } from 'url';  // Importamos la API de URL de WhatWG
dotenv.config();

// Verificamos si la cadena de conexión está definida
if (!Llaves.CadenaConectionMongo) {
  throw new Error("La cadena de conexión a MongoDB no está definida.");
}

const mongoUrl = new URL(Llaves.CadenaConectionMongo); // Creamos un objeto URL de la cadena de conexión

const config = {
  name: 'mongodb',
  connector: 'mongodb',
  url: mongoUrl.toString(),  // Usamos el URL estándar aquí
  host: 'localhost',
  port: 27017,
  user: '',
  database: 'seguridad_ventas',
  password: '',
  useNewUrlParser: true
};

/** Observe application's life cycle to disconnect the datasource when
** application is stopped. This allows the application to be shut down
** gracefully. The `stop()` method is inherited from `juggler.DataSource`.
* Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
*/
@lifeCycleObserver('datasource')
export class MongodbDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'mongodb';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.mongodb', { optional: true })
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}

// Función para probar la conexión a MongoDB
async function testConnection() {
  if (!Llaves.CadenaConectionMongo) {
    console.error("La cadena de conexión a MongoDB no está definida.");
    return;
  }

  const mongoUrl = new URL(Llaves.CadenaConectionMongo); // Creamos un objeto URL de la cadena de conexión
  const client = new MongoClient(mongoUrl.toString());  // Usamos la URL convertida a string
  try {
    await client.connect();
    console.log("Conectado correctamente a MongoDB");
  } catch (err) {
    console.error("Error conectando a MongoDB:", err);
  } finally {
    await client.close();
  }
}

// Llamar a la función de prueba de conexión
testConnection().catch(err => console.error("Error al probar la conexión:", err));
