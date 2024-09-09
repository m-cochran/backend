const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import your route for creating payment intents
const createPaymentIntent = require('./create-payment-intent');

// Initialize express
const app = express();

// Middleware for handling JSON requests and CORS
app.use(bodyParser.json());
app.use(cors({
  origin: 'https://m-cochran.github.io', // Allow requests only from your GitHub Pages site
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Root route for testing if server is running
app.get('/', (req, res) => {
  res.send('Stripe payment backend is up and running!');
});

// Route for handling payment intent creation
app.post('/create-payment-intent', createPaymentIntent);

// Handle invalid routes
app.all('*', (req, res) => {
  res.status(404).send('Route Not Found');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
