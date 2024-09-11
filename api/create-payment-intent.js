const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Route to create payment intent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, email, name, address, shippingAddress, items } = req.body;

    // Create a PaymentIntent with the amount, currency, and receipt email
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      receipt_email: email,
      description: 'Order Receipt',
      metadata: { items: JSON.stringify(items) } // Save items in metadata
    });

    // Send the client secret to the frontend
    res.json({
      clientSecret: paymentIntent.client_secret,
      items, // Include items in the response
      receiptNumber: generateReceiptNumber(), // Generate a receipt number
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route to handle successful payment
app.post('/api/handle-success', async (req, res) => {
  try {
    const { paymentIntentId, items } = req.body;

    // Retrieve the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Process the payment and handle business logic here
    // For example, save order details to a database

    res.json({ success: true, items });
  } catch (error) {
    console.error('Error handling successful payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Function to generate a receipt number
function generateReceiptNumber() {
  return Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000);
}

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
