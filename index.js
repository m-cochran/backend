const express = require('express');
const cors = require('cors');
const stripe = require('stripe')('sk_test_51PulULDDaepf7cji2kqbdFVOzF37bS8RrtgO8dpVBpT1m8AXZhcyIBAAf42VOcpE8auFxbm1xSjglmBhvaIYaRck00QkUGMkpF'); // Your Stripe secret key
const app = express();
const endpointSecret = 'whsec_xxxxxxx'; // Your webhook secret from Stripe

// Middleware for handling CORS and JSON
app.use(cors({
  origin: 'https://m-cochran.github.io', // Allow requests from your GitHub Pages site
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

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
      // You can now do something with the receipt URL, like send it via email or display it on the thank you page.
      break;

    // Handle other event types as needed
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
