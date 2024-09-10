const express = require('express');
const stripe = require('stripe')('your-stripe-secret-key'); // Replace with your Stripe secret key
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, email } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd', // Adjust currency as needed
      receipt_email: email,
      payment_method_types: ['card'],
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
