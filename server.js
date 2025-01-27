const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json());

// GitHub API URL and token
const GITHUB_API_URL = 'https://api.github.com/repos/m-cochran/Randomerr/contents/orders.json';
const GITHUB_TOKEN = process.env.GITHUB_PAT; // Read PAT from environment variable

// Endpoint to handle the order submission
app.post('/submit-order', async (req, res) => {
  const orderData = req.body;

  try {
    // Fetch the current content of orders.json from GitHub
    let currentOrders = [];
    const response = await fetch(GITHUB_API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      currentOrders = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8')); // Decoding base64 content
    }

    // Add the new order
    currentOrders.push(orderData);

    // Convert the updated orders to base64
    const updatedOrdersContent = Buffer.from(JSON.stringify(currentOrders)).toString('base64');

    // Commit the updated file back to GitHub
    const commitMessage = `Add order ${orderData.orderId}`;
    const commitResponse = await fetch(GITHUB_API_URL, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: commitMessage,
        content: updatedOrdersContent,
      }),
    });

    if (commitResponse.ok) {
      res.status(200).send({ message: 'Order successfully saved to GitHub' });
    } else {
      res.status(500).send({ message: 'Failed to save order to GitHub' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error processing order' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
