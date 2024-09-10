// api/create-payment-intent.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ message: 'Method Not Allowed' });
  }

  try {
    const { amount, email, phone, name, address } = req.body;

    // Create a payment intent with the given amount
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
    res.status(500).send({
      error: error.message,
    });
  }
};
