const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const cors = require('cors');
const app = express();

// Use body-parser to parse incoming JSON
app.use(express.json());

// Use CORS middleware to allow cross-origin requests from your frontend
app.use(cors({
  origin: 'https://m-cochran.github.io', // Replace this with your frontend URL
  methods: 'POST, OPTIONS',
  allowedHeaders: 'Content-Type'
}));

// Endpoint to handle the creation of a PaymentIntent
app.post('/api/create-payment-intent', async (req, res) => {
  const { amount, email, cartItems } = req.body;

  // Validate request fields
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart items are required' });
  }

  try {
    // Create a PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects the amount in cents
      currency: 'usd',
      receipt_email: email, // optional, allows Stripe to send a receipt
      metadata: {
        email: email,
        cartItems: JSON.stringify(cartItems), // Store cart items as a string in metadata
      }
    });

    // Send the client secret to the frontend
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Handle the preflight request (OPTIONS method) for CORS
app.options('/api/create-payment-intent', (req, res) => {
  res.status(200).send();
});

// Export the Express app
module.exports = app;
