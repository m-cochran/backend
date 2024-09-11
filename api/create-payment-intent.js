const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { amount, email, name, phone, address, shippingAddress } = req.body;

      // Create a PaymentIntent with shipping details
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card'],
        receipt_email: email,
        description: 'Example charge',
        shipping: {
          name: name,
          phone: phone,
          address: {
            line1: shippingAddress.line1,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postal_code: shippingAddress.postal_code,
            country: shippingAddress.country,
          },
        },
        // Optionally, you can add metadata or other fields
        metadata: { integration_check: 'accept_a_payment' },
      });

      // Respond with the client secret to confirm the payment
      res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
