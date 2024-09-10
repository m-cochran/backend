const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());

app.use(cors({
  origin: 'https://m-cochran.github.io', // Your frontend origin
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

app.options('*', cors());

app.post('/api/create-payment-intent', async (req, res) => {
  const { amount, email, cartItems } = req.body;

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
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'usd',
      metadata: {
        email: email,
        cartItems: JSON.stringify(cartItems),
      },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
