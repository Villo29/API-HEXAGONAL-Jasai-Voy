import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import mongoose from 'mongoose';
import router from '../adapters/routes/index';
import axios from 'axios';
import Notification from '../domain/models/notifation';

dotenv.config();

const app = express();
const port = process.env.PORT || 3029;

// Verificar si el Access Token está configurado
if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  console.error('ERROR: MERCADO_PAGO_ACCESS_TOKEN no está configurado.');
  process.exit(1);
}

// Configurar Mongoose
mongoose.connect(process.env.MONGODB_URI || '')
  .then(() => {
    console.log('Conectado a la base de datos MongoDB');
  })
  .catch((error) => {
    console.error('Error al conectar a la base de datos MongoDB', error);
  });

app.use(cors());
app.use(express.json());

// Ruta para procesar el pago
app.post('/api/pago', async (req: Request, res: Response) => {
  try {
    const preferenceData = {
      ...req.body,
      back_urls: {
        success: 'https://a949-200-63-41-50.ngrok-free.app/success',
        failure: 'https://a949-200-63-41-50.ngrok-free.app/failure',
        pending: 'https://a949-200-63-41-50.ngrok-free.app/pending'
      },
      notification_url: 'https://a949-200-63-41-50.ngrok-free.app/api/webhook'
    };
    //console.log('Recibido preferenceData:', preferenceData);

    // Crea una preferencia de pago usando la API de Mercado Pago
    const preferenceResponse = await axios.post('https://api.mercadopago.com/checkout/preferences', preferenceData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
      }
    });

    if (preferenceResponse.status !== 200 && preferenceResponse.status !== 201) {
      console.error('Error en la respuesta de Mercado Pago:', preferenceResponse.data);
      return res.status(preferenceResponse.status).json({ detail: preferenceResponse.data });
    }

    const preference = preferenceResponse.data;
    console.log('Respuesta de la preferencia:', preference);

    // Devolver la respuesta al cliente con el link de pago válido
    return res.json({
      init_point: preference.init_point,
      preference_id: preference.id
    });
  } catch (error: any) {
    console.error('Error al procesar el pago:', error);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
      res.status(error.response.status).json({ detail: error.response.data });
    } else if (error.request) {
      console.error('No se recibió respuesta de Mercado Pago:', error.request);
      res.status(500).json({ detail: 'No se recibió respuesta del servidor de Mercado Pago.' });
    } else {
      console.error('Error message:', error.message);
      res.status(500).json({ detail: error.message });
    }
  }
});

// Webhook para recibir notificaciones de MercadoPago
app.post('/api/webhook', async (req: Request, res: Response) => {
  try {
    // Obtenemos el contenido de la notificación
    const notificacion = req.body;
    console.log('Recibida notificación:', notificacion);

    // Guardar la notificación en la base de datos si los datos no son nulos
    if (notificacion && notificacion.resource && notificacion.topic) {
      const nuevaNotificacion = new Notification({
        resource: notificacion.resource,
        topic: notificacion.topic,
        data: notificacion.data || null,
        date_created: notificacion.date_created || null
      });
      await nuevaNotificacion.save();
      console.log('Notificación guardada en la base de datos');
    }

    // Verificamos si el evento es de un pago
    const topic = notificacion.topic || notificacion.type;
    if (topic === 'payment') {
      const paymentId = notificacion.data && notificacion.data.id ? notificacion.data.id : notificacion.id;

      // Consultar el estado del pago usando la API de Mercado Pago
      const paymentResponse = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
        }
      });
      console.log('Respuesta del pago:', paymentResponse.data);
      const payment = paymentResponse.data;

      // Extraer el número de operación (payment_id) y el estado
      const operationId = payment.id;
      const status = payment.status;
      const statusDetail = payment.status_detail;

      // Imprimir detalles del pago en la consola
      console.log(`Pago ID: ${operationId}, Estado: ${status}, Detalle del estado: ${statusDetail}`);

      // Devuelve el número de operación y el estado del pago
      return res.status(200).json({
        operation_id: operationId,
        status: status,
        status_detail: statusDetail
      });
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error: any) {
    console.error('Error al recibir la notificación:', error);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
      res.status(error.response.status).json({ detail: error.response.data });
    } else if (error.request) {
      console.error('No se recibió respuesta de Mercado Pago:', error.request);
      res.status(500).json({ detail: 'No se recibió respuesta del servidor de Mercado Pago.' });
    } else {
      console.error('Error message:', error.message);
      res.status(500).json({ detail: error.message });
    }
  }
});

// Rutas adicionales
app.use('/api', router);

app.get('/', (req, res) => {
  res.send('API is working!');
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});