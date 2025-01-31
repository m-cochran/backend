const express = require('express');
const axios = require('axios'); // Import Axios for fetching the GitHub URL
const cors = require('cors'); // Import CORS middleware
const bodyParser = require('body-parser');

const app = express();

// Enable CORS for all requests
app.use(cors({
  origin: 'https://m-cochran.github.io', // Allow requests from this origin
  methods: ['GET', 'POST', 'OPTIONS'], // Allow specific methods
}));

// Parse the request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Define the route for saving an order
app.post('/api/save-order', async (req, res) => {
  try {
    const orderData = req.body;

    // Fetch the existing orders from the GitHub URL
    const response = await axios.get('https://raw.githubusercontent.com/m-cochran/Randomerr/main/orders.json');
    const orders = JSON.parse(response.data);

    // Add the new order to the orders array
    orders.push(orderData);

    // Update the GitHub URL with the new orders
    await axios.put('https://api.github.com/repos/m-cochran/Randomerr/contents/orders.json', {
      message: 'Updated orders.json',
      content: Buffer.from(JSON.stringify(orders, null, 2)).toString('base64'),
      branch: 'main',
      sha: response.data.sha  // Attach sha for the file being updated
    }, {
      headers: { 
        'Authorization': `token YOUR_PERSONAL_ACCESS_TOKEN` // Include your GitHub token
      }
    });

    res.status(201).send({ message: 'Order saved successfully' });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send({ message: 'Error saving the order' });
  }
});

// Handle preflight requests (CORS OPTIONS requests)
app.options('/api/save-order', (req, res) => {
  res.sendStatus(204); // No Content
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
