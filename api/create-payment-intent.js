const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');  // For allowing all domains
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');  // Allow relevant methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');  // Allow specific headers

  if (req.method === 'OPTIONS') {
    // Handle preflight request
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { amount, email, name, phone, address } = req.body;

    try {
      // Create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        payment_method_types: ['card'],
        receipt_email: email,
        shipping: {
          name,
          phone,
          address,
        },
      });

      // Return client secret for the frontend to complete the payment
      res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      // Handle error and respond accordingly
      res.status(500).json({ error: error.message });
    }
  } else {
    // Handle unsupported methods
    res.status(405).json({ error: 'Method not allowed' });
  }
}
