import { MercadoPagoConfig, Preference } from 'mercadopago';

class PaymentProcessor {
    private client: MercadoPagoConfig;
    private preference: Preference;

    constructor() {
        // Inicializa el SDK de Mercado Pago con el Access Token
        this.client = new MercadoPagoConfig({
            accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '', // Asegúrate de usar el token correcto
            options: { timeout: 5000 },  // Opciones adicionales
        });

        // Inicializa la preferencia
        this.preference = new Preference(this.client);
    }

    // Método para crear un pago con valores predeterminados y devolver el link del 'init_point'
    async createPayment(): Promise<{ init_point: string }> {
        // Valores predeterminados
        const items = [
            {
                title: 'Producto predeterminado',
                quantity: 1,
                unit_price: 100,  // Precio predeterminado
                currency_id: 'MXN',  // Moneda predeterminada
            }
        ];

        const payer = {
            email: 'example@example.com',
            name: 'Nombre Predeterminado',
            surname: 'Apellido Predeterminado',
            identification: {
                type: 'DNI',
                number: '12345678',
            }
        };

        // Crear la preferencia de pago con valores predeterminados
        const preferenceData = {
            items,
            payer,
            auto_return: 'approved',
            external_reference: 'reference_from_system', // Puedes poner una referencia que quieras
            metadata: {
                description: 'Pago por el producto predeterminado',
            },
        };

        try {
            // Crear la preferencia en Mercado Pago
            const preferenceResponse = await this.preference.create({ body: preferenceData });
            const preference = preferenceResponse.body;

            // Devolver el link del pago (init_point)
            return {
                init_point: preference.init_point,
            };
        } catch (error) {
            console.error('Error creating payment:', error);
            throw new Error('Error creating payment');
        }
    }
}

export default PaymentProcessor;
