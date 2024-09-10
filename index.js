require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Stripe Payment Backend');
});

// Payment Intent Route
app.post('/api/create-payment-intent', async (req, res) => {
  const { amount, email } = req.body;

  try {
    // Create a payment intent with the specified amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: 'usd',
      receipt_email: email,
      payment_method_types: ['card']
    });

    // Send back the client secret that the frontend will use to complete the payment
    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
