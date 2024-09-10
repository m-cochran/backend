// api/create-payment-intent.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ message: 'Method Not Allowed' });
  }

  const { amount, email, phone, name, address } = req.body;

  // Validate input
  if (!amount || !email || !name || !address) {
    return res.status(400).send({ error: 'Missing required fields' });
  }

  try {
    // Create a payment intent with the given amount and additional details
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // In smallest currency unit, e.g., 2000 for $20.00
      currency: 'usd',
      receipt_email: email,
      payment_method_data: {
        billing_details: {
          name: name,
          email: email,
          phone: phone,
          address: {
            line1: address.line1,
            city: address.city,
            state: address.state,
            postal_code: address.postal_code,
            country: address.country
          }
        }
      }
    });

    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).send({
      error: 'Internal Server Error',
    });
  }
};
