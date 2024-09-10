const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();
const endpointSecret = process.env.WEBHOOK_SECRET;

// Middleware for handling CORS and JSON (for non-webhook routes)
app.use(cors({
  origin: 'https://m-cochran.github.io', // Allow requests from your GitHub Pages site
  methods: ['POST'], // Specify the allowed methods
  allowedHeaders: ['Content-Type'], // Specify allowed headers
  credentials: true // Allow credentials (if required)
}));

// Body parsing middleware for non-webhook routes
app.use(express.json()); // Parse JSON for all routes by default

// Webhook route for Stripe
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent was successful!`);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// Create PaymentIntent route
app.post('/api/create-payment-intent', async (req, res) => {
  const { amount, receipt_email } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe uses cents
      currency: 'usd',
      receipt_email
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
