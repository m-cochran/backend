const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Use environment variable
const app = express();
const endpointSecret = process.env.WEBHOOK_SECRET; // Use environment variable

// Middleware for handling CORS and JSON (for non-webhook routes)
app.use(cors({
  origin: 'https://m-cochran.github.io', // Allow requests from your GitHub Pages site
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Body parsing middleware for non-webhook routes
app.use(express.json()); // Parse JSON for all routes by default

// Webhook endpoint to receive events from Stripe
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    // Verify the webhook signature to ensure the request came from Stripe
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event based on its type
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      const charge = paymentIntent.charges.data[0];
      const receiptUrl = charge.receipt_url;

      console.log(`Payment successful! Receipt URL: ${receiptUrl}`);
      // You can now do something with the receipt URL, like send it via email or display it on a thank you page.
      break;

    // Handle other event types as needed
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
});

// Example route to create a PaymentIntent
app.post('/api/create-payment-intent', async (req, res) => {
  const { amount, receipt_email } = req.body;

  // Check if amount is valid
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe works in cents, so multiply by 100
      currency: 'usd',
      receipt_email: receipt_email // Pass the receipt email from the request body
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server (useful for local development)
// In Vercel, the server is not directly started; instead, Vercel handles this.
if (process.env.NODE_ENV === 'development') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app;
