/* eslint-disable @typescript-eslint/naming-convention */
import { /* inject, */ BindingScope, injectable } from '@loopback/core';
import { Llaves } from '../config/llaves';
require('dotenv').config();
const sgMail = require('@sendgrid/mail')

@injectable({ scope: BindingScope.TRANSIENT })
export class NotificacionService {
  constructor(/* Add @inject to inject parameters */) { }

  // servicio de notificacion por correo electronico
  async  EnviarEmail(destino: string, asunto: string, contenido: string): Promise<boolean> {
    try {
      // Configura la API key de SendGrid
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      // Definimos el mensaje de correo
      const msg = {
        to: destino,
        from: Llaves.emailFrom,
        subject: asunto,
        html: contenido,
       // template_id: 'd-c7d81c859689479a8d5204148c050ccc',
       /* dynamic_template_data: {
          contenido,
          redes: "hola",
        },*/
      };

      // Enviar el correo
      await sgMail.send(msg);
      console.log('Correo enviado exitosamente');
      return true;
    } catch (error: unknown) {
      // Definimos un tipo específico para los errores de SendGrid
      interface SendGridError {
        response: { body: unknown };
      }

      // Manejo de errores: determinamos el tipo de error y mostramos un mensaje apropiado
      if (typeof error === 'object' && error !== null && 'response' in error) {
        console.error('Error en la respuesta de SendGrid:', (error as SendGridError).response.body);
      } else if (error instanceof Error) {
        console.error('Error al enviar el correo:', error.message);
      } else {
        console.error('Error desconocido:', error);
      }

      return false;
    }
  }

  EnviarSMS(TelefonoDestino: string, Mensaje: string): boolean {
    try {
      // Configuramos las credenciales de Twilio
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const client = require("twilio")(accountSid, authToken);

      // Enviamos el mensaje SMS
      client.messages.create({
        body: Mensaje,
        to: TelefonoDestino,
        from: Llaves.TwilioPhone,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }).then((message: { sid: any }) => {
        console.log('Mensaje enviado con SID:', message.sid);
      }).catch((error: Error) => {
        // Manejo de error en la promesa
        console.error('Error al enviar SMS:', error.message);
        return false;
      });

      // Devolvemos true si no hay errores al configurar el envío
      return true;
    } catch (error) {
      // Manejo de errores en el bloque try
      console.error('Error desconocido al configurar el envío de SMS:', error);
      return false;
    }
  }




}







