import { MercadoPagoConfig, Preference } from 'mercadopago';

interface Item {
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    currency_id?: string;
}

interface Payer {
    email: string;
    name: string;
    surname: string;
    identification: {
        type: string;
        number: string;
    };
}

class PaymentProcessor {
    private client: MercadoPagoConfig;
    private preference: Preference;

    constructor() {
        // Inicializa el SDK de Mercado Pago con el Access Token usando MercadoPagoConfig
        this.client = new MercadoPagoConfig({
            accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '', // Asegúrate de usar el token correcto de producción o sandbox
            options: { timeout: 5000 },  // Opciones adicionales
        });

        // Inicializa la preferencia
        this.preference = new Preference(this.client);
    }

    // Método para crear un pago y devolver el link del 'init_point'
    async createPayment(items: Item[], payer: Payer, description: string | null = null): Promise<{ init_point: string }> {
        // Crear la preferencia de pago
        const base_url = process.env.BASE_URL as string;
        const preferenceData = {
            items,
            payer,
            back_urls: {
                success: `${base_url}/payments/success`,
                failure: `${base_url}/payments/failure`,
                pending: `${base_url}/payments/pending`,
            },
            auto_return: 'approved',
            external_reference: 'reference_from_system', // Puedes poner una referencia que quieras
            metadata: {
                description: description || 'Descripción del pago',
            },
        };

        try {
            // Crear la preferencia en Mercado Pago usando el nuevo SDK
            const preferenceResponse = await this.preference.create({ body: preferenceData });
            const preference = preferenceResponse as any; // Adjust the type if necessary

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
