const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(bodyParser.json());

// Helper function to format cart items as a string
const formatCartItems = (cartItems) => {
  if (!Array.isArray(cartItems)) {
    throw new Error('cartItems should be an array');
  }
  return cartItems.map(item => {
    if (!item.name || !item.quantity || !item.price) {
      throw new Error('Each cart item should have name, quantity, and price');
    }
    return `${item.name} (${item.quantity} x $${item.price})`;
  }).join(', ');
};

app.post('/api/create-payment-intent', async (req, res) => {
  const {
    amount,
    email,
    phone,
    name,
    address,
    shippingAddress,
    cartItems // Receive cartItems from the request
  } = req.body;

  try {
    // Format cart items into a string
    const cartItemsString = formatCartItems(cartItems);

    // Create a payment intent with metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      description: `Order Details: ${cartItemsString}`,
      metadata: {
        email: email,
        phone: phone,
        name: name,
        address: JSON.stringify(address),
        shippingAddress: JSON.stringify(shippingAddress),
        cartItems: JSON.stringify(cartItems) // Add cartItems to metadata
      }
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
