const express = require('express');
const cors = require('cors');
const stripe = require('stripe')('sk_test_51PulULDDaepf7cji2kqbdFVOzF37bS8RrtgO8dpVBpT1m8AXZhcyIBAAf42VOcpE8auFxbm1xSjglmBhvaIYaRck00QkUGMkpF'); // Your Stripe secret key
const app = express();
const endpointSecret = 'whsec_eHnMf6JWb1VK4Bmn9yO77d8nazu5yKvs'; // Your Stripe webhook secret

// Middleware for handling CORS and JSON
app.use(cors({
  origin: 'https://m-cochran.github.io', // Allow requests from your GitHub Pages site
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));

// Stripe expects raw body for webhooks, so we set express.raw here
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature']; // Stripe signature header

  let event;

  try {
    // Verify the webhook signature to ensure the request came from Stripe
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event based on its type
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object; // Stripe PaymentIntent object
      const charge = paymentIntent.charges.data[0]; // Retrieve the first charge in the PaymentIntent
      const receiptUrl = charge.receipt_url; // Get the receipt URL for the charge

      console.log(`Payment successful! Receipt URL: ${receiptUrl}`);
      // You can now do something with the receipt URL, like send it via email or display it on the thank you page.
      break;

    // Handle other Stripe event types as needed
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Respond to acknowledge receipt of the event
  res.json({ received: true });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
