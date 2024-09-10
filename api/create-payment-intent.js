import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Create a PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 1099, // Amount in the smallest currency unit (e.g., cents for USD)
        currency: 'usd', // Currency
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Respond with the client secret
      res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
