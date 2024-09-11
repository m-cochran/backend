const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

app.post('/api/create-invoice', async (req, res) => {
  const { customerId, cartItems } = req.body;

  try {
    // Create invoice items for each cart item
    for (const item of cartItems) {
      await stripe.invoiceItems.create({
        customer: customerId,
        amount: item.price * 100, // Amount in cents
        currency: 'usd',
        description: `${item.name} (${item.quantity} x $${item.price})`,
      });
    }

    // Create the invoice
    const invoice = await stripe.invoices.create({
      customer: customerId,
      auto_advance: true, // Automatically finalize the invoice
    });

    res.send({ invoiceId: invoice.id });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});
