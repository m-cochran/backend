const express = require('express');
const axios = require('axios'); // Import axios for fetching the GitHub URL
const app = express();
const bodyParser = require('body-parser');

// Enable CORS for all requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Parse the request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Define the route for saving an order
app.post('/api/save-order', (req, res) => {
  try {
    const orderData = req.body;

    // Fetch the existing orders from the GitHub URL
    axios.get('https://raw.githubusercontent.com/m-cochran/Randomerr/main/orders.json')
      .then(response => {
        const orders = JSON.parse(response.data);

        // Add the new order to the orders array
        orders.push(orderData);

        // Update the GitHub URL with the new orders
        axios.put('https://api.github.com/repos/m-cochran/Randomerr/contents/orders.json', {
          message: 'Updated orders.json',
          content: Buffer.from(JSON.stringify(orders, null, 2)).toString('base64'),
          branch: 'main'
        })
        .then(() => {
          res.status(201).send({ message: 'Order saved successfully' });
        })
        .catch(error => {
          console.error('Error updating orders.json:', error);
          res.status(500).send({ message: 'Error saving order' });
        });
      })
      .catch(error => {
        console.error('Error fetching orders.json:', error);
        res.status(500).send({ message: 'Error fetching orders.json' });
      });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).send({ message: 'Error saving order' });
  }
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
