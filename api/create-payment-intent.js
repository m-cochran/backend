const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(bodyParser.json());

app.post('/api/create-payment-intent', async (req, res) => {
  const {
    amount,
    cartItems, // Received from client-side
  } = req.body;

  // Format cart items for inclusion in the description
  const cartItemsString = cartItems.map(item => `${item.name} (${item.quantity} x $${item.price})`).join(", ");

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      description: `Order Details: ${cartItemsString}`, // Add cart items to description
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
